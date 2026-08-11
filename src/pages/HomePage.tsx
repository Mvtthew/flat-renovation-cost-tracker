import { useEffect, useState } from 'react'
import { Avatar, Box, Grid, HStack, IconButton, Spinner, Text, VStack } from '@chakra-ui/react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpArrowDown,
  Box as BoxIcon,
  ChevronRight,
  Circles4Square,
  FileDollar,
  House,
} from '@gravity-ui/icons'
import { ref, onValue } from 'firebase/database'
import { Link } from 'react-router-dom'
import { database } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import PageTitle from '../components/PageTitle'
import SpentPlannedBudgetBar from '../components/SpentPlannedBudgetBar'
import type { PlanItem } from './PlanItemFormPage'
import type { Invoice } from './InvoiceFormPage'

const OVERALL_BUDGET_PATH = 'settings/overallBudget'
const ROOMS_PATH = 'settings/rooms'
const PLAN_ITEMS_PATH = 'planItems'
const INVOICES_PATH = 'invoices'
const ROOMS_SORT_STORAGE_KEY = 'homeRoomsSortOrder'

type RoomsSortOrder = 'none' | 'asc' | 'desc'

const nextSortOrder: Record<RoomsSortOrder, RoomsSortOrder> = {
  none: 'desc',
  desc: 'asc',
  asc: 'none',
}

const sortOrderIcon: Record<RoomsSortOrder, typeof ArrowUpArrowDown> = {
  none: ArrowUpArrowDown,
  desc: ArrowDown,
  asc: ArrowUp,
}

interface RoomSummary {
  id: string
  name: string
  planned: number
  spent: number
  budget?: number
  planItemsCount: number
  invoicesCount: number
}

const currencyFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  maximumFractionDigits: 0,
})

function StatBox({
  value,
  label,
  variant = 'outline',
  color,
  icon: Icon,
  py = 3,
  borderWidth = '3px',
}: {
  value: string
  label: string
  variant?: 'outline' | 'solid' | 'plain'
  color?: string
  icon?: typeof House
  py?: number,
  gap?: number,
  borderWidth?: string,
}) {
  const isSolid = variant === 'solid'
  return (
    <Box
      borderWidth={borderWidth}
      borderColor={(color ?? 'border')}
      bg={isSolid ? (color ?? 'primary.solid') : undefined}
      borderRadius="lg"
      py={py}
      textAlign="center"
    >
      <HStack justify="center" gap={1.5} mb={-2}>
        <Text fontSize="lg" fontWeight="black" color={isSolid ? 'white' : (color ?? undefined)}>
          {value}
        </Text>
        {Icon && <Icon width={16} height={16} color={isSolid ? 'white' : (color ?? undefined)} />}
      </HStack>
      <Text fontSize="sm" color={isSolid ? 'whiteAlpha.800' : (color ?? 'fg.muted')}>
        {label}
      </Text>
    </Box>
  )
}

function CategoryBar({
  id,
  name,
  planned,
  spent,
  budget,
  plannedShare,
  planItemsCount,
  invoicesCount,
}: RoomSummary & { plannedShare: number }) {
  const barWidth = `${Math.max(plannedShare * 200, 4)}%`

  return (
    <HStack asChild className="cursor-pointer" gap={2}>
      <Link to={`/pokoje/${id}`}>
        <Box flex="1">
          <HStack justify="space-between">
            <Text fontSize="md">{name}</Text>
            <Text fontSize="xs" color="fg.muted">
              {currencyFormatter.format(spent)} / {currencyFormatter.format(planned)}
              {Boolean(budget) && ` / ${currencyFormatter.format(budget ?? 0)}`}
            </Text>
          </HStack>
          <HStack justify="space-between" gap={2}>
            <HStack gap={1} color="fg.muted" flexShrink={0}>
              <BoxIcon width={12} height={12} />
              <Text fontSize="xs">{planItemsCount}</Text>
              <Text fontSize="xs">·</Text>
              <FileDollar width={12} height={12} />
              <Text fontSize="xs">{invoicesCount}</Text>
            </HStack>
            <Box width={barWidth}>
              <SpentPlannedBudgetBar
                spent={spent}
                planned={planned}
                budget={budget ?? 0}
                formatValue={currencyFormatter.format}
                compact
              />
            </Box>
          </HStack>
        </Box>
        <Box color="fg.muted" display="flex" flexShrink="0" pl={2}>
          <ChevronRight width={16} height={16} />
        </Box>
      </Link>
    </HStack>
  )
}

