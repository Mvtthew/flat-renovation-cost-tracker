import type { SVGProps } from 'react'
import { useEffect, useRef, useState } from 'react'
import { House, ChartLine, CirclePlus, Gear, FilePlus } from '@gravity-ui/icons'
import { Box, HStack } from '@chakra-ui/react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import TimelinePage from './pages/TimelinePage'
import SettingsPage from './pages/SettingsPage'
import ShopFormPage from './pages/ShopFormPage'
import RoomFormPage from './pages/RoomFormPage'
import RoomDetailPage from './pages/RoomDetailPage'
import PlanItemFormPage from './pages/PlanItemFormPage'
import InvoiceFormPage from './pages/InvoiceFormPage'
import TabIcon from './components/TabIcon'
import LoginScreen from './components/LoginScreen'
import Loader from './components/Loader'
import { useAuth } from './hooks/useAuth'

interface TabDef {
  label: string
  path: string
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element
}

const TABS: TabDef[] = [
  { label: 'Dom', path: '/', icon: House },
  { label: 'Plan', path: '/plan', icon: ChartLine },
  { label: 'Ustawienia', path: '/ustawienia', icon: Gear },
  { label: 'Dodaj', path: '/dodaj', icon: CirclePlus },
  { label: 'Faktura', path: '/faktury/nowa', icon: FilePlus },
]

const TAB_BAR_GAP = 16 // px, matches the nav's mb={4}
const TAB_BAR_BREATHING_ROOM = 16 // px, extra space below the nav so content doesn't sit flush against it

function AppShell() {
  const location = useLocation()
  const showTabBar =
    !location.pathname.startsWith('/ustawienia/sklepy') &&
    !location.pathname.startsWith('/ustawienia/pomieszczenia') &&
    !location.pathname.startsWith('/pozycje') &&
    !(location.pathname.startsWith('/faktury') && location.pathname !== '/faktury/nowa')

  const tabBarRef = useRef<HTMLDivElement>(null)
  const [tabBarHeight, setTabBarHeight] = useState(0)

  useEffect(() => {
    const tabBarEl = tabBarRef.current
    if (!showTabBar || !tabBarEl) {
      setTabBarHeight(0)
      return
    }

    const observer = new ResizeObserver(([entry]) => {
      if (entry) setTabBarHeight(entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height)
    })
    observer.observe(tabBarEl)
    return () => observer.disconnect()
  }, [showTabBar])

  const contentBottomPadding = showTabBar
    ? tabBarHeight + TAB_BAR_GAP + TAB_BAR_BREATHING_ROOM
    : 0

  return (
    <Box display="flex" flexDirection="column" minH="100dvh" bg="bg">
      <Box
        flex="1"
        overflowY="auto"
        style={{ paddingBottom: contentBottomPadding }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pokoje/:roomId" element={<RoomDetailPage />} />
          <Route path="/plan" element={<TimelinePage />} />
          <Route path="/ustawienia" element={<SettingsPage />} />
          <Route path="/ustawienia/sklepy/nowy" element={<ShopFormPage />} />
          <Route path="/ustawienia/sklepy/:shopId" element={<ShopFormPage />} />
          <Route path="/ustawienia/pomieszczenia/nowe" element={<RoomFormPage />} />
          <Route path="/ustawienia/pomieszczenia/:roomId" element={<RoomFormPage />} />
          <Route path="/dodaj" element={<PlanItemFormPage />} />
          <Route path="/pozycje/:itemId" element={<PlanItemFormPage />} />
          <Route path="/faktury/nowa" element={<InvoiceFormPage />} />
          <Route path="/faktury/:invoiceId" element={<InvoiceFormPage />} />
        </Routes>
      </Box>
      {showTabBar && (
        <HStack
          ref={tabBarRef}
          as="nav"
          className="fixed inset-x-0 bottom-0"
          justify="space-around"
          borderTopWidth="3px"
          borderColor="border"
          bg="bg.panel"
          px={4}
          py={4}
        >
          {TABS.map((tab) => {
            const active =
              location.pathname === tab.path ||
              (tab.path === '/' && location.pathname.startsWith('/pokoje/'))
            return (
              <Box asChild key={tab.label} flex="1" className="cursor-pointer">
                <Link to={tab.path}>
                  <TabIcon icon={tab.icon} label={tab.label} active={active} />
                </Link>
              </Box>
            )
          })}
        </HStack>
      )}
    </Box>
  )
}

function App() {
  const { ready, signedOut, signInWithGoogle } = useAuth()

  if (signedOut) {
    return <LoginScreen onSignIn={() => void signInWithGoogle()} />
  }

  if (!ready) {
    return <Loader />
  }

  return <AppShell />
}

export default App
