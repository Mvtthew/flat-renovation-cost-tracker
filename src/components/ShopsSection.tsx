import { useEffect, useState } from 'react'
import { Box, Button, HStack, IconButton, Spinner, Text } from '@chakra-ui/react'
import { ref, onValue, update } from 'firebase/database'
import { Link } from 'react-router-dom'
import { Pencil, ShoppingBasket } from '@gravity-ui/icons'
import { database } from '../lib/firebase'
import type { PickupType, Shop } from '../pages/ShopFormPage'
import SortableList from './SortableList'

const SHOPS_PATH = 'settings/shops'

function ShopsSection() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const shopsRef = ref(database, SHOPS_PATH)
    return onValue(shopsRef, (snapshot) => {
      const value = snapshot.val() as Record<
        string,
        { name: string; website?: string; pickupType?: PickupType; notes?: string; order?: number }
      > | null
      const list = value ? Object.entries(value).map(([id, shop]) => ({ id, ...shop })) : []
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setShops(list)
      setLoading(false)
    })
  }, [])

  const handleReorder = (reordered: Shop[]) => {
    setShops(reordered)
    const updates: Record<string, number> = {}
    reordered.forEach((shop, index) => {
      updates[`${SHOPS_PATH}/${shop.id}/order`] = index
    })
    update(ref(database), updates)
  }

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Text fontWeight="bold">Sklepy / dostawcy</Text>
        <Button asChild colorPalette="primary" size="sm">
          <Link to="/ustawienia/sklepy/nowy">+ Dodaj sklep</Link>
        </Button>
      </HStack>
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <Spinner size="md" />
        </Box>
      ) : (
        <SortableList
          items={shops}
          onReorder={handleReorder}
          renderItem={(shop, index) => (
            <HStack
              justify="space-between"
              py={3}
              borderBottomWidth={index === shops.length - 1 ? '0' : '1px'}
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
                  <ShoppingBasket />
                </Box>
                <Text>{shop.name}</Text>
              </HStack>
              <IconButton asChild aria-label="Edytuj sklep" variant="ghost" size="sm">
                <Link to={`/ustawienia/sklepy/${shop.id}`}>
                  <Pencil />
                </Link>
              </IconButton>
            </HStack>
          )}
        />
      )}
      <Text mt={3} fontSize="sm" color="fg.muted">
        Sklepy pokazane tutaj pojawiają się jako opcje w formularzu pozycji planu.
      </Text>
    </Box>
  )
}

export default ShopsSection
