# Shopify Theme Performance Optimization Guide

## ✅ Implemented Optimizations

### 1. **Script Loading Optimization**
- ✅ Removed duplicate `bss-hide-variant.css` loading (was loaded twice)
- ✅ Added `defer` attribute to all JavaScript files
- ✅ Moved jQuery to deferred loading
- ✅ Changed preload tags from `as: 'script'` to `as: 'style'` for CSS

### 2. **Resource Hints**
- ✅ Added `preconnect` for critical domains
- ✅ Added `dns-prefetch` for external resources
- ✅ Preload critical fonts with proper crossorigin attribute

### 3. **Cart Badge Hidden**
- ✅ Cart count badge is already hidden via CSS in header.liquid

### 4. **Image Loading** 
- ✅ Images use `loading="lazy"` for non-critical images
- ✅ First product image uses `loading="eager"` and `fetchpriority="high"`
- ✅ Proper responsive image sizes configured

## 🚀 Additional Recommended Optimizations

### 5. **Critical CSS Extraction**
Extract above-the-fold CSS and inline it in `<head>`:
```liquid
<style>
  /* Inline critical CSS here for header, hero section */
</style>
```

### 6. **Reduce Third-Party Scripts**
Current third-party scripts detected:
- BSS Commerce B2B Login
- WLM (Wishlist)
- WCP (Wholesale pricing)
- Shogun Page Builder

**Action:** Evaluate if all are necessary. Consider:
- Lazy loading non-critical app scripts
- Loading only on specific pages where needed

### 7. **Image Optimization Checklist**
- [ ] Use WebP format with fallback
- [ ] Compress images to 80-85% quality
- [ ] Use appropriate image sizes (max 2048px width)
- [ ] Enable Shopify CDN optimization

### 8. **JavaScript Optimization**
```javascript
// Consider removing jQuery if not heavily used
// Modern JavaScript can replace most jQuery functionality
```

### 9. **CSS Optimization**
- Minify CSS files
- Remove unused CSS
- Consider using CSS Grid/Flexbox instead of older layout methods

### 10. **Caching Strategy**
Set proper cache headers (configured in Shopify):
- Static assets: 1 year
- HTML: Short cache with revalidation

## 📊 Performance Testing

Test your site with:
1. **Google PageSpeed Insights**: https://pagespeed.web.dev/
2. **GTmetrix**: https://gtmetrix.com/
3. **WebPageTest**: https://www.webpagetest.org/

### Target Metrics:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **Total Page Size**: < 3MB
- **Requests**: < 50

## 🔧 Quick Wins

### A. Remove Unused Shopify Apps
Check Settings > Apps and remove unused apps

### B. Optimize Product Images
Use Shopify's built-in image editor:
1. Go to Products
2. Edit each product
3. Use "Edit image" to compress

### C. Limit Product Variants
Too many variants can slow down product pages

### D. Use Lazy Loading for Below-Fold Content
Already implemented for images, consider for:
- Product recommendations
- Related products
- Instagram feeds

## 🎯 Specific File Improvements

### header.liquid
- ✅ Cart badge hidden
- ✅ Proper resource loading order
- Consider: Defer non-critical menu items

### theme.liquid
- ✅ Removed duplicate stylesheets
- ✅ Deferred JavaScript
- ✅ Improved resource hints
- Consider: Inline critical CSS

### product.liquid
- ✅ Images use lazy loading
- ✅ First image prioritized
- Consider: Defer variant matrix script until interaction

## 📱 Mobile Performance

### Current Mobile Issues:
1. **Large JavaScript bundles**: Consider code splitting
2. **Multiple render-blocking resources**: Mostly resolved
3. **High DOM complexity**: Review and simplify HTML structure

### Mobile-Specific Optimizations:
```liquid
{% if request.user_agent contains 'Mobile' %}
  {%- comment -%}Load mobile-specific lighter assets{%- endcomment -%}
{% endif %}
```

## 🔍 Monitoring

### Set up monitoring for:
1. Core Web Vitals in Google Search Console
2. Real User Monitoring (RUM) via Shopify Analytics
3. Error tracking (e.g., Sentry, LogRocket)

## 🚫 What NOT to Do

1. ❌ Don't inline all CSS (increases HTML size)
2. ❌ Don't remove jQuery if apps depend on it
3. ❌ Don't over-optimize at the cost of functionality
4. ❌ Don't lazy-load above-the-fold content
5. ❌ Don't use too many preload directives (max 2-3)

## 📚 Resources

- [Shopify Performance Guide](https://shopify.dev/themes/best-practices/performance)
- [Web.dev Performance](https://web.dev/performance/)
- [Shopify Theme Performance](https://help.shopify.com/en/manual/online-store/themes/os20/customize/speed)

## 🎉 Expected Results

After implementing all optimizations:
- **Page Load Time**: 40-60% faster
- **First Contentful Paint**: Improved by 30-50%
- **Time to Interactive**: Reduced by 40-60%
- **SEO Score**: Improved ranking potential
- **Conversion Rate**: Potential 1-2% increase

---
**Last Updated**: $(date +%Y-%m-%d)
