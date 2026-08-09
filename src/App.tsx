import { useState } from 'react'
import type { SVGProps } from 'react'
import { House, LayoutCells, Clock, CirclePlus, Gear } from '@gravity-ui/icons'
import { Box, HStack } from '@chakra-ui/react'
import HomePage from './pages/HomePage'
import RoomsPage from './pages/RoomsPage'
import TimelinePage from './pages/TimelinePage'
import AddPage from './pages/AddPage'
import SettingsPage from './pages/SettingsPage'
import TabIcon from './components/TabIcon'

interface TabDef {
  label: string
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element
  content: React.JSX.Element
}

const TABS: TabDef[] = [
  { label: 'Home', icon: House, content: <HomePage /> },
  { label: 'Rooms', icon: LayoutCells, content: <RoomsPage /> },
  { label: 'Timeline', icon: Clock, content: <TimelinePage /> },
  { label: 'Add', icon: CirclePlus, content: <AddPage /> },
  { label: 'Settings', icon: Gear, content: <SettingsPage /> },
]

function App() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <Box display="flex" flexDirection="column" minH="100svh">
      <Box flex="1" overflowY="auto" pb="16">
        {TABS[activeIndex].content}
      </Box>
      <HStack
        as="nav"
        className="fixed inset-x-0 bottom-0"
        justify="space-around"
        borderTopWidth="1px"
        borderColor="border"
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
