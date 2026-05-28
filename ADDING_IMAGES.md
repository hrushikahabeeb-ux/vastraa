# 📸 How to Add Your Own Product Images

All product images live in one folder: `frontend/public/products/`

## File Naming Convention

Each product has two images:
```
product1.jpg    ← main/front image for product p1
product1b.jpg   ← detail/back image for product p1
product2.jpg    ← main image for product p2
product2b.jpg   ← detail image for product p2
...and so on up to...
product30.jpg
product30b.jpg
```

## Steps

1. **Prepare your images**
   - Recommended size: **600 × 800 px** (3:4 portrait ratio)
   - Format: `.jpg` or `.png`  
   - Keep file size under **200KB** for fast loading

2. **Name your files** to match the product number from the table below

3. **Drop them into** `frontend/public/products/`
   - That's it — the app picks them up automatically, no code changes needed

4. **If you use `.png` instead of `.jpg`**, update the image paths in `backend/config/db.js` by changing:
   ```js
   const img = (n) => [`/products/product${n}.jpg`, `/products/product${n}b.jpg`];
   ```
   to:
   ```js
   const img = (n) => [`/products/product${n}.png`, `/products/product${n}b.png`];
   ```

## Product Number Reference

| File          | Product Name                   | Category |
|---------------|-------------------------------|----------|
| product1.jpg  | Embroidered Mirror Kurti       | Women    |
| product2.jpg  | Premium Cotton Dress Shirt     | Men      |
| product3.jpg  | Floral Georgette Anarkali      | Women    |
| product4.jpg  | Stretch Slim Chinos            | Men      |
| product5.jpg  | Floral Wrap Sundress           | Women    |
| product6.jpg  | Kids Festive Kurta Set         | Kids     |
| product7.jpg  | Unstructured Linen Blazer      | Men      |
| product8.jpg  | Printed Palazzo Pants          | Women    |
| product9.jpg  | Classic Piqué Polo             | Men      |
| product10.jpg | Silk Blend Zari Saree          | Women    |
| product11.jpg | Washed Denim Jacket            | Men      |
| product12.jpg | Rayon Flowy Maxi Dress         | Women    |
| product13.jpg | Girls Smocked Party Frock      | Kids     |
| product14.jpg | Wool Blend Formal Suit         | Men      |
| product15.jpg | Boho Floral Co-ord Set         | Women    |
| product16.jpg | Kids Denim Dungaree            | Kids     |
| product17.jpg | Pastel Crop Hoodie             | Women    |
| product18.jpg | Phulkari Embroidered Dupatta   | Women    |
| product19.jpg | Tapered Jogger Pants           | Men      |
| product20.jpg | Bandhani Lehenga Choli Set     | Women    |
| product21.jpg | Kids Ethnic Lehenga Set        | Kids     |
| product22.jpg | Printed Midi Skirt             | Women    |
| product23.jpg | Cargo Combat Pants             | Men      |
| product24.jpg | Bandhgala Ethnic Jacket        | Men      |
| product25.jpg | Graphic Print Sports Tee       | Men      |
| product26.jpg | Silk Blend Sherwani Set        | Men      |
| product27.jpg | Block Print Kurta Pyjama Set   | Women    |
| product28.jpg | Kids Graphic T-Shirt           | Kids     |
| product29.jpg | Kids Knitted Cardigan          | Kids     |
| product30.jpg | Patiala Salwar Suit            | Women    |

## Tips for Best Results

- **Use a clean white or light background** for a consistent look
- **Portrait orientation** (taller than wide) looks best in the 3:4 card layout
- **Consistent lighting** across all products makes the store look more professional
- For the `b` images, use a close-up or detail shot of the same product

## Placeholder Images

Until you add your own images, the app shows branded placeholder images
(stored in `frontend/public/products/`) with the product number clearly
marked so you know which file to replace.

If an image fails to load, the app gracefully shows a clothing emoji and
the product name — so nothing breaks.
