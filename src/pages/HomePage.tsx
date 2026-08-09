import { useEffect, useState } from 'react'
import { Box, Grid, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import { ChevronRight, House } from '@gravity-ui/icons'
import { ref, onValue } from 'firebase/database'
import { Link } from 'react-router-dom'
import { database } from '../lib/firebase'
import PageTitle from '../components/PageTitle'

const OVERALL_BUDGET_PATH = 'settings/overallBudget'
const ROOMS_PATH = 'settings/rooms'

interface RoomSummary {
  id: string
  name: string
  planned: number
  spent: number
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
}: {
  value: string
  label: string
  variant?: 'outline' | 'solid' | 'plain'
  color?: string
}) {
  const isSolid = variant === 'solid'
  const isOutline = variant === 'outline'
  return (
    <Box
      borderWidth={isOutline ? '2px' : undefined}
      borderStyle={isOutline ? 'dashed' : undefined}
      borderColor={isOutline ? (color ?? 'border') : undefined}
      bg={isSolid ? (color ?? 'primary.solid') : undefined}
      borderRadius="lg"
      py={4}
      textAlign="center"
    >
      <Text fontSize="xl" fontWeight="bold" color={isSolid ? 'white' : (color ?? undefined)}>
        {value}
      </Text>
      <Text fontSize="sm" color={isSolid ? 'whiteAlpha.800' : (color ?? 'fg.muted')}>
        {label}
      </Text>
    </Box>
  )
}

function CategoryBar({ id, name, planned, spent }: RoomSummary) {
  const spentPct = planned > 0 ? Math.min(100, (spent / planned) * 100) : 0
  return (
    <HStack asChild className="cursor-pointer" gap={2}>
      <Link to={`/pokoje/${id}`}>
        <Box flex="1">
          <HStack justify="space-between" mb={1}>
            <Text fontSize="md">{name}</Text>
            <Text fontSize="xs" color="fg.muted">
              {currencyFormatter.format(spent)} / {currencyFormatter.format(planned)}
            </Text>
          </HStack>
          <Box
            position="relative"
            h="4"
            borderRadius="full"
            borderWidth="2px"
            borderStyle="dashed"
            borderColor="border"
            overflow="hidden"
          >
            <Box position="absolute" inset="0" bg="primary.500" width={`${spentPct}%`} />
          </Box>
        </Box>
        <Box color="fg.muted" display="flex" flexShrink="0" px={2}>
          <ChevronRight width={16} height={16} />
        </Box>
      </Link>
    </HStack>
  )
}

function HomePage() {
  const [budget, setBudget] = useState(0)
  const [rooms, setRooms] = useState<RoomSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let budgetLoaded = false
    let roomsLoaded = false
    const markLoaded = () => {
      if (budgetLoaded && roomsLoaded) setLoading(false)
    }

    const unsubscribeBudget = onValue(ref(database, OVERALL_BUDGET_PATH), (snapshot) => {
      const value = snapshot.val()
      setBudget(typeof value === 'number' ? value : 0)
      budgetLoaded = true
      markLoaded()
    })

    const unsubscribeRooms = onValue(ref(database, ROOMS_PATH), (snapshot) => {
      const value = snapshot.val() as Record<string, { name: string; budget?: number }> | null
      setRooms(
        value
          ? Object.entries(value).map(([id, room]) => ({
            id,
            name: room.name,
            planned: room.budget ?? 0,
            spent: 0,
          }))
          : [],
      )
      roomsLoaded = true
      markLoaded()
    })

    return () => {
      unsubscribeBudget()
      unsubscribeRooms()
    }
  }, [])

  // TODO: derive from plan-item data once that feature exists
  const planned = 0
  const spent = rooms.reduce((sum, room) => sum + room.spent, 0)
  const spentPct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0
  const plannedPct = budget > 0 ? Math.min(100, (planned / budget) * 100) : 0

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
      <Text fontSize="2xl" fontWeight="bold" mb={6}>
        Podsumowanie kosztorysu
      </Text>

      <Grid templateColumns="repeat(3, 1fr)" gap={3}>
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
        <StatBox value={currencyFormatter.format(budget)} label="budżet" />
      </Grid>

      <Box
        position="relative"
        h="6"
        mt={4}
        borderRadius="full"
        borderWidth="3px"
        borderStyle="dashed"
        borderColor="border"
        overflow="hidden"
      >
        <Box position="absolute" inset="0" bg="#CF4173" width={`${plannedPct}%`} />
        <Box position="absolute" inset="0" bg="#5D3140" width={`${spentPct}%`} />
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

      <Grid templateColumns="repeat(2, 1fr)" gap={3} mt={6}>
        <StatBox variant="solid" color="#F39399" value={String(rooms.length)} label="pomieszczenia" />
        <StatBox variant="solid" color="#F39399" value="0" label="faktury" />
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
