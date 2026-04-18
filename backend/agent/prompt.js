const Groq = require("groq-sdk");
const { detectTone } = require("./toneDetector");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Calculate similarity between two strings (simple normalized comparison)
 * Returns a score 0-1 where 1 = identical
 */
function calculateSimilarity(text1, text2) {
  const norm1 = text1.toLowerCase().replace(/\s+/g, " ").trim();
  const norm2 = text2.toLowerCase().replace(/\s+/g, " ").trim();

  if (norm1 === norm2) return 1.0;

  // Simple character overlap heuristic
  const minLen = Math.min(norm1.length, norm2.length);
  const maxLen = Math.max(norm1.length, norm2.length);
  let matches = 0;

  for (let i = 0; i < minLen; i++) {
    if (norm1[i] === norm2[i]) matches++;
  }

  return matches / maxLen;
}

/**
 * Agent 2: Humanize text while respecting detected tone
 * @param {string} text - The AI-generated text
 * @param {Object} detectedTone - Tone data from Agent 1
 * @param {boolean} forcedParaphrase - If true, use stronger paraphrase constraints
 * @returns {Promise<string>} - Humanized text
 */
async function humanizeWithTone(text, detectedTone, forcedParaphrase = false) {
  console.log("[Agent 2] Humanization started with tone:", detectedTone.tone);

  const toneDescriptions = {
    formal:
      "professional, structured, formal vocabulary, clear hierarchy of ideas",
    casual:
      "conversational, relaxed, use contractions, sounds like a smart friend",
    academic:
      "thoughtful, evidence-based, measured tone, well-structured arguments",
    technical: "precise, clear terminology, logical flow, direct communication",
    professional:
      "confident, clear, direct communication, business-appropriate language",
    conversational:
      "friendly, natural, like talking to someone, use casual language",
    neutral: "balanced, objective, neither too casual nor too formal",
  };

  const toneGuide =
    toneDescriptions[detectedTone.tone] ||
    "natural and authentic sounding while preserving the original tone";

  const paraphraseInstruction = forcedParaphrase
    ? `IMPORTANT: Your previous rewrite was too similar to the input. This time, you MUST significantly rephrase the text while preserving its meaning. Use completely different sentence structures, synonyms, and sentence length patterns than the input.`
    : "";

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are a writing editor who rewrites AI-generated text to sound authentically human, while preserving the original tone.

AI-generated text typically has: uniform sentence lengths, excessive hedging phrases like 
"it's worth noting", unnatural transitions, overuse of bullet points, passive voice, 
and a robotic tone.

Your rewrite must:
- Vary sentence length naturally (mix short punchy sentences with longer flowing ones)
- Use natural contractions (don't, it's, you'll, isn't, etc.)
- Maintain the ${detectedTone.tone} tone: ${toneGuide}
- Preserve the original meaning 100% exactly
- Remove all AI-ish filler phrases (e.g., "It is worth noting that", "Furthermore", "In conclusion")
- Occasionally start sentences with "And", "But", "So" — humans naturally do this
- Keep any technical terms, names, numbers, or code exactly as-is
- Ensure your rewrite is distinctly different from the input in structure and phrasing

${paraphraseInstruction}

Return ONLY the rewritten text. No preamble, no explanation, no meta-commentary.`,
        },
        {
          role: "user",
          content: `Rewrite this text while keeping its ${detectedTone.tone} tone:\n\n${text}`,
        },
      ],
    });

    const humanized = response.choices[0].message.content.trim();
    console.log("[Agent 2] Humanization complete");
    return humanized;
  } catch (err) {
    console.error("[Agent 2] Error humanizing text:", err.message);
    throw err;
  }
}

/**
 * Orchestrator: Run Agent 1 (tone detect) → Agent 2 (humanize with tone)
 * Includes anti-echo retry logic
 * @param {string} text - The input text
 * @returns {Promise<Object>} - {humanized, tone: {...}}
 */
async function orchestrateHumanization(text) {
  console.log("[Orchestrator] Starting two-agent pipeline...");

  // Step 1: Agent 1 detects tone
  const detectedTone = await detectTone(text);

  // Step 2: Agent 2 humanizes with tone
  let humanized = await humanizeWithTone(text, detectedTone, false);

  // Step 3: Check for echo (similarity guard)
  const similarity = calculateSimilarity(text, humanized);
  console.log(
    "[Orchestrator] Similarity check:",
    similarity.toFixed(2),
    "threshold: 0.85",
  );

  if (similarity > 0.85) {
    console.log(
      "[Orchestrator] Output too similar to input, triggering retry...",
    );
    humanized = await humanizeWithTone(text, detectedTone, true);
    console.log("[Orchestrator] Retry complete");
  }

  console.log("[Orchestrator] Pipeline complete");
  return {
    humanized,
    tone: detectedTone,
  };
}

/**
 * Original humanizeText function (kept for backward compatibility)
 * @deprecated Use orchestrateHumanization instead
 */
async function humanizeText(text, style = "casual") {
  const styleGuides = {
    casual: "conversational, relaxed, like texting a smart friend",
    professional: "clear and direct, like a confident senior employee",
    academic: "thoughtful but not stiff, like a well-read grad student",
  };

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content: `You are a writing editor who rewrites AI-generated text to sound authentically human.

AI-generated text typically has: uniform sentence lengths, excessive hedging phrases like 
"it's worth noting", unnatural transitions, overuse of bullet points, passive voice, 
and a robotic formal tone.

Your rewrite must:
- Vary sentence length naturally (mix short punchy sentences with longer flowing ones)
- Use natural contractions (don't, it's, you'll)
- Sound like the style: ${styleGuides[style]}
- Preserve the original meaning 100%
- Remove all AI-ish filler phrases
- Occasionally start sentences with "And", "But", "So" — humans do this
- Keep any technical terms, names, or code exactly as-is

Return ONLY the rewritten text. No preamble, no explanation.`,
      },
      {
        role: "user",
        content: `Rewrite this text:\n\n${text}`,
      },
    ],
  });

  return response.choices[0].message.content;
}

module.exports = {
  humanizeText,
  humanizeWithTone,
  orchestrateHumanization,
  detectTone,
};
