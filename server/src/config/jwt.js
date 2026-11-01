/**
 * Centralized JWT Secret Configuration
 * Ensures consistent signing and verification secrets across services and middleware,
 * enforcing explicit environment configuration and eliminating insecure fallback values.
 */

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'test') {
      return 'test_jwt_secret_must_be_at_least_32_chars_long';
    }
    throw new Error('FATAL: JWT_SECRET environment variable is missing.');
  }
  if (secret.length < 16 && process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET must be at least 16 characters in production.');
  }
  return secret;
}

module.exports = {
  getJwtSecret,
};

