import { invitation } from '../data/invitation.js';
import { icon } from './icons.js';

// 장면은 사진으로, 문구·버튼·시간 제어는 실제 DOM으로 구성합니다.
export function createInvitation(dialog, { openDialog, onFinish, reducedMotion, lowPower }) {
  let timer;
  let opening = false;
  let run = 0;
  function show() {
    clearTimeout(timer);
    run++;
    opening = false;
    dialog.classList.remove('intro-opening');
    const sparks = Array.from({ length: 12 }, (_, i) => `<i style="--i:${i};--burst-x:${Math.cos(i * .9) * 180}px;--burst-y:${Math.sin(i * .9) * 190 - 50}px">${i % 2 ? '✦' : '♡'}</i>`).join('');
    dialog.innerHTML = `
      <div class="invitation-ambient" aria-hidden="true"><img src="${invitation.closed}" alt=""></div>
      <div class="invitation-theatre">
        <p class="invitation-eyebrow">A LITTLE INVITATION, JUST FOR YOU</p>
        <div class="invitation-stage">
          <img class="invitation-frame frame-closed" src="${invitation.closed}" alt="장미와 진주 사이, 새틴 리본과 왕관 왁스 인장으로 봉한 핑크 초대장" fetchpriority="high" width="1254" height="1254">
          <img class="invitation-frame frame-untied" src="${invitation.untied}" alt="" aria-hidden="true" width="1254" height="1254">
          <img class="invitation-frame frame-open" src="${invitation.open}" alt="" aria-hidden="true" width="1254" height="1254">
          <div class="invitation-cover-logo" aria-hidden="true">${icon('crown')}<span>LUMINO</span></div>
          <div class="invitation-address"><p>YOU ARE INVITED TO</p><h2>LUMINO</h2></div>
          <button type="button" class="invitation-ribbon-hit" data-action="open-intro" aria-label="새틴 리본을 풀고 초대장 열기"><span class="ribbon-glint" aria-hidden="true">✦</span></button>
          <button type="button" class="l-btn invitation-open-button" data-action="open-intro">OPEN YOUR INVITATION <span aria-hidden="true">›</span></button>
          <div class="invitation-letter-copy" aria-hidden="true">${icon('crown')}<p>YOU ARE INVITED TO</p><h2>LUMINO</h2><span class="invitation-rule" aria-hidden="true">✦</span><p class="script">A Sparkling Little Journey,<br>A Cozy and Lovely World.</p><p class="invitation-welcome">당신의 반짝이는 여행에<br>초대합니다.</p></div>
          <div class="invitation-sparks" aria-hidden="true">${sparks}</div>
        </div>
        <p class="invitation-caption">리본을 풀어, 당신만의 작은 여행을 시작해보세요.</p>
      </div>
      <p class="sr-only" role="status" id="invitation-status"></p>
      <button type="button" class="skip-intro" data-action="skip-intro">SKIP INTRO <span aria-hidden="true">→</span></button>`;
    openDialog('intro-dialog');
  }
  async function open() {
    if (opening) return;
    opening = true;
    const currentRun = run;
    dialog.querySelectorAll('[data-action="open-intro"]').forEach(button => { button.disabled = true; });
    dialog.querySelector('#invitation-status').textContent = '리본이 풀리고 초대장이 열립니다.';
    // 느린 연결에서도 중간 장면이 빈 화면이 되지 않도록 준비하되, SKIP은 항상 즉시 동작합니다.
    const images = [...dialog.querySelectorAll('.invitation-frame')];
    await Promise.race([Promise.allSettled(images.map(img => img.decode())), new Promise(resolve => setTimeout(resolve, 1800))]);
    if (currentRun !== run || !dialog.open) return;
    dialog.classList.add('intro-opening');
    dialog.querySelector('.invitation-letter-copy').setAttribute('aria-hidden', 'false');
    timer = setTimeout(finish, reducedMotion.matches || lowPower ? 100 : invitation.duration);
  }
  function finish() {
    if (!dialog.open) return;
    run++;
    clearTimeout(timer);
    dialog.close();
    dialog.classList.remove('intro-opening');
    opening = false;
    onFinish();
  }
  return { show, open, finish };
}
