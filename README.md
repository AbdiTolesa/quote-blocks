# Quote Blocks for the WordPress Block Editor

A custom Gutenberg block for designing quotes: pick one of five layouts, then adjust typography, colours, spacing, icons and shadows from the block sidebar. An optional **Copy quote** button, built with the **Interactivity API**, lets readers copy the quote and its citation in one click.

![Five quote layouts rendered on the frontend](assets/screenshot-10.png)

## Features

- **Five layout variations**: Default, Top centred, Centered, Closed and Block quotation. They're registered as block variations and chosen from a variation picker when the block is inserted.
- **20+ design controls**: box shadow, border radius, margin and padding (`BoxControl`), icon size, colour, shadow and spacing, top and bottom bars, and colour panels for the quote, citation and background.
- **Typography**: font size presets (`FontSizePicker`), letter spacing, and the core **font family** and **font weight** controls. Any font in the theme or the WordPress **Font Library** works, including Google Fonts, which the Font Library copies to and serves from your own site.
- **Custom quote icons**: swap the quotation mark for one of several SVG icons.
- **Copy to clipboard** (new in 1.0): an optional button whose frontend behaviour is a script module under 1 KB, loaded only on pages where the block uses it.

| Editor sidebar | Variation |
| --- | --- |
| ![Block sidebar settings](assets/screenshot-7.png) | ![Top centred variation](assets/screenshot-2.png) |

## How it's built

```
src/
├── block.json      # Block metadata: attributes, supports, assets (apiVersion 3)
├── index.js        # registerBlockType() with edit, save and variations
├── edit.js         # Editor UI: variation picker, InspectorControls, BlockControls, RichText
├── save.js         # Static markup saved to post content
├── view.js         # Frontend Interactivity API store (copy button)
├── variations.js   # The five layout variations
├── deprecated/     # v1 save + migration of pre-1.0 font attributes
├── legacy-font.js  # Helpers for fonts picked with the old Google Fonts picker
├── style.scss      # Frontend and editor styles
└── editor.scss     # Editor-only styles
quote-blocks.php    # Registers the block from build/, loads fonts for pre-1.0 quotes
```

A few implementation details:

- **Metadata-driven registration.** Everything is declared in `block.json` (`apiVersion: 3`), and PHP registers it with one call: `register_block_type( __DIR__ . '/build' )`.
- **Variation-first editing.** When the `class` attribute is empty, `Edit` renders a `BlockVariationPicker` instead of the block, so every quote starts from a designed layout. A toolbar button takes you back to the picker.
- **Interactivity API without breaking existing content.** The copy button's directives (`data-wp-interactive`, `data-wp-context`, `data-wp-on--click`, `data-wp-text`, `data-wp-class--is-copied`) are only added to the saved markup when `showCopyButton` is on. Blocks saved before the feature existed produce byte-identical markup, so they validate without a `deprecated` entry. The store in `view.js` uses a generator action so context stays correct across the async clipboard call. On non-HTTPS sites, where browsers don't provide `navigator.clipboard`, it falls back to a temporary textarea with `execCommand( 'copy' )`. Labels are translated in `save` and passed through context.
- **Fonts from core's Font Library.** The block declares `typography.__experimentalFontFamily` and `__experimentalFontWeight`, so the font picker lists theme.json and Font Library fonts, and core prints their `@font-face` rules. Font weight uses `__experimentalSkipSerialization: [ "fontWeight" ]` so it applies to the quote text only, not to the citation.
- **Migrating existing content.** Before 1.0 the block had its own `fontFamily` and `fontWeight` attributes holding Google font names. Those names now belong to core's supports, where `fontFamily` holds a preset slug. A `deprecated` entry keeps the old save output and moves the old values to `style.typography`. Quotes whose font isn't installed in the Font Library still load it from Google, and the editor shows a notice explaining how to switch.
- **Conditional asset loading.** The view script is a `viewScriptModule`, so WordPress only prints it when the block is on the page.

## Requirements

- WordPress 6.5+ (for `viewScriptModule` and the Interactivity API)
- PHP 7.0+
- Fonts: theme fonts, or fonts installed from **Appearance → Fonts** (WordPress 7.0+) or **Styles → Typography** in the Site Editor (block themes, 6.5+)

## Development

```bash
git clone https://github.com/AbdiTolesa/quote-blocks.git
cd quote-blocks
npm install
npm start          # watch mode
npm run build      # production build into build/
npm run plugin-zip # installable zip
```

The build uses [`@wordpress/scripts`](https://www.npmjs.com/package/@wordpress/scripts) with `--experimental-modules`, which outputs `view.js` as an ES module.

To try it, put the folder in `wp-content/plugins/`, activate **Quote Blocks**, and add the **Quote Blocks** block in the editor.

## License

GPL-2.0-or-later
