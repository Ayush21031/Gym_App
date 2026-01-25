export function isValidEmail(email: string) {
  const trimmed = email.trim().toLowerCase();
  // simple, reliable enough for login validation
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(trimmed);
}
