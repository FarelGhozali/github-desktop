import {
  isMacOSMojaveOrLater,
  isWindows10And1809Preview17666OrLater,
} from '../../lib/get-os'
import { getBoolean } from '../../lib/local-storage'
import {
  setNativeThemeSource,
  shouldUseDarkColors,
} from '../main-process-proxy'
import { ThemeSource } from './theme-source'

/**
 * A set of the user-selectable appearances (aka themes)
 */
export enum ApplicationTheme {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
  HighContrast = 'high-contrast',
  SolarizedLight = 'solarized-light',
  SolarizedDark = 'solarized-dark',
  Nord = 'nord',
  Monokai = 'monokai',
  OneDark = 'one-dark',
  Dracula = 'dracula',
  GruvboxDark = 'gruvbox-dark',
  GruvboxLight = 'gruvbox-light',
  CatppuccinMocha = 'catppuccin-mocha',
  LightHighContrast = 'light-high-contrast',
  DarkDimmed = 'dark-dimmed',
  TokyoNight = 'tokyo-night',
  Synthwave84 = 'synthwave84',
  RosePine = 'rose-pine',
  RosePineDawn = 'rose-pine-dawn',
  EverforestDark = 'everforest-dark',
  EverforestLight = 'everforest-light',
  NightOwl = 'night-owl',
  AyuDark = 'ayu-dark',
  AyuLight = 'ayu-light',
  Kanagawa = 'kanagawa',
}

export type ApplicableTheme =
  | ApplicationTheme.Light
  | ApplicationTheme.Dark
  | ApplicationTheme.HighContrast
  | ApplicationTheme.SolarizedLight
  | ApplicationTheme.SolarizedDark
  | ApplicationTheme.Nord
  | ApplicationTheme.Monokai
  | ApplicationTheme.OneDark
  | ApplicationTheme.Dracula
  | ApplicationTheme.GruvboxDark
  | ApplicationTheme.GruvboxLight
  | ApplicationTheme.CatppuccinMocha
  | ApplicationTheme.LightHighContrast
  | ApplicationTheme.DarkDimmed
  | ApplicationTheme.TokyoNight
  | ApplicationTheme.Synthwave84
  | ApplicationTheme.RosePine
  | ApplicationTheme.RosePineDawn
  | ApplicationTheme.EverforestDark
  | ApplicationTheme.EverforestLight
  | ApplicationTheme.NightOwl
  | ApplicationTheme.AyuDark
  | ApplicationTheme.AyuLight
  | ApplicationTheme.Kanagawa

/**
 * Gets the friendly name of an application theme for use
 * in persisting to storage and/or calculating the required
 * body class name to set in order to apply the theme.
 */
export function getThemeName(theme: ApplicationTheme): ThemeSource {
  switch (theme) {
    case ApplicationTheme.Light:
    case ApplicationTheme.SolarizedLight:
    case ApplicationTheme.GruvboxLight:
    case ApplicationTheme.LightHighContrast:
    case ApplicationTheme.RosePineDawn:
    case ApplicationTheme.EverforestLight:
    case ApplicationTheme.AyuLight:
      return 'light'
    case ApplicationTheme.Dark:
    case ApplicationTheme.HighContrast:
    case ApplicationTheme.SolarizedDark:
    case ApplicationTheme.Nord:
    case ApplicationTheme.Monokai:
    case ApplicationTheme.OneDark:
    case ApplicationTheme.Dracula:
    case ApplicationTheme.GruvboxDark:
    case ApplicationTheme.CatppuccinMocha:
    case ApplicationTheme.DarkDimmed:
    case ApplicationTheme.TokyoNight:
    case ApplicationTheme.Synthwave84:
    case ApplicationTheme.RosePine:
    case ApplicationTheme.EverforestDark:
    case ApplicationTheme.NightOwl:
    case ApplicationTheme.AyuDark:
    case ApplicationTheme.Kanagawa:
      return 'dark'
    default:
      return 'system'
  }
}

/**
 * Gets the CSS class name to apply to the body element for the given theme.
 * Custom themes have their own unique class names (e.g., 'theme-high-contrast'),
 * while built-in themes use 'theme-light' or 'theme-dark'.
 */
