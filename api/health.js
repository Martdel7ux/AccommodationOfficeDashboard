const { cors } = require('./_cors');

module.exports = (req, res) => {
  if (cors(req, res)) return;
  res.json({ status: 'ok', time: new Date().toISOString() });
};
