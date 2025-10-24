"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "utils/supabase/server";

// Type for the action state
type ActionState = {
  ok: boolean
  message?: string
}

export async function login(prevState: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate inputs
  if (!email || !password) {
    return {
      ok: false,
      message: "Email and password are required.",
    };
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !authData.user) {
    console.error("Login error:", error);
    return {
      ok: false,
      message: "Incorrect email or password.",
    };
  }

  revalidatePath("/", "layout");

  // For login, check if user has completed onboarding and redirect
  // This will throw a redirect, so it never returns
  await checkOnboardingAndRedirect(authData.user.id);

  // TypeScript doesn't know checkOnboardingAndRedirect always redirects
  // This return will never be reached but satisfies TypeScript
  return { ok: true };
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

  // Validate inputs
  const firstName = formData.get("first-name") as string;
  const lastName = formData.get("last-name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!firstName || !lastName || !email || !password) {
    throw new Error("All fields are required.");
  }

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

  const { data: signUpData, error } = await supabase.auth.signUp(data);

  if (error) {
    console.error("Signup error:", error);

    // Supabase returns "User already registered" when email confirmation is disabled
    // See: https://supabase.com/docs/reference/javascript/auth-signup
    if (error.message === "User already registered") {
      throw new Error("This email is already registered. Please try logging in instead.");
    }

    if (error.message.toLowerCase().includes("password")) {
      throw new Error(`Password error: ${error.message}`);
    }

    if (error.message.toLowerCase().includes("email")) {
      throw new Error(`Email error: ${error.message}`);
    }

    throw new Error(`Signup failed: ${error.message}`);
  }

  // Note: When email confirmation is enabled, Supabase may return a fake user object
  // for existing users (security feature to prevent user enumeration)
  // In this case, we still redirect to check-email page

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
