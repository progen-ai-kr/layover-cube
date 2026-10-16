# 여권 장식 이미지 생성 내역

2026-10-16, OpenAI image generation 도구. 사용자가 제공한 LUMINO 전체 참고 보드를 스타일 참고로 사용했습니다. 생성물은 브랜드 실물 사진이 아닌 웹사이트용 장식 이미지입니다. 이미지에는 읽을 수 있는 글자·스탬프·버튼을 넣지 않았습니다. 실제 내용과 상호작용은 HTML로 구현합니다.

원본 폴더: `/Users/suhun/.codex-orca/generated_images/01a13e59-0602-7523-925f-03d53f8f2416/`

| 배포 자산 | 원본 | 용도 |
|---|---|---|
| `lumino-passport-page.webp` | `exec-6a6cb6d5-a984-451d-9e74-a3bb0fb0b383.png` | 핑크 가죽 표지, 제본, 빈 편지지 한 장, 리본과 장미 장식 |
| `lumino-passport-spread.webp` | `exec-f2c1c100-3641-4661-a652-9857bd9ba855.png` | 두 페이지가 펼쳐진 완료 여권 |
| `lumino-passport-cover.webp` | `exec-d50d8fa5-174c-4b05-ab06-f6759b1b502b.png` | 우측 하단의 작은 가죽 여권 버튼 |

## 생성 지시 내용

공통: 참고 보드의 Pink Coquette, romantic vintage stationery, warm ivory paper, rose-pink leather, champagne gold embossing, satin ribbon, rose wax crown seal, pearls, tiny roses를 유지. 정면에 가까운 제품 사진. 배경 투명. 이미지에 UI, 글자, 숫자, 스탬프, 워터마크 제외.

단일 여권: 세로 구도. 왼쪽은 핑크 가죽 표지와 제본, 오른쪽은 장식 테두리만 있는 큰 빈 아이보리 종이. 중앙은 HTML 스탬프와 진행률을 위한 빈 공간. 장미·리본·인장은 왼쪽 아래에만 배치.

펼친 여권: 가로 3:2 구도. 두 개의 빈 아이보리 페이지가 중앙 제본을 기준으로 펼쳐진 핑크 가죽 책. 왼쪽 페이지에는 실제 스탬프를, 오른쪽에는 실제 축하 문구를 배치할 여백. 새틴 리본과 인장은 오른쪽 아래, 작은 장미는 왼쪽 아래.

닫힌 표지: 작은 세로 가죽 여권. 핑크 가죽, 섬세한 금색 이중 테두리와 왕관 엠보싱. 작은 리본과 진주. 배경 투명, 표지 글자 제외.

원본은 종횡비를 유지하여 리사이즈하고 WebP로 변환했습니다. 편집 가능한 초대장 레이어는 [INVITATION_SOURCES.md](INVITATION_SOURCES.md)에 따로 기록했습니다.
