import { describe, expect, it } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateFutureDate,
} from '@/shared/utils/validators';
import { VALIDATION_RULES } from '@/shared/utils/constants';

describe('validators', () => {
  it('validates email', () => {
    expect(validateEmail('')).toBe('Email is required');
    expect(validateEmail('bad@domain')).toBe('Invalid email format');
    expect(validateEmail('user@example.com')).toBeNull();
  });

  it('validates password length', () => {
    expect(validatePassword('')).toBe('Password is required');
    const short = 'a'.repeat(VALIDATION_RULES.PASSWORD_MIN_LENGTH - 1);
    expect(validatePassword(short)).toBe(
      `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`
    );
    const ok = 'a'.repeat(VALIDATION_RULES.PASSWORD_MIN_LENGTH);
    expect(validatePassword(ok)).toBeNull();
  });

  it('rejects past dates for validateFutureDate', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    expect(validateFutureDate(yesterday.toISOString().slice(0, 10))).toBe(
      'Date cannot be in the past'
    );
    expect(validateFutureDate(tomorrow.toISOString().slice(0, 10))).toBeNull();
  });
});
