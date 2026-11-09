const express = require('express');
const geoip = require('geoip-lite');

const router = express.Router();

const PT_COUNTRIES = ['PT', 'BR', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL'];
const ES_COUNTRIES = [
  'ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN',
  'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR', 'GQ',
];

const languageForCountry = (country) => {
  if (PT_COUNTRIES.includes(country)) return 'pt';
  if (ES_COUNTRIES.includes(country)) return 'es';
  return null;
};

// Offline lookup: the client IP is never sent to a third party or stored.
// Returns language: null when the IP is private/unknown so the client falls back to the browser language.
router.get('/', (req, res) => {
  const ip = (req.ip || '').replace(/^::ffff:/, '');
  const country = geoip.lookup(ip)?.country || null;
  res.set('Cache-Control', 'no-store');
  res.json({ country, language: languageForCountry(country) });
});

module.exports = router;
module.exports.languageForCountry = languageForCountry;
