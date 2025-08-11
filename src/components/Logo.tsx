interface LogoProps {
  className?: string
  alt?: string
}

export function Logo({ className = 'h-12 w-auto', alt = 'Kamlease' }: LogoProps) {
  return (
    <div className={`${className} overflow-hidden flex items-center justify-center`}>
      <img 
        src="/assets/logos/logo-couleur.svg"
        alt={alt}
        className="w-full h-full object-cover scale-110"
      />
    </div>
  )
}