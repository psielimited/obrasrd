

## Fix Broken Provider Images in Database

### Problem
The 8 seeded providers in the database use `source.unsplash.com` URLs (e.g. `https://source.unsplash.com/1200x800/?architecture,blueprint,house&sig=101`). This service is **deprecated and unreliable** — images either fail to load or show random/irrelevant content. This is what shows as broken/placeholder images on provider profile pages.

### Solution
Create a new database migration that updates `portfolio_images` for all 8 seeded providers with direct, stable `images.unsplash.com` photo URLs — the same approach used for the mock data in `marketplace.ts`.

### Image Mapping (same disciplines as before)

| Provider UUID suffix | Trade | Images |
|---|---|---|
| ...001 | Arquitecto | Architectural designs, modern houses |
| ...002 | Ingeniero Estructural | Steel/concrete frameworks |
| ...003 | Contratista General | Construction sites, villas |
| ...004 | Electricista | Electrical panels, wiring |
| ...005 | Plomero | Plumbing installations |
| ...006 | Pintor | Interior painting, walls |
| ...007 | Excavación | Excavators, earthwork |
| ...008 | Paneles Solares | Solar panel installations |

### Changes
**One new SQL migration** — `UPDATE providers SET portfolio_images = ...` for each of the 8 UUIDs, using stable `images.unsplash.com/photo-{id}?w=1200&q=80` URLs (3 per provider). No code file changes needed.

