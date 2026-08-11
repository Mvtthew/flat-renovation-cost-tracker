import { useState } from 'react'
import { Box, Dialog, Grid, IconButton, Portal } from '@chakra-ui/react'
import { Xmark } from '@gravity-ui/icons'
import { DEFAULT_ROOM_ICON, ROOM_ICONS, getRoomIcon } from '../lib/roomIcons'

interface RoomIconPickerProps {
  value?: string
  onChange: (icon: string) => void
}

function RoomIconPicker({ value, onChange }: RoomIconPickerProps) {
  const [open, setOpen] = useState(false)
  const SelectedIcon = getRoomIcon(value)

  return (
    <>
      <Box
        as="button"
        onClick={() => setOpen(true)}
        boxSize="16"
        borderRadius="full"
        bg="primary.100"
        color="primary.600"
        display="flex"
        alignItems="center"
        justifyContent="center"
        className="cursor-pointer"
      >
        <SelectedIcon width={28} height={28} />
      </Box>

      <Dialog.Root open={open} onOpenChange={(details) => setOpen(details.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content mx={4}>
              <Dialog.Header>
                <Dialog.Title>Wybierz ikonę</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pb={6}>
                <Grid templateColumns="repeat(5, 1fr)" gap={3}>
                  {Object.entries(ROOM_ICONS).map(([name, Icon]) => {
                    const selected = (value ?? DEFAULT_ROOM_ICON) === name
                    return (
                      <Box
                        as="button"
                        key={name}
                        onClick={() => {
                          onChange(name)
                          setOpen(false)
                        }}
                        aspectRatio={1}
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        bg={selected ? 'primary.solid' : 'primary.100'}
                        color={selected ? 'primary.contrast' : 'primary.600'}
                        className="cursor-pointer"
                      >
                        <Icon width={22} height={22} />
                      </Box>
                    )
                  })}
                </Grid>
              </Dialog.Body>
              <Dialog.CloseTrigger asChild>
                <IconButton aria-label="Zamknij" variant="ghost" size="sm" position="absolute" top={2} right={2}>
                  <Xmark />
                </IconButton>
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}

export default RoomIconPicker
