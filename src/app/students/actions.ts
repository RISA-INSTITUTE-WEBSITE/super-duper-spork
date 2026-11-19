"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  getStudentIdentity,
  isStudentAuthConfigured,
  registerStudentWithAuth,
  revokeStudentSession,
  signInStudentWithAuth,
} from "@/lib/student-auth-api";
import {
  clearStudentSession,
  saveStudentSession,
  studentCookieNames,
} from "@/lib/student-session";
import { validateLogin, validateRegistration } from "@/lib/student-validation";

export async function registerStudent(formData: FormData): Promise<void> {
  if (!isStudentAuthConfigured()) redirect("/students/register?error=setup");

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const acceptedPrivacy = formData.get("acceptedPrivacy") === "on";

  const problem = validateRegistration({
    fullName,
    email,
    password,
    confirmPassword,
    acceptedPrivacy,
  });
  if (problem) redirect("/students/register?error=" + problem);

  const accepted = await registerStudentWithAuth(fullName, email, password);
  if (!accepted) redirect("/students/register?error=service");

  // Always use the same confirmation response; do not disclose whether an
  // address is already associated with an existing student account.
  redirect("/students/register?status=check-email");
}

export async function signInStudent(formData: FormData): Promise<void> {
  if (!isStudentAuthConfigured()) redirect("/students/login?error=setup");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!validateLogin(email, password)) {
    redirect("/students/login?error=credentials");
  }

  const session = await signInStudentWithAuth(email, password);
  if (!session) redirect("/students/login?error=credentials");

  const identity = await getStudentIdentity(session.access_token);
  if (!identity) redirect("/students/login?error=verify");

  await saveStudentSession(session);
  redirect("/students/dashboard");
}

export async function signOutStudent(): Promise<void> {
  const jar = await cookies();
  const accessToken = jar.get(studentCookieNames.access)?.value;

  if (accessToken) await revokeStudentSession(accessToken);
  await clearStudentSession();
  redirect("/students/login?status=signed-out");
}
