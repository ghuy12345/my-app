"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "utils/supabase/server"

// Type for the action state
type ActionState = {
  ok: boolean
  message?: string
}

/**
 * Server action to create a new company
 * Called from NewCompanyForm component
 */
export async function createCompany(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()

  // Get the current logged-in user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      ok: false,
      message: "You must be logged in to create a company",
    }
  }

  // Extract form data
  const companyName = formData.get("companyName") as string
  const website = formData.get("website") as string
  const address = formData.get("address") as string
  const phone = formData.get("phone") as string
  const emergencyPhone = formData.get("emergencyPhone") as string

  // Validate required fields
  if (!companyName || !phone) {
    return {
      ok: false,
      message: "Company name and phone are required",
    }
  }

  try {
    // Generate a unique 8-character invite code
    const inviteCode = generateInviteCode()

    // Insert the new organization into the database
    const { data: org, error: insertError } = await supabase
      .from("orgs")
      .insert({
        name: companyName,
        website: website || null,
        org_address: address || null,
        phone: phone,
        meta: { emergency_phone: emergencyPhone || null },
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating organization:", insertError)
      return {
        ok: false,
        message: "Failed to create organization. Please try again.",
      }
    }

    // Get user's first and last name from auth metadata
    const firstName = user.user_metadata?.first_name || ""
    const lastName = user.user_metadata?.last_name || ""

    // Update existing user record in public.users table FIRST (created by trigger)
    // This gives them super_admin role so they can create invite codes
    const { error: userUpdateError } = await supabase
      .from("users")
      .update({
        org_id: org.id,
        first_name: firstName,
        last_name: lastName,
        role: "super_admin",
        onboarded: true,
      })
      .eq("id", user.id)

    if (userUpdateError) {
      console.error("Error updating user record:", userUpdateError)
      return {
        ok: false,
        message: "Failed to update user record. Please try again.",
      }
    }

    // Now create invite code (user is super_admin now)
    const { error: inviteError } = await supabase
      .from("org_join_codes")
      .insert({
        org_id: org.id,
        code: inviteCode,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year expiry
        created_by: user.id,
        created_at: new Date().toISOString(),
      })

    if (inviteError) {
      console.error("Error creating invite code:", inviteError)
      return {
        ok: false,
        message: "Failed to create invite code. Please try again.",
      }
    }

    // Add the user to the organization with super_admin role
    const { error: memberError } = await supabase
      .from("user_organizations")
      .insert({
        user_id: user.id,
        organization_id: org.id,
        role: "super_admin",
        joined_at: new Date().toISOString(),
      })

    if (memberError) {
      console.error("Error adding user to organization:", memberError)
      // Note: Org was created but user wasn't added as member
      // You might want to handle this differently in production
    }

    // Revalidate and redirect to dashboard
    revalidatePath("/", "layout")
    redirect("/dashboard")
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      ok: false,
      message: "An unexpected error occurred. Please try again.",
    }
  }
}

/**
 * Server action to join an existing company using invite code
 * Called from JoinCompanyFlow component
 */
export async function joinCompany(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()

  // Get the current logged-in user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      ok: false,
      message: "You must be logged in to join a company",
    }
  }

  // Extract and validate invite code
  const inviteCode = (formData.get("inviteCode") as string)?.toUpperCase()

  if (!inviteCode || inviteCode.length !== 8) {
    return {
      ok: false,
      message: "Please enter a valid 8-character invite code",
    }
  }

  try {
    // Find the organization with this invite code
    const { data: joinCode, error: codeError } = await supabase
      .from("org_join_codes")
      .select("org_id, expires_at")
      .eq("code", inviteCode)
      .single()

    if (codeError || !joinCode) {
      return {
        ok: false,
        message: "Invalid invite code. Please check and try again.",
      }
    }

    // Check if the invite code has expired
    if (new Date(joinCode.expires_at) < new Date()) {
      return {
        ok: false,
        message: "This invite code has expired. Please request a new one.",
      }
    }

    // Get organization details
    const { data: org, error: orgError } = await supabase
      .from("orgs")
      .select("id, name")
      .eq("id", joinCode.org_id)
      .single()

    if (orgError || !org) {
      return {
        ok: false,
        message: "Organization not found. Please try again.",
      }
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("user_organizations")
      .select("id")
      .eq("organization_id", org.id)
      .eq("user_id", user.id)
      .single()

    if (existingMember) {
      return {
        ok: false,
        message: "You are already a member of this organization",
      }
    }

    // Get user's first and last name from auth metadata
    const firstName = user.user_metadata?.first_name || ""
    const lastName = user.user_metadata?.last_name || ""

    // Update existing user record in public.users table (created by trigger)
    const { error: userUpdateError } = await supabase
      .from("users")
      .update({
        org_id: org.id,
        first_name: firstName,
        last_name: lastName,
        role: "agent",
        onboarded: true,
      })
      .eq("id", user.id)

    if (userUpdateError) {
      console.error("Error updating user record:", userUpdateError)
      return {
        ok: false,
        message: "Failed to update user record. Please try again.",
      }
    }

    // Add user to the organization with agent role
    const { error: memberError } = await supabase
      .from("user_organizations")
      .insert({
        user_id: user.id,
        organization_id: org.id,
        role: "agent",
        joined_at: new Date().toISOString(),
      })

    if (memberError) {
      console.error("Error joining organization:", memberError)
      return {
        ok: false,
        message: "Failed to join organization. Please try again.",
      }
    }

    // Revalidate and redirect to dashboard
    revalidatePath("/", "layout")
    redirect("/dashboard")
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      ok: false,
      message: "An unexpected error occurred. Please try again.",
    }
  }
}

/**
 * Generates a unique 8-character invite code
 * Format: ABC12XY9 (uppercase alphanumeric)
 */
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
