import type { SVGProps } from 'react'
import { Text, VStack } from '@chakra-ui/react'

interface TabIconProps {
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element
  label: string
  active: boolean
}

function TabIcon({ icon: Icon, label, active }: TabIconProps) {
  return (
    <VStack gap={0.5} color="primary.solid" opacity={active ? 1 : 0.5}>
      <Icon width={26} height={26} />
      <Text fontSize="xs" fontWeight={active ? 'semibold' : 'normal'}>
        {label}
      </Text>
    </VStack>
  )
}

export default TabIcon
