import { redirect } from "next/navigation"
import { createClient } from "utils/supabase/server"

export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // If not authenticated, redirect to login
  if (error || !user) {
    redirect("/")
  }

  // User is authenticated, render the protected content
  return <>{children}</>
}
