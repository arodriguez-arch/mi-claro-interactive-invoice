``# Responsive Customization Guide

This document explains how to customize the responsive behavior of the `mi-claro-interactive-invoice` component when integrating it into your web application.

## CSS Custom Properties for Responsive Behavior

The component exposes CSS custom properties (CSS variables) that allow you to customize the maximum width of expanded detail sections on small screens. By default, these are set to `100%` to work well in isolation, but you can override them in your host application.

### Available CSS Variables

| Variable | Default | Description | Recommended Value |
|----------|---------|-------------|-------------------|
| `--detail-inner-max-width-375` | `100%` | Maximum width of detail sections on screens ≤375px | `311px` |
| `--detail-inner-max-width-320` | `100%` | Maximum width of detail sections on screens ≤319px | `280px` |
| `--subscriber-detail-max-width-375` | `100%` | Maximum width of subscriber detail sections on screens ≤375px | `311px` |
| `--subscriber-detail-max-width-320` | `100%` | Maximum width of subscriber detail sections on screens ≤319px | `280px` |

## How to Override in Your Application

### Method 1: Global CSS Override

In your application's global CSS file, add:

```css
mi-claro-interactive-invoice {
  --detail-inner-max-width-375: 311px;
  --detail-inner-max-width-320: 280px;
  --subscriber-detail-max-width-375: 311px;
  --subscriber-detail-max-width-320: 280px;
}
```

### Method 2: Inline Style Override

When using the component in your HTML:

```html
<mi-claro-interactive-invoice
  style="
    --detail-inner-max-width-375: 311px;
    --detail-inner-max-width-320: 280px;
    --subscriber-detail-max-width-375: 311px;
    --subscriber-detail-max-width-320: 280px;
  "
></mi-claro-interactive-invoice>
```

### Method 3: CSS-in-JS Override (React, Vue, Angular)

#### React Example
```jsx
<mi-claro-interactive-invoice
  style={{
    '--detail-inner-max-width-375': '311px',
    '--detail-inner-max-width-320': '280px',
    '--subscriber-detail-max-width-375': '311px',
    '--subscriber-detail-max-width-320': '280px'
  }}
/>
```

#### Vue Example
```vue
<mi-claro-interactive-invoice
  :style="{
    '--detail-inner-max-width-375': '311px',
    '--detail-inner-max-width-320': '280px',
    '--subscriber-detail-max-width-375': '311px',
    '--subscriber-detail-max-width-320': '280px'
  }"
/>
```

#### Angular Example
```html
<mi-claro-interactive-invoice
  [style.--detail-inner-max-width-375]="'311px'"
  [style.--detail-inner-max-width-320]="'280px'"
  [style.--subscriber-detail-max-width-375]="'311px'"
  [style.--subscriber-detail-max-width-320]="'280px'"
></mi-claro-interactive-invoice>
```

## Width Calculation Rationale

### At 375px Viewport
- **Viewport width**: 375px
- **Card padding**: 32px (1rem each side)
- **Detail-inner padding**: 32px (1rem each side)
- **Available space**: 375 - 32 - 32 = 311px
- **Recommended max-width**: `311px`

### At 320px Viewport
- **Viewport width**: 320px
- **Card padding**: 24px (0.75rem each side)
- **Detail-inner padding**: 24px (0.75rem each side)
- **Available space**: 320 - 24 - 24 = 272px
- **Recommended max-width**: `280px`

## When to Use Custom Values

### Use Default (`100%`) When:
- Component is used in isolation/standalone pages
- Your application layout adds additional padding/margins
- You want the component to be fully flexible

### Use Recommended Values (`311px`/`280px`) When:
- Component is integrated into a complex layout
- You need precise width control to match your design system
- You're experiencing horizontal overflow issues on small screens

## Testing

After applying custom values, test the component at these viewport widths:
- 320px (minimum supported)
- 360px (common small phones)
- 375px (iPhone SE, small iPhones)
- 390px (standard modern phones)

## Support

For issues or questions about responsive customization, please refer to the main README or open an issue in the repository.
