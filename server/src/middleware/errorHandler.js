export default function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  const code = err.code || 'SERVER_ERROR';
  res.status(status).json({ success: false, message: err.message || 'Internal Server Error', code });
}
