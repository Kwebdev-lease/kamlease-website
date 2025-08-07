/**
 * Composant de saisie de téléphone international
 * Avec sélecteur de pays et validation numérique
 */

import { useState, useEffect } from 'react'
import { ChevronDown, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Liste des pays avec indicatifs téléphoniques
const COUNTRY_CODES = [
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+1', country: 'États-Unis / Canada', flag: '🇺🇸' },
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
  placeholder = "6 73 71 05 86",
  className = "",
  name = "telephone",
  required = false
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]) // France par défaut
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Séparer l'indicatif du numéro au chargement
  useEffect(() => {
    if (value) {
      // Trouver l'indicatif correspondant
      const matchingCountry = COUNTRY_CODES.find(country => 
        value.startsWith(country.code)
      )
      
      if (matchingCountry) {
        setSelectedCountry(matchingCountry)
        setPhoneNumber(value.substring(matchingCountry.code.length).trim())
      } else {
        setPhoneNumber(value)
      }
    }
  }, [value])

  // Mettre à jour la valeur complète quand l'indicatif ou le numéro change
  useEffect(() => {
    const fullNumber = phoneNumber ? `${selectedCountry.code} ${phoneNumber}` : ''
    if (fullNumber !== value) {
      onChange(fullNumber)
    }
  }, [selectedCountry, phoneNumber, onChange])

  // Gérer la saisie du numéro (chiffres uniquement)
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Permettre seulement les chiffres et les espaces, supprimer tout autre caractère
    const numbersOnly = input.replace(/[^\d\s]/g, '')
    setPhoneNumber(numbersOnly)
  }

  // Gérer les touches pressées pour bloquer les caractères non numériques
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permettre les touches de contrôle (backspace, delete, tab, escape, enter, etc.)
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab' || 
        e.key === 'Escape' || e.key === 'Enter' || e.key === 'ArrowLeft' || 
        e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
        e.key === ' ') {
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
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center px-3 py-2 bg-gray-50 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors min-w-[120px]"
          >
            <span className="mr-2">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedCountry.code}
            </span>
            <ChevronDown className={`ml-2 h-4 w-4 text-gray-500 transition-transform ${
              isDropdownOpen ? 'rotate-180' : ''
            }`} />
          </button>

          {/* Liste déroulante des pays */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {COUNTRY_CODES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="mr-3">{country.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {country.code}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate ml-2">
                          {country.country}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Champ de saisie du numéro */}
        <div className="flex-1 relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="tel"
            name={name}
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            onKeyDown={handleKeyPress}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            required={required}
            className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
            inputMode="numeric"
            pattern="[0-9\s]*"
            autoComplete="tel"
          />
        </div>
      </div>

      {/* Fermer la dropdown en cliquant à l'extérieur */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
}

export default PhoneInput