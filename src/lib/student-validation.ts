export type RegistrationError =
  "name" | "email" | "password" | "confirmation" | "consent";

export type RegistrationDetails = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedPrivacy: boolean;
};

export function validateRegistration(
  details: RegistrationDetails,
): RegistrationError | null {
  const name = details.fullName.trim();
  if (name.length < 2 || name.length > 80) {
    return "name";
  }

  const email = details.email.trim();
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length < 6
  ) {
    return "email";
  }

  if (
    details.password.length < 10 ||
    details.password.length > 128 ||
    !/[a-zA-Z]/.test(details.password) ||
    !/[0-9]/.test(details.password) ||
    !/[^a-zA-Z0-9]/.test(details.password)
  ) {
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
  return (
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password.length > 0 &&
    password.length <= 128
  );
}
