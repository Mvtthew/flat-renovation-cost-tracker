import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Dialog, Grid, HStack, IconButton, Portal, Spinner, Text, VStack } from '@chakra-ui/react'
import { ref, onValue } from 'firebase/database'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Box as BoxIcon,
  Calendar,
  FileText,
  Hourglass,
  Link as LinkIcon,
  Pencil,
  ShoppingBasket,
  Trolley,
  Xmark,
} from '@gravity-ui/icons'
import { database } from '../lib/firebase'
import type { Room } from './RoomFormPage'
import type { PlanItem } from './PlanItemFormPage'
import type { Shop } from './ShopFormPage'

const ROOMS_PATH = 'settings/rooms'
const PLAN_ITEMS_PATH = 'planItems'
const SHOPS_PATH = 'settings/shops'

const currencyFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium' })
const relativeTimeFormatter = new Intl.RelativeTimeFormat('pl-PL', { numeric: 'auto' })

const MS_PER_DAY = 1000 * 60 * 60 * 24

function formatRelativeTarget(targetDate: string): string {
  const diffDays = Math.round(
    (new Date(targetDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / MS_PER_DAY,
  )
  const diffYears = Math.round(diffDays / 365)
  if (Math.abs(diffYears) >= 1) return relativeTimeFormatter.format(diffYears, 'year')
  const diffMonths = Math.round(diffDays / 30)
  if (Math.abs(diffMonths) >= 1) return relativeTimeFormatter.format(diffMonths, 'month')
  return relativeTimeFormatter.format(diffDays, 'day')
}

function RoomDetailPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()

  const [room, setRoom] = useState<Omit<Room, 'id'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [planItems, setPlanItems] = useState<PlanItem[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [notesItem, setNotesItem] = useState<PlanItem | null>(null)

  useEffect(() => {
    if (!roomId) return
    const unsubscribe = onValue(ref(database, `${ROOMS_PATH}/${roomId}`), (snapshot) => {
      setRoom(snapshot.val() as Omit<Room, 'id'> | null)
      setLoading(false)
    })
    return unsubscribe
  }, [roomId])

  useEffect(() => {
    if (!roomId) return
    return onValue(ref(database, PLAN_ITEMS_PATH), (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<PlanItem, 'id'>> | null
      const items = value
        ? Object.entries(value)
            .map(([id, item]) => ({ id, ...item }))
            .filter((item) => item.roomId === roomId)
        : []
      setPlanItems(items)
    })
  }, [roomId])

  useEffect(() => {
    return onValue(ref(database, SHOPS_PATH), (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<Shop, 'id'>> | null
      setShops(value ? Object.entries(value).map(([id, shop]) => ({ id, ...shop })) : [])
    })
  }, [])

  const planned = useMemo(
    () =>
      planItems.reduce(
        (sum, item) =>
          sum + (item.price ?? 0) * (item.amount ?? 1) + (item.pickupType === 'delivery' ? (item.deliveryCost ?? 0) : 0),
        0,
      ),
    [planItems],
  )

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center" py={12}>
        <Spinner size="lg" />
      </Box>
    )
  }

  // TODO: derive from invoice data once that feature exists
  const spent = 0
  const budget = room?.budget ?? 0
  const maxValue = Math.max(budget, planned, spent)
  const spentPct = maxValue > 0 ? (spent / maxValue) * 100 : 0
  const plannedPct = maxValue > 0 ? (planned / maxValue) * 100 : 0
  const budgetPct = maxValue > 0 ? (budget / maxValue) * 100 : 100

  return (
    <Box p={4} pb={8}>
      <HStack gap={2} mb={6}>
        <Box as="button" onClick={() => navigate('/')} className="cursor-pointer" display="flex">
          <ArrowLeft />
        </Box>
        <Text fontSize="xl" fontWeight="bold">
          {room?.name ?? 'Pomieszczenie'}
        </Text>
      </HStack>

      <Box borderWidth="2px" borderColor="border" borderRadius="lg" p={4}>
        <Grid templateColumns="repeat(3, 1fr)" gap={3} textAlign="center">
          <Box>
            <Text fontSize="xl" fontWeight="bold">
              {currencyFormatter.format(spent)}
            </Text>
            <Text fontSize="sm" color="fg.muted">
              wydano
            </Text>
          </Box>
          <Box>
            <Text fontSize="xl" fontWeight="bold">
              {currencyFormatter.format(planned)}
            </Text>
            <Text fontSize="sm" color="fg.muted">
              zaplanowano
            </Text>
          </Box>
          <Box>
            <Text fontSize="xl" fontWeight="bold">
              {currencyFormatter.format(budget)}
            </Text>
            <Text fontSize="sm" color="fg.muted">
              budżet
            </Text>
          </Box>
        </Grid>
        <Box position="relative" h="4" mt={4} borderRadius="full" overflow="hidden">
          <Box position="absolute" inset="0" bg="#CF4173" width={`${plannedPct}%`} />
          <Box position="absolute" inset="0" bg="#5D3140" width={`${spentPct}%`} />
          <Box
            position="absolute"
            inset="0"
            bg="transparent"
            borderWidth="2px"
            borderStyle="dashed"
            borderColor="border"
            borderRadius="full"
            width={`${budgetPct}%`}
          />
        </Box>
        <HStack mt={2} gap={4} justify="center">
          <HStack gap={1.5}>
            <Box boxSize="2.5" borderRadius="full" bg="#5D3140" />
            <Text fontSize="xs" color="fg.muted">
              wydano
            </Text>
          </HStack>
          <HStack gap={1.5}>
            <Box boxSize="2.5" borderRadius="full" bg="#CF4173" />
            <Text fontSize="xs" color="fg.muted">
              zaplanowano
            </Text>
          </HStack>
          <HStack gap={1.5}>
            <Box
              boxSize="2.5"
              borderRadius="full"
              borderWidth="1.5px"
              borderStyle="dashed"
              borderColor="border"
            />
            <Text fontSize="xs" color="fg.muted">
              budżet
            </Text>
          </HStack>
        </HStack>
      </Box>

      <HStack justify="space-between" mt={8} mb={3}>
        <Text fontWeight="bold">Zaplanowane pozycje ({planItems.length})</Text>
        <Button asChild colorPalette="primary" size="sm">
          <Link to={`/dodaj?roomId=${roomId}`}>+ Pozycja planu</Link>
        </Button>
      </HStack>
      <VStack align="stretch" gap={0} divideY="1px" borderColor="border">
        {planItems.length === 0 ? (
          <Text fontSize="sm" color="fg.muted" py={2}>
            Brak zaplanowanych pozycji.
          </Text>
        ) : (
          planItems.map((item) => (
            <HStack key={item.id} justify="space-between" py={3}>
              <HStack gap={3}>
                <Box
                  boxSize="6"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="primary.300"
                >
                  <BoxIcon />
                </Box>
                <Box>
                  <Text>{item.name}</Text>
                  <Text fontSize="sm" color="fg.muted">
                    {currencyFormatter.format((item.price ?? 0) * (item.amount ?? 1))}
                    {(item.amount ?? 1) > 1 ? ` · ${item.amount} szt.` : ''}
                  </Text>
                  {item.shopId && (
                    <HStack gap={1} mt={0.5}>
                      <Box boxSize="2.5" display="flex" alignItems="center" color="fg.muted">
                        <ShoppingBasket />
                      </Box>
                      <Text fontSize="xs" color="fg.muted">
                        {shops.find((shop) => shop.id === item.shopId)?.name}
                      </Text>
                    </HStack>
                  )}
                  {item.pickupType === 'delivery' && (Boolean(item.deliveryCost) || Boolean(item.deliveryDays)) && (
                    <HStack gap={1} mt={0.5}>
                      {Boolean(item.deliveryCost) && (
                        <>
                          <Box boxSize="2.5" display="flex" alignItems="center" color="fg.muted">
                            <Trolley />
                          </Box>
                          <Text fontSize="xs" color="fg.muted">
                            {currencyFormatter.format(item.deliveryCost ?? 0)}
                          </Text>
                        </>
                      )}
                      {Boolean(item.deliveryCost) && Boolean(item.deliveryDays) && (
                        <Text fontSize="xs" color="fg.muted">
                          ·
                        </Text>
                      )}
                      {Boolean(item.deliveryDays) && (
                        <>
                          <Box boxSize="2.5" display="flex" alignItems="center" color="fg.muted">
                            <Hourglass />
                          </Box>
                          <Text fontSize="xs" color="fg.muted">
                            {item.deliveryDays} dni
                          </Text>
                        </>
                      )}
                    </HStack>
                  )}
                  {item.targetDate && (
                    <HStack gap={1} mt={0.5}>
                      <Box boxSize="2.5" display="flex" alignItems="center" color="fg.muted">
                        <Calendar />
                      </Box>
                      <Text fontSize="xs" color="fg.muted">
                        {dateFormatter.format(new Date(item.targetDate))} (
                        {formatRelativeTarget(item.targetDate)})
                      </Text>
                    </HStack>
                  )}
                </Box>
              </HStack>
              <HStack gap={1}>
                {item.notes && (
                  <IconButton
                    aria-label="Pokaż notatki"
                    variant="ghost"
                    size="sm"
                    onClick={() => setNotesItem(item)}
                  >
                    <FileText />
                  </IconButton>
                )}
                {item.link && (
                  <IconButton
                    asChild
                    aria-label="Otwórz link"
                    variant="ghost"
                    size="sm"
                  >
                    <a href={item.link} target="_blank" rel="noreferrer">
                      <LinkIcon />
                    </a>
                  </IconButton>
                )}
                <IconButton asChild aria-label="Edytuj pozycję" variant="ghost" size="sm">
                  <Link to={`/pozycje/${item.id}`}>
                    <Pencil />
                  </Link>
                </IconButton>
              </HStack>
            </HStack>
          ))
        )}
      </VStack>

      <HStack justify="space-between" mt={8} mb={3}>
        <Text fontWeight="bold">Faktury (0)</Text>
        <Button colorPalette="primary" size="sm" disabled title="Wkrótce dostępne">
          + Dodaj fakturę
        </Button>
      </HStack>
      <VStack align="stretch" gap={0} divideY="1px" borderColor="border">
        <Text fontSize="sm" color="fg.muted" py={2}>
          Brak faktur.
        </Text>
      </VStack>

      <Dialog.Root open={Boolean(notesItem)} onOpenChange={(details) => !details.open && setNotesItem(null)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content mx={4}>
              <Dialog.Header>
                <Dialog.Title>{notesItem?.name}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text whiteSpace="pre-wrap">{notesItem?.notes}</Text>
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

export default RoomDetailPage
