const EMAIL_STORAGE_KEY = 'production-report-email-recipient'

export function loadRecipientEmail(): string {
  return localStorage.getItem(EMAIL_STORAGE_KEY) ?? ''
}

export function saveRecipientEmail(email: string): void {
  localStorage.setItem(EMAIL_STORAGE_KEY, email)
}

export function isValidEmail(value: string): boolean {
  const email = value.trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
