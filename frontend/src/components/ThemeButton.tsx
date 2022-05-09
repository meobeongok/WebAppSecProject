import { useTheme } from '@/contexts'
import { ActionIcon, Menu, Tooltip } from '@mantine/core'
import { FiMonitor, FiMoon, FiSun } from 'react-icons/fi'

interface ThemeIconProps {
  theme: 'system' | 'light' | 'dark'
}

function ThemeIcon({ theme }: ThemeIconProps): JSX.Element {
  if (theme === 'light') return <FiSun size={20} />
  if (theme === 'dark') return <FiMoon size={20} />
  return <FiMonitor size={20} />
}

function ThemeButton(): JSX.Element {
  const { theme, setTheme } = useTheme()

  return (
    <Menu
      control={
        <Tooltip label={`Current theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}>
          <ActionIcon size="lg" color="blue">
            <ThemeIcon theme={theme} />
          </ActionIcon>
        </Tooltip>
      }
    >
      <Menu.Item icon={<FiMonitor />} onClick={() => setTheme('system')}>
        System
      </Menu.Item>
      <Menu.Item icon={<FiSun />} onClick={() => setTheme('light')}>
        Light
      </Menu.Item>
      <Menu.Item icon={<FiMoon />} onClick={() => setTheme('dark')}>
        Dark
      </Menu.Item>
    </Menu>
  )
}

export default ThemeButton
