import { __, sprintf } from '@wordpress/i18n';
import { getBlockVariations } from '@wordpress/blocks';

import {
	useBlockProps,
	__experimentalBlockVariationPicker as BlockVariationPicker,
	AlignmentToolbar,
	RichText,
	BlockControls,
	InspectorControls,
	useSettings,
	__experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
	__experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
} from '@wordpress/block-editor';

import './editor.scss';

import {
	PanelBody,
	RangeControl,
	Button,
	ButtonGroup,
	ToggleControl,
	Notice,
	Toolbar,
	FontSizePicker,
	__experimentalBoxControl as BoxControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';

import metadata from './block.json';
import {
	getFirstFamily,
	getGoogleFontUrl,
	getLegacyFontName,
} from './legacy-font';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @param  props
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit( props ) {
	const { attributes } = props;

	const isVariationSelected = attributes.class !== '';
	const Component = isVariationSelected ? EditContainer : Placeholder;

	return <Component { ...props } />;
}

function Placeholder( { clientId, setAttributes } ) {
	const blockProps = useBlockProps();

	const variations = getBlockVariations( 'create-block/wp-quote-blocks' );
	const defaultVariation = variations[ 0 ];

	return (
		<div { ...blockProps }>
			<BlockVariationPicker
				label="Choose variation"
				instructions={ __( 'Select a variation to start with.' ) }
				variations={ variations }
				allowSkip={ true }
				onSelect={ ( variation = defaultVariation ) => {
					if ( variation.attributes ) {
						setAttributes( variation.attributes );
					}
				} }
			/>
		</div>
	);
}

/**
 * Whether a font family is available from theme.json or the Font Library.
 *
 * @param {Object|Array} fontFamilies Value of the `typography.fontFamilies` setting.
 * @param {string}       name         Font family name.
 * @return {boolean} True when the site already provides the font.
 */
const isFontInstalled = ( fontFamilies, name ) => {
	const families = Array.isArray( fontFamilies )
		? fontFamilies
		: Object.values( fontFamilies ?? {} ).flat();
	const needle = name.toLowerCase();

	return families.some(
		( family ) =>
			family?.name?.toLowerCase() === needle ||
			getFirstFamily( family?.fontFamily ).toLowerCase() === needle
	);
};

/**
 * Default value of a block attribute, from block.json.
 *
 * @param {string} name Attribute name.
 * @return {string|number|boolean|Object} Default value.
 */
const getDefault = ( name ) => metadata.attributes[ name ]?.default;

/**
 * Whether an attribute differs from its block.json default. Scalars compare
 * as strings because some defaults are numeric strings (e.g. "16").
 *
 * @param {Object} attributes Block attributes.
 * @param {string} name       Attribute name.
 * @return {boolean} True when the user changed the value.
 */
const isChanged = ( attributes, name ) => {
	const value = attributes[ name ];
	const fallback = getDefault( name );

	if ( fallback && typeof fallback === 'object' ) {
		return JSON.stringify( value ) !== JSON.stringify( fallback );
	}

	return String( value ?? '' ) !== String( fallback ?? '' );
};

/**
 * Builds a reset-all filter that restores attributes to their defaults.
 *
 * @param {...string} names Attribute names.
 * @return {() => Object} Filter for ToolsPanelItem's resetAllFilter.
 */
const resetTo =
	( ...names ) =>
	() =>
		Object.fromEntries(
			names.map( ( name ) => [ name, getDefault( name ) ] )
		);

function EditContainer( props ) {
	const { attributes, setAttributes, clientId } = props;
	const colorGradientSettings = useMultipleOriginColorsAndGradients();
	const [ fontFamilies ] = useSettings( 'typography.fontFamilies' );
	const legacyFont = getLegacyFontName( attributes );
	const loadLegacyFont =
		!! legacyFont && ! isFontInstalled( fontFamilies, legacyFont );
	const onChangeIconSize = ( size ) => {
		setAttributes( { iconSize: size + 'px' } );
	};

	const onChangeAlignment = ( newAlignment ) => {
		setAttributes( {
			alignment: newAlignment === undefined ? 'none' : newAlignment,
		} );
	};

	const onChangeQuoteFontSize = ( val ) => {
		setAttributes( { quoteFontSize: val } );
	};

	const onChangeCitationFontSize = ( val ) => {
		setAttributes( { citationFontSize: val } );
	};

	const onChangeBoxShadow = ( newShadow ) => {
		setAttributes( { boxShadow: parseInt( newShadow ) } );
	};

	const iconStyles = {
		width: attributes.iconSize,
		height: attributes.iconSize,
		fill: attributes.iconColor,
	};

	// Rendered in the Styles tab's Color panel. Icon and lines colors only
	// show when those elements are visible.
	const colorSettings = [
		{
			name: 'backgroundColor',
			label: __( 'Background', 'wp-quote-blocks' ),
		},
		{
			name: 'quoteFontColor',
			label: __( 'Quote text', 'wp-quote-blocks' ),
		},
		{
			name: 'citationFontColor',
			label: __( 'Citation text', 'wp-quote-blocks' ),
		},
		attributes.showIcon && {
			name: 'iconColor',
			label: __( 'Icon', 'wp-quote-blocks' ),
		},
		attributes.showLines && {
			name: 'linesColor',
			label: __( 'Lines', 'wp-quote-blocks' ),
		},
	].filter( Boolean );

	const icons = [
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M10.3 24.8V26H20v16.9H0V26.2C0 13.4 6.6 7.1 19.9 7.1v7.1c-3.4.5-5.9 1.6-7.4 3.3-1.5 1.7-2.2 4.1-2.2 7.3zm30 0V26H50v16.9H30.1V26.2c0-12.7 6.6-19.1 19.9-19.1v7.1c-6.4.7-9.7 4.3-9.7 10.6z"></path></svg>',
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M12.5 9.2H19c1.1 0 1.8.2 2.3.7.5.5.7 1.2.7 2.3v3.4c0 1.1-.2 1.8-.7 2.3-.5.5-1.2.7-2.3.7h-5.8c-.7 0-1.3.2-1.7.6-.4.4-.6 1-.6 1.7v1.3H20c1.1 0 1.8.2 2.3.7.5.5.7 1.2.7 2.3v12.5c0 1.1-.2 1.8-.7 2.3-.5.5-1.2.7-2.3.7H3c-1.1 0-1.8-.2-2.3-.7-.5-.4-.7-1.2-.7-2.2V21.9c0-4.3 1.1-7.4 3.4-9.6 2.3-2 5.3-3.1 9.1-3.1zm26.9 0h6.5c1.1 0 1.8.2 2.3.7.5.5.7 1.2.7 2.3v3.4c0 1.1-.2 1.8-.7 2.3-.5.5-1.2.7-2.3.7h-5.8c-.7 0-1.3.2-1.7.6-.4.4-.6 1-.6 1.7v1.3H47c1.1 0 1.8.2 2.3.7.5.5.7 1.2.7 2.3v12.5c0 1.1-.2 1.8-.7 2.3-.5.5-1.2.7-2.3.7H30c-1.1 0-1.8-.2-2.3-.7-.5-.5-.7-1.2-.7-2.3V21.9c0-4.3 1.1-7.4 3.4-9.6 2.2-2 5.2-3.1 9-3.1z"></path></svg>',
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M20.8 44.5H0V23.7L9.3 5.5h7.3L12 23.7h8.8v20.8zm29.2 0H29.2V23.7l9.3-18.1h7.3l-4.6 18.1H50v20.8z"></path></svg>',
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M19.8 9.3C10.5 11.8 4.6 17 2.1 24.8c2.3-3.6 5.6-5.4 9.9-5.4 3.3 0 6 1.1 8.3 3.3 2.2 2.2 3.4 5 3.4 8.3 0 3.2-1.1 5.8-3.3 8-2.2 2.2-5.1 3.2-8.7 3.2-3.7 0-6.5-1.2-8.6-3.5C1 36.3 0 33.1 0 29 0 18.3 6.5 11.2 19.6 7.9l.2 1.4zm26.4 0C36.9 11.9 31 17 28.5 24.8c2.2-3.6 5.5-5.4 9.8-5.4 3.2 0 6 1.1 8.3 3.2 2.3 2.2 3.4 4.9 3.4 8.3 0 3.1-1.1 5.8-3.3 7.9-2.2 2.2-5.1 3.3-8.6 3.3-3.7 0-6.6-1.1-8.6-3.4-2.1-2.3-3.1-5.5-3.1-9.7 0-10.7 6.6-17.8 19.7-21.1l.1 1.4z"></path></svg>',
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M12.5 9.2H19c1.1 0 1.8.2 2.3.7.5.5.7 1.2.7 2.3v3.4c0 1.1-.2 1.8-.7 2.3-.5.5-1.2.7-2.3.7h-5.8c-.7 0-1.3.2-1.7.6-.4.4-.6 1-.6 1.7v1.3H20c1.1 0 1.8.2 2.3.7.5.5.7 1.2.7 2.3v12.5c0 1.1-.2 1.8-.7 2.3-.5.5-1.2.7-2.3.7H3c-1.1 0-1.8-.2-2.3-.7-.5-.4-.7-1.2-.7-2.2V21.9c0-4.3 1.1-7.4 3.4-9.6 2.3-2 5.3-3.1 9.1-3.1zm26.9 0h6.5c1.1 0 1.8.2 2.3.7.5.5.7 1.2.7 2.3v3.4c0 1.1-.2 1.8-.7 2.3-.5.5-1.2.7-2.3.7h-5.8c-.7 0-1.3.2-1.7.6-.4.4-.6 1-.6 1.7v1.3H47c1.1 0 1.8.2 2.3.7.5.5.7 1.2.7 2.3v12.5c0 1.1-.2 1.8-.7 2.3-.5.5-1.2.7-2.3.7H30c-1.1 0-1.8-.2-2.3-.7-.5-.5-.7-1.2-.7-2.3V21.9c0-4.3 1.1-7.4 3.4-9.6 2.2-2 5.2-3.1 9-3.1z"></path></svg>',
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M9.4 14.6c-2.4 2.9-3.6 5.9-3.6 8.9 0 1.3.2 2.4.5 3.3 1.8-1.4 3.8-2.1 6-2.1 2.9 0 5.3.9 7.3 2.7 2 1.8 3 4.2 3 7.3 0 1.9-.5 3.6-1.4 5.1-.9 1.5-2.2 2.7-3.8 3.6s-3.3 1.3-5.1 1.3c-4.1 0-7.3-1.6-9.5-4.9C.9 36.9 0 33.5 0 29.4c0-5.2 1.4-9.9 4.1-14 2.8-4.1 6.9-7.5 12.5-10l1.5 2.8c-3.3 1.3-6.2 3.5-8.7 6.4zm27.5 0c-2.4 2.9-3.6 5.9-3.6 8.9 0 1.3.2 2.4.5 3.3 1.8-1.4 3.8-2.1 6-2.1 2.9 0 5.4.9 7.4 2.7 2 1.8 3 4.2 3 7.3 0 2.8-1 5.2-3 7.1-2 1.9-4.4 2.9-7.3 2.9-4.1 0-7.3-1.6-9.5-4.9-1.8-2.7-2.8-6.2-2.8-10.3 0-5.2 1.4-9.9 4.1-14 2.8-4.1 6.9-7.5 12.5-10l1.5 2.8c-3.5 1.2-6.4 3.4-8.8 6.3z"></path></svg>',
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M22.6 12.8c-1.9.5-3.7 1.2-5.3 2.1-1.6.9-3.1 1.9-4.3 3-1.2 1.1-2.2 2.4-2.9 3.7-.7 1.3-1.1 2.7-1.1 4 0 1.2.1 1.8.3 1.8.8 0 1.5-.3 2.4-.9.8-.6 1.9-.9 3.3-.9 2.1 0 3.9.8 5.4 2.4 1.5 1.6 2.3 3.7 2.3 6.2s-1 4.6-2.9 6.4c-1.9 1.8-4.3 2.6-7.3 2.6-1.8 0-3.4-.4-4.9-1.1-1.5-.8-2.8-1.8-3.9-3.1s-2-2.8-2.6-4.6C.3 32.5 0 30.6 0 28.6c0-3 .6-5.8 1.8-8.3 1.2-2.5 2.8-4.8 4.9-6.7 2-1.9 4.4-3.5 7.2-4.6 2.8-1.2 5.6-1.8 8.6-2v5.8zm27.4 0c-1.9.5-3.7 1.2-5.4 2.1-1.7.9-3.1 1.9-4.3 3-1.2 1.1-2.2 2.4-2.9 3.7-.7 1.3-1.1 2.7-1.1 4 0 1.2.1 1.8.4 1.8.8 0 1.5-.3 2.3-.9.8-.6 1.9-.9 3.3-.9 2 0 3.8.8 5.3 2.4 1.5 1.6 2.3 3.7 2.3 6.2s-1 4.6-2.9 6.4c-2 1.8-4.4 2.6-7.3 2.6-1.7 0-3.3-.4-4.8-1.1-1.5-.8-2.8-1.8-3.9-3.1s-2-2.8-2.7-4.6c-.7-1.8-1-3.7-1-5.7 0-3 .6-5.8 1.8-8.3 1.2-2.5 2.8-4.8 4.9-6.7 2-1.9 4.4-3.5 7.2-4.6 2.8-1.2 5.7-1.8 8.8-2v5.7z"></path></svg>',
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M14.7 45.9H0V31.3C0 17.6 8.6 6.6 21.6 4.1v4.7c-10 2.6-16.7 10.9-16.7 22.6h9.8v14.5zm28.1 0H28.4V31.3C28.4 17.6 37 6.6 50 4.1v4.7c-9.8 2.6-16.7 10.9-16.7 22.6h9.5v14.5z"></path></svg>',
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310.284 310.284"><path d="M155.142,0C69.597,0,0,69.597,0,155.142s69.597,155.142,155.142,155.142s155.142-69.597,155.142-155.142  S240.688,0,155.142,0z M79.171,231.401c-1.746,1.182-6.129,2.222-8.693-0.625l-4.731-5.95c-2.288-3.869,0.483-7.457,2.277-8.945  c8.529-7.075,14.731-12.548,18.601-16.419c7.589-7.981,13.199-15.97,16.903-23.935c0.847-1.821-1.315-2.977-2.438-3.345  c-27.967-9.166-41.955-25.325-41.955-48.474c0-13.639,4.53-24.722,13.585-33.242c9.059-8.525,20.407-12.785,34.041-12.785  c12.146,0,22.909,5.539,32.283,16.621c9.165,10.438,13.744,21.735,13.744,33.881C152.789,163.78,128.251,198.185,79.171,231.401z   M185.61,231.401c-1.746,1.182-6.129,2.222-8.693-0.625l-4.731-5.95c-2.288-3.869,0.483-7.457,2.277-8.945  c8.528-7.075,14.731-12.548,18.601-16.419c7.589-7.981,13.199-15.97,16.904-23.935c0.847-1.821-1.315-2.977-2.438-3.345  c-27.967-9.166-41.955-25.325-41.955-48.474c0-13.639,4.53-24.722,13.585-33.242c9.06-8.525,20.407-12.785,34.041-12.785  c12.146,0,22.909,5.539,32.283,16.621c9.164,10.438,13.744,21.735,13.744,33.881C259.228,163.78,234.69,198.185,185.61,231.401z"/></svg>',
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25.625 25.625"><path d="M12.812,0.435C5.736,0.435,0,5.499,0,11.747c0,3.168,1.479,6.028,3.855,8.082   c-0.521,3.01-3.883,4.23-3.652,5.059c2.84,1.175,8.529-1.412,9.918-2.083c0.869,0.164,1.768,0.255,2.691,0.255   c7.076,0,12.813-5.064,12.813-11.313S19.888,0.435,12.812,0.435z M11.904,12.218c0,3.076-1.361,4.802-4.043,5.129   c-0.006,0.001-0.01,0.001-0.016,0.001c-0.029,0-0.061-0.011-0.082-0.031c-0.027-0.023-0.043-0.058-0.043-0.094V15.66   c0-0.046,0.025-0.088,0.064-0.109c1.223-0.667,1.834-1.717,1.865-3.207H7.845c-0.068,0-0.125-0.056-0.125-0.125V8.286   c0-0.069,0.057-0.125,0.125-0.125h3.934c0.068,0,0.125,0.056,0.125,0.125V12.218z M18.869,12.218c0,3.029-1.205,4.563-4.033,5.128   c-0.008,0.001-0.016,0.002-0.024,0.002c-0.029,0-0.057-0.01-0.08-0.028c-0.029-0.023-0.045-0.06-0.045-0.097V15.66   c0-0.046,0.025-0.088,0.064-0.109c1.223-0.667,1.834-1.717,1.865-3.207h-1.804c-0.068,0-0.125-0.056-0.125-0.125V8.286   c0-0.069,0.057-0.125,0.125-0.125h3.932c0.07,0,0.125,0.056,0.125,0.125V12.218z"/></svg>',
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M280,185.143V416H496V16H457.6ZM464,384H312V198.857L464,54.1Z"/><path d="M232,16H193.6L16,185.143V416H232ZM200,384H48V198.857L200,54.1Z"/></svg>',
	];

	const getIconForButton = ( svg ) => {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 50 50"
				dangerouslySetInnerHTML={ { __html: svg } }
			></svg>
		);
	};

	const getIconSelectButton = ( svg ) => {
		return (
			<Button
				variant={ attributes.icon === svg ? 'primary' : 'secondary' }
				onClick={ () => setAttributes( { icon: svg } ) }
			>
				{ getIconForButton( svg ) }
			</Button>
		);
	};

	const iconSetting = (
		<ButtonGroup className="wp-quote-icons__options">
			{ icons.map( ( item ) => getIconSelectButton( item ) ) }
		</ButtonGroup>
	);

	const svgElementFromString = ( str ) => {
		const div = document.createElement( 'DIV' );
		div.innerHTML = str;
		const svg = div.querySelector( 'svg' );

		if ( ! svg ) {
			throw Error( '<svg> tag not found' );
		}

		return svg;
	};

	const blockStyles = {
		backgroundColor: attributes.backgroundColor,
		boxShadow:
			Math.max( attributes.boxShadow - 10, 0 ) +
			'px ' +
			Math.max( attributes.boxShadow - 5, 0 ) +
			'px ' +
			attributes.boxShadow +
			'px ' +
			Math.max( attributes.boxShadow - 7, 0 ) +
			'px ' +
			'rgba(0,0,0,0.2)',
		borderRadius: attributes.borderRadius + '%',
	};

	const quoteTextsStyle = {
		textAlign: attributes.alignment ? attributes.alignment : 'inherit',
	};

	const horizontalBar = attributes.showLines && (
		<div style={ { borderBottom: 'solid' + attributes.linesColor } }></div>
	);

	const iconSVG = svgElementFromString( attributes.icon );

	const firstQuotationMark = attributes.showIcon && (
		<div
			className="quote-icon"
			style={ {
				filter: attributes.iconShadow
					? `drop-shadow(10px 5px ${ attributes.iconShadow }px rgba(0, 0, 0, 0.3))`
					: 'none',
				margin: `${
					( attributes.iconMargin.top || '0' ) +
					' ' +
					( attributes.iconMargin.right || '0' ) +
					' ' +
					( attributes.iconMargin.bottom || '0' ) +
					' ' +
					( attributes.iconMargin.left || '0' )
				}`,
				padding: `${
					( attributes.iconPadding.top || '0' ) +
					' ' +
					( attributes.iconPadding.right || '0' ) +
					' ' +
					( attributes.iconPadding.bottom || '0' ) +
					' ' +
					( attributes.iconPadding.left || '0' )
				}`,
			} }
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox={ iconSVG.getAttribute( 'viewBox' ) }
				style={ iconStyles }
				dangerouslySetInnerHTML={ { __html: iconSVG.innerHTML } }
			/>
		</div>
	);

	const secondQuotationMark = attributes.showIcon &&
		attributes.class.includes( 'closed' ) && (
			<div className="quote-icon quote-right-icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox={ iconSVG.getAttribute( 'viewBox' ) }
					style={ { ...iconStyles, transform: 'rotate(180deg)' } }
					dangerouslySetInnerHTML={ {
						__html: svgElementFromString( attributes.icon )
							.innerHTML,
					} }
				/>
			</div>
		);

	const quoteWrapperStyles = {
		margin: `${
			( attributes.margin.top || '0' ) +
			' ' +
			( attributes.margin.right || '0' ) +
			' ' +
			( attributes.margin.bottom || '0' ) +
			' ' +
			( attributes.margin.left || '0' )
		}`,
		padding: `${
			( attributes.padding.top || '0' ) +
			' ' +
			( attributes.padding.right || '0' ) +
			' ' +
			( attributes.padding.bottom || '0' ) +
			' ' +
			( attributes.padding.left || '0' )
		}`,
	};

	const fontSizes = [
		{
			name: __( 'Small', 'wp-quote-blocks' ),
			slug: 'small',
			size: 12,
		},
		{
			name: __( 'Medium', 'wp-quote-blocks' ),
			slug: 'medium',
			size: 14,
		},
		{
			name: __( 'Large', 'wp-quote-blocks' ),
			slug: 'large',
			size: 20,
		},
		{
			name: __( 'Extra large', 'wp-quote-blocks' ),
			slug: 'extra-large',
			size: 28,
		},
	];

	return (
		<>
			<InspectorControls>
				{ legacyFont && (
					<Notice status="warning" isDismissible={ false }>
						{ sprintf(
							/* translators: %s: Font family name. */
							__(
								'This quote uses "%s" from the old font picker. Install it from Appearance → Fonts (or Styles → Typography in the Site Editor), then pick it in this block\'s Styles tab under Typography → Font so it is served from your site.',
								'wp-quote-blocks'
							),
							legacyFont
						) }
					</Notice>
				) }
				<PanelBody title={ __( 'Display', 'wp-quote-blocks' ) }>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Show icon', 'wp-quote-blocks' ) }
						checked={ attributes.showIcon }
						onChange={ ( showIcon ) =>
							setAttributes( { showIcon } )
						}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'Show top and bottom bars',
							'wp-quote-blocks'
						) }
						checked={ attributes.showLines }
						onChange={ ( showLines ) =>
							setAttributes( { showLines } )
						}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Show copy button', 'wp-quote-blocks' ) }
						help={ __(
							'Lets visitors copy the quote and citation to their clipboard.',
							'wp-quote-blocks'
						) }
						checked={ attributes.showCopyButton }
						onChange={ ( showCopyButton ) =>
							setAttributes( { showCopyButton } )
						}
					/>
				</PanelBody>
				{ attributes.showIcon && (
					<PanelBody title={ __( 'Icon', 'wp-quote-blocks' ) }>
						{ iconSetting }
					</PanelBody>
				) }
			</InspectorControls>

			<InspectorControls group="typography">
				<ToolsPanelItem
					panelId={ clientId }
					label={ __( 'Quote size', 'wp-quote-blocks' ) }
					hasValue={ () => isChanged( attributes, 'quoteFontSize' ) }
					onDeselect={ () =>
						setAttributes( resetTo( 'quoteFontSize' )() )
					}
					resetAllFilter={ resetTo( 'quoteFontSize' ) }
					isShownByDefault
				>
					<FontSizePicker
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						fontSizes={ fontSizes }
						value={ attributes.quoteFontSize }
						fallbackFontSize={ 16 }
						onChange={ onChangeQuoteFontSize }
					/>
				</ToolsPanelItem>
				<ToolsPanelItem
					panelId={ clientId }
					label={ __( 'Citation size', 'wp-quote-blocks' ) }
					hasValue={ () =>
						isChanged( attributes, 'citationFontSize' )
					}
					onDeselect={ () =>
						setAttributes( resetTo( 'citationFontSize' )() )
					}
					resetAllFilter={ resetTo( 'citationFontSize' ) }
					isShownByDefault
				>
					<FontSizePicker
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						fontSizes={ fontSizes }
						value={ attributes.citationFontSize }
						fallbackFontSize={ 12 }
						onChange={ onChangeCitationFontSize }
					/>
				</ToolsPanelItem>
				<ToolsPanelItem
					panelId={ clientId }
					label={ __( 'Quote letter spacing', 'wp-quote-blocks' ) }
					hasValue={ () =>
						isChanged( attributes, 'quoteLetterSpacing' )
					}
					onDeselect={ () =>
						setAttributes( resetTo( 'quoteLetterSpacing' )() )
					}
					resetAllFilter={ resetTo( 'quoteLetterSpacing' ) }
				>
					<RangeControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __(
							'Quote letter spacing',
							'wp-quote-blocks'
						) }
						value={ parseInt( attributes.quoteLetterSpacing ) }
						onChange={ ( quoteLetterSpacing ) =>
							setAttributes( { quoteLetterSpacing } )
						}
						step={ 1 }
						min={ -3 }
						max={ 10 }
					/>
				</ToolsPanelItem>
			</InspectorControls>

			<InspectorControls group="color">
				{ colorSettings.map( ( { name, label } ) => (
					<ColorGradientSettingsDropdown
						key={ name }
						__experimentalIsRenderedInSidebar
						panelId={ clientId }
						settings={ [
							{
								label,
								colorValue: attributes[ name ],
								onColorChange: ( value ) =>
									setAttributes( { [ name ]: value } ),
								isShownByDefault: true,
								resetAllFilter: resetTo( name ),
								enableAlpha: true,
								clearable: true,
							},
						] }
						{ ...colorGradientSettings }
					/>
				) ) }
			</InspectorControls>

			<InspectorControls group="dimensions">
				<ToolsPanelItem
					panelId={ clientId }
					label={ __( 'Quote margin', 'wp-quote-blocks' ) }
					hasValue={ () => isChanged( attributes, 'margin' ) }
					onDeselect={ () => setAttributes( resetTo( 'margin' )() ) }
					resetAllFilter={ resetTo( 'margin' ) }
					isShownByDefault
				>
					<BoxControl
						__next40pxDefaultSize
						label={ __( 'Quote margin', 'wp-quote-blocks' ) }
						values={ attributes.margin }
						onChange={ ( margin ) => setAttributes( { margin } ) }
						inputProps={ { min: -300 } }
					/>
				</ToolsPanelItem>
				<ToolsPanelItem
					panelId={ clientId }
					label={ __( 'Quote padding', 'wp-quote-blocks' ) }
					hasValue={ () => isChanged( attributes, 'padding' ) }
					onDeselect={ () => setAttributes( resetTo( 'padding' )() ) }
					resetAllFilter={ resetTo( 'padding' ) }
					isShownByDefault
				>
					<BoxControl
						__next40pxDefaultSize
						label={ __( 'Quote padding', 'wp-quote-blocks' ) }
						values={ attributes.padding }
						onChange={ ( padding ) => setAttributes( { padding } ) }
					/>
				</ToolsPanelItem>
			</InspectorControls>

			<InspectorControls group="border">
				<ToolsPanelItem
					panelId={ clientId }
					label={ __( 'Radius', 'wp-quote-blocks' ) }
					hasValue={ () => isChanged( attributes, 'borderRadius' ) }
					onDeselect={ () =>
						setAttributes( resetTo( 'borderRadius' )() )
					}
					resetAllFilter={ resetTo( 'borderRadius' ) }
					isShownByDefault
				>
					<RangeControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Radius (%)', 'wp-quote-blocks' ) }
						value={ parseInt( attributes.borderRadius ) }
						onChange={ ( borderRadius ) =>
							setAttributes( { borderRadius } )
						}
						step={ 1 }
						min={ 0 }
						max={ 50 }
					/>
				</ToolsPanelItem>
				<ToolsPanelItem
					panelId={ clientId }
					label={ __( 'Shadow', 'wp-quote-blocks' ) }
					hasValue={ () => isChanged( attributes, 'boxShadow' ) }
					onDeselect={ () =>
						setAttributes( resetTo( 'boxShadow' )() )
					}
					resetAllFilter={ resetTo( 'boxShadow' ) }
					isShownByDefault
				>
					<RangeControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Shadow', 'wp-quote-blocks' ) }
						value={ parseInt( attributes.boxShadow ) }
						onChange={ onChangeBoxShadow }
						step={ 1 }
						min={ 0 }
						max={ 20 }
					/>
				</ToolsPanelItem>
			</InspectorControls>

			{ attributes.showIcon && (
				<InspectorControls group="styles">
					<ToolsPanel
						label={ __( 'Icon', 'wp-quote-blocks' ) }
						resetAll={ () =>
							setAttributes(
								resetTo(
									'iconSize',
									'iconShadow',
									'iconMargin',
									'iconPadding'
								)()
							)
						}
					>
						<ToolsPanelItem
							label={ __( 'Size', 'wp-quote-blocks' ) }
							hasValue={ () =>
								isChanged( attributes, 'iconSize' )
							}
							onDeselect={ () =>
								setAttributes( resetTo( 'iconSize' )() )
							}
							isShownByDefault
						>
							<RangeControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={ __( 'Size', 'wp-quote-blocks' ) }
								value={ parseInt( attributes.iconSize ) }
								onChange={ onChangeIconSize }
								min={ 1 }
								max={ 200 }
							/>
						</ToolsPanelItem>
						<ToolsPanelItem
							label={ __( 'Shadow', 'wp-quote-blocks' ) }
							hasValue={ () =>
								isChanged( attributes, 'iconShadow' )
							}
							onDeselect={ () =>
								setAttributes( resetTo( 'iconShadow' )() )
							}
						>
							<RangeControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={ __( 'Shadow', 'wp-quote-blocks' ) }
								value={ parseInt( attributes.iconShadow ) }
								onChange={ ( iconShadow ) =>
									setAttributes( {
										iconShadow: parseInt( iconShadow ),
									} )
								}
								step={ 1 }
								min={ 0 }
								max={ 20 }
							/>
						</ToolsPanelItem>
						<ToolsPanelItem
							label={ __( 'Margin', 'wp-quote-blocks' ) }
							hasValue={ () =>
								isChanged( attributes, 'iconMargin' )
							}
							onDeselect={ () =>
								setAttributes( resetTo( 'iconMargin' )() )
							}
						>
							<BoxControl
								__next40pxDefaultSize
								label={ __( 'Margin', 'wp-quote-blocks' ) }
								values={ attributes.iconMargin }
								onChange={ ( iconMargin ) =>
									setAttributes( { iconMargin } )
								}
								inputProps={ { min: -300 } }
							/>
						</ToolsPanelItem>
						<ToolsPanelItem
							label={ __( 'Padding', 'wp-quote-blocks' ) }
							hasValue={ () =>
								isChanged( attributes, 'iconPadding' )
							}
							onDeselect={ () =>
								setAttributes( resetTo( 'iconPadding' )() )
							}
						>
							<BoxControl
								__next40pxDefaultSize
								label={ __( 'Padding', 'wp-quote-blocks' ) }
								values={ attributes.iconPadding }
								onChange={ ( iconPadding ) =>
									setAttributes( { iconPadding } )
								}
							/>
						</ToolsPanelItem>
					</ToolsPanel>
				</InspectorControls>
			) }
			<div
				{ ...useBlockProps( {
					style: blockStyles,
					className: `wp-quote-blocks quote-variation-${ attributes.class }`,
				} ) }
			>
				<BlockControls>
					<AlignmentToolbar
						value={ attributes.alignment }
						onChange={ onChangeAlignment }
					/>
					<Toolbar>
						<button
							type="button"
							className="components-button"
							onClick={ () => setAttributes( { class: '' } ) }
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="#000000"
								width="24px"
								height="24px"
								viewBox="0 0 16 16"
							>
								<path
									d="M9 6h7v10H9V6zm2 2v6h3V8h-3zM0 14h7v2H0v-2zm0-8h7v2H0V6zm0 4h7v2H0v-2zM0 0h16v4H0V0z"
									fillRule="evenodd"
								/>
							</svg>
						</button>
					</Toolbar>
				</BlockControls>
				{ loadLegacyFont && (
					// Preview only: the editor canvas is an iframe, so the
					// stylesheet has to live inside the block markup.
					<link
						rel="stylesheet"
						href={ getGoogleFontUrl(
							legacyFont,
							attributes.style?.typography?.fontWeight
						) }
					/>
				) }
				{ horizontalBar }
				{ firstQuotationMark }
				<div className="quote-wrapper" style={ quoteWrapperStyles }>
					<RichText
						tagName="p"
						className="quote"
						style={ {
							...quoteTextsStyle,
							color: attributes.quoteFontColor,
							fontWeight:
								attributes.style?.typography?.fontWeight,
							fontSize: attributes.quoteFontSize,
							letterSpacing: attributes.quoteLetterSpacing,
						} }
						value={ attributes.quote }
						onChange={ ( quote ) => setAttributes( { quote } ) }
						placeholder={ __( 'Add quote…', 'wp-quote-blocks' ) }
					/>
					<RichText
						tagName="p"
						className="citation"
						style={ {
							...quoteTextsStyle,
							color: attributes.citationFontColor,
							fontSize: attributes.citationFontSize,
						} }
						value={ attributes.citation }
						onChange={ ( citation ) =>
							setAttributes( { citation } )
						}
						placeholder={ __( 'Add citation…', 'wp-quote-blocks' ) }
						textAlign="center"
					/>
					{ attributes.showCopyButton && (
						// Static preview; the click behaviour lives in view.js.
						<button
							type="button"
							className="wpqb-copy-button"
							tabIndex={ -1 }
							aria-hidden="true"
						>
							{ __( 'Copy quote', 'wp-quote-blocks' ) }
						</button>
					) }
				</div>
				{ secondQuotationMark }
				{ horizontalBar }
			</div>
		</>
	);
}
