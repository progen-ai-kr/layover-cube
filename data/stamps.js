// 획득 여부는 lumino/state.js가 저장된 행동 기록에서 계산합니다.
export const stamps = [
  { id: 'travel', name: 'TRAVEL', icon: 'plane', chapter: 'home', condition: '초대장을 열거나 SKIP INTRO로 여행 시작하기', message: 'Welcome to LUMINO! 첫 번째 반짝이는 여행의 추억을 수집했어요.', color: 'rose' },
  { id: 'romance', name: 'ROMANCE', icon: 'crown', chapter: 'collection', condition: '컬렉션 상세에서 MY FAVORITE 선택하기', message: '당신의 마음을 설레게 하는 로맨스를 발견했어요!', color: 'rose' },
  { id: 'fantasy', name: 'FANTASY', icon: 'castle', chapter: 'gallery', condition: '갤러리 상세에서 마음에 드는 사진 저장하기', message: '당신만의 특별한 판타지 순간을 발견했어요!', color: 'blue' },
  { id: 'cute', name: 'CUTE', icon: 'bow', chapter: 'story', condition: '브랜드 이야기를 읽고 마지막 리본 발견하기', message: '루미노의 사랑스러운 비밀을 발견했어요!', color: 'rose' },
  { id: 'luxury', name: 'LUXURY', icon: 'diamond', chapter: 'journey', condition: '세 가지 취향 질문을 선택하고 여행 스타일 완성하기', message: '당신만의 반짝이는 여행 스타일을 완성했어요!', color: 'gold' }
];
