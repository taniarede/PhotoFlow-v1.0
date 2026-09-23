# PhotoFlow metadata

AI tags and themes are written into the processed JPEG itself.

- `XMP-dc:Subject`: one keyword per value
- `IPTC:Keywords`: one keyword per value
- `EXIF:XPKeywords`: semicolon-separated compatibility field
- `XMP-dc:Description`: AI description
- `IPTC:Caption-Abstract`: AI description
- `EXIF:ImageDescription`: AI description
- `EXIF:XPComment`: AI description

After writing, PhotoFlow reads the JPEG back with ExifTool and verifies that every keyword was persisted. A failed verification aborts that image's processing instead of silently reporting success.


# PhotoFlow accessibility

PhotoFlow is implemented toward **WCAG 2.2 Level AA**. This document records the accessibility improvements included in the current frontend. It is not a formal conformance claim.

## Implemented

- Semantic page language (`lang="en"`) and heading hierarchy.
- Keyboard-visible focus indicators with a high-contrast outline.
- Skip link to the main workflow.
- Keyboard-operable buttons, selects, radios, sliders and file input.
- Accessible names for preview thumbnail buttons and slider controls.
- Semantic ordered-list structure for the progress Stepper and `aria-current="step"` for the active step.
- Stepper status is exposed to assistive technology instead of relying only on colour, icons or `title` attributes.
- AI and processing status messages use live regions.
- `aria-busy` is exposed while AI analysis is running.
- Interactive targets use at least a 44px visual target for primary controls; smaller controls are placed inside larger labelled targets.
- Light/dark themes use text/background combinations selected for WCAG AA contrast for normal button text.
- Reduced-motion support disables non-essential animation and parallax.
- Decorative background graphics and decorative icons are hidden from assistive technology.
- Sticky Stepper is accounted for with `scroll-padding-top` so keyboard-focused content is less likely to be hidden underneath it.

## Manual verification still required

Before claiming formal WCAG 2.2 AA conformance, test the running application with:

1. Keyboard only: Tab, Shift+Tab, Enter, Space and arrow keys for radios/selects.
2. At 200% and 400% browser zoom, including reflow on narrow screens.
3. A screen reader such as VoiceOver, NVDA or Narrator.
4. Automated tools such as axe DevTools or Lighthouse.
5. Contrast checks for every state, including focus, disabled, error and selected states.
6. Large-file and slow-network scenarios, ensuring status information remains understandable.

