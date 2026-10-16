## 초대장 오프닝 재작업 · 2026-10-15

내장 `image_gen` 도구를 사용했습니다. 사용자가 제공한 초대장 참고 이미지의 소재·구도를 참고해 생성했습니다. 이미지에는 글자나 UI를 넣지 않았으며, 로고·문구·버튼은 실제 HTML입니다. 원본 PNG를 WebP로 포맷 변환해 사용하며 세 장을 합쳐 약 940 KB입니다.

### images/lumino-invitation-closed.webp

Use case: product-mockup. Asset type: photographic background for a working LUMINO website invitation opening, square 1536 x 1536.
Input image is a visual style/composition reference only: recreate the exquisite pink invitation in the FIRST PANEL, not the screenshot or infographic.
Create a single full-frame luxury romantic stationery still-life, exquisitely photorealistic. An upright blush-pink textured envelope centered, straight-on camera, surrounded by abundant soft pink roses, tiny blossoms, pearls, blush satin drapery, and warm sparkling chandelier bokeh. Close framing: envelope occupies x=19%..81%, y=14%..85%. Envelope front faces camera flat, horizontal top and bottom, so HTML text can later be overlaid. Large sumptuous glossy pink silk satin bow tied horizontally across the center, flowing ribbon tails, a real rose-pink wax seal with fine gold crown embossing at its knot. Reference level of tactile embroidered paper, creased silk, rich highlights, beautiful soft shadows, dreamy soft luxury, warm rose-pink and cream palette.
Upper triangular envelope flap: leave a large clean pink blank surface ABOVE the bow (roughly x35..65%, y21..35%) for a real HTML logo later. Lower portion: an ornate ivory stationery panel partially revealed underneath the ribbon, with delicate embossed champagne-pink floral border, flat front facing camera, clean BLANK center roughly x29..71%, y62..81% for HTML invitation text and real button.
NO text, NO letters, NO logos, NO typography, NO buttons, NO UI, NO collage/panels, NO screenshot borders. Crown on wax seal is the only emblem. Make a beautiful believable photo, not an illustration or flat vector. Keep generous scene surroundings outside the envelope for responsive cropping.

### images/lumino-invitation-untied.webp

Use case: precise-object-edit. Asset type: middle animation frame for website invitation opening.
Input 1 is the edit target: closed invitation photo. Input 2 shows the eventual open state for continuity only.
Keep EXACT camera, envelope location, roses, pearls, table, background and warm pink photographic lighting from Input 1. This is the moment the bow comes undone BEFORE the envelope opens: upper pink triangular flap remains closed in same location, lower small ivory decorated address panel remains in its original position, no tall card yet. ONLY change the large satin bow: its knot has loosened and two large satin loops flow out toward left and right, a long silk tail curls downward. The crown wax seal has detached and is moving downward toward bottom-right, near x68% y67%. No central knot covering the closed envelope. Preserve exquisite glossy realistic satin. Tiny subtle sparkling stars around the loose ribbon. The shot must align perfectly with input 1 for a dissolve. NO text, letters, logos, buttons, UI. Single square photorealistic image.

### images/lumino-invitation-open.webp

Use case: precise-object-edit. Asset type: second frame of a photographic invitation-opening website animation.
Edit target: supplied pink invitation photo. Keep the EXACT same square camera, roses, satin table, pearl necklace, bokeh chandeliers, lighting, pink palette, envelope horizontal position and size. Change ONLY the envelope's opening state: untie its large central bow, silk tails now drape loosely to either side and along the lower corners, wax crown seal rests at bottom right near the envelope. The pink flap has opened backward. A tall ornate ivory invitation card now rises out of the pink envelope, front-facing and perfectly upright, from x=28% to72%, y=13% to73%; lower part remains inside the pocket. Card is flat creamy paper with an exquisitely thin pink/champagne embossed rococo floral border all around, leave its central region completely BLANK, unobstructed, generous space for HTML text. Pink envelope pocket fills roughly y=64..82%, with loosened satin tails around its bottom. Keep other scene geometry and flowers as close to original as possible for an aligned crossfade. Photoreal fine paper embossing, silk gloss, tiny magical sparkles. NO text, NO letters, NO logos, NO typography, NO buttons, NO UI. Crown embossed on the displaced wax seal can remain. Output single square photo at same dimensions.

