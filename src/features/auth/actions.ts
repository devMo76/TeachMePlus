"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signUpSchema, signInSchema } from "./validations";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const raw = {
    full_name: formData.get("full_name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  // Validate with Zod
  const result = signUpSchema.safeParse(raw);
  if (!result.success) {
    return {
      error: result.error.issues[0].message,
    };
  }

  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        full_name: result.data.full_name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/student/dashboard");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // Validate with Zod
  const result = signInSchema.safeParse(raw);
  if (!result.success) {
    return {
      error: result.error.issues[0].message,
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/student/dashboard");
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
