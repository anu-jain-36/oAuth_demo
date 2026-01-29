// utils/hashEmail.js
import crypto from 'crypto';

export function hashEmail(email) {
  return crypto
    .createHash('sha256')
    .update(email.toLowerCase().trim())
    .digest('hex');
}

export default hashEmail;