import { stamps } from '../data/stamps.js';
import { journeyArt } from '../data/journey-art.js';
import { collection } from '../data/collection.js';
import { gallery } from '../data/gallery.js';
import { icon, stampMarkup } from './icons.js';
import { pageHref } from '../data/pages.js';

export const missionHref = stamp => pageHref(stamp.chapter) + stamp.target;
const missionButton = (stamp, earned, className = 'quiet-link') => `<button type="button" class="${className}" data-action="mission" data-id="${stamp.id}">${earned ? '다시 둘러보기' : stamp.actionLabel} <span aria-hidden="true">→</span></button>`;

export function missionMapMarkup(ids) {
  const next = stamps.find(stamp => !ids.includes(stamp.id));
  return stamps.map((stamp, index) => {
    const earned = ids.includes(stamp.id);
    return `<article class="chapter-postcard ${earned ? 'is-collected' : ''} ${next?.id === stamp.id ? 'is-next' : ''}">
      <header>${stampMarkup(stamp, earned, true)}<div><p class="mission-location">CHAPTER 0${index+1}</p><h3>${stamp.title}</h3><p>${stamp.condition}</p></div></header>
      <button type="button" class="chapter-photo" data-action="mission" data-id="${stamp.id}" aria-label="${stamp.title} · ${stamp.actionLabel}"><img src="${journeyArt.previews[stamp.id]}" alt="${stamp.title}" loading="lazy" width="600" height="700"><span class="chapter-photo-caption script">${['Bon voyage, my dear.','Find your romance.','A little fantasy.','With love, LUMINO.','Your lovely journey.'][index]}</span><span class="chapter-stamp-paper">${stampMarkup(stamp,earned,true)}<em>${earned?'GET!':'FOR YOU'}</em></span></button>
      <div class="chapter-postcard-action"><span>${earned ? '수집 완료 ✓' : next?.id===stamp.id?'다음 추천 미션':'미수집'}</span>${missionButton(stamp,earned)}</div></article>`;
  }).join('');
}

