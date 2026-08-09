import { useState } from 'react'
import type { SVGProps } from 'react'
import { House, LayoutCells, ChartLine, CirclePlus, Gear } from '@gravity-ui/icons'
import { Box, HStack } from '@chakra-ui/react'
import HomePage from './pages/HomePage'
import RoomsPage from './pages/RoomsPage'
import TimelinePage from './pages/TimelinePage'
import AddPage from './pages/AddPage'
import SettingsPage from './pages/SettingsPage'
import TabIcon from './components/TabIcon'
import LoginScreen from './components/LoginScreen'
import Loader from './components/Loader'
import { useAuth } from './hooks/useAuth'

interface TabDef {
  label: string
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element
  content: React.JSX.Element
}

const TABS: TabDef[] = [
  { label: 'Dom', icon: House, content: <HomePage /> },
  { label: 'Pokoje', icon: LayoutCells, content: <RoomsPage /> },
  { label: 'Plan', icon: ChartLine, content: <TimelinePage /> },
  { label: 'Ustawienia', icon: Gear, content: <SettingsPage /> },
  { label: 'Dodaj', icon: CirclePlus, content: <AddPage /> },
]

function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const { ready, signedOut, signInWithGoogle } = useAuth()

  if (signedOut) {
    return <LoginScreen onSignIn={() => void signInWithGoogle()} />
  }

  if (!ready) {
    return <Loader />
  }

  return (
    <Box display="flex" flexDirection="column" minH="100svh" bg="bg">
      <Box flex="1" overflowY="auto" overscrollBehavior="none" pb="24">
        {TABS[activeIndex].content}
      </Box>
      <HStack
        as="nav"
        className="fixed inset-x-0 bottom-0"
        justify="space-around"
        mx={4}
        mb={4}
        borderWidth="3px"
        borderColor="border"
        borderRadius="xl"
        bg="bg.panel"
        py={2}
      >
        {TABS.map((tab, index) => (
          <Box
            as="button"
            key={tab.label}
            onClick={() => setActiveIndex(index)}
            flex="1"
            className="cursor-pointer"
          >
            <TabIcon icon={tab.icon} label={tab.label} active={activeIndex === index} />
          </Box>
        ))}
      </HStack>
    </Box>
  )
}

export default App
