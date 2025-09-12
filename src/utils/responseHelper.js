/**
 * Response Helper Utilities
 * Standardized API response format
 */

class ResponseHelper {
  /**
   * Success response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {String} message - Success message
   * @param {Number} statusCode - HTTP status code
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Error response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   * @param {Number} statusCode - HTTP status code
   * @param {*} errors - Additional error details
   */
  static error(res, message = 'An error occurred', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Validation error response
   * @param {Object} res - Express response object
   * @param {Array} errors - Validation errors
   */
  static validationError(res, errors) {
    return this.error(res, 'Validation failed', 400, errors);
  }

  /**
   * Not found response
   * @param {Object} res - Express response object
   * @param {String} resource - Resource that was not found
   */
  static notFound(res, resource = 'Resource') {
    return this.error(res, `${resource} not found`, 404);
  }

  /**
   * Unauthorized response
   * @param {Object} res - Express response object
   * @param {String} message - Auth error message
   */
  static unauthorized(res, message = 'Unauthorized access') {
    return this.error(res, message, 401);
  }

  /**
   * Forbidden response
   * @param {Object} res - Express response object
   * @param {String} message - Forbidden message
   */
  static forbidden(res, message = 'Access forbidden') {
    return this.error(res, message, 403);
  }

  /**
   * Paginated response
   * @param {Object} res - Express response object
   * @param {Array} data - Response data
   * @param {Object} pagination - Pagination info
   * @param {String} message - Success message
   */
  static paginated(res, data, pagination, message = 'Data retrieved successfully') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ResponseHelper;
