# Quote Blocks for the WordPress Block Editor

A custom Gutenberg block for designing quotes: pick one of five layouts, then adjust typography, colours, spacing, icons and shadows from the block sidebar. An optional **Copy quote** button, built with the **Interactivity API**, lets readers copy the quote and its citation in one click.

![Five quote layouts rendered on the frontend](assets/screenshot-10.png)

## Features

- **Five layout variations**: Default, Top centred, Centered, Closed and Block quotation. They're registered as block variations and chosen from a variation picker when the block is inserted.
- **20+ design controls**: box shadow, border radius, margin and padding (`BoxControl`), icon size, colour, shadow and spacing, top and bottom bars, and colour panels for the quote, citation and background.
- **Typography**: font size presets (`FontSizePicker`), letter spacing, font weight, and any system font or **Google Font**. The Google Fonts list loads in the editor through the Google Fonts API, and the selected font is enqueued on the frontend only for posts that use it.
- **Custom quote icons**: swap the quotation mark for one of several SVG icons.
- **Copy to clipboard** (new in 0.2.0): an optional button whose frontend behaviour is a 600-byte script module, loaded only on pages where the block uses it.

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
├── style.scss      # Frontend and editor styles
└── editor.scss     # Editor-only styles
quote-blocks.php    # Registers the block from build/, enqueues Google Fonts, settings page
```

A few implementation details:

- **Metadata-driven registration.** Everything is declared in `block.json` (`apiVersion: 3`), and PHP registers it with one call: `register_block_type( __DIR__ . '/build' )`.
- **Variation-first editing.** When the `class` attribute is empty, `Edit` renders a `BlockVariationPicker` instead of the block, so every quote starts from a designed layout. A toolbar button takes you back to the picker.
- **Interactivity API without breaking existing content.** The copy button's directives (`data-wp-interactive`, `data-wp-context`, `data-wp-on--click`, `data-wp-text`, `data-wp-class--is-copied`) are only added to the saved markup when `showCopyButton` is on. Blocks saved before the feature existed produce byte-identical markup, so they validate without a `deprecated` entry. The store in `view.js` uses a generator action so context stays correct across the async clipboard call. Labels are translated in `save` and passed through context.
- **Conditional asset loading.** Google Font stylesheets are enqueued per block, from the parsed post content. The view script is a `viewScriptModule`, so WordPress only prints it when the block is on the page.

## Requirements

- WordPress 6.5+ (for `viewScriptModule` and the Interactivity API)
- PHP 7.0+
- Optional: a Google Fonts API key (**Quote Blocks settings** in wp-admin) to browse Google Fonts in the editor

## Development

```bash
git clone https://github.com/AbdiTolesa/wp-quote-blocks.git
cd wp-quote-blocks
npm install
npm start          # watch mode
npm run build      # production build into build/
npm run plugin-zip # installable zip
```

The build uses [`@wordpress/scripts`](https://www.npmjs.com/package/@wordpress/scripts) with `--experimental-modules`, which outputs `view.js` as an ES module.

To try it, put the folder in `wp-content/plugins/`, activate **Quote Blocks**, and add the **Quote Blocks** block in the editor.

## License

GPL-2.0-or-later
