const Groq = require("groq-sdk");
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Agent 1: Detect tone of input text
 * @param {string} text - The input text to analyze
 * @returns {Promise<Object>} - {tone, confidence, characteristics, reasoning}
 */
async function detectTone(text) {
  console.log("[Agent 1] Tone Detection started...");

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 512,
      messages: [
        {
          role: "system",
          content: `You are a writing tone analyzer. Analyze the given text and identify its tone.

Return a JSON object with:
{
  "tone": "one of: formal, casual, academic, technical, professional, conversational, neutral",
  "confidence": 0.0 to 1.0,
  "characteristics": ["list", "of", "tone", "indicators"],
  "reasoning": "brief explanation of why you identified this tone"
}

Focus on linguistic patterns like:
- Sentence structure (long vs short, complex vs simple)
- Vocabulary level (technical, colloquial, formal)
- Use of contractions, hedging phrases, colloquialisms
- Emotional tone and directness
- Formality level

Return ONLY the JSON object, no preamble.`,
        },
        {
          role: "user",
          content: `Analyze the tone of this text:\n\n${text}`,
        },
      ],
    });

    const content = response.choices[0].message.content.trim();
    console.log("[Agent 1] Raw response:", content);

    // Parse JSON response
    const toneData = JSON.parse(content);
    console.log(
      "[Agent 1] Tone detected:",
      toneData.tone,
      "confidence:",
      toneData.confidence,
    );

    return toneData;
  } catch (err) {
    console.error("[Agent 1] Error detecting tone:", err.message);
    // Fallback to neutral if detection fails
    return {
      tone: "neutral",
      confidence: 0.5,
      characteristics: ["unable to determine"],
      reasoning: "Fallback due to detection error",
    };
  }
}

module.exports = { detectTone };
