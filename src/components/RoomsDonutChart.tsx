import { Chart, useChart } from '@chakra-ui/charts'
import { Cell, Label, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
import { Box, Text } from '@chakra-ui/react'

const LABEL_MAX_CHARS = 7

function truncateLabel(name: string) {
  return name.length > LABEL_MAX_CHARS ? `${name.slice(0, LABEL_MAX_CHARS)}.` : name
}

export interface DonutSegment {
  id: string
  label: string
  value: number
}

interface RoomsDonutChartProps {
  segments: DonutSegment[]
  centerLabel: string
  total: number
  formatValue: (value: number) => string
  showLabels?: boolean
}

// Fixed brand order — never cycled or reassigned by value/rank, so a room
// keeps its color as the underlying data changes.
const SLOT_COLORS = [
  '#5D3140', // primary.500
  '#CF4173', // "zaplanowano" accent
  '#F39399', // lightest brand accent
  '#8C3557', // deep magenta, between primary.500 and the accent
  '#E0668A', // pink, between the accent and its lightest tint
  '#A34F6A', // primary.400
  '#B23A63', // muted magenta
  '#D9A7B7', // primary.200
  '#722C48', // dark magenta-plum
  '#C57B93', // primary.300
  '#9E4460', // mid magenta-rose
  '#F0839A', // coral-pink
  '#EDB6C2', // light pink
  '#FBC4CE', // pale pink
  '#4A2733', // primary.600, very dark plum
  '#DB5C82', // pink-magenta
  '#8F5468', // muted mauve
  '#C2456F', // rich rose
  '#E89AAE', // dusty pink
  '#6B2E44', // deep wine
]
const OTHER_COLOR = '#ecd3db' // primary.100, reserved for the folded "Inne" slice

function RoomsDonutChart({ segments, centerLabel, total, formatValue, showLabels = true }: RoomsDonutChartProps) {
  const withValue = segments.filter((segment) => segment.value > 0)

  const topSegments = withValue.slice(0, SLOT_COLORS.length)
  const otherValue = withValue.slice(SLOT_COLORS.length).reduce((sum, segment) => sum + segment.value, 0)
  const chartData = [
    ...topSegments.map((segment, index) => ({
      name: segment.label,
      value: segment.value,
      color: SLOT_COLORS[index],
    })),
    ...(otherValue > 0 ? [{ name: 'Inne', value: otherValue, color: OTHER_COLOR }] : []),
  ]

  const chart = useChart({
    data: chartData,
    series: chartData.map((item) => ({ name: item.name as never, color: item.color })),
  })

  if (total <= 0 || chartData.length === 0) {
    return (
      <Text fontSize="sm" color="fg.muted">
        Brak zaplanowanych pozycji.
      </Text>
    )
  }

  return (
    <Box w="100%" maxW="260px" mx="auto">
      <Chart.Root w="100%" aspectRatio={1} chart={chart}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              cursor={false}
              animationDuration={100}
              content={<Chart.Tooltip hideLabel formatter={(value) => formatValue(Number(value))} />}
            />
            <Pie
              isAnimationActive={false}
              data={chart.data}
              dataKey={chart.key('value')}
              nameKey={chart.key('name')}
              innerRadius="65%"
              outerRadius="90%"
              paddingAngle={2}
              cornerRadius={5}
              strokeWidth={0}
              label={
                showLabels
                  ? ({ name, x, y, textAnchor }: PieLabelRenderProps) => {
                    if (!name) return null
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="var(--chakra-colors-fg-muted)"
                        textAnchor={textAnchor ?? 'middle'}
                        dominantBaseline="central"
                      >
                        {truncateLabel(String(name))}
                      </text>
                    )
                  }
                  : false
              }
              activeShape={(shapeProps: React.ComponentProps<typeof Sector>) => (
                <Sector {...shapeProps} outerRadius={Number(shapeProps.outerRadius) + 6} />
              )}
            >
              {chart.data.map((item) => (
                <Cell key={item.name} fill={chart.color(item.color)} />
              ))}
              <Label
                content={({ viewBox }) => (
                  <Chart.RadialText viewBox={viewBox} title={formatValue(total)} fontSize='26px' gap={18} description={centerLabel} />
                )}
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Chart.Root>
    </Box>
  )
}

export default RoomsDonutChart
