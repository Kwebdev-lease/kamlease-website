/**
 * Composant de saisie de téléphone simple
 * Chiffres uniquement, 18 caractères maximum
 */

import { Phone } from 'lucide-react'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  error?: boolean
  placeholder?: string
  className?: string
  name?: string
  required?: boolean
}

export function PhoneInput({
  value,
  onChange,
  onBlur,
  onFocus,
  error = false,
  placeholder = "+33 6 73 71 05 86",
  className = "",
  name = "telephone",
  required = false
}: PhoneInputProps) {
  // Gérer la saisie (chiffres uniquement, 18 caractères maximum)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Permettre seulement les chiffres, espaces, + et -
    const filteredInput = input.replace(/[^\d\s+\-]/g, '')
    // Limiter à 18 caractères maximum
    const limitedInput = filteredInput.substring(0, 18)
    onChange(limitedInput)
  }

  // Gérer les touches pressées pour bloquer les caractères non autorisés
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permettre les touches de contrôle
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab' || 
        e.key === 'Escape' || e.key === 'Enter' || e.key === 'ArrowLeft' || 
        e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
        e.key === ' ') {
      return
    }
    
    // Bloquer si on a déjà 18 caractères
    if (value.length >= 18 && /[0-9+\-]/.test(e.key)) {
      e.preventDefault()
      return
    }
    
    // Permettre seulement les chiffres, + et -
    if (!/[0-9+\-]/.test(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className={`border rounded-lg transition-colors ${
        error 
          ? 'border-red-300 dark:border-red-600' 
          : 'border-gray-300 dark:border-gray-600 focus-within:border-orange-500 dark:focus-within:border-orange-400'
      }`}>
        {/* Champ de saisie simple */}
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          
          <input
            type="tel"
            name={name}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            required={required}
            className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={18}
          />
        </div>
      </div>
    </div>
  )
}

export default PhoneInput