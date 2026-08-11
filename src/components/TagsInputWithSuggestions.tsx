import { useMemo } from 'react'
import { Box, TagsInput } from '@chakra-ui/react'

interface TagsInputWithSuggestionsProps {
  value: string[]
  onValueChange: (value: string[]) => void
  inputValue: string
  onInputValueChange: (inputValue: string) => void
  existingTags: string[]
  disabled?: boolean
}

function TagsInputWithSuggestions({
  value,
  onValueChange,
  inputValue,
  onInputValueChange,
  existingTags,
  disabled,
}: TagsInputWithSuggestionsProps) {
  const suggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase()
    if (!query) return []
    return existingTags.filter((tag) => tag.toLowerCase().includes(query) && !value.includes(tag)).slice(0, 6)
  }, [existingTags, inputValue, value])

  return (
    <Box position="relative">
      <TagsInput.Root
        value={value}
        onValueChange={(details) => onValueChange(details.value)}
        inputValue={inputValue}
        onInputValueChange={(details) => onInputValueChange(details.inputValue)}
        disabled={disabled}
        colorPalette="primary"
      >
        <TagsInput.Control borderWidth="2px">
          {value.map((tag, index) => (
            <TagsInput.Item key={tag} index={index} value={tag}>
              <TagsInput.ItemPreview>
                <TagsInput.ItemText>{tag}</TagsInput.ItemText>
                <TagsInput.ItemDeleteTrigger />
              </TagsInput.ItemPreview>
              <TagsInput.ItemInput />
            </TagsInput.Item>
          ))}
          <TagsInput.Input placeholder="Dodaj tag i wciśnij Enter" _placeholder={{ color: 'rgba(93, 49, 64, 0.5)' }} />
        </TagsInput.Control>
      </TagsInput.Root>
      {suggestions.length > 0 && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={1}
          zIndex={1}
          bg="bg"
          borderWidth="2px"
          borderColor="border"
          borderRadius="md"
          overflow="hidden"
          boxShadow="md"
        >
          {suggestions.map((tag) => (
            <Box
              key={tag}
              display="block"
              w="full"
              textAlign="left"
              px={3}
              py={2}
              cursor="pointer"
              _hover={{ bg: 'primary.subtle' }}
              onMouseDown={(event) => {
                event.preventDefault()
                onValueChange([...value, tag])
                onInputValueChange('')
              }}
            >
              {tag}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default TagsInputWithSuggestions
