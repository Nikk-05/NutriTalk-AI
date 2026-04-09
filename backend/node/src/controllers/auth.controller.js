import {User} from '../models/User.model.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils.js';
import { success, created, error, serverError } from '../utils/response.utils.js';

// ── POST /auth/signup ──────────────────────────────────────
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return error(res, 'EMAIL_ALREADY_EXISTS', 'The email address is already in use.', 409, 'email');

    const user = await User.create({ name, email, password });
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    user.refreshTokens.push(refreshToken);
    await user.save({ validateBeforeSave: false });
    res.cookie('refreshToken', refreshToken,{
      httpOnly:true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return created(res, { accessToken, user });
  } catch (err) { next(err); }
};

// ── POST /auth/login ───────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user || !(await user.comparePassword(password))) {
      return error(res, 'INVALID_CREDENTIALS', 'Invalid email or password.', 401);
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push(refreshToken);
    await user.save({ validateBeforeSave: false });
    res.cookie('refreshToken', refreshToken,{
      httpOnly:true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return success(res, { accessToken, user });
  } catch (err) { next(err); }
};

// ── POST /auth/logout ──────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken && req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: refreshToken }
      });
    }
    res.clearCookie('refreshToken');
    return success(res, { message: 'Logged out successfully.' });
  } catch (err) { next(err); }
};

// ── POST /auth/refresh ─────────────────────────────────────
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return error(res, 'MISSING_REFRESH_TOKEN', 'Refresh token required.', 401);

    let decoded;
    try { decoded = verifyRefreshToken(refreshToken); }
    catch { return error(res, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token.', 401); }

    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return error(res, 'INVALID_REFRESH_TOKEN', 'Refresh token not recognized.', 401);
    }

    // Rotate token
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', newRefreshToken,{
      httpOnly:true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return success(res, { accessToken: newAccessToken});
  } catch (err) { next(err); }
};

// ── GET /auth/me ───────────────────────────────────────────
const getMe = async (req, res) => {
  return success(res, { user: req.user });
};

// ── POST /auth/forgot-password ─────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    // Always return 200 to avoid email enumeration
    if (!user) return success(res, { message: 'If that email exists, a reset link has been sent.' });

    const token = require('crypto').randomBytes(32).toString('hex');
    user.passwordResetToken = token;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save({ validateBeforeSave: false });

    // TODO: send email via nodemailer
    console.log('[DEV] Password reset token:', token);

    return success(res, { message: 'If that email exists, a reset link has been sent.' });
  } catch (err) { next(err); }
};

// ── POST /auth/reset-password ──────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) return error(res, 'INVALID_RESET_TOKEN', 'Token is invalid or has expired.', 400);

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return success(res, { message: 'Password reset successful. Please log in.' });
  } catch (err) { next(err); }
};

export default { signup, login, logout, refresh, getMe, forgotPassword, resetPassword };
