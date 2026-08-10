import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Dialog, Grid, HStack, IconButton, Portal, Spinner, Text } from '@chakra-ui/react'
import { ref, onValue, update } from 'firebase/database'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Box as BoxIcon,
  Calendar,
  FileText,
  Hourglass,
  Link as LinkIcon,
  Pencil,
  Receipt,
  ShoppingBasket,
  Trolley,
  Xmark,
} from '@gravity-ui/icons'
import { database } from '../lib/firebase'
import type { Room } from './RoomFormPage'
import type { PlanItem } from './PlanItemFormPage'
import type { Shop } from './ShopFormPage'
import type { Invoice } from './InvoiceFormPage'
import SortableList from '../components/SortableList'
import SpentPlannedBudgetBar from '../components/SpentPlannedBudgetBar'

const ROOMS_PATH = 'settings/rooms'
const PLAN_ITEMS_PATH = 'planItems'
const SHOPS_PATH = 'settings/shops'
const INVOICES_PATH = 'invoices'

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
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [notesEntry, setNotesEntry] = useState<{ title: string; notes: string } | null>(null)

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
      items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setPlanItems(items)
    })
  }, [roomId])

  useEffect(() => {
    return onValue(ref(database, SHOPS_PATH), (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<Shop, 'id'>> | null
      setShops(value ? Object.entries(value).map(([id, shop]) => ({ id, ...shop })) : [])
    })
  }, [])

  useEffect(() => {
    if (!roomId) return
    return onValue(ref(database, INVOICES_PATH), (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<Invoice, 'id'>> | null
      const items = value
        ? Object.entries(value)
          .map(([id, invoice]) => ({ id, ...invoice }))
          .filter((invoice) => invoice.roomId === roomId)
        : []
      items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setInvoices(items)
    })
  }, [roomId])

  const handleReorderPlanItems = (reordered: PlanItem[]) => {
    setPlanItems(reordered)
    const updates: Record<string, number> = {}
    reordered.forEach((item, index) => {
      updates[`${PLAN_ITEMS_PATH}/${item.id}/order`] = index
    })
    update(ref(database), updates)
  }

  const handleReorderInvoices = (reordered: Invoice[]) => {
    setInvoices(reordered)
    const updates: Record<string, number> = {}
    reordered.forEach((invoice, index) => {
      updates[`${INVOICES_PATH}/${invoice.id}/order`] = index
    })
    update(ref(database), updates)
  }

  const planned = useMemo(
    () =>
      planItems.reduce(
        (sum, item) =>
          sum + (item.price ?? 0) * (item.amount ?? 1) + (item.pickupType === 'delivery' ? (item.deliveryCost ?? 0) : 0),
        0,
      ),
    [planItems],
  )

  const spent = useMemo(
    () =>
      invoices.reduce(
        (sum, invoice) =>
          sum + (invoice.realCost ?? 0) + (invoice.pickupType === 'delivery' ? (invoice.deliveryCost ?? 0) : 0),
        0,
      ),
    [invoices],
  )

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center" py={12}>
        <Spinner size="lg" />
      </Box>
    )
  }

  const budget = room?.budget ?? 0

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

      <Box borderWidth="3px" borderColor="border" borderRadius="lg" p={4}>
        <Grid templateColumns="repeat(3, 1fr)" gap={3} textAlign="center">
          <Box>
            <Text fontSize="xl" fontWeight="bold" mb={-1}>
              {currencyFormatter.format(spent)}
            </Text>
            <Text fontSize="sm" color="fg.muted">
              wydano
            </Text>
          </Box>
          <Box>
            <Text fontSize="xl" fontWeight="bold" mb={-1}>
              {currencyFormatter.format(planned)}
            </Text>
            <Text fontSize="sm" color="fg.muted">
              zaplanowano
            </Text>
          </Box>
          <Box>
            <Text fontSize="xl" fontWeight="bold" mb={-1}>
              {currencyFormatter.format(budget)}
            </Text>
            <Text fontSize="sm" color="fg.muted">
              budżet
            </Text>
          </Box>
        </Grid>
        <Box mt={4}>
          <SpentPlannedBudgetBar
            spent={spent}
            planned={planned}
            budget={budget}
            formatValue={currencyFormatter.format}
            showLegendValue={false}
          />
        </Box>
      </Box>

      <HStack justify="space-between" mt={8} mb={3}>
        <Text fontWeight="bold">Zaplanowane pozycje ({planItems.length})</Text>
        <Button asChild colorPalette="primary" size="sm">
          <Link to={`/dodaj?roomId=${roomId}`}>+ Pozycja planu</Link>
        </Button>
      </HStack>
      {planItems.length === 0 ? (
        <Text fontSize="sm" color="fg.muted" py={2}>
          Brak zaplanowanych pozycji.
        </Text>
      ) : (
        <SortableList
          items={planItems}
          onReorder={handleReorderPlanItems}
          renderItem={(item) => (
            <HStack
              justify="space-between"
              py={3}
              borderBottomWidth={item.id === planItems[planItems.length - 1].id ? undefined : '1px'}
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
                    onClick={() => setNotesEntry({ title: item.name, notes: item.notes ?? '' })}
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
          )}
        />
      )}

      <HStack justify="space-between" mt={8} mb={3}>
        <Text fontWeight="bold">Faktury ({invoices.length})</Text>
        <Button asChild colorPalette="primary" size="sm">
          <Link to={`/faktury/nowa?roomId=${roomId}`}>+ Dodaj fakturę</Link>
        </Button>
      </HStack>
      {invoices.length === 0 ? (
        <Text fontSize="sm" color="fg.muted" py={2}>
          Brak faktur.
        </Text>
      ) : (
        <SortableList
          items={invoices}
          onReorder={handleReorderInvoices}
          renderItem={(invoice) => {
            const invoiceShopNames = [
              ...new Set(
                planItems
                  .filter((item) => invoice.linkedItemIds?.includes(item.id) && item.shopId)
                  .map((item) => shops.find((shop) => shop.id === item.shopId)?.name)
                  .filter((name): name is string => Boolean(name)),
              ),
            ]
            return (
              <HStack
                justify="space-between"
                py={3}
                borderBottomWidth={invoice.id === invoices[invoices.length - 1].id ? undefined : '1px'}
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
                    <Receipt />
                  </Box>
                  <Box>
                    <Text>{invoice.title || 'Faktura'}</Text>
                    <Text fontSize="sm" color="fg.muted">
                      {currencyFormatter.format(
                        (invoice.realCost ?? 0) +
                        (invoice.pickupType === 'delivery' ? (invoice.deliveryCost ?? 0) : 0),
                      )}
                    </Text>
                    <HStack gap={1} mt={0.5}>
                      <Box boxSize="2.5" display="flex" alignItems="center" color="fg.muted">
                        <Calendar />
                      </Box>
                      <Text fontSize="xs" color="fg.muted">
                        {dateFormatter.format(new Date(invoice.date))}
                      </Text>
                    </HStack>
                    {invoiceShopNames.length > 0 && (
                      <HStack gap={1} mt={0.5}>
                        <Box boxSize="2.5" display="flex" alignItems="center" color="fg.muted">
                          <ShoppingBasket />
                        </Box>
                        <Text fontSize="xs" color="fg.muted">
                          {invoiceShopNames.join(', ')}
                        </Text>
                      </HStack>
                    )}
                  </Box>
                </HStack>
                <HStack gap={1}>
                  {invoice.notes && (
                    <IconButton
                      aria-label="Pokaż notatki"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setNotesEntry({ title: invoice.title || 'Faktura', notes: invoice.notes ?? '' })
                      }
                    >
                      <FileText />
                    </IconButton>
                  )}
                  <IconButton asChild aria-label="Edytuj fakturę" variant="ghost" size="sm">
                    <Link to={`/faktury/${invoice.id}`}>
                      <Pencil />
                    </Link>
                  </IconButton>
                </HStack>
              </HStack>
            )
          }}
        />
      )}

      <Dialog.Root open={Boolean(notesEntry)} onOpenChange={(details) => !details.open && setNotesEntry(null)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content mx={4}>
              <Dialog.Header>
                <Dialog.Title>{notesEntry?.title}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text whiteSpace="pre-wrap">{notesEntry?.notes}</Text>
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
