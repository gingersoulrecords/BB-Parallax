<?php
/*
Plugin Name: BB-Parallax
Description: A small plugin that improves the performance of parallax elements in Beaver Builder.
Version: 1.0
Author: Dave Bloom
Author URI: davebloom.yoursellf.dev
*/

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Enqueue Scripts
function bb_parallax_enqueue_scripts()
{
    // Register the scripts
    wp_register_script('gsap', plugins_url('/js/gsap.min.js', __FILE__), array(), '3.9.1', true);
    wp_register_script('scrolltrigger', plugins_url('/js/ScrollTrigger.min.js', __FILE__), array('gsap'), '3.9.1', true);
    wp_register_script('bb-parallax', plugins_url('/scripts.js', __FILE__), array('jquery', 'gsap', 'scrolltrigger'), '1.0', true);

    // Enqueue the scripts
    wp_enqueue_script('gsap');
    wp_enqueue_script('scrolltrigger');
    wp_enqueue_script('bb-parallax');

    // Register the style
    wp_register_style('bb-parallax', plugins_url('/styles.css', __FILE__), array(), '1.0', 'all');

    // Enqueue the style
    wp_enqueue_style('bb-parallax');
}
add_action('wp_enqueue_scripts', 'bb_parallax_enqueue_scripts');
