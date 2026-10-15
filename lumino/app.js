import { collection } from '../data/collection.js';
import { gallery, galleryCategories } from '../data/gallery.js';
import { stamps } from '../data/stamps.js';
import { brand } from '../data/story.js';
import { questions } from '../data/taste.js';
import { icon, stampMarkup } from './icons.js';
import { createStore, earnedIds, STORAGE_KEY } from './state.js';
import { renderChrome } from './chrome.js';
import { pageHref } from '../data/pages.js';
import { createInvitation } from './invitation.js';
import { loadProductLooks } from './shop.js';
import { renderTravelCard, downloadBlob } from './card.js';

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isHome = document.body.hasAttribute('data-lumino-home');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const lowPower = navigator.connection?.saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
if(lowPower) document.documentElement.classList.add('low-effects');
if(lowPower||reducedMotion.matches||matchMedia('(max-width: 719px)').matches){$('.flight-motion')?.remove();$('.flight-plane')?.setAttribute('transform','translate(320 63) rotate(-20)');}
let storageFailed=false;
let storage;
try { storage=window.localStorage; } catch { storage={getItem:()=>null,setItem:()=>{throw new Error('unavailable');}};storageFailed=true; }
const store=createStore(storage,()=>{ storageFailed=true; });
let toastTimer, completionTimer, activeDetail=null, galleryFilter='ALL', tasteStep=0, cardBlob=null, cardRendering=false, cardGeneration=0;
let selectedStamp=null, focusReturn=null, passportViewKey='';
const awardQueue=[];
let awarding=false;
renderChrome();
let productLooks = store.get().productLooks;
const allLooks = () => [...collection, ...store.get().productLooks];
$$('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});
document.body.insertAdjacentHTML('beforeend',`<button class="passport-fab" data-action="passport" aria-label="MY PASSPORT 열기"><span class="mini-passport">${icon('crown')}<small>LUMINO</small></span><span>MY PASSPORT<strong id="fab-progress">0 / 5</strong></span></button><div id="lumino-toast" class="toast" popover="manual" role="status" aria-live="polite"></div><dialog id="intro-dialog" class="l-dialog intro-dialog" aria-label="루미노 초대장"></dialog><dialog id="detail-dialog" class="l-dialog detail-dialog" aria-labelledby="detail-title"></dialog><dialog id="passport-dialog" class="l-dialog passport-dialog" aria-label="나의 루미노 여행 여권"></dialog><dialog id="search-dialog" class="l-dialog" aria-labelledby="search-title"></dialog><dialog id="favorites-dialog" class="l-dialog" aria-labelledby="favorites-title"></dialog><dialog id="completion-dialog" class="l-dialog completion-dialog" aria-labelledby="completion-title"></dialog><dialog id="card-dialog" class="l-dialog card-dialog" aria-labelledby="card-title"></dialog>`);
const closeButton = label => `<button type="button" class="icon-button dialog-close" data-action="close" aria-label="${label} 닫기">${icon('close')}</button>`;
function toast(message) {
  clearTimeout(toastTimer);const box=$('#lumino-toast');box.innerHTML=icon('sparkle')+`<span>${esc(message)}</span>`;box.showPopover?.();box.classList.add('visible');toastTimer=setTimeout(()=>{box.classList.remove('visible');box.hidePopover?.();},4200);
}
function openDialog(id) {
  const current=$('.l-dialog[open]');
  if(!current) focusReturn=document.activeElement;
  else current.close();
  const dialog=$('#'+id);dialog.showModal();dialog.scrollTop=0;
  return dialog;
}
function closeDialog(dialog) {
  if(dialog.id==='intro-dialog') { finishIntro();return; }
  dialog.close();
  if(focusReturn?.isConnected) focusReturn.focus({preventScroll:true});
  maybeComplete();
}
$$('.l-dialog').forEach(dialog=>{
  dialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog(dialog);});
  dialog.addEventListener('click',e=>{if(e.target!==dialog||dialog.id==='intro-dialog')return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(dialog);});
});
function menuClose(){const nav=$('#main-navigation');nav?.classList.remove('is-open');const b=$('[data-action="menu"]');b?.setAttribute('aria-expanded','false');b?.setAttribute('aria-label','메뉴 열기');}
function goChapter(id) {
  $$('.l-dialog[open]').forEach(dialog => dialog.close());
  menuClose();
  if ((location.pathname.split('/').pop().replace(/\.html$/, '') || 'index') === pageHref(id).replace('.html', '')) {
    window.scrollTo({top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
    const main = $('main'); main?.setAttribute('tabindex', '-1'); main?.focus({preventScroll: true});
  } else location.href = pageHref(id);
}
// 예전에 공유된 홈의 해시 주소도 해당 독립 페이지로 연결합니다.
const oldChapter = location.hash.slice(1);
if (isHome && ['collection', 'gallery', 'journey', 'story'].includes(oldChapter)) location.replace(pageHref(oldChapter));

function renderProgress(){
  const state=store.get(), ids=earnedIds(state);$('#fab-progress').textContent=`${ids.length} / 5`;
  $('.passport-fab').setAttribute('aria-label',`MY PASSPORT 열기, 스탬프 ${ids.length}/5개 수집`);
  const badge=$('.favorite-count');if(badge){badge.hidden=!state.favorites.length;badge.textContent=state.favorites.length;}
  const map=$('#chapter-map');if(map)map.innerHTML=stamps.map((s,i)=>`<a href="${pageHref(s.chapter)}" class="chapter-stop" aria-label="${s.name}: ${esc(s.condition)}${ids.includes(s.id)?', 수집 완료':''}">${stampMarkup(s,ids.includes(s.id))}<span>${['여행의 시작','컬렉션 탐험','스크랩북 갤러리','브랜드 이야기','나만의 여행 완성'][i]}</span><small>${ids.includes(s.id)?'COLLECTED ✓':`CHAPTER 0${i+1}`}</small></a>`).join('');
  $$('.favorite-indicator').forEach(el=>el.classList.toggle('visible',state.favorites.includes(el.dataset.id)));
  if($('#passport-dialog').open) renderPassport();
  if($('#favorites-dialog').open) renderFavorites();
  updateProductFavorite();
}
function renderCollection(){const root=$('#collection-grid');if(!root)return;root.innerHTML=collection.map((c,i)=>`<article class="collection-item"><button class="look-open" data-action="look" data-id="${c.id}" aria-label="${esc(c.title)} 화보 자세히 보기"><div class="look-photo"><div class="look-image-clip"><img src="${c.image}" alt="${esc(c.title+' · '+c.subtitle)}" loading="lazy" width="700" height="1000"></div><span class="look-index">0${i+1}</span><span class="favorite-indicator" data-id="${c.id}">${icon('heart')}</span></div><div class="look-caption"><div><span class="look-category">${c.category} COLLECTION</span><h3>${esc(c.title)}</h3><p>${esc(c.subtitle)}</p></div><span class="look-arrow" aria-hidden="true">↗</span></div></button></article>`).join('');}
function renderGallery(){
  const filters=$('#gallery-filters'), grid=$('#gallery-grid');if(!grid)return;
  filters.innerHTML=galleryCategories.map(c=>`<button class="gallery-filter" data-action="filter" data-category="${c}" aria-pressed="${galleryFilter===c}">${c}</button>`).join('');
  const photos=gallery.filter(g=>galleryFilter==='ALL'||g.category===galleryFilter);
  grid.innerHTML=photos.map((g,i)=>`<button class="polaroid-card" data-action="photo" data-id="${g.id}" aria-label="${esc(g.title)} 사진 자세히 보기">${i%3===0?'<span class="photo-tape" aria-hidden="true"></span>':''}<img src="${g.image}" alt="${esc(g.title)}" loading="lazy" width="600" height="500"><span class="polaroid-caption">${esc(g.title)}</span><span class="polaroid-category">${g.category} · LUMINO MEMORY</span>${store.get().photoId===g.id?'<span class="photo-saved">SAVED ♡</span>':''}</button>`).join('');
}
function openDetail(type,id){
  const item=(type==='look'?collection:gallery).find(x=>x.id===id);if(!item)return;
  activeDetail={type,id};renderDetail();openDialog('detail-dialog');
}
function renderDetail(){
  if(!activeDetail)return;const {type,id}=activeDetail, item=(type==='look'?collection:gallery).find(x=>x.id===id);if(!item)return;
  const state=store.get(), saved=type==='look'?state.favorites.includes(id):state.photoId===id;
  $('#detail-dialog').innerHTML=`${closeButton('상세 화보')}<div class="detail-layout"><div class="detail-picture"><img id="detail-image" src="${item.image}" alt="${esc(item.title)}">${item.detailImage?`<div class="detail-thumbnails"><button aria-label="앞모습 보기" data-action="detail-image" data-image="${item.image}"><img src="${item.image}" alt="앞모습"></button><button aria-label="뒷모습 보기" data-action="detail-image" data-image="${item.detailImage}"><img src="${item.detailImage}" alt="뒷모습"></button></div>`:''}</div><div class="detail-copy"><p class="eyebrow">${item.category} · ${type==='look'?'COLLECTION':'GALLERY'}</p><h2 id="detail-title">${esc(item.title)}</h2><p>${esc(item.description)}</p><button class="l-btn" data-action="${type==='look'?'favorite':'save-photo'}" data-id="${id}" aria-pressed="${saved}">${icon(saved?'check':'heart')} ${type==='look'?(saved?'MY FAVORITE · SAVED':'MY FAVORITE'):(saved?'SAVED TO MY SCRAPBOOK':'이 장면 저장하기')}</button>${type==='photo'?`<button class="quiet-link" data-action="download-photo" data-id="${id}">${icon('download')} 사진 다운로드</button>`:''}<p class="detail-hint">${type==='look'?'마음에 드는 옷을 선택하면 ROMANCE 스탬프가 찍혀요.<br>마지막으로 선택한 옷이 나의 여행 카드에 담겨요.':'저장한 장면이 나의 여행 카드에 담겨요.<br>이 브라우저의 스크랩북에 선택이 저장됩니다.'}</p></div></div>`;
}
function renderTaste(){
  const form=$('#taste-form');if(!form)return;
  const state=store.get(), q=questions[tasteStep];$('#taste-result').hidden=true;form.hidden=false;
  $('#taste-progress').innerHTML=questions.map((_,i)=>`<span class="taste-step ${i===tasteStep?'current':''}">${i+1}</span>`).join('')+`<span>YOUR JOURNEY · 0${tasteStep+1} / 03</span>`;
  form.innerHTML=`<fieldset><legend>${q.title}</legend><p class="taste-english">${q.english}</p><div class="taste-options">${q.options.map(o=>`<label class="taste-option">${o.image?`<img src="${o.image}" alt="" loading="lazy" width="65" height="57">`:icon(o.icon)}<span>${esc(o.label)}<small>${esc(o.detail)}</small></span><input type="radio" name="${q.id}" value="${o.value}" ${state.answers[q.id]===o.value?'checked':''} required></label>`).join('')}</div></fieldset><div class="taste-actions">${tasteStep?'<button type="button" class="quiet-link" data-action="taste-back">← 이전 질문</button>':'<span class="eyebrow">FOLLOW YOUR HEART ♡</span>'}<button type="submit" class="l-btn" ${state.answers[q.id]?'':'disabled'}>${tasteStep===2?'나의 여행 스타일 완성':'다음 질문'} →</button></div>`;
}
function renderTasteResult(){
  const state=store.get();if(!state.tasteComplete||!$('#taste-form'))return;
  const destination=questions[0].options.find(o=>o.value===state.answers.destination),mood=questions[1].options.find(o=>o.value===state.answers.mood);
  $('#taste-form').hidden=true;$('#taste-progress').innerHTML='<span>YOUR JOURNEY · COMPLETE</span>';
  const result=$('#taste-result');result.hidden=false;result.className='taste-result';result.innerHTML=`${stampMarkup(stamps[4],true)}<h3>Your ${mood.label} Journey</h3><p>${esc(destination.label)}에서 시작되는<br>당신만의 ${esc(mood.label)} 여행을 담았어요.</p><button class="l-btn" data-action="passport">나의 여권 확인하기 ↗</button><br><button class="quiet-link" data-action="taste-edit">취향 다시 선택하기</button>`;
}
function renderStory(){const box=$('#story-copy');if(box)box.innerHTML=brand.story.map(s=>`<article class="story-paragraph"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></article>`).join('');updateRibbon();}
function updateRibbon(){const b=$('.secret-ribbon');if(!b)return;const found=store.get().ribbonFound;b.classList.toggle('found',found);b.setAttribute('aria-label',found?'발견한 루미노의 리본 다시 보기':'편지의 숨겨진 리본 풀기');if(found)$('#ribbon-message').textContent='사랑스러운 비밀을 발견했어요. CUTE 스탬프가 여권에 담겼어요!';}
function renderPassport(){
  const dialog=$('#passport-dialog');const focused=document.activeElement;const wasName=focused?.id==='traveler-name';const caret=wasName?focused.selectionStart:null;
  const state=store.get(), ids=earnedIds(state), selected=stamps.find(s=>s.id===selectedStamp);
  // 이름 저장(change)은 mousedown과 click 사이에도 발생합니다.
  // 이때 버튼 DOM을 교체하면 첫 클릭이 사라지므로 여권 내용이 바뀔 때만 다시 그립니다.
  const viewKey=JSON.stringify([ids, selectedStamp, storageFailed]);
  if(passportViewKey===viewKey && dialog.firstElementChild){
    if(!wasName) $('#traveler-name').value=state.traveler;
    return;
  }
  passportViewKey=viewKey;
  dialog.innerHTML=`${closeButton('여권')}<div class="passport-book"><div class="passport-page passport-left">${icon('crown','passport-crest')}<p class="eyebrow">LUMINO REPUBLIC OF DREAMS</p><h2>LUMINO <br>PASSPORT</h2><p class="script">My little journey</p><label for="traveler-name" class="traveler-label">THIS PASSPORT BELONGS TO</label><input id="traveler-name" class="traveler-input" placeholder="여행자의 이름 (선택)" value="${esc(state.traveler)}" maxlength="24" autocomplete="nickname"><p class="passport-small">좋아하는 순간들이 모여<br>당신만의 이야기가 됩니다.</p><button type="button" class="quiet-link invitation-replay" data-action="replay-intro">초대장 다시 보기 ↗</button></div><div class="passport-page passport-right"><p class="eyebrow">COLLECT YOUR SPARKLING MOMENTS</p><div class="passport-stamps">${stamps.map(s=>`<button class="passport-stamp-button" data-action="stamp-guide" data-id="${s.id}" aria-label="${s.name} ${ids.includes(s.id)?'수집 완료':'획득 방법 보기'}">${stampMarkup(s,ids.includes(s.id))}<small>${ids.includes(s.id)?'COLLECTED ✓':'HOW TO COLLECT ↗'}</small></button>`).join('')}</div>${selected?`<div class="passport-guide"><p><strong>${selected.name}</strong> · ${ids.includes(selected.id)?'이미 모은 추억이에요. 언제든 다시 탐험해보세요.':esc(selected.condition)}</p><button class="quiet-link" data-action="chapter" data-chapter="${selected.chapter}">이 챕터로 이동 →</button></div>`:''}<div class="passport-progress-label"><span>MY JOURNEY PROGRESS</span><strong>${ids.length} / 5 STAMPS COLLECTED</strong></div><progress class="journey-progress" max="5" value="${ids.length}" aria-label="스탬프 수집 진행률">${ids.length}/5</progress><p class="remaining-copy">${ids.length===5?'모든 반짝이는 순간을 모았어요!':`완성까지 ${5-ids.length}개의 추억이 남았어요.`}</p>${ids.length===5?'<button class="l-btn" data-action="card">나의 여행 카드 발급하기 ↗</button>':'<button class="quiet-link" data-action="next-chapter">다음 여행지로 떠나기 →</button>'}<p class="passport-small card-notice">${storageFailed?'브라우저 저장이 차단되어 현재 방문에서만 기록이 유지돼요.':'여행 기록은 이 브라우저에 저장돼요.'}</p></div></div>`;
  if(wasName){const input=$('#traveler-name');input.focus({preventScroll:true});input.setSelectionRange(caret,caret);}
}
function openPassport(){selectedStamp=null;renderPassport();openDialog('passport-dialog');}
function renderFavorites(){const state=store.get(),items=allLooks().filter(c=>state.favorites.includes(c.id));$('#favorites-dialog').innerHTML=`${closeButton('즐겨찾기')}<header class="dialog-heading"><p class="eyebrow">LITTLE THINGS YOU LOVE</p><h2 id="favorites-title">My favorites.</h2><p>마음에 담은 로맨스, ${items.length}벌</p></header><div class="favorites-list">${items.length?items.map(c=>`<div class="favorites-row">${c.productId?`<a class="search-result" href="${esc(c.href)}">`:`<button class="search-result" data-action="look" data-id="${esc(c.id)}">`}<img src="${esc(c.image)}" alt=""><span><strong>${esc(c.title)}</strong><small>${esc(c.subtitle || c.category)}${state.favoriteId===c.id?' · 여행 카드에 담긴 옷':''}</small></span>${c.productId?'</a>':'</button>'}<button class="icon-button" data-action="unfavorite" data-id="${esc(c.id)}" aria-label="${esc(c.title)} 즐겨찾기 해제">${icon('close')}</button></div>`).join(''):'<div class="empty-state"><p>아직 마음에 담은 옷이 없어요.</p><button class="quiet-link" data-action="chapter" data-chapter="collection">컬렉션 만나러 가기 →</button></div>'}</div>`;}
function openSearch(){
  $('#search-dialog').innerHTML=`${closeButton('검색')}<header class="dialog-heading"><p class="eyebrow">FIND YOUR LITTLE SPARKLE</p><h2 id="search-title">What do you love?</h2></header><label for="lumino-search" class="eyebrow">상품 · 컬렉션 · 갤러리 검색</label><input class="search-input" id="lumino-search" type="search" placeholder="핑크, 리본, 파리…" autocomplete="off"><div class="search-results" id="search-results" aria-live="polite"></div>`;openDialog('search-dialog');renderSearch('');$('#lumino-search').focus();
  loadProductLooks().then(items=>{productLooks=items;if($('#search-dialog').open)renderSearch($('#lumino-search').value);}).catch(()=>toast('상품 검색을 불러오지 못했어요. 잠시 후 다시 검색해주세요.'));
}
function renderSearch(query) {
  const term = query.trim().toLocaleLowerCase();
  const list = [...productLooks.map(x=>({...x,type:'product'})), ...collection.map(x=>({...x,type:'look'})), ...gallery.map(x=>({...x,type:'photo'}))].filter(x=>`${x.title} ${x.description} ${x.category} ${x.subtitle || ''}`.toLocaleLowerCase().includes(term));
  $('#search-results').innerHTML = list.length ? list.map(item => {
    const content = `<img src="${esc(item.image)}" alt="" loading="lazy"><span><strong>${esc(item.title)}</strong><small>${esc(item.category)}${item.type==='product'?' · 상품 상세 보기':''}</small></span>`;
    return item.type === 'product' ? `<a class="search-result" href="${esc(item.href)}">${content}</a>` : `<button class="search-result" data-action="${item.type}" data-id="${item.id}">${content}</button>`;
  }).join('') : '<p class="empty-state">검색 결과가 없어요. 다른 단어로 찾아보세요.</p>';
}
function updateProductFavorite() {
  const state = store.get();
  $$('[data-action="favorite-product"]').forEach(button => {
    const saved = state.favorites.includes(`product:${button.dataset.productId}`);
    button.setAttribute('aria-pressed', String(saved));
    button.textContent = saved ? '♡ MY FAVORITE · SAVED' : '♡ MY FAVORITE';
  });
}
async function favoriteProduct(button) {
  button.disabled = true;
  try {
    const looks = await loadProductLooks();
    const look = looks.find(item => item.productId === button.dataset.productId);
    if (!look) throw new Error('지금은 이 상품을 선택할 수 없어요. 상품 목록을 다시 확인해주세요.');
    const state = store.get();
    store.update({ productLooks: [...state.productLooks.filter(item=>item.id!==look.id), look], favorites: [...new Set([...state.favorites,look.id])], favoriteId:look.id });
    if (earnedIds(state).includes('romance')) toast('이 상품을 즐겨찾기와 여행 카드에 담았어요.');
  } catch (error) { toast(error.message || '상품을 불러오지 못했어요. 다시 눌러주세요.'); }
  finally { button.disabled = false; updateProductFavorite(); }
}
document.addEventListener('lumino:product-ready', updateProductFavorite);

const invitation = createInvitation($('#intro-dialog'), {
  openDialog, reducedMotion, lowPower,
  onFinish() {
    store.update({started:true});
    maybeComplete();
    const target = isHome ? $('#hero-title') : $('main');
    target?.setAttribute('tabindex','-1'); target?.focus({preventScroll:true});
    if(storageFailed) setTimeout(()=>toast('브라우저 저장이 차단되어 현재 방문에서만 여행 기록이 유지돼요.'),4500);
  }
});
function showIntro(){ clearTimeout(completionTimer); invitation.show(); }
function openIntro(){ invitation.open(); }
function finishIntro(){ invitation.finish(); }

async function showAward(id){
  const stamp=stamps.find(s=>s.id===id);if(!stamp)return;
  const div=document.createElement('div');div.className='stamp-flight';div.setAttribute('popover','manual');div.setAttribute('aria-hidden','true');div.innerHTML=stampMarkup(stamp,true);document.body.append(div);div.showPopover?.();
  toast(stamp.message);$('.passport-fab').classList.add('new-stamp');
  if(!reducedMotion.matches&&!lowPower&&navigator.vibrate)navigator.vibrate(30);
  await new Promise(resolve=>setTimeout(resolve,reducedMotion.matches||lowPower?500:1800));div.remove();$('.passport-fab').classList.remove('new-stamp');
}
async function drainAwards(){if(awarding)return;awarding=true;while(awardQueue.length)await showAward(awardQueue.shift());awarding=false;maybeComplete();}
function maybeComplete(){
  clearTimeout(completionTimer);const state=store.get();if(earnedIds(state).length!==5||state.completionSeen||awarding||$('#intro-dialog').open)return;
  completionTimer=setTimeout(()=>{
    if(earnedIds(store.get()).length!==5||store.get().completionSeen)return;
    $('#completion-dialog').innerHTML=`${closeButton('여행 완료')}<p class="eyebrow">FIVE LITTLE MOMENTS. ONE BEAUTIFUL JOURNEY.</p><p class="script">Congratulations!</p><h2 id="completion-title">You completed your<br>LUMINO journey!</h2><p>당신만의 반짝이는 여행이 완성되었습니다.</p><div class="completion-book">${stamps.map((s,i)=>`<span style="animation-delay:${i*.12}s">${stampMarkup(s,true,true)}</span>`).join('')}</div><p>좋아하는 옷, 소중한 장면, 당신만의 취향을<br>한 장의 특별한 여행 카드에 담아드릴게요.</p><button class="l-btn" data-action="card">REVEAL MY TRAVEL CARD ↗</button>`;openDialog('completion-dialog');store.update({completionSeen:true});
  },900);
}
async function openCard(){
  if(earnedIds(store.get()).length!==5){openPassport();return;}
  const generation=++cardGeneration;cardBlob=null;cardRendering=true;
  $('#card-dialog').innerHTML=`${closeButton('여행 카드')}<header class="dialog-heading"><p class="eyebrow">A KEEPSAKE, MADE JUST FOR YOU</p><h2 id="card-title">My LUMINO travel card.</h2><p>당신이 고른 순간들로 만든, 세상에 하나뿐인 엽서.</p></header><div class="card-loading">반짝이는 추억을 카드에 담고 있어요…</div><canvas id="travel-card" class="travel-card-canvas" width="1600" height="1000" role="img" aria-label="선택한 의상, 갤러리 사진, 여행 취향과 다섯 스탬프를 담은 개인화 여행 카드" hidden></canvas><div class="card-status" role="status"></div><div class="card-actions"><button class="l-btn" data-action="save-card" disabled>${icon('download')} SAVE MY TRAVEL CARD</button><button class="l-btn outline" data-action="share-card" disabled>${icon('share')} SHARE MY JOURNEY</button><button class="quiet-link" data-action="explore-again">EXPLORE AGAIN ↗</button></div><p class="card-notice">PNG 이미지로 저장돼요. 공유 기능은 브라우저 지원 여부에 따라 이미지 저장으로 연결됩니다.<br>이름은 여권에서 바꿀 수 있어요.</p>`;openDialog('card-dialog');
  const canvas=$('#travel-card');
  try{const blob=await renderTravelCard(canvas,store.get());if(generation!==cardGeneration)return;cardBlob=blob;canvas.hidden=false;$('.card-loading').hidden=true;$$('[data-action="save-card"],[data-action="share-card"]').forEach(b=>b.disabled=false);}
  catch(error){if(generation!==cardGeneration)return;$('.card-loading').hidden=true;$('.card-status').textContent=error.message;$('.card-status').insertAdjacentHTML('beforeend','<br><button class="quiet-link" data-action="card">다시 생성하기 ↻</button>');}
  finally{if(generation===cardGeneration)cardRendering=false;}
}
async function shareCard(){
  if(!cardBlob||cardRendering)return;const file=new File([cardBlob],'my-lumino-journey.png',{type:'image/png'});
  try{if(navigator.canShare?.({files:[file]})&&navigator.share){await navigator.share({title:'My LUMINO Journey',text:brand.slogan,files:[file]});return;}}
  catch(error){if(error.name==='AbortError')return;}
  downloadBlob(cardBlob,'my-lumino-journey.png');$('.card-status').textContent='이 브라우저에서는 이미지 공유를 지원하지 않아 PNG로 저장했어요. 저장한 사진을 SNS에 올려주세요.';
}
async function downloadPhoto(id){const item=gallery.find(g=>g.id===id);if(!item)return;try{const response=await fetch(item.image);if(!response.ok)throw new Error();downloadBlob(await response.blob(),`lumino-${id}.${item.image.endsWith('.webp')?'webp':'jpg'}`);toast('사진을 다운로드했어요.');}catch{toast('사진을 저장하지 못했어요. 연결 상태를 확인해주세요.');}}

store.subscribe((state,awarded)=>{renderProgress();updateRibbon();if(awarded.length){awardQueue.push(...awarded);drainAwards();}});
window.addEventListener('storage',event=>{if(event.key!==STORAGE_KEY)return;try{store.sync(JSON.parse(event.newValue));renderGallery();if(store.get().tasteComplete)renderTasteResult();else renderTaste();if($('#card-dialog').open)openCard();}catch{/* 잘못된 외부 저장 값은 무시합니다. */}});
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
  const {action,id}=button.dataset;
  if(action==='close')closeDialog(button.closest('dialog'));
  else if(action==='menu'){const open=$('#main-navigation').classList.toggle('is-open');button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');}
  else if(action==='passport')openPassport();
  else if(action==='search')openSearch();
  else if(action==='favorites'){renderFavorites();openDialog('favorites-dialog');}
  else if(action==='look'||action==='photo')openDetail(action,id);
  else if(action==='detail-image')$('#detail-image').src=button.dataset.image;
  else if(action==='favorite-product')favoriteProduct(button);
  else if(action==='favorite'){const state=store.get();const isExisting=state.favorites.includes(id);store.update({favorites:[...new Set([...state.favorites,id])],favoriteId:id});renderDetail();$('[data-action="favorite"]')?.focus({preventScroll:true});if(isExisting)toast('이 옷을 여행 카드에 담았어요.');}
  else if(action==='unfavorite'){store.update({favorites:store.get().favorites.filter(x=>x!==id)});toast('즐겨찾기를 해제했어요. 수집한 스탬프와 여행 카드의 마지막 선택은 유지돼요.');}
  else if(action==='save-photo'){const already=store.get().photoId===id;store.update({photoId:id});renderDetail();renderGallery();$('[data-action="save-photo"]')?.focus({preventScroll:true});if(already)toast('이미 스크랩북에 담긴 장면이에요.');else if(earnedIds(store.get()).includes('fantasy')&&!awarding)toast('이 장면을 여행 카드에 담았어요.');}
  else if(action==='download-photo')downloadPhoto(id);
  else if(action==='filter'){galleryFilter=button.dataset.category;renderGallery();$(`[data-category="${galleryFilter}"]`)?.focus({preventScroll:true});}
  else if(action==='taste-back'){tasteStep=Math.max(0,tasteStep-1);renderTaste();$('#taste-form input')?.focus({preventScroll:true});}
  else if(action==='taste-edit'){tasteStep=0;renderTaste();}
  else if(action==='ribbon'){const r=$('#story-end')?.getBoundingClientRect();if(!store.get().storyRead&&r&&r.top<innerHeight&&r.bottom>0)store.update({storyRead:true});if(!store.get().storyRead){toast('브랜드 편지를 읽고 마지막 리본을 풀어주세요.');return;}const found=store.get().ribbonFound;store.update({ribbonFound:true});if(found)toast('이미 발견한 사랑스러운 비밀이에요!');}
  else if(action==='stamp-guide'){selectedStamp=id;renderPassport();$('.passport-guide button')?.focus({preventScroll:true});}
  else if(action==='chapter'){if(button.dataset.chapter==='home'&&!store.get().started)showIntro();else goChapter(button.dataset.chapter);}
  else if(action==='next-chapter'){const next=stamps.find(s=>!earnedIds(store.get()).includes(s.id));if(next?.id==='travel')showIntro();else if(next)goChapter(next.chapter);}
  else if(action==='replay-intro')showIntro();
  else if(action==='open-intro')openIntro();
  else if(action==='skip-intro')finishIntro();
  else if(action==='card')openCard();
  else if(action==='save-card'&&cardBlob){downloadBlob(cardBlob,'my-lumino-journey.png');$('.card-status').textContent='여행 카드를 PNG로 저장했어요.';}
  else if(action==='share-card')shareCard();
  else if(action==='explore-again'){goChapter('collection');toast('수집한 추억은 그대로, 새로운 설렘을 찾아보세요.');}
});
document.addEventListener('input',event=>{
  if(event.target.id==='lumino-search')renderSearch(event.target.value);
  if(event.target.id==='traveler-name')store.update({traveler:event.target.value});
});
document.addEventListener('change',event=>{
  if(event.target.id==='traveler-name'){store.update({traveler:event.target.value});return;}
  if(event.target.matches('#taste-form input[type="radio"]')){const q=questions[tasteStep];store.update({answers:{...store.get().answers,[q.id]:event.target.value}});$('#taste-form button[type="submit"]').disabled=false;}
});
$('#taste-form')?.addEventListener('submit',event=>{event.preventDefault();const q=questions[tasteStep];if(!questions[tasteStep].options.some(o=>o.value===store.get().answers[q.id]))return;if(tasteStep<2){tasteStep++;renderTaste();$('#taste-form input')?.focus({preventScroll:true});}else{store.update({tasteComplete:true});renderTasteResult();}});
$('#main-navigation')?.addEventListener('click',event=>{if(event.target.closest('a'))menuClose();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')menuClose();});
document.addEventListener('click',event=>{if(!event.target.closest('.header-inner'))menuClose();});
renderCollection();renderGallery();renderStory();renderProgress();renderTaste();if(store.get().tasteComplete)renderTasteResult();
if('IntersectionObserver' in window){
  const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');reveal.unobserve(entry.target);}}),{threshold:.08});
  $$('.reveal').forEach(el=>{if(!reducedMotion.matches&&!lowPower)el.classList.add('observed');reveal.observe(el);});
  const storyEnd=$('#story-end');if(storyEnd){const read=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&!$('#intro-dialog').open){store.update({storyRead:true});read.disconnect();}},{threshold:.5});read.observe(storyEnd);}

}else {$$('.reveal').forEach(el=>el.classList.add('is-visible'));const end=$('#story-end');if(end)window.addEventListener('scroll',()=>{const r=end.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)store.update({storyRead:true});},{passive:true});}
if(isHome&&!reducedMotion.matches&&!lowPower&&matchMedia('(min-width: 1024px) and (pointer: fine)').matches){let pending=false;window.addEventListener('scroll',()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{const y=Math.min(scrollY,800)*.12;$('.dream-scenery').style.transform=`translateY(${y}px) scale(1.06)`;pending=false;});},{passive:true});}
if(isHome&&!store.get().started)showIntro();else maybeComplete();
