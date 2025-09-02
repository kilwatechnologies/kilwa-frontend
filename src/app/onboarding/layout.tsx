import OnboardingNavbar from '@/components/onboarding/OnboardingNavbar'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <OnboardingNavbar />
      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}