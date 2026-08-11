import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Dialog, Grid, HStack, IconButton, Portal, Spinner, Tag, TagsInput, Text, Wrap } from '@chakra-ui/react'
import { ref, onValue, update } from 'firebase/database'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Box as BoxIcon,
  Calendar,
  CircleMinus,
  FilePlus,
  FileText,
  Hourglass,
  Link as LinkIcon,
  Pencil,
  Receipt,
  ShoppingBasket,
  Tag as TagIcon,
  Trolley,
  Xmark,
} from '@gravity-ui/icons'
import { database } from '../lib/firebase'
import { getRoomIcon } from '../lib/roomIcons'
import type { Room } from './RoomFormPage'
import type { PlanItem } from './PlanItemFormPage'
import type { Shop } from './ShopFormPage'
import type { Invoice } from './InvoiceFormPage'
import SortableList from '../components/SortableList'
import SwipeableRow from '../components/SwipeableRow'
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
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [addTagModalOpen, setAddTagModalOpen] = useState(false)
  const [addTagValue, setAddTagValue] = useState<string[]>([])
  const [addTagInputValue, setAddTagInputValue] = useState('')
  const [removeTagModalOpen, setRemoveTagModalOpen] = useState(false)
  const [tagsToRemove, setTagsToRemove] = useState<string[]>([])

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

  const toggleTag = (tag: string) => {
    setActiveTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    )
  }

  const toggleSelectItem = (itemId: string) => {
    setSelectedItemIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId],
    )
  }

  const clearSelection = () => setSelectedItemIds([])

  const selectedItems = useMemo(
    () => planItems.filter((item) => selectedItemIds.includes(item.id)),
    [planItems, selectedItemIds],
  )

  const selectedTags = useMemo(
    () => [...new Set(selectedItems.flatMap((item) => item.tags ?? []))].sort((a, b) => a.localeCompare(b)),
    [selectedItems],
  )

  const openAddTagModal = () => {
    setAddTagValue([])
    setAddTagInputValue('')
    setAddTagModalOpen(true)
  }

  const confirmAddTags = () => {
    if (addTagValue.length > 0) {
      const updates: Record<string, string[]> = {}
      selectedItems.forEach((item) => {
        updates[`${PLAN_ITEMS_PATH}/${item.id}/tags`] = [...new Set([...(item.tags ?? []), ...addTagValue])]
      })
      update(ref(database), updates)
    }
    setAddTagModalOpen(false)
    clearSelection()
  }

  const openRemoveTagModal = () => {
    setTagsToRemove([])
    setRemoveTagModalOpen(true)
  }

  const toggleTagToRemove = (tag: string) => {
    setTagsToRemove((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    )
  }

  const confirmRemoveTags = () => {
    if (tagsToRemove.length > 0) {
      const updates: Record<string, string[]> = {}
      selectedItems.forEach((item) => {
        updates[`${PLAN_ITEMS_PATH}/${item.id}/tags`] = (item.tags ?? []).filter(
          (tag) => !tagsToRemove.includes(tag),
        )
      })
      update(ref(database), updates)
    }
    setRemoveTagModalOpen(false)
    clearSelection()
  }

  const filteredPlanItems = useMemo(
    () =>
      activeTags.length === 0
        ? planItems
        : planItems.filter((item) => activeTags.every((tag) => item.tags?.includes(tag))),
    [planItems, activeTags],
  )

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

  const renderPlanItemRow = (item: PlanItem, isLast: boolean) => (
    <SwipeableRow
      key={item.id}
      borderBottomWidth={isLast ? undefined : '1px'}
      borderColor="border"
      onSwipeRight={() => toggleSelectItem(item.id)}
      selected={selectedItemIds.includes(item.id)}
      actions={[
        ...(item.notes
          ? [
            {
              label: 'Pokaż notatki',
              icon: <FileText />,
              onClick: () => setNotesEntry({ title: item.name, notes: item.notes ?? '' }),
              colorPalette: 'gray',
            },
          ]
          : []),
        {
          label: 'Edytuj pozycję',
          icon: <Pencil />,
          onClick: () => navigate(`/pozycje/${item.id}`),
        },
      ]}
    >
      <HStack
        justify="space-between"
        py={3}
      >
        <HStack gap={3}>
          <Box
            boxSize="6"
            minW="6"
            flexShrink={0}
            display="flex"
            alignItems="center"
            mb={'auto'}
            mt={0.5}
            justifyContent="center"
            color="primary.300"
          >
            <BoxIcon />
          </Box>
          <Box>
            <Text fontSize={'md'}>{item.name}</Text>
            {item.tags && item.tags.length > 0 && (
              <Wrap gap={1} my={1}>
                {item.tags.map((tag) => (
                  <Tag.Root
                    key={tag}
                    size="sm"
                    colorPalette="primary"
                    variant="solid"
                    cursor="pointer"
                    outline={activeTags.includes(tag) ? '2px solid' : undefined}
                    outlineOffset="1px"
                    outlineColor="primary.700"
                    onClick={(event) => {
                      event.stopPropagation()
                      toggleTag(tag)
                    }}
                  >
                    <Tag.Label>{tag}</Tag.Label>
                  </Tag.Root>
                ))}
              </Wrap>
            )}
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
        </HStack>
      </HStack>
    </SwipeableRow>
  )

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center" py={12}>
        <Spinner size="lg" />
      </Box>
    )
  }

  const budget = room?.budget ?? 0
  const RoomIcon = getRoomIcon(room?.icon)

  return (
    <Box p={4} pb={8}>
      <HStack justify="space-between" mb={6}>
        <Box as="button" onClick={() => navigate('/')} className="cursor-pointer" display="flex">
          <ArrowLeft />
        </Box>
        <HStack gap={2}>
          <Box display="flex" alignItems="center" color="primary.solid">
            <RoomIcon width={22} height={22} />
          </Box>
          <Text fontSize="xl" fontWeight="bold">
            {room?.name ?? 'Pomieszczenie'}
          </Text>
        </HStack>
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

      <HStack justify="space-between" mt={8} mb={activeTags.length > 0 ? 2 : 3}>
        <Text fontWeight="bold">Zaplanowane ({filteredPlanItems.length})</Text>
        <Button asChild colorPalette="primary" size="sm">
          <Link to={`/dodaj?roomId=${roomId}`}>+ Pozycja planu</Link>
        </Button>
      </HStack>
      {activeTags.length > 0 && (
        <Wrap gap={2} mb={3}>
          {activeTags.map((tag) => (
            <Tag.Root key={tag} colorPalette="primary" variant="solid" cursor="pointer" onClick={() => toggleTag(tag)}>
              <Tag.Label>{tag}</Tag.Label>
              <Tag.EndElement>
                <Tag.CloseTrigger />
              </Tag.EndElement>
            </Tag.Root>
          ))}
        </Wrap>
      )}
      {planItems.length === 0 ? (
        <Text fontSize="sm" color="fg.muted" py={2}>
          Brak zaplanowanych pozycji.
        </Text>
      ) : filteredPlanItems.length === 0 ? (
        <Text fontSize="sm" color="fg.muted" py={2}>
          Brak pozycji z wybranymi tagami.
        </Text>
      ) : activeTags.length > 0 ? (
        <Box>
          {filteredPlanItems.map((item, index) =>
            renderPlanItemRow(item, index === filteredPlanItems.length - 1),
          )}
        </Box>
      ) : (
        <SortableList
          items={planItems}
          onReorder={handleReorderPlanItems}
          renderItem={(item) => renderPlanItemRow(item, item.id === planItems[planItems.length - 1].id)}
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
                    minW="6"
                    flexShrink={0}
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

      {selectedItemIds.length > 0 && (
        <HStack
          className="fixed inset-x-0"
          bottom="84px"
          justify="center"
          gap={2}
          px={4}
          py={3}
          mx={4}
          borderWidth="2px"
          borderColor="border"
          borderRadius="lg"
          bg="bg.panel"
          boxShadow="lg"
        >
          <Text fontSize="sm" fontWeight="bold" mr="auto">
            Zaznaczono ({selectedItemIds.length})
          </Text>
          <IconButton
            aria-label="Dodaj fakturę"
            variant="subtle"
            colorPalette="primary"
            size="sm"
            onClick={() => navigate(`/faktury/nowa?roomId=${roomId}&itemIds=${selectedItemIds.join(',')}`)}
          >
            <FilePlus />
          </IconButton>
          <IconButton aria-label="Dodaj tag" variant="subtle" colorPalette="primary" size="sm" onClick={openAddTagModal}>
            <TagIcon />
          </IconButton>
          <IconButton
            aria-label="Usuń tagi"
            variant="subtle"
            colorPalette="primary"
            size="sm"
            onClick={openRemoveTagModal}
            disabled={selectedTags.length === 0}
          >
            <CircleMinus />
          </IconButton>
          <IconButton aria-label="Odznacz wszystko" variant="subtle" colorPalette="gray" size="sm" onClick={clearSelection}>
            <Xmark />
          </IconButton>
        </HStack>
      )}

      <Dialog.Root open={addTagModalOpen} onOpenChange={(details) => !details.open && setAddTagModalOpen(false)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content mx={4}>
              <Dialog.Header>
                <Dialog.Title>Dodaj tag do zaznaczonych ({selectedItemIds.length})</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <TagsInput.Root
                  value={addTagValue}
                  onValueChange={(details) => setAddTagValue(details.value)}
                  inputValue={addTagInputValue}
                  onInputValueChange={(details) => setAddTagInputValue(details.inputValue)}
                  colorPalette="primary"
                >
                  <TagsInput.Control borderWidth="2px">
                    {addTagValue.map((tag, index) => (
                      <TagsInput.Item key={tag} index={index} value={tag}>
                        <TagsInput.ItemPreview>
                          <TagsInput.ItemText>{tag}</TagsInput.ItemText>
                          <TagsInput.ItemDeleteTrigger />
                        </TagsInput.ItemPreview>
                        <TagsInput.ItemInput />
                      </TagsInput.Item>
                    ))}
                    <TagsInput.Input
                      placeholder="Dodaj tag i wciśnij Enter"
                      _placeholder={{ color: 'rgba(93, 49, 64, 0.5)' }}
                    />
                  </TagsInput.Control>
                </TagsInput.Root>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="ghost" onClick={() => setAddTagModalOpen(false)}>
                  Anuluj
                </Button>
                <Button colorPalette="primary" onClick={confirmAddTags} disabled={addTagValue.length === 0}>
                  Dodaj
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <IconButton aria-label="Zamknij" variant="ghost" size="sm" position="absolute" top={2} right={2}>
                  <Xmark />
                </IconButton>
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root open={removeTagModalOpen} onOpenChange={(details) => !details.open && setRemoveTagModalOpen(false)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content mx={4}>
              <Dialog.Header>
                <Dialog.Title>Usuń tagi z zaznaczonych ({selectedItemIds.length})</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {selectedTags.length === 0 ? (
                  <Text fontSize="sm" color="fg.muted">
                    Zaznaczone pozycje nie mają tagów.
                  </Text>
                ) : (
                  <Wrap gap={2}>
                    {selectedTags.map((tag) => (
                      <Tag.Root
                        key={tag}
                        size="md"
                        colorPalette="primary"
                        variant={tagsToRemove.includes(tag) ? 'solid' : 'subtle'}
                        cursor="pointer"
                        onClick={() => toggleTagToRemove(tag)}
                      >
                        <Tag.Label>{tag}</Tag.Label>
                      </Tag.Root>
                    ))}
                  </Wrap>
                )}
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="ghost" onClick={() => setRemoveTagModalOpen(false)}>
                  Anuluj
                </Button>
                <Button colorPalette="primary" onClick={confirmRemoveTags} disabled={tagsToRemove.length === 0}>
                  Usuń
                </Button>
              </Dialog.Footer>
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
