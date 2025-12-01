'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'es' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Detectar idioma del navegador
function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'es'
  
  const browserLang = navigator.language || (navigator as any).userLanguage
  const langCode = browserLang.split('-')[0].toLowerCase()
  
  // Si el idioma del navegador es inglés, usar inglés, sino español por defecto
  return langCode === 'en' ? 'en' : 'es'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es')

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        // Intentar cargar idioma guardado, si no existe detectar del navegador
        const savedLanguage = localStorage.getItem('portfolioLanguage') as Language | null
        if (savedLanguage === 'es' || savedLanguage === 'en') {
          setLanguageState(savedLanguage)
        } else {
          const detectedLang = detectBrowserLanguage()
          setLanguageState(detectedLang)
          localStorage.setItem('portfolioLanguage', detectedLang)
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error)
        setLanguageState(detectBrowserLanguage())
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('portfolioLanguage', lang)
      } catch (error) {
        console.error('Error saving language to localStorage:', error)
      }
    }
  }

  // Función de traducción
  const t = (key: string): string => {
    const translations: { [lang in Language]: { [key: string]: string } } = {
      es: {
        // Navegación
        'nav.home': 'INICIO',
        'nav.skills': 'HABILIDADES',
        'nav.projects': 'PROYECTOS',
        'nav.contact': 'CONTACTO',
        
        // Sección Inicio
        'home.location': 'Caracas, Venezuela • Trabajo Remoto',
        'home.description': 'Soy un desarrollador web especializado en crear soluciones modernas que sean tan eficientes como efectivas. Mi experiencia incluye el análisis de datos y la automatización de procesos con Python. Me apasiona explorar cómo la tecnología puede mejorar experiencias e impulsar la innovación, para mí cada proyecto es una oportunidad de superar expectativas, dedicando atención meticulosa a los detalles y comprometiéndome con la excelencia en cada entrega.',
        
        // Sección Habilidades
        'skills.title': 'Habilidades',
        'skills.technical': 'Técnicas',
        'skills.personal': 'Personales',
        'skills.loading': 'Cargando...',
        
        // Sección Proyectos
        'projects.title': 'Proyectos',
        'projects.loading': 'Cargando...',
        'projects.viewMore': 'Ver más',
        'projects.close': '×',
        'projects.updated': 'Actualizado',
        'projects.stars': 'estrellas',
        
        // Sección Contacto
        'contact.title': 'Contacto',
        'contact.description': '¿Tienes un proyecto en mente? Estoy listo para ayudarte a hacerlo realidad.',
        'contact.email': 'Email',
        'contact.whatsapp': 'WhatsApp',
        'contact.github': 'GitHub',
        'contact.phone': 'Teléfono',
        
        // Estadísticas
        'stats.projects': 'Proyectos',
        'stats.experience': 'Años de Experiencia',
        'stats.dedication': 'Dedicación',
        
        // Settings
        'settings.language': 'Idioma',
        'settings.language.es': 'Español',
        'settings.language.en': 'English',
        'settings.mode.happy': 'Modo Feliz',
        'settings.mode.serious': 'Modo Serio',
        
        // Habilidades personales
        'personal.soft.title': 'Habilidades Blandas',
        'personal.soft.communication': 'Comunicación efectiva',
        'personal.soft.teamwork': 'Trabajo en equipo',
        'personal.soft.adaptability': 'Adaptabilidad',
        'personal.soft.problemSolving': 'Resolución de problemas',
        'personal.soft.creativity': 'Creatividad',
        'personal.soft.timeManagement': 'Buen manejo del tiempo',
        'personal.soft.leadership': 'Liderazgo',
        'personal.soft.empathy': 'Empatía',
        'personal.soft.responsibility': 'Responsabilidad',
        'personal.soft.conflictResolution': 'Resolución de conflictos',
        
        'personal.power.title': 'Power Skills',
        'personal.power.analytical': 'Pensamiento analítico',
        'personal.power.critical': 'Pensamiento crítico',
        'personal.power.learning': 'Aprendizaje continuo',
        'personal.power.innovation': 'Innovación',
        'personal.power.strategic': 'Pensamiento estratégico',
        'personal.power.decision': 'Toma de decisiones',
        'personal.power.networking': 'Networking',
        'personal.power.negotiation': 'Negociación',
        
        // Textos adicionales
        'personal.power.automation': 'Automatización de procesos',
        'personal.power.techInnovation': 'Innovación tecnológica',
        'personal.power.mentoring': 'Mentoría y enseñanza',
        'contact.viewOnGitHub': 'Ver en GitHub',
        'projects.public': 'Proyectos Públicos',
      },
      en: {
        // Navigation
        'nav.home': 'HOME',
        'nav.skills': 'SKILLS',
        'nav.projects': 'PROJECTS',
        'nav.contact': 'CONTACT',
        
        // Home Section
        'home.location': 'Caracas, Venezuela • Remote Work',
        'home.description': 'I am a web developer specialized in creating modern solutions that are both efficient and effective. My experience includes data analysis and process automation with Python. I am passionate about exploring how technology can improve experiences and drive innovation, for me each project is an opportunity to exceed expectations, dedicating meticulous attention to details and committing to excellence in every delivery.',
        
        // Skills Section
        'skills.title': '___Skills___',
        'skills.technical': 'Technical',
        'skills.personal': 'Personal',
        'skills.loading': 'Loading...',
        
        // Projects Section
        'projects.title': 'Projects',
        'projects.loading': 'Loading...',
        'projects.viewMore': 'View more',
        'projects.close': '×',
        'projects.updated': 'Updated',
        'projects.stars': 'stars',
        
        // Contact Section
        'contact.title': 'Contact',
        'contact.description': 'Do you have a project in mind? I am ready to help you make it a reality.',
        'contact.email': 'Email',
        'contact.whatsapp': 'WhatsApp',
        'contact.github': 'GitHub',
        'contact.phone': 'Phone',
        
        // Statistics
        'stats.projects': 'Projects',
        'stats.experience': 'Years of\nExperience',
        'stats.dedication': 'Dedication',
        
        // Settings
        'settings.language': 'Language',
        'settings.language.es': 'Español',
        'settings.language.en': 'English',
        'settings.mode.happy': 'Happy Mode',
        'settings.mode.serious': 'Serious Mode',
        
        // Personal skills
        'personal.soft.title': 'Soft Skills',
        'personal.soft.communication': 'Effective communication',
        'personal.soft.teamwork': 'Teamwork',
        'personal.soft.adaptability': 'Adaptability',
        'personal.soft.problemSolving': 'Problem solving',
        'personal.soft.creativity': 'Creativity',
        'personal.soft.timeManagement': 'Good time management',
        'personal.soft.leadership': 'Leadership',
        'personal.soft.empathy': 'Empathy',
        'personal.soft.responsibility': 'Responsibility',
        'personal.soft.conflictResolution': 'Conflict resolution',
        
        'personal.power.title': 'Power Skills',
        'personal.power.analytical': 'Analytical thinking',
        'personal.power.critical': 'Critical thinking',
        'personal.power.learning': 'Continuous learning',
        'personal.power.innovation': 'Innovation',
        'personal.power.strategic': 'Strategic thinking',
        'personal.power.decision': 'Decision making',
        'personal.power.networking': 'Networking',
        'personal.power.negotiation': 'Negotiation',
        
        // Additional texts
        'personal.power.automation': 'Process automation',
        'personal.power.techInnovation': 'Technological innovation',
        'personal.power.mentoring': 'Mentoring and teaching',
        'contact.viewOnGitHub': 'View on GitHub',
        'projects.public': 'Public Projects',
      }
    }

    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

