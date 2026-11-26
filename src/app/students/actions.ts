"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  getStudentIdentity,
  isStudentAuthConfigured,
  registerStudentWithAuth,
  revokeStudentSession,
  signInStudentWithAuth,
  updateStudentAuthMetadata,
} from "@/lib/student-auth-api";
import { uploadStudentAvatar } from "@/lib/student-learning-api";
import { studentCsrfCookieName, verifyStudentCsrfToken } from "@/lib/student-csrf";
import { isRisaAdministrator } from "@/lib/risa-admin-api";
import {
  clearStudentSession,
  saveStudentSession,
  studentCookieNames,
} from "@/lib/student-session";
import { validateLogin, validateRegistration } from "@/lib/student-validation";

async function requireValidAccountForm(formData: FormData, path: string): Promise<void> {
  if (!isStudentAuthConfigured()) {
    redirect(path + "?error=setup");
  }
  const cookie = (await cookies()).get(studentCsrfCookieName)?.value;
  if (!verifyStudentCsrfToken(cookie, formData.get("csrf_token"))) {
    redirect(path + "?error=csrf");
  }
}

export async function registerStudent(formData: FormData): Promise<void> {
  await requireValidAccountForm(formData, "/students/register");

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
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
  if (problem) {
    redirect("/students/register?error=" + problem);
  }

  const registration = await registerStudentWithAuth(fullName, email, password);
  if (registration.status === "failed") {
    redirect("/students/register?error=service");
  }

  if (registration.status === "confirmation_required") {
    redirect("/students/register?status=check-email");
  }

  // Only persist a session after Supabase confirms the account identity.
  const identity = await getStudentIdentity(registration.session.access_token);
  if (!identity) {
    redirect("/students/register?error=service");
  }

  await saveStudentSession(registration.session);
  redirect("/students/dashboard");
}

export async function signInStudent(formData: FormData): Promise<void> {
  await requireValidAccountForm(formData, "/students/login");

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!validateLogin(email, password)) {
    redirect("/students/login?error=credentials");
  }

  const session = await signInStudentWithAuth(email, password);
  if (!session) {
    redirect("/students/login?error=credentials");
  }

  const identity = await getStudentIdentity(session.access_token);
  if (!identity) {
    redirect("/students/login?error=verify");
  }

  await saveStudentSession(session);
  if (await isRisaAdministrator(session.access_token, identity.id)) {
    redirect("/admin");
  }
  redirect("/students/dashboard");
}

export async function signOutStudent(): Promise<void> {
  const jar = await cookies();
  const accessToken = jar.get(studentCookieNames.access)?.value;

  if (accessToken) {
    await revokeStudentSession(accessToken);
  }
  await clearStudentSession();
  redirect("/students/login?status=signed-out");
}

function isValidStudentName(name: string): boolean {
  return name.length >= 2 && name.length <= 80 && !/[\u0000-\u001f\u007f]/.test(name);
}

function isPhotoSignatureValid(bytes: Uint8Array, mime: string): boolean {
  switch (mime) {
    case "image/jpeg":
      return [0xff, 0xd8, 0xff].every((byte, index) => bytes[index] === byte);
    case "image/png":
      return [137, 80, 78, 71, 13, 10, 26, 10].every(
        (byte, index) => bytes[index] === byte,
      );
    case "image/webp":
      return (
        String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
        String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
      );
    default:
      return false;
  }
}

async function getProfileEditor() {
  if (!isStudentAuthConfigured()) {
    redirect("/students/login");
  }
  const jar = await cookies();
  const token = jar.get(studentCookieNames.access)?.value;
  if (!token) {
    redirect("/students/login");
  }
  const student = await getStudentIdentity(token);
  if (!student) {
    redirect("/students/login");
  }
  return { token, student };
}

async function processProfilePhoto(
  entry: FormDataEntryValue | null,
  token: string,
  studentId: string,
): Promise<{ path?: string; error?: "photo" | "service" }> {
  if (!(entry instanceof File) || entry.size === 0) {
    return {};
  }
  if (
    entry.size > 2 * 1024 * 1024 ||
    !["image/jpeg", "image/png", "image/webp"].includes(entry.type)
  ) {
    return { error: "photo" };
  }
  const bytes = new Uint8Array(await entry.slice(0, 12).arrayBuffer());
  if (!isPhotoSignatureValid(bytes, entry.type)) {
    return { error: "photo" };
  }
  const path = await uploadStudentAvatar(token, studentId, entry);
  return path ? { path } : { error: "service" };
}

/** Profile edits are limited to the currently authenticated learner. */
export async function updateStudentProfile(formData: FormData): Promise<void> {
  const { token, student } = await getProfileEditor();
  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!isValidStudentName(fullName)) {
    redirect("/students/profile?error=name");
  }

  const photo = await processProfilePhoto(formData.get("avatar"), token, student.id);
  if (photo.error) {
    redirect("/students/profile?error=" + photo.error);
  }

  const updated = await updateStudentAuthMetadata(token, fullName, photo.path);
  if (!updated) {
    redirect("/students/profile?error=service");
  }
  redirect("/students/profile?status=saved");
}
