// offset은 한 번의 5.2초 재생 안의 위치입니다. 동작을 겹쳐 정지 구간을 없앱니다.
const soft = 'cubic-bezier(.22,.61,.36,1)';
const silk = 'cubic-bezier(.45,0,.2,1)';
export const invitationMotion = [
  {
    // 리본과 인장은 하나의 장식입니다. 분할·마스킹·비균일 늘이기 없이 옆에 내려놓습니다.
    selector: '.invitation-ribbon',
    frames: [
      { offset: 0, transform: 'translate(0,0) rotate(0deg) rotateX(0deg) scale(1)', easing: soft },
      { offset: .08, transform: 'translate(0,-2%) rotate(-1deg) rotateX(-6deg) scale(1.015)', easing: silk },
      { offset: .34, transform: 'translate(11%,37%) rotate(11deg) rotateX(50deg) scale(.64)', easing: soft },
      { offset: .46, transform: 'translate(12%,38%) rotate(10deg) rotateX(52deg) scale(.62)' },
      { offset: 1, transform: 'translate(12%,38%) rotate(10deg) rotateX(52deg) scale(.62)' }
    ]
  },
  {
    selector: '.invitation-flap',
    frames: [
      { offset: 0, transform: 'rotateX(0deg)', zIndex: 5 },
      { offset: .29, transform: 'rotateX(0deg)', zIndex: 5, easing: silk },
      { offset: .43, transform: 'rotateX(-90deg)', zIndex: 5 },
      { offset: .431, transform: 'rotateX(-90.1deg)', zIndex: 1, easing: soft },
      { offset: .6, transform: 'rotateX(-178deg)', zIndex: 1 },
      { offset: 1, transform: 'rotateX(-178deg)', zIndex: 1 }
    ]
  },
  {
    selector: '.invitation-letter',
    frames: [
      { offset: 0, transform: 'translateY(0)' },
      { offset: .43, transform: 'translateY(0)', easing: silk },
      { offset: .76, transform: 'translateY(-44cqw)' },
      { offset: 1, transform: 'translateY(-44cqw)' }
    ]
  },
  {
    selector: '.invitation-address, .invitation-open-button, .invitation-caption',
    frames: [{ offset: 0, opacity: 1 }, { offset: .1, opacity: 0 }, { offset: 1, opacity: 0 }]
  },
  {
    selector: 'self',
    frames: [{ offset: 0, opacity: 1 }, { offset: .88, opacity: 1, easing: 'ease-in-out' }, { offset: 1, opacity: 0 }]
  }
];
