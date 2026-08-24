# Change Summary — right-side clipping, carousel centring, desktop swipe — 24 Aug 2026

## Files Modified
- `zeronine/assets/css/main.css` — replaced every bare `1fr` grid track with `minmax(0, 1fr)` (the cause of the clipping); `min-width: 0` and centring on the carousel; slides snap to `start`; drag state; arrow-button layout for pointer devices; rail arrows hidden on touch
- `zeronine/assets/css/admin.css` — same `1fr` → `minmax(0, 1fr)` correction
- `zeronine/assets/js/pages.js` — same correction in the injected recipe-row rule
- `zeronine/index.html` — previous/next arrow buttons added to the carousel
- `zeronine/assets/js/home.js` — mouse drag, arrow buttons and wheel support for the carousel
- `zeronine/README.md` — documented the `1fr` rule and the desktop carousel controls

## Notes

### Why the right side was being cut

`grid-template-columns: 1fr` is shorthand for `minmax(auto, 1fr)`. The `auto`
minimum means the track can never be narrower than its content's **min-content**
width — and a horizontally-scrolling flex row reports a min-content of *all* its
children laid end to end.

So on mobile, where the hero collapses to a single `1fr` column, the carousel's
four full-width slides forced that column to roughly four screens wide.
Everything sharing the column — the headline, the lead paragraph, the diet
finder — inherited that width and ran off the right edge.

Last round's `overflow-x: clip` stopped the page *scrolling* sideways, which is
why the symptom changed from "loads offset" to "cut off with no way to see it".
The clip was treating the symptom; this is the cause.

Fixed by using `minmax(0, 1fr)` everywhere, plus `min-width: 0` on the carousel
itself. Every bare `1fr` in the project is gone, including three in the admin
stylesheet that would have caused the same thing there.

### Carousel centring

`.deck` now has `min-width: 0` alongside its `max-width: 460px` and
`margin-inline: auto`, so it sizes to its column and centres in it. Slides also
changed from `scroll-snap-align: center` to `start` — with a gap between slides
the last one can never reach the centre, so it could never settle.

### Swipe on desktop

A desktop has no swipe gesture. Pointer devices now get three ways in:

- **Arrow buttons** beside the progress segments, shown only on devices with a
  real pointer (the swipe hint shows on touch instead).
- **Grab and drag** with the mouse — snapping and smooth scrolling are disabled
  mid-drag so they don't fight the pointer, and the click that follows a real
  drag is swallowed so releasing over a card doesn't open it.
- **Wheel** — a vertical wheel delta moves one slide, throttled. A trackpad's
  horizontal scroll already worked natively and is left alone.

Also: the rail arrows on "Best sellers" are now hidden on touch devices, where
they were taking up space for a gesture that already works.

### Testing done

- Public suite now 100 assertions, admin 73. Both passing, both re-run against the delivered copy.
- New coverage: arrow buttons advance and wrap in both directions; a simulated mouse drag sets and clears the dragging state without error; a click after a drag is suppressed rather than opening the card.
- jsdom has no layout engine, so the clipping bug is pinned by a rule-level guard that scans both stylesheets and the injected CSS and **fails if a bare `1fr` grid track reappears anywhere**. Also asserted: the mobile hero column uses `minmax(0, 1fr)`, the carousel has `min-width: 0` and `margin-inline: auto`, slides snap to `start`, and dragging disables snapping.

### Still worth a look on the phone

The layout fixes are verified by rule, not by rendering — I can't lay out a page here. This one I'm confident about because the mechanism is well understood and matches all three screenshots exactly, but it's worth a quick check before the client sees it.
