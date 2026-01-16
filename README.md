# Raindrop Suggest Proxy

A Cloudflare Worker that provides OpenSearch suggestions from your Raindrop.io bookmarks for use in browser address bars.

## Setup

### 1. Get your Raindrop API token

1. Go to https://app.raindrop.io/settings/integrations
2. Scroll to "For Developers" → Create new app
3. Copy the "Test token"

### 2. Install dependencies

```bash
npm install
```

### 3. Login to Cloudflare

```bash
npx wrangler login
```

### 4. Set your Raindrop token as a secret

```bash
npx wrangler secret put RAINDROP_TOKEN
```

Paste your token when prompted.

### 5. Deploy

```bash
npm run deploy
```

This will output your Worker URL, something like:
```
https://raindrop-suggest.<your-subdomain>.workers.dev
```

## Configure Vivaldi/Chrome

### Vivaldi

1. Settings → Search → Search Engines → Add New
2. Configure:
   - **Name:** Raindrop
   - **Nickname:** `rd` (or another keyword)
   - **URL:** `https://app.raindrop.io/my/0?q=%s`
   - **Suggest URL:** `https://raindrop-suggest.<your-subdomain>.workers.dev/suggest?q=%s`

### Chrome

1. Settings → Search engine → Manage search engines → Add
2. Configure:
   - **Search engine:** Raindrop
   - **Shortcut:** `rd`
   - **URL:** `https://app.raindrop.io/my/0?q=%s`
   - **Suggestions URL:** `https://raindrop-suggest.<your-subdomain>.workers.dev/suggest?q=%s`

## Usage

Type `rd ` (with space) followed by your search query in the address bar. Suggestions from your Raindrop bookmarks will appear.

## Local development

```bash
npm run dev
```

This starts a local server at `http://localhost:8787` for testing.
