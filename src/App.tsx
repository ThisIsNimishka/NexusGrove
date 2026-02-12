import { useEffect, useState } from 'react'
import { HistorySidebar } from '@/components/HistorySidebar'
import { ChatView } from '@/components/ChatView'
import { SettingsSidebar } from '@/components/SettingsSidebar'
import { SplashScreen } from '@/components/SplashScreen'
import { ToastProvider } from '@/components/ui/toast'
import { useChatStore } from '@/stores/chatStore'
import { useModelStore } from '@/stores/modelStore'
import { useSettingsStore } from '@/stores/settingsStore'

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash on first visit of session
    return !sessionStorage.getItem('splashShown')
  })
  const [showHistorySidebar, setShowHistorySidebar] = useState(false)
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false)

  const loadChats = useChatStore((s) => s.loadChats)
  const loadModels = useModelStore((s) => s.loadModels)
  const theme = useSettingsStore((s) => s.theme)

  const handleEnterApp = () => {
    sessionStorage.setItem('splashShown', 'true')
    setShowSplash(false)
  }

  // Initialize app
  useEffect(() => {
    // Apply theme on mount
    document.documentElement.setAttribute('data-theme', theme)

    // Load data
    loadChats()
    loadModels()
  }, [loadChats, loadModels, theme])

  if (showSplash) {
    return <SplashScreen onEnter={handleEnterApp} />
  }

  return (
    <ToastProvider>
      <div className="fixed inset-0 overflow-hidden bg-gradient-animated">
        <div className="relative z-10 h-full flex">
          {/* History Sidebar - hidden on mobile unless toggled */}
          <div
            className={`${showHistorySidebar ? 'translate-x-0' : '-translate-x-full'
              } md:translate-x-0 fixed md:relative z-30 transition-transform duration-300 ease-in-out`}
          >
            <HistorySidebar />
          </div>

          {/* Mobile overlay backdrop */}
          {showHistorySidebar && (
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-20"
              onClick={() => setShowHistorySidebar(false)}
            />
          )}

          {/* Chat View - always visible, takes full width on mobile */}
          <ChatView
            onToggleHistory={() => setShowHistorySidebar(!showHistorySidebar)}
            onToggleSettings={() => setShowSettingsSidebar(!showSettingsSidebar)}
          />

          {/* Mobile overlay backdrop for settings */}
          {showSettingsSidebar && (
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-20"
              onClick={() => setShowSettingsSidebar(false)}
            />
          )}

          {/* Settings Sidebar - hidden on mobile unless toggled */}
          <div
            className={`${showSettingsSidebar ? 'translate-x-0' : 'translate-x-full'
              } md:translate-x-0 fixed md:relative right-0 z-30 transition-transform duration-300 ease-in-out`}
          >
            <SettingsSidebar />
          </div>
        </div>
      </div>
    </ToastProvider>
  )
}

export default App
