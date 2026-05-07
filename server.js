const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const FormData = require("form-data");

const app = express();
app.use(cors()); // Allow all origins
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Ideogram Proxy läuft ✅" });
});

// Proxy endpoint for Ideogram image generation
app.post("/generate", async (req, res) => {
  const { prompt, apiKey, aspect_ratio, style_type, rendering_speed } = req.body;

  if (!prompt || !apiKey) {
    return res.status(400).json({ error: "prompt und apiKey sind erforderlich" });
  }

  try {
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("aspect_ratio", aspect_ratio || "ASPECT_4_3");
    formData.append("style_type", style_type || "REALISTIC");
    formData.append("magic_prompt", "ON");
    formData.append("rendering_speed", rendering_speed || "DEFAULT");

    const response = await fetch("https://api.ideogram.ai/v1/ideogram-v3/generate", {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Ideogram Proxy läuft auf Port ${PORT}`);
});
