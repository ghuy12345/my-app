import { redirect } from "next/navigation"
import { createClient } from "utils/supabase/server"
import { Button } from "@/components/ui/button"
import { signout } from "@/lib/auth-actions"
import { LogOut } from "lucide-react"

export default async function OnboardingLayout({
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

  return (
    <div className="relative min-h-svh">
      {/* Logout button in top right corner */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
        <form action={signout}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </form>
      </div>

      {/* Main content */}
      {children}
    </div>
  )
}
