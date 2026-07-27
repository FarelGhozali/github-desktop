export type ThemeSource = 'light' | 'dark' | 'system'

/**
 * Maps a custom theme to its base Electron native theme source.
 * Custom themes are built on top of either the light or dark base,
 * so we tell Electron which base to use for native UI elements.
 */
export function getBaseThemeSource(themeId: string): ThemeSource {
  switch (themeId) {
    case 'high-contrast':
    case 'solarized-dark':
    case 'nord':
    case 'monokai':
    case 'one-dark':
      return 'dark'
    case 'solarized-light':
      return 'light'
    default:
      return 'system'
  }
}
