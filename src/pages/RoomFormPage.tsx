import { useEffect, useState } from 'react'
import { Box, Button, HStack, Input, InputGroup, NumberInput, Text, VStack } from '@chakra-ui/react'
import { ref, push, set, remove, get } from 'firebase/database'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from '@gravity-ui/icons'
import { database } from '../lib/firebase'

const ROOMS_PATH = 'settings/rooms'

export interface Room {
  id: string
  name: string
  budget?: number
}

function RoomFormPage() {
  const { roomId } = useParams<{ roomId?: string }>()
  const navigate = useNavigate()
  const goBack = () => navigate('/ustawienia')

  const [loading, setLoading] = useState(Boolean(roomId))
  const [name, setName] = useState('')
  const [budget, setBudget] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!roomId) return
    let cancelled = false
    get(ref(database, `${ROOMS_PATH}/${roomId}`)).then((snapshot) => {
      if (cancelled) return
      const value = snapshot.val() as Omit<Room, 'id'> | null
      setName(value?.name ?? '')
      setBudget(typeof value?.budget === 'number' ? String(value.budget) : '')
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [roomId])

  const saveRoom = () => {
    const trimmedName = name.trim()
    if (!trimmedName) return
    const data = {
      name: trimmedName,
      budget: budget === '' ? 0 : Number(budget),
    }
    setSaving(true)
    const savePromise = roomId
      ? set(ref(database, `${ROOMS_PATH}/${roomId}`), data)
      : Promise.resolve(push(ref(database, ROOMS_PATH), data))
    savePromise.finally(() => {
      setSaving(false)
      goBack()
    })
  }

  const deleteRoom = () => {
    if (!roomId) return
    if (!window.confirm(`Usunąć pomieszczenie „${name}”?`)) return
    remove(ref(database, `${ROOMS_PATH}/${roomId}`)).then(goBack)
  }

  return (
    <Box p={4} pb={8}>
      <Text color="fg.muted" textAlign="center" mb={2}>
        Ustawienia pomieszczenia
      </Text>
      <HStack gap={2} mb={6}>
        <Box as="button" onClick={goBack} className="cursor-pointer" display="flex">
          <ArrowLeft />
        </Box>
        <Text fontSize="xl" fontWeight="bold">
          {roomId ? 'Edytuj pomieszczenie' : 'Dodaj pomieszczenie'}
        </Text>
      </HStack>

      <VStack gap={5} align="stretch" opacity={loading ? 0.5 : 1}>
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
            <InputGroup endElement="PLN">
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
          <Button variant="outline" colorPalette="red" onClick={deleteRoom} disabled={loading}>
            Usuń pomieszczenie
          </Button>
        )}
      </VStack>
    </Box>
  )
}

export default RoomFormPage
