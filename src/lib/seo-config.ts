import { Language } from './translations'

export interface SEOConfig {
  site: {
    name: string
    description: {
      fr: string
      en: string
    }
    url: string
    logo: string
    defaultLanguage: Language
    supportedLanguages: Language[]
  }
  keywords: {
    fr: {
      primary: string[]
      secondary: string[]
      longTail: string[]
    }
    en: {
      primary: string[]
      secondary: string[]
      longTail: string[]
    }
  }
  social: {
    twitter?: string
    linkedin?: string
    facebook?: string
  }
  socialMedia: SocialMediaConfig
  analytics: {
    googleAnalyticsId?: string
    googleSearchConsoleId?: string
  }
}

export interface PageSEOData {
  title: {
    fr: string
    en: string
  }
  description: {
    fr: string
    en: string
  }
  keywords: string[]
  canonicalUrl: string
  language: Language
  lastModified?: Date
  image?: string
  imageAlt?: string
  type?: 'website' | 'article' | 'profile' | 'business.business'
  noindex?: boolean
  nofollow?: boolean
  openGraph?: Partial<OpenGraphData>
  twitter?: Partial<TwitterCardData>
  socialImages?: {
    openGraph?: string
    twitter?: string
    linkedin?: string
  }
  localizedUrls?: {
    fr: string
    en: string
  }
}

export interface OpenGraphData {
  title: string
  description: string
  image: string
  url: string
  type: 'website' | 'article' | 'profile' | 'business.business'
  siteName: string
  locale: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
  imageType?: string
  article?: {
    author?: string
    publishedTime?: string
    modifiedTime?: string
    section?: string
    tags?: string[]
  }
}

export interface TwitterCardData {
  card: 'summary' | 'summary_large_image' | 'app' | 'player'
  title: string
  description: string
  image: string
  imageAlt?: string
  site?: string
  creator?: string
  app?: {
    name?: string
    id?: string
    url?: string
  }
}

export interface SocialMediaConfig {
  openGraph: {
    defaultImage: string
    defaultImageAlt: string
    defaultType: 'website' | 'article' | 'profile' | 'business.business'
    imageWidth: number
    imageHeight: number
  }
  twitter: {
    defaultCard: 'summary' | 'summary_large_image'
    site?: string
    creator?: string
  }
  linkedin: {
    companyId?: string
  }
  facebook: {
    appId?: string
    pageId?: string
  }
}

export const seoConfig: SEOConfig = {
  site: {
    name: 'Kamlease',
    description: {
      fr: 'Solutions innovantes en mécatronique, électronique et auto-staging. 30+ ans d\'expertise pour transformer vos idées en réalité industrielle.',
      en: 'Innovative solutions in mechatronics, electronics and auto-staging. 30+ years of expertise to transform your ideas into industrial reality.'
    },
    url: 'https://kamlease.com',
    logo: '/assets/logos/Logo Black for white background.svg',
    defaultLanguage: 'fr',
    supportedLanguages: ['fr', 'en']
  },
  keywords: {
    fr: {
      primary: [
        'solutions mécatroniques',
        'électronique industrielle', 
        'auto-staging',
        'ingénierie mécatronique',
        'innovation industrielle'
      ],
      secondary: [
        'conception électronique',
        'développement produits industriels',
        'optimisation coûts industriels',
        'innovation mécatronique',
        'expertise automobile',
        'mécatronique France',
        'électronique sur mesure'
      ],
      longTail: [
        'adaptation produits automobiles industrie',
        'solutions mécatroniques sur mesure',
        'développement électronique industriel France',
        'optimisation processus industriels',
        'ingénierie mécatronique automobile',
        'conception électronique industrielle France',
        'auto-staging solutions industrielles'
      ]
    },
    en: {
      primary: [
        'mechatronics solutions',
        'industrial electronics',
        'auto-staging',
        'mechatronics engineering',
        'industrial innovation'
      ],
      secondary: [
        'electronic design',
        'industrial product development',
        'cost optimization',
        'automotive expertise',
        'custom electronics',
        'mechatronics France',
        'industrial automation'
      ],
      longTail: [
        'automotive products adaptation industry',
        'custom mechatronics solutions',
        'industrial electronic development France',
        'industrial process optimization',
        'automotive mechatronics engineering',
        'custom industrial electronics France',
        'auto-staging industrial solutions'
      ]
    }
  },
  social: {
    linkedin: 'https://linkedin.com/company/kamlease',
    twitter: '@kamlease'
  },
  socialMedia: {
    openGraph: {
      defaultImage: '/assets/logos/Kamlease Logo.png',
      defaultImageAlt: 'Kamlease - Solutions Mécatroniques et Électroniques',
      defaultType: 'business.business',
      imageWidth: 1200,
      imageHeight: 630
    },
    twitter: {
      defaultCard: 'summary_large_image',
      site: '@kamlease',
      creator: '@kamlease'
    },
    linkedin: {
      companyId: 'kamlease'
    },
    facebook: {
      // These would be configured if Facebook presence exists
      appId: undefined,
      pageId: undefined
    }
  },
  analytics: {
    // These would be configured in production
    googleAnalyticsId: undefined,
    googleSearchConsoleId: undefined
  }
}

