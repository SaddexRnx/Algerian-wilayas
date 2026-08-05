=== DZ Address Picker ===
Requires at least: 5.6
Requires PHP: 7.2
Stable tag: 1.0.0

Cascading Wilaya / Daira / Commune address selector for WooCommerce checkout
and any WordPress form.

== Installation ==

1. In WordPress, go to Plugins -> Add New -> Upload Plugin.
2. Upload dz-address-picker.zip and click Install Now, then Activate.
3. Go to Settings -> DZ Address Picker and set your API base URL.

== Usage ==

* WooCommerce: the picker is injected automatically above the billing address.
* Anywhere else: use the shortcode [dz_address_picker].

== Data captured ==

The selection is written into a hidden input (default name: shipping_address)
and stored on the order as _dz_address, _dz_wilaya, _dz_daira and _dz_commune.
