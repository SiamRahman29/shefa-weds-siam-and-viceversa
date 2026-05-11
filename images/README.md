# Images

Drop your **optimized** wedding photos in this folder. The HTML expects these exact filenames:

| Filename | Used for | Recommended size |
|---|---|---|
| `hero.jpg` + `hero.webp` | Big background photo behind the names | 1800–2000 px wide, < 300 KB |
| `photo-01.jpg` + `photo-01.webp` | First photo in the scrolling rolls | 800 px wide, < 80 KB |
| `photo-02.jpg` + `photo-02.webp` | Second roll photo | same |
| `photo-03.jpg` + `photo-03.webp` | Third roll photo | same |
| `photo-04.jpg` + `photo-04.webp` | Fourth roll photo | same |
| `photo-05.jpg` + `photo-05.webp` | Fifth roll photo | same |
| `photo-06.jpg` + `photo-06.webp` | Sixth roll photo | same |
| `photo-07.jpg` + `photo-07.webp` | Seventh roll photo | same |

Each photo needs **both** a `.jpg` (universal fallback) and a `.webp` (smaller, used by modern browsers).

## Don't optimize them by hand

Drop your raw photos (full resolution off your phone/camera, any names) into a folder
called `raw-photos/` at the project root, then run:

```powershell
npm install
npm run optimize
```

This resizes, compresses, and outputs both formats into this folder with the right names.
See `scripts/optimize-images.mjs` for details.

## Naming tips

- `hero.*` → the file containing "hero" gets the larger 1800px treatment.
- Anything else → resized to 800px wide.
- The script honors EXIF orientation, so portrait phone photos won't come out sideways.

## Sanity check

After optimization, the folder should total **under ~1.5 MB**. If it's larger, your raw
photos were huge and the script may need its quality settings tuned down (edit
`JPEG_QUALITY` / `WEBP_QUALITY` in the script).
