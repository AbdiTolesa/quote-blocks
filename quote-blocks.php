<?php
/**
 * Plugin Name:       Quote Blocks
 * Description:       A plugin that allows you create elegant Quote blocks at ease.
 * Requires at least: 6.5
 * Requires PHP:      7.0
 * Version:           1.0
 * Author:            Abdi Tolessa
 * Plugin URI:        https://github.com/AbdiTolesa/quote-blocks
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       wp-quote-blocks
 *
 * @package           quote-blocks
 */

if ( ! defined( 'ABSPATH' ) ) exit;

function qblks_create_block_wp_quote_blocks_block_init() {
	register_block_type( __DIR__ . '/build' );
}

add_action( 'init', 'qblks_create_block_wp_quote_blocks_block_init' );

/**
 * Generic CSS families that never need a web font.
 */
const QBLKS_GENERIC_FAMILIES = array( 'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui' );

/**
 * Returns the first family name of a CSS font-family list, without quotes.
 *
 * @param string $value CSS font-family value.
 * @return string Family name, or '' for empty and generic values.
 */
function qblks_get_first_family( $value ) {
	$parts = explode( ',', (string) $value );
	$name  = trim( $parts[0], " \t\"'" );

	return in_array( strtolower( $name ), QBLKS_GENERIC_FAMILIES, true ) ? '' : $name;
}

/**
 * Returns the Google font a quote chose with the pre-1.0 font picker.
 *
 * Since 1.0 fonts come from core's Font Library via the fontFamily block
 * support, stored as a preset slug. Two older shapes still exist in content:
 * - not yet re-saved: the block's old `fontFamily` attribute holds a family
 *   name such as "Dancing Script" (slugs are lowercase-kebab, names are not);
 * - migrated by the block deprecation: a custom `style.typography.fontFamily`
 *   value such as `"Dancing Script", sans-serif`.
 *
 * Mirrors getLegacyFontName() in src/legacy-font.js.
 *
 * @param array $attrs Block attributes.
 * @return string Font family name, or '' when the quote uses a preset or no font.
 */
function qblks_get_legacy_font_name( array $attrs ) {
	if ( ! empty( $attrs['fontFamily'] ) && ! preg_match( '/^[a-z0-9-]+$/', $attrs['fontFamily'] ) ) {
		return qblks_get_first_family( $attrs['fontFamily'] );
	}

	$custom = $attrs['style']['typography']['fontFamily'] ?? '';
	if ( $custom && 0 !== strpos( $custom, 'var:' ) ) {
		return qblks_get_first_family( $custom );
	}

	return '';
}

/**
 * Whether the site already provides a font family through theme.json or the
 * Font Library, in which case core prints its @font-face rules.
 *
 * @param string $name Font family name.
 * @return bool
 */
function qblks_is_font_installed( $name ) {
	static $installed = null;

	if ( null === $installed ) {
		$installed = array();
		$origins   = (array) wp_get_global_settings( array( 'typography', 'fontFamilies' ) );
		foreach ( $origins as $families ) {
			foreach ( (array) $families as $family ) {
				$installed[] = strtolower( $family['name'] ?? '' );
				$installed[] = strtolower( qblks_get_first_family( $family['fontFamily'] ?? '' ) );
			}
		}
	}

	return in_array( strtolower( $name ), $installed, true );
}

/**
 * Keeps fonts picked before 1.0 working: enqueues the Google Fonts
 * stylesheet for a quote whose font is not installed in the Font Library.
 * Quotes that use Font Library fonts never contact Google.
 *
 * @param string $block_content Rendered block HTML.
 * @param array  $block         Parsed block.
 * @return string Unchanged block HTML.
 */
function qblks_enqueue_legacy_google_font( $block_content, $block ) {
	$attrs = $block['attrs'] ?? array();
	$name  = qblks_get_legacy_font_name( $attrs );

	// Google family names only contain letters, digits and spaces.
	if ( ! $name || ! preg_match( '/^[A-Za-z0-9 ]+$/', $name ) || qblks_is_font_installed( $name ) ) {
		return $block_content;
	}

	$weight = $attrs['style']['typography']['fontWeight'] ?? ( $attrs['fontWeight'] ?? '' );
	$url    = 'https://fonts.googleapis.com/css?family=' . str_replace( ' ', '+', $name );
	if ( ctype_digit( (string) $weight ) ) {
		$url .= ':' . $weight;
	}
	$url .= '&display=swap';

	wp_enqueue_style( 'wpqb-font-' . sanitize_title( $name . '-' . $weight ), $url, array(), null );

	return $block_content;
}
add_filter( 'render_block_create-block/wp-quote-blocks', 'qblks_enqueue_legacy_google_font', 10, 2 );
