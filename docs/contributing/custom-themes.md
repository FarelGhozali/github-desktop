# Custom Themes

GitHub Desktop supports multiple built-in themes. This document explains how the theme system works and how to add new custom themes.

## Available Themes

| Theme | Base | Description |
|-------|------|-------------|
| Light | light | Default light theme using GitHub's Primer color system |
| Dark | dark | Dark theme using GitHub's Primer color system |
| System | auto | Follows the operating system's light/dark preference |
| High Contrast | dark | Maximum contrast for accessibility (WCAG AAA) |
| Solarized Light | light | Ethan Schoonover's Solarized palette, light variant |
| Solarized Dark | dark | Ethan Schoonover's Solarized palette, dark variant |
| Nord | dark | Arctic Ice Studio's Nord color palette, cool blue-toned |
| Monokai | dark | Classic Monokai color scheme by Wimer Hazenberg |
| One Dark | dark | Atom's iconic One Dark color scheme |
| Dracula | dark | Zeno Rocha's popular Dracula color theme |
| Gruvbox Dark | dark | Retro warm dark theme by Pavel Pertsev |
| Gruvbox Light | light | Retro warm light theme by Pavel Pertsev |
| Catppuccin Mocha | dark | Modern pastel dark theme, very popular |
| Light High Contrast | light | GitHub's built-in Light High Contrast |
| Dark Dimmed | dark | GitHub's built-in Dark Dimmed (softer dark) |

## Architecture

The theme system consists of the following components:

### 1. Theme Enum (`app/src/ui/lib/application-theme.ts`)

The `ApplicationTheme` enum defines all available themes. Each theme has a string value that serves as both the localStorage key and the CSS class suffix.

```typescript
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
}
```

### 2. CSS Variable Overrides (`app/styles/themes/`)

Each custom theme is a SCSS file that overrides CSS custom properties (variables) defined in `_variables.scss`. Themes are scoped using a `body.theme-{name}` selector.

```
app/styles/
├── _variables.scss          # Default (light) theme variables on :root
└── themes/
    ├── _dark.scss            # body.theme-dark overrides
    ├── _high-contrast.scss   # body.theme-high-contrast overrides
    ├── _solarized-light.scss # body.theme-solarized-light overrides
    ├── _solarized-dark.scss  # body.theme-solarized-dark overrides
    ├── _nord.scss            # body.theme-nord overrides
    ├── _monokai.scss         # body.theme-monokai overrides
    ├── _one-dark.scss        # body.theme-one-dark overrides
    ├── _dracula.scss         # body.theme-dracula overrides
    ├── _gruvbox-dark.scss    # body.theme-gruvbox-dark overrides
    ├── _gruvbox-light.scss   # body.theme-gruvbox-light overrides
    ├── _catppuccin-mocha.scss# body.theme-catppuccin-mocha overrides
    ├── _light-high-contrast.scss # body.theme-light-high-contrast overrides
    └── _dark-dimmed.scss     # body.theme-dark-dimmed overrides
```

### 3. Theme Application (`app/src/ui/app-theme.tsx`)

The `AppTheme` component adds the appropriate CSS class to `<body>` when the theme changes. It also sets the `color-scheme` CSS property for proper native element rendering.

### 4. Electron Native Theme (`app/src/ui/lib/theme-source.ts`)

Custom themes map to either `'light'` or `'dark'` for Electron's `nativeTheme.themeSource`, which controls OS-level UI elements like title bars and scrollbars.

### 5. Preferences UI (`app/src/ui/preferences/appearance.tsx`)

The theme selector in Preferences > Appearance renders all themes as radio buttons with preview swatches.

## Adding a New Theme

### Step 1: Add the enum value

In `app/src/ui/lib/application-theme.ts`, add a new entry to `ApplicationTheme`:

```typescript
export enum ApplicationTheme {
  // ...existing themes...
  MyTheme = 'my-theme',
}
```

### Step 2: Update type and functions

In the same file:

1. Add your theme to the `ApplicableTheme` type union
2. Update `getThemeName()` to map your theme to its base (`'light'` or `'dark'`)
3. Add your theme value to the condition in `getApplicationThemeSetting()`

### Step 3: Update the AppTheme component

In `app/src/ui/app-theme.tsx`, if your theme is dark-based, add its class name to the `updateColorScheme()` check:

```typescript
const isDarkTheme =
  body.classList.contains('theme-dark') ||
  body.classList.contains('theme-high-contrast') ||
  body.classList.contains('theme-solarized-dark') ||
  body.classList.contains('theme-my-theme')  // Add this
```

### Step 4: Create the SCSS file

Create `app/styles/themes/_my-theme.scss`. Use `_dark.scss` or `_variables.scss` as a reference to ensure you override **all** CSS custom properties.

```scss
@import '~primer-support/lib/variables/color-system.scss';

body.theme-my-theme {
  --text-color: #...;
  --background-color: #...;
  // ... all other variables
}
```

### Step 5: Import the theme

Add the import to `app/styles/desktop.scss`:

```scss
@import 'themes/my-theme';
```

### Step 6: Add the UI swatch

In `app/src/ui/preferences/appearance.tsx`:

1. Add a case to `renderThemeSwatch()` for your theme
2. Add your theme to the `themes` array in `renderSelectedTheme()`

### Step 7: Test

- Verify the theme applies correctly by selecting it in Preferences > Appearance
- Check all major views: repository list, changes, history, diff, dialogs
- Verify proper contrast ratios for text readability
- Test that the native title bar matches (light or dark base)

## CSS Variables Reference

The complete list of CSS custom properties is defined in `app/styles/_variables.scss`. Key variable groups include:

- **Colors**: `--text-color`, `--background-color`, `--button-*`
- **Box/List**: `--box-*`, `--list-item-*`
- **Toolbar**: `--toolbar-*`, `--app-menu-*`
- **Diff**: `--diff-*`, `--syntax-*`
- **Dialog/Form**: `--dialog-*`, `--form-error-*`, `--error-*`
- **Markdown**: `--md-*`
- **Status**: `--status-*`, `--pr-*`
