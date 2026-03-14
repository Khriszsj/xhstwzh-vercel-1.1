# v1.4 Iteration Notes

## Summary

v1.4 is a design-focused iteration centered on the template library and skin selection flow, expanding the page skin system so creators can switch faster between clean readability and stronger visual expression.

---

## What Changed

### 1. Page Skin Categorization

The template panel now separates page skins into "Simple" and "Ins" categories.
The quick-skin entry remains in the left sidebar, while the complete skin library stays in the right template panel.
Filtering continues to work together with search so presets remain easy to find as the library grows.

### 2. New Ins-Style Skin Presets

Several more expressive presets were added, including glassmorphism, scrapbook, and creamy collage-inspired styles.
These presets combine background, accent colors, and style metadata to create a more cohesive page mood.
They are especially suitable for covers, lifestyle content, and emotionally driven visual storytelling.

### 3. Template Card Browsing Refresh

Templates and skins continue to use card-based browsing, but the information hierarchy is now clearer.
Layout templates and page skins are presented separately to reduce accidental switches.
The selected state remains clearly highlighted, and changes apply immediately to preview and export output.

---

## Compatibility

- Still session-based: content remains in the current tab and resets on refresh.
- Export still runs in the browser with no database or server-side persistence.
- The editor, pagination, publishing assistant, and natural-language command features remain unchanged.

---

## Validation

- `npm run typecheck`

---

## Files Touched

- `README.md`
- `app/page.tsx`
- `components/PagePreview.tsx`
- `lib/presets.ts`
- `lib/types.ts`
