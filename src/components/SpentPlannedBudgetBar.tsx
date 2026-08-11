import { BarSegment, useChart } from '@chakra-ui/charts'
import { Box, Text } from '@chakra-ui/react'

interface SpentPlannedBudgetBarProps {
  spent: number
  planned: number
  budget: number
  formatValue: (value: number) => string
  /** Slim, legend-less, tooltip-less rendering for list rows (e.g. HomePage's room list). */
  compact?: boolean
  /** Show each segment's formatted value next to its legend swatch (default true). */
  showLegendValue?: boolean
}

const SPENT_COLOR = '#5D3140' // primary.500 — "wydano"
const PLANNED_COLOR = '#CF4173' // "zaplanowano" accent
const BUDGET_COLOR = '#F39399' // lightest brand accent — unused budget headroom

function SpentPlannedBudgetBar({
  spent,
  planned,
  budget,
  formatValue,
  compact = false,
  showLegendValue = true,
}: SpentPlannedBudgetBarProps) {
  const spentAndPlanned = Math.max(spent, planned)
  const plannedRemainder = Math.max(planned - spent, 0)
  const budgetRemainder = Math.max(budget - spentAndPlanned, 0)

  const data = [
    { name: 'Wydano', value: spent, color: SPENT_COLOR },
    ...(plannedRemainder > 0 ? [{ name: 'Do wydania wg planu', value: plannedRemainder, color: PLANNED_COLOR }] : []),
    ...(budgetRemainder > 0 ? [{ name: 'Pozostały budżet', value: budgetRemainder, color: BUDGET_COLOR }] : []),
  ]

  const chart = useChart({ data })

  if (spent <= 0 && planned <= 0 && budget <= 0) {
    return compact ? null : (
      <Text fontSize="sm" color="fg.muted" textAlign="center">
        Brak danych do porównania.
      </Text>
    )
  }

  return (
    <BarSegment.Root chart={chart} barSize={compact ? '3' : '8'} gap="3">
      <BarSegment.Content>
        <Box css={{ '& > div > div': { borderRadius: '5px' } }}>
          <BarSegment.Bar tooltip={!compact} />
        </Box>
      </BarSegment.Content>
      {!compact && (
        <BarSegment.Legend
          showValue={showLegendValue}
          valueFormatter={formatValue}
          fontSize="xs"
          lineHeight="0"
          gap="3"
        />
      )}
    </BarSegment.Root>
  )
}

export default SpentPlannedBudgetBar
