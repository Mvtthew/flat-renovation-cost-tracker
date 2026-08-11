import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Input,
  InputGroup,
  NumberInput,
  Portal,
  SegmentGroup,
  Select,
  Text,
  Textarea,
  VStack,
  createListCollection,
} from '@chakra-ui/react'
import { ref, push, set, remove, get, onValue } from 'firebase/database'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Box as BoxIcon, CirclePlus, Xmark } from '@gravity-ui/icons'
import { database } from '../lib/firebase'
import AppDatePicker from '../components/AppDatePicker'
import type { Room } from './RoomFormPage'
import type { Shop, PickupType } from './ShopFormPage'

const PLAN_ITEMS_PATH = 'planItems'
const ROOMS_PATH = 'settings/rooms'
const SHOPS_PATH = 'settings/shops'

export interface PlanItem {
  id: string
  roomId: string
  name: string
  link?: string
  shopId?: string
  price?: number
  amount?: number
  notes?: string
  targetDate?: string
  pickupType: PickupType
  deliveryCost?: number
  deliveryDays?: number
  purchased?: boolean
  order?: number
}

function PlanItemFormPage() {
  const { itemId } = useParams<{ itemId?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const goBack = () => navigate(-1)

  const [rooms, setRooms] = useState<Room[]>([])
  const [shops, setShops] = useState<Shop[]>([])

  const [loading, setLoading] = useState(Boolean(itemId))
  const [roomId, setRoomId] = useState(searchParams.get('roomId') ?? '')
  const [name, setName] = useState('')
  const [link, setLink] = useState('')
  const [shopId, setShopId] = useState('')
  const [price, setPrice] = useState('')
  const [amount, setAmount] = useState('1')
  const [notes, setNotes] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [pickupType, setPickupType] = useState<PickupType>('in-store')
  const [deliveryCost, setDeliveryCost] = useState('')
  const [deliveryDays, setDeliveryDays] = useState('')
  const [purchased, setPurchased] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    return onValue(ref(database, ROOMS_PATH), (snapshot) => {
      const value = snapshot.val() as Record<string, { name: string; budget?: number; order?: number }> | null
      const list = value ? Object.entries(value).map(([id, room]) => ({ id, ...room })) : []
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setRooms(list)
    })
  }, [])

  useEffect(() => {
    return onValue(ref(database, SHOPS_PATH), (snapshot) => {
      const value = snapshot.val() as Record<
        string,
        { name: string; website?: string; pickupType?: PickupType; notes?: string; order?: number }
      > | null
      const list = value ? Object.entries(value).map(([id, shop]) => ({ id, ...shop })) : []
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setShops(list)
    })
  }, [])

  useEffect(() => {
    if (!itemId) return
    let cancelled = false
    get(ref(database, `${PLAN_ITEMS_PATH}/${itemId}`)).then((snapshot) => {
      if (cancelled) return
      const value = snapshot.val() as Omit<PlanItem, 'id'> | null
      setRoomId(value?.roomId ?? '')
      setName(value?.name ?? '')
      setLink(value?.link ?? '')
      setShopId(value?.shopId ?? '')
      setPrice(typeof value?.price === 'number' ? String(value.price) : '')
      setAmount(typeof value?.amount === 'number' ? String(value.amount) : '1')
      setNotes(value?.notes ?? '')
      setTargetDate(value?.targetDate ?? '')
      setPickupType(value?.pickupType ?? 'in-store')
      setDeliveryCost(typeof value?.deliveryCost === 'number' ? String(value.deliveryCost) : '')
      setDeliveryDays(typeof value?.deliveryDays === 'number' ? String(value.deliveryDays) : '')
      setPurchased(value?.purchased ?? false)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [itemId])

  const isDelivery = pickupType === 'delivery'

  const canSave = useMemo(() => Boolean(roomId && name.trim()), [roomId, name])

  const roomsCollection = useMemo(
    () =>
      createListCollection({
        items: rooms,
        itemToValue: (room) => room.id,
        itemToString: (room) => room.name,
      }),
    [rooms],
  )

  const shopsCollection = useMemo(
    () =>
      createListCollection({
        items: shops,
        itemToValue: (shop) => shop.id,
        itemToString: (shop) => shop.name,
      }),
    [shops],
  )

  const saveItem = async () => {
    if (!canSave) return
    const data: Omit<PlanItem, 'id'> = {
      roomId,
      name: name.trim(),
      link: link.trim(),
      shopId,
      price: price === '' ? 0 : Number(price),
      amount: amount === '' ? 1 : Number(amount),
      notes: notes.trim(),
      targetDate,
      pickupType,
      deliveryCost: deliveryCost === '' ? 0 : Number(deliveryCost),
      deliveryDays: deliveryDays === '' ? 0 : Number(deliveryDays),
      purchased,
    }
    setSaving(true)
    try {
      if (itemId) {
        await set(ref(database, `${PLAN_ITEMS_PATH}/${itemId}`), data)
      } else {
        const snapshot = await get(ref(database, PLAN_ITEMS_PATH))
        const existing = snapshot.val() as Record<string, PlanItem> | null
        const roomItems = existing ? Object.values(existing).filter((item) => item.roomId === roomId) : []
        const maxOrder = roomItems.length ? Math.max(...roomItems.map((item) => item.order ?? 0)) : -1
        await push(ref(database, PLAN_ITEMS_PATH), { ...data, order: maxOrder + 1 })
      }
    } finally {
      setSaving(false)
      goBack()
    }
  }

  const deleteItem = () => {
    if (!itemId) return
    if (!window.confirm(`Usunąć pozycję „${name}”?`)) return
    remove(ref(database, `${PLAN_ITEMS_PATH}/${itemId}`)).then(goBack)
  }

  return (
    <Box p={4} pb={8}>
      <HStack justify="space-between" mb={1}>
        <HStack gap={2}>
          {itemId ? <BoxIcon /> : <CirclePlus />}
          <Text fontSize="xl" fontWeight="bold">
            {itemId ? 'Edytuj zaplanowany koszt' : 'Zaplanuj koszt'}
          </Text>
        </HStack>
        <Box as="button" onClick={goBack} className="cursor-pointer" display="flex">
          <Xmark />
        </Box>
      </HStack>
      <Text fontSize="sm" color="fg.muted" mb={6}>
        Bez zakupu — to tylko szacunek
      </Text>

      <VStack gap={5} align="stretch" opacity={loading ? 0.5 : 1}>
        <Box>
          <Text fontSize="sm" color="fg.muted" mb={1}>
            Pomieszczenie
          </Text>
          <Select.Root
            collection={roomsCollection}
            value={roomId ? [roomId] : []}
            onValueChange={(details) => setRoomId(details.value[0] ?? '')}
            disabled={loading}
          >
            <Select.Control>
              <Select.Trigger borderWidth="2px">
                <Select.ValueText placeholder="Wybierz pomieszczenie" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {roomsCollection.items.map((room) => (
                    <Select.Item key={room.id} item={room}>
                      <Select.ItemText>{room.name}</Select.ItemText>
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Box>

        <Box>
          <Text fontSize="sm" color="fg.muted" mb={1}>
            Nazwa
          </Text>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="np. Blat kuchenny"
            disabled={loading}
          />
        </Box>

        <Box>
          <Text fontSize="sm" color="fg.muted" mb={1}>
            Link
          </Text>
          <Input
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder="https://..."
            disabled={loading}
          />
        </Box>

        <Box>
          <Text fontSize="sm" color="fg.muted" mb={1}>
            Sklep / dostawca
          </Text>
          <Select.Root
            collection={shopsCollection}
            value={shopId ? [shopId] : []}
            onValueChange={(details) => {
              const nextShopId = details.value[0] ?? ''
              setShopId(nextShopId)
              const nextShop = shops.find((shop) => shop.id === nextShopId)
              if (nextShop?.pickupType) {
                setPickupType(nextShop.pickupType)
              }
            }}
            disabled={loading}
          >
            <Select.Control>
              <Select.Trigger borderWidth="2px">
                <Select.ValueText placeholder="Wybierz sklep" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {shopsCollection.items.map((shop) => (
                    <Select.Item key={shop.id} item={shop}>
                      <Select.ItemText>{shop.name}</Select.ItemText>
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Box>

        <HStack gap={3} align="start">
          <Box flex="1">
            <Text fontSize="sm" color="fg.muted" mb={1}>
              Cena (za szt.)
            </Text>
            <NumberInput.Root value={price} onValueChange={(details) => setPrice(details.value)} min={0} disabled={loading} w="full">
              <InputGroup endElement="zł">
                <NumberInput.Input />
              </InputGroup>
            </NumberInput.Root>
          </Box>
          <Box w="28">
            <Text fontSize="sm" color="fg.muted" mb={1}>
              Ilość
            </Text>
            <NumberInput.Root value={amount} onValueChange={(details) => setAmount(details.value)} min={1} disabled={loading} w="full">
              <NumberInput.Input />
            </NumberInput.Root>
          </Box>
        </HStack>

        <Box>
          <Text fontSize="sm" color="fg.muted" mb={1}>
            Notatki
          </Text>
          <Textarea
            borderWidth="2px"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            disabled={loading}
          />
        </Box>

        <Box>
          <Text fontSize="sm" color="fg.muted" mb={1}>
            Data docelowa
          </Text>
          <AppDatePicker value={targetDate} onValueChange={setTargetDate} disabled={loading} />
        </Box>

        <Box>
          <Text fontSize="sm" color="fg.muted" mb={1}>
            Odbiór
          </Text>
          <SegmentGroup.Root
            value={pickupType}
            onValueChange={(details) => setPickupType((details.value as PickupType) ?? 'in-store')}
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

        {isDelivery && (
          <>
            <Box>
              <Text fontSize="sm" color="fg.muted" mb={1}>
                Koszt dostawy
              </Text>
              <NumberInput.Root
                value={deliveryCost}
                onValueChange={(details) => setDeliveryCost(details.value)}
                min={0}
                disabled={loading}
                w="full"
              >
                <InputGroup endElement="zł">
                  <NumberInput.Input />
                </InputGroup>
              </NumberInput.Root>
            </Box>

            <Box>
              <Text fontSize="sm" color="fg.muted" mb={1}>
                Szacowany czas dostawy
              </Text>
              <NumberInput.Root
                value={deliveryDays}
                onValueChange={(details) => setDeliveryDays(details.value)}
                min={0}
                disabled={loading}
                w="full"
              >
                <InputGroup endElement="dni">
                  <NumberInput.Input />
                </InputGroup>
              </NumberInput.Root>
            </Box>
          </>
        )}
      </VStack>

      <VStack gap={3} mt={10} align="stretch">
        <Button colorPalette="primary" onClick={saveItem} disabled={saving || loading || !canSave}>
          {itemId ? 'Zapisz zmiany' : 'Dodaj do planu'}
        </Button>
        {itemId && (
          <Button variant="outline" borderWidth="2px" borderColor="#CF4173" color="#CF4173" onClick={deleteItem} disabled={loading}>
            Usuń pozycję
          </Button>
        )}
      </VStack>
    </Box>
  )
}

export default PlanItemFormPage
