/*
* Pipeline Theme
*
* Use this file to add custom Javascript to Pipeline.  Keeping your custom
* Javascript in this fill will make it easier to update Pipeline. In order
* to use this file you will need to open layout/theme.liquid and uncomment
* the custom.js script import line near the bottom of the file.
*
*/


(function() {

  // Below are example event listeners.  They listen for theme events that Pipeline
  // fires in order to make it easier for you to add customizations.

  // Keep your scripts inside this IIFE function call to avoid leaking your
  // variables into the global scope.


  document.addEventListener('theme:variant:change', function(event) {
    // You might use something like this to write a pre-order feature or a
    // custom swatch feature.
    var variant = event.detail.variant;
    var container = event.target;
    if (variant) {
      console.log('Container ———————— ↓');
      console.log(container);
      console.log('Variant —————————— ↓');
      console.log(variant);
      // ... update some element on the page
    }
  });

  document.addEventListener('theme:cart:change', function(event) {
    var cart = event.detail.cart;
    if (cart) {
      console.log('Cart ———————————— ↓');
      console.log(cart);
      // ... update an app or a custom shipping caluclator
    }
  });
  // Fired when page loads to update header values
  document.addEventListener('theme:cart:init', (e) => {
    console.log('theme:cart:init');
    console.log(e);
  });

  // Debounced scroll listeners.  Up and down only fire on direction changes
  // These events are useful for creating sticky elements and popups.
  document.addEventListener('theme:scroll', e => { console.log(e); });
  document.addEventListener('theme:scroll:up', e => { console.log(e); });
  document.addEventListener('theme:scroll:down', e => { console.log(e); });

  // Debounced resize listener to bundle changes that trigger document reflow
  document.addEventListener('theme:resize', e => { console.log(e); });

  // Locks and unlocks page scroll for modals and drawers
  // These are commented out because firing them will lock the page scroll
  // the lock event must set `detail` to the modal or drawer body so the 
  // scroll locking code knows what element should maintain scoll. 
  // document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: scrollableInnerElement}));
  // document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));


  // ^^ Keep your scripts inside this IIFE function call to avoid leaking your
  // variables into the global scope.
})();

