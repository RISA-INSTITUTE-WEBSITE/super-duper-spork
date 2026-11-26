import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { isRisaAdministrator } from "./risa-admin-api";
import { getStudentIdentity } from "./student-auth-api";
import { studentCookieNames } from "./student-session";

export async function requireLearningSession() {
  const token = (await cookies()).get(studentCookieNames.access)?.value;
  if (!token) {
    redirect("/students/login");
  }
  const identity = await getStudentIdentity(token);
  if (!identity) {
    redirect("/students/login");
  }
  return { token, identity };
}

export async function requireAdminSession() {
  const session = await requireLearningSession();
  if (!(await isRisaAdministrator(session.token, session.identity.id))) {
    notFound();
  }
  return session;
}
