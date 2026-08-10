import { useEffect, useState } from 'react'
import { Box, Separator, Spinner, Text, VStack } from '@chakra-ui/react'
import { ChartLine } from '@gravity-ui/icons'
import { ref, onValue } from 'firebase/database'
import { database } from '../lib/firebase'
import PageTitle from '../components/PageTitle'
import RoomsDonutChart from '../components/RoomsDonutChart'
import SpentVsPlannedBar from '../components/SpentVsPlannedBar'
import type { PlanItem } from './PlanItemFormPage'
import type { Room } from './RoomFormPage'
import type { Invoice } from './InvoiceFormPage'

const ROOMS_PATH = 'settings/rooms'
const PLAN_ITEMS_PATH = 'planItems'
const INVOICES_PATH = 'invoices'

const currencyFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  maximumFractionDigits: 0,
})

function PlanPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [planItems, setPlanItems] = useState<PlanItem[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let roomsLoaded = false
    let planItemsLoaded = false
    let invoicesLoaded = false
    const markLoaded = () => {
      if (roomsLoaded && planItemsLoaded && invoicesLoaded) setLoading(false)
    }

    const unsubscribeRooms = onValue(ref(database, ROOMS_PATH), (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<Room, 'id'>> | null
      const list = value ? Object.entries(value).map(([id, room]) => ({ id, ...room })) : []
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setRooms(list)
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
      unsubscribeRooms()
      unsubscribePlanItems()
      unsubscribeInvoices()
    }
  }, [])

  const itemCost = (item: PlanItem) =>
    (item.price ?? 0) * (item.amount ?? 1) + (item.pickupType === 'delivery' ? (item.deliveryCost ?? 0) : 0)

  const invoiceCost = (invoice: Invoice) =>
    (invoice.realCost ?? 0) + (invoice.pickupType === 'delivery' ? (invoice.deliveryCost ?? 0) : 0)

  const roomSegments = rooms
    .map((room) => ({
      id: room.id,
      label: room.name,
      value: planItems.filter((item) => item.roomId === room.id).reduce((sum, item) => sum + itemCost(item), 0),
    }))
    .sort((a, b) => b.value - a.value)

  const totalPlanned = roomSegments.reduce((sum, segment) => sum + segment.value, 0)
  const totalSpent = invoices.reduce((sum, invoice) => sum + invoiceCost(invoice), 0)

  return (
    <Box p={4} pb={8}>
      <PageTitle icon={ChartLine}>Plan</PageTitle>

      {loading ? (
        <Box display="flex" justifyContent="center" py={12}>
          <Spinner size="lg" />
        </Box>
      ) : (
        <VStack align="stretch" gap={6} separator={<Separator />}>
          <VStack align="stretch" gap={4}>
            <Text fontWeight="bold" textAlign="center">
              Zaplanowane koszty wg pomieszczeń
            </Text>
            <RoomsDonutChart
              segments={roomSegments}
              total={totalPlanned}
              centerLabel="zaplanowano"
              formatValue={currencyFormatter.format}
            />
          </VStack>

          <VStack align="stretch" gap={4}>
            <Text fontWeight="bold" textAlign="center">
              Wydatki i ile jeszcze zostało
            </Text>
            <SpentVsPlannedBar planned={totalPlanned} spent={totalSpent} formatValue={currencyFormatter.format} />
          </VStack>
        </VStack>
      )}
    </Box>
  )
}

export default PlanPage
