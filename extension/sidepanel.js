let lastResult = "";
let lastTone = null;

// Character counter
const inputText = document.getElementById("inputText");
const charCount = document.getElementById("charCount");

inputText.addEventListener("input", () => {
  const len = inputText.value.length;
  charCount.textContent = `${len} / 5000`;
  charCount.classList.toggle("warn", len > 4500);
});

// Humanize button
document.getElementById("humanizeBtn").addEventListener("click", async () => {
  const text = inputText.value.trim();

  if (!text) {
    inputText.focus();
    return;
  }

  setLoading(true);
  hideError();
  hideResult();

  try {
    const response = await fetch("http://localhost:3000/humanize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (data.humanized) {
      lastResult = data.humanized;
      lastTone = data.tone;
      showResult(data.humanized, data.tone);
    } else {
      showError(data.error || "Humanization failed. Try again.");
    }
  } catch (err) {
    console.error("Error:", err);
    showError(
      "Cannot reach backend. Make sure server is running on port 3000.",
    );
  } finally {
    setLoading(false);
  }
});

// Copy button
document.getElementById("copyBtn").addEventListener("click", async () => {
  if (!lastResult) {
    showError("No converted text available to copy.");
    return;
  }

  try {
    await navigator.clipboard.writeText(lastResult);
    document.getElementById("copyBtn").textContent = "Copied!";
    setTimeout(() => {
      document.getElementById("copyBtn").textContent = "Copy";
    }, 1500);
  } catch (err) {
    showError("Copy failed. Please try again.");
  }
});

// Helpers
function setLoading(on) {
  const btn = document.getElementById("humanizeBtn");
  const spinner = document.getElementById("spinner");
  const label = document.getElementById("btnLabel");
  btn.disabled = on;
  spinner.style.display = on ? "block" : "none";
  label.textContent = on ? "Humanizing…" : "Humanize";
}

function showResult(text, tone) {
  document.getElementById("resultText").textContent = text;

  // Display tone info
  if (tone) {
    const toneInfo = document.getElementById("toneInfo");
    document.getElementById("toneLabel").textContent =
      tone.tone.charAt(0).toUpperCase() + tone.tone.slice(1);
    document.getElementById("toneConfidence").textContent = Math.round(
      tone.confidence * 100,
    );
    toneInfo.style.display = "block";
  }

  const resultCard = document.getElementById("resultCard");
  resultCard.classList.add("is-visible");
  document.getElementById("divider").style.display = "flex";
  resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideResult() {
  const resultCard = document.getElementById("resultCard");
  resultCard.classList.remove("is-visible");
  document.getElementById("divider").style.display = "none";
}

function showError(message) {
  const errorText = document.getElementById("errorText");
  if (errorText && message) {
    errorText.textContent = message;
  }
  document.getElementById("errorBanner").style.display = "flex";
}

function hideError() {
  document.getElementById("errorBanner").style.display = "none";
}
