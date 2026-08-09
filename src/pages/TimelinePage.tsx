import { Box } from '@chakra-ui/react'
import { ChartLine } from '@gravity-ui/icons'
import PageTitle from '../components/PageTitle'

function TimelinePage() {
  return (
    <Box p={4}>
      <PageTitle icon={ChartLine}>Plan</PageTitle>
    </Box>
  )
}

export default TimelinePage
