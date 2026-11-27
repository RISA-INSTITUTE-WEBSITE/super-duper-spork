"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/risa-staff-session";
import { savePolicy, validatePolicy } from "@/lib/risa-policies";

export async function savePolicyAction(formData: FormData) {
  const { token } = await requireAdminSession();
  const policy = validatePolicy(formData);
  if (!policy) {
    redirect("/admin/policies?result=invalid");
  }
  const editing = formData.get("mode") === "edit";
  const saved = await savePolicy(token, policy, editing);
  if (!saved) {
    const edit = editing ? "&edit=" + policy.slug : "";
    redirect("/admin/policies?result=failed" + edit);
  }
  revalidatePath("/policies");
  revalidatePath("/policies/" + policy.slug);
  revalidatePath("/admin/policies");
  redirect("/admin/policies?result=saved");
}
