import { Box, Button, Heading, VStack } from '@chakra-ui/react'

interface LoginScreenProps {
  onSignIn: () => void
}

function LoginScreen({ onSignIn }: LoginScreenProps) {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" minH="100svh" p={4}>
      <VStack gap={6}>
        <Heading size="xl">Koszt mieszkania</Heading>
        <Button onClick={onSignIn}>Zaloguj się</Button>
      </VStack>
    </Box>
  )
}

export default LoginScreen
