"use client"

import { useActionState } from "react"
import { Building2 } from "lucide-react"
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
import { createCompany } from "../actions"

type NewCompanyFormProps = {
  onBackAction: () => void
}

export function NewCompanyForm({ onBackAction }: NewCompanyFormProps) {
  const [state, formAction, isPending] = useActionState(createCompany, {
    ok: false,
  })

  return (
    <Card className="mx-auto max-w-5xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="size-6" />
          <CardTitle className="text-2xl">Create Your Company</CardTitle>
        </div>
        <CardDescription>
          Tell us about your organization to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} id="new-company-form">
          <FieldGroup>
            {!state.ok && state.message && (
              <FieldError>
                <div className="rounded-md bg-destructive/10 p-3 text-sm">
                  {state.message}
                </div>
              </FieldError>
            )}

            <Field>
              <FieldLabel htmlFor="company-name">Company Name</FieldLabel>
              <Input
                id="company-name"
                name="companyName"
                placeholder="Acme Corporation"
                required
                disabled={isPending}
              />
              <FieldDescription>
                The official name of your organization
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="website">Company Website</FieldLabel>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder="https://example.com"
                required
                disabled={isPending}
              />
              <FieldDescription>
                Optional - Your company's website or online presence
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="address">Company Address</FieldLabel>
              <Input
                id="address"
                name="address"
                placeholder="123 Main St, City, Country"
                disabled={isPending}
              />
              <FieldDescription>
                Optional - Your main office or business location
              </FieldDescription>
            </Field>

            <Separator />

            <Field>
              <FieldLabel htmlFor="phone">Company Phone</FieldLabel>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                required
                disabled={isPending}
              />
              <FieldDescription>
                Main office contact number for business inquiries
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="emergency">Emergency Phone</FieldLabel>
              <Input
                id="emergency"
                name="emergencyPhone"
                type="tel"
                placeholder="+1 (555) 987-6543"
                disabled={isPending}
              />
              <FieldDescription>
                24/7 emergency contact number for urgent matters
              </FieldDescription>
            </Field>
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
          form="new-company-form"
          disabled={isPending}
          className="flex-1"
        >
          {isPending ? "Creating..." : "Create Company"}
        </Button>
      </CardFooter>
    </Card>
  )
}
