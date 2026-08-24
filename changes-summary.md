# Change Summary — 3D hero rebuild — 24 Aug 2026

## Files Modified
- `zeronine/assets/js/bottle3d.js` — renderer rebuilt: perspective-correct label curvature, knurled cap, reflection, reworked lighting, new silhouette profiles, and a ~35% faster draw loop
- `zeronine/README.md` — rewrote the section explaining how the rotating product works

## Notes

**What was wrong.** It read as flat vector art. The label's top and bottom edges were straight horizontal lines, which on a cylinder they never are — that was the main tell. The bottle silhouette was also wrong: a straight-taper shoulder that read as a funnel, and a body too wide for its height.

**What changed**

- *Label curvature.* The view is tilted slightly downward, so a horizontal circle on the cylinder projects to an ellipse: a point at angle θ sits `Ez·cos θ` lower on screen, near side low and far side high. That offset is now applied per label column, so the band bows. The label's own top and bottom edges are drawn as elliptical arcs with a lit near lip.
- *Silhouette.* The bottle shoulder is now tangent to the neck at the top and to the body at the bottom, over a short span — stretch that span and the middle goes straight, which is what made it a funnel. Body narrowed, neck shortened, base given a chamfer and a rounded rim.
- *Cap.* Vertical knurling placed on the same angle as the label, so the ribs travel round as it turns. Plus a shaded top face.
- *Lighting.* Ten-stop glass gradient with a core specular streak and a rim light off the back edge; vertical falloff, brighter at the shoulder and darker at the base; occlusion into both edges; a lit front arc on the base rim.
- *Grounding.* Soft radial contact shadow, tight and dark under the base, plus a flipped reflection that fades out below.

**Performance.** Frame time went from 33 ms to 21 ms measured on a software rasteriser with no GPU — browsers composite these on the GPU so the real figure is far lower, but 33 ms was too close to the line to leave. Gradients are now built once instead of six per frame, label columns dropped from 220 to 168, and only the box the bottle occupies is composited rather than the whole canvas.

**A bug found while doing this:** the reflection transform mapped the base to `2·base` instead of `1.42·base`, so the reflection was being drawn far below the bottle and was almost invisible. Fixed.

**Testing done**
- Rendered to PNG and inspected five times through the rework — thumbnails hid the problems, so the last few passes were at full size, which is where the funnel shoulder and the hard-edged specular became obvious.
- All three shapes checked at several rotations after every change.
- Both suites (66 and 73 assertions) passing, and re-run against the delivered copy. The canvas stub in the public suite gained `translate`, `scale`, `rect`, `arc` and `createRadialGradient` to cover the new drawing calls.
