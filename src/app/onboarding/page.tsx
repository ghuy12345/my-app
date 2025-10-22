"use client"

import { useState } from "react"
import { OnboardingChoice } from "./components/OnboardingChoice"
import { NewCompanyForm } from "./components/NewCompanyForm"
import { JoinCompanyFlow } from "./components/JoinCompanyFlow"

type OnboardingStep = "choice" | "new" | "join"

export default function Page() {
  const [step, setStep] = useState<OnboardingStep>("choice")

  const handleBackToChoice = () => {
    setStep("choice")
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {step === "choice" && (
          <OnboardingChoice onChoiceSelectedAction={setStep} />
        )}

        {step === "new" && (
          <NewCompanyForm onBackAction={handleBackToChoice} />
        )}

        {step === "join" && (
          <JoinCompanyFlow onBackAction={handleBackToChoice} />
        )}
      </div>
    </div>
  )
}
