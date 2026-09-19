const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

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

  if (!process.env.API_MARKET_KEY) {
    return res.status(500).json({
      success: false,
      message: "API key is not configured."
    });
  }

  try {
    // API request will be added here after
    // we confirm the exact API.market endpoint/response format.

    res.json({
      success: false,
      message: "API connection is not configured yet."
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to contact the API."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
