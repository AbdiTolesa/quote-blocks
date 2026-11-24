/**
 * Helpers for fonts chosen with the pre-1.0 Google Fonts picker.
 *
 * Since 1.0 fonts come from core's Font Library through the `fontFamily`
 * block support (a preset slug). Older quotes are migrated to a custom
 * `style.typography.fontFamily` value such as `"Dancing Script", sans-serif`,
 * which these helpers recognise. Mirrors qblks_get_legacy_font_name() in PHP.
 */

const GENERIC_FAMILIES = [
	'serif',
	'sans-serif',
	'monospace',
	'cursive',
	'fantasy',
	'system-ui',
];

/**
 * Returns the first family name of a CSS font-family list, without quotes.
 *
 * @param {string} value CSS font-family value.
 * @return {string} Family name, or '' for empty and generic values.
 */
export const getFirstFamily = ( value = '' ) => {
	const name = value
		.split( ',' )[ 0 ]
		.trim()
		.replace( /^["']|["']$/g, '' );

	return GENERIC_FAMILIES.includes( name.toLowerCase() ) ? '' : name;
};

/**
 * Returns the legacy font name of a migrated quote.
 *
 * @param {Object} attributes Block attributes.
 * @return {string} Font name, or '' when the quote uses a preset or no font.
 */
export const getLegacyFontName = ( attributes ) => {
	const value = attributes.style?.typography?.fontFamily;

	if ( ! value || value.startsWith( 'var:' ) ) {
		return '';
	}

	return getFirstFamily( value );
};

/**
 * Builds the Google Fonts stylesheet URL used before 1.0.
 *
 * @param {string}        name   Font family name.
 * @param {string|number} weight Optional font weight.
 * @return {string} Stylesheet URL.
 */
export const getGoogleFontUrl = ( name, weight ) => {
	const family = encodeURIComponent( name ).replace( /%20/g, '+' );
	const variant = /^\d+$/.test( String( weight ?? '' ) )
		? `:${ weight }`
		: '';

	return `https://fonts.googleapis.com/css?family=${ family }${ variant }&display=swap`;
};
