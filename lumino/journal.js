import { collection } from '../data/collection.js';
import { gallery } from '../data/gallery.js';
import { questions } from '../data/taste.js';
import { stamps } from '../data/stamps.js';
import { journalEntries } from '../data/journal.js';
import { journeyArt } from '../data/journey-art.js';
import { brand } from '../data/story.js';
import { icon, stampMarkup } from './icons.js';
import { earnedIds } from './state.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

// 카드, 결과 화면, 기록은 같은 선택을 읽습니다. 미선택 항목을 샘플 사진으로 대체하지 않습니다.
export function journeySelections(state) {
  const look = [...collection, ...(state.productLooks || [])].find(item => item.id === state.favoriteId) || null;
  const photo = gallery.find(item => item.id === state.photoId) || null;
  const choices = Object.fromEntries(questions.map(q => [q.id, q.options.find(option => option.value === state.answers?.[q.id]) || null]));
  const taste = state.tasteComplete && Object.values(choices).every(Boolean) ? choices : null;
  return { look, photo, taste };
}

function choiceLink(item, kind, content, className) {
  // 운영 상품은 기존 상품 상세 주소로, 화보와 갤러리는 원래 상세 창으로 연결합니다.
  return kind === 'look' && item.productId
    ? `<a class="${className}" href="product.html?id=${encodeURIComponent(item.productId)}" aria-label="${esc(item.title)} 상세 보기">${content}</a>`
    : `<button type="button" class="${className}" data-action="${kind}" data-id="${esc(item.id)}" aria-label="${esc(item.title)} 상세 보기">${content}</button>`;
}

function memoryImage(item, caption) {
  return `<img src="${esc(item.image)}" alt="${esc(item.title || item.label)}" loading="lazy" width="600" height="700"><span class="memory-handwriting script">${esc(caption)}</span>`;
}

export function journalMarkup(state) {
  const ids = earnedIds(state), { look, photo, taste } = journeySelections(state);
  return journalEntries.map((entry, index) => {
    const stamp = stamps.find(item => item.id === entry.id), earned = ids.includes(entry.id);
    let media, title = entry.empty, detail = entry.hint, action = entry.action;
    let actionAttrs = `data-action="mission" data-id="${entry.id}"`;
    if (entry.id === 'romance' && look) {
      media = choiceLink(look, 'look', memoryImage(look, entry.caption), 'memory-photo');
      title = look.title; detail = '여행 카드에 담을 의상 · ' + look.category; action = '다른 의상 고르기';
    } else if (entry.id === 'fantasy' && photo) {
      media = choiceLink(photo, 'photo', memoryImage(photo, entry.caption), 'memory-photo');
      title = photo.title; detail = '스크랩북에 저장한 사진 · ' + photo.category; action = '다른 사진 고르기';
    } else if (entry.id === 'luxury' && taste) {
      media = `<button type="button" class="memory-photo" data-action="taste-edit" aria-label="여행 취향 다시 선택하기">${memoryImage(taste.destination, entry.caption)}</button>`;
      title = taste.destination.label; detail = `${taste.mood.label} · ${taste.item.label}`; action = '여행 취향 바꾸기'; actionAttrs = 'data-action="taste-edit"';
    } else if (entry.id === 'travel' && earned) {
      media = `<button type="button" class="memory-photo" data-action="replay-intro" aria-label="나의 첫 초대장 다시 보기">${memoryImage({ image:journeyArt.previews.travel, title:'여행을 시작한 루미노 초대장' }, entry.caption)}</button>`;
      title = '나에게 도착한 초대장'; detail = 'LUMINO와 함께 시작한 작은 여행'; action = '초대장 다시 보기';
    } else if (entry.id === 'cute' && earned) {
      media = `<button type="button" class="memory-photo memory-letter" data-action="chapter" data-chapter="story" aria-label="간직한 브랜드 편지 다시 읽기"><span class="memory-letter-content">${icon('crown')}<span class="script">Dear, lovely you.</span><span>${entry.letter.map(esc).join('<br>')}</span>${icon('bow')}<small>OUR STORY · LUMINO</small></span><span class="memory-handwriting script">${entry.caption}</span></button>`;
      title = '리본 속에 담긴 작은 마음'; detail = '브랜드 편지를 읽고 발견한 사랑스러운 비밀'; action = '편지 다시 읽기';
    } else {
      media = `<div class="memory-photo memory-empty"><span class="memory-empty-content">${icon(stamp.icon)}<strong>${entry.empty}</strong><small>${entry.hint}</small></span><span class="memory-handwriting script">Waiting for your memory.</span></div>`;
    }
    return `<article class="memory-record ${earned?'is-collected':'is-empty'}" data-memory="${entry.id}"><header><span class="eyebrow">0${index+1} · ${stamp.name}</span><span>${earned?'수집 완료 ✓':'아직 미수집'}</span></header><h3>${entry.label}</h3><div class="memory-paper-wrap">${media}<span class="memory-postmark" aria-hidden="true">${stampMarkup(stamp,earned,true)}</span></div><div class="memory-description"><h4>${esc(title)}</h4><p>${esc(detail)}</p></div><button class="quiet-link" ${actionAttrs}>${action} →</button></article>`;
  }).join('');
}

