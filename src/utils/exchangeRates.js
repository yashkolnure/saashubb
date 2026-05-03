const https = require('https');

let cachedRates = null;
let lastFetchedAt = 0;
const CACHE_MS = 60 * 60 * 1000; // 1 hour

// Hardcoded fallback rates (USD base, updated periodically)
const FALLBACK_RATES = {
  base: 'USD',
  rates: {
    USD: 1,
    EUR: 0.93,
    GBP: 0.79,
    INR: 83.5,
    AED: 3.67,
    SGD: 1.35,
    AUD: 1.53,
    CAD: 1.36,
    JPY: 149.5,
    MYR: 4.72,
    BRL: 4.97,
    ZAR: 18.63,
    CHF: 0.90,
    SEK: 10.52,
    NOK: 10.56,
    DKK: 6.93,
  },
};

function fetchRates() {
  return new Promise((resolve, reject) => {
    const url = 'https://open.er-api.com/v6/latest/USD';
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.result === 'success' && json.rates) {
            resolve({ base: 'USD', rates: json.rates });
          } else {
            reject(new Error('Bad response from exchange rate API'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getExchangeRates() {
  const now = Date.now();
  if (cachedRates && (now - lastFetchedAt) < CACHE_MS) {
    return cachedRates;
  }
  try {
    const rates = await fetchRates();
    cachedRates = rates;
    lastFetchedAt = now;
    return rates;
  } catch {
    // Return stale cache or hardcoded fallback
    return cachedRates || FALLBACK_RATES;
  }
}

// Convert amount from one currency to another using USD as pivot
async function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amount;
  const { rates } = await getExchangeRates();
  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];
  if (!fromRate || !toRate) return null;
  return (amount / fromRate) * toRate;
}

module.exports = { getExchangeRates, convertCurrency };
