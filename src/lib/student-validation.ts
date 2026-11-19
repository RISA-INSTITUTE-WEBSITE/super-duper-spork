export type RegistrationError =
  "name" | "email" | "password" | "confirmation" | "consent";

export type RegistrationDetails = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedPrivacy: boolean;
};

function hasValidEmail(email: string): boolean {
  return (
    email.length >= 6 && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function hasStrongPassword(password: string): boolean {
  return (
    password.length >= 10 &&
    password.length <= 128 &&
    /[a-zA-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^a-zA-Z0-9]/.test(password)
  );
}

export function validateRegistration(
  details: RegistrationDetails,
): RegistrationError | null {
  const name = details.fullName.trim();
  if (name.length < 2 || name.length > 80) {
    return "name";
  }
  if (!hasValidEmail(details.email.trim())) {
    return "email";
  }
  if (!hasStrongPassword(details.password)) {
    return "password";
  }
  if (details.password !== details.confirmPassword) {
    return "confirmation";
  }
  if (!details.acceptedPrivacy) {
    return "consent";
  }

  return null;
}

export function validateLogin(email: string, password: string): boolean {
  return hasValidEmail(email) && password.length > 0 && password.length <= 128;
}
