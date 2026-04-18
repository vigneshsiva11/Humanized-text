const express = require("express");
const router = express.Router();
const { orchestrateHumanization } = require("../agent/prompt");

router.post("/", async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: "No text provided" });
  }

  if (text.length > 5000) {
    return res.status(400).json({ error: "Text too long (max 5000 chars)" });
  }

  try {
    console.log("[Route] Humanize request received, text length:", text.length);
    const result = await orchestrateHumanization(text);

    res.json({
      humanized: result.humanized,
      original: text,
      tone: result.tone,
    });
  } catch (err) {
    console.error("[Route] Error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Humanization failed",
      code: err.code || "HUMANIZATION_FAILED",
    });
  }
});

module.exports = router;
