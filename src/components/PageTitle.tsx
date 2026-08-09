import type { SVGProps } from 'react'
import { HStack, Heading } from '@chakra-ui/react'

interface PageTitleProps {
  children: string
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element
}

function PageTitle({ children, icon: Icon }: PageTitleProps) {
  return (
    <HStack gap={3} mb={8}>
      <Icon width={28} height={28} color="var(--chakra-colors-primary-solid)" />
      <Heading as="h1" fontSize="3xl" fontWeight="normal" textAlign="left">
        {children}
      </Heading>
    </HStack>
  )
}

export default PageTitle
