/**
 * Block deprecations.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-deprecation/
 */
import metadata from '../block.json';
import saveV1 from './save-v1';
import { getFirstFamily } from '../legacy-font';

/**
 * v1 (before 0.3.0): the block stored a Google Fonts family name and weight in
 * its own `fontFamily`/`fontWeight` attributes and printed them as inline
 * styles. Those attribute names now belong to core's typography supports
 * (`fontFamily` holds a Font Library preset slug), so values move to
 * `style.typography`, the same place core keeps custom typography values.
 */
const v1 = {
	attributes: {
		...metadata.attributes,
		fontFamily: {
			type: 'string',
			default: '',
		},
		fontWeight: {
			type: 'string',
			default: 'normal',
		},
	},
	supports: {
		html: false,
		align: [ 'wide', 'full' ],
		typography: {
			lineHeight: true,
		},
		interactivity: true,
	},
	save: saveV1,
	migrate( { fontFamily, fontWeight, ...attributes } ) {
		const typography = { ...attributes.style?.typography };
		const family = getFirstFamily( fontFamily );

		if ( family ) {
			typography.fontFamily = `"${ family }", sans-serif`;
		}
		if ( fontWeight && fontWeight !== 'normal' ) {
			typography.fontWeight = String( fontWeight );
		}

		if ( ! Object.keys( typography ).length ) {
			return attributes;
		}

		return {
			...attributes,
			style: { ...attributes.style, typography },
		};
	},
};

export default [ v1 ];
