import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { Box, HStack, IconButton } from '@chakra-ui/react'
import { Check } from '@gravity-ui/icons'
import { useIsDesktop } from '../hooks/useIsDesktop'

export interface SwipeAction {
  label: string
  icon: ReactNode
  onClick: () => void
  colorPalette?: string
}

interface SwipeableRowProps {
  actions: SwipeAction[]
  children: ReactNode
  borderBottomWidth?: string
  borderColor?: string
  onSwipeRight?: () => void
  selected?: boolean
}

const ACTION_WIDTH = 44
const ACTION_GAP = 8
const DIRECTION_THRESHOLD = 6
const SELECT_WIDTH = 72

function DesktopRow({ actions, children, borderBottomWidth, borderColor, onSwipeRight, selected }: SwipeableRowProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={2}
      bg={selected ? 'primary.subtle' : 'bg'}
      borderLeftWidth={selected ? '4px' : undefined}
      borderLeftColor={selected ? 'primary.solid' : undefined}
      borderBottomWidth={borderBottomWidth}
      borderColor={borderColor}
      pl={selected ? undefined : onSwipeRight ? '4px' : undefined}
    >
      {onSwipeRight && (
        <Box
          as="button"
          aria-label={selected ? 'Odznacz' : 'Zaznacz'}
          onClick={onSwipeRight}
          className="cursor-pointer"
          flexShrink={0}
          boxSize="20px"
          borderRadius="full"
          borderWidth="2px"
          borderColor="primary.solid"
          bg={selected ? 'primary.solid' : 'transparent'}
          color="primary.contrast"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {selected && <Check width={12} height={12} />}
        </Box>
      )}
      <Box flex="1" minW={0}>
        {children}
      </Box>
      {actions.length > 0 && (
        <HStack gap={2} flexShrink={0}>
          {actions.map((action) => (
            <IconButton
              key={action.label}
              aria-label={action.label}
              onClick={action.onClick}
              colorPalette="primary"
              variant="solid"
              size="sm"
              className="cursor-pointer"
            >
              {action.icon}
            </IconButton>
          ))}
        </HStack>
      )}
    </Box>
  )
}

function MobileRow({ actions, children, borderBottomWidth, borderColor, onSwipeRight, selected }: SwipeableRowProps) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startRef = useRef<{ x: number; y: number; offset: number } | null>(null)
  const directionRef = useRef<'horizontal' | 'vertical' | null>(null)

  const maxLeftOffset = actions.length > 0 ? actions.length * ACTION_WIDTH + (actions.length - 1) * ACTION_GAP + (ACTION_GAP * 2) : 0
  const maxRightOffset = onSwipeRight ? SELECT_WIDTH : 0

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (actions.length === 0 && !onSwipeRight) return
    startRef.current = { x: event.clientX, y: event.clientY, offset }
    directionRef.current = null
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = startRef.current
    if (!start) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y

    if (!directionRef.current) {
      if (Math.abs(dx) < DIRECTION_THRESHOLD && Math.abs(dy) < DIRECTION_THRESHOLD) return
      directionRef.current = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical'
      if (directionRef.current === 'horizontal') {
        setDragging(true)
        event.currentTarget.setPointerCapture(event.pointerId)
      }
    }

    if (directionRef.current !== 'horizontal') return

    event.preventDefault()
    setOffset(Math.min(maxLeftOffset, Math.max(-maxRightOffset, start.offset - dx)))
  }

  const endSwipe = () => {
    if (directionRef.current === 'horizontal') {
      if (offset < -maxRightOffset / 2) {
        onSwipeRight?.()
        setOffset(0)
      } else {
        setOffset(offset > maxLeftOffset / 2 ? maxLeftOffset : 0)
      }
    }
    startRef.current = null
    directionRef.current = null
    setDragging(false)
  }

  return (
    <Box position="relative" overflow="hidden" borderBottomWidth={borderBottomWidth} borderColor={borderColor}>
      {actions.length > 0 && (
        <HStack position="absolute" top={0} bottom={0} right={0} gap={`${ACTION_GAP}px`} pr={`${ACTION_GAP}px`}>
          {actions.map((action) => (
            <IconButton
              key={action.label}
              aria-label={action.label}
              onClick={() => {
                setOffset(0)
                action.onClick()
              }}
              colorPalette={action.colorPalette ?? 'primary'}
              variant="subtle"
              borderRadius="lg"
              boxSize={`${ACTION_WIDTH}px`}
            >
              {action.icon}
            </IconButton>
          ))}
        </HStack>
      )}
      {maxRightOffset > 0 && (
        <Box
          position="absolute"
          top={0}
          bottom={0}
          left={0}
          w={`${SELECT_WIDTH}px`}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="primary.solid"
          opacity={Math.min(1, -offset / maxRightOffset)}
        >
          <Check width={24} height={24} />
        </Box>
      )}
      <Box
        bg={selected ? 'primary.subtle' : 'bg'}
        borderLeftWidth={selected ? '4px' : undefined}
        borderLeftColor={selected ? 'primary.solid' : undefined}
        position="relative"
        touchAction="pan-y"
        style={{
          transform: `translateX(${-offset}px)`,
          transition: dragging ? 'none' : 'transform 0.2s ease',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endSwipe}
        onPointerCancel={endSwipe}
        onClickCapture={(event) => {
          if (offset > 0) {
            event.preventDefault()
            event.stopPropagation()
            setOffset(0)
          }
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

function SwipeableRow(props: SwipeableRowProps) {
  const isDesktop = useIsDesktop()
  return isDesktop ? <DesktopRow {...props} /> : <MobileRow {...props} />
}

export default SwipeableRow
