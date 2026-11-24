<?php
/**
 * Removes data stored by older versions of the plugin.
 *
 * @package quote-blocks
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Google Fonts API key used by the font picker before 0.3.0.
delete_option( 'google_api_key' );
