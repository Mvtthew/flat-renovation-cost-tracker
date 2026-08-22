import { useEffect, useState } from 'react'
import { Box, Button, HStack, Input, InputGroup, NumberInput, Text, VStack } from '@chakra-ui/react'
import { ref, push, set, remove, get } from 'firebase/database'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from '@gravity-ui/icons'
import { database } from '../lib/firebase'
import RoomIconPicker from '../components/RoomIconPicker'
import { DEFAULT_ROOM_ICON } from '../lib/roomIcons'

const ROOMS_PATH = 'settings/rooms'

export interface Room {
  id: string
  name: string
  budget?: number
  order?: number
  icon?: string
}

function RoomFormPage() {
  const { roomId } = useParams<{ roomId?: string }>()
  const navigate = useNavigate()
  const goBack = () => navigate('/ustawienia')

  const [loading, setLoading] = useState(Boolean(roomId))
  const [name, setName] = useState('')
  const [budget, setBudget] = useState('')
  const [icon, setIcon] = useState(DEFAULT_ROOM_ICON)
  const [order, setOrder] = useState<number>()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!roomId) return
    let cancelled = false
    get(ref(database, `${ROOMS_PATH}/${roomId}`)).then((snapshot) => {
      if (cancelled) return
      const value = snapshot.val() as Omit<Room, 'id'> | null
      setName(value?.name ?? '')
      setBudget(typeof value?.budget === 'number' ? String(value.budget) : '')
      setIcon(value?.icon ?? DEFAULT_ROOM_ICON)
      setOrder(value?.order)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [roomId])

  const saveRoom = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) return
    setSaving(true)
    try {
      if (roomId) {
        await set(ref(database, `${ROOMS_PATH}/${roomId}`), {
          name: trimmedName,
          budget: budget === '' ? 0 : Number(budget),
          icon,
          order: order ?? 0,
        })
      } else {
        const snapshot = await get(ref(database, ROOMS_PATH))
        const existing = snapshot.val() as Record<string, Room> | null
        const maxOrder = existing
          ? Math.max(...Object.values(existing).map((room) => room.order ?? 0))
          : -1
        await push(ref(database, ROOMS_PATH), {
          name: trimmedName,
          budget: budget === '' ? 0 : Number(budget),
          order: maxOrder + 1,
          icon,
        })
      }
    } finally {
      setSaving(false)
      goBack()
    }
  }

  const deleteRoom = () => {
    if (!roomId) return
    if (!window.confirm(`Usunąć pomieszczenie „${name}”?`)) return
    remove(ref(database, `${ROOMS_PATH}/${roomId}`)).then(goBack)
  }

  return (
    <Box p={4} pb={8}>
      <HStack gap={2} mb={6}>
        <Box as="button" onClick={goBack} className="cursor-pointer" display="flex">
          <ArrowLeft />
        </Box>
        <Text fontSize="xl" fontWeight="bold">
          {roomId ? 'Edytuj pomieszczenie' : 'Dodaj pomieszczenie'}
        </Text>
      </HStack>

      <VStack gap={5} align="stretch" opacity={loading ? 0.5 : 1}>
        <Box display="flex" justifyContent="center">
          <RoomIconPicker value={icon} onChange={setIcon} />
        </Box>

        <Box>
          <Text fontSize="sm" color="fg.muted" mb={1}>
            Nazwa pomieszczenia
          </Text>
          <Input value={name} onChange={(event) => setName(event.target.value)} disabled={loading} />
        </Box>

        <Box>
          <Text fontSize="sm" color="fg.muted" mb={1}>
            Budżet pomieszczenia (opcjonalnie)
          </Text>
          <NumberInput.Root
            value={budget}
            onValueChange={(details) => setBudget(details.value)}
            min={0}
            disabled={loading}
            w="full"
          >
            <InputGroup endElement="zł">
              <NumberInput.Input />
            </InputGroup>
          </NumberInput.Root>
        </Box>
      </VStack>

      <VStack gap={3} mt={10} align="stretch">
        <Button colorPalette="primary" onClick={saveRoom} disabled={saving || loading || !name.trim()}>
          Zapisz
        </Button>
        {roomId && (
          <Button variant="outline" borderWidth="2px" borderColor="#CF4173" color="#CF4173" onClick={deleteRoom} disabled={loading}>
            Usuń pomieszczenie
          </Button>
        )}
      </VStack>
    </Box>
  )
}

export default RoomFormPage
