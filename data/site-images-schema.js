import { siteImageSlots } from './site-image-slots.js';

// 업로드된 같은 사이트의 파일만 허용해 HTML 삽입과 카드 내보내기 CORS 오류를 방지합니다.
export function normalizeSiteImages(value) {
  if (!value || value.version !== 1 || !value.images || typeof value.images !== 'object' || Array.isArray(value.images)) {
    throw new Error('사이트 이미지 설정 형식이 올바르지 않습니다.');
  }
  const ids = new Set(siteImageSlots.map(slot => slot.id));
  const images = {};
  for (const [id, path] of Object.entries(value.images)) {
    if (!ids.has(id) || typeof path !== 'string' || !/^images\/site\/[a-z0-9-]+\.(?:png|jpg|webp|gif|avif)$/.test(path)) {
      throw new Error('지원하지 않는 이미지 위치 또는 이미지 주소입니다.');
    }
    images[id] = path;
  }
  return { version: 1, images };
}
