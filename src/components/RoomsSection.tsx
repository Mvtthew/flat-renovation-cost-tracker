import { useEffect, useRef, useState } from 'react'
import { Box, Button, HStack, IconButton, Spinner, Text, VStack } from '@chakra-ui/react'
import { ref, onValue } from 'firebase/database'
import { Link } from 'react-router-dom'
import { Circle, Pencil } from '@gravity-ui/icons'
import AnimateHeight from 'react-animate-height'
import { database } from '../lib/firebase'
import type { Room } from '../pages/RoomFormPage'

const ROOMS_PATH = 'settings/rooms'

function RoomsSection() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const spinnerRef = useRef<HTMLDivElement>(null)
  const [spinnerHeight, setSpinnerHeight] = useState<number>()

  useEffect(() => {
    if (spinnerRef.current) {
      setSpinnerHeight(spinnerRef.current.offsetHeight)
    }
  }, [])

  useEffect(() => {
    const roomsRef = ref(database, ROOMS_PATH)
    return onValue(roomsRef, (snapshot) => {
      const value = snapshot.val() as Record<string, { name: string; budget?: number }> | null
      setRooms(value ? Object.entries(value).map(([id, room]) => ({ id, ...room })) : [])
      setLoading(false)
    })
  }, [])

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Text fontWeight="bold">Pomieszczenia</Text>
        <Button asChild colorPalette="primary" size="sm">
          <Link to="/ustawienia/pomieszczenia/nowe">+ Dodaj pomieszczenie</Link>
        </Button>
      </HStack>
      <AnimateHeight height={loading ? (spinnerHeight ?? 'auto') : 'auto'} duration={250}>
        {loading ? (
          <Box ref={spinnerRef} display="flex" justifyContent="center" py={4}>
            <Spinner size="md" />
          </Box>
        ) : (
          <VStack gap={0} align="stretch" divideY="1px" borderColor="border">
            {rooms.map((room) => (
              <HStack key={room.id} justify="space-between" py={3}>
                <HStack gap={3}>
                  <Box
                    boxSize="6"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="primary.300"
                  >
                    <Circle />
                  </Box>
                  <Text>{room.name}</Text>
                </HStack>
                <IconButton asChild aria-label="Edytuj pomieszczenie" variant="ghost" size="sm">
                  <Link to={`/ustawienia/pomieszczenia/${room.id}`}>
                    <Pencil />
                  </Link>
                </IconButton>
              </HStack>
            ))}
          </VStack>
        )}
      </AnimateHeight>
      <Text mt={3} fontSize="sm" color="fg.muted">
        Pomieszczenia to takie kategorie dla naszych wpisów planu.
      </Text>
    </Box>
  )
}

export default RoomsSection
