import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './i18n'
import { DomTranslator } from './domTranslate'
import { ScanSoundProvider } from './scanSound'
import { ThemeProvider } from './theme'
import { readCardHash } from './lib/cardLink'
import { PublicCardViewer } from './views/PublicCardViewer'
import { IS_FORGE } from './forge/config'
import { ForgeApp } from './forge/ForgeApp'

function Root() {
  const [cardData, setCardData] = useState<string | null>(() => readCardHash())

  useEffect(() => {
    const onHashChange = () => setCardData(readCardHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (IS_FORGE) return <ForgeApp />
  return cardData ? <PublicCardViewer data={cardData} /> : <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <DomTranslator />
        <ScanSoundProvider>
          <Root />
        </ScanSoundProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)

