import { useEffect, useState } from 'react'
import { Box, Button, HStack, IconButton, Spinner, Text, VStack } from '@chakra-ui/react'
import { ref, onValue } from 'firebase/database'
import { Link } from 'react-router-dom'
import { Pencil, ShoppingBasket } from '@gravity-ui/icons'
import { database } from '../lib/firebase'
import type { PickupType, Shop } from '../pages/ShopFormPage'

const SHOPS_PATH = 'settings/shops'

function ShopsSection() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const shopsRef = ref(database, SHOPS_PATH)
    return onValue(shopsRef, (snapshot) => {
      const value = snapshot.val() as Record<
        string,
        { name: string; website?: string; pickupType?: PickupType; notes?: string }
      > | null
      setShops(
        value ? Object.entries(value).map(([id, shop]) => ({ id, ...shop })) : [],
      )
      setLoading(false)
    })
  }, [])

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
        <VStack gap={0} align="stretch" divideY="1px" borderColor="border">
          {shops.map((shop) => (
            <HStack key={shop.id} justify="space-between" py={3}>
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
          ))}
        </VStack>
      )}
      <Text mt={3} fontSize="sm" color="fg.muted">
        Sklepy pokazane tutaj pojawiają się jako opcje w formularzu pozycji planu.
      </Text>
    </Box>
  )
}

export default ShopsSection
