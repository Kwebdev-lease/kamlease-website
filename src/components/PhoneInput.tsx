/**
 * Composant de saisie de téléphone avec dropdown pays et validation stricte
 * Format: Dropdown pays + 0 fixe grisé + 9 chiffres maximum
 */

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Liste des pays avec indicatifs téléphoniques
const COUNTRY_CODES = [
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+1', country: 'États-Unis', flag: '🇺🇸' },
  { code: '+1', country: 'Canada', flag: '🇨🇦' },
  { code: '+44', country: 'Royaume-Uni', flag: '🇬🇧' },
  { code: '+49', country: 'Allemagne', flag: '🇩🇪' },
  { code: '+39', country: 'Italie', flag: '🇮🇹' },
  { code: '+34', country: 'Espagne', flag: '🇪🇸' },
  { code: '+32', country: 'Belgique', flag: '🇧🇪' },
  { code: '+41', country: 'Suisse', flag: '🇨🇭' },
  { code: '+31', country: 'Pays-Bas', flag: '🇳🇱' },
  { code: '+43', country: 'Autriche', flag: '🇦🇹' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+46', country: 'Suède', flag: '🇸🇪' },
  { code: '+47', country: 'Norvège', flag: '🇳🇴' },
  { code: '+45', country: 'Danemark', flag: '🇩🇰' },
  { code: '+358', country: 'Finlande', flag: '🇫🇮' },
  { code: '+352', country: 'Luxembourg', flag: '🇱🇺' },
  { code: '+353', country: 'Irlande', flag: '🇮🇪' },
  { code: '+420', country: 'République tchèque', flag: '🇨🇿' },
  { code: '+48', country: 'Pologne', flag: '🇵🇱' },
  { code: '+36', country: 'Hongrie', flag: '🇭🇺' },
  { code: '+30', country: 'Grèce', flag: '🇬🇷' },
  { code: '+81', country: 'Japon', flag: '🇯🇵' },
  { code: '+86', country: 'Chine', flag: '🇨🇳' },
  { code: '+91', country: 'Inde', flag: '🇮🇳' },
  { code: '+61', country: 'Australie', flag: '🇦🇺' },
  { code: '+55', country: 'Brésil', flag: '🇧🇷' },
  { code: '+52', country: 'Mexique', flag: '🇲🇽' },
  { code: '+7', country: 'Russie', flag: '🇷🇺' },
  { code: '+82', country: 'Corée du Sud', flag: '🇰🇷' },
  { code: '+65', country: 'Singapour', flag: '🇸🇬' },
  { code: '+971', country: 'Émirats arabes unis', flag: '🇦🇪' },
  { code: '+966', country: 'Arabie saoudite', flag: '🇸🇦' },
  { code: '+27', country: 'Afrique du Sud', flag: '🇿🇦' },
  { code: '+212', country: 'Maroc', flag: '🇲🇦' },
  { code: '+213', country: 'Algérie', flag: '🇩🇿' },
  { code: '+216', country: 'Tunisie', flag: '🇹🇳' },
]

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
  placeholder = "73 71 05 86",
  className = "",
  name = "telephone",
  required = false
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]) // France par défaut
  const [phoneDigits, setPhoneDigits] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Parser le numéro existant au chargement
  useEffect(() => {
    if (value) {
      // Trouver l'indicatif correspondant
      const matchingCountry = COUNTRY_CODES.find(country => 
        value.startsWith(country.code)
      )
      
      if (matchingCountry) {
        setSelectedCountry(matchingCountry)
        // Extraire les chiffres après l'indicatif et le 0
        const remainingNumber = value.substring(matchingCountry.code.length).trim()
        const digitsOnly = remainingNumber.replace(/[^\d]/g, '')
        // Enlever le 0 initial s'il existe et garder max 9 chiffres
        const withoutLeadingZero = digitsOnly.startsWith('0') ? digitsOnly.substring(1) : digitsOnly
        setPhoneDigits(withoutLeadingZero.substring(0, 9))
      } else {
        // Si pas d'indicatif, traiter comme numéro français
        const digitsOnly = value.replace(/[^\d]/g, '')
        const withoutLeadingZero = digitsOnly.startsWith('0') ? digitsOnly.substring(1) : digitsOnly
        setPhoneDigits(withoutLeadingZero.substring(0, 9))
      }
    }
  }, [value])

  // Mettre à jour la valeur complète quand l'indicatif ou les chiffres changent
  useEffect(() => {
    if (phoneDigits) {
      const fullNumber = `${selectedCountry.code} 0${phoneDigits}`
      if (fullNumber !== value) {
        onChange(fullNumber)
      }
    } else {
      if (value !== '') {
        onChange('')
      }
    }
  }, [selectedCountry, phoneDigits, onChange, value])

  // Gérer la saisie des chiffres (9 chiffres maximum, chiffres uniquement)
  const handlePhoneDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Permettre seulement les chiffres, supprimer tout autre caractère
    const numbersOnly = input.replace(/[^\d]/g, '')
    // Limiter à 9 chiffres maximum
    const limitedDigits = numbersOnly.substring(0, 9)
    setPhoneDigits(limitedDigits)
  }

  // Gérer les touches pressées pour bloquer les caractères non numériques
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permettre les touches de contrôle
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab' || 
        e.key === 'Escape' || e.key === 'Enter' || e.key === 'ArrowLeft' || 
        e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      return
    }
    
    // Bloquer si on a déjà 9 chiffres
    if (phoneDigits.length >= 9 && /[0-9]/.test(e.key)) {
      e.preventDefault()
      return
    }
    
    // Bloquer tout ce qui n'est pas un chiffre
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault()
    }
  }

  // Gérer la sélection du pays
  const handleCountrySelect = (country: typeof COUNTRY_CODES[0]) => {
    setSelectedCountry(country)
    setIsDropdownOpen(false)
  }

  // Calculer la position du dropdown
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }

  // Ouvrir/fermer le dropdown
  const toggleDropdown = () => {
    if (!isDropdownOpen) {
      updateDropdownPosition()
    }
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <div className={`relative ${className}`}>
      <div className={`flex border rounded-lg overflow-hidden transition-colors ${
        error 
          ? 'border-red-300 dark:border-red-600' 
          : 'border-gray-300 dark:border-gray-600 focus-within:border-orange-500 dark:focus-within:border-orange-400'
      }`}>
        {/* Sélecteur de pays */}
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={toggleDropdown}
            className="flex items-center px-3 py-2 bg-gray-50 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors min-w-[80px]"
          >
            <span className="mr-1">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedCountry.code}
            </span>
            <ChevronDown className={`ml-1 h-4 w-4 text-gray-500 transition-transform flex-shrink-0 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`} />
          </button>
        </div>

        {/* Champ de saisie du numéro avec 0 fixe */}
        <div className="flex-1 relative flex items-center">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          
          {/* 0 fixe grisé */}
          <span className="absolute left-10 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 font-mono text-base">
            0
          </span>
          
          {/* Champ pour les 9 chiffres */}
          <input
            type="tel"
            name={name}
            value={phoneDigits}
            onChange={handlePhoneDigitsChange}
            onKeyDown={handleKeyPress}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={phoneDigits.length === 0 ? placeholder : ''}
            required={required}
            className="w-full pl-14 pr-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none font-mono text-base"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="tel"
            maxLength={9}
          />
        </div>
      </div>

      {/* Dropdown en portail pour s'afficher au-dessus de tout */}
      {isDropdownOpen && typeof window !== 'undefined' && createPortal(
        <>
          {/* Overlay pour fermer en cliquant à l'extérieur */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 99998 }}
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Liste déroulante des pays */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto min-w-[250px]"
              style={{ 
                zIndex: 99999,
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                minWidth: Math.max(dropdownPosition.width, 250)
              }}
            >
              {COUNTRY_CODES.map((country, index) => (
                <button
                  key={`${country.code}-${index}`}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="mr-3">{country.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900 dark:text-white truncate">
                        {country.country}
                      </span>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-2 flex-shrink-0">
                        {country.code}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          </AnimatePresence>
        </>,
        document.body
      )}
    </div>
  )
}

export default PhoneInput