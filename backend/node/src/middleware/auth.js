import { verifyAccessToken } from '../utils/jwt.utils.js';
import { User } from '../models/User.model.js';
import { error } from '../utils/response.utils.js';

/**
 * Protect routes — require valid JWT access token.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'UNAUTHORIZED', 'Access token missing or malformed.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id);
    if (!user) return error(res, 'UNAUTHORIZED', 'User not found.', 401);

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'TOKEN_EXPIRED', 'Access token has expired.', 401);
    }
    return error(res, 'UNAUTHORIZED', 'Invalid access token.', 401);
  }
};

/**
 * Plan gate middleware — restrict features by subscription tier.
 * Usage: requirePlan('pro'), requirePlan('elite')
 */
const requirePlan = (...allowedPlans) => {
  return (req, res, next) => {
    if (!req.user) return error(res, 'UNAUTHORIZED', 'Not authenticated.', 401);
    if (!allowedPlans.includes(req.user.plan)) {
      return error(res, 'PLAN_GATE', `This feature requires one of: ${allowedPlans.join(', ')}.`, 403);
    }
    next();
  };
};

export { protect, requirePlan };
