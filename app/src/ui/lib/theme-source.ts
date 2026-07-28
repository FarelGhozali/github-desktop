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
    case 'dracula':
    case 'gruvbox-dark':
    case 'catppuccin-mocha':
    case 'dark-dimmed':
    case 'tokyo-night':
    case 'synthwave84':
    case 'rose-pine':
    case 'everforest-dark':
    case 'night-owl':
    case 'ayu-dark':
    case 'kanagawa':
      return 'dark'
    case 'solarized-light':
    case 'gruvbox-light':
    case 'light-high-contrast':
    case 'rose-pine-dawn':
    case 'everforest-light':
    case 'ayu-light':
      return 'light'
    default:
      return 'system'
  }
}
