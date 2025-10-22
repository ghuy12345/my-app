"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: authData, error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  if (!authData.user) {
    redirect("/error");
  }

  revalidatePath("/", "layout");

  // For login, check if user has completed onboarding
  await checkOnboardingAndRedirect(authData.user.id);
}

/**
 * Check if user has completed onboarding and redirect accordingly
 * Used only during LOGIN (not signup)
 */
async function checkOnboardingAndRedirect(userId: string) {
  const supabase = await createClient()

  // Query the public.users table to check onboarded status
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('onboarded')
    .eq('id', userId)
    .single()

  // If user doesn't exist in public.users or query failed, send to onboarding
  if (userError || !userData) {
    console.error('User not found in public.users or error fetching:', userError)
    redirect('/onboarding')
  }

  // Redirect based on onboarding status
  if (userData.onboarded === true) {
    redirect('/dashboard')
  } else {
    redirect('/onboarding')
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const firstName = formData.get("first-name") as string;
  const lastName = formData.get("last-name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const data = {
    email: email,
    password: password,
    options: {
      data: {
        full_name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        email: email,
      },
    },
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    console.error("Signup error:", error);
    console.error("Full error details:", JSON.stringify(error, null, 2));
    // Temporarily show error on screen for debugging
    throw new Error(`Signup failed: ${error.message} | Code: ${error.code} | Status: ${error.status}`);
  }

  revalidatePath("/", "layout");

  // Redirect to check email page (user needs to confirm email before accessing onboarding)
  redirect('/auth/check-email');
}

export async function signout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error);
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.log(error);
    redirect("/error");
  }

  redirect(data.url);
}
