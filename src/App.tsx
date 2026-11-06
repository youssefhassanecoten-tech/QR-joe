import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import type { CardProfile, ContentState, HistoryEntry, QrDesign, View } from './types'
import { defaultContent, defaultDesign, starterCard } from './types'
import { parseTonePayload } from './lib/audio'
import { usePersistentState } from './hooks/usePersistentState'
import { VERSION } from './version'
import { MobileNav, Sidebar, BrandMark } from './components/Navigation'
import { Spinner } from './components/ui'
import { SiteFooter } from './components/SiteFooter'
import { Tutorial } from './components/Tutorial'
import { UpdateBanner } from './components/UpdateBanner'
import { ThemeToggle } from './components/ThemeToggle'
import { LanguageToggle } from './components/LanguageToggle'
import { IS_IC } from './ic/config'
import { AutoBackupProvider } from './ic/AutoBackupProvider'

const StudioView = lazy(() => import('./views/Studio').then((module) => ({ default: module.Studio })))
const ScannerView = lazy(() => import('./views/Scanner').then((module) => ({ default: module.Scanner })))
const CardsView = lazy(() => import('./views/Cards').then((module) => ({ default: module.Cards })))
const HistoryView = lazy(() => import('./views/History').then((module) => ({ default: module.History })))
const BackupView = lazy(() => import('./views/BackupView').then((module) => ({ default: module.BackupView })))
const LegalView = lazy(() => import('./views/LegalView').then((module) => ({ default: module.LegalView })))
const VersionView = lazy(() => import('./views/VersionView').then((module) => ({ default: module.VersionView })))
const DataBackupView = lazy(() => import('./views/DataBackupView').then((module) => ({ default: module.DataBackupView })))

const TUTORIAL_KEY = 'qrjoe:tutorial-version'

export default function App() {
  const [view, setView] = useState<View>('studio')
  const [tutorialMode, setTutorialMode] = useState<'full' | 'update' | null>(null)
  const [content, setContent] = usePersistentState<ContentState>('qrjoe:v1:content', defaultContent)
  const [design, setDesign] = usePersistentState<QrDesign>('qrjoe:v1:design', defaultDesign)
  const [profiles, setProfiles] = usePersistentState<CardProfile[]>('qrjoe:v1:profiles', [starterCard()])
  const [history, setHistory] = usePersistentState<HistoryEntry[]>('qrjoe:v1:history', [])

  useEffect(() => {
    let seen: string | null = null
    try {
      seen = localStorage.getItem(TUTORIAL_KEY)
    } catch {
      seen = null
    }
    if (seen === VERSION) return
    const timer = window.setTimeout(() => {
      setTutorialMode(seen ? 'update' : 'full')
    }, 1100)
    return () => window.clearTimeout(timer)
  }, [])

  const closeTutorial = useCallback(() => {
    try {
      localStorage.setItem(TUTORIAL_KEY, VERSION)
    } catch {
      // storage may be unavailable
    }
    setTutorialMode(null)
  }, [])

  const startTutorial = useCallback(() => setTutorialMode('full'), [])

  const addHistory = useCallback(
    (entry: HistoryEntry) => {
      setHistory((prev) => [entry, ...prev].slice(0, 300))
    },
    [setHistory],
  )

  const deleteHistory = useCallback(
    (id: string) => {
      setHistory((prev) => prev.filter((entry) => entry.id !== id))
    },
    [setHistory],
  )

  const clearHistory = useCallback(() => setHistory([]), [setHistory])

  const useCardInStudio = useCallback(
    (profile: CardProfile) => {
      setContent((prev) => ({ ...prev, type: 'vcard', cardId: profile.id }))
      setView('studio')
    },
    [setContent],
  )

  const reuseData = useCallback(
    (data: string) => {
      setContent((prev) => {
        const value = data.trim()
        if (/^https?:\/\//i.test(value)) {
          return { ...prev, type: 'url', url: value }
        }
        const tone = parseTonePayload(value)
        if (tone) {
          return {
            ...prev,
            type: 'music',
            musicMode: 'tone',
            musicBpm: tone.bpm,
            musicNotes: value.split(':').slice(4).join(':'),
          }
        }
        return { ...prev, type: 'text', text: data }
      })
      setView('studio')
    },
    [setContent],
  )

  const shell = (
    <div className="relative min-h-svh overflow-x-clip">
      <div aria-hidden="true" className="app-backdrop pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-52 -top-52 h-[42rem] w-[42rem] rounded-full bg-brand-600/20 blur-[130px]" />
        <div className="absolute -right-52 top-1/4 h-[36rem] w-[36rem] rounded-full bg-aqua-500/10 blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 h-[30rem] w-[30rem] rounded-full bg-fuchsia-600/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1560px]">
        <Sidebar view={view} onChange={setView} onOpenVersion={() => setView('version')} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/6 bg-ink-950/75 px-4 py-3 backdrop-blur-xl lg:hidden">
            <BrandMark />
            <div className="flex items-center gap-1.5">
              <LanguageToggle />
              <ThemeToggle compact />
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-14 lg:pt-8">
            <UpdateBanner />
            <Suspense
              fallback={
                <div className="flex min-h-[50vh] items-center justify-center">
                  <Spinner className="h-6 w-6 text-brand-300" />
                </div>
              }
            >
              {view === 'studio' ? (
                <StudioView
                  content={content}
                  setContent={setContent}
                  design={design}
                  setDesign={setDesign}
                  profiles={profiles}
                  onGoToCards={() => setView('cards')}
                  onAddHistory={addHistory}
                />
              ) : null}

              {view === 'scan' ? (
                <ScannerView
                  onDetected={addHistory}
                  history={history}
                  onDeleteHistory={deleteHistory}
                  onReuseData={reuseData}
                  onGoToHistory={() => setView('history')}
                />
              ) : null}

              {view === 'cards' ? (
                <CardsView
                  profiles={profiles}
                  setProfiles={setProfiles}
                  design={design}
                  onUseInStudio={useCardInStudio}
                  onAddHistory={addHistory}
                />
              ) : null}

              {view === 'history' ? (
                <HistoryView
                  entries={history}
                  onDelete={deleteHistory}
                  onClear={clearHistory}
                  onReuse={reuseData}
                />
              ) : null}

              {view === 'backup' && IS_IC ? <BackupView /> : null}
              {view === 'legal' ? <LegalView onBack={() => setView('studio')} /> : null}
              {view === 'version' ? (
                <VersionView onBack={() => setView('studio')} onReplayTutorial={startTutorial} />
              ) : null}
              {view === 'data' ? <DataBackupView onBack={() => setView('studio')} /> : null}
            </Suspense>

            <SiteFooter
              onOpenLegal={() => setView('legal')}
              onOpenVersion={() => setView('version')}
              onReplayTutorial={startTutorial}
              onOpenData={() => setView('data')}
            />
          </main>

          <MobileNav view={view} onChange={setView} />
        </div>
      </div>
    </div>
  )

  return (
    <>
      <AutoBackupProvider onOpenSettings={() => setView('backup')}>{shell}</AutoBackupProvider>
      <Tutorial mode={tutorialMode} onClose={closeTutorial} onNavigate={setView} />
    </>
  )
}

