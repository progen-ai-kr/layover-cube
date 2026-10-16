import { worldArt } from './world.js';
// 이미지·제목·설명·카테고리를 이 파일에서 교체할 수 있습니다. 로컬 이미지를 권장합니다.
export const galleryCategories = ['ALL', 'FASHION', 'ACCESSORY', 'TRAVEL', 'DESSERT', 'BEHIND STORY'];
export const gallery = [
  { id: 'castle-dream', title: 'Once upon a pink dream', description: '분홍빛 구름 너머, 당신의 이야기가 시작되는 성. 오늘만큼은 동화 속 주인공이 되어보세요.', image: worldArt.hero, category: 'TRAVEL' },
  { id: 'ribbon-details', title: 'Love is in the details', description: '리본을 묶고, 레이스를 고르고, 작은 디테일에 마음을 담는 시간.', image: 'images/layover-craft-generated.webp', category: 'ACCESSORY' },
  { id: 'pink-moment', title: 'A dress to remember', description: '뒤돌아선 순간까지 사랑스럽게. 부드러운 프릴과 리본이 완성하는 핑크 데이드림.', image: 'images/layover-pink-back.jpg', category: 'FASHION' },
  { id: 'paris-letter', title: 'A little letter from Paris', description: '파리의 에펠탑 너머로 물드는 로즈빛 하늘. 사랑하는 장면을 엽서 한 장에 담아요.', image: 'images/lumino-paris.jpg', category: 'TRAVEL' },
  { id: 'sweet-afternoon', title: 'The sweetest afternoon', description: '분홍빛 마카롱과 따뜻한 차 한 잔. 달콤하고 느긋한 여행의 쉼표.', image: 'images/lumino-dessert.jpg', category: 'DESSERT' },
  { id: 'our-atelier', title: 'Behind the little magic', description: '옷 한 벌이 설렘이 되기까지. 우리의 상상이 모이는 포근한 아틀리에를 만나보세요.', image: worldArt.atelier, category: 'BEHIND STORY' }
];
