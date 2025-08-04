import { useEffect, useState, useRef } from 'react'

interface RollingNumberProps {
  value: number
  formatNumber: (num: number) => string
  prefix?: string
  suffix?: string
  isAnimating: boolean
}

// Composant pour un chiffre qui roule - version simplifiée et robuste
function RollingDigit({ digit }: { digit: string }) {
  // Si c'est un caractère non-numérique, pas d'animation
  if (!/\d/.test(digit)) {
    return <span className="inline-block font-mono">{digit}</span>
  }

  return (
    <span className="rolling-digit font-mono" data-value={digit}>
      <span className="rolling-scale" aria-hidden="true">
        <span>0</span>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
        <span>6</span>
        <span>7</span>
        <span>8</span>
        <span>9</span>
      </span>
      <span className="rolling-value">{digit}</span>
    </span>
  )
}

export function RollingNumber({ value, formatNumber, prefix = '', suffix = '' }: RollingNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const previousValueRef = useRef(value)

  useEffect(() => {
    if (value !== previousValueRef.current) {
      setDisplayValue(value)
      previousValueRef.current = value
    }
  }, [value])

  const formattedValue = formatNumber(displayValue)
  const fullText = prefix + formattedValue + suffix
  const characters = fullText.split('')
  
  return (
    <span className="inline-flex items-center justify-center font-mono">
      {characters.map((char, index) => (
        <RollingDigit 
          key={`${index}`}
          digit={char} 
        />
      ))}
    </span>
  )
}