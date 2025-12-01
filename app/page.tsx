'use client'

import { PortfolioModeProvider, usePortfolioMode } from '../components/PortfolioModeContext'
import { LanguageProvider } from '../components/LanguageContext'
import { ErrorBoundary } from '../components/ErrorBoundary'
import PortfolioFeliz from '../components/PortfolioFeliz'
import PortfolioSerio from '../components/PortfolioSerio'
import SettingsPanel from '../components/SettingsPanel'

function PortfolioContent() {
  const { mode } = usePortfolioMode()

  return (
    <ErrorBoundary>
      {mode === 'feliz' ? <PortfolioFeliz /> : <PortfolioSerio />}
      <SettingsPanel />
    </ErrorBoundary>
  )
}

export default function Home() {
  return (
    <LanguageProvider>
      <PortfolioModeProvider>
        <PortfolioContent />
      </PortfolioModeProvider>
    </LanguageProvider>
  )
}