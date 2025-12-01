'use client'

import { useEffect, useState, useRef } from 'react'

const SECTIONS = [
  { id: 'inicio', name: 'Inicio' },
  { id: 'habilidades', name: 'Habilidades' },
  { id: 'proyectos', name: 'Proyectos' },
  { id: 'contacto', name: 'Contacto' },
]

export default function PortfolioFeliz() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const [showNav, setShowNav] = useState(false)
  const [activeSection, setActiveSection] = useState('inicio')
  const [backgroundHue, setBackgroundHue] = useState(240) // Color base del fondo
  const [pageHeight, setPageHeight] = useState(0)
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 }) // Valores por defecto para SSR
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
  
  // Velocidades de parallax para cada capa (multiplicador del scroll)
  // Capa 3 (fondo): 0.1x - muy lenta
  // Capa 2 (decoraciones): 0.3x - lenta
  // Capa 1 (texto): 1x - normal
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({})
  
  useEffect(() => {
    const updatePageHeight = () => {
      if (typeof window !== 'undefined') {
        const calculatedHeight = Math.max(
          document.documentElement.scrollHeight,
          window.innerHeight * 10 // Mínimo 10 pantallas de altura para evitar vacíos
        )
        setPageHeight(calculatedHeight)
        setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      }
    }
    
    updatePageHeight()
    if (typeof window !== 'undefined') {
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

  const scrollToSection = (sectionId: string) => {
    const element = sectionsRef.current[sectionId]
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
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
            ? 'rgba(26, 26, 46, 0.95)' 
            : 'transparent',
          backdropFilter: showNav ? 'blur(10px)' : 'none',
          padding: showNav ? '15px 20px' : '20px',
          transition: 'all 0.3s ease',
          borderBottom: showNav ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          opacity: showNav ? 1 : 0,
          pointerEvents: showNav ? 'auto' : 'none',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
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
                color: activeSection === section.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                fontSize: '14px',
                fontWeight: activeSection === section.id ? 'bold' : 'normal',
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.color = '#FFFFFF'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              {section.name}
              {activeSection === section.id && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '30px',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #FFFFFF, transparent)',
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
          transform: `translate3d(0, ${-scrollY * 0.1}px, 0)`, // Parallax - fondo sube cuando texto baja (efecto inverso)
          background: `
            repeating-linear-gradient(
              to bottom,
              hsl(${backgroundHue}, 70%, 18%) 0%,
              hsl(${backgroundHue + 5}, 68%, 16%) 10%,
              hsl(${backgroundHue + 10}, 65%, 14%) 20%,
              hsl(${backgroundHue + 15}, 63%, 12%) 30%,
              hsl(${backgroundHue + 20}, 60%, 10%) 40%,
              hsl(${backgroundHue + 15}, 63%, 12%) 50%,
              hsl(${backgroundHue + 10}, 65%, 14%) 60%,
              hsl(${backgroundHue + 5}, 68%, 16%) 70%,
              hsl(${backgroundHue}, 70%, 18%) 80%,
              hsl(${backgroundHue + 5}, 68%, 16%) 90%,
              hsl(${backgroundHue}, 70%, 18%) 100%
            ),
            linear-gradient(
              to bottom,
              hsl(${backgroundHue}, 75%, 20%) 0%,
              hsl(${backgroundHue + 30}, 70%, 15%) 50%,
              hsl(${backgroundHue + 60}, 65%, 10%) 100%
            )
          `,
          backgroundSize: '100% 1500px, 100% 100%',
          backgroundRepeat: 'repeat-y',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          transformOrigin: 'center center',
        }}
      />
      
      {/* ============================================
          CAPA 3: DECORACIONES Y PLANETAS
          Velocidad: 0.5x (lenta)
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
          zIndex: 1,
          pointerEvents: 'none',
          transform: `translate3d(0, ${-scrollY * 0.3}px, 0)`, // Parallax - decoraciones suben cuando texto baja
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          transformOrigin: 'center center',
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
      </div>
      
      
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
          alignItems: 'flex-start',
          justifyContent: 'center',
          position: 'relative',
          paddingTop: '100px',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            zIndex: 10,
            padding: '20px',
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
            {/* Sombra detrás del texto */}
            <div
              style={{
                position: 'absolute',
                top: '3%',
                left: '21%',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 'bold',
                letterSpacing: '4px',
                lineHeight: '1.2',
                color: 'rgba(0, 0, 0, 0.7)',
                zIndex: 0,
                pointerEvents: 'none',
              }}
            >
              <span style={{ display: 'block' }}>Stefano Di Michelangelo</span>
            </div>
            {/* Texto con gradiente */}
            <div
              style={{
                position: 'relative',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 'bold',
                letterSpacing: '4px',
                lineHeight: '1.2',
              background: 'linear-gradient(45deg, #FFFFFF, #8B43E6, #00BFFF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
                zIndex: 1,
            }}
          >
              <span style={{ display: 'block' }}>Stefano Di Michelangelo</span>
            </div>
          </div>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.5rem)',
              color: '#FFFFFF',
              margin: 0,
              marginBottom: '15px',
              opacity: 0.9,
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
              animation: 'pulse 3s ease-in-out infinite',
            }}
          >
            Desarrollador web, Análisis de datos, automatizaciones python, Unity.
          </p>
          <p
            style={{
              fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
              color: '#B0B0B0',
              margin: 0,
              opacity: 0.8,
              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.9)',
            }}
          >
            Venezuela, Caracas - Trabajo remoto
          </p>
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
            maxWidth: '1000px',
            textAlign: 'center',
            zIndex: 10,
            color: '#FFFFFF',
            position: 'relative',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              marginBottom: '60px',
              textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9)',
            }}
          >
            Habilidades
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '30px',
            }}
          >
            {['Python', 'Java', 'Next.js', 'React', 'SQL', 'MongoDB', 'Excel', 'Macros Excel (VBA)'].map((skill) => (
              <div
                key={skill}
                style={{
                  padding: '30px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{skill}</h3>
              </div>
            ))}
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
          padding: '100px 20px',
          position: 'relative',
        }}
      >
        <div
          style={{
            maxWidth: '1000px',
            textAlign: 'center',
            zIndex: 10,
            color: '#FFFFFF',
            position: 'relative',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              marginBottom: '60px',
              textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9)',
            }}
          >
            Proyectos
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '30px',
              marginBottom: '40px',
            }}
          >
            {githubProjects.length > 0 ? (
              githubProjects.map((project, index) => (
                <a
                  key={project.name}
                  href={project.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                  }}
                >
                  <div
                style={{
                      padding: '30px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-10px)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.5)'
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(138, 43, 226, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '1.4rem',
                        marginBottom: '15px',
                        color: '#FFFFFF',
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                      }}
                    >
                      {project.name}
                </h3>
                    <p
                      style={{
                        opacity: 0.8,
                        marginBottom: '15px',
                        flex: 1,
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                      }}
                    >
                      {project.description || 'Sin descripción disponible'}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.85rem',
                        opacity: 0.7,
                      }}
                    >
                      {project.language && (
                        <span
                          style={{
                            padding: '4px 12px',
                            background: 'rgba(138, 43, 226, 0.2)',
                            borderRadius: '12px',
                            border: '1px solid rgba(138, 43, 226, 0.4)',
                          }}
                        >
                          {project.language}
                        </span>
                      )}
                      {project.stargazers_count > 0 && (
                        <span>⭐ {project.stargazers_count}</span>
                      )}
              </div>
          </div>
                </a>
              ))
            ) : (
              // Placeholder mientras carga
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    padding: '30px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.5,
                  }}
                >
                  <div style={{ fontSize: '1rem', opacity: 0.6 }}>Cargando...</div>
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
              padding: '15px 40px',
              background: 'rgba(138, 43, 226, 0.3)',
              border: '2px solid rgba(138, 43, 226, 0.6)',
              borderRadius: '25px',
              color: '#FFFFFF',
              fontSize: '1.1rem',
              fontWeight: '500',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
              boxShadow: '0 0 20px rgba(138, 43, 226, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(138, 43, 226, 0.5)'
              e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.8)'
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(138, 43, 226, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(138, 43, 226, 0.3)'
              e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.6)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(138, 43, 226, 0.3)'
            }}
          >
            Ver más
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
          padding: '100px 20px',
          position: 'relative',
        }}
      >
        <div
          style={{
            maxWidth: '600px',
            textAlign: 'center',
            zIndex: 10,
            color: '#FFFFFF',
            position: 'relative',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              marginBottom: '40px',
              textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9)',
            }}
          >
            Contacto
          </h2>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              lineHeight: '1.8',
              opacity: 0.9,
              marginBottom: '40px',
            }}
          >
            ¿Tienes un proyecto en mente? ¡Hablemos!
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            {['Email', 'LinkedIn', 'GitHub'].map((contact) => (
              <button
                key={contact}
                style={{
                  padding: '15px 30px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-5px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {contact}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Efecto de luz del mouse */}
      <div
        style={{
          position: 'fixed',
          left: mousePos.x - 150,
          top: mousePos.y - 150,
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(138, 43, 226, 0.1) 30%, transparent 70%)',
          pointerEvents: 'none',
          transition: 'all 0.15s ease-out',
          filter: 'blur(60px)',
          zIndex: 4,
        }}
      />
      </div>
      {/* Cierre de Capa 1 */}

      {/* 3 Burbujas flotantes */}
      <div
        style={{
          position: 'fixed',
          bottom: showNav ? '-100px' : '15px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '30px',
          pointerEvents: 'none',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Burbuja 1 - Proyectos */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: '500',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
              whiteSpace: 'nowrap',
            }}
          >
            Proyectos
          </div>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: `
                radial-gradient(circle at 30% 30%,
                  rgba(138, 43, 226, 0.8) 0%,
                  rgba(138, 43, 226, 0.6) 50%,
                  rgba(138, 43, 226, 0.4) 100%
                )
              `,
              border: '2px solid rgba(138, 43, 226, 0.5)',
              boxShadow: `
                0 0 20px rgba(138, 43, 226, 0.6),
                0 0 40px rgba(138, 43, 226, 0.4),
                inset 0 0 20px rgba(255, 255, 255, 0.1)
              `,
              animation: 'floatBubble 3s ease-in-out infinite',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Número de proyectos */}
            <div
              style={{
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                zIndex: 1,
              }}
            >
              {publicRepos || '...'}
            </div>
            {/* Resplandor interno */}
            <div
              style={{
                position: 'absolute',
                top: '20%',
                left: '25%',
                width: '30%',
                height: '30%',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.4)',
                filter: 'blur(5px)',
              }}
            />
          </div>
        </div>

        {/* Burbuja 2 - Años de experiencia */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: '500',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
              whiteSpace: 'nowrap',
              textAlign: 'center',
            }}
          >
            Años de experiencia
          </div>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: `
                radial-gradient(circle at 30% 30%,
                  rgba(0, 100, 150, 0.9) 0%,
                  rgba(0, 80, 120, 0.8) 50%,
                  rgba(0, 60, 100, 0.7) 100%
                )
              `,
              border: '2px solid rgba(0, 100, 150, 0.6)',
              boxShadow: `
                0 0 20px rgba(0, 100, 150, 0.6),
                0 0 40px rgba(0, 80, 120, 0.4),
                inset 0 0 20px rgba(255, 255, 255, 0.1)
              `,
              animation: 'floatBubble 3s ease-in-out infinite 0.5s',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Número de años */}
            <div
              style={{
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                zIndex: 1,
              }}
            >
              {yearsExperience}+
            </div>
            {/* Resplandor interno */}
            <div
              style={{
                position: 'absolute',
                top: '20%',
                left: '25%',
                width: '30%',
                height: '30%',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.4)',
                filter: 'blur(5px)',
              }}
            />
          </div>
        </div>

        {/* Burbuja 3 - Dedicación */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: '500',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
              whiteSpace: 'nowrap',
            }}
          >
            Dedicación
          </div>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: `
                radial-gradient(circle at 30% 30%,
                  rgba(138, 43, 226, 0.8) 0%,
                  rgba(0, 191, 255, 0.6) 50%,
                  rgba(138, 43, 226, 0.4) 100%
                )
              `,
              border: '2px solid rgba(138, 43, 226, 0.5)',
              boxShadow: `
                0 0 20px rgba(138, 43, 226, 0.6),
                0 0 40px rgba(0, 191, 255, 0.4),
                inset 0 0 20px rgba(255, 255, 255, 0.1)
              `,
              animation: 'floatBubble 3s ease-in-out infinite 1s',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Porcentaje de dedicación */}
            <div
              style={{
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                zIndex: 1,
              }}
            >
              100%
            </div>
            {/* Resplandor interno */}
            <div
              style={{
                position: 'absolute',
                top: '20%',
                left: '25%',
                width: '30%',
                height: '30%',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.4)',
                filter: 'blur(5px)',
              }}
            />
          </div>
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

        @keyframes floatBubble {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </main>
    </>
  )
}
