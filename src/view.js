/**
 * Frontend behaviour for the Quote block, powered by the Interactivity API.
 *
 * Only blocks with "Show copy button" enabled render the directives that
 * hydrate this store, so the module does nothing for other quotes.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/interactivity-api/
 */
import { store, getContext, getElement } from '@wordpress/interactivity';

const RESET_DELAY = 2000;

/**
 * Builds the plain-text version of a quote, e.g. `"Quote" — Citation`.
 *
 * @param {HTMLElement} block The block wrapper element.
 * @return {string} Text to place on the clipboard.
 */
const getQuoteText = ( block ) => {
	const quote = block.querySelector( '.quote' )?.innerText.trim() ?? '';
	const citation = block.querySelector( '.citation' )?.innerText.trim() ?? '';

	return citation ? `“${ quote }” — ${ citation }` : `“${ quote }”`;
};

store( 'wp-quote-blocks', {
	state: {
		/**
		 * Button label derived from the per-block context.
		 *
		 * @return {string} Current label.
		 */
		get buttonLabel() {
			const { status, labels } = getContext();
			return labels[ status ];
		},
		/**
		 * Whether the last copy attempt succeeded, used to toggle a CSS class.
		 *
		 * @return {boolean} True right after a successful copy.
		 */
		get isCopied() {
			return getContext().status === 'copied';
		},
	},
	actions: {
		/**
		 * Copies the quote and citation to the clipboard. Generator actions let
		 * the Interactivity API keep the right context across async steps.
		 */
		*copy() {
			const context = getContext();
			const { ref } = getElement();
			const block = ref.closest( '.wp-quote-blocks' );

			try {
				yield window.navigator.clipboard.writeText(
					getQuoteText( block )
				);
				context.status = 'copied';
			} catch {
				// Clipboard access needs HTTPS and user permission.
				context.status = 'failed';
			}

			yield new Promise( ( resolve ) =>
				setTimeout( resolve, RESET_DELAY )
			);
			context.status = 'idle';
		},
	},
} );
