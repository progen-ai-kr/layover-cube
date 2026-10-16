// offset은 한 번의 5.2초 재생 안의 위치입니다. 동작을 겹쳐 정지 구간을 없앱니다.
const soft = 'cubic-bezier(.22,.61,.36,1)';
const silk = 'cubic-bezier(.45,0,.2,1)';
export const invitationMotion = [
  {
    selector: '.ribbon-left',
    frames: [
      { offset: 0, transform: 'translate(0,0) rotate(0deg) scale(1,1)', easing: silk },
      { offset: .13, transform: 'translate(-8%,2%) rotate(-6deg) scale(1.12,.78)', easing: soft },
      { offset: .34, transform: 'translate(-20%,32%) rotate(-18deg) scale(.9,.76)', easing: soft },
      { offset: .58, transform: 'translate(-22%,35%) rotate(-16deg) scale(.9,.78)' },
      { offset: 1, transform: 'translate(-22%,35%) rotate(-16deg) scale(.9,.78)' }
    ]
  },
  {
    selector: '.ribbon-right, .ribbon-seal', // 인장을 리본에서 분리해 떨어뜨리지 않습니다.
    frames: [
      { offset: 0, transform: 'translate(0,0) rotate(0deg) scale(1,1)', easing: silk },
      { offset: .14, transform: 'translate(8%,3%) rotate(6deg) scale(1.12,.78)', easing: soft },
      { offset: .36, transform: 'translate(20%,32%) rotate(18deg) scale(.9,.76)', easing: soft },
      { offset: .59, transform: 'translate(22%,35%) rotate(16deg) scale(.9,.78)' },
      { offset: 1, transform: 'translate(22%,35%) rotate(16deg) scale(.9,.78)' }
    ]
  },
  {
    selector: '.invitation-flap',
    frames: [
      { offset: 0, transform: 'rotateX(0deg)', zIndex: 5 },
      { offset: .1, transform: 'rotateX(0deg)', zIndex: 5, easing: silk },
      { offset: .23, transform: 'rotateX(-90deg)', zIndex: 5 },
      { offset: .231, transform: 'rotateX(-90.1deg)', zIndex: 1, easing: soft },
      { offset: .43, transform: 'rotateX(-178deg)', zIndex: 1 },
      { offset: 1, transform: 'rotateX(-178deg)', zIndex: 1 }
    ]
  },
  {
    selector: '.invitation-letter',
    frames: [
      { offset: 0, transform: 'translateY(0)' },
      { offset: .22, transform: 'translateY(0)', easing: silk },
      { offset: .63, transform: 'translateY(-44cqw)' },
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
