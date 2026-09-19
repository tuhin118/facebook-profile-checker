require('dotenv').config();

const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.API_MARKET_KEY;
const API_HOST = process.env.API_MARKET_HOST || 'facebook-profile-checker.p.rapidapi.com';
const API_URL = process.env.API_MARKET_URL || `https://${API_HOST}/check`;

app.use(express.json());
app.use(express.static(__dirname));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'অনেক বেশি রিকোয়েস্ট, এক মিনিট পর চেষ্টা করুন।' }
});
app.use('/api/check-facebook', limiter);

function isValidInput(value) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return emailRegex.test(trimmed) || phoneRegex.test(trimmed);
}

app.post('/api/check-facebook', async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: 'API_MARKET_KEY সেট করা নেই।' });
  }

  const { query } = req.body;

  if (!isValidInput(query)) {
    return res.status(400).json({ error: 'সঠিক ইমেইল বা ফোন নম্বর দিন।' });
  }

  try {
    const response = await fetch(`${API_URL}?query=${encodeURIComponent(query.trim())}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'API থেকে ডাটা আনা যায়নি।' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'সার্ভারে সমস্যা হয়েছে।' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
