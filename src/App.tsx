import type { SVGProps } from 'react'
import { useEffect, useRef, useState } from 'react'
import { House, ChartLine, CirclePlus, Gear, FilePlus } from '@gravity-ui/icons'
import { Box, Dialog, HStack, Portal } from '@chakra-ui/react'
import { Routes, Route, Link, useLocation, useNavigate, type Location } from 'react-router-dom'
import { useIsDesktop } from './hooks/useIsDesktop'
import HomePage from './pages/HomePage'
import PlanPage from './pages/PlanPage'
import SettingsPage from './pages/SettingsPage'
import ShopFormPage from './pages/ShopFormPage'
import RoomFormPage from './pages/RoomFormPage'
import RoomDetailPage from './pages/RoomDetailPage'
import PlanItemFormPage from './pages/PlanItemFormPage'
import InvoiceFormPage from './pages/InvoiceFormPage'
import AllPlanItemsPage from './pages/AllPlanItemsPage'
import TabIcon from './components/TabIcon'
import SidebarNav from './components/SidebarNav'
import LoginScreen from './components/LoginScreen'
import Loader from './components/Loader'
import { useAuth } from './hooks/useAuth'

interface TabDef {
  label: string
  path: string
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element
}

const TABS: TabDef[] = [
  { label: 'Opcje', path: '/ustawienia', icon: Gear },
  { label: 'Przegląd', path: '/plan', icon: ChartLine },
  { label: 'Dom', path: '/', icon: House },
  { label: 'Faktura', path: '/faktury/nowa', icon: FilePlus },
  { label: 'Plan', path: '/dodaj', icon: CirclePlus },
]

const SIDEBAR_TABS: (TabDef & { modal?: boolean })[] = [
  { label: 'Dom', path: '/', icon: House },
  { label: 'Przegląd', path: '/plan', icon: ChartLine },
  { label: 'Plan', path: '/dodaj', icon: CirclePlus, modal: true },
  { label: 'Faktura', path: '/faktury/nowa', icon: FilePlus, modal: true },
  { label: 'Opcje', path: '/ustawienia', icon: Gear },
]

const MODAL_ROUTES = (
  <>
    <Route path="/ustawienia/sklepy/nowy" element={<ShopFormPage />} />
    <Route path="/ustawienia/sklepy/:shopId" element={<ShopFormPage />} />
    <Route path="/ustawienia/pomieszczenia/nowe" element={<RoomFormPage />} />
    <Route path="/ustawienia/pomieszczenia/:roomId" element={<RoomFormPage />} />
    <Route path="/dodaj" element={<PlanItemFormPage />} />
    <Route path="/pozycje/:itemId" element={<PlanItemFormPage />} />
    <Route path="/faktury/nowa" element={<InvoiceFormPage />} />
    <Route path="/faktury/:invoiceId" element={<InvoiceFormPage />} />
  </>
)

function ModalRouteOverlay({ backgroundLocation }: { backgroundLocation: Location }) {
  const location = useLocation()
  const navigate = useNavigate()
  const close = () => navigate(`${backgroundLocation.pathname}${backgroundLocation.search}`, { replace: true })

  return (
    <Dialog.Root open onOpenChange={(details) => !details.open && close()} size="lg" placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxH="85vh" overflowY="auto">
            <Routes location={location}>{MODAL_ROUTES}</Routes>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

function AppShell() {
  const location = useLocation()
  const isDesktop = useIsDesktop()
  const backgroundLocation = isDesktop
    ? (location.state as { backgroundLocation?: Location } | null)?.backgroundLocation
    : undefined
  const displayLocation = backgroundLocation ?? location

  const showTabBar =
    !displayLocation.pathname.startsWith('/ustawienia/sklepy') &&
    !displayLocation.pathname.startsWith('/ustawienia/pomieszczenia') &&
    !displayLocation.pathname.startsWith('/pozycje') &&
    !(displayLocation.pathname.startsWith('/faktury') && displayLocation.pathname !== '/faktury/nowa')

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
    ? tabBarHeight
    : 0

  return (
    <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} minH="100dvh" bg="bg">
      {showTabBar && <SidebarNav items={SIDEBAR_TABS} activePathname={displayLocation.pathname} />}
      <Box
        flex="1"
        overflowY="auto"
        pt={2}
        style={{ paddingBottom: contentBottomPadding }}
      >
        <Box maxW="full" mx="auto" px={{ base: 0, md: 6 }} py={{ base: 0, md: 6 }} h={{ md: '100%' }}>
          <Routes location={displayLocation}>
            <Route path="/" element={<HomePage />} />
            <Route path="/pokoje/:roomId" element={<RoomDetailPage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/ustawienia" element={<SettingsPage />} />
            <Route path="/pozycje" element={<AllPlanItemsPage />} />
            {MODAL_ROUTES}
          </Routes>
        </Box>
      </Box>
      {backgroundLocation && <ModalRouteOverlay backgroundLocation={backgroundLocation} />}
      {showTabBar && (
        <HStack
          ref={tabBarRef}
          as="nav"
          display={{ base: 'flex', md: 'none' }}
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
