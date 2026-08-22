import type { SVGProps } from 'react'
import { Box, Heading, HStack, Text, VStack } from '@chakra-ui/react'
import { House } from '@gravity-ui/icons'
import { Link, useLocation } from 'react-router-dom'

export interface SidebarNavItem {
  label: string
  path: string
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element
  /** Whether this item's target route should render as a dialog over the current page on desktop instead of navigating away — see modalRoute.ts. */
  modal?: boolean
}

interface SidebarNavProps {
  items: SidebarNavItem[]
  /** Pathname to highlight as active; defaults to the current route (overridden by App.tsx while a modal route dialog is open, so the underlying page stays highlighted). */
  activePathname?: string
}

function SidebarNav({ items, activePathname }: SidebarNavProps) {
  const location = useLocation()
  const pathname = activePathname ?? location.pathname

  return (
    <VStack
      as="nav"
      display={{ base: 'none', md: 'flex' }}
      w="260px"
      flexShrink={0}
      h="100dvh"
      position="sticky"
      top="0"
      borderRightWidth="3px"
      borderColor="border"
      bg="bg.panel"
      align="stretch"
      py={6}
      px={4}
      gap={1}
    >
      <HStack gap={2} mb={8} px={2}>
        <House width={26} height={26} color="var(--chakra-colors-primary-solid)" />
        <Heading fontSize="lg" fontWeight="black">
          Koszt mieszkania
        </Heading>
      </HStack>
      {items.map((item) => {
        const active = pathname === item.path || (item.path === '/' && pathname.startsWith('/pokoje/'))
        return (
          <Box asChild key={item.label} className="cursor-pointer">
            <Link to={item.path} state={item.modal ? { backgroundLocation: location } : undefined}>
              <HStack
                gap={3}
                px={3}
                py={2.5}
                borderRadius="md"
                bg={active ? 'primary.solid' : 'transparent'}
                color={active ? 'primary.contrast' : 'primary.solid'}
                opacity={active ? 1 : 0.7}
                transition="background 0.15s, opacity 0.15s"
                _hover={{ opacity: 1, bg: active ? 'primary.solid' : 'primary.subtle' }}
              >
                <item.icon width={20} height={20} />
                <Text fontSize="sm" fontWeight={active ? 'semibold' : 'normal'}>
                  {item.label}
                </Text>
              </HStack>
            </Link>
          </Box>
        )
      })}
    </VStack>
  )
}

export default SidebarNav
