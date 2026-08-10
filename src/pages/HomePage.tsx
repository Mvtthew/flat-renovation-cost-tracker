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
  py = 4,
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
  const isOutline = variant === 'outline'
  return (
    <Box
      borderWidth={isOutline ? borderWidth : undefined}
      borderColor={isOutline ? (color ?? 'border') : undefined}
      bg={isSolid ? (color ?? 'primary.solid') : undefined}
      borderRadius="lg"
      py={py}
      textAlign="center"
    >
      <HStack justify="center" gap={1.5} mb={-1}>
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
  const maxValue = Math.max(budget ?? 0, planned, spent)
  const spentPct = maxValue > 0 ? (spent / maxValue) * 100 : 0
  const plannedPct = maxValue > 0 ? (planned / maxValue) * 100 : 0
  const budgetPct = maxValue > 0 ? ((budget ?? 0) / maxValue) * 100 : 100
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
          <Box position="relative" h="4" borderRadius="full" overflow="hidden">
            <Box
              position="absolute"
              inset="0"
              bg="transparent"
              borderWidth="2px"
              borderColor="#CF4173"
              borderRadius="full"
              width={`${budgetPct}%`}
            />
            {planned > 0 && (
              <Box position="absolute" inset="0" bg="#CF4173" width={`${plannedPct}%`} borderWidth="2px" borderColor="#CF4173" borderRadius="full" />
            )}
            {spent > 0 && (
              <Box position="absolute" inset="0" bg="#5D3140" width={`${spentPct}%`} borderWidth="2px" borderColor="#5D3140" borderRadius="full" />
            )}
          </Box>
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
  const [roomList, setRoomList] = useState<{ id: string; name: string; budget?: number }[]>([])
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
      const value = snapshot.val() as Record<string, { name: string; budget?: number }> | null
      setRoomList(
        value ? Object.entries(value).map(([id, room]) => ({ id, name: room.name, budget: room.budget })) : [],
      )
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
  const maxValue = Math.max(budget, planned, spent)
  const spentPct = maxValue > 0 ? (spent / maxValue) * 100 : 0
  const plannedPct = maxValue > 0 ? (planned / maxValue) * 100 : 0
  const budgetPct = maxValue > 0 ? (budget / maxValue) * 100 : 100

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
        Podsumowanie kosztorysu
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

      <Box position="relative" h="6" mt={4} borderRadius="full" overflow="hidden">
        <Box
          position="absolute"
          inset="0"
          bg="transparent"
          borderWidth="3px"
          borderColor="#CF4173"
          borderRadius="full"
          width={`${budgetPct}%`}
        />
        {planned > 0 && (
          <Box position="absolute" inset="0" bg="#CF4173" width={`${plannedPct}%`} borderWidth="3px" borderColor="#CF4173" borderRadius="full" />
        )}
        {spent > 0 && (
          <Box position="absolute" inset="0" bg="#5D3140" width={`${spentPct}%`} borderWidth="3px" borderColor="#5D3140" borderRadius="full" />
        )}
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
            borderStyle="solid"
            borderColor="#CF4173"
          />
          <Text fontSize="xs" color="fg.muted">
            budżet
          </Text>
        </HStack>
      </HStack>

      <Grid templateColumns="repeat(3, 1fr)" gap={2} mt={8}>
        <StatBox value={String(rooms.length)} label="pokoje" icon={Circles4Square} py={2} borderWidth="2px" />
        <StatBox value={String(planItems.length)} label="pozycje" icon={BoxIcon} py={2} borderWidth="2px" />
        <StatBox value={String(invoices.length)} label="faktury" icon={FileDollar} py={2} borderWidth="2px" />
      </Grid>

      <Text fontWeight="bold" mt={8} mb={3}>
        Pomieszczenia
      </Text>
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
