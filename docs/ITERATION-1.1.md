# v1.1 Iteration Notes

## Summary

v1.1 is the first structured UI iteration of the Vercel session edition.
This release focuses on editing efficiency, page navigation clarity, and a cleaner studio layout while keeping the browser-only export model unchanged.

## What Changed

### 1. Left Sidebar Restructure

- Moved quick skin presets above page thumbnails for faster theme switching.
- Upgraded page thumbnails from number-only placeholders to actual scaled page previews.
- Improved selected-page visibility and thumbnail interaction feedback.

### 2. Page-to-Editor Navigation

- Added page anchor metadata during pagination.
- Clicking a left-side page thumbnail now targets the corresponding editor content instead of only switching the preview page.
- Improved scroll targeting for long paragraphs that span multiple exported pages.

### 3. Right Panel Reorganization

- Consolidated preview, templates, and adjustment tools into a tabbed right-side panel.
- Reduced panel nesting and made preview browsing more compact.
- Kept page download actions directly accessible in preview mode.

### 4. Editor Toolbar Refresh

- Simplified the top toolbar structure.
- Reworked formatting controls into a denser, faster inline layout.
- Improved image insertion, upload feedback, and image-size controls.

### 5. Visual Polish

- Refined the overall palette, spacing, borders, and shadows.
- Improved sidebar hierarchy and surface consistency.
- Tightened the session-edition layout for better desktop readability.

## Compatibility

- Still session-based: content remains in the current tab and resets on refresh.
- Still browser-export based: no database, no Playwright, no server-side file persistence.
- Existing natural-language commands, pagination, compliance checks, and suggestion generation remain available.

## Validation

- `npm run typecheck`

## Files Touched

- `app/page.tsx`
- `app/globals.css`
- `components/PagePreview.tsx`
- `components/RichEditor.tsx`
- `lib/paginate.ts`
- `lib/types.ts`
