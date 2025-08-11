interface LogoProps {
  className?: string
  alt?: string
}

export function Logo({ className = 'h-12 w-auto', alt = 'Kamlease' }: LogoProps) {
  return (
    <img 
      src="/assets/logos/logo-color.svg"
      alt={alt}
      className={`${className} object-contain`}
    />
  )
}