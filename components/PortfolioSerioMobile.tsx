'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useLanguage } from './LanguageContext'

const SECTIONS = [
  { id: 'inicio', nameKey: 'nav.home' },
  { id: 'habilidades', nameKey: 'nav.skills' },
  { id: 'proyectos', nameKey: 'nav.projects' },
  { id: 'contacto', nameKey: 'nav.contact' },
]

export default function PortfolioSerioMobile() {
  // Estados básicos
  const [showNav, setShowNav] = useState(false)
  const [activeSection, setActiveSection] = useState('inicio')
  const [yearsExperience, setYearsExperience] = useState(2)
  const [publicRepos, setPublicRepos] = useState(0)
  const [githubProjects, setGithubProjects] = useState<Array<{
    name: string
    description: string | null
    html_url: string
    language: string | null
    stargazers_count: number
    updated_at: string
  }>>([])
  const [selectedProject, setSelectedProject] = useState<{
    name: string
    description: string | null
    html_url: string
    language: string | null
    stargazers_count: number
    updated_at: string
  } | null>(null)
  const [skillsView, setSkillsView] = useState<'technical' | 'personal'>('technical')
  
  // Hooks
  const { t, language } = useLanguage()
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({})

  // Traducciones memoizadas
  const translations = useMemo(() => {
    if (!t) return {}
    return {
      navHome: t('nav.home') || '',
      navSkills: t('nav.skills') || '',
      navProjects: t('nav.projects') || '',
      navContact: t('nav.contact') || '',
      homeLocation: t('home.location') || '',
      homeDescription: t('home.description') || '',
      skillsTitle: t('skills.title') || '',
      skillsTechnical: t('skills.technical') || '',
      skillsPersonal: t('skills.personal') || '',
      softSkillsTitle: t('personal.soft.title') || '',
      powerSkillsTitle: t('personal.power.title') || '',
      projectsTitle: t('projects.title') || '',
      contactTitle: t('contact.title') || '',
      contactDescription: t('contact.description') || '',
      contactEmail: t('contact.email') || '',
      contactWhatsApp: t('contact.whatsapp') || '',
      contactGitHub: t('contact.github') || '',
      statsProjects: t('stats.projects') || '',
      statsExperience: t('stats.experience') || '',
      projectsLoading: t('projects.loading') || '',
      contactViewOnGitHub: t('contact.viewOnGitHub') || '',
      softSkills: [
        t('personal.soft.responsibility') || '',
        t('personal.soft.timeManagement') || '',
        t('personal.soft.communication') || '',
        t('personal.soft.conflictResolution') || '',
        t('personal.soft.adaptability') || '',
      ],
      powerSkills: [
        t('personal.soft.responsibility') || '',
        t('personal.soft.timeManagement') || '',
        t('personal.soft.communication') || '',
        t('personal.soft.conflictResolution') || '',
        t('personal.soft.adaptability') || '',
      ],
    }
  }, [t, language])

  const technicalSkills = ['Python', 'Java', 'Next.js', 'React', 'SQL', 'MongoDB', 'Excel', 'Excel/VBA']

  // Función para obtener el color de un lenguaje de programación
  const getLanguageColor = (language: string | null): { bg: string; border: string; text: string } => {
    if (!language) {
      return {
        bg: 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(255, 255, 255, 0.1)',
        text: 'rgba(255, 255, 255, 0.5)'
      }
    }

    const languageColors: { [key: string]: { bg: string; border: string; text: string } } = {
      'JavaScript': { bg: 'rgba(247, 223, 30, 0.35)', border: 'rgba(247, 223, 30, 0.6)', text: 'rgba(247, 223, 30, 0.9)' },
      'TypeScript': { bg: 'rgba(49, 120, 198, 0.35)', border: 'rgba(49, 120, 198, 0.6)', text: 'rgba(49, 120, 198, 0.9)' },
      'Python': { bg: 'rgba(53, 114, 165, 0.35)', border: 'rgba(53, 114, 165, 0.6)', text: 'rgba(53, 114, 165, 0.9)' },
      'Java': { bg: 'rgba(255, 140, 0, 0.35)', border: 'rgba(255, 140, 0, 0.6)', text: 'rgba(255, 140, 0, 0.9)' },
      'C++': { bg: 'rgba(0, 90, 156, 0.35)', border: 'rgba(0, 90, 156, 0.6)', text: 'rgba(0, 90, 156, 0.9)' },
      'C#': { bg: 'rgba(128, 0, 128, 0.35)', border: 'rgba(128, 0, 128, 0.6)', text: 'rgba(128, 0, 128, 0.9)' },
      'PHP': { bg: 'rgba(119, 123, 180, 0.35)', border: 'rgba(119, 123, 180, 0.6)', text: 'rgba(119, 123, 180, 0.9)' },
      'Ruby': { bg: 'rgba(204, 52, 45, 0.35)', border: 'rgba(204, 52, 45, 0.6)', text: 'rgba(204, 52, 45, 0.9)' },
      'Go': { bg: 'rgba(0, 173, 216, 0.35)', border: 'rgba(0, 173, 216, 0.6)', text: 'rgba(0, 173, 216, 0.9)' },
      'Rust': { bg: 'rgba(0, 0, 0, 0.35)', border: 'rgba(255, 255, 255, 0.6)', text: 'rgba(255, 255, 255, 0.9)' },
      'Swift': { bg: 'rgba(255, 172, 50, 0.35)', border: 'rgba(255, 172, 50, 0.6)', text: 'rgba(255, 172, 50, 0.9)' },
      'Kotlin': { bg: 'rgba(127, 82, 255, 0.35)', border: 'rgba(127, 82, 255, 0.6)', text: 'rgba(127, 82, 255, 0.9)' },
      'HTML': { bg: 'rgba(227, 76, 38, 0.35)', border: 'rgba(227, 76, 38, 0.6)', text: 'rgba(227, 76, 38, 0.9)' },
      'CSS': { bg: 'rgba(38, 77, 228, 0.35)', border: 'rgba(38, 77, 228, 0.6)', text: 'rgba(38, 77, 228, 0.9)' },
      'SCSS': { bg: 'rgba(207, 100, 154, 0.35)', border: 'rgba(207, 100, 154, 0.6)', text: 'rgba(207, 100, 154, 0.9)' },
      'SASS': { bg: 'rgba(207, 100, 154, 0.35)', border: 'rgba(207, 100, 154, 0.6)', text: 'rgba(207, 100, 154, 0.9)' },
      'React': { bg: 'rgba(97, 218, 251, 0.35)', border: 'rgba(97, 218, 251, 0.6)', text: 'rgba(97, 218, 251, 0.9)' },
      'Vue': { bg: 'rgba(65, 184, 131, 0.35)', border: 'rgba(65, 184, 131, 0.6)', text: 'rgba(65, 184, 131, 0.9)' },
      'Angular': { bg: 'rgba(221, 0, 49, 0.35)', border: 'rgba(221, 0, 49, 0.6)', text: 'rgba(221, 0, 49, 0.9)' },
      'Node.js': { bg: 'rgba(104, 160, 99, 0.35)', border: 'rgba(104, 160, 99, 0.6)', text: 'rgba(104, 160, 99, 0.9)' },
      'Next.js': { bg: 'rgba(0, 0, 0, 0.35)', border: 'rgba(255, 255, 255, 0.6)', text: 'rgba(255, 255, 255, 0.9)' },
      'SQL': { bg: 'rgba(0, 122, 204, 0.35)', border: 'rgba(0, 122, 204, 0.6)', text: 'rgba(0, 122, 204, 0.9)' },
      'MongoDB': { bg: 'rgba(77, 194, 71, 0.35)', border: 'rgba(77, 194, 71, 0.6)', text: 'rgba(77, 194, 71, 0.9)' },
      'Shell': { bg: 'rgba(137, 224, 81, 0.35)', border: 'rgba(137, 224, 81, 0.6)', text: 'rgba(137, 224, 81, 0.9)' },
      'PowerShell': { bg: 'rgba(1, 36, 86, 0.35)', border: 'rgba(1, 36, 86, 0.6)', text: 'rgba(1, 36, 86, 0.9)' },
      'Dart': { bg: 'rgba(0, 180, 171, 0.35)', border: 'rgba(0, 180, 171, 0.6)', text: 'rgba(0, 180, 171, 0.9)' },
      'Lua': { bg: 'rgba(0, 0, 128, 0.35)', border: 'rgba(0, 0, 128, 0.6)', text: 'rgba(0, 0, 128, 0.9)' },
      'Perl': { bg: 'rgba(0, 0, 152, 0.35)', border: 'rgba(0, 0, 152, 0.6)', text: 'rgba(0, 0, 152, 0.9)' },
      'R': { bg: 'rgba(25, 118, 210, 0.35)', border: 'rgba(25, 118, 210, 0.6)', text: 'rgba(25, 118, 210, 0.9)' },
      'MATLAB': { bg: 'rgba(237, 33, 100, 0.35)', border: 'rgba(237, 33, 100, 0.6)', text: 'rgba(237, 33, 100, 0.9)' },
      'Scala': { bg: 'rgba(220, 20, 60, 0.35)', border: 'rgba(220, 20, 60, 0.6)', text: 'rgba(220, 20, 60, 0.9)' },
      'Haskell': { bg: 'rgba(94, 80, 134, 0.35)', border: 'rgba(94, 80, 134, 0.6)', text: 'rgba(94, 80, 134, 0.9)' },
      'Elixir': { bg: 'rgba(110, 74, 126, 0.35)', border: 'rgba(110, 74, 126, 0.6)', text: 'rgba(110, 74, 126, 0.9)' },
      'Clojure': { bg: 'rgba(91, 173, 99, 0.35)', border: 'rgba(91, 173, 99, 0.6)', text: 'rgba(91, 173, 99, 0.9)' },
      'Erlang': { bg: 'rgba(168, 26, 0, 0.35)', border: 'rgba(168, 26, 0, 0.6)', text: 'rgba(168, 26, 0, 0.9)' },
      'Julia': { bg: 'rgba(158, 112, 196, 0.35)', border: 'rgba(158, 112, 196, 0.6)', text: 'rgba(158, 112, 196, 0.9)' },
      'Dockerfile': { bg: 'rgba(13, 183, 216, 0.35)', border: 'rgba(13, 183, 216, 0.6)', text: 'rgba(13, 183, 216, 0.9)' },
      'YAML': { bg: 'rgba(203, 32, 39, 0.35)', border: 'rgba(203, 32, 39, 0.6)', text: 'rgba(203, 32, 39, 0.9)' },
      'JSON': { bg: 'rgba(41, 41, 41, 0.35)', border: 'rgba(255, 255, 255, 0.6)', text: 'rgba(255, 255, 255, 0.9)' },
      'Markdown': { bg: 'rgba(255, 255, 255, 0.35)', border: 'rgba(255, 255, 255, 0.6)', text: 'rgba(255, 255, 255, 0.9)' },
      'TSX': { bg: 'rgba(49, 120, 198, 0.35)', border: 'rgba(49, 120, 198, 0.6)', text: 'rgba(49, 120, 198, 0.9)' },
      'JSX': { bg: 'rgba(247, 223, 30, 0.35)', border: 'rgba(247, 223, 30, 0.6)', text: 'rgba(247, 223, 30, 0.9)' },
      'Excel': { bg: 'rgba(46, 125, 50, 0.35)', border: 'rgba(46, 125, 50, 0.6)', text: 'rgba(46, 125, 50, 0.9)' },
      'Excel/VBA': { bg: 'rgba(156, 39, 176, 0.35)', border: 'rgba(156, 39, 176, 0.6)', text: 'rgba(156, 39, 176, 0.9)' },
      'VBA': { bg: 'rgba(156, 39, 176, 0.35)', border: 'rgba(156, 39, 176, 0.6)', text: 'rgba(156, 39, 176, 0.9)' },
    }

    return languageColors[language] || {
      bg: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.1)',
      text: 'rgba(255, 255, 255, 0.5)'
    }
  }

  // Scroll handler
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      const scroll = window.scrollY || 0
      setShowNav(scroll > 100)

      const sections = SECTIONS.map((s) => sectionsRef.current[s.id]).filter(Boolean)
      for (const section of sections) {
        if (!section) continue
        const rect = section.getBoundingClientRect()
        if (rect.top <= 100 && rect.bottom >= 100) {
          const sectionId = SECTIONS.find((s) => sectionsRef.current[s.id] === section)?.id
          if (sectionId) {
            setActiveSection(sectionId)
            break
          }
        }
      }
    }

    const timeoutId = setTimeout(() => {
      handleScroll()
    }, 100)

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Calcular años de experiencia
  useEffect(() => {
    const calculateYears = () => {
      const startDate = new Date()
      startDate.setFullYear(startDate.getFullYear() - 2)
      const today = new Date()
      const diffTime = today.getTime() - startDate.getTime()
      const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25)
      setYearsExperience(Math.max(2, Math.floor(diffYears)))
    }
    
    calculateYears()
    const interval = setInterval(calculateYears, 1000 * 60 * 60 * 24)
    return () => clearInterval(interval)
  }, [])

  // Obtener datos de GitHub
  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        const userResponse = await fetch('https://api.github.com/users/Stefanodmm')
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setPublicRepos(userData.public_repos || 0)
        }

        const reposResponse = await fetch('https://api.github.com/users/Stefanodmm/repos?sort=updated&per_page=100')
        if (reposResponse.ok) {
          const reposData = await reposResponse.json()
          const shuffled = [...reposData].sort(() => 0.5 - Math.random())
          const selected = shuffled.slice(0, 6)
          setGithubProjects(selected)
        }
      } catch (error) {
        console.error('Error obteniendo datos de GitHub:', error)
        setPublicRepos(15)
      }
    }
    
    fetchGitHubData()
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = sectionsRef.current[sectionId]
    if (element) {
      // Calcular offset para compensar la navegación fija
      const navHeight = 60
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - navHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000000',
        color: '#FFFFFF',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Efecto de iluminación alrededor de la ventana */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: `
            inset 0 0 60px rgba(255, 255, 255, 0.03),
            inset 0 0 90px rgba(255, 255, 255, 0.02),
            inset 0 0 0 1px rgba(255, 255, 255, 0.05)
          `,
        }}
      />
      
      {/* Bordes luminosos individuales */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
          zIndex: 9998,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
          zIndex: 9998,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '2px',
          background: 'linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
          zIndex: 9998,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '2px',
          background: 'linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
          zIndex: 9998,
          pointerEvents: 'none',
        }}
      />
      {/* Navegación simple - solo texto */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: showNav ? '#000000' : 'transparent',
          padding: '12px 15px',
          borderBottom: showNav ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          {SECTIONS.map((section) => {
            const sectionNames: { [key: string]: string } = {
              'inicio': translations.navHome || '',
              'habilidades': translations.navSkills || '',
              'proyectos': translations.navProjects || '',
              'contacto': translations.navContact || '',
            }
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: activeSection === section.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                  fontSize: '10px',
                  fontWeight: activeSection === section.id ? 'bold' : 'normal',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  opacity: showNav ? 1 : 0,
                }}
              >
                {sectionNames[section.id]}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Sección Inicio - solo texto */}
      <section
        id="inicio"
        ref={(el) => {
          sectionsRef.current['inicio'] = el
        }}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px 40px 20px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(2rem, 8vw, 3.5rem)',
            marginBottom: '20px',
            fontWeight: '300',
            letterSpacing: '3px',
            fontFamily: 'Inter, sans-serif',
            color: '#FFFFFF',
          }}
        >
          STEFANO DI MICHELANGELO
        </h1>
        <p
          style={{
            fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '30px',
            letterSpacing: '1px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {translations.homeLocation}
        </p>
        <p
          style={{
            fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
            color: '#FFFFFF',
            maxWidth: '90%',
            lineHeight: '1.7',
            fontWeight: '300',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.3px',
            textAlign: 'justify',
          }}
        >
          {translations.homeDescription}
        </p>
      </section>

      {/* Sección Habilidades - solo texto */}
      <section
        id="habilidades"
        ref={(el) => {
          sectionsRef.current['habilidades'] = el
        }}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 15px',
        }}
      >
        <div
          style={{
            maxWidth: '100%',
            textAlign: 'center',
            color: '#FFFFFF',
            width: '100%',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 6vw, 3rem)',
              marginBottom: '40px',
              fontWeight: '300',
              letterSpacing: '3px',
              fontFamily: 'Inter, sans-serif',
              color: '#FFFFFF',
            }}
          >
            {translations.skillsTitle}
          </h2>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '40px',
            gap: '12px',
          }}>
            <button
              onClick={() => setSkillsView('technical')}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid #FFFFFF',
                borderRadius: '4px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: '300',
                letterSpacing: '1px',
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                minWidth: '90px',
                outline: 'none',
              }}
            >
              {translations.skillsTechnical}
            </button>
            <button
              onClick={() => setSkillsView('personal')}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid #FFFFFF',
                borderRadius: '4px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: '300',
                letterSpacing: '1px',
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                minWidth: '90px',
                outline: 'none',
              }}
            >
              {translations.skillsPersonal}
            </button>
          </div>

          <div style={{ minHeight: '400px' }}>
            {skillsView === 'technical' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  width: '100%',
                  maxWidth: '500px',
                  margin: '0 auto',
                }}
              >
                {technicalSkills.map((skill) => {
                  const displayName = skill === 'Excel/VBA' ? 'VBA' : skill
                  const colors = getLanguageColor(skill)
                  return (
                    <div
                      key={skill}
                      style={{
                        padding: '18px 12px',
                        background: 'transparent',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '70px',
                      }}
                    >
                      <h3 style={{ 
                        fontSize: '0.9rem', 
                        margin: 0,
                        fontWeight: '300',
                        letterSpacing: '0.5px',
                        fontFamily: 'Inter, sans-serif',
                        color: '#FFFFFF',
                        textAlign: 'center',
                        width: '100%',
                      }}>
                        {displayName}
                      </h3>
                    </div>
                  )
                })}
              </div>
            )}

            {skillsView === 'personal' && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                  maxWidth: '500px',
                  margin: '0 auto',
                }}
              >
                <div
                  style={{
                    padding: '20px 15px',
                    background: 'transparent',
                    border: '1px solid #FFFFFF',
                    borderRadius: '4px',
                    width: '100%',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      margin: '0 0 18px 0',
                      fontWeight: '300',
                      letterSpacing: '1px',
                      fontFamily: 'Inter, sans-serif',
                      textAlign: 'center',
                      color: '#FFFFFF',
                    }}
                  >
                    {translations.powerSkillsTitle}
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {(translations.powerSkills || []).map((skill, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '10px 12px',
                          background: 'transparent',
                          border: '1px solid #FFFFFF',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: '300',
                          letterSpacing: '0.5px',
                          fontFamily: 'Inter, sans-serif',
                          color: '#FFFFFF',
                          textAlign: 'center',
                        }}
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sección Proyectos - solo texto */}
      <section
        id="proyectos"
        ref={(el) => {
          sectionsRef.current['proyectos'] = el
        }}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 15px',
        }}
      >
        <div
          style={{
            maxWidth: '100%',
            textAlign: 'center',
            width: '100%',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 6vw, 3rem)',
              marginBottom: '40px',
              fontWeight: '300',
              letterSpacing: '3px',
              fontFamily: 'Inter, sans-serif',
              color: '#FFFFFF',
            }}
          >
            {translations.projectsTitle}
          </h2>

          {githubProjects.length === 0 ? (
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
              {translations.projectsLoading}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '20px',
                maxWidth: '500px',
                margin: '0 auto',
              }}
            >
              {githubProjects.map((project) => (
                <div
                  key={project.name}
                  onClick={() => setSelectedProject(project)}
                  style={{
                    padding: '20px',
                    background: 'transparent',
                    border: '1px solid #FFFFFF',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1rem',
                      margin: '0 0 10px 0',
                      fontWeight: '400',
                      color: '#FFFFFF',
                      textAlign: 'left',
                    }}
                  >
                    {project.name}
                  </h3>
                  {project.description && (
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        margin: '0 0 10px 0',
                        textAlign: 'left',
                        lineHeight: '1.5',
                      }}
                    >
                      {project.description}
                    </p>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '10px',
                    }}
                  >
                    {project.language && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#FFFFFF',
                          padding: '4px 8px',
                          background: 'transparent',
                          borderRadius: '4px',
                          border: '1px solid #FFFFFF',
                        }}
                      >
                        {project.language}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                      }}
                    >
                      ⭐ {project.stargazers_count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sección Contacto - solo texto */}
      <section
        id="contacto"
        ref={(el) => {
          sectionsRef.current['contacto'] = el
        }}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 15px',
        }}
      >
        <div
          style={{
            maxWidth: '100%',
            textAlign: 'center',
            width: '100%',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 6vw, 3rem)',
              marginBottom: '20px',
              fontWeight: '300',
              letterSpacing: '3px',
              fontFamily: 'Inter, sans-serif',
              color: '#FFFFFF',
            }}
          >
            {translations.contactTitle}
          </h2>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '40px',
              maxWidth: '90%',
              margin: '0 auto 40px auto',
            }}
          >
            {translations.contactDescription}
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxWidth: '400px',
              margin: '0 auto',
            }}
          >
            <a
              href="mailto:stefanodmm@gmail.com"
              style={{
                padding: '15px 20px',
                background: 'transparent',
                borderRadius: '4px',
                border: '1px solid #FFFFFF',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontSize: '0.9rem',
              }}
            >
              {translations.contactEmail}: stefanodmm@gmail.com
            </a>
            <a
              href="https://wa.me/584123456789"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '15px 20px',
                background: 'transparent',
                borderRadius: '4px',
                border: '1px solid #FFFFFF',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontSize: '0.9rem',
              }}
            >
              {translations.contactWhatsApp}
            </a>
            <a
              href="https://github.com/Stefanodmm"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '15px 20px',
                background: 'transparent',
                borderRadius: '4px',
                border: '1px solid #FFFFFF',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontSize: '0.9rem',
              }}
            >
              {translations.contactGitHub}
            </a>
          </div>
        </div>
      </section>

      {/* Modal de Proyecto - solo texto */}
      {selectedProject && (
        <div
          onClick={() => setSelectedProject(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'transparent',
              borderRadius: '8px',
              padding: '25px',
              maxWidth: '90%',
              border: '1px solid #FFFFFF',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setSelectedProject(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '24px',
                cursor: 'pointer',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
            <h3
              style={{
                fontSize: '1.3rem',
                margin: '0 0 15px 0',
                color: '#FFFFFF',
              }}
            >
              {selectedProject.name}
            </h3>
            {selectedProject.description && (
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '20px',
                  lineHeight: '1.6',
                }}
              >
                {selectedProject.description}
              </p>
            )}
            <a
              href={selectedProject.html_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '12px 20px',
                background: 'transparent',
                borderRadius: '4px',
                border: '1px solid #FFFFFF',
                color: '#FFFFFF',
                textDecoration: 'none',
                textAlign: 'center',
                fontSize: '0.9rem',
                display: 'block',
              }}
            >
              {translations.contactViewOnGitHub}
            </a>
          </div>
        </div>
      )}

      {/* Lengueta con información - estática */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          pointerEvents: 'none',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.4)',
            borderTop: '1px solid rgba(255, 255, 255, 0.5)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.5)',
            borderRight: '1px solid rgba(255, 255, 255, 0.5)',
            borderBottom: 'none',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            padding: '10px 15px 15px 15px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '30px',
            width: '100%',
            maxWidth: '100%',
          }}
        >
          {/* Proyectos */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: '300',
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '1px',
              }}
            >
              {publicRepos || '...'}
            </div>
            <div
              style={{
                fontSize: '0.6rem',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '300',
                textAlign: 'center',
              }}
            >
              {translations.statsProjects}
            </div>
          </div>

          {/* Años de Experiencia */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: '300',
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '1px',
              }}
            >
              {yearsExperience}+
            </div>
            <div
              style={{
                fontSize: '0.6rem',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '300',
                textAlign: 'center',
                lineHeight: '1.4',
              }}
            >
              {translations.statsExperience}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
