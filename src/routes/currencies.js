const express = require('express');
const router = express.Router();
const { getExchangeRates } = require('../utils/exchangeRates');

// GET /api/currencies/rates
// Returns USD-base exchange rates for all supported currencies
router.get('/rates', async (req, res) => {
  try {
    const data = await getExchangeRates();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

module.exports = router;
