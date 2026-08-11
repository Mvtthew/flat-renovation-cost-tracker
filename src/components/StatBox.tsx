import { Box, HStack, Text } from '@chakra-ui/react'
import type { House } from '@gravity-ui/icons'

export default function StatBox({
  value,
  label,
  variant = 'outline',
  color,
  icon: Icon,
  py = 3,
  borderWidth = '3px',
}: {
  value: string
  label: string
  variant?: 'outline' | 'solid' | 'plain'
  color?: string
  icon?: typeof House
  py?: number
  borderWidth?: string
}) {
  const isSolid = variant === 'solid'
  return (
    <Box
      borderWidth={borderWidth}
      borderColor={color ?? 'border'}
      bg={isSolid ? (color ?? 'primary.solid') : undefined}
      borderRadius="lg"
      py={py}
      textAlign="center"
    >
      <HStack justify="center" gap={1.5} mb={-2}>
        <Text fontSize="lg" fontWeight="black" color={isSolid ? 'white' : (color ?? undefined)}>
          {value}
        </Text>
        {Icon && <Icon width={16} height={16} color={isSolid ? 'white' : (color ?? undefined)} />}
      </HStack>
      <Text fontSize="sm" color={isSolid ? 'whiteAlpha.800' : (color ?? 'fg.muted')}>
        {label}
      </Text>
    </Box>
  )
}
