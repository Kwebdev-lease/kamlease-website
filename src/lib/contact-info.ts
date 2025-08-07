/**
 * Informations de contact centralisées pour Kamlease
 * Toutes les informations de contact du site sont définies ici
 */

export const CONTACT_INFO = {
  // Téléphone
  phone: {
    number: '+33 6 73 71 05 86',
    display: '+33 6 73 71 05 86',
    href: 'tel:+33673710586'
  },
  
  // Email
  email: {
    address: 'contact@kamlease.com',
    display: 'contact@kamlease.com',
    href: 'mailto:contact@kamlease.com'
  },
  
  // Adresse
  address: {
    street: '109 Rue Maréchal Joffre',
    postalCode: '45240',
    city: 'La Ferté-Saint-Aubin',
    country: 'France',
    full: '109 Rue Maréchal Joffre, 45240 La Ferté-Saint-Aubin, France',
    googleMapsUrl: 'https://maps.google.com/?q=109+Rue+Maréchal+Joffre,+45240+La+Ferté-Saint-Aubin,+France'
  },
  
  // Réseaux sociaux et autres
  social: {
    linkedin: 'https://linkedin.com/company/kamlease',
    website: 'https://kamlease.com'
  },
  
  // Horaires d'ouverture
  businessHours: {
    monday: '9h00 - 18h00',
    tuesday: '9h00 - 18h00',
    wednesday: '9h00 - 18h00',
    thursday: '9h00 - 18h00',
    friday: '9h00 - 18h00',
    saturday: 'Fermé',
    sunday: 'Fermé',
    display: 'Lun-Ven: 9h00 - 18h00'
  }
} as const

export default CONTACT_INFO