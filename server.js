
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.AGNES_API_KEY;
const BASE_URL = "https://apihub.agnes-ai.com";

app.use(express.json({ limit: "30mb" }));
app.use(express.static(process.cwd(), { dotfiles: "ignore" }));

// Create video
app.post("/api/video", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: "AGNES_API_KEY is missing in Railway Variables" });
    }

    const { prompt, image, seconds = "5", aspect_ratio = "16:9" } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Please enter a prompt" });
    }

    const body = {
      model: "agnes-video-2.5-flash",
      prompt,
      mode: image ? "img2video" : "text",
      seconds: String(seconds),
      size: "720P",
      aspect_ratio
    };

    if (image) {
      body.first_frame = image;
    }

    const response = await fetch(`${BASE_URL}/v1/videos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check video result
app.get("/api/video/:id", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: "AGNES_API_KEY is missing" });
    }

    const model = "agnes-video-2.5-flash";
    const url = `${BASE_URL}/agnesapi?video_id=${encodeURIComponent(req.params.id)}&model_name=${model}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    });

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Motion AI server running on port ${PORT}`);
});

