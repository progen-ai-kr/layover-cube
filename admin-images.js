import { siteImageSlots } from './data/site-image-slots.js';
import { normalizeSiteImages } from './data/site-images-schema.js';

// 로그인/업로드/저장은 기존 관리자 세션을 사용합니다. 화면 내 초안은 저장 전까지 공개되지 않습니다.
export function createImageManager({ root, api, prepareImage, onChange, showToast, siteUrl }) {
  let saved = {}, draft = {}, sha = '', loaded = false, busy = false, generation = 0;
  let query = '', group = 'ALL';
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const dirty = () => siteImageSlots.some(slot => saved[slot.id] !== draft[slot.id]);
  const changed = () => {
    onChange();
    save.disabled = !loaded || busy || !dirty();
    reload.disabled = busy;
    root.setAttribute('aria-busy', String(busy));
    root.querySelectorAll('.site-image-card button, .site-image-card input').forEach(input => input.disabled = busy);
    count.textContent = `${siteImageSlots.filter(slot => saved[slot.id] !== draft[slot.id]).length}개 변경 · 저장 후 사이트에 반영됩니다.`;
  };
  const message = (text, error = false) => {
    status.textContent = text;
    status.classList.toggle('is-error', error);
  };

  const heading = el('div', 'site-images-heading');
  const title = el('div');
  title.append(el('p', 'eyebrow', 'LUMINO · CUBE'), el('h1', '', '사이트 이미지'), el('p', 'helper', '메인 화보부터 초대장, 여권, 스탬프까지 교체합니다. 같은 사진을 사용하는 위치는 함께 변경됩니다.'));
  const actions = el('div', 'site-images-actions');
  const view = el('a', 'ghost-button', '사이트 확인 ↗');
  view.href = siteUrl || 'index.html';view.target = '_blank';view.rel = 'noopener';
  const reload = el('button', 'ghost-button', '최신 설정 불러오기');reload.type = 'button';
  const save = el('button', 'primary-button', '이미지 변경사항 저장');save.type = 'button';save.disabled = true;
  actions.append(view, reload, save);heading.append(title, actions);
  const info = el('p', 'site-images-info', '판매 상품 사진은 ‘제품 관리’, 룩북 본문 이미지는 ‘포트폴리오’에서 수정합니다. 이 메뉴의 변경은 LUMINO(CUBE) 시안에만 반영됩니다. JPG·PNG·WebP·GIF·AVIF를 지원하며 큰 사진은 자동으로 줄입니다.');
  const filters = el('div', 'site-images-filters');
  const searchLabel = el('label', '', '이미지 찾기');
  const search = el('input');search.type = 'search';search.placeholder = '예: 여권, 갤러리, 리본';searchLabel.append(search);
  const groupLabel = el('label', '', '영역');
  const select = el('select');
  for (const label of ['ALL', ...new Set(siteImageSlots.map(slot => slot.group))]) {
    const option = el('option', '', label === 'ALL' ? '모든 이미지' : label);option.value = label;select.append(option);
  }
  groupLabel.append(select);filters.append(searchLabel, groupLabel);
  const count = el('p', 'helper');
  const status = el('p', 'site-images-status');status.setAttribute('role', 'status');status.setAttribute('aria-live', 'polite');
  const grid = el('div', 'site-images-grid');
  root.append(heading, info, filters, count, status, grid);

  function render() {
    grid.replaceChildren();
    const slots = siteImageSlots.filter(slot => (group === 'ALL' || slot.group === group) && `${slot.label} ${slot.usage} ${slot.group}`.toLocaleLowerCase().includes(query));
    if (!slots.length) grid.append(el('p', 'helper', '조건에 맞는 이미지가 없습니다. 검색어나 영역을 바꿔주세요.'));
    for (const slot of slots) {
      const card = el('article', 'site-image-card');card.dataset.slot = slot.id;
      card.classList.toggle('is-changed', saved[slot.id] !== draft[slot.id]);
      const imageBox = el('div', 'site-image-preview');
      const source = draft[slot.id] || slot.defaultSrc;
      if (source) {
        const image = el('img');image.src = `/${source}`;image.alt = slot.label;image.loading = 'lazy';imageBox.append(image);
        image.addEventListener('error', () => { image.hidden = true;imageBox.append(el('span', '', '미리보기를 불러오지 못했습니다.')); }, { once:true });
      } else imageBox.append(el('span', '', '기본 스탬프 문양'));
      const body = el('div', 'site-image-body');
      body.append(el('p', 'eyebrow', slot.group), el('h2', '', slot.label), el('p', 'site-image-usage', slot.usage), el('p', 'helper', `권장 크기 ${slot.width} × ${slot.height}px · ${slot.hint}`));
      const controls = el('div', 'site-image-controls');
      const upload = el('label', 'upload-button', '이미지 교체');
      const input = el('input');input.type = 'file';input.accept = 'image/jpeg,image/png,image/webp,image/gif,image/avif';input.setAttribute('aria-label', `${slot.label} 이미지 교체`);upload.append(input);
      input.addEventListener('change', () => { const file = input.files[0];if (file) uploadFile(slot, file); });
      const restore = el('button', 'ghost-button', '기본 이미지로');restore.type = 'button';
      restore.addEventListener('click', () => { if (busy) return;delete draft[slot.id];render();message(`${slot.label}: 기본 이미지로 설정했습니다. 저장하면 반영됩니다.`); });
      controls.append(upload, restore);
      if (slot.defaultSrc) {
        const original = el('a', 'site-image-original', '원본 보기 ↗');original.href = `/${slot.defaultSrc}`;original.target = '_blank';original.rel = 'noopener';controls.append(original);
      }
      body.append(controls, el('p', 'site-image-state', saved[slot.id] !== draft[slot.id] ? '저장 전 변경사항' : draft[slot.id] ? '등록한 이미지 사용 중' : '기본 이미지 사용 중'));
      card.append(imageBox, body);grid.append(card);
    }
    changed();
  }

  async function load() {
    if (busy) return;
    const token = generation;busy = true;changed();message('현재 이미지 설정을 불러오고 있습니다.');
    try {
      const result = await api('/api/admin/site-images');
      if (token !== generation) return;
      saved = normalizeSiteImages(result.settings).images;draft = { ...saved };sha = result.sha;loaded = true;
      message('현재 설정을 불러왔습니다. 이미지 교체 후 변경사항을 저장하세요.');render();
    } catch (error) { if (token === generation) message(`${error.message} ‘최신 설정 불러오기’로 다시 시도할 수 있습니다.`, true); }
    finally { if (token === generation) { busy = false;changed(); } }
  }
  async function uploadFile(slot, file) {
    if (busy || !loaded) return;
    const token = generation;busy = true;changed();message(`${slot.label} 업로드 중…`);
    try {
      const prepared = await prepareImage(file);
      const result = await api('/api/admin/image', { method:'POST', headers:{ 'Content-Type':prepared.type, 'X-Upload-Scope':'site' }, body:prepared });
      if (token !== generation) return;
      draft = normalizeSiteImages({ version:1, images:{ ...draft, [slot.id]:result.path } }).images;
      render();message(`${slot.label} 업로드 완료. ‘이미지 변경사항 저장’을 눌러 반영하세요.`);
    } catch (error) { if (token === generation) message(error.message, true); }
    finally { if (token === generation) { busy = false;changed(); } }
  }
  save.addEventListener('click', async () => {
    if (busy || !loaded || !dirty()) return;
    const token = generation;busy = true;changed();message('변경한 이미지를 저장하고 있습니다.');
    try {
      const result = await api('/api/admin/site-images', { method:'PUT', body:JSON.stringify({ settings:{ version:1, images:draft }, expectedSha:sha }) });
      if (token !== generation) return;
      saved = { ...draft };sha = result.sha;render();message('저장했습니다. 사이트를 새로 열면 변경한 이미지를 확인할 수 있습니다.');showToast('사이트 이미지를 저장했습니다.');
    } catch (error) { if (token === generation) message(`${error.message} 현재 변경사항은 이 화면에 유지됩니다.`, true); }
    finally { if (token === generation) { busy = false;changed(); } }
  });
  reload.addEventListener('click', () => { if (!dirty() || window.confirm('저장 전 이미지 변경사항을 버리고 최신 설정을 불러올까요?')) load(); });
  search.addEventListener('input', () => { query = search.value.trim().toLocaleLowerCase();render(); });
  select.addEventListener('change', () => { group = select.value;render(); });
  return {
    open:() => { if (!loaded && !busy) load(); },
    isDirty:dirty,
    isBusy:() => busy,
    reset:() => { generation++;loaded = false;busy = false;saved = {};draft = {};sha = '';grid.replaceChildren();message('');changed(); }
  };
}
