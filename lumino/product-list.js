// 상품 내용·노출 여부·상세 링크는 운영 데이터에서 불러옵니다.
const api = window.ProductCatalog;
const box = document.querySelector('#product-list');
const filters = document.querySelector('#product-filters');
const search = document.querySelector('#product-search');
const count = document.querySelector('#product-count');
let category = 'ALL';
let products = [];
const esc = api.escapeHtml;
function render() {
  const term = search.value.trim().toLocaleLowerCase();
  const items = products.filter(product => (category === 'ALL' || product.category === category) && `${product.name} ${product.summary || ''} ${(Array.isArray(product.keywords) ? product.keywords : []).join(' ')}`.toLocaleLowerCase().includes(term));
  count.textContent = `${items.length} ITEMS`;
  if (!items.length) {
    box.innerHTML = '<p class="portfolio-status">' + (products.length ? '조건에 맞는 상품이 없어요. 다른 카테고리나 검색어로 찾아보세요.' : '아직 공개된 상품이 없어요. 곧 만나요!') + '</p>';
    return;
  }
  box.innerHTML = items.map(product => {
    const image = api.safeImageUrl(product.images?.[0]);
    return `<a class="card" href="product.html?id=${encodeURIComponent(product.id)}"><div class="card-img">${image ? `<img src="${esc(image)}" alt="${esc(product.name)}" loading="lazy">` : '<span class="product-no-image">LUMINO</span>'}</div><p class="k">${esc(product.label || product.category || '')}</p><h3>${esc(product.name)}</h3><p>${esc(product.summary || '')}</p>${product.price ? `<p class="price">${esc(product.price)}</p>` : ''}<span class="product-detail-link">상품 자세히 보기 ↗</span></a>`;
  }).join('');
}
async function load() {
  try {
    products = await api.loadVisibleProducts();
    filters.innerHTML = ['ALL', ...new Set(products.map(product => product.category).filter(Boolean))].map(item => `<button type="button" class="gallery-filter" data-product-category="${esc(item)}" aria-pressed="${item === category}">${esc(item === 'ALL' ? '전체' : item)}</button>`).join('');
    render();
  } catch {
    box.innerHTML = '<div class="portfolio-status"><p>상품을 불러오지 못했어요.</p><button type="button" class="quiet-link" id="retry-products">다시 불러오기 ↻</button></div>';
    document.querySelector('#retry-products').addEventListener('click', load);
  }
}
filters.addEventListener('click', event => {
  const button = event.target.closest('[data-product-category]');
  if (!button) return;
  category = button.dataset.productCategory;
  filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  render();
});
search.addEventListener('input', render);
load();
