// 이름·미션·이동 위치는 여권, 홈 여행 지도, 각 페이지 안내에서 함께 사용합니다.
// 획득 여부는 lumino/state.js가 실제 행동 기록에서 계산합니다.
export const stamps = [
  {
    id: 'travel', name: 'TRAVEL', icon: 'plane', chapter: 'home', color: 'rose',
    title: '여행의 시작', location: 'HOME · 초대장', target: '', actionLabel: '초대장 열기',
    steps: ['초대장을 열어 여행을 시작하세요.', 'SKIP INTRO를 눌러도 받을 수 있어요.'],
    condition: '초대장 열기 또는 SKIP INTRO 선택',
    message: 'Welcome to LUMINO! TRAVEL 스탬프를 여권에 찍었어요.'
  },
  {
    id: 'romance', name: 'ROMANCE', icon: 'crown', chapter: 'collection', color: 'rose',
    title: '마음에 드는 한 벌', location: 'COLLECTION · 상품과 화보', target: '#all-products', actionLabel: '의상 고르러 가기',
    steps: ['마음에 드는 상품이나 컬렉션 화보를 열어요.', '상세 화면의 ♡ MY FAVORITE를 누르세요.'],
    condition: '상품·화보 상세에서 MY FAVORITE 누르기',
    message: '마음을 설레게 하는 한 벌! ROMANCE 스탬프를 찍었어요.'
  },
  {
    id: 'fantasy', name: 'FANTASY', icon: 'castle', chapter: 'gallery', color: 'blue',
    title: '간직하고 싶은 장면', location: 'GALLERY · 스크랩북', target: '#gallery', actionLabel: '사진 고르러 가기',
    steps: ['갤러리에서 좋아하는 사진 한 장을 열어요.', '상세 화면의 ‘이 장면 저장하기’를 누르세요.'],
    condition: '사진 상세에서 ‘이 장면 저장하기’ 누르기',
    message: '나만의 판타지 순간! FANTASY 스탬프를 찍었어요.'
  },
  {
    id: 'cute', name: 'CUTE', icon: 'bow', chapter: 'story', color: 'rose',
    title: '리본 속 작은 비밀', location: 'OUR STORY · 브랜드 편지', target: '#story', actionLabel: '브랜드 편지 읽기',
    steps: ['루미노가 보낸 브랜드 편지를 읽어보세요.', '편지 맨 아래의 핑크 리본을 눌러 풀어주세요.'],
    condition: '브랜드 편지를 읽고 마지막 리본 누르기',
    message: '사랑스러운 비밀을 발견했어요! CUTE 스탬프를 찍었어요.'
  },
  {
    id: 'luxury', name: 'LUXURY', icon: 'diamond', chapter: 'journey', color: 'gold',
    title: '나만의 여행 취향', location: 'YOUR JOURNEY · 취향 선택', target: '#journey', actionLabel: '여행 취향 선택하기',
    steps: ['여행지 · 분위기 · 아이템, 세 질문에 답해요.', '마지막 ‘나의 여행 스타일 완성’을 누르세요.'],
    condition: '세 질문에 답하고 ‘나의 여행 스타일 완성’ 누르기',
    message: '당신만의 여행 스타일 완성! LUXURY 스탬프를 찍었어요.'
  }
];
