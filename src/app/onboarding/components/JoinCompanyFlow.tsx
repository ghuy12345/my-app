"use client"

import { useActionState } from "react"
import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { joinCompany } from "../actions"

type JoinCompanyFlowProps = {
  onBackAction: () => void
}

export function JoinCompanyFlow({ onBackAction }: JoinCompanyFlowProps) {
  const [state, formAction, isPending] = useActionState(joinCompany, {
    ok: false,
  })

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="size-6" />
          <CardTitle className="text-2xl">Join a Company</CardTitle>
        </div>
        <CardDescription>
          Enter your company's invite code to join the organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} id="join-company-form">
          <FieldGroup>
            {!state.ok && state.message && (
              <FieldError>
                <div className="rounded-md bg-destructive/10 p-3 text-sm">
                  {state.message}
                </div>
              </FieldError>
            )}

            <Field>
              <FieldLabel htmlFor="invite-code">Company Invite Code</FieldLabel>
              <Input
                id="invite-code"
                name="inviteCode"
                placeholder="ABC12XY9"
                required
                disabled={isPending}
                className="uppercase tracking-wider font-mono text-base"
                maxLength={8}
              />
              <FieldDescription>
                Enter the 8-character code provided by your manager or administrator
              </FieldDescription>
            </Field>

            <Separator />

            <FieldDescription className="text-center">
              Don't have a code? Ask your manager to send you an invitation via
              email or provide you with the company invite code.
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBackAction}
          disabled={isPending}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="submit"
          form="join-company-form"
          disabled={isPending}
          className="flex-1"
        >
          {isPending ? "Verifying..." : "Join Company"}
        </Button>
      </CardFooter>
    </Card>
  )
}
