const jwt = require('jsonwebtoken');
const generateToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
module.exports = { generateToken, verifyToken };
