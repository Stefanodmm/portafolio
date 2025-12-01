'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type PortfolioMode = 'feliz' | 'serio'
type Theme = 'claro' | 'oscuro'

interface PortfolioModeContextType {
  mode: PortfolioMode
  theme: Theme
  toggleMode: () => void
  setMode: (mode: PortfolioMode) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  isMobile: boolean
}

const PortfolioModeContext = createContext<PortfolioModeContextType | undefined>(undefined)

// Función para detectar si es móvil
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth <= 768
}

export function PortfolioModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<PortfolioMode>('serio')
  const [theme, setThemeState] = useState<Theme>('oscuro')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detectar si es móvil
    const checkMobile = () => {
      setIsMobile(isMobileDevice())
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // En móviles, forzar modo 'serio'
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        // Cargar tema guardado
        const savedTheme = localStorage.getItem('portfolioTheme')
        if (savedTheme === 'claro' || savedTheme === 'oscuro') {
          setThemeState(savedTheme)
        } else {
          localStorage.setItem('portfolioTheme', 'oscuro')
        }
        
        if (isMobileDevice()) {
          setModeState('serio')
          localStorage.setItem('portfolioMode', 'serio')
        } else {
          // Solo en desktop, cargar el modo guardado
          const savedMode = localStorage.getItem('portfolioMode')
          if (savedMode === 'feliz' || savedMode === 'serio') {
            setModeState(savedMode)
          } else {
            localStorage.setItem('portfolioMode', 'serio')
          }
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error)
        setModeState('serio')
        setThemeState('oscuro')
      }
    }
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const setMode = (newMode: PortfolioMode) => {
    // No permitir cambiar a modo 'feliz' en móviles
    if (isMobile && newMode === 'feliz') {
      return
    }
    setModeState(newMode)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('portfolioMode', newMode)
      } catch (error) {
        console.error('Error saving to localStorage:', error)
      }
    }
  }

  const toggleMode = () => {
    // No permitir cambiar a modo 'feliz' en móviles
    if (isMobile) {
      return
    }
    const newMode = mode === 'feliz' ? 'serio' : 'feliz'
    setMode(newMode)
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('portfolioTheme', newTheme)
      } catch (error) {
        console.error('Error saving theme to localStorage:', error)
      }
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'claro' ? 'oscuro' : 'claro'
    setTheme(newTheme)
  }

  return (
    <PortfolioModeContext.Provider value={{ mode, theme, toggleMode, setMode, setTheme, toggleTheme, isMobile }}>
      {children}
    </PortfolioModeContext.Provider>
  )
}

export function usePortfolioMode() {
  const context = useContext(PortfolioModeContext)
  if (context === undefined) {
    throw new Error('usePortfolioMode must be used within a PortfolioModeProvider')
  }
  return context
}
