

## Export Full Source Code as ZIP

I'll collect all project source files and package them into a downloadable ZIP file at `/mnt/documents/`.

### Steps
1. Read all source files (pages, components, hooks, styles, configs)
2. Write a script that assembles them into a ZIP archive
3. Output to `/mnt/documents/robertocon-source.zip`

### Files to include
- All `src/` files (pages, components, hooks, styles, utils)
- Config files (`vite.config.ts`, `tailwind.config.ts`, `tsconfig*.json`, `package.json`, etc.)
- `index.html`, `postcss.config.js`, `components.json`
- Public assets (`public/`)

