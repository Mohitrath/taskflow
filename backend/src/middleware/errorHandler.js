function notFound(req, res, next) {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors;
  if (err.name === 'ValidationError') { statusCode=400; errors=Object.values(err.errors).map(e=>e.message); message='Validation failed'; }
  if (err.name === 'CastError') { statusCode=400; message=`Invalid ${err.path}: ${err.value}`; }
  if (err.code === 11000) { statusCode=409; const field=Object.keys(err.keyValue||{})[0]; message=field?`${field} already in use`:'Duplicate value'; }
  if (err.name === 'JsonWebTokenError') { statusCode=401; message='Invalid authentication token'; }
  if (err.name === 'TokenExpiredError') { statusCode=401; message='Authentication token expired'; }
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);
  res.status(statusCode).json({success:false,message,...(errors?{errors}:{})});
}
module.exports = { notFound, errorHandler };