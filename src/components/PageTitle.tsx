import { Heading } from '@chakra-ui/react'

interface PageTitleProps {
  children: string
}

function PageTitle({ children }: PageTitleProps) {
  return (
    <Heading as="h1" fontSize="3xl" fontWeight="normal" textAlign="left" mb={8}>
      {children}
    </Heading>
  )
}

export default PageTitle
