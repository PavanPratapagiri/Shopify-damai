// Preserve tiered discount pricing in cart
(function() {
  'use strict';
  // Store the original discounted prices when page loads
  function preserveTieredPricing() {
    const cartItemTotals = document.querySelectorAll('[data-cart-item-line-total][data-discounted-price]');
    
    cartItemTotals.forEach(function(element) {
      const discountedPrice = element.getAttribute('data-discounted-price');
      
      // Create a MutationObserver to watch for changes to this element
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            // If the content changed, restore our calculated price
            const currentPrice = element.getAttribute('data-discounted-price');
            if (currentPrice && element.textContent.trim() !== formatMoney(currentPrice)) {
              element.innerHTML = formatMoney(currentPrice);
            }
          }
        });
      });
      
      // Start observing
      observer.observe(element, {
        childList: true,
        characterData: true,
        subtree: true
      });
    });
  }
  
  // Format money using Shopify's theme settings
  function formatMoney(cents) {
    const money = typeof cents === 'string' ? parseFloat(cents) : cents;
    const format = window.theme && window.theme.moneyFormat ? window.theme.moneyFormat : '${{amount}}';
    const currencyCode = window.theme && window.theme.currencyCode ? window.theme.currencyCode : '';
    const currencyEnabled = window.theme && window.theme.settings && window.theme.settings.currency_code_enable;
    
    let formatted = format.replace('{{amount}}', (money / 100).toFixed(2));
    formatted = formatted.replace('.00', '');
    
    if (currencyEnabled && currencyCode) {
      formatted += ' ' + currencyCode;
    }
    
    return formatted;
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preserveTieredPricing);
  } else {
    preserveTieredPricing();
  }
  
  // Re-run after cart updates
  document.addEventListener('theme:cart:change', function() {
    setTimeout(preserveTieredPricing, 100);
  });
  
})();
