export function successResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(res, message = 'Something went wrong', statusCode = 500, error = null) {
  const response = {
    success: false,
    message,
  };
  if (error && process.env.NODE_ENV !== 'production') {
    response.error = typeof error === 'string' ? error : error?.message || JSON.stringify(error);
  }
  return res.status(statusCode).json(response);
}

export function validationError(res, errors, message = 'Validation failed') {
  return res.status(422).json({
    success: false,
    message,
    errors,
  });
}

export function notFoundResponse(res, message = 'Resource not found') {
  return res.status(404).json({
    success: false,
    message,
  });
}