export function journalSummaryMarkup(state) {
  const count = earnedIds(state).length;
  return `<p><strong>${count} / 5</strong> MEMORIES COLLECTED</p><span>${count===5?'고른 추억을 한 장의 여행 카드로 간직하세요.':`추억 ${5-count}개를 더 모으면 나만의 여행 카드가 완성돼요.`}</span><div><button class="l-btn" data-action="${count===5?'card':'passport'}">${count===5?'나의 여행 카드 펼쳐보기':'남은 스탬프 모으는 방법'} ↗</button>${count===5?'<button class="quiet-link" data-action="passport">나의 여권 보기 →</button>':''}</div>`;
}

function resultKeepsake(item, kind, label, mission) {
  if (!item) return `<button class="result-keepsake is-empty" data-action="mission" data-id="${mission}">${icon(kind==='look'?'heart':'sparkle')}<span>${label}</span><small>아직 선택 전 · 고르러 가기 ↗</small></button>`;
  return choiceLink(item, kind, `<img src="${esc(item.image)}" alt="${esc(item.title)}" width="300" height="360"><span>${label}</span><small>${esc(item.title)}</small>`, 'result-keepsake');
}

export function tasteResultMarkup(state) {
  const { look, photo, taste } = journeySelections(state);
  if (!taste) return '';
  const complete = earnedIds(state).length === 5;
  return `<header class="result-heading"><p class="eyebrow">CHAPTER 05 · YOUR PERSONAL TRAVEL POSTCARD</p><h1 id="result-title">Your ${esc(taste.mood.label)} journey.</h1><p>당신이 고른 취향과 좋아하는 순간을 한 장의 엽서에 담았어요.</p></header>
    <div class="result-postcard">
      <div class="result-landscape"><img class="result-destination" src="${taste.destination.image}" alt="${taste.destination.label}" width="1000" height="900"><span class="result-location"><small>MY DREAM DESTINATION</small><strong>${taste.destination.label}</strong></span><span class="result-photo-note script">Wish you were here.</span>
        <div class="result-keepsakes">${resultKeepsake(look,'look','MY FAVORITE LOOK','romance')}${resultKeepsake(photo,'photo','MY SAVED MOMENT','fantasy')}</div>
      </div>
      <div class="result-letter"><div class="result-letter-top"><span>POST CARD<br><small>FROM YOUR LITTLE JOURNEY</small></span>${stampMarkup(stamps[4],true,true)}</div>
        <p class="result-recipient script">To. ${esc(state.traveler || 'my lovely traveler')}</p>
        <h2>당신을 닮은<br>작은 여행의 기록</h2><p class="result-letter-copy">${esc(taste.destination.detail)}.<br>${esc(taste.mood.detail)},<br>${esc(taste.item.label)} 하나를 챙겨 떠나는 여행.</p>
        <dl class="result-itinerary"><div><dt>DESTINATION</dt><dd>${taste.destination.label}</dd></div><div><dt>MY MOOD</dt><dd>${taste.mood.label}</dd></div><div><dt>IN MY SUITCASE</dt><dd>${taste.item.label}</dd></div></dl>
        <p class="result-signature script">With love, LUMINO</p><p class="result-slogan">${brand.slogan}</p>
      </div>
    </div>
    <div class="result-actions"><p>${complete?'다섯 가지 추억을 모두 모았어요. 여행 카드를 저장하고 공유해보세요.':'LUXURY 스탬프를 모았어요. 남은 추억을 모으면 여행 카드를 저장할 수 있어요.'}</p><div><button class="l-btn" data-action="${complete?'card':'passport'}">${complete?'나의 여행 카드 저장하기':'나의 여권 · 남은 미션 보기'} ↗</button><button class="quiet-link" data-action="taste-edit">취향 다시 선택하기 →</button></div></div>`;
}

export function tastePreviewMarkup(answers) {
  const destination = questions[0].options.find(option => option.value === answers.destination);
  // 선택 전에는 특정 여행지를 고른 것처럼 표시하지 않고 여행지 세 장을 미리 보여줍니다.
  const options = destination ? [destination] : questions[0].options;
  return `<div class="taste-preview-photos ${destination?'has-destination':''}">${options.map(option=>`<figure><img src="${option.image}" alt="${option.label}" width="400" height="320"><figcaption>${option.label}</figcaption></figure>`).join('')}</div><span class="script">${destination?'My next little adventure.':'A world of lovely possibilities.'}</span>`;
}
