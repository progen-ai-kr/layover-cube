import { invitation } from '../data/invitation.js';
import { icon } from './icons.js';
import { invitationMotion } from './invitation-motion.js';

export function createInvitation(dialog, { openDialog, onFinish, reducedMotion, lowPower }) {
  let opening = false;
  let run = 0;
  let animations = [];
  let ready;

  function cancelAnimations() {
    animations.forEach(animation => animation.cancel());
    animations = [];
  }

  function show() {
    run++;
    cancelAnimations();
    opening = false;
    dialog.classList.remove('intro-opening', 'intro-still');
    const sparks = Array.from({ length: 10 }, (_, i) => `<i style="--i:${i};--burst-x:${Math.cos(i * .9) * 140}px;--burst-y:${Math.sin(i * .9) * 150 - 70}px">${i % 2 ? '✦' : '♡'}</i>`).join('');
    dialog.innerHTML = `
      <div class="invitation-ambient" aria-hidden="true"><img src="${invitation.scene}" alt=""></div>
      <div class="invitation-theatre">
        <p class="invitation-eyebrow">A LITTLE INVITATION, JUST FOR YOU</p>
        <div class="invitation-stage">
          <img class="invitation-scene" src="${invitation.scene}" alt="장미와 진주 사이, 새틴 리본과 왕관 인장으로 장식한 핑크 초대장" fetchpriority="high" width="1254" height="1254">
          <div class="invitation-flap" aria-hidden="true">
            <div class="flap-face flap-front"><img src="${invitation.flap}" alt="" width="1200" height="429"><div class="invitation-cover-logo">${icon('crown')}<span>LUMINO</span></div></div>
            <div class="flap-face flap-back"><img src="${invitation.flap}" alt="" width="1200" height="429"></div>
          </div>
          <div class="invitation-letter" aria-hidden="true">
            <img class="invitation-paper" src="${invitation.paper}" alt="" width="900" height="900">
            <div class="invitation-letter-copy">${icon('crown')}<p>YOU ARE INVITED TO</p><h2>LUMINO</h2><span class="invitation-rule" aria-hidden="true">✦</span><p class="script">A Sparkling Little Journey,<br>A Cozy and Lovely World.</p><p class="invitation-welcome">당신의 반짝이는 여행에<br>초대합니다.</p></div>
          </div>
          <img class="invitation-pocket" src="${invitation.scene}" alt="" aria-hidden="true" width="1254" height="1254">
          <div class="invitation-address"><p>YOU ARE INVITED TO</p><h2>LUMINO</h2></div>
          <div class="invitation-ribbon" aria-hidden="true"><img src="${invitation.ribbon}" alt="" width="1254" height="836"></div>
          <button type="button" class="invitation-ribbon-hit" data-action="open-intro" aria-label="리본 초대장 열기"><span class="ribbon-glint" aria-hidden="true">✦</span></button>
          <button type="button" class="l-btn invitation-open-button" data-action="open-intro" autofocus>OPEN YOUR INVITATION <span aria-hidden="true">›</span></button>
          <div class="invitation-sparks" aria-hidden="true">${sparks}</div>
        </div>
        <p class="invitation-caption">초대장을 열어, 당신만의 작은 여행을 시작해보세요.</p>
      </div>
      <p class="sr-only" role="status" id="invitation-status"></p>
      <button type="button" class="skip-intro" data-action="skip-intro">SKIP INTRO <span aria-hidden="true">→</span></button>`;
    // 클릭 전부터 부품을 디코딩합니다. 모션 중 네트워크 요청/이미지 교체가 없습니다.
    ready = Promise.allSettled([...dialog.querySelectorAll('img')].map(img => img.decode()));
    openDialog('intro-dialog');
  }

  async function open() {
    if (opening || !dialog.open) return;
    opening = true;
    const currentRun = run;
    dialog.querySelectorAll('[data-action="open-intro"]').forEach(button => { button.disabled = true; });
    dialog.querySelector('#invitation-status').textContent = '초대장이 열리고 있습니다.';
    await ready;
    if (currentRun !== run || !dialog.open) return;
    dialog.classList.add('intro-opening');
    dialog.querySelector('.invitation-letter').setAttribute('aria-hidden', 'false');

    // 부품마다 같은 시작 시각을 적용합니다. 별도 종료 타이머가 화면을 끊지 않습니다.
    const still = reducedMotion.matches || lowPower;
    dialog.classList.toggle('intro-still', still);
    const duration = still ? 1400 : invitation.duration;
    const startTime = document.timeline.currentTime;
    const motion = still ? invitationMotion.filter(item => item.selector === 'self') : invitationMotion;
    animations = motion.flatMap(({ selector, frames }) => (selector === 'self' ? [dialog] : [...dialog.querySelectorAll(selector)]).map(element => {
      const animation = element.animate(frames, { duration, fill: 'both', easing: 'linear' });
      animation.startTime = startTime;
      return animation;
    }));
    try {
      await Promise.all(animations.map(animation => animation.finished));
      if (currentRun === run && dialog.open) finish();
    } catch { /* SKIP / ESC / 다시 보기로 취소한 재생은 완료 처리하지 않습니다. */ }
  }

  function finish() {
    if (!dialog.open) return;
    run++;
    cancelAnimations();
    dialog.close();
    dialog.classList.remove('intro-opening', 'intro-still');
    opening = false;
    onFinish();
  }
  return { show, open, finish };
}