## 2026-10-16 · 한 장면에서 움직이는 초대장

세 장의 전체 사진을 교체하던 방식을 없애고 고정 배경과 투명 부품을 사용합니다. 글자와 버튼은 모두 HTML입니다. 아래 네 파일은 built-in `image_gen` 도구의 편집 모드로 생성하고 원본 알파를 보존해 WebP로 변환했습니다. 원본 3장도 삭제하지 않았습니다.

- `images/lumino-invitation-scene-v2.webp`: 장미·진주 배경과 비어 있는 봉투. 재생 내내 같은 사진입니다. 앞면도 이 사진을 CSS로 가려 재사용합니다.
- `images/lumino-invitation-flap-v2.webp`: 투명 배경의 엠보싱 핑크 덮개. 실제 접힌 선을 축으로 앞·뒷면을 회전합니다.
- `images/lumino-invitation-ribbon-v2.webp`: 투명 배경의 새틴 리본과 왕관 인장. 이미지 전체를 한 요소로 표시하며, 리본과 인장이 함께 이동합니다. 좌우 분할 마스크나 별도 인장 레이어를 사용하지 않습니다.
- `images/lumino-invitation-paper-v2.webp`: 글자 없는 아이보리 장미 장식 편지지. 초대장, 여권, 여행 카드에 같은 재질을 사용합니다.

공통 참조: 기존 `lumino-invitation-closed.webp`, `lumino-invitation-open.webp`. 색·광원·장미·진주·실사 재질은 유지합니다.

### 사용한 프롬프트

1. **Scene — precise-object-edit**: Edit the reference photo. Keep its luxurious blush pink embossed paper, roses, pearls, satin tablecloth, crystal warm bokeh, camera, square framing and romantic lighting. Remove the letter, all ribbons, wax seal and upper flap. Show an empty upright pink envelope pocket, perfectly frontal, centered. Straight horizontal back edge; a deep V opening and dark rose paper interior. Above the envelope show only the softly blurred floral/crystal background. Realistic paper edges and tactile product photography. No text, logos, buttons, watermark or multiple states.
2. **Flap — background-extraction / precise-object-edit**: Isolate only one wide downward-pointing triangular envelope closing flap, made of the reference blush pink embossed floral paper. A straight horizontal hinge at the top, rounded bottom tip, frontal view. Rose flourishes at sides and quieter pink paper at center for real HTML logo. Remove ribbon, seal, body, text, flowers and background. Genuinely transparent outside the flap, no rectangle behind it and no cast shadow on a backdrop.
3. **Ribbon — background-extraction**: Extract the large rose pink satin ribbon bow with the attached central pink wax seal bearing the tiny gold crown. Retain photoreal satin sheen, folds and original lighting. Frontal symmetric loops, long loose tails extending down and out to both sides, fully inside a landscape canvas. Seal horizontally centered at 40% height. Remove paper, label, table, flowers, pearls and background. Genuine transparency, no opaque rectangle, no text, no watermark.
4. **Paper — precise-object-edit**: Extract and reproduce only the cream ivory card paper, full bleed, edges aligned with a square canvas. Flat front view, no perspective or rotation. Tactile ivory cotton paper with faint texture and delicate rose-gold embossed roses and filigree within the outer 12%. Center 70% blank for actual text. No envelope, ribbon, table, background, text, logo or outside shadow.

원본 생성 경로: `/Users/suhun/.codex-orca/generated_images/01a13e59-0602-7523-925f-03d53f8f2416/`의 `exec-c3389097-888e-40b4-bdb5-cfbe04fb1b5f.png`, `exec-a2866eed-d39a-4f4c-8334-455071bfaa29.png`, `exec-ed7f10c0-4048-4f55-a46e-4e4ce89fea4c.png`, `exec-e073cf85-a081-4a49-ada6-2e225c2d1dd2.png`.
