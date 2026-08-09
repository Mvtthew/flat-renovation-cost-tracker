import { Box, Spinner } from '@chakra-ui/react'

function Loader() {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" minH="100svh">
      <Spinner size="lg" />
    </Box>
  )
}

export default Loader
