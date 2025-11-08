(function() {
  'use strict';

  const CART_FOOTER_TOTAL_SELECTOR = '[data-cart-footer-total]';
  const LINE_ITEM_TOTAL_SELECTOR = '[data-cart-item-line-total][data-discounted-price]';

  function updateCartTotal() {
    const cartTotalElement = document.querySelector(CART_FOOTER_TOTAL_SELECTOR);
    if (!cartTotalElement) {
      return;
    }

    const lineItemTotals = document.querySelectorAll(LINE_ITEM_TOTAL_SELECTOR);
    let newCartTotal = 0;

    lineItemTotals.forEach(item => {
      const discountedPrice = parseFloat(item.getAttribute('data-discounted-price'));
      if (!isNaN(discountedPrice)) {
        newCartTotal += discountedPrice;
      }
    });

    const moneyFormat = theme.moneyFormat || '${{amount}}';
    const formattedTotal = formatMoney(newCartTotal, moneyFormat);
    
    if (cartTotalElement.innerHTML !== formattedTotal) {
      cartTotalElement.innerHTML = formattedTotal;
    }
  }

  function formatMoney(cents, format) {
    if (typeof cents !== 'number') {
      cents = parseInt(cents, 10);
    }
    let value = '';
    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    const formatString = format || this.money_format;

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = precision === undefined ? 2 : precision;
      thousands = thousands || ',';
      decimal = decimal || '.';

      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      const parts = number.split('.');
      const dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      const cents = parts[1] ? decimal + parts[1] : '';

      return dollars + cents;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  }

  function initializeCartTotalUpdater() {
    updateCartTotal();

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          updateCartTotal();
          break;
        }
      }
    });

    const cartItemsNode = document.querySelector('[data-line-items]');
    if (cartItemsNode) {
      observer.observe(cartItemsNode, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-discounted-price']
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initializeCartTotalUpdater);
  document.addEventListener('theme:cart:change', () => {
    setTimeout(initializeCartTotalUpdater, 500);
  });
  document.addEventListener('cartUpdateComplete', () => {
    setTimeout(initializeCartTotalUpdater, 500);
  });

})();
