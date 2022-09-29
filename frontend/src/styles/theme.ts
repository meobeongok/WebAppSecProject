import type { MantineThemeOverride } from '@mantine/core'

const overrideTheme: MantineThemeOverride = {
  fontFamily: '"Lexend Deca", "Segoe UI Variable", "Segoe UI", -apple-system, BlinkMacSystemFont, "ui-sans-serif", sans-serif',
  fontFamilyMonospace: '"Cascadia Code", "Fira Code", SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", ui-monospace, monospace',
  lineHeight: 'calc(1em + 0.5rem)',

  transitionTimingFunction: 'cubic-bezier(0.87, 0, 0.13, 1)',

  other: {
    transitionDuration: {
      default: '0.3s',
      fast: '0.15s'
    },
    transitionTimingFunction: {
      easeInOut: 'cubic-bezier(0.87, 0, 0.13, 1)'
    }
  }
}

export { overrideTheme }
