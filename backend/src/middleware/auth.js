const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      const err = new Error('Not authorized - no token provided'); err.statusCode = 401; throw err;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) { const err = new Error('Not authorized - user no longer exists'); err.statusCode = 401; throw err; }
    req.user = user;
    next();
  } catch (err) {
    if (!err.statusCode) err.statusCode = 401;
    next(err);
  }
}
module.exports = { protect };