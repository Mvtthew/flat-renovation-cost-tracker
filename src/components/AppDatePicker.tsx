import { DatePicker, IconButton, Portal, parseDate } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight, Calendar } from '@gravity-ui/icons'

interface AppDatePickerProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

function AppDatePicker({ value, onValueChange, disabled, placeholder }: AppDatePickerProps) {
  return (
    <DatePicker.Root
      locale="pl-PL"
      value={value ? [parseDate(value)] : []}
      onValueChange={(details) => onValueChange(details.valueAsString[0] ?? '')}
      disabled={disabled}
      positioning={{ sameWidth: false }}
    >
      <DatePicker.Control
        borderWidth="2px"
        borderRadius="l2"
        display="flex"
        alignItems="center"
        pr={1}
        _focusWithin={{ borderColor: 'primary.500' }}
      >
        <DatePicker.Input
          placeholder={placeholder}
          border="none"
          px={3}
          flex="1"
          _focus={{ outline: 'none' }}
          _placeholder={{ color: 'fg.muted/80' }}
        />
        <DatePicker.Trigger asChild>
          <IconButton variant="ghost" size="sm" aria-label="Wybierz datę">
            <Calendar />
          </IconButton>
        </DatePicker.Trigger>
      </DatePicker.Control>
      <Portal>
        <DatePicker.Positioner>
          <DatePicker.Content>
            <DatePicker.View view="day">
              <DatePicker.Context>
                {(datePicker) => (
                  <>
                    <DatePicker.ViewControl>
                      <DatePicker.PrevTrigger asChild>
                        <IconButton variant="ghost" size="sm" aria-label="Poprzedni miesiąc">
                          <ChevronLeft />
                        </IconButton>
                      </DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger>
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger asChild>
                        <IconButton variant="ghost" size="sm" aria-label="Następny miesiąc">
                          <ChevronRight />
                        </IconButton>
                      </DatePicker.NextTrigger>
                    </DatePicker.ViewControl>
                    <DatePicker.Table>
                      <DatePicker.TableHead>
                        <DatePicker.TableRow>
                          {datePicker.weekDays.map((weekDay, id) => (
                            <DatePicker.TableHeader key={id}>{weekDay.narrow}</DatePicker.TableHeader>
                          ))}
                        </DatePicker.TableRow>
                      </DatePicker.TableHead>
                      <DatePicker.TableBody>
                        {datePicker.weeks.map((week, id) => (
                          <DatePicker.TableRow key={id}>
                            {week.map((day, id) => (
                              <DatePicker.TableCell key={id} value={day}>
                                <DatePicker.TableCellTrigger>{day.day}</DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>
            <DatePicker.View view="month">
              <DatePicker.Context>
                {(datePicker) => (
                  <>
                    <DatePicker.ViewControl>
                      <DatePicker.PrevTrigger asChild>
                        <IconButton variant="ghost" size="sm" aria-label="Poprzedni rok">
                          <ChevronLeft />
                        </IconButton>
                      </DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger>
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger asChild>
                        <IconButton variant="ghost" size="sm" aria-label="Następny rok">
                          <ChevronRight />
                        </IconButton>
                      </DatePicker.NextTrigger>
                    </DatePicker.ViewControl>
                    <DatePicker.Table>
                      <DatePicker.TableBody>
                        {datePicker.getMonthsGrid({ columns: 4, format: 'short' }).map((months, id) => (
                          <DatePicker.TableRow key={id}>
                            {months.map((month, id) => (
                              <DatePicker.TableCell key={id} value={month.value}>
                                <DatePicker.TableCellTrigger>{month.label}</DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>
            <DatePicker.View view="year">
              <DatePicker.Context>
                {(datePicker) => (
                  <>
                    <DatePicker.ViewControl>
                      <DatePicker.PrevTrigger asChild>
                        <IconButton variant="ghost" size="sm" aria-label="Poprzednia dekada">
                          <ChevronLeft />
                        </IconButton>
                      </DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger>
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger asChild>
                        <IconButton variant="ghost" size="sm" aria-label="Następna dekada">
                          <ChevronRight />
                        </IconButton>
                      </DatePicker.NextTrigger>
                    </DatePicker.ViewControl>
                    <DatePicker.Table>
                      <DatePicker.TableBody>
                        {datePicker.getYearsGrid({ columns: 4 }).map((years, id) => (
                          <DatePicker.TableRow key={id}>
                            {years.map((year, id) => (
                              <DatePicker.TableCell key={id} value={year.value}>
                                <DatePicker.TableCellTrigger>{year.label}</DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal>
    </DatePicker.Root>
  )
}

export default AppDatePicker
