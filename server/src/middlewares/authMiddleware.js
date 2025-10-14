import jwt from 'jsonwebtoken';
import { loadConfig } from '../config/environment.js';

const config = loadConfig();

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const [, token] = header.split(' ');
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (roles = []) => (req, res, next) => {
  if (!roles.length) {
    return next();
  }
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
};

export default { authenticate, authorize };
