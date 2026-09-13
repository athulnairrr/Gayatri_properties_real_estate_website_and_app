"use server";

import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase";

export interface LoginState {
  status: "idle" | "error";
  message?: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) {
    return { status: "error", message: "Please enter your email and password." };
  }

  const supabase = getServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { status: "error", message: "Invalid email or password." };
  }

  redirect(next || "/dashboard");
}

export async function logoutAction() {
  const supabase = getServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}
