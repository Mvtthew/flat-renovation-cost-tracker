import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { Box, HStack, IconButton } from '@chakra-ui/react'

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
}

const ACTION_WIDTH = 44
const ACTION_GAP = 8
const DIRECTION_THRESHOLD = 6

function SwipeableRow({ actions, children, borderBottomWidth, borderColor }: SwipeableRowProps) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startRef = useRef<{ x: number; y: number; offset: number } | null>(null)
  const directionRef = useRef<'horizontal' | 'vertical' | null>(null)

  const maxOffset = actions.length > 0 ? actions.length * ACTION_WIDTH + (actions.length - 1) * ACTION_GAP + (ACTION_GAP * 2) : 0

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (actions.length === 0) return
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
    setOffset(Math.min(maxOffset, Math.max(0, start.offset - dx)))
  }

  const endSwipe = () => {
    if (directionRef.current === 'horizontal') {
      setOffset((current) => (current > maxOffset / 2 ? maxOffset : 0))
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
      <Box
        bg="bg"
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

export default SwipeableRow
