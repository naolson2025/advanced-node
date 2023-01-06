const { clearHash } = require('../services/cache');

// This middleware will run after the request has been processed
// that's why we call await next() before clearing the cache
module.exports = async (req, res, next) => {
  await next();

  clearHash(req.user.id);
}