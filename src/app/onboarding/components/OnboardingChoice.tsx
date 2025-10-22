"use client"

import { useState } from "react"
import { Building2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"

type OnboardingChoiceProps = {
  onChoiceSelectedAction: (choice: "new" | "join") => void
}

export function OnboardingChoice({ onChoiceSelectedAction }: OnboardingChoiceProps) {
  const [selectedChoice, setSelectedChoice] = useState<"new" | "join">("new")

  const handleContinue = () => {
    onChoiceSelectedAction(selectedChoice)
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome! Let's get you set up</CardTitle>
        <CardDescription>
          Choose how you'd like to continue with your onboarding
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedChoice}
          onValueChange={(value) => setSelectedChoice(value as "new" | "join")}
        >
          <FieldLabel className="cursor-pointer">
            <Field orientation="horizontal">
              <RadioGroupItem value="new" id="new" />
              <FieldContent>
                <FieldTitle className="flex items-center gap-2">
                  <Building2 className="size-5" />
                  Create New Company
                </FieldTitle>
                <FieldDescription>
                  Set up a new organization and become the administrator
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>

          <FieldLabel className="cursor-pointer">
            <Field orientation="horizontal">
              <RadioGroupItem value="join" id="join" />
              <FieldContent>
                <FieldTitle className="flex items-center gap-2">
                  <UserPlus className="size-5" />
                  Join Existing Company
                </FieldTitle>
                <FieldDescription>
                  Enter a company code or request an invitation from your manager
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button onClick={handleContinue} className="w-full" size="lg">
          Continue
        </Button>
      </CardFooter>
    </Card>
  )
}
