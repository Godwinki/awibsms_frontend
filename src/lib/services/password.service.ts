export class PasswordPolicy {
  static readonly MINIMUM_LENGTH = 8;
  static readonly MAXIMUM_LENGTH = 128;
  static readonly EXPIRATION_DAYS = 90; // 3 months
  static readonly HISTORY_SIZE = 5;

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.MINIMUM_LENGTH) {
      errors.push(`Password must be at least ${this.MINIMUM_LENGTH} characters long`);
    }

    if (password.length > this.MAXIMUM_LENGTH) {
      errors.push(`Password must be less than ${this.MAXIMUM_LENGTH} characters long`);
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 