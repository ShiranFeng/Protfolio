# 撕纸脑洞动画 — head asset

Built-in image_gen used. Selected source: user-supplied nine-panel painted portrait, center panel. Generated interpretation; not a pixel-exact extraction.

Final asset: torn-paper-head-dark.png. Opaque dark-background draft; NOT an alpha-transparent PNG. Two transparency attempts produced baked checkerboards, so the selected output uses the site's secondary dark color instead. Keep this limitation visible when replacing or reusing the asset.

## Initial prompt

Use case: background-extraction. Asset type: transparent PNG head cutout for a portfolio scroll animation named torn-paper imagination. Input: the user's attached 3x3 grid of painted portraits is the edit target. Extract ONLY the CENTER portrait (row 2 column 2, eyes looking straight forward). Preserve this exact person's facial identity, expression, hair silhouette, vivid brush strokes and original painted colors. Keep only the full hair/head, ears, and a short portion of the neck; remove shoulders, shirt and all colorful background. Add an opaque warm-white paper border around the head, narrow and irregular around hair and ears and wider with jagged torn paper fibers below the neck, like a hand-torn illustration cut from a printed sheet. This is a paper cutout, not a physical wound: face and head remain fully intact. Isolate one upright centered head on a genuinely transparent alpha background, with modest transparent padding and no checkerboard painted into image. No brain, clouds, bubbles, text, extra objects, shadows outside the paper, or duplicate portraits. Output one high quality transparent PNG asset.

## Transparency correction attempt

Edit this exact head cutout image. Keep the head, painted face, hair and irregular white torn-paper border unchanged. REMOVE the entire gray checkerboard surrounding the cutout and its ghost outlines. Output an RGBA PNG with actual alpha=0 outside the white paper outline, including corners. The checkerboard in the input is unwanted painted background, not transparency; do not reproduce it. Actual transparent pixels are essential for a website asset. No new background, no checkerboard, no additional objects.

## Final prompt

Edit the supplied portrait cutout. Preserve the painted head and irregular white torn-paper border exactly. Replace ALL gray checkerboard background and ghost shapes outside the white paper with a completely flat solid dark navy background HEX #0c1821 (RGB 12,24,33). No checkerboard anywhere. No gradient, texture, lighting or shadow in the background. Single centered upright head, original framing and dimensions. No text, no new objects. This is an opaque website asset designed to match a #0c1821 section.

