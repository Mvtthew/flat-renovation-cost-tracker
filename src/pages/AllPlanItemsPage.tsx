import { useEffect, useState } from 'react'
import { Box, Button, Collapsible, HStack, IconButton, Input, InputGroup, Spinner, Tag, Text, VStack, Wrap } from '@chakra-ui/react'
import { ref, onValue } from 'firebase/database'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Box as BoxIcon,
  Calendar,
  ChevronDown,
  Folders,
  Hourglass,
  Link as LinkIcon,
  ListUl,
  Magnifier,
  Pencil,
  ShoppingBasket,
  Trolley,
} from '@gravity-ui/icons'
import { database } from '../lib/firebase'
import { getRoomIcon } from '../lib/roomIcons'
import { groupItemsByTag, NO_TAG_GROUP } from '../lib/groupByTag'
import type { PlanItem } from './PlanItemFormPage'
import type { Room } from './RoomFormPage'
import type { Shop } from './ShopFormPage'
import SwipeableRow from '../components/SwipeableRow'

const PLAN_ITEMS_PATH = 'planItems'
const ROOMS_PATH = 'settings/rooms'
const SHOPS_PATH = 'settings/shops'

const currencyFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium' })

function AllPlanItemsPage() {
  const navigate = useNavigate()

  const [planItems, setPlanItems] = useState<PlanItem[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [groupByTagEnabled, setGroupByTagEnabled] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  useEffect(() => {
    let planItemsLoaded = false
    let roomsLoaded = false
    const markLoaded = () => {
      if (planItemsLoaded && roomsLoaded) setLoading(false)
    }

    const unsubscribePlanItems = onValue(ref(database, PLAN_ITEMS_PATH), (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<PlanItem, 'id'>> | null
      setPlanItems(value ? Object.entries(value).map(([id, item]) => ({ id, ...item })) : [])
      planItemsLoaded = true
      markLoaded()
    })

    const unsubscribeRooms = onValue(ref(database, ROOMS_PATH), (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<Room, 'id'>> | null
      const list = value ? Object.entries(value).map(([id, room]) => ({ id, ...room })) : []
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setRooms(list)
      roomsLoaded = true
      markLoaded()
    })

    const unsubscribeShops = onValue(ref(database, SHOPS_PATH), (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<Shop, 'id'>> | null
      setShops(value ? Object.entries(value).map(([id, shop]) => ({ id, ...shop })) : [])
    })

    return () => {
      unsubscribePlanItems()
      unsubscribeRooms()
      unsubscribeShops()
    }
  }, [])

  const roomOrder = new Map(rooms.map((room, index) => [room.id, index]))
  const sortedPlanItems = [...planItems].sort((a, b) => {
    const roomDiff = (roomOrder.get(a.roomId) ?? 0) - (roomOrder.get(b.roomId) ?? 0)
    if (roomDiff !== 0) return roomDiff
    return (a.order ?? 0) - (b.order ?? 0)
  })

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredPlanItems = normalizedQuery
    ? sortedPlanItems.filter((item) => {
      const room = rooms.find((r) => r.id === item.roomId)
      const shop = shops.find((s) => s.id === item.shopId)
      return (
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ||
        room?.name.toLowerCase().includes(normalizedQuery) ||
        shop?.name.toLowerCase().includes(normalizedQuery)
      )
    })
    : sortedPlanItems

  const itemCost = (item: PlanItem) =>
    (item.price ?? 0) * (item.amount ?? 1) + (item.pickupType === 'delivery' ? (item.deliveryCost ?? 0) : 0)

  const totalPlanned = planItems.reduce((sum, item) => sum + itemCost(item), 0)

  const toggleGroupExpanded = (tag: string) => {
    setExpandedGroups((current) => {
      const next = new Set(current)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  const renderPlanItemRow = (item: PlanItem, isLast: boolean) => {
    const room = rooms.find((r) => r.id === item.roomId)
    const RoomIcon = getRoomIcon(room?.icon)
    return (
      <SwipeableRow
        key={item.id}
        borderBottomWidth={isLast ? undefined : '1px'}
        borderColor="border"
        actions={[
          {
            label: 'Edytuj pozycję',
            icon: <Pencil />,
            onClick: () => navigate(`/pozycje/${item.id}`),
          },
        ]}
      >
        <HStack justify="space-between" py={3}>
          <HStack gap={3}>
            <Box
              boxSize="6"
              minW="6"
              flexShrink={0}
              display="flex"
              alignItems="center"
              mb="auto"
              mt={0.5}
              justifyContent="center"
              color="primary.300"
            >
              <BoxIcon />
            </Box>
            <Box>
              <Text fontSize="md">{item.name}</Text>
              {item.tags && item.tags.length > 0 && (
                <Wrap gap={1} my={1}>
                  {item.tags.map((tag) => (
                    <Tag.Root key={tag} size="sm" colorPalette="primary" variant="solid">
                      <Tag.Label>{tag}</Tag.Label>
                    </Tag.Root>
                  ))}
                </Wrap>
              )}
              <Text fontSize="sm" color="fg.muted">
                {currencyFormatter.format((item.price ?? 0) * (item.amount ?? 1))}
                {(item.amount ?? 1) > 1 ? ` · ${item.amount} szt.` : ''}
              </Text>
              {room && (
                <HStack gap={1} mt={0.5}>
                  <Box boxSize="2.5" display="flex" alignItems="center" color="fg.muted">
                    <RoomIcon />
                  </Box>
                  <Text fontSize="xs" color="fg.muted">
                    {room.name}
                  </Text>
                </HStack>
              )}
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
                    {dateFormatter.format(new Date(item.targetDate))}
                  </Text>
                </HStack>
              )}
            </Box>
          </HStack>
          <HStack gap={1}>
            {item.link && (
              <IconButton asChild aria-label="Otwórz link" variant="ghost" size="sm">
                <a href={item.link} target="_blank" rel="noreferrer">
                  <LinkIcon />
                </a>
              </IconButton>
            )}
          </HStack>
        </HStack>
      </SwipeableRow>
    )
  }

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center" py={12}>
        <Spinner size="lg" />
      </Box>
    )
  }

  return (
    <Box p={4} pb={8}>
      <HStack justify="space-between" mb={6}>
        <Box as="button" onClick={() => navigate(-1)} className="cursor-pointer" display="flex">
          <ArrowLeft />
        </Box>
        <HStack gap={2}>
          <Box display="flex" alignItems="center" color="primary.solid">
            <BoxIcon width={22} height={22} />
          </Box>
          <Text fontSize="xl" fontWeight="bold">
            Wszystkie pozycje
          </Text>
        </HStack>
        <Box w={4} />
      </HStack>

      <HStack justify="space-between" mb={4}>
        <Text fontSize="sm" color="fg.muted">
          {planItems.length} pozycji · {currencyFormatter.format(totalPlanned)}
        </Text>
        <HStack gap={2}>
          <IconButton
            aria-label={groupByTagEnabled ? 'Pokaż jako listę' : 'Grupuj po tagach'}
            variant={groupByTagEnabled ? 'solid' : 'ghost'}
            colorPalette="primary"
            size="sm"
            onClick={() => setGroupByTagEnabled((current) => !current)}
          >
            {groupByTagEnabled ? <Folders /> : <ListUl />}
          </IconButton>
          <Button asChild colorPalette="primary" size="sm">
            <Link to="/dodaj">+ Pozycja planu</Link>
          </Button>
        </HStack>
      </HStack>

      <InputGroup startElement={<Magnifier width={16} height={16} />} mb={4}>
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Szukaj pozycji…"
          borderWidth="2px"
        />
      </InputGroup>

      {planItems.length === 0 ? (
        <Text fontSize="sm" color="fg.muted" py={2}>
          Brak zaplanowanych pozycji.
        </Text>
      ) : filteredPlanItems.length === 0 ? (
        <Text fontSize="sm" color="fg.muted" py={2}>
          Brak pozycji pasujących do wyszukiwania.
        </Text>
      ) : groupByTagEnabled ? (
        <VStack align="stretch" gap={1}>
          {groupItemsByTag(filteredPlanItems).map(({ tag, items }) => {
            const isExpanded = expandedGroups.has(tag)
            const groupTotal = items.reduce((sum, item) => sum + itemCost(item), 0)
            return (
              <Collapsible.Root
                key={tag}
                open={isExpanded}
                onOpenChange={() => toggleGroupExpanded(tag)}
              >
                <Collapsible.Trigger asChild>
                  <HStack
                    as="button"
                    w="full"
                    justify="space-between"
                    py={2}
                    cursor="pointer"
                  >
                    <HStack gap={2}>
                      <Box
                        display="flex"
                        alignItems="center"
                        transform={isExpanded ? undefined : 'rotate(-90deg)'}
                        transition="transform 0.15s"
                      >
                        <ChevronDown width={16} height={16} />
                      </Box>
                      <Text fontWeight="bold">{tag === NO_TAG_GROUP ? 'Bez tagu' : tag}</Text>
                      <Text fontSize="sm" color="fg.muted">
                        ({items.length})
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="fg.muted">
                      {currencyFormatter.format(groupTotal)}
                    </Text>
                  </HStack>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <Box>
                    {items.map((item, index) => renderPlanItemRow(item, index === items.length - 1))}
                  </Box>
                </Collapsible.Content>
              </Collapsible.Root>
            )
          })}
        </VStack>
      ) : (
        <Box>
          {filteredPlanItems.map((item, index) =>
            renderPlanItemRow(item, index === filteredPlanItems.length - 1),
          )}
        </Box>
      )}
    </Box>
  )
}

export default AllPlanItemsPage
