const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const API_URL =
  "https://prod.api.market/api/v1/osint-trace-1/facebook-checker/check/facebook";

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "Facebook Profile Checker"
  });
});

app.post("/api/check-facebook", async (req, res) => {
  const { input } = req.body;

  if (!input || !input.trim()) {
    return res.status(400).json({
      success: false,
      message: "Email or phone number is required."
    });
  }

  const apiKey = process.env.API_MARKET_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: "API key is not configured."
    });
  }

  try {
    const apiResponse = await fetch(API_URL, {
      method: "POST",

      headers: {
        "accept": "application/json",
        "x-api-market-key": apiKey,
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        input: input.trim()
      })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({
        success: false,
        message: "API request failed.",
        details: data
      });
    }

    const root = data.root || {};
    const metadata = root.metadata || {};

    return res.json({
      success: true,

      profile: {
        live: root.live ?? null,
        name: metadata.name || null,
        id: metadata.user_id || null,
        avatar: metadata.avatar_url || null,
        customAvatar: metadata.has_custom_avatar ?? null,
        profileUrl: metadata.profile_url || null,
        linkedAccounts: metadata.linked_accounts || []
      },

      note: root.note || ""
    });

  } catch (error) {
    console.error("API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to contact the verification service."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
