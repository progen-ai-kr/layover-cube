// 챕터마다 독립된 주소를 사용합니다. 기존 상품·상세·룩북 주소도 유지합니다.
export const pages = {
  home: { href: 'index.html', label: 'HOME' },
  collection: { href: 'products.html', label: 'COLLECTION' },
  gallery: { href: 'gallery.html', label: 'GALLERY' },
  journey: { href: 'journey.html', label: 'YOUR JOURNEY' },
  story: { href: 'about.html', label: 'OUR STORY' }
};
export const pageHref = id => pages[id]?.href || pages.home.href;
export function currentChapter(pathname) {
  const file = pathname.split('/').pop().replace(/\.html$/, '') || 'index';
  return ({ index: 'home', products: 'collection', product: 'collection', gallery: 'gallery', portfolio: 'gallery', journey: 'journey', about: 'story' })[file] || null;
}
