import { siteImageSlots } from '../data/site-image-slots.js';
import { normalizeSiteImages } from '../data/site-images-schema.js';

let overrides = {};
// 데이터가 늦거나 저장소가 일시적으로 응답하지 않아도 기본 이미지로 여행을 시작합니다.
if (typeof window !== 'undefined') {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch('/site-images.json', { cache: 'no-store', signal: controller.signal });
    if (response.ok) overrides = normalizeSiteImages(await response.json()).images;
  } catch (_) { /* 최초 배포 또는 연결 실패 시 기본 자산을 사용합니다. */ }
  finally { clearTimeout(timer); }
}

const bySource = new Map(siteImageSlots.filter(slot => slot.defaultSrc).map(slot => [slot.defaultSrc, slot]));
export const customImage = id => overrides[id] || '';
export const asset = source => overrides[bySource.get(source)?.id] || source;

export function applySiteImages(root = document) {
  root.querySelectorAll('[data-site-image]').forEach(element => {
    const source = asset(element.dataset.siteImage);
    element.setAttribute(element.tagName === 'LINK' ? 'href' : 'src', source);
    if (element.tagName === 'LINK' && source !== element.dataset.siteImage) {
      element.type = ({ png:'image/png', jpg:'image/jpeg', webp:'image/webp', gif:'image/gif', avif:'image/avif' })[source.split('.').pop()] || 'image/png';
    }
  });
  for (const slot of siteImageSlots) {
    if (overrides[slot.id]) document.documentElement.style.setProperty(`--site-image-${slot.id}`, `url("/${overrides[slot.id]}")`);
  }
}
