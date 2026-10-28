/**
 * Client side checks that mirror the server rules, so people see problems
 * before they submit. The server validates again and has the final say.
 */
export type Errors = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME = /^[\p{L}\p{N} .'-]+$/u;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Enter your email";
  if (!EMAIL.test(email.trim()) || email.length > 254) return "Enter a valid email address";
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Use at least 8 characters";
  if (password.length > 128) return "Use at most 128 characters";
  if (!/[A-Za-z]/.test(password)) return "Include at least one letter";
  if (!/[0-9]/.test(password)) return "Include at least one number";
  return null;
}

export function validateDisplayName(name: string): string | null {
  const value = name.trim();
  if (value.length < 2) return "Use at least 2 characters";
  if (value.length > 32) return "Use at most 32 characters";
  if (!NAME.test(value)) return "Use letters, numbers and spaces";
  return null;
}

export function validateSignup(input: { email: string; password: string; displayName: string; ageConfirmed: boolean }): Errors {
  const errors: Errors = {};
  const email = validateEmail(input.email);
  const password = validatePassword(input.password);
  const displayName = validateDisplayName(input.displayName);
  if (email) errors.email = email;
  if (password) errors.password = password;
  if (displayName) errors.displayName = displayName;
  if (!input.ageConfirmed) errors.ageConfirmed = "You must be 18 or older to use SaathVerse";
  return errors;
}

export function validateContact(input: { name: string; email: string; message: string }): Errors {
  const errors: Errors = {};
  if (input.name.trim().length < 2) errors.name = "Tell us your name";
  const email = validateEmail(input.email);
  if (email) errors.email = email;
  const length = input.message.trim().length;
  if (length < 10) errors.message = "Write at least 10 characters";
  else if (length > 2000) errors.message = "Keep it under 2000 characters";
  return errors;
}

export function validateTableTitle(title: string): string | null {
  const value = title.trim();
  if (value.length < 3) return "Give your table a title of at least 3 characters";
  if (value.length > 60) return "Keep the title under 60 characters";
  return null;
}

/** Room codes use letters and digits without look alikes (no I, L, O, 0, 1). */
export function normaliseRoomCode(raw: string): string | null {
  const code = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return /^[A-HJKMNP-Z2-9]{6}$/.test(code) ? code : null;
}

export function validateAdminSignup(input: { email: string; password: string; displayName: string; inviteCode: string }): Errors {
  const errors: Errors = {};
  const email = validateEmail(input.email);
  const displayName = validateDisplayName(input.displayName);
  if (email) errors.email = email;
  if (displayName) errors.displayName = displayName;
  if (input.password.length < 10) errors.password = "Admin passwords need at least 10 characters";
  else if (validatePassword(input.password)) errors.password = validatePassword(input.password)!;
  if (!input.inviteCode.trim()) errors.inviteCode = "Enter the invite code";
  return errors;
}
