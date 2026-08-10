import { useEffect, useState } from 'react'
import { Box, Grid, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import {
  Box as BoxIcon,
  ChevronRight,
  Circles4Square,
  FileDollar,
  House,
} from '@gravity-ui/icons'
import { ref, onValue } from 'firebase/database'
import { Link } from 'react-router-dom'
import { database } from '../lib/firebase'
import PageTitle from '../components/PageTitle'
import SpentPlannedBudgetBar from '../components/SpentPlannedBudgetBar'
import type { PlanItem } from './PlanItemFormPage'
import type { Invoice } from './InvoiceFormPage'

const OVERALL_BUDGET_PATH = 'settings/overallBudget'
const ROOMS_PATH = 'settings/rooms'
const PLAN_ITEMS_PATH = 'planItems'
const INVOICES_PATH = 'invoices'

interface RoomSummary {
  id: string
  name: string
  planned: number
  spent: number
  budget?: number
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

function CategoryBar({ id, name, planned, spent, budget }: RoomSummary) {
  return (
    <HStack asChild className="cursor-pointer" gap={2}>
      <Link to={`/pokoje/${id}`}>
        <Box flex="1">
          <HStack justify="space-between" mb={1}>
            <Text fontSize="md">{name}</Text>
            <Text fontSize="xs" color="fg.muted">
              {currencyFormatter.format(spent)} / {currencyFormatter.format(planned)}
              {Boolean(budget) && ` / ${currencyFormatter.format(budget ?? 0)}`}
            </Text>
          </HStack>
          <SpentPlannedBudgetBar
            spent={spent}
            planned={planned}
            budget={budget ?? 0}
            formatValue={currencyFormatter.format}
            compact
          />
        </Box>
        <Box color="fg.muted" display="flex" flexShrink="0" pl={2}>
          <ChevronRight width={16} height={16} />
        </Box>
      </Link>
    </HStack>
  )
}

function HomePage() {
  const [budget, setBudget] = useState(0)
  const [roomList, setRoomList] = useState<{ id: string; name: string; budget?: number; order?: number }[]>([])
  const [planItems, setPlanItems] = useState<PlanItem[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

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

  const rooms: RoomSummary[] = roomList.map((room) => ({
    ...room,
    planned: planItems.filter((item) => item.roomId === room.id).reduce((sum, item) => sum + itemCost(item), 0),
    spent: invoices.filter((invoice) => invoice.roomId === room.id).reduce((sum, invoice) => sum + invoiceCost(invoice), 0),
  }))

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
      <PageTitle icon={House}>Dom</PageTitle>
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

      <HStack fontWeight="bold" mt={8} mb={3} gap={2}>
        <Circles4Square width={18} height={18} />
        <Text>Pomieszczenia</Text>
      </HStack>
      <VStack gap={4} align="stretch">
        {rooms.length === 0 ? (
          <Text fontSize="sm" color="fg.muted">
            Brak pomieszczeń — dodaj je w Ustawieniach.
          </Text>
        ) : (
          rooms.map((room) => <CategoryBar key={room.id} {...room} />)
        )}
      </VStack>
    </Box>
  )
}

export default HomePage
