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
import {
  clearStudentSession,
  saveStudentSession,
  studentCookieNames,
} from "@/lib/student-session";
import { validateLogin, validateRegistration } from "@/lib/student-validation";

export async function registerStudent(formData: FormData): Promise<void> {
  if (!isStudentAuthConfigured()) {
    redirect("/students/register?error=setup");
  }

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
  if (!isStudentAuthConfigured()) {
    redirect("/students/login?error=setup");
  }

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

/** Profile edits are limited to the currently authenticated learner. */
export async function updateStudentProfile(formData: FormData): Promise<void> {
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

  const fullName = String(formData.get("fullName") ?? "").trim();
  if (
    fullName.length < 2 ||
    fullName.length > 80 ||
    /[\u0000-\u001f\u007f]/.test(fullName)
  ) {
    redirect("/students/profile?error=name");
  }

  const photo = formData.get("avatar");
  let avatarPath: string | undefined;

  if (photo instanceof File && photo.size > 0) {
    if (
      photo.size > 2 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(photo.type)
    ) {
      redirect("/students/profile?error=photo");
    }

    const bytes = new Uint8Array(await photo.slice(0, 12).arrayBuffer());
    const validJpeg =
      photo.type === "image/jpeg" &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff;
    const validPng =
      photo.type === "image/png" &&
      [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
    const validWebp =
      photo.type === "image/webp" &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
    if (!validJpeg && !validPng && !validWebp) {
      redirect("/students/profile?error=photo");
    }

    avatarPath = (await uploadStudentAvatar(token, student.id, photo)) ?? undefined;
    if (!avatarPath) {
      redirect("/students/profile?error=service");
    }
  }

  const updated = await updateStudentAuthMetadata(token, fullName, avatarPath);
  if (!updated) {
    redirect("/students/profile?error=service");
  }

  redirect("/students/profile?status=saved");
}
