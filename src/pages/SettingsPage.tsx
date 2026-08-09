import { useEffect, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  HStack,
  InputGroup,
  NumberInput,
  Separator,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { ref, get, set } from 'firebase/database'
import { database } from '../lib/firebase'
import { version } from '../../package.json'
import { useAuth } from '../hooks/useAuth'
import PageTitle from '../components/PageTitle'
import ShopsSection from '../components/ShopsSection'
import RoomsSection from '../components/RoomsSection'

const OVERALL_BUDGET_PATH = 'settings/overallBudget'

function SettingsPage() {
  const { user, signOutUser } = useAuth()
  const [budget, setBudget] = useState('')
  const [loadingBudget, setLoadingBudget] = useState(true)
  const [savingBudget, setSavingBudget] = useState(false)

  useEffect(() => {
    let cancelled = false
    get(ref(database, OVERALL_BUDGET_PATH))
      .then((snapshot) => {
        if (cancelled) return
        const value = snapshot.val()
        setBudget(typeof value === 'number' ? String(value) : '')
      })
      .finally(() => {
        if (!cancelled) setLoadingBudget(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const saveBudget = (value: string) => {
    const valueAsNumber = value === '' ? 0 : Number(value)
    setSavingBudget(true)
    set(ref(database, OVERALL_BUDGET_PATH), valueAsNumber).finally(() => {
      setSavingBudget(false)
    })
  }

  return (
    <Box p={4}>
      <PageTitle>Ustawienia</PageTitle>
      <HStack justify="space-between">
        <HStack gap={3}>
          <Avatar.Root borderWidth="2px" borderColor="primary.solid">
            <Avatar.Image src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'User'} />
            <Avatar.Fallback name={user?.displayName ?? user?.email ?? undefined} />
          </Avatar.Root>
          <Text>{user?.displayName ?? user?.email}</Text>
        </HStack>
        <Button colorPalette="primary" onClick={() => signOutUser()}>
          Wyloguj się
        </Button>
      </HStack>
      <Separator mt={8} />
      <Box mt={4}>
        <Text fontWeight="bold" mb={2}>
          Budżet całkowity
        </Text>
        <NumberInput.Root
          value={budget}
          onValueChange={(details) => setBudget(details.value)}
          onValueCommit={(details) => saveBudget(details.value)}
          min={0}
          disabled={loadingBudget || savingBudget}
          w="full"
        >
          <InputGroup endElement={loadingBudget ? <Spinner size="sm" /> : 'PLN'}>
            <NumberInput.Input />
          </InputGroup>
        </NumberInput.Root>
        <Text mt={3} fontSize="sm" color="fg.muted">
          To jest nasz budżet - tyle ile bierzemy kredytu.
        </Text>
      </Box>
      <Separator mt={8} />
      <Box mt={4}>
        <RoomsSection />
      </Box>
      <Separator mt={8} />
      <Box mt={4}>
        <ShopsSection />
      </Box>
      <Separator mt={8} />
      <Text mt={4} fontSize="sm" color="fg.muted" textAlign="center">
        Made with ❤️ by Mat and Claude
      </Text>
      <Text mt={1} fontSize="xs" color="fg.muted" textAlign="center">
        Wersja {version}
      </Text>
    </Box>
  )
}

export default SettingsPage
