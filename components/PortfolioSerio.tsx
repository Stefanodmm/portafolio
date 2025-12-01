'use client'

import { useEffect, useState, useRef, useMemo, useLayoutEffect } from 'react'
import { useLanguage } from './LanguageContext'
import PortfolioSerioMobile from './PortfolioSerioMobile'

// Constantes de breakpoints para responsive design
const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP_SMALL: 1200,
  DESKTOP_MEDIUM: 1400,
} as const

const SECTIONS = [
  { id: 'inicio', nameKey: 'nav.home' },
  { id: 'habilidades', nameKey: 'nav.skills' },
  { id: 'proyectos', nameKey: 'nav.projects' },
  { id: 'contacto', nameKey: 'nav.contact' },
]

export default function PortfolioSerio() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const [showNav, setShowNav] = useState(false)
  const [activeSection, setActiveSection] = useState('inicio')
  const [backgroundHue, setBackgroundHue] = useState(240) // Color base del fondo
  const [pageHeight, setPageHeight] = useState(0)
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 }) // Valores por defecto para SSR
  const [isMobile, setIsMobile] = useState(() => {
    // Detectar móvil desde el inicio si estamos en el cliente
    if (typeof window !== 'undefined') {
      return window.innerWidth <= BREAKPOINTS.MOBILE
    }
    return false
  })
  const [spaceshipPos, setSpaceshipPos] = useState({ x: 0, y: 0 })
  const [spaceshipRotation, setSpaceshipRotation] = useState(0)
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
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)
  const [contactForm, setContactForm] = useState({ name: '', contactInfo: '', countryCode: '', phoneNumber: '', message: '' })
  const [contactType, setContactType] = useState<'whatsapp' | 'email'>('whatsapp')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [hoveredContact, setHoveredContact] = useState<'email' | 'whatsapp' | 'github' | null>(null)
  const [copiedContact, setCopiedContact] = useState<'email' | 'whatsapp' | 'github' | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const contactButtonsRef = useRef<{ [key: string]: HTMLElement | null }>({})
  const { t, language } = useLanguage()
  
  // Guardar todas las traducciones usando useMemo para evitar problemas con hooks
  const skillsTitle = useMemo(() => t('skills.title') || '', [t, language])
  const softSkills = useMemo(() => [
    t('personal.soft.responsibility'),
    t('personal.soft.timeManagement'),
    t('personal.soft.communication'),
    t('personal.soft.conflictResolution'),
    t('personal.soft.adaptability'),
  ], [t, language])
  const powerSkills = useMemo(() => [
    t('personal.soft.responsibility'),
    t('personal.soft.timeManagement'),
    t('personal.soft.communication'),
    t('personal.soft.conflictResolution'),
    t('personal.soft.adaptability'),
  ], [t, language])
  
  // Funciones helper para colores (siempre modo oscuro)
  const getBackgroundColor = () => '#000000'
  const getTextColor = () => '#FFFFFF'
  const getTextColorSecondary = () => 'rgba(255, 255, 255, 0.6)'
  const getOverlayColor = (opacity: number) => `rgba(255, 255, 255, ${opacity})`
  const getTextShadow = () => '3px 3px 6px rgba(0, 0, 0, 0.9)'
  const getBorderWidth = (baseWidth: number = 1) => baseWidth
  const getBorderStyle = (opacity: number) => {
    const borderWidth = getBorderWidth(1)
    return `${borderWidth}px solid ${getOverlayColor(opacity)}`
  }
  const getBoxShadow = (glowColor?: string) => {
    return glowColor ? `0 0 30px ${glowColor}, 0 0 60px ${glowColor}, inset 0 0 20px ${glowColor}` : 'none'
  }
  const getModalBackground = () => 'rgba(0, 0, 0, 0.85)'
  const getLanguageColorAdjusted = (color: string) => color
  
  // Velocidades de parallax para cada capa (multiplicador del scroll)
  // Capa 3 (fondo): 0.1x - muy lenta
  // Capa 2 (decoraciones): 0.3x - lenta
  // Capa 1 (texto): 1x - normal
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({})

  // Detectar móvil y actualizar cuando cambie el tamaño de la ventana
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    
    const checkMobile = () => {
      // Usar innerWidth para obtener el ancho real del viewport
      const width = window.innerWidth || window.document.documentElement.clientWidth
      const mobile = width <= BREAKPOINTS.MOBILE
      // Usar setTimeout para evitar actualizar el estado durante el render
      setTimeout(() => {
        setIsMobile(prev => {
          // Solo actualizar si cambió para evitar re-renders innecesarios
          if (prev !== mobile) {
            return mobile
          }
          return prev
        })
      }, 0)
    }
    
    // Ejecutar inmediatamente
    checkMobile()
    
    // Escuchar cambios de tamaño - usar debounce para evitar demasiadas actualizaciones
    let timeoutId: NodeJS.Timeout | null = null
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(checkMobile, 100) // Debounce de 100ms
    }
    
    window.addEventListener('resize', handleResize, { passive: true })
    // También escuchar orientationchange para móviles
    window.addEventListener('orientationchange', checkMobile, { passive: true })
    
    // Escuchar cambios en el media query para mayor precisión
    let mediaQuery: MediaQueryList | null = null
    let handleMediaChange: ((e: MediaQueryListEvent | MediaQueryList) => void) | null = null
    
    if (window.matchMedia) {
      mediaQuery = window.matchMedia(`(max-width: ${BREAKPOINTS.MOBILE}px)`)
      handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
        const mobile = e.matches
        // Usar setTimeout para evitar actualizar el estado durante el render
        setTimeout(() => {
          setIsMobile(mobile)
        }, 0)
      }
      // Usar addListener para compatibilidad con navegadores antiguos
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleMediaChange)
      } else if (mediaQuery.addListener) {
        // Fallback para navegadores antiguos
        mediaQuery.addListener(handleMediaChange)
      }
      // Ejecutar inmediatamente
      handleMediaChange(mediaQuery)
    }
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', checkMobile)
      if (timeoutId) clearTimeout(timeoutId)
      if (mediaQuery && handleMediaChange) {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleMediaChange)
        } else if (mediaQuery.removeListener) {
          mediaQuery.removeListener(handleMediaChange)
        }
      }
    }
  }, [])

  useEffect(() => {
    const updatePageHeight = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth
        const height = window.innerHeight
        const calculatedHeight = Math.max(
          document.documentElement.scrollHeight,
          height * 10 // Mínimo 10 pantallas de altura para evitar vacíos
        )
        setPageHeight(calculatedHeight)
        setWindowSize({ width, height })
        // NO actualizar isMobile aquí, ya se maneja en useLayoutEffect
      }
    }
    
    // Ejecutar inmediatamente
    if (typeof window !== 'undefined') {
      updatePageHeight()
      window.addEventListener('resize', updatePageHeight)
      // Actualizar cuando cambie el contenido
      const observer = new MutationObserver(updatePageHeight)
      observer.observe(document.body, { childList: true, subtree: true })
      return () => {
        window.removeEventListener('resize', updatePageHeight)
        observer.disconnect()
      }
    }
  }, [])

  // Mover la nave espacial aleatoriamente
  useEffect(() => {
      if (typeof window === 'undefined') return
      
    // Función para obtener una esquina aleatoria
    const getRandomCorner = () => {
      const corners = [
        { x: 0, y: 0 }, // Esquina superior izquierda
        { x: window.innerWidth, y: 0 }, // Esquina superior derecha
        { x: 0, y: window.innerHeight }, // Esquina inferior izquierda
        { x: window.innerWidth, y: window.innerHeight }, // Esquina inferior derecha
      ]
      return corners[Math.floor(Math.random() * corners.length)]
    }

    const moveSpaceship = () => {
      // Empezar desde una esquina aleatoria
      const startCorner = getRandomCorner()
      setSpaceshipPos({ x: startCorner.x, y: startCorner.y })
      
      // Mover a una posición aleatoria después de un breve delay
      setTimeout(() => {
        const newX = Math.random() * window.innerWidth
        const newY = Math.random() * window.innerHeight
        
        // Calcular el ángulo de rotación basado en la dirección del movimiento
        const angle = Math.atan2(newY - startCorner.y, newX - startCorner.x) * (180 / Math.PI)
        setSpaceshipRotation(angle)
        
        setSpaceshipPos({ x: newX, y: newY })
      }, 200)
    }

    // Mover inicialmente desde una esquina
    const initialCorner = getRandomCorner()
    setSpaceshipPos({ x: initialCorner.x, y: initialCorner.y })

    // Mover cada 8-15 segundos aleatoriamente
    const interval = setInterval(() => {
      moveSpaceship()
    }, 8000 + Math.random() * 7000)

    return () => clearInterval(interval)
  }, [windowSize])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    let rafId: number | null = null
    let ticking = false

    const updateScroll = () => {
      if (typeof window === 'undefined') return
      
      // Obtener el scroll
      const scroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
      setScrollY(scroll)
      setShowNav(scroll > 100)

      // Calcular el progreso del scroll (0 a 1)
      const windowHeight = window.innerHeight || windowSize.height
      const documentHeight = document.documentElement.scrollHeight
      const maxScroll = Math.max(documentHeight - windowHeight, windowHeight * 3)
      const scrollProgress = Math.min(Math.max(scroll / maxScroll, 0), 1)
      
      // Cambiar el tono del fondo según el scroll
      setBackgroundHue(240 - (scrollProgress * 100)) // De azul a otros colores

      // Determinar sección activa
      const sections = SECTIONS.map((s) => sectionsRef.current[s.id])
      const current = sections.find((section) => {
        if (!section) return false
        const rect = section.getBoundingClientRect()
        return rect.top <= 150 && rect.bottom >= 150
      })

      if (current) {
        const sectionId = SECTIONS.find((s) => sectionsRef.current[s.id] === current)?.id
        if (sectionId) setActiveSection(sectionId)
      }
      
      ticking = false
    }

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(updateScroll)
        ticking = true
      }
    }

    // Ejecutar una vez al inicio
    if (typeof window !== 'undefined') {
      updateScroll()
      
      // Agregar listeners optimizados con requestAnimationFrame
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('wheel', handleScroll, { passive: true })
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('wheel', handleScroll)
        if (rafId !== null) {
          cancelAnimationFrame(rafId)
      }
    }
    }
  }, [windowSize])

  // Calcular años de experiencia desde hace 2 años
  useEffect(() => {
    const calculateYears = () => {
      const startDate = new Date()
      startDate.setFullYear(startDate.getFullYear() - 2) // Fecha de inicio: hace 2 años
      const today = new Date()
      const diffTime = today.getTime() - startDate.getTime()
      const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25)
      // Mostrar los años transcurridos (redondeado hacia abajo, mínimo 2)
      setYearsExperience(Math.max(2, Math.floor(diffYears)))
    }

    calculateYears()
    // Actualizar cada día para que se actualice cuando pase un año completo
    const interval = setInterval(calculateYears, 1000 * 60 * 60 * 24) // Cada día
    return () => clearInterval(interval)
  }, [])

  // Obtener número de repositorios públicos de GitHub y proyectos
  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        // Obtener información del usuario
        const userResponse = await fetch('https://api.github.com/users/Stefanodmm')
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setPublicRepos(userData.public_repos || 0)
        }

        // Obtener repositorios públicos
        const reposResponse = await fetch('https://api.github.com/users/Stefanodmm/repos?sort=updated&per_page=100')
        if (reposResponse.ok) {
          const reposData = await reposResponse.json()
          // Seleccionar 6 proyectos aleatorios
          const shuffled = reposData.sort(() => 0.5 - Math.random())
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

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  // Si es móvil, renderizar versión móvil completa (después de todos los hooks)
  if (isMobile) {
    return <PortfolioSerioMobile />
  }

  // Calcular breakpoints responsive basados en el tamaño de la ventana
  const responsive = useMemo(() => {
    const width = windowSize.width
    return {
      isSmallScreen: width <= BREAKPOINTS.TABLET,
      isMediumScreen: width <= BREAKPOINTS.DESKTOP_MEDIUM,
      showDecorations: width > BREAKPOINTS.TABLET,
      showParallax: width > BREAKPOINTS.DESKTOP_SMALL,
      showSpaceship: width > BREAKPOINTS.DESKTOP_SMALL,
      maxProjectsToShow: 6,
    }
  }, [windowSize.width])

  const scrollToSection = (sectionId: string) => {
    const element = sectionsRef.current[sectionId]
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Función para copiar al portapapeles
  const copyToClipboard = async (text: string, type: 'email' | 'whatsapp' | 'github') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedContact(type)
      setTimeout(() => {
        setCopiedContact(null)
      }, 2000)
    } catch (err) {
      console.error('Error al copiar:', err)
    }
  }

  // Información de contacto
  const contactInfo = {
    email: 'SDMM.777@proton.me',
    whatsapp: '+584123456789',
    github: '@Stefanodmm',
  }

  // Cerrar panel de contacto al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hoveredContact && contactButtonsRef.current[hoveredContact]) {
        const buttonElement = contactButtonsRef.current[hoveredContact]
        const panelElement = document.querySelector(`[data-contact-panel="${hoveredContact}"]`)
        
        if (buttonElement && panelElement) {
          const target = event.target as Node
          if (!buttonElement.contains(target) && !panelElement.contains(target)) {
            setHoveredContact(null)
          }
        }
      }
    }

    if (hoveredContact) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [hoveredContact])

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
      'JavaScript': { bg: 'rgba(247, 223, 30, 0.15)', border: 'rgba(247, 223, 30, 0.3)', text: 'rgba(247, 223, 30, 0.9)' },
      'TypeScript': { bg: 'rgba(49, 120, 198, 0.15)', border: 'rgba(49, 120, 198, 0.3)', text: 'rgba(49, 120, 198, 0.9)' },
      'Python': { bg: 'rgba(53, 114, 165, 0.15)', border: 'rgba(53, 114, 165, 0.3)', text: 'rgba(53, 114, 165, 0.9)' },
      'Java': { bg: 'rgba(255, 140, 0, 0.15)', border: 'rgba(255, 140, 0, 0.3)', text: 'rgba(255, 140, 0, 0.9)' },
      'C++': { bg: 'rgba(0, 90, 156, 0.15)', border: 'rgba(0, 90, 156, 0.3)', text: 'rgba(0, 90, 156, 0.9)' },
      'C#': { bg: 'rgba(128, 0, 128, 0.15)', border: 'rgba(128, 0, 128, 0.3)', text: 'rgba(128, 0, 128, 0.9)' },
      'PHP': { bg: 'rgba(119, 123, 180, 0.15)', border: 'rgba(119, 123, 180, 0.3)', text: 'rgba(119, 123, 180, 0.9)' },
      'Ruby': { bg: 'rgba(204, 52, 45, 0.15)', border: 'rgba(204, 52, 45, 0.3)', text: 'rgba(204, 52, 45, 0.9)' },
      'Go': { bg: 'rgba(0, 173, 216, 0.15)', border: 'rgba(0, 173, 216, 0.3)', text: 'rgba(0, 173, 216, 0.9)' },
      'Rust': { bg: 'rgba(0, 0, 0, 0.15)', border: 'rgba(255, 255, 255, 0.3)', text: 'rgba(255, 255, 255, 0.9)' },
      'Swift': { bg: 'rgba(255, 172, 50, 0.15)', border: 'rgba(255, 172, 50, 0.3)', text: 'rgba(255, 172, 50, 0.9)' },
      'Kotlin': { bg: 'rgba(127, 82, 255, 0.15)', border: 'rgba(127, 82, 255, 0.3)', text: 'rgba(127, 82, 255, 0.9)' },
      'HTML': { bg: 'rgba(227, 76, 38, 0.15)', border: 'rgba(227, 76, 38, 0.3)', text: 'rgba(227, 76, 38, 0.9)' },
      'CSS': { bg: 'rgba(38, 77, 228, 0.15)', border: 'rgba(38, 77, 228, 0.3)', text: 'rgba(38, 77, 228, 0.9)' },
      'SCSS': { bg: 'rgba(207, 100, 154, 0.15)', border: 'rgba(207, 100, 154, 0.3)', text: 'rgba(207, 100, 154, 0.9)' },
      'SASS': { bg: 'rgba(207, 100, 154, 0.15)', border: 'rgba(207, 100, 154, 0.3)', text: 'rgba(207, 100, 154, 0.9)' },
      'React': { bg: 'rgba(97, 218, 251, 0.15)', border: 'rgba(97, 218, 251, 0.3)', text: 'rgba(97, 218, 251, 0.9)' },
      'Vue': { bg: 'rgba(65, 184, 131, 0.15)', border: 'rgba(65, 184, 131, 0.3)', text: 'rgba(65, 184, 131, 0.9)' },
      'Angular': { bg: 'rgba(221, 0, 49, 0.15)', border: 'rgba(221, 0, 49, 0.3)', text: 'rgba(221, 0, 49, 0.9)' },
      'Node.js': { bg: 'rgba(104, 160, 99, 0.15)', border: 'rgba(104, 160, 99, 0.3)', text: 'rgba(104, 160, 99, 0.9)' },
      'SQL': { bg: 'rgba(0, 122, 204, 0.15)', border: 'rgba(0, 122, 204, 0.3)', text: 'rgba(0, 122, 204, 0.9)' },
      'MongoDB': { bg: 'rgba(77, 194, 71, 0.15)', border: 'rgba(77, 194, 71, 0.3)', text: 'rgba(77, 194, 71, 0.9)' },
      'Shell': { bg: 'rgba(137, 224, 81, 0.15)', border: 'rgba(137, 224, 81, 0.3)', text: 'rgba(137, 224, 81, 0.9)' },
      'PowerShell': { bg: 'rgba(1, 36, 86, 0.15)', border: 'rgba(1, 36, 86, 0.3)', text: 'rgba(1, 36, 86, 0.9)' },
      'Dart': { bg: 'rgba(0, 180, 171, 0.15)', border: 'rgba(0, 180, 171, 0.3)', text: 'rgba(0, 180, 171, 0.9)' },
      'Lua': { bg: 'rgba(0, 0, 128, 0.15)', border: 'rgba(0, 0, 128, 0.3)', text: 'rgba(0, 0, 128, 0.9)' },
      'Perl': { bg: 'rgba(0, 0, 152, 0.15)', border: 'rgba(0, 0, 152, 0.3)', text: 'rgba(0, 0, 152, 0.9)' },
      'R': { bg: 'rgba(25, 118, 210, 0.15)', border: 'rgba(25, 118, 210, 0.3)', text: 'rgba(25, 118, 210, 0.9)' },
      'MATLAB': { bg: 'rgba(237, 33, 100, 0.15)', border: 'rgba(237, 33, 100, 0.3)', text: 'rgba(237, 33, 100, 0.9)' },
      'Scala': { bg: 'rgba(220, 20, 60, 0.15)', border: 'rgba(220, 20, 60, 0.3)', text: 'rgba(220, 20, 60, 0.9)' },
      'Haskell': { bg: 'rgba(94, 80, 134, 0.15)', border: 'rgba(94, 80, 134, 0.3)', text: 'rgba(94, 80, 134, 0.9)' },
      'Elixir': { bg: 'rgba(110, 74, 126, 0.15)', border: 'rgba(110, 74, 126, 0.3)', text: 'rgba(110, 74, 126, 0.9)' },
      'Clojure': { bg: 'rgba(91, 173, 99, 0.15)', border: 'rgba(91, 173, 99, 0.3)', text: 'rgba(91, 173, 99, 0.9)' },
      'Erlang': { bg: 'rgba(168, 26, 0, 0.15)', border: 'rgba(168, 26, 0, 0.3)', text: 'rgba(168, 26, 0, 0.9)' },
      'Julia': { bg: 'rgba(158, 112, 196, 0.15)', border: 'rgba(158, 112, 196, 0.3)', text: 'rgba(158, 112, 196, 0.9)' },
      'Dockerfile': { bg: 'rgba(13, 183, 216, 0.15)', border: 'rgba(13, 183, 216, 0.3)', text: 'rgba(13, 183, 216, 0.9)' },
      'YAML': { bg: 'rgba(203, 32, 39, 0.15)', border: 'rgba(203, 32, 39, 0.3)', text: 'rgba(203, 32, 39, 0.9)' },
      'JSON': { bg: 'rgba(41, 41, 41, 0.15)', border: 'rgba(255, 255, 255, 0.3)', text: 'rgba(255, 255, 255, 0.9)' },
      'Markdown': { bg: 'rgba(255, 255, 255, 0.15)', border: 'rgba(255, 255, 255, 0.3)', text: 'rgba(255, 255, 255, 0.9)' },
      'TSX': { bg: 'rgba(49, 120, 198, 0.15)', border: 'rgba(49, 120, 198, 0.3)', text: 'rgba(49, 120, 198, 0.9)' },
      'JSX': { bg: 'rgba(247, 223, 30, 0.15)', border: 'rgba(247, 223, 30, 0.3)', text: 'rgba(247, 223, 30, 0.9)' },
      'Excel': { bg: 'rgba(46, 125, 50, 0.15)', border: 'rgba(46, 125, 50, 0.3)', text: 'rgba(46, 125, 50, 0.9)' },
      'Excel/VBA': { bg: 'rgba(156, 39, 176, 0.15)', border: 'rgba(156, 39, 176, 0.3)', text: 'rgba(156, 39, 176, 0.9)' },
    }

    return languageColors[language] || {
      bg: 'rgba(255, 255, 255, 0.12)',
      border: 'rgba(255, 255, 255, 0.2)',
      text: 'rgba(255, 255, 255, 0.8)'
    }
  }

  // Función para obtener el logo desde Simple Icons CDN o DevIcons
  const getLanguageLogo = (language: string): JSX.Element | null => {
    const size = 80
    
    // Logo genérico para Excel y VBA
    if (language === 'Excel' || language === 'Excel/VBA') {
      const excelColor = language === 'Excel' ? '#217346' : '#9C27B0'
      return (
        <div
          style={{
            width: size,
            height: size,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.85)',
            borderRadius: '12px',
            padding: '10px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <svg width={size - 20} height={size - 20} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="10" width="48" height="44" rx="4" fill={excelColor}/>
            <rect x="8" y="10" width="48" height="12" rx="4" fill={language === 'Excel' ? '#185C37' : '#6A1B9A'}/>
            <path d="M12 14h10v3H12V14zM24 14h24v3H24V14z" fill="#FFFFFF"/>
            <rect x="12" y="22" width="40" height="2" fill="#FFFFFF" opacity="0.9"/>
            <rect x="12" y="28" width="40" height="2" fill="#FFFFFF" opacity="0.9"/>
            <rect x="12" y="34" width="40" height="2" fill="#FFFFFF" opacity="0.9"/>
            <rect x="12" y="40" width="40" height="2" fill="#FFFFFF" opacity="0.9"/>
            <rect x="12" y="46" width="40" height="2" fill="#FFFFFF" opacity="0.9"/>
            {language === 'Excel/VBA' && (
              <path d="M20 50L28 54L36 50" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            )}
            <circle cx="50" cy="48" r="3" fill="#FFFFFF" opacity="0.8"/>
          </svg>
        </div>
      )
    }
    
    // Mapeo de nombres de lenguajes a URLs de iconos con múltiples opciones
    const getIconUrl = (lang: string): string | null => {
      const iconMap: { [key: string]: string[] } = {
        'Python': [`https://cdn.simpleicons.org/python/3776AB`],
        'Java': [
          `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg`,
          `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original-wordmark.svg`,
          `https://cdn.simpleicons.org/java/ED8B00`
        ],
        'React': [`https://cdn.simpleicons.org/react/61DAFB`],
        'Next.js': [`https://cdn.simpleicons.org/nextdotjs/FFFFFF`],
        'SQL': [`https://cdn.simpleicons.org/postgresql/336791`],
        'MongoDB': [`https://cdn.simpleicons.org/mongodb/47A248`],
      }
      return iconMap[lang]?.[0] || null
    }
    
    const getFallbackUrls = (lang: string): string[] => {
      const fallbackMap: { [key: string]: string[] } = {
        'Java': [
          `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg`,
          `https://cdn.simpleicons.org/java/ED8B00`
        ],
      }
      return fallbackMap[lang] || []
    }
    
    const iconUrl = getIconUrl(language)
    if (!iconUrl) return null
    
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.85)',
          borderRadius: '12px',
          padding: '10px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <img
          src={iconUrl}
          alt={`${language} logo`}
          width={size - 20}
          height={size - 20}
          style={{
            objectFit: 'contain',
          }}
          onError={(e) => {
            // Si falla la carga, intentar alternativas
            const fallbacks = getFallbackUrls(language)
            if (fallbacks.length > 0) {
              const currentSrc = e.currentTarget.src
              const triedUrls: string[] = []
              
              // Encontrar una URL que no hayamos intentado
              const nextUrl = fallbacks.find(url => {
                const urlKey = url.split('/').pop()?.split('.')[0] || ''
                const currentKey = currentSrc.split('/').pop()?.split('.')[0] || ''
                return urlKey !== currentKey && !triedUrls.includes(url)
              })
              
              if (nextUrl) {
                triedUrls.push(currentSrc)
                e.currentTarget.src = nextUrl
              } else {
                e.currentTarget.style.display = 'none'
              }
            } else {
              e.currentTarget.style.display = 'none'
            }
          }}
        />
      </div>
    )
  }




  return (
    <>
      {/* Barra de navegación superior */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: showNav 
            ? 'rgba(255, 255, 255, 0.35)'
            : 'transparent',
          backdropFilter: showNav ? 'blur(20px)' : 'none',
          padding: showNav ? (isMobile ? '12px 15px' : '15px 20px') : (isMobile ? '15px' : '20px'),
          transition: 'all 0.6s ease-out, background-color 0.6s ease',
          borderBottom: showNav 
            ? '1px solid rgba(255, 255, 255, 0.15)'
            : 'none',
          opacity: showNav ? 1 : 0,
          pointerEvents: showNav ? 'auto' : 'none',
          boxShadow: showNav 
            ? `0 8px 32px rgba(0, 0, 0, 0.4), 0 -4px 16px rgba(255, 255, 255, 0.08)`
            : 'none',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
            gap: isMobile ? '10px' : '30px',
              flexWrap: 'wrap',
            }}
          >
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                color: activeSection === section.id ? getTextColor() : getTextColorSecondary(),
                  fontSize: isMobile ? '11px' : '14px',
                fontWeight: activeSection === section.id ? 'bold' : 'normal',
                  cursor: 'pointer',
                padding: isMobile ? '6px 10px' : '8px 16px',
                borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                letterSpacing: isMobile ? '0.5px' : '1px',
                  position: 'relative',
                  opacity: showNav ? 1 : 0,
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== section.id) {
                  e.currentTarget.style.color = getTextColor()
                  e.currentTarget.style.background = getOverlayColor(0.12)
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== section.id) {
                  e.currentTarget.style.color = getTextColorSecondary()
                  e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {t(section.nameKey)}
                {activeSection === section.id && (
                  <div
                    style={{
                      position: 'absolute',
                    bottom: '4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '30px',
                      height: '2px',
                    background: `linear-gradient(90deg, transparent, ${getTextColor()}, transparent)`,
                    borderRadius: '2px',
                    }}
                  />
                )}
              </button>
            ))}
        </div>
      </nav>

      <main
        style={{
          width: '100%',
        minHeight: '100vh',
          position: 'relative',
        overflow: 'visible',
          transition: 'background-color 0.6s ease, color 0.6s ease',
        }}
    >
      {/* ============================================
          CAPA 4: COLORES DE FONDO (más atrás)
          Velocidad: 0.2x (muy lenta)
          ============================================ */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: `${Math.max(pageHeight, windowSize.height * 10, 10000)}px`,
          minHeight: '1000vh',
          zIndex: 0,
          transform: responsive.showParallax ? `translate3d(0, ${-scrollY * 0.1}px, 0)` : 'none', // Parallax - fondo sube cuando texto baja (efecto inverso)
          background: getBackgroundColor(),
          backgroundSize: '100% 1500px, 100% 100%',
          backgroundRepeat: 'repeat-y',
          willChange: responsive.showParallax ? 'transform' : 'auto',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          transformOrigin: 'center center',
          transition: 'background-color 0.6s ease',
        }}
      />
      
      {/* ============================================
          CAPA 3: DECORACIONES Y PLANETAS
          Velocidad: 0.5x (lenta)
          ============================================ */}
      {responsive.showDecorations && (
      <div
          style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: `${Math.max(pageHeight, windowSize.height * 10, 10000)}px`,
          minHeight: '1000vh',
          zIndex: 1,
          pointerEvents: 'none',
          transform: responsive.showParallax ? `translate3d(0, ${-scrollY * 0.3}px, 0)` : 'none', // Parallax - decoraciones suben cuando texto baja
          willChange: responsive.showParallax ? 'transform' : 'auto',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          transformOrigin: 'center center',
          opacity: 0, // Ocultar todas las decoraciones y planetas
          display: 'none', // Ocultar completamente
        }}
      >
        {/* Tierra/Planeta mejorado - se mueve con parallax de su capa */}
          <div
            style={{
            position: 'absolute',
            top: `${windowSize.height * 0.5}px`, // Posición base
            left: '50%',
            transform: `translateX(-50%)`,
            width: '800px',
            height: '800px',
            borderRadius: '50%',
            background: `
              radial-gradient(circle at 25% 25%, 
                rgba(107, 157, 210, 0.9) 0%,
                rgba(74, 144, 226, 0.8) 20%,
                rgba(54, 113, 194, 0.7) 40%,
                rgba(34, 82, 162, 0.6) 60%,
                rgba(20, 60, 140, 0.5) 80%,
                rgba(10, 40, 100, 0.4) 100%
              ),
              radial-gradient(circle at 70% 30%, 
                rgba(46, 125, 50, 0.6) 0%,
                rgba(27, 94, 32, 0.5) 30%,
                transparent 60%
              ),
              radial-gradient(circle at 20% 60%, 
                rgba(139, 111, 71, 0.5) 0%,
                rgba(93, 64, 55, 0.4) 30%,
                transparent 60%
              ),
              radial-gradient(circle at 60% 70%, 
                rgba(46, 125, 50, 0.5) 0%,
                rgba(27, 94, 32, 0.4) 30%,
                transparent 60%
              )
            `,
            boxShadow: `
              0 0 150px rgba(74, 144, 226, 0.8),
              0 0 80px rgba(107, 157, 210, 0.6),
              inset -200px -200px 400px rgba(0, 0, 0, 0.7),
              inset 80px 80px 150px rgba(107, 157, 210, 0.3),
              inset -50px -50px 200px rgba(20, 60, 140, 0.4)
            `,
            animation: 'rotate 60s linear infinite',
            filter: 'brightness(1.1) contrast(1.1)',
          }}
        >
          {/* Capa base de océanos con más detalle */}
            <div
              style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              background: `
                radial-gradient(circle at 35% 35%, 
                  rgba(74, 144, 226, 0.7) 0%,
                  rgba(54, 113, 194, 0.8) 25%,
                  rgba(34, 82, 162, 0.9) 50%,
                  rgba(20, 60, 140, 1) 75%,
                  rgba(10, 40, 100, 1) 100%
                ),
                radial-gradient(circle at 65% 45%, 
                  rgba(54, 113, 194, 0.6) 0%,
                  transparent 40%
                )
              `,
              mixBlendMode: 'multiply',
              opacity: 0.9,
            }}
          />
          
          {/* Continente con forma de bota - Italia */}
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '20%',
              width: '25%',
              height: '75%',
              background: `
                radial-gradient(ellipse at 50% 50%, 
                  rgba(76, 175, 80, 1) 0%,
                  rgba(56, 142, 60, 0.95) 30%,
                  rgba(46, 125, 50, 0.9) 60%,
                  rgba(27, 94, 32, 0.85) 100%
                )
              `,
              clipPath: `polygon(
                40% 5%,    /* Norte - parte superior izquierda (Alpes) */
                50% 8%,    /* Norte - parte superior centro */
                60% 10%,   /* Norte - parte superior derecha */
                65% 15%,   /* Norte-este - comienzo del talón */
                68% 20%,   /* Este - talón */
                70% 28%,   /* Este - talón medio */
                72% 35%,   /* Este - talón inferior */
                74% 42%,   /* Este - parte media de la bota */
                75% 50%,   /* Este - parte media-baja */
                76% 58%,   /* Este - parte baja */
                78% 65%,   /* Este - talón de la bota */
                80% 72%,   /* Este - punta del talón */
                82% 78%,   /* Este - punta de la bota (Calabria) */
                84% 82%,   /* Este-sureste - punta de la bota */
                86% 85%,   /* Sureste - punta de la bota (Sicilia inicio) */
                88% 88%,   /* Sureste - punta de la bota (Sicilia) */
                85% 92%,   /* Sur-este - punta de la bota (Sicilia punta) */
                82% 90%,   /* Sur - punta de la bota retorno */
                80% 88%,   /* Sur - punta de la bota */
                78% 85%,   /* Sur - parte inferior de la bota */
                76% 82%,   /* Sur - parte inferior */
                74% 78%,   /* Sur - talón de la bota */
                72% 75%,   /* Sur-oeste - talón */
                70% 72%,   /* Oeste-sur - talón */
                68% 70%,   /* Oeste - talón medio */
                66% 68%,   /* Oeste - talón superior */
                64% 65%,   /* Oeste - parte media-baja */
                62% 60%,   /* Oeste - parte media */
                60% 55%,   /* Oeste - parte media-alta */
                58% 50%,   /* Oeste - parte media */
                56% 45%,   /* Oeste - parte alta-media */
                54% 40%,   /* Oeste - parte alta */
                52% 35%,   /* Oeste - parte alta-media */
                50% 30%,   /* Oeste - parte alta */
                48% 25%,   /* Oeste - parte alta */
                46% 20%,   /* Oeste - parte alta-media */
                44% 15%,   /* Oeste - parte alta */
                42% 10%    /* Oeste - parte superior (cierre) */
              )`,
              opacity: 0.95,
              boxShadow: `
                inset 0 0 40px rgba(0, 0, 0, 0.3),
                inset -20px -20px 50px rgba(27, 94, 32, 0.4),
                inset 20px 20px 50px rgba(76, 175, 80, 0.3),
                0 0 30px rgba(46, 125, 50, 0.2)
              `,
              border: '2px solid rgba(27, 94, 32, 0.5)',
            }}
          >
            {/* Alpes - montañas en el norte */}
            <div
                style={{
                position: 'absolute',
                top: '8%',
                left: '35%',
                width: '30%',
                height: '12%',
                background: `
                  linear-gradient(to bottom, 
                    rgba(240, 240, 240, 0.95) 0%,
                    rgba(220, 220, 220, 0.9) 30%,
                    rgba(200, 200, 200, 0.85) 60%,
                    rgba(180, 180, 180, 0.8) 100%
                  )
                `,
                clipPath: 'polygon(10% 100%, 20% 60%, 30% 40%, 40% 30%, 50% 25%, 60% 30%, 70% 40%, 80% 60%, 90% 100%)',
              }}
            />
            
            {/* Apeninos - montañas que recorren la bota */}
            <div
              style={{
                position: 'absolute',
                top: '25%',
                left: '52%',
                width: '4%',
                height: '50%',
                background: `
                  linear-gradient(to bottom, 
                    rgba(180, 180, 180, 0.85) 0%,
                    rgba(160, 160, 160, 0.8) 30%,
                    rgba(139, 111, 71, 0.75) 60%,
                    rgba(93, 64, 55, 0.7) 100%
                  )
                `,
                clipPath: 'polygon(20% 0%, 30% 15%, 35% 30%, 40% 50%, 35% 70%, 30% 85%, 20% 100%, 10% 100%, 5% 85%, 0% 70%, 0% 50%, 0% 30%, 5% 15%, 10% 0%)',
              }}
            />
            
            {/* Sicilia - isla en la punta de la bota */}
            <div
              style={{
                position: 'absolute',
                bottom: '5%',
                left: '60%',
                width: '12%',
                height: '10%',
                background: `
                  radial-gradient(ellipse at 50% 50%, 
                    rgba(76, 175, 80, 0.95) 0%,
                    rgba(46, 125, 50, 0.9) 100%
                  )
                `,
                borderRadius: '40% 50% 45% 35%',
                border: '2px solid rgba(27, 94, 32, 0.5)',
                boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.2)',
              }}
            >
              {/* Volcán Etna en Sicilia */}
              <div
                style={{
                  position: 'absolute',
                  top: '30%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '30%',
                  height: '25%',
                  background: `
                    linear-gradient(to bottom, 
                      rgba(139, 111, 71, 0.9) 0%,
                      rgba(93, 64, 55, 0.8) 100%
                    )
                  `,
                  clipPath: 'polygon(50% 0%, 60% 70%, 50% 100%, 40% 70%)',
                }}
              />
            </div>
            
            {/* Mar Mediterráneo alrededor de la bota */}
            <div
                style={{
                position: 'absolute',
                top: '60%',
                left: '75%',
                width: '20%',
                height: '15%',
                background: 'rgba(74, 144, 226, 0.4)',
                borderRadius: '50%',
                filter: 'blur(5px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '30%',
                width: '15%',
                height: '12%',
                background: 'rgba(74, 144, 226, 0.35)',
                borderRadius: '50%',
                filter: 'blur(4px)',
              }}
            />
          </div>
          
          {/* Continente con forma de América del Norte */}
          <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '58%',
              width: '45%',
              height: '70%',
              background: `
                radial-gradient(ellipse at 45% 50%, 
                  rgba(76, 175, 80, 1) 0%,
                  rgba(56, 142, 60, 0.95) 30%,
                  rgba(46, 125, 50, 0.9) 60%,
                  rgba(27, 94, 32, 0.85) 100%
                )
              `,
              clipPath: `polygon(
                10% 8%,     /* Alaska - punta noroeste */
                8% 12%,     /* Alaska - costa norte */
                12% 18%,    /* Alaska - este */
                15% 22%,    /* Canadá - noroeste */
                18% 25%,    /* Canadá - centro-norte */
                22% 28%,    /* Canadá - centro */
                25% 30%,    /* Canadá - centro-este */
                28% 32%,    /* Canadá/Estados Unidos - este norte */
                30% 35%,    /* Estados Unidos - noreste */
                32% 40%,    /* Estados Unidos - este centro */
                35% 50%,    /* Estados Unidos - centro este */
                38% 60%,    /* Estados Unidos - sur este */
                40% 70%,    /* Estados Unidos - sureste */
                42% 75%,    /* Estados Unidos - sur (Golfo de México) */
                45% 78%,    /* Estados Unidos - sur oeste */
                48% 80%,    /* México - norte */
                50% 82%,    /* México - centro */
                52% 88%,    /* México - sur (Península de Yucatán inicio) */
                54% 92%,    /* Península de Yucatán */
                52% 95%,    /* Península de Yucatán punta */
                50% 93%,    /* Península de Yucatán retorno */
                48% 90%,    /* México - sur oeste */
                45% 88%,    /* México - oeste sur */
                42% 85%,    /* México - oeste */
                38% 80%,    /* Oeste sur */
                35% 75%,    /* Oeste centro sur */
                32% 70%,    /* Oeste centro */
                30% 65%,    /* Oeste centro norte */
                28% 60%,    /* Oeste centro */
                25% 55%,    /* Oeste centro-norte */
                22% 50%,    /* Oeste centro */
                20% 45%,    /* Oeste centro norte */
                18% 40%,    /* Oeste norte */
                15% 35%,    /* Oeste centro norte */
                12% 30%,    /* Oeste centro */
                10% 25%,    /* Oeste norte */
                8% 20%,     /* Oeste centro norte */
                6% 15%,     /* Oeste norte */
                8% 10%      /* Alaska - oeste (cierre) */
              )`,
              opacity: 0.95,
              boxShadow: `
                inset 0 0 40px rgba(0, 0, 0, 0.3),
                inset -20px -20px 50px rgba(27, 94, 32, 0.4),
                inset 20px 20px 50px rgba(76, 175, 80, 0.3),
                0 0 30px rgba(46, 125, 50, 0.2)
              `,
              border: '2px solid rgba(27, 94, 32, 0.5)',
            }}
          >
            {/* Montañas Rocosas (oeste de América del Norte) */}
            <div
                style={{
                position: 'absolute',
                top: '45%',
                left: '20%',
                width: '8%',
                height: '25%',
                background: `
                  linear-gradient(to bottom, 
                    rgba(200, 200, 200, 0.9) 0%,
                    rgba(180, 180, 180, 0.8) 40%,
                    rgba(139, 111, 71, 0.7) 80%,
                    rgba(93, 64, 55, 0.6) 100%
                  )
                `,
                clipPath: 'polygon(15% 100%, 25% 70%, 35% 50%, 45% 40%, 55% 45%, 65% 55%, 75% 70%, 85% 100%)',
              }}
            />
            
            {/* Montañas de Alaska */}
            <div
              style={{
                position: 'absolute',
                top: '5%',
                left: '5%',
                width: '10%',
                height: '15%',
                background: `
                  linear-gradient(to bottom, 
                    rgba(200, 200, 200, 0.9) 0%,
                    rgba(180, 180, 180, 0.8) 50%,
                    rgba(139, 111, 71, 0.7) 100%
                  )
                `,
                clipPath: 'polygon(20% 100%, 35% 65%, 50% 45%, 65% 60%, 80% 100%)',
              }}
            />
            
            {/* Montañas Apalaches (este de Estados Unidos) */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: '20%',
                width: '6%',
                height: '20%',
                background: `
                  linear-gradient(to bottom, 
                    rgba(180, 180, 180, 0.8) 0%,
                    rgba(139, 111, 71, 0.7) 100%
                  )
                `,
                clipPath: 'polygon(25% 100%, 40% 70%, 50% 55%, 60% 70%, 75% 100%)',
              }}
            />
            
            {/* Grandes Lagos (simulados) */}
            <div
              style={{
                position: 'absolute',
                top: '40%',
                right: '25%',
                width: '12%',
                height: '8%',
                background: 'rgba(74, 144, 226, 0.5)',
                borderRadius: '30%',
                filter: 'blur(3px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '38%',
                right: '30%',
                width: '8%',
                height: '6%',
                background: 'rgba(74, 144, 226, 0.4)',
                borderRadius: '40%',
                filter: 'blur(3px)',
              }}
            />
            
            {/* Golfo de México (simulado) */}
            <div
              style={{
                position: 'absolute',
                bottom: '18%',
                left: '35%',
                width: '20%',
                height: '12%',
                background: 'rgba(74, 144, 226, 0.4)',
                borderRadius: '50%',
                filter: 'blur(4px)',
              }}
            />
          </div>
          
          {/* Nubes sutiles */}
          <div
            style={{
              position: 'absolute',
              top: '25%',
              left: '40%',
              width: '25%',
              height: '15%',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              filter: 'blur(20px)',
              opacity: 0.6,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '60%',
              right: '25%',
              width: '20%',
              height: '12%',
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '50%',
              filter: 'blur(18px)',
              opacity: 0.5,
            }}
          />
          
          {/* Atmósfera exterior */}
          <div
            style={{
              position: 'absolute',
              top: '-5%',
              left: '-5%',
              right: '-5%',
              bottom: '-5%',
              borderRadius: '50%',
              background: `
                radial-gradient(circle at 25% 25%, 
                  rgba(74, 144, 226, 0.2) 0%,
                  rgba(107, 157, 210, 0.15) 40%,
                  transparent 70%
                )
              `,
              filter: 'blur(30px)',
              pointerEvents: 'none',
            }}
          />
          
          {/* Contenedor de órbita de la luna */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '1200px',
              height: '1200px',
              animation: 'orbitMoon 30s linear infinite',
              transformOrigin: 'center center',
            }}
          >
            {/* Luna */}
            <div
              style={{
                position: 'absolute',
                top: '0',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: `
                  radial-gradient(circle at 30% 30%, 
                    rgba(220, 220, 220, 0.95) 0%,
                    rgba(200, 200, 200, 0.9) 20%,
                    rgba(180, 180, 180, 0.8) 40%,
                    rgba(160, 160, 160, 0.7) 60%,
                    rgba(140, 140, 140, 0.6) 80%,
                    rgba(120, 120, 120, 0.5) 100%
                  )
                `,
                boxShadow: `
                  0 0 40px rgba(255, 255, 255, 0.6),
                  0 0 80px rgba(200, 200, 200, 0.4),
                  inset -30px -30px 60px rgba(0, 0, 0, 0.5),
                  inset 20px 20px 40px rgba(255, 255, 255, 0.3)
                `,
                filter: 'brightness(1.1)',
              }}
            >
              {/* Cráteres de la luna */}
              <div
                style={{
                  position: 'absolute',
                  top: '25%',
                  left: '30%',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(100, 100, 100, 0.4)',
                  boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.6)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '60%',
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  background: 'rgba(110, 110, 110, 0.4)',
                  boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.6)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '30%',
                  left: '20%',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'rgba(105, 105, 105, 0.4)',
                  boxShadow: 'inset 0 0 9px rgba(0, 0, 0, 0.6)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '40%',
                  right: '25%',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'rgba(115, 115, 115, 0.4)',
                  boxShadow: 'inset 0 0 7px rgba(0, 0, 0, 0.6)',
                }}
              />
              
              {/* Brillo de la luna */}
              <div
                style={{
                  position: 'absolute',
                  top: '15%',
                  left: '20%',
                  width: '40%',
                  height: '40%',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
                  filter: 'blur(5px)',
                }}
              />
            </div>
            
            {/* Contenedor de órbita del astronauta alrededor del centro de la luna */}
            <div
              style={{
                position: 'absolute',
                top: '60px', // Centro vertical de la luna (mitad de 120px)
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '350px',
                height: '300px',
                animation: 'orbitAstronaut 10s linear infinite',
                transformOrigin: 'center center',
              }}
            >
              {/* Astronauta a cuerpo completo */}
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '38px',
                  height: '64px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  animation: 'rotateAstronaut 40s linear infinite reverse',
                }}
              >
                {/* Casco del astronauta */}
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: `
                      radial-gradient(circle at 30% 30%, 
                        rgba(255, 255, 255, 0.95) 0%,
                        rgba(240, 240, 240, 0.9) 30%,
                        rgba(220, 220, 220, 0.8) 60%,
                        rgba(200, 200, 200, 0.7) 100%
                      )
                    `,
                    border: '1.5px solid rgba(180, 180, 180, 0.8)',
                    boxShadow: `
                      0 0 12px rgba(255, 255, 255, 0.8),
                      0 0 24px rgba(200, 200, 255, 0.5),
                      inset -4px -4px 8px rgba(0, 0, 0, 0.3),
                      inset 4px 4px 8px rgba(255, 255, 255, 0.4)
                    `,
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  {/* Visor del casco */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '6px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '18px',
                      height: '11px',
                      borderRadius: '50%',
                      background: `
                        radial-gradient(ellipse, 
                          rgba(100, 150, 255, 0.6) 0%,
                          rgba(50, 100, 200, 0.4) 50%,
                          rgba(20, 50, 150, 0.3) 100%
                        )
                      `,
                      border: '1px solid rgba(80, 120, 200, 0.5)',
                      boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.3)',
                    }}
                  />
                  {/* Reflejo en el visor */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '10px',
                      width: '5px',
                      height: '3px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.6)',
                      filter: 'blur(1px)',
                    }}
                  />
                </div>
                
                {/* Cuerpo del astronauta */}
                <div
                  style={{
                    width: '28px',
                    height: '19px',
                    background: `
                      linear-gradient(to bottom, 
                        rgba(255, 255, 255, 0.95) 0%,
                        rgba(240, 240, 240, 0.9) 50%,
                        rgba(220, 220, 220, 0.85) 100%
                      )
                    `,
                    border: '1px solid rgba(200, 200, 200, 0.8)',
                    borderRadius: '6px 6px 3px 3px',
                    boxShadow: `
                      0 0 8px rgba(255, 255, 255, 0.6),
                      inset 0 2px 4px rgba(255, 255, 255, 0.3),
                      inset 0 -2px 4px rgba(0, 0, 0, 0.2)
                    `,
                    marginTop: '-1.5px',
                    position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                    alignItems: 'center',
              }}
            >
                  {/* Panel de control */}
              <div
                style={{
                      width: '11px',
                      height: '8px',
                      background: 'rgba(50, 50, 50, 0.6)',
                      borderRadius: '2px',
                      border: '1px solid rgba(100, 100, 100, 0.5)',
                    }}
                  />
                </div>
                
                {/* Cintura */}
                <div
                  style={{
                    width: '25px',
                    height: '3px',
                    background: 'rgba(200, 200, 200, 0.8)',
                    marginTop: '-1px',
                    borderRadius: '2px',
                  }}
                />
                
                {/* Piernas */}
                <div
                  style={{
                    display: 'flex',
                    gap: '3px',
                    marginTop: '2px',
                  }}
                >
                  {/* Pierna izquierda */}
                <div
                  style={{
                      width: '11px',
                      height: '16px',
                      background: `
                        linear-gradient(to bottom, 
                          rgba(255, 255, 255, 0.95) 0%,
                          rgba(240, 240, 240, 0.9) 50%,
                          rgba(220, 220, 220, 0.85) 100%
                        )
                      `,
                      border: '1px solid rgba(200, 200, 200, 0.8)',
                      borderRadius: '3px 3px 5px 5px',
                      boxShadow: `
                        0 0 6px rgba(255, 255, 255, 0.5),
                        inset 0 1px 2px rgba(255, 255, 255, 0.3)
                      `,
                    }}
                  />
                  {/* Pierna derecha */}
                  <div
                    style={{
                      width: '11px',
                      height: '16px',
                      background: `
                        linear-gradient(to bottom, 
                          rgba(255, 255, 255, 0.95) 0%,
                          rgba(240, 240, 240, 0.9) 50%,
                          rgba(220, 220, 220, 0.85) 100%
                        )
                      `,
                      border: '1px solid rgba(200, 200, 200, 0.8)',
                      borderRadius: '3px 3px 5px 5px',
                      boxShadow: `
                        0 0 6px rgba(255, 255, 255, 0.5),
                        inset 0 1px 2px rgba(255, 255, 255, 0.3)
                      `,
                    }}
                  />
                </div>
                
                {/* Botas */}
                <div
                  style={{
                    display: 'flex',
                    gap: '3px',
                    marginTop: '-2px',
                  }}
                >
                  <div
                    style={{
                      width: '11px',
                      height: '5px',
                      background: 'rgba(100, 100, 100, 0.9)',
                      borderRadius: '0 0 6px 6px',
                      boxShadow: '0 2px 3px rgba(0, 0, 0, 0.3)',
                    }}
                  />
                  <div
                    style={{
                      width: '11px',
                      height: '5px',
                      background: 'rgba(100, 100, 100, 0.9)',
                      borderRadius: '0 0 6px 6px',
                      boxShadow: '0 2px 3px rgba(0, 0, 0, 0.3)',
                    }}
                  />
                </div>
                
                {/* Brazos */}
                <div
                  style={{
                    position: 'absolute',
                    top: '34px',
                    left: '-6px',
                    width: '8px',
                    height: '18px',
                    background: `
                      linear-gradient(to bottom, 
                        rgba(255, 255, 255, 0.95) 0%,
                        rgba(240, 240, 240, 0.9) 50%,
                        rgba(220, 220, 220, 0.85) 100%
                      )
                    `,
                    border: '1px solid rgba(200, 200, 200, 0.8)',
                    borderRadius: '5px 3px 3px 5px',
                    boxShadow: `
                      0 0 6px rgba(255, 255, 255, 0.5),
                      inset 0 1px 2px rgba(255, 255, 255, 0.3)
                    `,
                    transform: 'rotate(-15deg)',
                    transformOrigin: 'top center',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '34px',
                    right: '-6px',
                    width: '8px',
                    height: '18px',
                    background: `
                      linear-gradient(to bottom, 
                        rgba(255, 255, 255, 0.95) 0%,
                        rgba(240, 240, 240, 0.9) 50%,
                        rgba(220, 220, 220, 0.85) 100%
                      )
                    `,
                    border: '1px solid rgba(200, 200, 200, 0.8)',
                    borderRadius: '3px 5px 5px 3px',
                    boxShadow: `
                      0 0 6px rgba(255, 255, 255, 0.5),
                      inset 0 1px 2px rgba(255, 255, 255, 0.3)
                    `,
                    transform: 'rotate(15deg)',
                    transformOrigin: 'top center',
                  }}
                />
                
                {/* Guantes */}
                <div
                  style={{
                    position: 'absolute',
                    top: '48px',
                    left: '-8px',
                    width: '10px',
                    height: '6px',
                    background: 'rgba(100, 100, 100, 0.9)',
                    borderRadius: '50%',
                    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.3)',
                    transform: 'rotate(-15deg)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: '-8px',
                    width: '10px',
                    height: '6px',
                    background: 'rgba(100, 100, 100, 0.9)',
                    borderRadius: '50%',
                    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.3)',
                    transform: 'rotate(15deg)',
                  }}
                />
                
                {/* Resplandor del traje */}
                <div
                  style={{
                    position: 'absolute',
                    top: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '55px',
                    height: '72px',
                    background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
                    filter: 'blur(8px)',
                    zIndex: -1,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Nebulosas decorativas - múltiples para que siempre sean visibles */}
        <div
          style={{
            position: 'absolute',
            top: `${windowSize.height * 0.2}px`,
            left: `${windowSize.width * 0.1}px`,
            width: '500px',
            height: '500px',
            background: `radial-gradient(circle, 
              hsla(${backgroundHue + 60}, 70%, 50%, 0.3) 0%, 
              transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(80px)',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: `${windowSize.height * 1.5}px`,
            left: `${windowSize.width * 0.2}px`,
            width: '600px',
            height: '600px',
            background: `radial-gradient(circle, 
              hsla(${backgroundHue + 80}, 65%, 55%, 0.25) 0%, 
              transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(90px)',
            animation: 'float 25s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: `${windowSize.height * 0.85}px`,
            right: `${windowSize.width * 0.1}px`,
            width: '400px',
            height: '400px',
            background: `radial-gradient(circle, 
              hsla(${backgroundHue + 120}, 60%, 45%, 0.25) 0%, 
              transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(70px)',
            animation: 'float 25s ease-in-out infinite reverse',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: `${windowSize.height * 2.3}px`,
            right: `${windowSize.width * 0.3}px`,
            width: '450px',
            height: '450px',
            background: `radial-gradient(circle, 
              hsla(${backgroundHue + 140}, 55%, 40%, 0.2) 0%, 
              transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(75px)',
            animation: 'float 30s ease-in-out infinite reverse',
          }}
        />
        
        {/* Planeta/Tierra adicionales a lo largo de la altura */}
        <div
          style={{
            position: 'absolute',
            top: `${windowSize.height * 2}px`,
            left: '50%',
            transform: `translateX(-50%)`,
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, 
              #6B9BD2 0%,
              #4A90E2 15%,
              #2E7D32 25%,
              #1B5E20 35%,
              #8B6F47 45%,
              #5D4037 55%,
              #424242 65%,
              #263238 100%)`,
            boxShadow: `
              0 0 80px rgba(74, 144, 226, 0.5),
              inset -120px -120px 250px rgba(0, 0, 0, 0.5)
            `,
            opacity: 0.6,
            filter: 'blur(20px)',
          }}
        />

        {/* Nave espacial volando aleatoriamente */}
        {responsive.showSpaceship && (
        <div
          style={{
            position: 'fixed',
            left: `${spaceshipPos.x}px`,
            top: `${spaceshipPos.y}px`,
            transform: `translate(-50%, -50%) rotate(${spaceshipRotation}deg)`,
            width: '60px',
            height: '70px',
            transition: 'all 8s ease-in-out',
            zIndex: -1,
            pointerEvents: 'none',
            opacity: 0.7,
            filter: 'brightness(0.8)',
          }}
        >
          {/* Estructura superior con luces */}
          <div
            style={{
              position: 'absolute',
              top: '1px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '33px',
              height: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Luz verde */}
            <div
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #4CAF50 0%, #2E7D32 100%)',
                boxShadow: '0 0 5px rgba(76, 175, 80, 0.8)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            {/* Barra horizontal */}
            <div
              style={{
                width: '20px',
                height: '1px',
                background: 'rgba(150, 150, 150, 0.6)',
              }}
            />
            {/* Luz naranja */}
            <div
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #FF9800 0%, #F57C00 100%)',
                boxShadow: '0 0 5px rgba(255, 152, 0, 0.8)',
                animation: 'pulse 2s ease-in-out infinite 0.5s',
              }}
            />
                </div>

          {/* Cuerpo principal hexagonal */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '43px',
              height: '38px',
              background: 'rgba(120, 120, 120, 0.8)',
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
              border: '1px solid rgba(100, 100, 100, 0.7)',
              boxShadow: `
                0 0 10px rgba(0, 0, 0, 0.3),
                inset 0 0 8px rgba(80, 80, 80, 0.6)
              `,
            }}
          >
            {/* Ventana circular azul */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: `
                  radial-gradient(circle at 30% 30%,
                    rgba(50, 100, 150, 0.7) 0%,
                    rgba(30, 70, 120, 0.6) 40%,
                    rgba(15, 50, 100, 0.5) 70%,
                    rgba(8, 30, 80, 0.4) 100%
                  )
                `,
                border: '1px solid rgba(40, 80, 120, 0.6)',
                boxShadow: `
                  inset 0 0 5px rgba(0, 0, 0, 0.3),
                  0 0 6px rgba(50, 100, 150, 0.4),
                  inset -3px -3px 6px rgba(0, 0, 0, 0.4)
                `,
              }}
            >
              {/* Reflejo en la ventana */}
              <div
                style={{
                  position: 'absolute',
                  top: '20%',
                  left: '25%',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: 'rgba(150, 150, 150, 0.4)',
                  filter: 'blur(1px)',
                }}
              />
              </div>

            {/* Panel de control gris */}
              <div
                style={{
                position: 'absolute',
                bottom: '8%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '33px',
                height: '8px',
                background: 'rgba(100, 100, 100, 0.7)',
                borderRadius: '2px',
                border: '1px solid rgba(80, 80, 80, 0.6)',
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Botones/luces amarillas */}
                <div
                  style={{
                  position: 'absolute',
                  top: '1px',
                  left: '3px',
                  display: 'flex',
                  gap: '2px',
                }}
              >
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: '3px',
                      height: '3px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #FFC107 0%, #FF8F00 100%)',
                      boxShadow: '0 0 3px rgba(255, 193, 7, 0.6)',
                    }}
                  />
                ))}
                </div>
            </div>
          </div>

          {/* Antena izquierda */}
                <div
                  style={{
              position: 'absolute',
              left: '-8px',
              top: '26px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: `
                repeating-linear-gradient(0deg,
                  transparent 0px,
                  transparent 1px,
                  rgba(40, 40, 40, 0.6) 1px,
                  rgba(40, 40, 40, 0.6) 2px
                ),
                repeating-linear-gradient(90deg,
                  transparent 0px,
                  transparent 1px,
                  rgba(40, 40, 40, 0.6) 1px,
                  rgba(40, 40, 40, 0.6) 2px
                ),
                radial-gradient(circle,
                  rgba(60, 60, 60, 0.7) 0%,
                  rgba(40, 40, 40, 0.6) 50%,
                  rgba(25, 25, 25, 0.5) 100%
                )
              `,
              border: '1px solid rgba(50, 50, 50, 0.7)',
              boxShadow: '0 0 5px rgba(0, 0, 0, 0.4)',
            }}
          />

          {/* Antena derecha */}
          <div
            style={{
              position: 'absolute',
              right: '-8px',
              top: '26px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: `
                repeating-linear-gradient(0deg,
                  transparent 0px,
                  transparent 1px,
                  rgba(40, 40, 40, 0.6) 1px,
                  rgba(40, 40, 40, 0.6) 2px
                ),
                repeating-linear-gradient(90deg,
                  transparent 0px,
                  transparent 1px,
                  rgba(40, 40, 40, 0.6) 1px,
                  rgba(40, 40, 40, 0.6) 2px
                ),
                radial-gradient(circle,
                  rgba(60, 60, 60, 0.7) 0%,
                  rgba(40, 40, 40, 0.6) 50%,
                  rgba(25, 25, 25, 0.5) 100%
                )
              `,
              border: '1px solid rgba(50, 50, 50, 0.7)',
              boxShadow: '0 0 5px rgba(0, 0, 0, 0.4)',
            }}
          />

          {/* Patas de aterrizaje */}
          {/* Pata izquierda */}
          <div
            style={{
              position: 'absolute',
              left: '20px',
              top: '47px',
              width: '1px',
              height: '6px',
              background: 'rgba(30, 30, 30, 0.7)',
              boxShadow: '0 0 1px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '-2px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '3px',
                height: '1px',
                borderRadius: '50%',
                background: 'rgba(40, 40, 40, 0.7)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
              }}
            />
                </div>
          {/* Pata derecha */}
          <div
            style={{
              position: 'absolute',
              right: '20px',
              top: '47px',
              width: '1px',
              height: '6px',
              background: 'rgba(30, 30, 30, 0.7)',
              boxShadow: '0 0 1px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '-2px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '3px',
                height: '1px',
                borderRadius: '50%',
                background: 'rgba(40, 40, 40, 0.7)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
              }}
            />
              </div>
        </div>
        )}
      </div>
      )}
      
      
      {/* ============================================
          CAPA 1: TEXTO E INFORMACIÓN (más adelante)
          Velocidad: 1x (normal - se mueve con el scroll)
          ============================================ */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
        }}
      >

      {/* Sección Inicio */}
      <section
        id="inicio"
        ref={(el) => {
          sectionsRef.current['inicio'] = el
        }}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: isMobile ? '40px 20px' : '50px 40px',
        }}
      >
              <div
                style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '1400px',
            width: '100%',
            zIndex: 10,
            position: 'relative',
            gap: isMobile ? '30px' : '50px',
          }}
        >
          {/* Título arriba */}
          <div
            style={{
              textAlign: 'center',
            width: '100%',
            position: 'relative',
                }}
              >
                <div
                  style={{
              position: 'relative',
              marginBottom: '20px',
              zIndex: 100,
            }}
          >
            {/* Texto principal */}
                <div
                  style={{
                position: 'relative',
                fontSize: isMobile ? 'clamp(1.5rem, 6vw, 2.5rem)' : 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: '200',
                letterSpacing: isMobile ? '4px' : '8px',
                lineHeight: '1.4',
                color: getTextColor(),
                zIndex: 1,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
              <span style={{ display: 'block' }}>Stefano Di Michelangelo</span>
                </div>
            {/* Línea decorativa superior */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '200px',
                height: '1px',
                background: `linear-gradient(90deg, transparent, ${getOverlayColor(0.3)}, transparent)`,
              }}
            />
            {/* Línea decorativa inferior */}
            <div
              style={{
                position: 'absolute',
                bottom: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '200px',
                height: '1px',
                background: `linear-gradient(90deg, transparent, ${getOverlayColor(0.3)}, transparent)`,
              }}
            />
              </div>
          <p
            style={{
              fontSize: 'clamp(0.7rem, 1.3vw, 0.85rem)',
              color: getTextColorSecondary(),
              margin: isMobile ? '20px 0 0 0' : '35px 0 0 0',
              opacity: 0.8,
              textShadow: getTextShadow(),
              letterSpacing: '2.5px',
              fontWeight: '300',
              fontFamily: 'Inter, sans-serif',
              textTransform: 'uppercase',
            }}
          >
            {t('home.location')}
          </p>
          </div>

          {/* Contenedor: Imagen a la izquierda y párrafo a la derecha */}
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'center' : 'flex-start',
              justifyContent: 'center',
              gap: isMobile ? '30px' : '50px',
              width: '100%',
              maxWidth: isMobile ? '100%' : '1200px',
              margin: '0 auto',
              padding: isMobile ? '0' : '0 40px',
            }}
          >
            {/* Imagen a la izquierda */}
            <div
              style={{
                flex: isMobile ? '0 0 auto' : '0 0 280px',
                width: isMobile ? '100%' : '280px',
                maxWidth: isMobile ? '250px' : '280px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: `2px solid ${getOverlayColor(0.2)}`,
                  boxShadow: `0 8px 32px ${getOverlayColor(0.3)}`,
                  background: getOverlayColor(0.05),
                  position: 'relative',
                }}
              >
                <img
                  src="/foto-perfil.jpg"
                  alt="Stefano Di Michelangelo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                  onError={(e) => {
                    // Si la imagen no se carga, mostrar un placeholder
                    const target = e.currentTarget
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      const placeholder = document.createElement('div')
                      placeholder.style.cssText = `
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: ${getTextColor()};
                        font-size: 1rem;
                        font-family: Inter, sans-serif;
                        opacity: 0.5;
                      `
                      placeholder.textContent = 'Tu foto'
                      parent.appendChild(placeholder)
                    }
                  }}
                />
              </div>
            </div>

            {/* Párrafo a la derecha */}
            <div
              style={{
                flex: isMobile ? '0 0 auto' : '1 1 auto',
                textAlign: isMobile ? 'center' : 'left',
                padding: '20px',
                width: isMobile ? '100%' : 'auto',
              }}
            >
          <p
            style={{
              fontSize: isMobile ? 'clamp(0.85rem, 2vw, 1rem)' : 'clamp(0.9rem, 1.5vw, 1.1rem)',
              color: getTextColor(),
                  margin: '0',
                  maxWidth: isMobile ? '100%' : '650px',
              lineHeight: '1.7',
              fontWeight: '300',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.3px',
                  textAlign: isMobile ? 'justify' : 'left',
              fontStyle: 'normal',
              opacity: 0.9,
            }}
          >
            {t('home.description')}
          </p>
            </div>
          </div>
          </div>
        </section>

        {/* Sección Habilidades */}
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
          padding: '100px 20px',
            position: 'relative',
          }}
        >
          <div
            style={{
            maxWidth: '1800px',
            textAlign: 'center',
            zIndex: 10,
            color: getTextColor(),
            position: 'relative',
            overflow: 'visible',
          }}
        >
          <div style={{ position: 'relative', marginBottom: '80px' }}>
            {/* Línea decorativa izquierda */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                height: '1px',
                background: `linear-gradient(90deg, transparent, ${getOverlayColor(0.3)}, transparent)`,
              }}
            />
            <h2
              style={{
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                marginBottom: '0',
                textShadow: getTextShadow(),
                fontWeight: '300',
                letterSpacing: '6px',
                fontFamily: 'Inter, sans-serif',
                position: 'relative',
                display: 'inline-block',
                padding: '0 40px',
                background: getBackgroundColor(),
                color: getTextColor(),
              }}
            >
              {skillsTitle.split('_').map((part, index, array) => (
                <span key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <span style={{ 
                      color: getTextColorSecondary(), 
                      opacity: 0,
                      fontWeight: '400'
                    }}>_</span>
                  )}
                </span>
              ))}
            </h2>
            {/* Decoración ornamental */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '1.5rem',
                color: getOverlayColor(0.15),
                fontFamily: 'serif',
              }}
            >
              ◆
            </div>
          </div>

          {/* Switch entre habilidades técnicas y personales */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '60px',
            gap: '20px',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => setSkillsView('technical')}
              style={{
                padding: isMobile ? '12px 24px' : '14px 32px',
                background: skillsView === 'technical' ? getOverlayColor(0.15) : getOverlayColor(0.05),
                border: `1px solid ${getOverlayColor(0.2)}`,
                borderRadius: '4px',
                color: getTextColor(),
                transition: 'all 0.6s ease, background-color 0.6s ease, border-color 0.6s ease',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '300',
                letterSpacing: '2px',
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                minWidth: '120px',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (skillsView !== 'technical') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (skillsView !== 'technical') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              {t('skills.technical')}
            </button>
            <button
              onClick={() => setSkillsView('personal')}
              style={{
                padding: isMobile ? '12px 24px' : '14px 32px',
                background: skillsView === 'personal' ? getOverlayColor(0.15) : getOverlayColor(0.05),
                border: `1px solid ${getOverlayColor(0.2)}`,
                borderRadius: '4px',
                color: getTextColor(),
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '300',
                letterSpacing: '2px',
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                minWidth: '120px',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (skillsView !== 'personal') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (skillsView !== 'personal') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              {t('skills.personal')}
            </button>
          </div>

          {/* Contenedor del carrusel */}
          <div style={{
            position: 'relative',
            overflow: 'visible',
            minHeight: isMobile ? '500px' : '700px',
            padding: isMobile ? '120px 20px 40px 20px' : '140px 40px 60px 40px',
            maxWidth: isMobile ? '100%' : language === 'en' ? '1200px' : '1000px',
            margin: '0 auto',
          }}>
            {/* Vista de Habilidades Técnicas */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                width: '100%',
                opacity: skillsView === 'technical' ? 1 : 0,
                visibility: skillsView === 'technical' ? 'visible' : 'hidden',
                transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out, visibility 0.5s ease-in-out',
                transform: skillsView === 'technical' ? 'translateX(0)' : 'translateX(-30px)',
                pointerEvents: skillsView === 'technical' ? 'auto' : 'none',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: isMobile ? '20px' : '30px',
                  position: 'relative',
                  overflow: 'visible',
                  width: '100%',
                  maxWidth: isMobile ? '100%' : language === 'en' ? '1000px' : '800px',
                  gridAutoRows: '1fr',
                }}
              >
                {['Python', 'Java', 'Next.js', 'React', 'SQL', 'MongoDB', 'Excel', 'Excel/VBA'].map((skill, index) => {
                  const langColor = getLanguageColor(skill)
                  // Mostrar "VBA" en lugar de "Excel/VBA"
                  const displayName = skill === 'Excel/VBA' ? 'VBA' : skill
                  // Determinar si está en columna izquierda (índices pares) o derecha (índices impares)
                  const isLeftColumn = index % 2 === 0
                  const glowColor = langColor.border.replace('0.3', '0.4')
                  // Colores del lenguaje (modo oscuro)
                  const adjustedBorderColor = langColor.border
                  const adjustedTextColor = langColor.text
                  return (
                  <div
                    key={skill}
                    style={{
                    padding: isMobile ? '25px 20px' : '35px 30px',
                    background: getOverlayColor(0.08),
                    borderRadius: '4px',
                    border: `1px solid ${langColor.border}`,
                    borderTop: `2px solid ${langColor.border}`,
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.6s ease, border-color 0.6s ease, box-shadow 0.6s ease',
                    position: 'relative',
                    overflow: 'visible',
                    boxShadow: `0 0 30px ${glowColor}, 0 0 60px ${glowColor}, inset 0 0 20px ${glowColor}`,
                    width: '100%',
                    minHeight: isMobile ? 'auto' : '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => {
                    setHoveredSkill(skill)
                    if (!isMobile) {
                      e.currentTarget.style.transform = 'translateY(-8px)'
                    }
                    e.currentTarget.style.background = getOverlayColor(0.12)
                    const hoverBorderColor = langColor.border.replace('0.3', '0.5')
                    e.currentTarget.style.borderColor = hoverBorderColor
                    const hoverGlowColor = langColor.border.replace('0.3', '0.6')
                    e.currentTarget.style.boxShadow = `0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 40px ${hoverGlowColor}, 0 0 80px ${hoverGlowColor}`
                    }}
                    onMouseLeave={(e) => {
                      setHoveredSkill(null)
                      e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.background = getOverlayColor(0.08)
                    e.currentTarget.style.borderColor = langColor.border
                    e.currentTarget.style.boxShadow = `0 0 30px ${glowColor}, 0 0 60px ${glowColor}, inset 0 0 20px ${glowColor}`
                    }}
                  >
                  {/* Línea decorativa superior en hover */}
                  {!isMobile && (
                  <div
                      style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: `linear-gradient(90deg, transparent, ${getOverlayColor(0.3)}, transparent)`,
                      opacity: 0,
                      transition: 'opacity 0.4s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0'
                    }}
                  />
                  )}
                  {/* Logo del lenguaje que aparece en hover desde los laterales */}
                  {!isMobile && hoveredSkill === skill && getLanguageLogo(skill) && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        ...(isLeftColumn 
                          ? {
                              right: 'calc(100% + 20px)',
                              animation: 'slideInFromLeft 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            }
                          : {
                              left: 'calc(100% + 20px)',
                              animation: 'slideInFromRight 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            }
                        ),
                        transform: 'translateY(-50%)',
                        zIndex: 3000,
                        opacity: 1,
                        pointerEvents: 'none',
                        filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.9))',
                      }}
                    >
                      {getLanguageLogo(skill)}
                    </div>
                  )}
                  <h3 style={{ 
                    fontSize: isMobile ? '1.1rem' : '1.3rem', 
                        margin: 0,
                    fontWeight: '300',
                    letterSpacing: isMobile ? '1px' : '2px',
                        fontFamily: 'Inter, sans-serif',
                    color: getTextColor(),
                    textAlign: 'center',
                    width: '100%',
                    wordBreak: 'break-word',
                    lineHeight: '1.2',
                  }}>{displayName}</h3>
                  </div>
                  )
                })}
              </div>
            </div>

            {/* Vista de Habilidades Personales */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                width: '100%',
                opacity: skillsView === 'personal' ? 1 : 0,
                visibility: skillsView === 'personal' ? 'visible' : 'hidden',
                transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out, visibility 0.5s ease-in-out',
                transform: skillsView === 'personal' ? 'translateX(0)' : 'translateX(30px)',
                pointerEvents: skillsView === 'personal' ? 'auto' : 'none',
              }}
            >
                  <div
                    style={{
                      display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {/* Power Skills */}
                <div
                  style={{
                    padding: isMobile ? '30px 20px' : '40px 35px',
                    background: getOverlayColor(0.08),
                    borderRadius: '4px',
                    border: `1px solid ${getOverlayColor(0.12)}`,
                    borderTop: '2px solid rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.transform = 'translateY(-5px)'
                    }
                    e.currentTarget.style.background = getOverlayColor(0.12)
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.background = getOverlayColor(0.08)
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                  }}
                >
                  <h3
                    style={{
                      fontSize: isMobile ? '1.3rem' : '1.5rem',
                      margin: '0 0 30px 0',
                      fontWeight: '300',
                      letterSpacing: '2px',
                      fontFamily: 'Inter, sans-serif',
                      textAlign: 'center',
                      color: getTextColor(),
                    }}
                  >
                    {t('personal.power.title')}
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                    }}
                  >
                    {powerSkills.map((skill, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '15px 20px',
                          background: getOverlayColor(0.05),
                          borderRadius: '4px',
                          border: `1px solid ${getOverlayColor(0.1)}`,
                          fontSize: isMobile ? '0.95rem' : '1rem',
                          fontWeight: '300',
                          letterSpacing: '1px',
                          fontFamily: 'Inter, sans-serif',
                          color: getTextColor(),
                          textAlign: 'center',
                          transition: 'all 0.6s ease, background-color 0.6s ease, border-color 0.6s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = getOverlayColor(0.1)
                          e.currentTarget.style.borderColor = getOverlayColor(0.2)
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = getOverlayColor(0.05)
                          e.currentTarget.style.borderColor = getOverlayColor(0.1)
                        }}
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* Sección Proyectos */}
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
          padding: isMobile ? '80px 15px' : '100px 20px',
            position: 'relative',
          }}
        >
          <div
            style={{
            maxWidth: '1000px',
            textAlign: 'center',
            zIndex: 10,
            color: getTextColor(),
            position: 'relative',
          }}
        >
          <div style={{ position: 'relative', marginBottom: '80px' }}>
            {/* Línea decorativa izquierda */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                height: '1px',
                background: `linear-gradient(90deg, transparent, ${getOverlayColor(0.3)}, transparent)`,
              }}
            />
            <h2
              style={{
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                marginBottom: '0',
                textShadow: getTextShadow(),
                fontWeight: '300',
                letterSpacing: '6px',
                fontFamily: 'Inter, sans-serif',
                position: 'relative',
                display: 'inline-block',
                padding: '0 40px',
                background: getBackgroundColor(),
                color: getTextColor(),
              }}
            >
              {t('projects.title')}
            </h2>
            {/* Decoración ornamental */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '1.5rem',
                color: 'rgba(255, 255, 255, 0.15)',
                fontFamily: 'serif',
              }}
            >
              ◆
            </div>
          </div>
            <div
              style={{
                display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : (windowSize.width < 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'),
              gap: isMobile ? '20px' : '30px',
              marginBottom: '40px',
              }}
            >
              {githubProjects.length > 0 ? (
              githubProjects.slice(0, responsive.maxProjectsToShow).map((project, index) => (
                  <div
                    key={project.name}
                    onClick={() => setSelectedProject(project)}
                    style={{
                      padding: isMobile ? '25px 20px' : '35px 30px',
                      background: getOverlayColor(0.08),
                      borderRadius: '4px',
                      border: `1px solid ${getOverlayColor(0.12)}`,
                      borderTop: `2px solid ${getOverlayColor(0.15)}`,
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.6s ease, border-color 0.6s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.transform = 'translateY(-8px)'
                      }
                      e.currentTarget.style.background = getOverlayColor(0.12)
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)'
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.background = getOverlayColor(0.08)
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '1.3rem',
                        marginBottom: '15px',
                        color: getTextColor(),
                        textShadow: getTextShadow(),
                        fontWeight: '300',
                        letterSpacing: '1.5px',
                        fontFamily: 'Inter, sans-serif',
                        textAlign: 'center',
                      }}
                    >
                      {project.name}
                    </h3>
                    {project.language && (() => {
                      const langColor = getLanguageColor(project.language)
                      // Extraer el color base del borde para el glow
                      const glowColor = langColor.border.replace('0.3', '0.4')
                      return (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <span
                            style={{
                              padding: '6px 16px',
                              background: 'transparent',
                              borderRadius: '4px',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              color: getTextColor(),
                              fontSize: '0.85rem',
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: '300',
                              letterSpacing: '1px',
                              boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}, inset 0 0 10px ${glowColor}`,
                            }}
                          >
                            {project.language}
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                ))
              ) : (
              // Placeholder mientras carga
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    style={{
                    padding: '30px',
                    background: getOverlayColor(0.08),
                    borderRadius: '15px',
                    border: `1px solid ${getOverlayColor(0.12)}`,
                    backdropFilter: 'blur(10px)',
                    height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    opacity: 0.5,
                    }}
                  >
                  <div style={{ fontSize: '1rem', opacity: 0.6, color: getTextColorSecondary() }}>Cargando...</div>
                  </div>
                ))
              )}
            </div>
          {/* Botón Ver más */}
              <a
                href="https://github.com/Stefanodmm?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: isMobile ? '14px 30px' : '18px 50px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderTop: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
              color: getTextColor(),
              fontSize: isMobile ? '0.85rem' : '0.95rem',
              fontWeight: '300',
              letterSpacing: isMobile ? '2px' : '3px',
                  textDecoration: 'none',
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.6s ease, border-color 0.6s ease',
              textShadow: getTextShadow(),
              boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
              fontFamily: 'Inter, sans-serif',
              textTransform: 'uppercase',
              position: 'relative',
                }}
                onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)'
                }}
                onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.3)'
            }}
          >
            {t('projects.viewMore')}
          </a>
          </div>
        </section>

        {/* Sección Contacto */}
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
          padding: isMobile ? '80px 15px' : '100px 20px',
            position: 'relative',
          }}
        >
          <div
            style={{
            maxWidth: isMobile ? '100%' : '1200px',
              textAlign: 'center',
            zIndex: 10,
            color: getTextColor(),
            position: 'relative',
            width: '100%',
            }}
          >
          <div style={{ position: 'relative', marginBottom: '60px' }}>
            {/* Línea decorativa izquierda */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                height: '1px',
                background: `linear-gradient(90deg, transparent, ${getOverlayColor(0.3)}, transparent)`,
              }}
            />
            <h2
              style={{
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                marginBottom: '0',
                textShadow: getTextShadow(),
                fontWeight: '300',
                letterSpacing: '6px',
                fontFamily: 'Inter, sans-serif',
                position: 'relative',
                display: 'inline-block',
                padding: '0 40px',
                background: getBackgroundColor(),
                color: getTextColor(),
              }}
            >
              {t('contact.title')}
            </h2>
            {/* Decoración ornamental */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '1.5rem',
                color: getOverlayColor(0.15),
                fontFamily: 'serif',
              }}
            >
              ◆
            </div>
          </div>
            <p
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                lineHeight: '1.8',
                opacity: 0.9,
                marginBottom: '40px',
                color: getTextColor(),
                maxWidth: isMobile ? '90%' : '700px',
                margin: '0 auto 40px auto',
                textAlign: 'center',
              }}
            >
              {t('contact.description')}
            </p>
            
            {/* Layout de tres columnas */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '40px' : '60px',
                alignItems: isMobile ? 'center' : 'center',
                justifyContent: 'center',
                maxWidth: '100%',
                width: '100%',
              }}
            >
              {/* Columna izquierda - Botones de contacto */}
              <div
                style={{
                  flex: isMobile ? '1' : '0 0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
              gap: '20px',
                  width: isMobile ? '100%' : 'auto',
                  order: isMobile ? 1 : 1,
                }}
              >
                {/* Email Icon */}
                <div
                  style={{
                    position: 'relative',
                    width: isMobile ? '60px' : '70px',
                    height: isMobile ? '60px' : '70px',
                  }}
                  ref={(el) => {
                    contactButtonsRef.current['email'] = el
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setHoveredContact(hoveredContact === 'email' ? null : 'email')
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: 'none',
                      padding: 0,
                      margin: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                      }
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    title="Email"
                  >
                    <svg width={isMobile ? '30' : '35'} height={isMobile ? '30' : '35'} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="white"/>
                    </svg>
                  </button>
                  
                  {/* Panel flotante de Email */}
                  {!isMobile && hoveredContact === 'email' && (
                    <div
                      data-contact-panel="email"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: 'calc(100% + 20px)',
                        transform: 'translateY(-50%)',
                        zIndex: 3000,
                        opacity: 1,
                        animation: 'slideInFromRight 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        pointerEvents: 'auto',
                      }}
                    >
                      <div
                        style={{
                          background: getOverlayColor(0.15),
                          border: `1px solid ${getOverlayColor(0.3)}`,
                          borderRadius: '8px',
                          padding: '16px 20px',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                          minWidth: '200px',
                        }}
                      >
                        <div
                          style={{
                            color: getTextColor(),
                            fontSize: '0.9rem',
                            marginBottom: '12px',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: '300',
                            letterSpacing: '1px',
                          }}
                        >
                          {contactInfo.email}
                        </div>
                        <button
                          onClick={() => copyToClipboard(contactInfo.email, 'email')}
                          style={{
                            width: '100%',
                            padding: '8px 16px',
                            background: copiedContact === 'email' ? 'rgba(76, 175, 80, 0.2)' : getOverlayColor(0.1),
                            border: `1px solid ${copiedContact === 'email' ? 'rgba(76, 175, 80, 0.5)' : getOverlayColor(0.2)}`,
                            borderRadius: '4px',
                            color: getTextColor(),
                            fontSize: '0.85rem',
                            fontFamily: 'Inter, sans-serif',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            fontWeight: '300',
                          }}
                          onMouseEnter={(e) => {
                            if (copiedContact !== 'email') {
                              e.currentTarget.style.background = getOverlayColor(0.15)
                              e.currentTarget.style.borderColor = getOverlayColor(0.3)
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (copiedContact !== 'email') {
                              e.currentTarget.style.background = getOverlayColor(0.1)
                              e.currentTarget.style.borderColor = getOverlayColor(0.2)
                            }
                          }}
                        >
                          {copiedContact === 'email' ? '✓ Copiado' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* WhatsApp Icon */}
                <div
                  style={{
                    position: 'relative',
                    width: isMobile ? '60px' : '70px',
                    height: isMobile ? '60px' : '70px',
                  }}
                  ref={(el) => {
                    contactButtonsRef.current['whatsapp'] = el
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setHoveredContact(hoveredContact === 'whatsapp' ? null : 'whatsapp')
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: 'none',
                      padding: 0,
                      margin: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                      }
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    title="WhatsApp"
                  >
                    <svg width={isMobile ? '30' : '35'} height={isMobile ? '30' : '35'} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="#25D366"/>
                    </svg>
                  </button>
                  
                  {/* Panel flotante de WhatsApp */}
                  {!isMobile && hoveredContact === 'whatsapp' && (
                    <div
                      data-contact-panel="whatsapp"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: 'calc(100% + 20px)',
                        transform: 'translateY(-50%)',
                        zIndex: 3000,
                        opacity: 1,
                        animation: 'slideInFromRight 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        pointerEvents: 'auto',
                      }}
                    >
                      <div
                        style={{
                          background: getOverlayColor(0.15),
                          border: `1px solid ${getOverlayColor(0.3)}`,
                          borderRadius: '8px',
                          padding: '16px 20px',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                          minWidth: '200px',
                        }}
                      >
                        <div
                          style={{
                            color: getTextColor(),
                            fontSize: '0.9rem',
                            marginBottom: '12px',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: '300',
                            letterSpacing: '1px',
                          }}
                        >
                          {contactInfo.whatsapp}
                        </div>
                        <button
                          onClick={() => copyToClipboard(contactInfo.whatsapp, 'whatsapp')}
                          style={{
                            width: '100%',
                            padding: '8px 16px',
                            background: copiedContact === 'whatsapp' ? 'rgba(76, 175, 80, 0.2)' : getOverlayColor(0.1),
                            border: `1px solid ${copiedContact === 'whatsapp' ? 'rgba(76, 175, 80, 0.5)' : getOverlayColor(0.2)}`,
                            borderRadius: '4px',
                            color: getTextColor(),
                            fontSize: '0.85rem',
                            fontFamily: 'Inter, sans-serif',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            fontWeight: '300',
                          }}
                          onMouseEnter={(e) => {
                            if (copiedContact !== 'whatsapp') {
                              e.currentTarget.style.background = getOverlayColor(0.15)
                              e.currentTarget.style.borderColor = getOverlayColor(0.3)
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (copiedContact !== 'whatsapp') {
                              e.currentTarget.style.background = getOverlayColor(0.1)
                              e.currentTarget.style.borderColor = getOverlayColor(0.2)
                            }
                          }}
                        >
                          {copiedContact === 'whatsapp' ? '✓ Copiado' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* GitHub Icon */}
                <div
                  style={{
                    position: 'relative',
                    width: isMobile ? '60px' : '70px',
                    height: isMobile ? '60px' : '70px',
                  }}
                  ref={(el) => {
                    contactButtonsRef.current['github'] = el
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setHoveredContact(hoveredContact === 'github' ? null : 'github')
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: 'none',
                      padding: 0,
                      margin: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                      }
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    title="GitHub"
                  >
                    <svg width={isMobile ? '30' : '35'} height={isMobile ? '30' : '35'} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" fill="white"/>
                    </svg>
                  </button>
                  
                  {/* Panel flotante de GitHub */}
                  {!isMobile && hoveredContact === 'github' && (
                    <div
                      data-contact-panel="github"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: 'calc(100% + 20px)',
                        transform: 'translateY(-50%)',
                        zIndex: 3000,
                        opacity: 1,
                        animation: 'slideInFromRight 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        pointerEvents: 'auto',
                      }}
                    >
                      <div
                        style={{
                          background: getOverlayColor(0.15),
                          border: `1px solid ${getOverlayColor(0.3)}`,
                          borderRadius: '8px',
                          padding: '16px 20px',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                          minWidth: '200px',
                        }}
                      >
                        <div
                          style={{
                            color: getTextColor(),
                            fontSize: '0.9rem',
                            marginBottom: '12px',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: '300',
                            letterSpacing: '1px',
                          }}
                        >
                          {contactInfo.github}
                        </div>
                        <button
                          onClick={() => copyToClipboard(contactInfo.github, 'github')}
                          style={{
                            width: '100%',
                            padding: '8px 16px',
                            background: copiedContact === 'github' ? 'rgba(76, 175, 80, 0.2)' : getOverlayColor(0.1),
                            border: `1px solid ${copiedContact === 'github' ? 'rgba(76, 175, 80, 0.5)' : getOverlayColor(0.2)}`,
                            borderRadius: '4px',
                            color: getTextColor(),
                            fontSize: '0.85rem',
                            fontFamily: 'Inter, sans-serif',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            fontWeight: '300',
                          }}
                          onMouseEnter={(e) => {
                            if (copiedContact !== 'github') {
                              e.currentTarget.style.background = getOverlayColor(0.15)
                              e.currentTarget.style.borderColor = getOverlayColor(0.3)
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (copiedContact !== 'github') {
                              e.currentTarget.style.background = getOverlayColor(0.1)
                              e.currentTarget.style.borderColor = getOverlayColor(0.2)
                            }
                          }}
                        >
                          {copiedContact === 'github' ? '✓ Copiado' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Columna central - Formulario de contacto */}
              <div
                style={{
                  flex: isMobile ? '1' : '2 1 auto',
                  width: isMobile ? '100%' : 'auto',
                  maxWidth: isMobile ? '100%' : '500px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  order: isMobile ? 0 : 2,
                }}
              >
                <div
                  style={{
                    padding: isMobile ? '30px 20px' : '40px',
                    background: getOverlayColor(0.08),
                    borderRadius: '4px',
                    border: `1px solid ${getOverlayColor(0.12)}`,
                    backdropFilter: 'blur(10px)',
                    width: '100%',
                  }}
                >
                  <h3
                    style={{
                      fontSize: isMobile ? '1.2rem' : '1.5rem',
                      marginBottom: '30px',
                      fontWeight: '300',
                      letterSpacing: '2px',
                      fontFamily: 'Inter, sans-serif',
                      textAlign: 'center',
                      color: getTextColor(),
                    }}
                  >
                    Forma de contacto
                  </h3>
                  <style>{`
                    #contact-form input::placeholder,
                    #contact-form textarea::placeholder {
                      text-align: center;
                    }
                  `}</style>
                  <form
                    id="contact-form"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setFormStatus('sending')
                      try {
                        // Enviar datos al endpoint de la API
                        const response = await fetch('/api/contact', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            name: contactForm.name,
                            contactType: contactType,
                            contactInfo: contactForm.contactInfo,
                            countryCode: contactForm.countryCode,
                            phoneNumber: contactForm.phoneNumber,
                            message: contactForm.message,
                          }),
                        })

                        const data = await response.json()

                        if (!response.ok) {
                          throw new Error(data.error || 'Error al enviar el mensaje')
                        }

                        setFormStatus('success')
                        setTimeout(() => {
                          setContactForm({ name: '', contactInfo: '', countryCode: '', phoneNumber: '', message: '' })
                          setFormStatus('idle')
                        }, 2000)
                      } catch (error) {
                        console.error('Error al enviar formulario:', error)
                        setFormStatus('error')
                        setTimeout(() => setFormStatus('idle'), 3000)
                      }
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                    }}
                  >
                    {/* Campo de nombre */}
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 15px',
                        background: getOverlayColor(0.05),
                        border: `1px solid ${getOverlayColor(0.1)}`,
                        borderRadius: '4px',
                        color: getTextColor(),
                        fontSize: '0.95rem',
                        fontFamily: 'Inter, sans-serif',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        textAlign: 'center',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = getOverlayColor(0.3)
                        e.currentTarget.style.background = getOverlayColor(0.08)
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = getOverlayColor(0.1)
                        e.currentTarget.style.background = getOverlayColor(0.05)
                      }}
                    />
                    
                    {/* Menú desplegable para tipo de contacto */}
                    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
                      <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        style={{
                          width: '100%',
                          padding: '12px 15px',
                          background: getOverlayColor(0.05),
                          border: `1px solid ${getOverlayColor(0.1)}`,
                          borderRadius: '4px',
                          color: getTextColor(),
                          fontSize: '0.95rem',
                          fontFamily: 'Inter, sans-serif',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = getOverlayColor(0.3)
                          e.currentTarget.style.background = getOverlayColor(0.08)
                        }}
                        onBlur={(e) => {
                          setTimeout(() => {
                            e.currentTarget.style.borderColor = getOverlayColor(0.1)
                            e.currentTarget.style.background = getOverlayColor(0.05)
                          }, 200)
                        }}
                      >
                        <span>{contactType === 'whatsapp' ? 'WhatsApp' : 'Correo electrónico'}</span>
                        <span style={{ fontSize: '0.8rem', position: 'absolute', right: '15px' }}>{dropdownOpen ? '▲' : '▼'}</span>
                      </button>
                      {dropdownOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '4px',
                            background: '#000000',
                            border: `1px solid rgba(255, 255, 255, 0.5)`,
                            borderRadius: '4px',
                            zIndex: 1000,
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setContactType('whatsapp')
                              setDropdownOpen(false)
                            }}
                            style={{
                              width: '100%',
                              padding: '12px 15px',
                              background: contactType === 'whatsapp' ? getOverlayColor(0.15) : 'transparent',
                              border: 'none',
                              color: getTextColor(),
                              fontSize: '0.95rem',
                              fontFamily: 'Inter, sans-serif',
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'background 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (contactType !== 'whatsapp') {
                                e.currentTarget.style.background = getOverlayColor(0.08)
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (contactType !== 'whatsapp') {
                                e.currentTarget.style.background = 'transparent'
                              }
                            }}
                          >
                            WhatsApp
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setContactType('email')
                              setDropdownOpen(false)
                            }}
                            style={{
                              width: '100%',
                              padding: '12px 15px',
                              background: contactType === 'email' ? getOverlayColor(0.15) : 'transparent',
                              border: 'none',
                              borderTop: `1px solid ${getOverlayColor(0.1)}`,
                              color: getTextColor(),
                              fontSize: '0.95rem',
                              fontFamily: 'Inter, sans-serif',
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'background 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (contactType !== 'email') {
                                e.currentTarget.style.background = getOverlayColor(0.08)
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (contactType !== 'email') {
                                e.currentTarget.style.background = 'transparent'
                              }
                            }}
                          >
                            Correo electrónico
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Campos de información de contacto */}
                    {contactType === 'whatsapp' ? (
                      <div style={{ display: 'flex', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
                        {/* Campo de código de país */}
                        <div style={{ position: 'relative', flex: '0 0 auto', width: '100px' }}>
                          <span
                            style={{
                              position: 'absolute',
                              left: '15px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: getTextColor(),
                              fontSize: '0.95rem',
                              fontFamily: 'Inter, sans-serif',
                              pointerEvents: 'none',
                              zIndex: 1,
                            }}
                          >
                            +
                          </span>
                          <input
                            type="text"
                            placeholder="Código"
                            value={contactForm.countryCode}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^\d]/g, '')
                              setContactForm({ ...contactForm, countryCode: value })
                            }}
                            required
                            maxLength={3}
                            style={{
                              width: '100%',
                              padding: '12px 15px',
                              paddingLeft: '30px',
                              background: getOverlayColor(0.05),
                              border: `1px solid ${getOverlayColor(0.1)}`,
                              borderRadius: '4px',
                              color: getTextColor(),
                              fontSize: '0.95rem',
                              fontFamily: 'Inter, sans-serif',
                              outline: 'none',
                              transition: 'all 0.3s ease',
                              textAlign: 'center',
                              boxSizing: 'border-box',
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = getOverlayColor(0.3)
                              e.currentTarget.style.background = getOverlayColor(0.08)
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = getOverlayColor(0.1)
                              e.currentTarget.style.background = getOverlayColor(0.05)
                            }}
                          />
                        </div>
                        {/* Campo de número de teléfono */}
                        <input
                          type="text"
                          placeholder="Número de teléfono"
                          value={contactForm.phoneNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '')
                            setContactForm({ ...contactForm, phoneNumber: value })
                          }}
                          required
                          style={{
                            flex: '1',
                            padding: '12px 15px',
                            background: getOverlayColor(0.05),
                            border: `1px solid ${getOverlayColor(0.1)}`,
                            borderRadius: '4px',
                            color: getTextColor(),
                            fontSize: '0.95rem',
                            fontFamily: 'Inter, sans-serif',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            textAlign: 'center',
                            boxSizing: 'border-box',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = getOverlayColor(0.3)
                            e.currentTarget.style.background = getOverlayColor(0.08)
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = getOverlayColor(0.1)
                            e.currentTarget.style.background = getOverlayColor(0.05)
                          }}
                        />
                      </div>
                    ) : (
                      <input
                        type="email"
                        placeholder="Tu correo electrónico"
                        value={contactForm.contactInfo}
                        onChange={(e) => setContactForm({ ...contactForm, contactInfo: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 15px',
                          background: getOverlayColor(0.05),
                          border: `1px solid ${getOverlayColor(0.1)}`,
                          borderRadius: '4px',
                          color: getTextColor(),
                          fontSize: '0.95rem',
                          fontFamily: 'Inter, sans-serif',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          textAlign: 'center',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = getOverlayColor(0.3)
                          e.currentTarget.style.background = getOverlayColor(0.08)
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = getOverlayColor(0.1)
                          e.currentTarget.style.background = getOverlayColor(0.05)
                        }}
                      />
                    )}
                    
                    {/* Campo de mensaje */}
                    <textarea
                      placeholder="Tu mensaje"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                      rows={6}
                      style={{
                        width: '100%',
                        padding: '12px 15px',
                        background: getOverlayColor(0.05),
                        border: `1px solid ${getOverlayColor(0.1)}`,
                        borderRadius: '4px',
                        color: getTextColor(),
                        fontSize: '0.95rem',
                        fontFamily: 'Inter, sans-serif',
                        outline: 'none',
                        resize: 'vertical',
                        transition: 'all 0.3s ease',
                        textAlign: 'center',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = getOverlayColor(0.3)
                        e.currentTarget.style.background = getOverlayColor(0.08)
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = getOverlayColor(0.1)
                        e.currentTarget.style.background = getOverlayColor(0.05)
                      }}
                    />
                    <button
                      type="submit"
                      disabled={formStatus === 'sending'}
                      style={{
                        width: '100%',
                        padding: '14px 30px',
                        background: formStatus === 'success' ? 'rgba(76, 175, 80, 0.2)' : formStatus === 'error' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(255, 255, 255, 0.12)',
                        border: `1px solid ${formStatus === 'success' ? 'rgba(76, 175, 80, 0.5)' : formStatus === 'error' ? 'rgba(244, 67, 54, 0.5)' : 'rgba(255, 255, 255, 0.25)'}`,
                        borderRadius: '2px',
                        color: getTextColor(),
                        fontSize: '0.95rem',
                        fontWeight: '300',
                        letterSpacing: '2px',
                        fontFamily: 'Inter, sans-serif',
                        textTransform: 'uppercase',
                        cursor: formStatus === 'sending' ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        opacity: formStatus === 'sending' ? 0.6 : 1,
                        boxSizing: 'border-box',
                      }}
                      onMouseEnter={(e) => {
                        if (formStatus !== 'sending' && formStatus !== 'success') {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (formStatus !== 'sending' && formStatus !== 'success') {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
                        }
                      }}
                    >
                      {formStatus === 'sending' ? 'Enviando...' : formStatus === 'success' ? '¡Enviado!' : formStatus === 'error' ? 'Error' : 'Enviar mensaje'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Columna derecha - Imagen */}
              <div
                style={{
                  flex: isMobile ? '0' : '0 0 auto',
                  display: isMobile ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: isMobile ? '0' : '300px',
                  order: isMobile ? 0 : 3,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    height: '400px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: `1px solid ${getOverlayColor(0.12)}`,
                    background: getOverlayColor(0.05),
                  }}
                >
                  <img
                    src="/tu-imagen.jpg"
                    alt="Stefano Di Michelangelo"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                    onError={(e) => {
                      // Si la imagen no se carga, mostrar un placeholder
                      e.currentTarget.style.display = 'none'
                      const parent = e.currentTarget.parentElement
                      if (parent) {
                        parent.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3);font-size:0.9rem;">Tu imagen</div>'
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Modal de proyecto */}
      {selectedProject && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedProject(null)
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: getModalBackground(),
            backdropFilter: 'blur(10px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '20px' : '40px',
            opacity: selectedProject ? 1 : 0,
            transition: 'opacity 0.6s ease, background-color 0.6s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(20px)',
              borderRadius: '4px',
              border: `1px solid ${getOverlayColor(0.15)}`,
              borderTop: `2px solid ${getOverlayColor(0.2)}`,
              padding: isMobile ? '30px 25px' : '50px 40px',
              maxWidth: isMobile ? '100%' : '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              position: 'relative',
              transition: 'all 0.6s ease, background-color 0.6s ease, border-color 0.6s ease',
            }}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setSelectedProject(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                color: getTextColor(),
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '20px',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.6s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = getOverlayColor(0.5)
                e.currentTarget.style.color = getTextColor()
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = getOverlayColor(0.2)
                e.currentTarget.style.color = getTextColor()
              }}
            >
              ×
            </button>

            {/* Título */}
            <h3
              style={{
                fontSize: isMobile ? '1.5rem' : '2rem',
                marginBottom: '25px',
                color: getTextColor(),
                fontWeight: '300',
                letterSpacing: '2px',
                fontFamily: 'Inter, sans-serif',
                paddingRight: '40px',
              }}
            >
              {selectedProject.name}
            </h3>

            {/* Descripción */}
            <div
              style={{
                marginBottom: '30px',
              }}
            >
              <h4
                style={{
                  fontSize: '0.85rem',
                  color: getTextColorSecondary(),
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: '15px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '300',
                }}
              >
                Descripción
              </h4>
              <p
                style={{
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  color: getTextColor(),
                  lineHeight: '1.8',
                  textAlign: 'justify',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '300',
                }}
              >
                {selectedProject.description || 'Sin descripción disponible para este proyecto.'}
              </p>
            </div>

            {/* Lenguajes */}
            <div
              style={{
                marginBottom: '30px',
              }}
            >
              <h4
                style={{
                  fontSize: '0.85rem',
                  color: getTextColorSecondary(),
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: '15px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '300',
                }}
              >
                Lenguajes
              </h4>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                {selectedProject.language ? (() => {
                  const langColor = getLanguageColor(selectedProject.language)
                  // Extraer el color base del borde para el glow
                  const glowColor = langColor.border.replace('0.3', '0.5')
                  return (
                    <span
                      style={{
                        padding: '8px 16px',
                        background: getOverlayColor(0.08),
                        borderRadius: '4px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: getTextColor(),
                        fontSize: '0.9rem',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: '300',
                        letterSpacing: '0.5px',
                        boxShadow: `0 0 25px ${glowColor}, 0 0 50px ${glowColor}, inset 0 0 15px ${glowColor}`,
                      }}
                    >
                      {selectedProject.language}
                    </span>
                  )
                })() : (
                  <span
                    style={{
                      padding: '8px 16px',
                      background: getOverlayColor(0.08),
                      borderRadius: '4px',
                      border: `1px solid ${getOverlayColor(0.1)}`,
                      color: getTextColorSecondary(),
                      fontSize: '0.9rem',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: '300',
                      fontStyle: 'italic',
                    }}
                  >
                    No especificado
                  </span>
                )}
              </div>
            </div>

            {/* Botón ir a GitHub */}
            <a
              href={selectedProject.html_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: isMobile ? '14px 30px' : '16px 40px',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderTop: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '2px',
                color: getTextColor(),
                fontSize: isMobile ? '0.85rem' : '0.95rem',
                fontWeight: '300',
                letterSpacing: isMobile ? '1.5px' : '2px',
                textDecoration: 'none',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
                fontFamily: 'Inter, sans-serif',
                textTransform: 'uppercase',
                position: 'relative',
                width: '100%',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.3)'
              }}
            >
              {t('contact.viewOnGitHub')}
            </a>
          </div>
        </div>
      )}

      {/* Efecto de luz del mouse - DESACTIVADO */}
      {/* <div
          style={{
          position: 'fixed',
          left: mousePos.x - 150,
          top: mousePos.y - 150,
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255, 255, 255, 0.06) 30%, transparent 70%)',
          pointerEvents: 'none',
          transition: 'all 0.15s ease-out',
          filter: 'blur(60px)',
          zIndex: 4,
        }}
      /> */}
      </div>
      {/* Cierre de Capa 1 */}

      {/* Lengueta con información */}
      <div
        style={{
          position: 'fixed',
          bottom: showNav ? '-200px' : '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
          pointerEvents: 'none',
          transition: 'all 0.5s ease-out',
          perspective: '1000px',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
            borderRight: '1px solid rgba(255, 255, 255, 0.15)',
            borderBottom: 'none',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            borderBottomLeftRadius: '0',
            borderBottomRightRadius: '0',
            padding: isMobile ? '10px 15px 15px 15px' : '12px 30px 20px 30px',
            display: 'flex',
            gap: isMobile ? '15px' : '40px',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.4),
              0 -4px 16px rgba(255, 255, 255, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.15)
            `,
            transform: showNav 
              ? 'perspective(1000px) rotateX(15deg) translateY(50px)'
              : 'perspective(1000px) rotateX(5deg) translateY(0)',
            transformStyle: 'preserve-3d',
            animation: !showNav ? 'slideUp 0.6s ease-out' : 'none',
          }}
        >
          {/* {t('projects.public')} */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                fontWeight: '300',
                color: getTextColor(),
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '1px',
              }}
            >
              {publicRepos || '...'}
            </div>
            <div
              style={{
                fontSize: isMobile ? '0.6rem' : '0.7rem',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: isMobile ? '1px' : '2px',
                textTransform: 'uppercase',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '300',
              }}
            >
              {t('projects.title')}
            </div>
          </div>

          {/* Línea divisoria */}
          {!isMobile && (
          <div
            style={{
              width: '1px',
              height: '50px',
              background: 'rgba(255, 255, 255, 0.1)',
              alignSelf: 'center',
            }}
          />
          )}

          {/* Años de Experiencia */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                fontSize: isMobile ? 'clamp(1.2rem, 4vw, 1.8rem)' : 'clamp(1.8rem, 3vw, 2.5rem)',
                fontWeight: '300',
                color: getTextColor(),
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '1px',
              }}
            >
              {yearsExperience}+
            </div>
            <div
              style={{
                fontSize: isMobile ? '0.6rem' : '0.7rem',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: isMobile ? '1px' : '2px',
                textTransform: 'uppercase',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '300',
                textAlign: 'center',
                lineHeight: '1.4',
                whiteSpace: 'pre-line',
              }}
            >
              {t('stats.experience').replace('\n', '\n')}
            </div>
          </div>

          {/* Línea divisoria - solo si no es móvil */}
          {!isMobile && (
          <>
          <div
            style={{
              width: '1px',
              height: '50px',
              background: 'rgba(255, 255, 255, 0.1)',
              alignSelf: 'center',
            }}
          />

          {/* Dedicación - solo visible en desktop */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                fontWeight: '300',
                color: getTextColor(),
                fontFamily: 'Inter, sans-serif',
              letterSpacing: '1px',
              }}
            >
              100%
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif',
                fontWeight: '300',
              }}
            >
              {t('stats.dedication')}
            </div>
          </div>
          </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(-50%);
          }
          50% {
            transform: translateY(-30px) translateX(-50%);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes orbitMoon {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes orbitAstronaut {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes rotateAstronaut {
          from {
            transform: translateX(-50%) rotate(0deg);
          }
          to {
            transform: translateX(-50%) rotate(360deg);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: perspective(1000px) rotateX(15deg) translateY(30px);
          }
          to {
            opacity: 1;
            transform: perspective(1000px) rotateX(5deg) translateY(0);
          }
        }

        @keyframes slideInFromRight {
          0% {
            opacity: 0;
            transform: translateY(-50%) translateX(30px) scale(0.8);
          }
          60% {
            transform: translateY(-50%) translateX(-5px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateY(-50%) translateX(0) scale(1);
          }
        }

        @keyframes slideInFromLeft {
          0% {
            opacity: 0;
            transform: translateY(-50%) translateX(-30px) scale(0.8);
          }
          60% {
            transform: translateY(-50%) translateX(5px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateY(-50%) translateX(0) scale(1);
          }
        }
      `}</style>
      </main>
    </>
  )
}
