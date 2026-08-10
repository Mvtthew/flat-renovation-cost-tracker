import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Input,
  SegmentGroup,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { ref, push, set, remove, get } from 'firebase/database'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from '@gravity-ui/icons'
import { database } from '../lib/firebase'

const SHOPS_PATH = 'settings/shops'

export type PickupType = 'in-store' | 'delivery'

export interface Shop {
  id: string
  name: string
  website?: string
  pickupType?: PickupType
  notes?: string
  order?: number
}

function ShopFormPage() {
  const { shopId } = useParams<{ shopId?: string }>()
  const navigate = useNavigate()
  const goBack = () => navigate('/ustawienia')

  const [loading, setLoading] = useState(Boolean(shopId))
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [pickupType, setPickupType] = useState<PickupType>('delivery')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!shopId) return
    let cancelled = false
    get(ref(database, `${SHOPS_PATH}/${shopId}`)).then((snapshot) => {
      if (cancelled) return
      const value = snapshot.val() as Omit<Shop, 'id'> | null
      setName(value?.name ?? '')
      setWebsite(value?.website ?? '')
      setPickupType(value?.pickupType ?? 'delivery')
      setNotes(value?.notes ?? '')
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [shopId])

  const saveShop = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) return
    const data = {
      name: trimmedName,
      website: website.trim(),
      pickupType,
      notes: notes.trim(),
    }
    setSaving(true)
    try {
      if (shopId) {
        await set(ref(database, `${SHOPS_PATH}/${shopId}`), data)
      } else {
        const snapshot = await get(ref(database, SHOPS_PATH))
        const existing = snapshot.val() as Record<string, Shop> | null
        const maxOrder = existing
          ? Math.max(...Object.values(existing).map((shop) => shop.order ?? 0))
          : -1
        await push(ref(database, SHOPS_PATH), { ...data, order: maxOrder + 1 })
      }
    } finally {
      setSaving(false)
      goBack()
    }
  }

  const deleteShop = () => {
    if (!shopId) return
    if (!window.confirm(`Usunąć sklep „${name}”?`)) return
    remove(ref(database, `${SHOPS_PATH}/${shopId}`)).then(goBack)
  }

  return (
    <Box p={4} pb={8}>
      <Text color="fg.muted" textAlign="center" mb={2}>
        Ustawienia sklepu
      </Text>
      <HStack gap={2} mb={6}>
        <Box as="button" onClick={goBack} className="cursor-pointer" display="flex">
          <ArrowLeft />
        </Box>
        <Text fontSize="xl" fontWeight="bold">
          {shopId ? 'Edytuj sklep' : 'Dodaj sklep'}
        </Text>
      </HStack>

      <VStack gap={5} align="stretch" opacity={loading ? 0.5 : 1}>
        <Box>
          <Text fontSize="sm" color="fg.muted" mb={1}>
            Nazwa sklepu
          </Text>
          <Input value={name} onChange={(event) => setName(event.target.value)} disabled={loading} />
        </Box>

        <Box>
          <Text fontSize="sm" color="fg.muted" mb={1}>
            Strona internetowa
          </Text>
          <Input
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            disabled={loading}
          />
        </Box>

        <Box>
          <Text fontSize="sm" color="fg.muted" mb={1}>
            Domyślny sposób odbioru
          </Text>
          <SegmentGroup.Root
            value={pickupType}
            onValueChange={(details) => setPickupType((details.value as PickupType) ?? 'delivery')}
            disabled={loading}
          >
            <SegmentGroup.Indicator />
            <SegmentGroup.Items
              items={[
                { value: 'in-store', label: 'Na miejscu' },
                { value: 'delivery', label: 'Dostawa' },
              ]}
            />
          </SegmentGroup.Root>
        </Box>

        <Box>
          <Text fontSize="sm" color="fg.muted" mb={1}>
            Notatki
          </Text>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            disabled={loading}
          />
        </Box>
      </VStack>

      <VStack gap={3} mt={10} align="stretch">
        <Button colorPalette="primary" onClick={saveShop} disabled={saving || loading || !name.trim()}>
          Zapisz
        </Button>
        {shopId && (
          <Button variant="outline" borderWidth="2px" borderColor="#CF4173" color="#CF4173" onClick={deleteShop} disabled={loading}>
            Usuń sklep
          </Button>
        )}
      </VStack>
    </Box>
  )
}

export default ShopFormPage
