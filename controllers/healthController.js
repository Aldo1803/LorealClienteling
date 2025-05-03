const { getUptime } = require('../utils/uptime');

exports.getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: `${getUptime()}ms`
  });
}; 