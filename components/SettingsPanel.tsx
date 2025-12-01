'use client'

import { useState, useRef, useEffect } from 'react'
import { usePortfolioMode } from './PortfolioModeContext'
import { useLanguage } from './LanguageContext'

export default function SettingsPanel() {
  const { mode, setMode, isMobile } = usePortfolioMode()
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Ocultar el panel en móviles
  if (isMobile) {
    return null
  }

  // Cerrar el panel al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 1001,
      }}
    >
      {/* Botón del engranaje */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#FFFFFF',
          fontSize: '24px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) rotate(15deg)'
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)'
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)'
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
        }}
      >
        ⚙️
      </button>

      {/* Panel desplegable */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '70px',
            right: '0',
            width: language === 'en' ? '240px' : '220px',
            background: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '16px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
          }}
        >
          {/* Opción de Idioma */}
          <div
            style={{
              padding: '12px',
              marginBottom: '8px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
              {t('settings.language')}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setLanguage('es')}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  borderRadius: '4px',
                  background: language === 'es' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: language === 'es' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: language === 'es' ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (language !== 'es') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (language !== 'es') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  }
                }}
              >
                {t('settings.language.es')}
              </button>
              <button
                onClick={() => setLanguage('en')}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  borderRadius: '4px',
                  background: language === 'en' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: language === 'en' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: language === 'en' ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (language !== 'en') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (language !== 'en') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  }
                }}
              >
                {t('settings.language.en')}
              </button>
            </div>
          </div>

          {/* Opción de Modo Feliz */}
          <button
            onClick={() => {
              setMode(mode === 'feliz' ? 'serio' : 'feliz')
              setIsOpen(false)
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              background: mode === 'feliz' 
                ? 'rgba(138, 43, 226, 0.2)' 
                : 'rgba(255, 255, 255, 0.05)',
              border: mode === 'feliz'
                ? '1px solid rgba(138, 43, 226, 0.4)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = mode === 'feliz'
                ? 'rgba(138, 43, 226, 0.3)'
                : 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = mode === 'feliz' 
                ? 'rgba(138, 43, 226, 0.2)' 
                : 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <span>{mode === 'serio' ? t('settings.mode.happy') : t('settings.mode.serious')}</span>
            <span>{mode === 'serio' ? '😊' : '😐'}</span>
          </button>
        </div>
      )}
    </div>
  )
}