function HomePage() {
  const { user } = useAuth()
  const [budget, setBudget] = useState(0)
  const [roomList, setRoomList] = useState<{ id: string; name: string; budget?: number; order?: number }[]>([])
  const [planItems, setPlanItems] = useState<PlanItem[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [roomsSortOrder, setRoomsSortOrder] = useState<RoomsSortOrder>(() => {
    const stored = localStorage.getItem(ROOMS_SORT_STORAGE_KEY)
    return stored === 'asc' || stored === 'desc' ? stored : 'none'
  })

  const toggleRoomsSortOrder = () => {
    const next = nextSortOrder[roomsSortOrder]
    setRoomsSortOrder(next)
    localStorage.setItem(ROOMS_SORT_STORAGE_KEY, next)
  }

  useEffect(() => {
    let budgetLoaded = false
    let roomsLoaded = false
    let planItemsLoaded = false
    let invoicesLoaded = false
    const markLoaded = () => {
      if (budgetLoaded && roomsLoaded && planItemsLoaded && invoicesLoaded) setLoading(false)
    }

    const unsubscribeBudget = onValue(ref(database, OVERALL_BUDGET_PATH), (snapshot) => {
      const value = snapshot.val()
      setBudget(typeof value === 'number' ? value : 0)
      budgetLoaded = true
      markLoaded()
    })

    const unsubscribeRooms = onValue(ref(database, ROOMS_PATH), (snapshot) => {
      const value = snapshot.val() as Record<string, { name: string; budget?: number; order?: number }> | null
      const list = value
        ? Object.entries(value).map(([id, room]) => ({ id, name: room.name, budget: room.budget, order: room.order }))
        : []
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setRoomList(list)
      roomsLoaded = true
      markLoaded()
    })

    const unsubscribePlanItems = onValue(ref(database, PLAN_ITEMS_PATH), (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<PlanItem, 'id'>> | null
      setPlanItems(value ? Object.entries(value).map(([id, item]) => ({ id, ...item })) : [])
      planItemsLoaded = true
      markLoaded()
    })

    const unsubscribeInvoices = onValue(ref(database, INVOICES_PATH), (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<Invoice, 'id'>> | null
      setInvoices(value ? Object.entries(value).map(([id, invoice]) => ({ id, ...invoice })) : [])
      invoicesLoaded = true
      markLoaded()
    })

    return () => {
      unsubscribeBudget()
      unsubscribeRooms()
      unsubscribePlanItems()
      unsubscribeInvoices()
    }
  }, [])

  const itemCost = (item: PlanItem) =>
    (item.price ?? 0) * (item.amount ?? 1) + (item.pickupType === 'delivery' ? (item.deliveryCost ?? 0) : 0)

  const invoiceCost = (invoice: Invoice) =>
    (invoice.realCost ?? 0) + (invoice.pickupType === 'delivery' ? (invoice.deliveryCost ?? 0) : 0)

  const rooms: RoomSummary[] = roomList.map((room) => {
    const roomPlanItems = planItems.filter((item) => item.roomId === room.id)
    const roomInvoices = invoices.filter((invoice) => invoice.roomId === room.id)
    return {
      ...room,
      planned: roomPlanItems.reduce((sum, item) => sum + itemCost(item), 0),
      spent: roomInvoices.reduce((sum, invoice) => sum + invoiceCost(invoice), 0),
      planItemsCount: roomPlanItems.length,
      invoicesCount: roomInvoices.length,
    }
  })

  const sortedRooms =
    roomsSortOrder === 'none'
      ? rooms
      : [...rooms].sort((a, b) => (roomsSortOrder === 'asc' ? a.planned - b.planned : b.planned - a.planned))

  const planned = planItems.reduce((sum, item) => sum + itemCost(item), 0)
  const spent = invoices.reduce((sum, invoice) => sum + invoiceCost(invoice), 0)

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center" py={12}>
        <Spinner size="lg" />
      </Box>
    )
  }

  return (
    <Box p={4} pb={8}>
      <HStack justify="space-between" align="flex-start">
        <PageTitle icon={House}>Dom</PageTitle>
        <Avatar.Root borderWidth="2px" borderColor="primary.solid">
          <Avatar.Image src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'User'} />
          <Avatar.Fallback name={user?.displayName ?? user?.email ?? undefined} />
        </Avatar.Root>
      </HStack>
      <Text fontSize="2xl" fontWeight="bold" mb={2}>
        Podsumowanie
      </Text>

      <Grid templateColumns="repeat(3, 1fr)" gap={2}>
        <StatBox
          variant="solid"
          color="#5D3140"
          value={currencyFormatter.format(spent)}
          label="wydano"
        />
        <StatBox
          variant="solid"
          color="#CF4173"
          value={currencyFormatter.format(planned)}
          label="zaplanowano"
        />
        <StatBox
          value={currencyFormatter.format(budget)}
          label="budżet"
          color="#CF4173"
        />
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

      <Grid templateColumns="repeat(3, 1fr)" gap={2} mt={8}>
        <StatBox value={String(planItems.length)} label="pozycje" icon={BoxIcon} py={2} borderWidth="2px" />
        <StatBox value={String(invoices.length)} label="faktury" icon={FileDollar} py={2} borderWidth="2px" />
        <StatBox value={String(rooms.length)} label="pokoje" icon={Circles4Square} py={2} borderWidth="2px" />
      </Grid>

      <HStack fontWeight="bold" mt={8} mb={3} justify="space-between">
        <HStack gap={2}>
          <Circles4Square width={18} height={18} />
          <Text>Pomieszczenia</Text>
        </HStack>
        <IconButton
          aria-label="Sortuj pomieszczenia wg zaplanowanej kwoty"
          variant="ghost"
          size="sm"
          onClick={toggleRoomsSortOrder}
        >
          {(() => {
            const SortIcon = sortOrderIcon[roomsSortOrder]
            return <SortIcon width={18} height={18} />
          })()}
        </IconButton>
      </HStack>
      <VStack gap={4} align="stretch">
        {sortedRooms.length === 0 ? (
          <Text fontSize="sm" color="fg.muted">
            Brak pomieszczeń — dodaj je w Ustawieniach.
          </Text>
        ) : (
          sortedRooms.map((room) => (
            <CategoryBar key={room.id} {...room} plannedShare={planned > 0 ? room.planned / planned : 0} />
          ))
        )}
      </VStack>
    </Box>
  )
}

export default HomePage
