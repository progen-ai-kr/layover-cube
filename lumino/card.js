import { collection } from '../data/collection.js';
import { gallery } from '../data/gallery.js';
import { questions } from '../data/taste.js';
import { stamps } from '../data/stamps.js';
import { earnedIds } from './state.js';
import { icon } from './icons.js';
import { invitation } from '../data/invitation.js';
const imageCache = new Map();
function loadImage(src) {
  if (!imageCache.has(src)) imageCache.set(src, new Promise((resolve, reject) => {
    const img = new Image();
    const timeout = setTimeout(() => { imageCache.delete(src); reject(new Error('이미지 로딩 시간이 길어지고 있어요. 다시 시도해주세요.')); }, 15000);
    img.crossOrigin = 'anonymous';
    img.onload = () => { clearTimeout(timeout); resolve(img); };
    img.onerror = () => { clearTimeout(timeout); imageCache.delete(src); reject(new Error('카드 이미지를 불러오지 못했어요. 연결 상태를 확인해주세요.')); };
    img.src = src;
  }));
  return imageCache.get(src);
}
function cover(ctx, img, x, y, w, h) {
  const ratio = Math.max(w / img.width, h / img.height);
  const sw = w / ratio, sh = h / ratio;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}
function drawLabel(ctx, text, x, y, maxWidth, size, color, family = 'serif') {
  ctx.fillStyle = color;
  ctx.font = `${size}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && size > 12) { size -= 1; ctx.font = `${size}px ${family}`; }
  ctx.fillText(text, x, y);
}
function polaroid(ctx, image, x, y, w, h, rotation, caption, colors) {
  ctx.save();ctx.translate(x,y);ctx.rotate(rotation);
  ctx.shadowColor = colors.shadow;ctx.shadowBlur = 18;ctx.shadowOffsetY = 9;
  ctx.fillStyle = colors.cream;ctx.fillRect(0,0,w,h);ctx.shadowColor = 'transparent';
  cover(ctx,image,14,14,w-28,h-64);
  ctx.textAlign = 'center';drawLabel(ctx,caption,w/2,h-22,w-30,26,colors.burgundy,'"Lumino Script", cursive');
  ctx.restore();
}
// Canvas export avoids browser screenshot/CSS rendering dependencies and produces a real PNG.
export async function renderTravelCard(canvas, state) {
  if (earnedIds(state).length !== 5) throw new Error('다섯 스탬프를 먼저 모아주세요.');
  const look = [...collection, ...(state.productLooks || [])].find(c => c.id === state.favoriteId);
  const photo = gallery.find(g => g.id === state.photoId);
  const destination = questions[0].options.find(o => o.value === state.answers.destination);
  const mood = questions[1].options.find(o => o.value === state.answers.mood);
  const item = questions[2].options.find(o => o.value === state.answers.item);
  if (!look || !photo || !destination || !mood || !item) throw new Error('선택 정보를 확인해주세요.');
  await document.fonts.ready;
  const css = getComputedStyle(document.documentElement);
  const get = key => css.getPropertyValue(key).trim();
  const colors = { cream:get('--cream'), burgundy:get('--burgundy'), rose:get('--rose'), pink:get('--pink'), gold:get('--gold'), blue:get('--blue-ink'), goldInk:get('--gold-ink'), shadow:get('--shadow-tint') };
  const stampImages = stamps.map(s => {
    const color = s.color === 'blue' ? colors.blue : s.color === 'gold' ? colors.goldInk : colors.rose;
    const svg = icon(s.icon).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" ').replaceAll('currentColor', color);
    return loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
  });
  const [background, outfitImage, galleryImage, paper, ...symbols] = await Promise.all([loadImage(destination.image), loadImage(look.image), loadImage(photo.image), loadImage(invitation.paper), ...stampImages]);
  canvas.width = 1600;canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  // 큰 화보 엽서 + 손편지 + 선택한 의상의 폴라로이드. 모든 사진은 방문자의 선택입니다.
  ctx.drawImage(paper,0,0,1600,1000);
  ctx.save();ctx.globalAlpha=.48;ctx.fillStyle=colors.cream;ctx.fillRect(0,0,1600,1000);ctx.restore();
  ctx.save();ctx.globalAlpha=.25;cover(ctx,background,20,20,1560,960);ctx.restore();
  ctx.strokeStyle=colors.gold;ctx.lineWidth=2;ctx.strokeRect(26,26,1548,948);
  ctx.strokeStyle=colors.burgundy;ctx.lineWidth=1;ctx.strokeRect(34,34,1532,932);
  ctx.textAlign='left';drawLabel(ctx,'LUMINO',70,94,450,59,colors.burgundy,'"Lumino Serif", serif');
  drawLabel(ctx,'A Sparkling Little Journey — A Cozy and Lovely World.',390,82,1050,31,colors.burgundy,'"Lumino Script", cursive');

  // 여행지 사진은 엽서 가장자리에, 저장한 갤러리 사진은 가장 넓은 영역에 담습니다.
  ctx.save();ctx.translate(100,156);ctx.rotate(-.035);
  ctx.shadowColor=colors.shadow;ctx.shadowBlur=24;ctx.shadowOffsetY=14;
  ctx.fillStyle=colors.cream;ctx.fillRect(0,0,1410,710);ctx.shadowColor='transparent';
  cover(ctx,background,12,12,1386,686);
  ctx.save();ctx.globalAlpha=.18;ctx.drawImage(paper,12,12,1386,686);ctx.restore();
  cover(ctx,galleryImage,28,28,906,628);
  ctx.strokeStyle=colors.cream;ctx.lineWidth=9;ctx.strokeRect(28,28,906,628);
  ctx.fillStyle=colors.cream+'eb';ctx.fillRect(420,590,496,58);
  ctx.textAlign='right';drawLabel(ctx,photo.title,898,628,460,29,colors.burgundy,'"Lumino Script", cursive');
  ctx.drawImage(paper,934,20,453,672);
  ctx.textAlign='center';
  drawLabel(ctx,'To my LUMINO traveler',1160,105,360,38,colors.burgundy,'"Lumino Script", cursive');
  ctx.strokeStyle=colors.rose;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(1000,129);ctx.lineTo(1320,129);ctx.stroke();
  drawLabel(ctx,state.traveler || 'My lovely traveler',1160,205,330,43,colors.burgundy,'"Lumino Serif", serif');
  drawLabel(ctx,'당신의 반짝이는 여행이',1160,278,330,23,colors.burgundy,'sans-serif');
  drawLabel(ctx,'언제나 이어지길,',1160,319,330,23,colors.burgundy,'sans-serif');
  drawLabel(ctx,'LUMINO와 함께.',1160,360,330,24,colors.burgundy,'sans-serif');
  drawLabel(ctx,destination.label,1160,437,330,22,colors.burgundy,'sans-serif');
  drawLabel(ctx,`${mood.label} · ${item.label}`,1160,474,330,20,colors.burgundy,'sans-serif');
  drawLabel(ctx,'With love, always.',1160,550,330,44,colors.rose,'"Lumino Script", cursive');
  ctx.restore();

  // 의상은 별도의 종이 사진으로 겹쳐서, 선택한 상품 전체가 기억에 남게 합니다.
  polaroid(ctx,outfitImage,65,365,358,514,-.10,look.title,colors);
  ctx.save();ctx.translate(185,353);ctx.rotate(-.2);ctx.fillStyle=colors.pink;ctx.globalAlpha=.8;ctx.fillRect(0,0,118,34);ctx.restore();

  // 잉크 도장은 여행 카드 하단의 종이 띠에 모아 인쇄합니다.
  ctx.save();ctx.translate(440,817);ctx.rotate(-.012);
  ctx.shadowColor=colors.shadow;ctx.shadowBlur=12;ctx.shadowOffsetY=4;
  ctx.fillStyle=colors.cream;ctx.fillRect(0,0,965,134);ctx.shadowColor='transparent';
  ctx.strokeStyle=colors.gold;ctx.lineWidth=1;ctx.strokeRect(7,7,951,120);
  stamps.forEach((stamp,i) => {
    const color=stamp.color==='blue'?colors.blue:stamp.color==='gold'?colors.goldInk:colors.rose;
    ctx.save();ctx.translate(105+i*185,65);ctx.rotate((i%2?1:-1)*.12);
    ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,49,0,Math.PI*2);ctx.stroke();
    ctx.setLineDash([2,3]);ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,43,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.drawImage(symbols[i],-22,-29,44,44);ctx.fillStyle=color;ctx.font='13px "Lumino Serif", serif';ctx.textAlign='center';ctx.fillText(stamp.name,0,28);ctx.font='6px sans-serif';ctx.fillText('LUMINO · LITTLE JOURNEY',0,-34);ctx.restore();
  });
  ctx.restore();

  const itemSymbol=item.value==='crown'?'crown':item.value==='ribbon'?'bow':item.value==='pearls'?'diamond':'heart';
  const svgImage=name=>loadImage('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(icon(name).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" ').replaceAll('currentColor',colors.rose)));
  const [ornament,plane,bow]=await Promise.all([svgImage(itemSymbol),svgImage('plane'),loadImage(invitation.ribbon)]);
  ctx.save();ctx.translate(1450,108);ctx.rotate(.2);ctx.drawImage(plane,-40,-40,80,80);ctx.restore();
  ctx.save();ctx.strokeStyle=colors.rose;ctx.lineWidth=2;ctx.setLineDash([8,9]);ctx.beginPath();ctx.moveTo(1250,115);ctx.bezierCurveTo(1300,180,1380,170,1420,125);ctx.stroke();ctx.restore();
  ctx.save();ctx.translate(73,200);ctx.rotate(-.2);ctx.strokeStyle=colors.rose;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,50,0,Math.PI*2);ctx.stroke();ctx.drawImage(ornament,-30,-33,60,60);ctx.restore();
  ctx.drawImage(bow,1350,794,210,140);
  ctx.textAlign='right';drawLabel(ctx,'5 / 5 SPARKLING MOMENTS · FOREVER YOURS',1500,968,1000,13,colors.burgundy,'sans-serif');
  return new Promise((resolve,reject) => { try { canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG 생성에 실패했어요. 다시 시도해주세요.')), 'image/png'); } catch { reject(new Error('외부 이미지의 다운로드 권한을 확인해주세요. 로컬 images/ 이미지를 사용하면 저장할 수 있어요.')); } });
}
export function downloadBlob(blob, filename) {
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