export function passportMarkup({ state, ids, selectedStamp, storageFailed, esc, closeButton }) {
  const next = stamps.find(stamp => !ids.includes(stamp.id));
  const active = selectedStamp || next?.id;
  const look = [...collection,...state.productLooks].find(item=>item.id===state.favoriteId);
  const photo = gallery.find(item=>item.id===state.photoId);
  return `${closeButton('여권')}<div class="passport-layout">
    <div class="passport-object">
      <img class="passport-object-art" src="${journeyArt.passport}" alt="핑크 가죽 표지와 리본, 장미로 장식한 루미노 여권" width="1100" height="1375">
      <nav class="passport-bookmarks" aria-label="여권 목차"><button data-action="passport-section" data-section="stamps">STAMP</button><button data-action="passport-section" data-section="memories">MEMORIES</button><button data-action="passport-section" data-section="note">NOTE</button></nav>
      <section class="passport-leaf" aria-labelledby="passport-title">
        <h2 id="passport-title">LUMINO PASSPORT</h2><p class="script">My little journey</p>
        <div id="passport-stamps" class="passport-stamps">${stamps.map(stamp=>`<button type="button" class="passport-stamp-button" data-action="stamp-guide" data-id="${stamp.id}" aria-label="${stamp.name} ${ids.includes(stamp.id)?'수집 완료, 미션 보기':'미수집, 모으는 방법 보기'}">${stampMarkup(stamp,ids.includes(stamp.id))}<small>${ids.includes(stamp.id)?'수집 완료 ✓':'모으는 방법'}</small></button>`).join('')}</div>
        <div class="passport-progress-label"><span>MY JOURNEY PROGRESS</span><strong>${ids.length} <span>/ 5</span></strong></div><progress class="journey-progress" max="5" value="${ids.length}" aria-label="스탬프 수집 진행률">${ids.length}/5</progress>
        <p class="remaining-copy">${next?`스탬프 ${5-ids.length}개를 더 모으면 여행 카드가 완성돼요.`:'다섯 가지 추억을 모두 모았어요!'}</p>
        <div class="passport-next-action">${next?`<p class="next-mission-copy"><strong>다음 미션 · ${next.name}</strong><span>${next.condition}</span></p>${missionButton(next,false,'l-btn')}`:'<button class="l-btn" data-action="card">나의 여행 카드 받기 ↗</button>'}</div>
        <button class="quiet-link passport-guide-link" data-action="passport-section" data-section="guide">전체 수집 방법 보기 ↓</button>
      </section>
    </div>
    <div class="passport-mobile-next">${next?`<p class="eyebrow">NEXT MEMORY · ${next.name}</p><p>${next.condition}</p>${missionButton(next,false,'l-btn')}`:'<p>다섯 가지 추억을 모두 모았어요!</p><button class="l-btn" data-action="card">나의 여행 카드 받기 ↗</button>'}</div>
    <aside class="passport-guide-sheet" aria-labelledby="passport-guide-title">
      <header><p class="eyebrow">YOUR LITTLE JOURNEY GUIDE</p><h3 id="passport-guide-title">스탬프는 이렇게 모아요</h3><p class="passport-guide-intro">아래 활동을 마치면 여권에 자동으로 찍혀요.<br>순서는 자유예요. 원하는 곳부터 여행해보세요.</p></header>
      <ol class="passport-missions">${stamps.map((stamp,index)=>{
        const earned=ids.includes(stamp.id);
        return `<li id="mission-${stamp.id}" class="mission-row ${earned?'is-collected':''} ${active===stamp.id?'is-current':''}" ${next?.id===stamp.id?'aria-current="step"':''}><div class="mission-row-heading"><span class="mission-number">${earned?icon('check'):`0${index+1}`}</span><div><p class="mission-location">${stamp.location}</p><h4>${stamp.name}<span>${earned?'수집 완료':'미수집'}</span></h4></div></div><p>${stamp.steps.join('<br>')}</p>${missionButton(stamp,earned)}</li>`;
      }).join('')}</ol>
      <details id="passport-memories" class="passport-memories"><summary>MEMORIES · 내가 고른 추억</summary><div>${[look,photo].filter(Boolean).map(item=>`<figure><img src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy"><figcaption>${esc(item.title)}</figcaption></figure>`).join('')||'<p>의상과 사진을 선택하면 이곳에 차곡차곡 담겨요.</p>'}</div></details>
      <details id="passport-note" class="passport-personalize"><summary>NOTE · 여행 카드에 이름 넣기 <span>(선택)</span></summary><label for="traveler-name" class="traveler-label">여행 카드에 담을 이름</label><input id="traveler-name" class="traveler-input" placeholder="당신의 이름" value="${esc(state.traveler)}" maxlength="24" autocomplete="nickname"></details>
      <div class="passport-reward">${icon('sparkle')}<p><strong>다 모으면, 나만의 여행 카드</strong><span>선택한 의상·사진·취향을 담아 PNG로 저장하고 공유해요.</span></p></div>
      <p class="passport-small">${storageFailed?'저장이 차단되어 이번 방문에서만 기록이 유지돼요.':'이 브라우저에 자동 저장돼요. 다음에도 이어서 여행하세요.'}</p>
      <button type="button" class="quiet-link invitation-replay" data-action="replay-intro">초대장 다시 보기 ↗</button>
    </aside>
  </div>`;
}

export function completionMarkup(closeButton) {
  return `${closeButton('여행 완료')}<div class="completion-spread"><img src="${journeyArt.spread}" alt="리본과 장미로 장식된 펼쳐진 루미노 여권" width="1536" height="1024"><div class="completion-stamp-page"><p class="script">My sparkling memories</p><div>${stamps.map((stamp,i)=>`<span style="--stamp-delay:${i*.12}s">${stampMarkup(stamp,true)}</span>`).join('')}</div><span class="completion-count">5 / 5 · ALL COLLECTED</span></div><div class="completion-letter"><p class="script">Congratulations!</p><h2 id="completion-title">You completed your<br>LUMINO journey!</h2><p>당신만의 반짝이는 여행이<br>완성되었습니다.</p><span class="script">A Sparkling<br>Little Journey</span></div></div><div class="completion-cta"><p>좋아하는 옷, 소중한 장면, 당신만의 취향을 한 장의 엽서에 담았어요.</p><button class="l-btn" data-action="card">나의 여행 카드 펼쳐보기 ↗</button></div>`;
}

export function missionNoticeMarkup(stamp, earned) {
  return `<span class="mission-notice-icon ${stamp.color}">${icon(earned?'check':stamp.icon)}</span><div><p class="mission-location">${earned?'COLLECTED · 수집 완료':'LITTLE JOURNEY · 이 페이지의 미션'}<span>${stamp.name}</span></p><p>${earned?`${stamp.name} 스탬프를 이미 모았어요. 마음에 드는 순간을 계속 탐험해보세요.`:stamp.condition+' → '+stamp.name+' 스탬프'}</p></div><button class="quiet-link" data-action="passport">${earned?'나의 여권 보기':'전체 미션 보기'} ↗</button>`;
}
