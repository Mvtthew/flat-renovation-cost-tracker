import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  HStack,
  IconButton,
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
import { ref, push, set, remove, get, onValue, update } from 'firebase/database'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, FileDollar, FilePlus, Xmark } from '@gravity-ui/icons'
import { database } from '../lib/firebase'
import AppDatePicker from '../components/AppDatePicker'
import type { Room } from './RoomFormPage'
import type { PlanItem } from './PlanItemFormPage'
import type { PickupType } from './ShopFormPage'

const INVOICES_PATH = 'invoices'
const ROOMS_PATH = 'settings/rooms'
const PLAN_ITEMS_PATH = 'planItems'

export interface Invoice {
  id: string
  roomId: string
  linkedItemIds: string[]
  pickupType: PickupType
  title: string
  realCost: number
  deliveryCost?: number
  date: string
  notes?: string
  order?: number
}

const currencyFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  maximumFractionDigits: 0,
})

function InvoiceFormPage() {
  const { invoiceId } = useParams<{ invoiceId?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const goBack = () => navigate(-1)

  const [rooms, setRooms] = useState<Room[]>([])
  const [planItems, setPlanItems] = useState<PlanItem[]>([])

  const [loading, setLoading] = useState(Boolean(invoiceId))
  const [roomId, setRoomId] = useState(searchParams.get('roomId') ?? '')
  const [linkedItemIds, setLinkedItemIds] = useState<string[]>(
    searchParams.get('itemIds')?.split(',').filter(Boolean) ?? [],
  )
  const [pickupType, setPickupType] = useState<PickupType>('in-store')
  const [title, setTitle] = useState('')
  const [realCost, setRealCost] = useState('')
  const [deliveryCost, setDeliveryCost] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    return onValue(ref(database, ROOMS_PATH), (snapshot) => {
      const value = snapshot.val() as Record<string, { name: string; budget?: number; order?: number }> | null
      const list = value ? Object.entries(value).map(([id, room]) => ({ id, ...room })) : []
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setRooms(list)
    })
  }, [])

  useEffect(() => {
    return onValue(ref(database, PLAN_ITEMS_PATH), (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<PlanItem, 'id'>> | null
      setPlanItems(value ? Object.entries(value).map(([id, item]) => ({ id, ...item })) : [])
    })
  }, [])

  useEffect(() => {
    if (!invoiceId) return
    let cancelled = false
    get(ref(database, `${INVOICES_PATH}/${invoiceId}`)).then((snapshot) => {
      if (cancelled) return
      const value = snapshot.val() as Omit<Invoice, 'id'> | null
      setRoomId(value?.roomId ?? '')
      setLinkedItemIds(value?.linkedItemIds ?? [])
      setPickupType(value?.pickupType ?? 'in-store')
      setTitle(value?.title ?? '')
      setRealCost(typeof value?.realCost === 'number' ? String(value.realCost) : '')
      setDeliveryCost(typeof value?.deliveryCost === 'number' ? String(value.deliveryCost) : '')
      setDate(value?.date ?? '')
      setNotes(value?.notes ?? '')
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [invoiceId])

  const roomItems = useMemo(
    () => planItems.filter((item) => item.roomId === roomId),
    [planItems, roomId],
  )

  const itemsCollection = useMemo(
    () =>
      createListCollection({
        items: roomItems,
        itemToValue: (item) => item.id,
        itemToString: (item) => item.name,
      }),
    [roomItems],
  )

  const roomsCollection = useMemo(
    () =>
      createListCollection({
        items: rooms,
        itemToValue: (room) => room.id,
        itemToString: (room) => room.name,
      }),
    [rooms],
  )

  const linkedItems = useMemo(
    () => roomItems.filter((item) => linkedItemIds.includes(item.id)),
    [roomItems, linkedItemIds],
  )

  const isDelivery = pickupType === 'delivery'

  const canSave = useMemo(
    () => Boolean(roomId && date && linkedItemIds.length > 0),
    [roomId, date, linkedItemIds],
  )

  const saveInvoice = async () => {
    if (!canSave) return
    const data: Omit<Invoice, 'id' | 'order'> = {
      roomId,
      linkedItemIds,
      pickupType,
      title: title.trim(),
      realCost: realCost === '' ? 0 : Number(realCost),
      deliveryCost: deliveryCost === '' ? 0 : Number(deliveryCost),
      date,
      notes: notes.trim(),
    }
    setSaving(true)
    try {
      if (invoiceId) {
        await set(ref(database, `${INVOICES_PATH}/${invoiceId}`), data)
      } else {
        const snapshot = await get(ref(database, INVOICES_PATH))
        const existing = snapshot.val() as Record<string, Invoice> | null
        const roomInvoices = existing ? Object.values(existing).filter((invoice) => invoice.roomId === roomId) : []
        const maxOrder = roomInvoices.length ? Math.max(...roomInvoices.map((invoice) => invoice.order ?? 0)) : -1
        await push(ref(database, INVOICES_PATH), { ...data, order: maxOrder + 1 })
      }
      if (linkedItemIds.length > 0) {
        const updates: Record<string, boolean> = {}
        for (const itemId of linkedItemIds) {
          updates[`${PLAN_ITEMS_PATH}/${itemId}/purchased`] = true
        }
        await update(ref(database), updates)
      }
    } finally {
      setSaving(false)
      goBack()
    }
  }

  const deleteInvoice = () => {
    if (!invoiceId) return
    if (!window.confirm('Usunąć fakturę?')) return
    remove(ref(database, `${INVOICES_PATH}/${invoiceId}`)).then(goBack)
  }

  return (
    <Box p={4} pb={8}>
      <HStack justify="space-between" mb={6}>
        <HStack gap={2}>
          {invoiceId ? <FileDollar /> : <FilePlus />}
          <Text fontSize="xl" fontWeight="bold">
            {invoiceId ? 'Edycja faktury' : 'Nowa faktura'}
          </Text>
        </HStack>
        <Box as="button" onClick={goBack} className="cursor-pointer" display="flex">
          <Xmark />
        </Box>
      </HStack>

      <VStack gap={5} align="stretch" opacity={loading ? 0.5 : 1}>
        <Box>
          <Text fontSize="sm" color="fg.muted" mb={1}>
            Pomieszczenie
          </Text>
          <Select.Root
            collection={roomsCollection}
            value={roomId ? [roomId] : []}
            onValueChange={(details) => {
              setRoomId(details.value[0] ?? '')
              setLinkedItemIds([])
            }}
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
            Powiąż z zaplanowaną pozycją
          </Text>
          <Select.Root
            multiple
            collection={itemsCollection}
            value={linkedItemIds}
            onValueChange={(details) => setLinkedItemIds(details.value)}
            disabled={loading || !roomId}
          >
            <Select.Control>
              <Select.Trigger borderWidth="2px">
                <Select.ValueText placeholder="Wybierz pozycje" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {itemsCollection.items.map((item) => (
                    <Select.Item key={item.id} item={item}>
                      <Select.ItemText>{item.name}</Select.ItemText>
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
          {linkedItemIds.length === 0 && (
            <Text fontSize="xs" color="fg.muted" mt={1}>
              wybierz co najmniej jedną pozycję
            </Text>
          )}
        </Box>

        {linkedItemIds.length > 0 && (
          <Button variant="outline" borderWidth="2px" borderColor="primary.500" onClick={() => setDetailsOpen(true)} disabled={loading}>
            Zobacz szczegóły ({linkedItemIds.length})
          </Button>
        )}

        <Box>
          <Text fontSize="sm" color="fg.muted" mb={1}>
            Zakup
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

        <Box>
          <Text fontSize="sm" color="fg.muted" mb={1}>
            Tytuł faktury
          </Text>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="np. Zakupy w Leroy Merlin"
            disabled={loading}
          />
        </Box>

        <Box>
          <Text fontSize="sm" color="fg.muted" mb={1}>
            Cena rzeczywista
          </Text>
          <NumberInput.Root
            value={realCost}
            onValueChange={(details) => setRealCost(details.value)}
            min={0}
            disabled={loading}
            w="full"
          >
            <InputGroup endElement="zł">
              <NumberInput.Input />
            </InputGroup>
          </NumberInput.Root>
        </Box>

        {isDelivery && (
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
        )}

        <Box>
          <Text fontSize="sm" color="fg.muted" mb={1}>
            Data
          </Text>
          <AppDatePicker value={date} onValueChange={setDate} disabled={loading} />
          {linkedItemIds.length > 0 && (
            <Text fontSize="xs" color="fg.muted" mt={1}>
              powiązanie oznacza zaplanowaną pozycję jako kupioną
            </Text>
          )}
        </Box>

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
      </VStack>

      <VStack gap={3} mt={10} align="stretch">
        <Button colorPalette="primary" onClick={saveInvoice} disabled={saving || loading || !canSave}>
          {invoiceId ? 'Zapisz zmiany' : 'Zapisz fakturę'}
        </Button>
        {invoiceId && (
          <Button variant="outline" borderWidth="2px" borderColor="#CF4173" color="#CF4173" onClick={deleteInvoice} disabled={loading}>
            Usuń fakturę
          </Button>
        )}
      </VStack>

      <Dialog.Root open={detailsOpen} onOpenChange={(details) => setDetailsOpen(details.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content mx={4}>
              <Dialog.Header>
                <HStack gap={2}>
                  <IconButton
                    aria-label="Wróć"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDetailsOpen(false)}
                  >
                    <ArrowLeft />
                  </IconButton>
                  <Dialog.Title>Powiązane pozycje ({linkedItems.length})</Dialog.Title>
                </HStack>
              </Dialog.Header>
              <Dialog.Body>
                <Text fontSize="xs" color="fg.muted" mb={3}>
                  tylko do odczytu — edytuj z planu pomieszczenia
                </Text>
                <VStack align="stretch" gap={3}>
                  {linkedItems.map((item) => (
                    <Box key={item.id} borderWidth="1px" borderColor="border" borderRadius="lg" p={3}>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="fg.muted">
                          Nazwa
                        </Text>
                        <Text fontWeight="bold">{item.name}</Text>
                      </HStack>
                      {item.link && (
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="fg.muted">
                            Link
                          </Text>
                          <Text asChild textDecoration="underline" truncate maxW="60%">
                            <a href={item.link} target="_blank" rel="noreferrer">
                              {item.link}
                            </a>
                          </Text>
                        </HStack>
                      )}
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="fg.muted">
                          Cena (za szt.)
                        </Text>
                        <Text fontWeight="bold">{currencyFormatter.format(item.price ?? 0)}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="fg.muted">
                          Ilość
                        </Text>
                        <Text fontWeight="bold">{item.amount ?? 1}</Text>
                      </HStack>
                      {item.notes && (
                        <HStack justify="space-between" align="start">
                          <Text fontSize="sm" color="fg.muted">
                            Notatki
                          </Text>
                          <Text textAlign="right" maxW="60%">
                            {item.notes}
                          </Text>
                        </HStack>
                      )}
                    </Box>
                  ))}
                </VStack>
              </Dialog.Body>
              <Dialog.CloseTrigger asChild>
                <IconButton aria-label="Zamknij" variant="ghost" size="sm" position="absolute" top={2} right={2}>
                  <Xmark />
                </IconButton>
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  )
}

export default InvoiceFormPage
