import Image from 'next/image'

export default function OnboardingNavbar() {
  return (
    <nav className="px-6 py-4">
      <div className="absolute top-4 left-6">
        <div className="flex items-center">
          <Image 
            src="/assets/kilwa-logo.svg" 
            alt="Kilwa Logo" 
            width={83} 
            height={39}
            className="object-contain"
          />
        </div>
      </div>
    </nav>
  )
}