// Custom cart drawer price updates
(function() {
  'use strict';
  
  // Configuration for wholesale pricing app compatibility
  const WCP_CONFIG = {
    delay: 800, // Wait for WCP to process prices
    maxRetries: 5,
    retryInterval: 200
  };
  
  // Track which inputs are currently being interacted with
  const interactingInputs = new Set();
  
  /**
   * Update cart drawer prices dynamically after cart changes
   */
  function updateCartDrawerPrices(cart) {
    if (!cart || !cart.items) return;
    
    // Wait for WCP if needed
    if (isWholesaleCustomer()) {
      waitForWCP().then(() => {
        applyPriceUpdates(cart);
      });
    } else {
      applyPriceUpdates(cart);
    }
  }
  
  /**
   * Check if current customer is a wholesale customer
   */
  function isWholesaleCustomer() {
    // Check for WCP wholesale customer indicators
    return document.querySelector('.WPDcheckoutBTN') !== null ||
           typeof window.wcp_data !== 'undefined';
  }
  
  /**
   * Wait for WCP to load and process prices
   */
  function waitForWCP() {
    return new Promise((resolve) => {
      let retries = 0;
      
      const checkWCP = () => {
        if (window.wcp_data || retries >= WCP_CONFIG.maxRetries) {
          setTimeout(resolve, WCP_CONFIG.delay);
        } else {
          retries++;
          setTimeout(checkWCP, WCP_CONFIG.retryInterval);
        }
      };
      
      checkWCP();
    });
  }
  
  /**
   * Apply price updates to cart drawer elements
   */
  function applyPriceUpdates(cart) {
    const currency = cart.currency || 'USD';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    });
    
    cart.items.forEach(item => {
      const key = item.key;
      
      // Update unit price (MSRP column)
      updatePrice(`[data-item-price="${key}"]`, item.final_price, formatter);
      updatePrice(`[data-wpd-cart-variant-id="${item.variant_id}"][data-wpd-cart-item="${key}"] span`, item.final_price, formatter);
      updatePrice(`[data-wpd-cart-variant-id="${item.variant_id}"][data-wpd-cart-item="${key}"] mark`, item.final_price, formatter);
      
      // Update compare-at price if exists
      if (item.variant && item.variant.compare_at_price > item.final_price) {
        updatePrice(`[data-compare-price="${key}"]`, item.variant.compare_at_price, formatter);
      }
      
      // Update original price if discounted
      if (item.original_price > item.final_price) {
        updatePrice(`[data-original-price="${key}"]`, item.original_price, formatter);
      }
      
      // Update line total (TOTAL column)
      updatePrice(`[data-line-total="${key}"]`, item.final_line_price, formatter);
      updatePrice(`[data-wpd-cart-line-price][data-wpd-cart-item="${key}"]`, item.final_line_price, formatter);
      
      // Update quantity ONLY if the input is not currently being interacted with
      const qtyInput = document.querySelector(`input[data-update-cart="${key}"]`);
      if (qtyInput && parseInt(qtyInput.value) !== item.quantity) {
        // Don't update if user is currently typing/focused or recently interacted
        if (document.activeElement !== qtyInput && !interactingInputs.has(key)) {
          qtyInput.value = item.quantity;
        }
      }
    });
    
    // Update cart total
    updatePrice('[data-cart-final]', cart.total_price, formatter);
    updatePrice('.wcp-original-cart-total', cart.total_price, formatter);
    
    // Trigger WCP refresh if available
    if (typeof window.wcpRefreshCartTotal === 'function') {
      setTimeout(() => {
        window.wcpRefreshCartTotal();
      }, 100);
    }
  }
  
  /**
   * Update a specific price element
   */
  function updatePrice(selector, priceInCents, formatter) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;
    
    const formattedPrice = formatter.format(priceInCents / 100);
    
    elements.forEach(element => {
      if (element) {
        element.textContent = formattedPrice;
      }
    });
  }
  
  /**
   * Listen for cart change events
   */
  function initCartDrawerPriceUpdates() {
    // Track user interactions with quantity inputs
    document.addEventListener('focusin', function(e) {
      const qtyInput = e.target.closest('input[data-update-cart]');
      if (qtyInput) {
        const key = qtyInput.getAttribute('data-update-cart');
        interactingInputs.add(key);
      }
    }, true);
    
    document.addEventListener('focusout', function(e) {
      const qtyInput = e.target.closest('input[data-update-cart]');
      if (qtyInput) {
        const key = qtyInput.getAttribute('data-update-cart');
        // Keep the input locked for a short time after blur to prevent flickering
        setTimeout(() => {
          interactingInputs.delete(key);
        }, 500);
      }
    }, true);
    
    // Also track input events to prevent updates during typing
    document.addEventListener('input', function(e) {
      const qtyInput = e.target.closest('input[data-update-cart]');
      if (qtyInput) {
        const key = qtyInput.getAttribute('data-update-cart');
        interactingInputs.add(key);
      }
    }, true);
    
    // Listen for theme cart change events
    document.addEventListener('theme:cart:change', function(event) {
      if (event.detail && event.detail.cart) {
        updateCartDrawerPrices(event.detail.cart);
      }
    });
    
    // Also listen for when cart drawer opens
    const cartDrawer = document.querySelector('[data-drawer="drawer-cart"]');
    if (cartDrawer) {
      cartDrawer.addEventListener('theme:drawer:open', function() {
        // Fetch current cart state and update prices
        fetch('/cart.js')
          .then(response => response.json())
          .then(cart => {
            updateCartDrawerPrices(cart);
          })
          .catch(error => {
            console.error('Error fetching cart:', error);
          });
      });
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartDrawerPriceUpdates);
  } else {
    initCartDrawerPriceUpdates();
  }
  
  // Also re-initialize after section loads (for theme editor)
  document.addEventListener('shopify:section:load', function(event) {
    if (event.target.querySelector('[data-drawer="drawer-cart"]')) {
      initCartDrawerPriceUpdates();
    }
  });
  
})();
