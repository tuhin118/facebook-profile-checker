const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const API_URL =
  "https://prod.api.market/api/v1/osint-trace-1/facebook-checker/check/facebook";

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "Facebook Profile Checker"
  });
});

// Safe response-structure logger
function getSafeStructure(value, depth = 0) {
  if (depth > 4) {
    return "[nested object]";
  }

  if (Array.isArray(value)) {
    return {
      type: "array",
      length: value.length,
      firstItem:
        value.length > 0
          ? getSafeStructure(value[0], depth + 1)
          : null
    };
  }

  if (value !== null && typeof value === "object") {
    const result = {};

    for (const key of Object.keys(value)) {
      result[key] = getSafeStructure(
        value[key],
        depth + 1
      );
    }

    return result;
  }

  if (typeof value === "string") {
    return {
      type: "string",
      length: value.length
    };
  }

  if (typeof value === "number") {
    return {
      type: "number"
    };
  }

  if (typeof value === "boolean") {
    return {
      type: "boolean"
    };
  }

  if (value === null) {
    return null;
  }

  return {
    type: typeof value
  };
}

// Facebook checker API
app.post("/api/check-facebook", async (req, res) => {
  const { input } = req.body;

  // Validate input
  if (
    !input ||
    typeof input !== "string" ||
    !input.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Email or phone number is required."
    });
  }

  const apiKey = process.env.API_MARKET_KEY;

  // Check API key
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
        accept: "application/json",
        "x-api-market-key": apiKey,
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        input: input.trim()
      })
    });

    // Try to parse JSON safely
    let data;

    try {
      data = await apiResponse.json();
    } catch {
      data = {};
    }

    // Safe debug information
    console.log(
      "API STATUS:",
      apiResponse.status
    );

    console.log(
      "API RESPONSE STRUCTURE:",
      JSON.stringify(
        getSafeStructure(data),
        null,
        2
      )
    );

    // API error
    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({
        success: false,
        message: "API request failed."
      });
    }

    /*
     * Current API response observed from Render:
     *
     * {
     *   live: boolean,
     *   note: string
     * }
     *
     * Do not assume profile metadata exists
     * unless the API actually returns it.
     */

    const profile = {
      live:
        typeof data.live === "boolean"
          ? data.live
          : null,

      name: null,

      id: null,

      avatar: null,

      hasCustomAvatar: null,

      profileLink: null,

      linkedAccounts: [],

      profileNote:
        typeof data.note === "string"
          ? data.note
          : ""
    };

    return res.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error(
      "API Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to contact the verification service."
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log("Server started successfully");
  console.log("PORT VALUE:", PORT);
});
