export type Language = 'fr' | 'en'

export const translations = {
  fr: {
    // Header
    nav: {
      about: 'À propos',
      work: 'Notre Travail',
      process: 'Processus',
      contact: 'Contact',
      startProject: 'Démarrer un projet',
      navigation: 'Navigation',
      home: 'Accueil',
      breadcrumbs: 'Fil d\'Ariane',
      relatedLinks: 'Liens connexes',
      relatedContent: 'Contenu connexe',
      backToTop: 'Haut de page'
    },
    // Hero
    hero: {
      title: 'Innovons Ensemble',
      subtitle: 'Perfectionnons vos produits',
      primaryBtn: 'Démarrer un projet'
    },
    // About
    about: {
      title: 'Qui sommes nous ?',
      description: 'Kamlease intervient dans les secteurs automobile et non-automobile, en se concentrant sur la mécatronique, l\'électronique et la mécanique. Grâce à notre expertise en auto-staging, nous adaptons les produits automobiles aux besoins variés d\'autres industries.',
      description2: 'Grâce à notre expertise en "auto-staging", nous adaptons des produits issus du secteur automobile pour répondre aux besoins variés de diverses industries. Cette polyvalence nous permet d\'offrir des solutions parfaitement adaptées à vos exigences.',
      values: {
        innovation: {
          title: 'Innovation',
          description: 'Nous explorons constamment de nouvelles technologies et méthodes pour créer des solutions avant-gardistes.'
        },
        quality: {
          title: 'Qualité',
          description: 'Chaque projet est réalisé selon les plus hauts standards de qualité pour garantir des résultats durables.'
        },
        partnership: {
          title: 'Partenariat',
          description: 'Nous travaillons en étroite collaboration avec nos clients pour comprendre et répondre à leurs besoins spécifiques.'
        }
      }
    },
    // Expertise
    expertise: {
      title: 'Notre expertise',
      description: 'Nous allions collaboration sur mesure, excellence technologique et optimisation des coûts pour concevoir des solutions adaptées à vos enjeux. Grâce à notre approche multidisciplinaire, nous vous accompagnons de l\'idée à l\'industrialisation, avec un engagement constant pour la qualité et la performance.',
      areas: {
        collaboration: {
          title: 'Collaboration sur mesure',
          description: 'Nous croyons en une collaboration étroite avec nos clients pour concevoir des solutions techniques adaptées à leurs besoins spécifiques, de l\'idée initiale jusqu\'à l\'industrialisation.'
        },
        innovation: {
          title: 'Innovation et qualité',
          description: 'L\'innovation est au cœur de notre démarche. Nous explorons constamment de nouvelles technologies pour vous offrir des produits plus performants et durables, tout en garantissant une qualité irréprochable.'
        },
        optimization: {
          title: 'Optimisation des coûts',
          description: 'Nous nous engageons à offrir des solutions de haute technicité à des coûts maîtrisés, répondant à vos contraintes budgétaires sans compromis sur la qualité.'
        }
      }
    },
    // Stats
    stats: {
      title: 'Nos Gains et Économies',
      description: 'Des résultats concrets qui témoignent de notre engagement envers l\'excellence et l\'efficacité.',
      items: {
        timeSaved: {
          label: 'Temps Économisé',
          tooltip: 'Temps gagné par les poseurs ou assembleurs grâce à des produits plus simples à monter (chiffres basés sur nos projets depuis 2015).'
        },
        financialGains: {
          label: 'Gains Financiers',
          tooltip: 'Gains réalisés par les entreprises grâce à notre accompagnement sur la fabrication de leurs produits.'
        },
        projects: {
          label: 'Projets Réalisés',
          tooltip: 'Nombre total de projets complétés avec succès.'
        },
        co2Saved: {
          label: 'CO2 Économisé',
          tooltip: 'Baisse des émissions grâce à l\'optimisation des solutions proposées, avec une réduction des matières premières utilisées.'
        },
        clients: {
          label: 'Clients Satisfaits',
          tooltip: 'Nombre de clients avec qui nous avons collaboré.'
        }
      },
      note: '* Chiffres basés sur nos projets réalisés depuis 2015'
    },
    // Process
    process: {
      title: 'Processus',
      description: 'Notre méthodologie éprouvée vous accompagne de l\'idée initiale jusqu\'à la réalisation complète de votre projet.',
      steps: {
        analysis: {
          title: 'Analyse',
          description: 'Comprendre vos besoins et identifier les opportunités.'
        },
        design: {
          title: 'Conception',
          description: 'Imaginer une solution adaptée et rédiger les spécifications.'
        },
        development: {
          title: 'Développement',
          description: 'Prototyper, tester et valider le produit avec nos partenaires.'
        },
        production: {
          title: 'Production',
          description: 'Lancer la fabrication et garantir la qualité.'
        },
        followUp: {
          title: 'Suivi',
          description: 'Accompagner, optimiser et anticiper vos besoins futurs.'
        }
      }
    },
    // Contact
    contact: {
      title: 'Donnez vie à vos idées',
      description: 'Prêt à transformer votre vision en réalité ? Contactez-nous dès aujourd\'hui pour discuter de votre projet.',
      cta: 'Démarrer un projet',
      form: {
        title: 'Envoyez-nous un message',
        firstName: 'Prénom',
        lastName: 'Nom',
        company: 'Société',
        email: 'Adresse email',
        telephone: 'Numéro de téléphone',
        message: 'Message',
        send: 'Envoyer le message',
        appointmentBtn: 'Choisir votre rendez-vous',
        submissionTypeTitle: 'Comment souhaitez-vous nous contacter ?',
        sendMessageOption: 'Envoyez-nous un message simple',
        scheduleAppointmentOption: 'Planifiez un rendez-vous',
        phone: 'Téléphone',
        address: 'Adresse',
        placeholder: 'Décrivez votre projet, vos besoins et vos objectifs...',
        emailPlaceholder: 'votre.email@exemple.com',
        telephonePlaceholder: '+33 6 73 71 05 86',
        required: '*',
        successMessage: 'Votre message a été envoyé ! Nous vous recontacterons bientôt.',
        appointmentMessage: 'Fonctionnalité de rendez-vous à intégrer avec votre système de calendrier',
        validation: {
          emailRequired: 'L\'adresse email est obligatoire',
          emailInvalid: 'Format d\'email invalide',
          telephoneRequired: 'Le numéro de téléphone est obligatoire',
          telephoneInvalid: 'Format de téléphone invalide (ex: +33 6 73 71 05 86)'
        },
        errors: {
          sendFailed: 'Erreur lors de l\'envoi de l\'email',
          invalidConfiguration: 'Configuration du service email invalide',
          templateNotFound: 'Template email non trouvé',
          rateLimited: 'Trop de tentatives, veuillez réessayer plus tard',
          serverError: 'Erreur du serveur email',
          networkError: 'Erreur de connexion réseau',
          unexpected: 'Une erreur inattendue est survenue. Veuillez réessayer.'
        },
        loading: {
          sending: 'Envoi de votre message...',
          preparing: 'Préparation du message...',
          validating: 'Validation des données...',
          processing: 'Envoi en cours...',
          success: 'Message envoyé avec succès !'
        },
        appointment: {
          selectDate: 'Sélectionnez une date',
          selectTime: 'Choisissez un horaire',
          businessHours: 'Horaires de disponibilité',
          schedule: 'Lundi - Vendredi, 14h00 - 16h30',
          successMessage: 'Votre rendez-vous a été programmé ! Nous vous enverrons une confirmation.',
          errors: {
            invalidDay: 'Veuillez sélectionner un jour ouvrable (Lundi - Vendredi)',
            invalidTime: 'Veuillez sélectionner un horaire entre 14h00 et 16h30',
            dateRequired: 'Veuillez sélectionner une date',
            timeRequired: 'Veuillez sélectionner un horaire',
            invalidDate: 'La date sélectionnée n\'est pas valide',
            invalidTimeFormat: 'Format d\'heure invalide. Utilisez le format HH:MM',
            dateInPast: 'Impossible de programmer un rendez-vous dans le passé',
            invalidBusinessDay: 'Les rendez-vous ne sont disponibles que du lundi au vendredi',
            invalidBusinessTime: 'Les rendez-vous sont disponibles de {startTime} à {endTime} ({timezone})',
            invalidBusinessDateTime: 'La date et l\'heure sélectionnées ne correspondent pas aux heures d\'ouverture ({timezone})',
            invalidDateTimeCombo: 'La combinaison date/heure n\'est pas valide',
            weekendNotAllowed: 'Les rendez-vous ne sont pas disponibles le weekend',
            validationError: 'Erreur lors de la validation de la date et heure',
            validSlot: 'Créneau valide',
            errorsFound: '{count} erreur{plural} trouvée{plural}',
            validWithWarnings: 'Valide avec {count} avertissement{plural}',
            unknownState: 'État inconnu'
          },
          validation: {
            dateRequired: 'Veuillez sélectionner une date pour votre rendez-vous',
            timeRequired: 'Veuillez sélectionner une heure pour votre rendez-vous',
            invalidSlot: 'Le créneau sélectionné n\'est pas valide. Veuillez choisir une date et heure dans les horaires d\'ouverture.',
            businessDayOnly: 'Les rendez-vous ne sont disponibles que du lundi au vendredi',
            businessTimeOnly: 'Les rendez-vous sont disponibles de {startTime} à {endTime}',
            businessHoursOnly: 'La date et l\'heure sélectionnées ne correspondent pas aux heures d\'ouverture',
            noPastAppointments: 'Impossible de programmer un rendez-vous dans le passé',
            validationFailed: 'Erreur lors de la validation du rendez-vous. Veuillez réessayer.'
          },
          loading: {
            scheduling: 'Programmation de votre rendez-vous...',
            validating: 'Validation des informations...',
            preparing: 'Préparation de votre demande...',
            sending: 'Envoi de votre demande de rendez-vous...',
            finalizing: 'Finalisation...',
            emailFallback: 'Envoi de votre demande par email...'
          },
          success: {
            confirmed: 'Rendez-vous confirmé !',
            emailSent: 'Demande envoyée par email',
            details: 'Détails du rendez-vous',
            reference: 'Référence',
            nextSteps: 'Prochaines étapes'
          }
        }
      },
      info: {
        title: 'Informations de contact',
        whyChoose: 'Pourquoi nous choisir ?'
      },
      features: {
        experience: '30+ ans d\'expérience en ingénierie',
        expertise: 'Expertise en auto-staging unique',
        solutions: 'Solutions sur mesure et optimisées',
        support: 'Accompagnement de l\'idée à l\'industrialisation'
      },
      accessibility: {
        openMenu: 'Ouvrir le menu',
        closeMenu: 'Fermer le menu',
        toggleTheme: 'Changer le thème'
      }
    },
    // Animations
    animations: {
      loading: 'Chargement...',
      skipAnimations: 'Passer les animations',
      animationInProgress: 'Animation en cours',
      animationComplete: 'Animation terminée'
    },
    // Accessibility
    accessibility: {
      reducedMotion: 'Animations réduites activées',
      skipToContent: 'Aller au contenu principal',
      skipToNavigation: 'Aller à la navigation',
      animationsDisabled: 'Les animations sont désactivées selon vos préférences',
      highContrast: 'Mode contraste élevé activé',
      screenReaderOnly: 'Contenu pour lecteur d\'écran uniquement'
    },
    // Interactions
    interactions: {
      clickToExpand: 'Cliquer pour développer',
      hoverForDetails: 'Survoler pour plus de détails',
      pressEnterToActivate: 'Appuyer sur Entrée pour activer',
      pressSpaceToSelect: 'Appuyer sur Espace pour sélectionner',
      clickToClose: 'Cliquer pour fermer',
      dragToReorder: 'Glisser pour réorganiser',
      scrollToSeeMore: 'Faire défiler pour voir plus',
      tapToInteract: 'Toucher pour interagir'
    },
    // Footer
    footer: {
      description: 'Kamlease - Des idées innovantes, des résultats concrets. 30+ ans d\'expertise en mécatronique, électronique et auto-staging.',
      copyright: '© 2025 Copyright Kamlease. Tous droits réservés.',
      legalNotice: 'Mentions légales',
      privacyPolicy: 'Politique de confidentialité',
      contact: 'Contact'
    },
    // Legal
    legal: {
      back: 'Retour',
      notice: {
        title: 'Mentions légales',
        publisher: {
          title: 'Éditeur du site',
          content: 'Le présent site web est édité par :'
        },
        company: 'Société',
        address: 'Adresse',
        phone: 'Téléphone',
        email: 'Email',
        hosting: {
          title: 'Hébergement',
          content: 'Ce site est hébergé par un prestataire d\'hébergement web professionnel.'
        },
        intellectual: {
          title: 'Propriété intellectuelle',
          content: 'L\'ensemble de ce site relève de la législation française et internationale sur le droit d\'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.'
        },
        liability: {
          title: 'Responsabilité',
          content: 'Les informations contenues sur ce site sont aussi précises que possible et le site remis à jour à différentes périodes de l\'année, mais peut toutefois contenir des inexactitudes ou des omissions. Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, merci de bien vouloir le signaler par email.'
        },
        applicable: {
          title: 'Droit applicable',
          content: 'Tant le présent site que les modalités et conditions de son utilisation sont régis par le droit français, quel que soit le lieu d\'utilisation. En cas de contestation éventuelle, et après l\'échec de toute tentative de recherche d\'une solution amiable, les tribunaux français seront seuls compétents pour connaître de ce litige.'
        }
      },
      privacy: {
        title: 'Politique de confidentialité',
        intro: {
          title: 'Introduction',
          content: 'Kamlease s\'engage à protéger la confidentialité de vos données personnelles. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.'
        },
        collection: {
          title: 'Collecte des données',
          content: 'Nous collectons les types de données suivants :',
          personal: 'Informations personnelles (nom, prénom, email)',
          contact: 'Informations de contact (téléphone, adresse)',
          technical: 'Données techniques (adresse IP, navigateur)'
        },
        usage: {
          title: 'Utilisation des données',
          content: 'Nous utilisons vos données pour :',
          respond: 'Répondre à vos demandes et questions',
          improve: 'Améliorer nos services',
          legal: 'Respecter nos obligations légales'
        },
        sharing: {
          title: 'Partage des données',
          content: 'Nous ne vendons, n\'échangeons ni ne louons vos informations personnelles à des tiers sans votre consentement explicite, sauf dans les cas prévus par la loi.'
        },
        rights: {
          title: 'Vos droits',
          content: 'Conformément au RGPD, vous disposez des droits suivants :',
          access: 'Droit d\'accès à vos données',
          rectification: 'Droit de rectification',
          deletion: 'Droit à l\'effacement',
          portability: 'Droit à la portabilité'
        },
        contact: {
          title: 'Contact',
          content: 'Pour toute question concernant cette politique de confidentialité, contactez-nous à :'
        }
      }
    }
  },
  en: {
    // Header
    nav: {
      about: 'About',
      work: 'Our Work',
      process: 'Process',
      contact: 'Contact',
      startProject: 'Start a project',
      navigation: 'Navigation',
      home: 'Home',
      breadcrumbs: 'Breadcrumbs',
      relatedLinks: 'Related Links',
      relatedContent: 'Related Content',
      backToTop: 'Back to Top'
    },
    // Hero
    hero: {
      title: 'Innovate Together',
      subtitle: 'Perfect your products',
      primaryBtn: 'Start a project'
    },
    // About
    about: {
      title: 'Who are we?',
      description: 'Kamlease operates in the automotive and non-automotive sectors, focusing on mechatronics, electronics and mechanics. Thanks to our auto-staging expertise, we adapt automotive products to the varied needs of other industries.',
      description2: 'Thanks to our "auto-staging" expertise, we adapt products from the automotive sector to meet the varied needs of various industries. This versatility allows us to offer solutions perfectly adapted to your requirements.',
      values: {
        innovation: {
          title: 'Innovation',
          description: 'We constantly explore new technologies and methods to create cutting-edge solutions.'
        },
        quality: {
          title: 'Quality',
          description: 'Each project is carried out according to the highest quality standards to guarantee lasting results.'
        },
        partnership: {
          title: 'Partnership',
          description: 'We work closely with our clients to understand and meet their specific needs.'
        }
      }
    },
    // Expertise
    expertise: {
      title: 'Our expertise',
      description: 'We combine tailor-made collaboration, technological excellence and cost optimization to design solutions adapted to your challenges. Thanks to our multidisciplinary approach, we support you from idea to industrialization, with a constant commitment to quality and performance.',
      areas: {
        collaboration: {
          title: 'Tailor-made collaboration',
          description: 'We believe in close collaboration with our clients to design technical solutions adapted to their specific needs, from initial idea to industrialization.'
        },
        innovation: {
          title: 'Innovation and quality',
          description: 'Innovation is at the heart of our approach. We constantly explore new technologies to offer you more efficient and durable products, while guaranteeing impeccable quality.'
        },
        optimization: {
          title: 'Cost optimization',
          description: 'We are committed to offering high-tech solutions at controlled costs, meeting your budget constraints without compromising on quality.'
        }
      }
    },
    // Stats
    stats: {
      title: 'Our Gains and Savings',
      description: 'Concrete results that testify to our commitment to excellence and efficiency.',
      items: {
        timeSaved: {
          label: 'Time Saved',
          tooltip: 'Time saved by installers or assemblers thanks to products that are easier to mount (figures based on our projects since 2015).'
        },
        financialGains: {
          label: 'Financial Gains',
          tooltip: 'Gains achieved by companies thanks to our support in manufacturing their products.'
        },
        projects: {
          label: 'Completed Projects',
          tooltip: 'Total number of successfully completed projects.'
        },
        co2Saved: {
          label: 'CO2 Saved',
          tooltip: 'Reduction in emissions thanks to optimization of proposed solutions, with a reduction in raw materials used.'
        },
        clients: {
          label: 'Satisfied Clients',
          tooltip: 'Number of clients we have collaborated with.'
        }
      },
      note: '* Figures based on our projects completed since 2015'
    },
    // Process
    process: {
      title: 'Process',
      description: 'Our proven methodology supports you from the initial idea to the complete realization of your project.',
      steps: {
        analysis: {
          title: 'Analysis',
          description: 'Understand your needs and identify opportunities.'
        },
        design: {
          title: 'Design',
          description: 'Imagine a suitable solution and write specifications.'
        },
        development: {
          title: 'Development',
          description: 'Prototype, test and validate the product with our partners.'
        },
        production: {
          title: 'Production',
          description: 'Launch manufacturing and guarantee quality.'
        },
        followUp: {
          title: 'Follow-up',
          description: 'Support, optimize and anticipate your future needs.'
        }
      }
    },
    // Contact
    contact: {
      title: 'Bring your ideas to life',
      description: 'Ready to transform your vision into reality? Contact us today to discuss your project.',
      cta: 'Start a project',
      form: {
        title: 'Send us a message',
        firstName: 'First Name',
        lastName: 'Last Name',
        company: 'Company',
        email: 'Email Address',
        telephone: 'Phone Number',
        message: 'Message',
        send: 'Send message',
        appointmentBtn: 'Schedule your appointment',
        submissionTypeTitle: 'How would you like to contact us?',
        sendMessageOption: 'Send us a simple message',
        scheduleAppointmentOption: 'Schedule an appointment',
        phone: 'Phone',
        address: 'Address',
        placeholder: 'Describe your project, your needs and your objectives...',
        emailPlaceholder: 'your.email@example.com',
        telephonePlaceholder: '+33 6 73 71 05 86',
        required: '*',
        successMessage: 'Your message has been sent! We will contact you soon.',
        appointmentMessage: 'Appointment feature to be integrated with your calendar system',
        validation: {
          emailRequired: 'Email address is required',
          emailInvalid: 'Invalid email format',
          telephoneRequired: 'Phone number is required',
          telephoneInvalid: 'Invalid phone format (ex: +33 6 73 71 05 86)'
        },
        errors: {
          sendFailed: 'Failed to send email',
          invalidConfiguration: 'Invalid email service configuration',
          templateNotFound: 'Email template not found',
          rateLimited: 'Too many attempts, please try again later',
          serverError: 'Email server error',
          networkError: 'Network connection error',
          unexpected: 'An unexpected error occurred. Please try again.'
        },
        loading: {
          sending: 'Sending your message...',
          preparing: 'Preparing message...',
          validating: 'Validating data...',
          processing: 'Sending in progress...',
          success: 'Message sent successfully!'
        },
        appointment: {
          selectDate: 'Select a date',
          selectTime: 'Choose a time',
          businessHours: 'Business hours',
          schedule: 'Monday - Friday, 2:00 PM - 4:30 PM',
          successMessage: 'Your appointment has been scheduled! We will send you a confirmation.',
          errors: {
            invalidDay: 'Please select a business day (Monday - Friday)',
            invalidTime: 'Please select a time between 2:00 PM and 4:30 PM',
            dateRequired: 'Please select a date',
            timeRequired: 'Please select a time',
            invalidDate: 'The selected date is not valid',
            invalidTimeFormat: 'Invalid time format. Use HH:MM format',
            dateInPast: 'Cannot schedule an appointment in the past',
            invalidBusinessDay: 'Appointments are only available Monday through Friday',
            invalidBusinessTime: 'Appointments are available from {startTime} to {endTime} ({timezone})',
            invalidBusinessDateTime: 'The selected date and time do not match business hours ({timezone})',
            invalidDateTimeCombo: 'The date/time combination is not valid',
            weekendNotAllowed: 'Appointments are not available on weekends',
            validationError: 'Error validating date and time',
            validSlot: 'Valid time slot',
            errorsFound: '{count} error{plural} found',
            validWithWarnings: 'Valid with {count} warning{plural}',
            unknownState: 'Unknown state'
          },
          validation: {
            dateRequired: 'Please select a date for your appointment',
            timeRequired: 'Please select a time for your appointment',
            invalidSlot: 'The selected time slot is not valid. Please choose a date and time within business hours.',
            businessDayOnly: 'Appointments are only available Monday through Friday',
            businessTimeOnly: 'Appointments are available from {startTime} to {endTime}',
            businessHoursOnly: 'The selected date and time do not match business hours',
            noPastAppointments: 'Cannot schedule an appointment in the past',
            validationFailed: 'Error validating appointment. Please try again.'
          },
          loading: {
            scheduling: 'Scheduling your appointment...',
            validating: 'Validating information...',
            preparing: 'Preparing your request...',
            sending: 'Sending your appointment request...',
            finalizing: 'Finalizing...',
            emailFallback: 'Sending your request by email...'
          },
          success: {
            confirmed: 'Appointment confirmed!',
            emailSent: 'Request sent by email',
            details: 'Appointment details',
            reference: 'Reference',
            nextSteps: 'Next steps'
          }
        }
      },
      info: {
        title: 'Contact information',
        whyChoose: 'Why choose us?'
      },
      features: {
        experience: '30+ years of engineering experience',
        expertise: 'Unique auto-staging expertise',
        solutions: 'Customized and optimized solutions',
        support: 'Support from idea to industrialization'
      },
      accessibility: {
        openMenu: 'Open menu',
        closeMenu: 'Close menu',
        toggleTheme: 'Toggle theme'
      }
    },
    // Animations
    animations: {
      loading: 'Loading...',
      skipAnimations: 'Skip animations',
      animationInProgress: 'Animation in progress',
      animationComplete: 'Animation complete'
    },
    // Accessibility
    accessibility: {
      reducedMotion: 'Reduced motion enabled',
      skipToContent: 'Skip to main content',
      skipToNavigation: 'Skip to navigation',
      animationsDisabled: 'Animations are disabled according to your preferences',
      highContrast: 'High contrast mode enabled',
      screenReaderOnly: 'Screen reader only content'
    },
    // Interactions
    interactions: {
      clickToExpand: 'Click to expand',
      hoverForDetails: 'Hover for details',
      pressEnterToActivate: 'Press Enter to activate',
      pressSpaceToSelect: 'Press Space to select',
      clickToClose: 'Click to close',
      dragToReorder: 'Drag to reorder',
      scrollToSeeMore: 'Scroll to see more',
      tapToInteract: 'Tap to interact'
    },
    // Footer
    footer: {
      description: 'Kamlease - Innovative ideas, concrete results. 30+ years of expertise in mechatronics, electronics and auto-staging.',
      copyright: '© 2025 Copyright Kamlease. All rights reserved.',
      legalNotice: 'Legal Notice',
      privacyPolicy: 'Privacy Policy',
      contact: 'Contact'
    },
    // Legal
    legal: {
      back: 'Back',
      notice: {
        title: 'Legal Notice',
        publisher: {
          title: 'Site Publisher',
          content: 'This website is published by:'
        },
        company: 'Company',
        address: 'Address',
        phone: 'Phone',
        email: 'Email',
        hosting: {
          title: 'Hosting',
          content: 'This site is hosted by a professional web hosting provider.'
        },
        intellectual: {
          title: 'Intellectual Property',
          content: 'This entire site is subject to French and international legislation on copyright and intellectual property. All reproduction rights are reserved, including for downloadable documents and iconographic and photographic representations.'
        },
        liability: {
          title: 'Liability',
          content: 'The information contained on this site is as accurate as possible and the site is updated at different times of the year, but may nevertheless contain inaccuracies or omissions. If you notice a gap, error or what appears to be a malfunction, please report it by email.'
        },
        applicable: {
          title: 'Applicable Law',
          content: 'Both this site and the terms and conditions of its use are governed by French law, regardless of the place of use. In the event of any dispute, and after the failure of any attempt to find an amicable solution, the French courts will have sole jurisdiction to hear this dispute.'
        }
      },
      privacy: {
        title: 'Privacy Policy',
        intro: {
          title: 'Introduction',
          content: 'Kamlease is committed to protecting the confidentiality of your personal data. This policy explains how we collect, use and protect your information.'
        },
        collection: {
          title: 'Data Collection',
          content: 'We collect the following types of data:',
          personal: 'Personal information (first name, last name, email)',
          contact: 'Contact information (phone, address)',
          technical: 'Technical data (IP address, browser)'
        },
        usage: {
          title: 'Data Usage',
          content: 'We use your data to:',
          respond: 'Respond to your requests and questions',
          improve: 'Improve our services',
          legal: 'Comply with our legal obligations'
        },
        sharing: {
          title: 'Data Sharing',
          content: 'We do not sell, trade or rent your personal information to third parties without your explicit consent, except in cases provided for by law.'
        },
        rights: {
          title: 'Your Rights',
          content: 'In accordance with GDPR, you have the following rights:',
          access: 'Right of access to your data',
          rectification: 'Right of rectification',
          deletion: 'Right to erasure',
          portability: 'Right to portability'
        },
        contact: {
          title: 'Contact',
          content: 'For any questions regarding this privacy policy, contact us at:'
        }
      }
    }
  }
}

export const getTranslation = (lang: Language, key: string, params?: Record<string, string>): string => {
  const keys = key.split('.')
  let value: Record<string, unknown> = translations[lang]
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k] as Record<string, unknown>
    } else {
      return key
    }
  }
  
  let result = (typeof value === 'string' ? value : key)
  
  // Handle parameter substitution
  if (params && typeof result === 'string') {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue)
    })
  }
  
  return result
}