export function getThemeClassName(theme: ApplicationTheme): string {
  return `theme-${theme}`
}

// The key under which the decision to automatically switch the theme is persisted
// in localStorage.
const automaticallySwitchApplicationThemeKey = 'autoSwitchTheme'

/**
 * Function to preserve and convert legacy theme settings
 * should be removable after most users have upgraded to 2.7.0+
 */
function migrateAutomaticallySwitchSetting(): string | null {
  const automaticallySwitchApplicationTheme = getBoolean(
    automaticallySwitchApplicationThemeKey,
    false
  )

  localStorage.removeItem(automaticallySwitchApplicationThemeKey)

  if (automaticallySwitchApplicationTheme) {
    setPersistedTheme(ApplicationTheme.System)
    return 'system'
  }

  return null
}

// The key under which the currently selected theme is persisted
// in localStorage.
const applicationThemeKey = 'theme'

/**
 * Returns User's theme preference or 'system' if not set or parsable
 */
function getApplicationThemeSetting(): ApplicationTheme {
  const themeSetting = localStorage.getItem(applicationThemeKey)

  if (
    themeSetting === ApplicationTheme.Light ||
    themeSetting === ApplicationTheme.Dark ||
    themeSetting === ApplicationTheme.HighContrast ||
    themeSetting === ApplicationTheme.SolarizedLight ||
    themeSetting === ApplicationTheme.SolarizedDark ||
    themeSetting === ApplicationTheme.Nord ||
    themeSetting === ApplicationTheme.Monokai ||
    themeSetting === ApplicationTheme.OneDark ||
    themeSetting === ApplicationTheme.Dracula ||
    themeSetting === ApplicationTheme.GruvboxDark ||
    themeSetting === ApplicationTheme.GruvboxLight ||
    themeSetting === ApplicationTheme.CatppuccinMocha ||
    themeSetting === ApplicationTheme.LightHighContrast ||
    themeSetting === ApplicationTheme.DarkDimmed ||
    themeSetting === ApplicationTheme.TokyoNight ||
    themeSetting === ApplicationTheme.Synthwave84 ||
    themeSetting === ApplicationTheme.RosePine ||
    themeSetting === ApplicationTheme.RosePineDawn ||
    themeSetting === ApplicationTheme.EverforestDark ||
    themeSetting === ApplicationTheme.EverforestLight ||
    themeSetting === ApplicationTheme.NightOwl ||
    themeSetting === ApplicationTheme.AyuDark ||
    themeSetting === ApplicationTheme.AyuLight ||
    themeSetting === ApplicationTheme.Kanagawa
  ) {
    return themeSetting
  }

  return ApplicationTheme.System
}

/**
 * Load the name of the currently selected theme
 */
export async function getCurrentlyAppliedTheme(): Promise<ApplicableTheme> {
  return (await isDarkModeEnabled())
    ? ApplicationTheme.Dark
    : ApplicationTheme.Light
}

/**
 * Load the name of the currently selected theme
 */
export function getPersistedThemeName(): ApplicationTheme {
  if (migrateAutomaticallySwitchSetting() === 'system') {
    return ApplicationTheme.System
  }

  return getApplicationThemeSetting()
}

/**
 * Stores the given theme in the persistent store.
 */
export function setPersistedTheme(theme: ApplicationTheme): void {
  const themeName = getThemeName(theme)
  localStorage.setItem(applicationThemeKey, theme)
  setNativeThemeSource(themeName)
}

/**
 * Whether or not the current OS supports System Theme Changes
 */
export function supportsSystemThemeChanges(): boolean {
  if (__DARWIN__) {
    return isMacOSMojaveOrLater()
  } else if (__WIN32__) {
    // Its technically possible this would still work on prior versions of Windows 10 but 1809
    // was released October 2nd, 2018 and the feature can just be "attained" by upgrading
    // See https://github.com/desktop/desktop/issues/9015 for more
    return isWindows10And1809Preview17666OrLater()
  } else {
    // enabling this for Linux users as an experiment to see if distributions
    // work with how Chromium detects theme changes
    return true
  }
}

function isDarkModeEnabled(): Promise<boolean> {
  return shouldUseDarkColors()
}
