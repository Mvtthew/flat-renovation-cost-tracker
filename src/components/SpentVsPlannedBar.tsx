import { BarSegment, useChart } from '@chakra-ui/charts'
import { Box, Text } from '@chakra-ui/react'

interface SpentVsPlannedBarProps {
  planned: number
  spent: number
  formatValue: (value: number) => string
}

const SPENT_COLOR = '#5D3140' // primary.500 — "wydano", matches HomePage's spent bar
const REMAINING_COLOR = '#CF4173' // "zaplanowano" accent, matches HomePage's planned bar

function SpentVsPlannedBar({ planned, spent, formatValue }: SpentVsPlannedBarProps) {
  const total = Math.max(planned, spent)
  const remaining = Math.max(total - spent, 0)

  const data = [
    { name: 'Wydano', value: spent, color: SPENT_COLOR },
    ...(remaining > 0 ? [{ name: 'Pozostało z planu', value: remaining, color: REMAINING_COLOR }] : []),
  ]

  const chart = useChart({ data })

  if (total <= 0) {
    return (
      <Text fontSize="sm" color="fg.muted" textAlign="center">
        Brak danych do porównania.
      </Text>
    )
  }

  return (
    <BarSegment.Root chart={chart} gap="3">
      <BarSegment.Content>
        <Box css={{ '& > div > div': { borderRadius: '5px' } }}>
          <BarSegment.Bar tooltip />
        </Box>
      </BarSegment.Content>
      <BarSegment.Legend showValue valueFormatter={formatValue} fontSize="xs" lineHeight="0" gap="3" />
    </BarSegment.Root>
  )
}

export default SpentVsPlannedBar
