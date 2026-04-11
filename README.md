# Fumount Headless Storefront

This repository contains the Hydrogen storefront for the **Fumount Shopify account** (`fumount.com`).

## About Fumount

Fumount is a luxury incense brand rooted in Eastern wisdom and designed for modern ritual living.  
The brand focuses on premium botanicals, small-batch craftsmanship, and calm, refined sensory experiences.

## Live URL

Current accessible storefront URL:

- [https://fumount-0ef55f8c404167a921f4.o2.myshopify.dev/](https://fumount-0ef55f8c404167a921f4.o2.myshopify.dev/)

## Tech Stack

- Shopify Hydrogen
- React Router
- Shopify Storefront API
- Shopify Oxygen
- Tailwind CSS
- TypeScript

## Local Development

### Requirements

- Node.js 22+ (or compatible with project engines)
- npm
- Shopify CLI access to the Fumount store

### Install dependencies

```bash
npm install
```

### Run locally (recommended)

Use this if `npm run dev` gets stuck on codegen:

```bash
npx shopify hydrogen dev
```

### Run locally (project script)

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to Shopify Oxygen

Manual deploy:

```bash
npx shopify hydrogen deploy
```

Typical production workflow:

1. Commit and push changes to the production branch (usually `main`).
2. If GitHub auto-deploy is connected in the Shopify Hydrogen channel, Oxygen deploys automatically.
3. Otherwise, run `npx shopify hydrogen deploy` manually.

## Customer Account API Notes

If you use `/account` routes, complete the Customer Account API setup:

- <https://shopify.dev/docs/custom-storefronts/building-with-the-customer-account-api/hydrogen#step-1-set-up-a-public-domain-for-local-development>
