import { useEffect, useState } from 'react'
import { Box, Button, HStack, IconButton, Spinner, Text } from '@chakra-ui/react'
import { ref, onValue, update } from 'firebase/database'
import { Link } from 'react-router-dom'
import { Pencil } from '@gravity-ui/icons'
import { database } from '../lib/firebase'
import type { Room } from '../pages/RoomFormPage'
import { getRoomIcon } from '../lib/roomIcons'
import SortableList from './SortableList'

const ROOMS_PATH = 'settings/rooms'

function RoomsSection() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const roomsRef = ref(database, ROOMS_PATH)
    return onValue(roomsRef, (snapshot) => {
      const value = snapshot.val() as Record<string, { name: string; budget?: number; order?: number }> | null
      const list = value ? Object.entries(value).map(([id, room]) => ({ id, ...room })) : []
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setRooms(list)
      setLoading(false)
    })
  }, [])

  const handleReorder = (reordered: Room[]) => {
    setRooms(reordered)
    const updates: Record<string, number> = {}
    reordered.forEach((room, index) => {
      updates[`${ROOMS_PATH}/${room.id}/order`] = index
    })
    update(ref(database), updates)
  }

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Text fontWeight="bold">Pomieszczenia</Text>
        <Button asChild colorPalette="primary" size="sm">
          <Link to="/ustawienia/pomieszczenia/nowe">+ Dodaj pomieszczenie</Link>
        </Button>
      </HStack>
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <Spinner size="md" />
        </Box>
      ) : (
        <SortableList
          items={rooms}
          onReorder={handleReorder}
          renderItem={(room, index) => {
            const RoomIcon = getRoomIcon(room.icon)
            return (
            <HStack
              justify="space-between"
              py={3}
              borderBottomWidth={index === rooms.length - 1 ? '0' : '1px'}
              borderColor="border"
            >
              <HStack gap={3}>
                <Box
                  boxSize="6"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="primary.300"
                >
                  <RoomIcon />
                </Box>
                <Text>{room.name}</Text>
              </HStack>
              <IconButton asChild aria-label="Edytuj pomieszczenie" variant="ghost" size="sm">
                <Link to={`/ustawienia/pomieszczenia/${room.id}`}>
                  <Pencil />
                </Link>
              </IconButton>
            </HStack>
            )
          }}
        />
      )}
      <Text mt={3} fontSize="sm" color="fg.muted">
        Pomieszczenia to takie kategorie dla naszych wpisów planu.
      </Text>
    </Box>
  )
}

export default RoomsSection
