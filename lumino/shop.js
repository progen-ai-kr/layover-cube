// 운영 상품은 기존 catalog.js의 안전한 공개 로더를 그대로 사용합니다.
let catalogReady;
let productsPromise;
function catalog() {
  if (window.ProductCatalog) return Promise.resolve(window.ProductCatalog);
  if (!catalogReady) catalogReady = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'catalog.js?v=20260826-rich-editor-1';
    script.onload = () => resolve(window.ProductCatalog);
    script.onerror = () => { catalogReady = null; script.remove(); reject(new Error('상품을 불러오지 못했어요.')); };
    document.head.append(script);
  });
  return catalogReady;
}
export function loadProductLooks() {
  if (!productsPromise) productsPromise = catalog().then(async api => {
    const products = await api.loadVisibleProducts();
    return products.map(product => ({
      id: `product:${product.id}`, productId: product.id,
      title: product.name, description: product.summary || '',
      image: api.safeImageUrl(product.images?.[0]) || 'images/lumino-hero.jpg',
      category: product.category || product.label || 'COLLECTION',
      href: `product.html?id=${encodeURIComponent(product.id)}`
    }));
  }).catch(error => { productsPromise = null; throw error; });
  return productsPromise;
}
