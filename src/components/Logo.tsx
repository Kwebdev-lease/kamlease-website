interface LogoProps {
  className?: string
  alt?: string
}

export function Logo({ className = 'h-12 w-auto', alt = 'Kamlease' }: LogoProps) {
  return (
    <img 
      src="/assets/logos/Logo couleur.svg"
      alt={alt}
      className={`${className} object-contain`}
    />
  )
}