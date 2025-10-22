'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from 'utils/supabase/server'

/**
 * Check if user has completed onboarding and redirect accordingly
 */
async function checkOnboardingAndRedirect(userId: string) {
  const supabase = await createClient()

  // Query the public.users table to check onboarded status
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('onboarded')
    .eq('id', userId)
    .single()

  if (userError) {
    console.error('Error fetching user onboarding status:', userError)
    // Default to onboarding if we can't determine status
    redirect('/onboarding')
  }

  // Redirect based on onboarding status
  if (userData?.onboarded === true) {
    redirect('/dashboard')
  } else {
    redirect('/onboarding')
  }
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  if (!authData.user) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')

  // Check onboarding status and redirect accordingly
  await checkOnboardingAndRedirect(authData.user.id)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  if (!authData.user) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')

  // Check onboarding status and redirect accordingly
  await checkOnboardingAndRedirect(authData.user.id)
}