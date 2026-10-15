const paths = {
  crown: '<path d="m4 8 4 5 4-8 4 8 4-5-2 12H6L4 8Z"/><path d="M6 17h12"/><circle cx="4" cy="6" r="1"/><circle cx="12" cy="3" r="1"/><circle cx="20" cy="6" r="1"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  plane: '<path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="m22 2-11 11"/>',
  castle: '<path d="M3 21V10h5v11m8 0V10h5v11M8 21V8h8v13M2 10l3.5-5L9 10m6 0 3.5-5 3.5 5M8 8l4-7 4 7M2 21h20M10 21v-5a2 2 0 0 1 4 0v5"/>',
  bow: '<path d="M10 10C0-1 0 19 10 13m4-3C24-1 24 19 14 13"/><rect x="10" y="9" width="4" height="5" rx="1"/><path d="m10 14-5 8 4-1 2 2 1-9m2 0 5 8-4-1-2 2-1-9"/>',
  diamond: '<path d="m3 3 18 0 3 6-12 14L0 9 3 3Z" transform="translate(2 1) scale(.83)"/><path d="M2 8h20M8 4 6 8l6 14 6-14-2-4"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  passport: '<rect x="5" y="2" width="15" height="20" rx="2"/><path d="M5 3 3 4v17a2 2 0 0 0 2 2M9 18h7"/><circle cx="12.5" cy="10" r="4"/><path d="M8.5 10h8M12.5 6a8 8 0 0 0 0 8 8 8 0 0 0 0-8Z"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  arrow: '<path d="M3 12h18m-6-6 6 6-6 6"/>', check: '<path d="m5 12 4 4L19 6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6"/>', share: '<path d="M12 16V2m-5 5 5-5 5 5M5 11H3v11h18V11h-2"/>',
  sparkle: '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>'
};
export const icon = (name, className = '') => `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.sparkle}</svg>`;
export const stampMarkup = (stamp, earned, small = false) => `<span class="stamp ${stamp.color} ${earned ? 'earned' : 'unearned'} ${small ? 'small-stamp' : ''}"><span class="stamp-orbit">LUMINO · LITTLE JOURNEY</span>${icon(stamp.icon)}<strong>${stamp.name}</strong><span class="stamp-stars">✦ · ✦</span></span>`;
