Do NOT build the project until explicitly told to do so.
here are the scripts in package.json:
```json
  "scripts": {
    "dev": "tsx --watch .",
    "db:generate": "drizzle-kit generate --out=./src/db/migrations",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "db:seed": "tsx ./src/db/seed.ts",
    "lint": "biome check",
    "lint:fix": "biome check --write"
  },
```
use lint:fix where possible, instead of manually fixing formatting errors.