// Page-specific SEO configurations
export const pagesSEOData: Record<string, PageSEOData> = {
  home: {
    title: {
      fr: 'Kamlease - Solutions Mécatroniques et Électroniques Innovantes | Auto-staging',
      en: 'Kamlease - Innovative Mechatronics and Electronics Solutions | Auto-staging'
    },
    description: {
      fr: 'Kamlease transforme vos idées en solutions industrielles. 30+ ans d\'expertise en mécatronique, électronique et auto-staging. Optimisation des coûts et innovation garanties.',
      en: 'Kamlease transforms your ideas into industrial solutions. 30+ years of expertise in mechatronics, electronics and auto-staging. Cost optimization and innovation guaranteed.'
    },
    keywords: [
      'solutions mécatroniques',
      'électronique industrielle',
      'auto-staging',
      'ingénierie mécatronique',
      'innovation industrielle',
      'mechatronics solutions',
      'industrial electronics',
      'automotive adaptation'
    ],
    canonicalUrl: '/',
    language: 'fr',
    image: '/assets/logos/Kamlease Logo.png',
    imageAlt: 'Logo Kamlease - Solutions Mécatroniques et Électroniques',
    type: 'business.business',
    openGraph: {
      type: 'business.business',
      imageWidth: 1200,
      imageHeight: 630
    },
    twitter: {
      card: 'summary_large_image'
    },
    socialImages: {
      openGraph: '/assets/social/home-og.png',
      twitter: '/assets/social/home-twitter.png',
      linkedin: '/assets/social/home-linkedin.png'
    },
    localizedUrls: {
      fr: '/',
      en: '/en'
    }
  },
  about: {
    title: {
      fr: 'À Propos - Expertise Mécatronique et Auto-staging | 30 ans d\'expérience | Kamlease',
      en: 'About - Mechatronics and Auto-staging Expertise | 30 years experience | Kamlease'
    },
    description: {
      fr: 'Découvrez Kamlease : 30 ans d\'expertise en mécatronique et auto-staging. Nous adaptons les produits automobiles aux besoins industriels variés avec innovation et qualité.',
      en: 'Discover Kamlease: 30 years of expertise in mechatronics and auto-staging. We adapt automotive products to various industrial needs with innovation and quality.'
    },
    keywords: [
      'expertise mécatronique',
      'auto-staging',
      'adaptation produits automobiles',
      'ingénierie industrielle',
      'innovation mécatronique',
      'mechatronics expertise',
      'automotive products adaptation',
      'industrial engineering'
    ],
    canonicalUrl: '/about',
    language: 'fr',
    type: 'website',
    imageAlt: 'Équipe Kamlease - Expertise en Mécatronique',
    openGraph: {
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image'
    },
    socialImages: {
      openGraph: '/assets/social/about-og.png',
      twitter: '/assets/social/about-twitter.png',
      linkedin: '/assets/social/about-linkedin.png'
    },
    localizedUrls: {
      fr: '/about',
      en: '/en/about'
    }
  },
  contact: {
    title: {
      fr: 'Contact - Devis Solutions Mécatroniques et Électroniques | Kamlease',
      en: 'Contact - Quote for Mechatronics and Electronics Solutions | Kamlease'
    },
    description: {
      fr: 'Contactez Kamlease pour vos projets mécatroniques et électroniques. Devis gratuit, expertise reconnue, solutions sur mesure. Transformons vos idées ensemble.',
      en: 'Contact Kamlease for your mechatronics and electronics projects. Free quote, recognized expertise, custom solutions. Let\'s transform your ideas together.'
    },
    keywords: [
      'contact kamlease',
      'devis mécatronique',
      'consultation électronique',
      'projet industriel',
      'solutions sur mesure',
      'mechatronics quote',
      'electronics consultation',
      'industrial project'
    ],
    canonicalUrl: '/contact',
    language: 'fr',
    type: 'website',
    imageAlt: 'Contactez Kamlease - Formulaire de Contact',
    openGraph: {
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image'
    },
    socialImages: {
      openGraph: '/assets/social/contact-og.png',
      twitter: '/assets/social/contact-twitter.png',
      linkedin: '/assets/social/contact-linkedin.png'
    },
    localizedUrls: {
      fr: '/contact',
      en: '/en/contact'
    }
  },
  'legal-notice': {
    title: {
      fr: 'Mentions Légales - Kamlease Solutions Mécatroniques',
      en: 'Legal Notice - Kamlease Mechatronics Solutions'
    },
    description: {
      fr: 'Mentions légales de Kamlease, société spécialisée en solutions mécatroniques et électroniques industrielles.',
      en: 'Legal notice of Kamlease, company specialized in mechatronics and industrial electronics solutions.'
    },
    keywords: [
      'mentions légales kamlease',
      'informations légales',
      'société mécatronique',
      'legal notice kamlease',
      'legal information',
      'mechatronics company'
    ],
    canonicalUrl: '/mentions-legales',
    language: 'fr',
    type: 'website',
    noindex: true,
    localizedUrls: {
      fr: '/mentions-legales',
      en: '/en/legal-notice'
    }
  },
  'privacy-policy': {
    title: {
      fr: 'Politique de Confidentialité - Kamlease',
      en: 'Privacy Policy - Kamlease'
    },
    description: {
      fr: 'Politique de confidentialité de Kamlease. Protection des données personnelles et respect de votre vie privée.',
      en: 'Kamlease privacy policy. Personal data protection and respect for your privacy.'
    },
    keywords: [
      'politique confidentialité',
      'protection données',
      'vie privée',
      'RGPD',
      'privacy policy',
      'data protection',
      'privacy',
      'GDPR'
    ],
    canonicalUrl: '/politique-confidentialite',
    language: 'fr',
    type: 'website',
    noindex: true,
    localizedUrls: {
      fr: '/politique-confidentialite',
      en: '/en/privacy-policy'
    }
  }
}