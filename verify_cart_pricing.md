# Cart Pricing Verification Analysis

## How WCP Discount Works

Based on the code analysis, here's how the wholesale pricing is calculated:

### 1. **Discount Formula**
```liquid
wcp_discount_value = p_discount_value / 100.0
wcp_discount_value = 1 - wcp_discount_value

Final Price = Original Price × wcp_discount_value
```

### 2. **Example Calculations**

If a customer has a tag like "wholesale-30" (30% discount):
- `p_discount_value = 30`
- `wcp_discount_value = 1 - (30/100) = 1 - 0.30 = 0.70`
- `Final Price = Original Price × 0.70` (70% of original = 30% off)

## Your Cart Analysis

### Cart Example 1 (from screenshot):
- **Original Total**: $1,391.60
- **Final Total**: $1,255.92
- **Discount Amount**: $135.68
- **Discount Percentage**: ($135.68 / $1,391.60) × 100 = **9.75%**

### Cart Example 2 (3 items):
- **Original Total**: $1,043.70
- **Final Total**: $636.66
- **Discount Amount**: $407.04
- **Discount Percentage**: ($407.04 / $1,043.70) × 100 = **39.0%**

## Issue Identified

**The discount percentages are inconsistent!**
- First cart: ~10% discount
- Second cart: ~39% discount

This suggests one of these scenarios:

### Scenario A: Different Customer Tags Applied
The customer might have different tags for different products, causing varying discounts.

### Scenario B: Volume Discounts (VD)
The `wcp_vd_discount` snippet might be applying additional cart-based volume discounts on top of the customer tag discount.

### Scenario C: Mixed Discounting
Some items have:
- Individual variant prices set (via `wcp_set_prices`)
- Percentage discounts
- Volume discounts

All stacking together.

## What to Check

1. **Customer Tags**: What wholesale tags does the customer have?
2. **Product Metafields**: Check `product.metafields.wcp_set_prices.wcp_set_prices`
3. **Volume Discount Rules**: Check if volume discounts are enabled
4. **Cart Items**: Are all items getting the same discount percentage?

## Recommendation

The calculation appears to be **working as designed** by the WCP plugin, but the discount percentage varies by:
- Customer tag assignment
- Product-specific pricing rules
- Volume-based discounts
- Collection-based discounts

To verify if it's correct, you need to check:
1. What discount percentage SHOULD the customer receive?
2. Are there volume discount tiers active?
3. Are individual products priced differently?
