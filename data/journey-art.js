import { asset } from '../lumino/media.js';
import { worldArt } from './world.js';
// 질감과 장식만 담긴 이미지입니다. 로고, 도장, 문구, 버튼은 실제 UI로 표시합니다.
export const journeyArt = {
  passport: asset('images/lumino-passport-page.webp'),
  spread: asset('images/lumino-passport-spread.webp'),
  cover: asset('images/lumino-passport-cover.webp'),
  paper: asset('images/lumino-invitation-paper-v2.webp'),
  previews: {
    travel: asset('images/lumino-invitation-closed.webp'),
    romance: asset('images/layover-pink-front.jpg'),
    fantasy: worldArt.hero,
    cute: worldArt.atelier,
    luxury: asset('images/lumino-paris.jpg')
  }
};
