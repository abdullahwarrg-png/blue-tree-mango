# Blue Tree Mango

A simple mango tree purchase calculator built with **React Native and Expo**. Enter the quantity and tree height, choose a service, and calculate an itemised invoice.

[**Try the live demo →**](https://abdullahwarrg-png.github.io/blue-tree-mango/)

## App structure

- `App.js` — screen layout, validation, calculations, and styles.
- `app.json` — Expo settings and the GitHub Pages base path.
- `assets/` — app icon and browser favicon.

## Pricing

All trees in an order must have the same height. Prices include tax.

| Height | Price per tree |
| --- | ---: |
| Under 3 feet | MYR 39.00 |
| 3–5 feet | MYR 69.00 |
| 6–8 feet | MYR 99.00 |
| Over 8 feet | MYR 199.00 |

## Features

- Cash and carry, delivery only, or delivery with planting.
- Clear invoice showing tree costs, service charges, and total due.
- Input validation and automatic invoice reset when details change.
- Responsive layout for phones and desktop browsers.

**Delivery only:** MYR 20.00 per tree, capped at MYR 100.00 per order.  
**Delivery and planting:** 50% of the tree subtotal, with delivery included.  
**Cash and carry:** no additional charge.

For example, four 7-foot trees with planting cost **MYR 594.00**: MYR 396.00 for the trees plus MYR 198.00 for planting.

## Run locally

Use **Node.js 22.13 or later** and npm.

```sh
git clone https://github.com/abdullahwarrg-png/blue-tree-mango.git
cd blue-tree-mango
npm ci
npm start
```

Scan the QR code with an Expo Go version supporting SDK 58. Keep your phone and computer on the same network.

To launch the browser version:

```sh
npm run web
```

To export the web app:

```sh
npm run build:web
```

The exported files are saved in `dist/`. Pushes to `main` automatically deploy the demo to GitHub Pages.

