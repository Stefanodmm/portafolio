'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import PortfolioSerioMobile from './PortfolioSerioMobile'

// Constantes de colores consistentes con PortfolioSerio
const COLORS = {
  BACKGROUND: '#000000',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: 'rgba(255, 255, 255, 0.6)',
  OVERLAY: (opacity: number) => `rgba(255, 255, 255, ${opacity})`,
  BORDER: 'rgba(255, 255, 255, 0.1)',
} as const

// Componente wrapper para PortfolioSerioMobile con fallback
function SimplePortfolioFallback({ children }: { children: ReactNode }) {
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    // Detectar si hay un error de renderizado
    const errorHandler = (event: ErrorEvent) => {
      if (event.message.includes('hooks') || event.message.includes('Hook')) {
        setHasError(true)
      }
    }
    window.addEventListener('error', errorHandler)
    return () => window.removeEventListener('error', errorHandler)
  }, [])

  if (hasError) {
    return (
      <div style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.BACKGROUND,
        color: COLORS.TEXT_PRIMARY,
        padding: '20px',
        textAlign: 'center',
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          marginBottom: '20px',
          color: COLORS.TEXT_PRIMARY,
          fontWeight: 'bold',
        }}>
          STEFANO DI MICHELANGELO
        </h1>
        <p style={{ 
          fontSize: '16px',
          color: COLORS.TEXT_SECONDARY,
          marginBottom: '10px',
        }}>
          Caracas, Venezuela • Trabajo Remoto
        </p>
        <p style={{ 
          fontSize: '14px',
          color: COLORS.TEXT_SECONDARY,
          maxWidth: '600px',
          lineHeight: '1.6',
          marginTop: '20px',
        }}>
          Desarrollador especializado en soluciones web modernas y eficientes. Experto en análisis de datos y automatización de procesos con Python.
        </p>
      </div>
    )
  }

  // PortfolioSerioMobile tiene fondo negro, así que usamos fondo negro
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: COLORS.BACKGROUND,
    }}>
      {children}
    </div>
  )
}

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Detectar si es un error de hooks
    const isHooksError = 
      error.message.includes('Rendered fewer hooks than expected') ||
      error.message.includes('Rendered more hooks than expected') ||
      error.message.includes('hooks') ||
      error.message.includes('Hook')

    console.error('Error capturado por ErrorBoundary:', error)
    console.error('Error Info:', errorInfo)
    
    if (isHooksError) {
      console.log('Error de hooks detectado, redirigiendo a versión simplificada')
    }

    this.setState({
      error,
      errorInfo,
    })
  }

  render() {
    if (this.state.hasError) {
      // Si es un error de hooks, mostrar versión móvil simplificada
      const isHooksError = 
        this.state.error?.message.includes('Rendered fewer hooks than expected') ||
        this.state.error?.message.includes('Rendered more hooks than expected') ||
        this.state.error?.message.includes('hooks') ||
        this.state.error?.message.includes('Hook')

      if (isHooksError) {
        // Mostrar versión móvil directamente, con fallback si falla
        return (
          <SimplePortfolioFallback>
            <PortfolioSerioMobile />
          </SimplePortfolioFallback>
        )
      }

      // Para otros errores, mostrar el fallback personalizado o un mensaje de error
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: COLORS.BACKGROUND,
          color: COLORS.TEXT_PRIMARY,
          padding: '20px',
          textAlign: 'center',
        }}>
          <h1 style={{ 
            fontSize: '24px', 
            marginBottom: '20px',
            color: COLORS.TEXT_PRIMARY,
            fontWeight: 'bold',
          }}>
            Algo salió mal
          </h1>
          <p style={{ 
            fontSize: '16px', 
            marginBottom: '30px',
            color: COLORS.TEXT_SECONDARY,
            maxWidth: '600px',
            lineHeight: '1.6',
          }}>
            {this.state.error?.message || 'Ha ocurrido un error inesperado'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null })
              window.location.reload()
            }}
            style={{
              padding: '12px 24px',
              background: COLORS.TEXT_PRIMARY,
              color: COLORS.BACKGROUND,
              border: `1px solid ${COLORS.BORDER}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.OVERLAY(0.9)
              e.currentTarget.style.color = COLORS.TEXT_PRIMARY
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = COLORS.TEXT_PRIMARY
              e.currentTarget.style.color = COLORS.BACKGROUND
            }}
          >
            Recargar página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

