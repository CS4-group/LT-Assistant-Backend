/**
 * Validation Utilities
 * Common validation functions for the application
 */

class Validators {
  /**
   * Validate email format
   * @param {String} email - Email to validate
   * @returns {Boolean} - Is valid email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate MongoDB ObjectId format
   * @param {String} id - ID to validate
   * @returns {Boolean} - Is valid ObjectId
   */
  static isValidObjectId(id) {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  }

  /**
   * Validate domain format
   * @param {String} domain - Domain to validate
   * @returns {Boolean} - Is valid domain
   */
  static isValidDomain(domain) {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    return domainRegex.test(domain);
  }

  /**
   * Validate phone number format
   * @param {String} phone - Phone to validate
   * @returns {Boolean} - Is valid phone
   */
  static isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate password strength
   * @param {String} password - Password to validate
   * @returns {Object} - Validation result with details
   */
  static validatePassword(password) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const isValid = password.length >= minLength && hasUppercase && hasLowercase && hasNumbers;
    
    return {
      isValid,
      errors: [
        ...(password.length < minLength ? [`Password must be at least ${minLength} characters long`] : []),
        ...(!hasUppercase ? ['Password must contain at least one uppercase letter'] : []),
        ...(!hasLowercase ? ['Password must contain at least one lowercase letter'] : []),
        ...(!hasNumbers ? ['Password must contain at least one number'] : [])
      ],
      strength: this.getPasswordStrength(password)
    };
  }

  /**
   * Get password strength score
   * @param {String} password - Password to evaluate
   * @returns {String} - Strength level
   */
  static getPasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score < 3) return 'weak';
    if (score < 5) return 'medium';
    return 'strong';
  }

  /**
   * Sanitize string input
   * @param {String} str - String to sanitize
   * @returns {String} - Sanitized string
   */
  static sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
  }

  /**
   * Validate required fields
   * @param {Object} data - Data object to validate
   * @param {Array} requiredFields - Array of required field names
   * @returns {Array} - Array of missing fields
   */
  static validateRequiredFields(data, requiredFields) {
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        missingFields.push(field);
      }
    }
    
    return missingFields;
  }
}

module.exports = Validators;
