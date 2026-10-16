# LUMINO 전체 디자인 — 2026-10-16

사용자가 제공한 메인 화면 시안을 구도·색감 기준으로 사용했습니다. 생성 도구는 내장 `image_gen.imagegen`입니다. 원본은 Codex 생성 이미지 폴더에 보존하고, 웹 자산은 cwebp 품질 86으로 형식만 최적화했습니다.

| 자산 | 역할 | 웹 파일 용량 |
| --- | --- | --- |
| [lumino-world-hero.webp](lumino-world-hero.webp) | 메인 화보, 판타지 갤러리, 성 여행지 | 약 298 KB |
| [lumino-world-paper.webp](lumino-world-paper.webp) | 장미·새틴·진주로 둘러싸인 빈 편지지 배경 | 약 247 KB |
| [lumino-world-atelier.webp](lumino-world-atelier.webp) | 브랜드 스토리의 정원과 아틀리에 | 약 407 KB |

메뉴·로고·문구·버튼·상품 정보·스탬프는 HTML/SVG UI입니다. 위 이미지는 텍스트와 UI가 없는 화보와 장식입니다. 운영 상품 사진과 정보는 기존 관리자 데이터를 사용합니다.

## 생성 프롬프트

### 메인 화보

Use case: ads-marketing. Create a polished photorealistic romantic fashion campaign BACKGROUND ASSET for the existing LUMINO website, using the attached small website image solely as the precise composition and color reference. This is the image beneath real HTML UI; DO NOT draw any letters, logo, typography, words, buttons, navigation, border frames, watermarks or mockup UI. Landscape 16:9, ideally 2048x1152. Match reference: luminous strawberry pastel pink and rosy satin, bright coquette editorial, lush clouds and intricate fairytale castle with golden lavender spires centered around x58%, beautiful lake below. An adult East Asian fashion model wearing a jeweled tiara and a vivid pink off-shoulder ruffled silk princess gown fills the RIGHT third: head near x77% y31%, looking softly up and back to camera, torso through x75% y70%, generous layered pink skirt flowing across the bottom right. Left middle (x14-44%, y20-58%) is delicately lit soft pale PINK cloud sky where the HTML logo and slogan will be placed, softly detailed but still legible as a background; not a white blank panel. The castle rises behind the woman but its taller spires remain visible nearer center. Rich pink rose blossoms and cherry blossoms frame the far LEFT edge and the BOTTOM edge, with pearls, pale ribbons and a pink satin drape at the far top left. Small blue airplane in upper right sky. Tiny delicate stars and highlights. Depth and visual abundance like the reference, beautiful romantic collage landscape with a realistic fashion photography subject. Color MUST be clear rose pink and candy pink, not beige/sepia. No large barren landscape, no mountains dominating the left, no giant isolated flower, no readable text or false website elements. Match the visual balance of the attached reference closely while rendering at high resolution.

### 편지지

Use case: product-mockup. Asset: decorative stationery background for a romantic fashion brand's REAL HTML scrapbook pages. Create a high-resolution landscape 3:2 top-down photograph of a blush pink satin writing desk covered with a single large warm ivory softly textured paper sheet. Center 76% of the frame must be clean lightly textured ivory with NO text, symbols, logos, headings or fake interface. Delicate antique rose gold floral engraved borders around the edges of the ivory sheet. Only in the outer 12% around the left/right/top/bottom edges: small vivid pink garden roses, pale pink cherry blossoms, a loose pearl strand, an intact pink satin bow at the upper right and another soft pink ribbon crossing bottom left. Beautiful tactile layering and subtle soft shadows, coquette vintage scrapbook like the visual reference's palette. Bright rosy pink, cream and soft champagne gold, romantic daylight. Elegant balanced corner details; do not crowd or obscure the large blank central sheet. No people, no dress, no writing, no watermark, no UI. Actual photographic materials not flat vector.

### 아틀리에

Use case: photorealistic-natural. Asset: portrait editorial photograph for the OUR STORY page of LUMINO, romantic pink coquette fashion travel fantasy brand. Vertical 3:4 composition. A dreamy Victorian conservatory and intimate atelier decorated with abundant blush and vivid rose pink garden roses, satin bows, small pearls, gilded mirrors, pale pink fabric curtains, pale cream carved vintage furniture, gentle crystal chandelier; an ornate tall arched doorway in the CENTER opens to a dreamy fairytale castle garden in the distance at golden pink hour. A small pink dress on a vintage mannequin at the left edge as a subtle fashion hint. A round tiny table with a cream blank letter, a pink silk ribbon, and a vase of roses in the foreground. Warm luxurious fashion editorial photograph with atmospheric sunlight and clear pink tones, depth of field, rich detail. Flower garlands curl around the arch and edges, like a secret romantic garden in the given brand reference. No people, no readable words, no letters, no logos, no watermarks, no UI. Match the reference pink palette; avoid beige monochrome, blue dominant dresses, corporate/minimal decor.
