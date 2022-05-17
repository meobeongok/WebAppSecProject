import * as React from 'react'
import { Text, Tooltip } from '@mantine/core'

interface RemainTimeProps {
  begin: Date
  end: Date
  onTimeChange?(isDeadlineOverDue: boolean): void
}

function RemainTime({ begin, end, onTimeChange }: RemainTimeProps): JSX.Element {
  const [remainTimeColor, setRemainTimeColor] = React.useState<string>('black')
  const [remainTime, setRemainTime] = React.useState<string>('')
  const hourDivisor = 1000 * 3600
  const dayDivisor = hourDivisor * 24

  React.useEffect(() => {
    calculateRemainTime()

    const interval = setInterval(() => {
      calculateRemainTime()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const calculateRemainTime = React.useCallback((): void => {
    const diff = end.getTime() - Date.now()
    const days = Math.floor(diff / dayDivisor)
    const hours = Math.round((diff % dayDivisor) / hourDivisor)
    setRemainTime(getRemainTime(days, hours))
    setRemainTimeColor(getRemainTimeColor(days, hours))
    if (onTimeChange) onTimeChange(diff <= 0)
  }, [])

  function getRemainTime(dayRemain: number, hourRemain: number): string {
    if (new Date() < begin) return `Not start - Begin at: ${begin.toLocaleDateString()} ${begin.toLocaleTimeString()}`

    if (dayRemain <= 0) {
      if (hourRemain <= 0) return 'Overdue'
      return `${hourRemain} hover remain`
    }

    if (hourRemain <= 0) return `${dayRemain} day remain`
    return `${dayRemain} day ${hourRemain} hour remain`
  }

  function getRemainTimeColor(dayRemain: number, hourRemain: number) {
    if (new Date() < begin) return 'black'
    if (dayRemain > 0) return 'blue'
    if (hourRemain > 0) return 'yellow'
    return 'red'
  }

  return (
    <Tooltip label={`${begin.toLocaleDateString()} ${begin.toLocaleTimeString()} - ${end.toLocaleDateString()} ${end.toLocaleTimeString()}`}>
      <Text color={remainTimeColor}>{remainTime}</Text>
    </Tooltip>
  )
}

export default RemainTime
