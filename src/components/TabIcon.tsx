import type { SVGProps } from 'react'
import { Text, VStack } from '@chakra-ui/react'

interface TabIconProps {
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element
  label: string
  active: boolean
}

function TabIcon({ icon: Icon, label, active }: TabIconProps) {
  return (
    <VStack gap={0.5} color={active ? 'teal.500' : 'gray.500'}>
      <Icon width={22} height={22} />
      <Text fontSize="xs" fontWeight={active ? 'semibold' : 'normal'}>
        {label}
      </Text>
    </VStack>
  )
}

export default TabIcon
