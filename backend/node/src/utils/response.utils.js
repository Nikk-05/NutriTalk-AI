/**
 * Standard API response helpers.
 * All responses use { data } for success and { error } for failure.
 */

const success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({ status: 'success', data });
};

const created = (res, data) => {
  return res.status(201).json({ status: 'success', data });
};

const error = (res, code, message, statusCode = 400, field = null) => {
  const payload = { status: 'error', error: { code, message } };
  if (field) payload.error.field = field;
  return res.status(statusCode).json(payload);
};

const notFound = (res, message = 'Resource not found.') => {
  return error(res, 'NOT_FOUND', message, 404);
};

const forbidden = (res, message = 'Upgrade your plan to access this feature.') => {
  return error(res, 'PLAN_GATE', message, 403);
};

const serverError = (res, message = 'An internal server error occurred.') => {
  return error(res, 'SERVER_ERROR', message, 500);
};

export { success, created, error, notFound, forbidden, serverError };
