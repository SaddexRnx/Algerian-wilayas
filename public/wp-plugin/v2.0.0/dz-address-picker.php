<?php
/**
 * Plugin Name: DZ Address Picker
 * Description: Cascading Wilaya / Daira / Commune address selector for WooCommerce checkout and any WordPress form.
 * Version: 2.0.0
 * Requires at least: 5.6
 * Requires PHP: 7.2
 * Text Domain: dz-address-picker
 */

if (!defined('ABSPATH')) {
    exit;
}

define('DZ_ADDRESS_PICKER_VERSION', '2.0.0');

/**
 * Base URL of the static address API.
 * Change this from Settings -> DZ Address Picker if you self-host the JSON files.
 */
function dz_address_picker_api_base()
{
    $default = 'https://dz-address-select.vercel.app/api';
    return untrailingslashit(get_option('dz_address_picker_api_base', $default));
}

function dz_address_picker_options()
{
    return array(
        'apiBase'   => dz_address_picker_api_base(),
        'format'    => get_option('dz_address_picker_format', 'arabic'),
        'inputName' => get_option('dz_address_picker_input_name', 'shipping_address'),
        'labels'    => array(
            'wilaya'  => __('Wilaya', 'dz-address-picker'),
            'daira'   => __('Daira', 'dz-address-picker'),
            'commune' => __('Commune', 'dz-address-picker'),
            'search'  => __('Search…', 'dz-address-picker'),
        ),
    );
}

/**
 * Front-end assets.
 */
function dz_address_picker_enqueue()
{
    wp_enqueue_script(
        'dz-checkout',
        plugins_url('dz-checkout.js', __FILE__),
        array(),
        DZ_ADDRESS_PICKER_VERSION,
        true
    );

    wp_localize_script('dz-checkout', 'DZ_ADDRESS_PICKER', dz_address_picker_options());
}
add_action('wp_enqueue_scripts', 'dz_address_picker_enqueue');

/**
 * Shortcode: [dz_address_picker]
 */
function dz_address_picker_shortcode($atts)
{
    $atts = shortcode_atts(
        array(
            'format' => get_option('dz_address_picker_format', 'arabic'),
            'name'   => get_option('dz_address_picker_input_name', 'shipping_address'),
        ),
        $atts,
        'dz_address_picker'
    );

    return sprintf(
        '<div class="dz-address-picker" data-format="%s" data-input-name="%s"></div>',
        esc_attr($atts['format']),
        esc_attr($atts['name'])
    );
}
add_shortcode('dz_address_picker', 'dz_address_picker_shortcode');

/**
 * WooCommerce checkout: render the picker above the billing address fields.
 */
function dz_address_picker_woocommerce_checkout()
{
    echo dz_address_picker_shortcode(array());
}
add_action('woocommerce_before_checkout_billing_form', 'dz_address_picker_woocommerce_checkout');

/**
 * Persist the selected address on the order.
 */
function dz_address_picker_save_order_meta($order_id)
{
    $field = get_option('dz_address_picker_input_name', 'shipping_address');

    if (isset($_POST[$field])) {
        update_post_meta($order_id, '_dz_address', sanitize_text_field(wp_unslash($_POST[$field])));
    }
    if (isset($_POST['dz_wilaya'])) {
        update_post_meta($order_id, '_dz_wilaya', sanitize_text_field(wp_unslash($_POST['dz_wilaya'])));
    }
    if (isset($_POST['dz_daira'])) {
        update_post_meta($order_id, '_dz_daira', sanitize_text_field(wp_unslash($_POST['dz_daira'])));
    }
    if (isset($_POST['dz_commune'])) {
        update_post_meta($order_id, '_dz_commune', sanitize_text_field(wp_unslash($_POST['dz_commune'])));
    }
}
add_action('woocommerce_checkout_update_order_meta', 'dz_address_picker_save_order_meta');

/**
 * Show the selected address in the order admin screen.
 */
function dz_address_picker_admin_order_meta($order)
{
    $order_id = method_exists($order, 'get_id') ? $order->get_id() : 0;
    $address  = get_post_meta($order_id, '_dz_address', true);

    if ($address) {
        echo '<p><strong>' . esc_html__('Address', 'dz-address-picker') . ':</strong> ' . esc_html($address) . '</p>';
    }
}
add_action('woocommerce_admin_order_data_after_shipping_address', 'dz_address_picker_admin_order_meta');

/**
 * Settings page.
 */
function dz_address_picker_settings_menu()
{
    add_options_page(
        __('DZ Address Picker', 'dz-address-picker'),
        __('DZ Address Picker', 'dz-address-picker'),
        'manage_options',
        'dz-address-picker',
        'dz_address_picker_settings_page'
    );
}
add_action('admin_menu', 'dz_address_picker_settings_menu');

function dz_address_picker_register_settings()
{
    register_setting('dz_address_picker', 'dz_address_picker_api_base', array('sanitize_callback' => 'esc_url_raw'));
    register_setting('dz_address_picker', 'dz_address_picker_format', array('sanitize_callback' => 'sanitize_text_field'));
    register_setting('dz_address_picker', 'dz_address_picker_input_name', array('sanitize_callback' => 'sanitize_key'));
}
add_action('admin_init', 'dz_address_picker_register_settings');

function dz_address_picker_settings_page()
{
    if (!current_user_can('manage_options')) {
        return;
    }
    $format = get_option('dz_address_picker_format', 'arabic');
    ?>
    <div class="wrap">
        <h1><?php echo esc_html__('DZ Address Picker', 'dz-address-picker'); ?></h1>
        <form method="post" action="options.php">
            <?php settings_fields('dz_address_picker'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="dz_api_base"><?php echo esc_html__('API base URL', 'dz-address-picker'); ?></label></th>
                    <td>
                        <input name="dz_address_picker_api_base" id="dz_api_base" type="url" class="regular-text"
                               value="<?php echo esc_attr(dz_address_picker_api_base()); ?>" />
                        <p class="description"><?php echo esc_html__('Static JSON endpoints, e.g. https://dz-address-select.vercel.app/api', 'dz-address-picker'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="dz_format"><?php echo esc_html__('Output format', 'dz-address-picker'); ?></label></th>
                    <td>
                        <select name="dz_address_picker_format" id="dz_format">
                            <option value="arabic" <?php selected($format, 'arabic'); ?>>arabic</option>
                            <option value="latin" <?php selected($format, 'latin'); ?>>latin</option>
                            <option value="json" <?php selected($format, 'json'); ?>>json</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="dz_input_name"><?php echo esc_html__('Hidden field name', 'dz-address-picker'); ?></label></th>
                    <td>
                        <input name="dz_address_picker_input_name" id="dz_input_name" type="text" class="regular-text"
                               value="<?php echo esc_attr(get_option('dz_address_picker_input_name', 'shipping_address')); ?>" />
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
        <h2><?php echo esc_html__('Usage', 'dz-address-picker'); ?></h2>
        <p><code>[dz_address_picker]</code> <?php echo esc_html__('in any page, post or widget. WooCommerce checkout is handled automatically.', 'dz-address-picker'); ?></p>
    </div>
    <?php
}
