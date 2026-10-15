import { collection } from '../data/collection.js';
import { gallery } from '../data/gallery.js';
import { questions } from '../data/taste.js';
import { stamps } from '../data/stamps.js';
import { earnedIds } from './state.js';
import { icon } from './icons.js';
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
    const svg = icon(s.icon).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" ').replace('currentColor', color);
    return loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
  });
  const [background, outfitImage, galleryImage, ...symbols] = await Promise.all([loadImage(destination.image), loadImage(look.image), loadImage(photo.image), ...stampImages]);
  canvas.width = 1600;canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle=colors.cream;ctx.fillRect(0,0,1600,1000);
  cover(ctx,background,18,18,1564,964);
  const fade=ctx.createLinearGradient(550,0,1500,0);fade.addColorStop(0,'transparent');fade.addColorStop(.45,colors.cream+'ee');fade.addColorStop(1,colors.cream);ctx.fillStyle=fade;ctx.fillRect(18,18,1564,964);
  ctx.strokeStyle=colors.cream;ctx.lineWidth=5;ctx.strokeRect(28,28,1544,944);
  ctx.strokeStyle=colors.burgundy;ctx.lineWidth=1;ctx.strokeRect(43,43,1514,914);ctx.strokeRect(51,51,1498,898);
  ctx.fillStyle=colors.cream+'ed';ctx.fillRect(70,65,720,122);ctx.strokeStyle=colors.gold;ctx.lineWidth=1;ctx.strokeRect(75,70,710,112);
  ctx.textAlign='left';drawLabel(ctx,'LUMINO',92,132,500,72,colors.burgundy,'"Lumino Serif", serif');
  drawLabel(ctx,'A Sparkling Little Journey — A Cozy and Lovely World.',92,166,680,26,colors.burgundy,'"Lumino Script", cursive');
  polaroid(ctx,outfitImage,100,245,370,510,-.075,look.title,colors);
  polaroid(ctx,galleryImage,430,355,400,310,.09,photo.title,colors);
  ctx.fillStyle=colors.pink;ctx.save();ctx.translate(250,224);ctx.rotate(-.16);ctx.globalAlpha=.7;ctx.fillRect(0,0,125,34);ctx.restore();
  ctx.textAlign='left';drawLabel(ctx,'TO MY LUMINO TRAVELER',900,260,580,17,colors.burgundy,'sans-serif');
  drawLabel(ctx,state.traveler || 'My lovely traveler',898,330,570,58,colors.burgundy,'"Lumino Serif", serif');
  ctx.strokeStyle=colors.rose;ctx.beginPath();ctx.moveTo(900,359);ctx.lineTo(1470,359);ctx.stroke();
  drawLabel(ctx,destination.label,900,412,550,31,colors.burgundy,'sans-serif');
  drawLabel(ctx,`${mood.label} soul · ${item.label}`,900,457,550,24,colors.burgundy,'sans-serif');
  drawLabel(ctx,'당신의 반짝이는 여행이',900,523,550,24,colors.burgundy,'sans-serif');
  drawLabel(ctx,'언제나 이어지길, LUMINO와 함께.',900,566,550,24,colors.burgundy,'sans-serif');
  drawLabel(ctx,'With love, always.',900,634,550,45,colors.rose,'"Lumino Script", cursive');
  ctx.fillStyle=colors.cream+'df';ctx.fillRect(75,798,1450,133);
  stamps.forEach((stamp,i) => {
    const x = 280 + i*255, y = 862;
    const color = stamp.color==='blue'?colors.blue:stamp.color==='gold'?colors.goldInk:colors.rose;
    ctx.save();ctx.translate(x,y);ctx.rotate((i%2?1:-1)*.13);ctx.strokeStyle=color;ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(0,0,53,0,Math.PI*2);ctx.stroke();ctx.setLineDash([2,3]);ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,46,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.drawImage(symbols[i],-23,-31,46,46);ctx.fillStyle=color;ctx.font='14px "Lumino Serif", serif';ctx.textAlign='center';ctx.fillText(stamp.name,0,30);ctx.font='6px sans-serif';ctx.fillText('LUMINO · LITTLE JOURNEY',0,-37);ctx.restore();
  });
  ctx.fillStyle=colors.cream+'ed';ctx.fillRect(85,740,650,42);
  ctx.textAlign='left';drawLabel(ctx,`YOUR FAVORITE · ${look.title}`,98,765,700,18,colors.burgundy,'sans-serif');
  ctx.textAlign='right';drawLabel(ctx,'5 / 5 MOMENTS, FOREVER YOURS.',1485,765,600,15,colors.burgundy,'sans-serif');
  // 3번째 선택도 카드 장식에 반영합니다.
  const itemSymbol = item.value==='crown'?'crown':item.value==='ribbon'?'bow':item.value==='pearls'?'diamond':'heart';
  const svg=icon(itemSymbol).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" ').replace('currentColor',colors.rose);
  const ornament=await loadImage('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg));ctx.drawImage(ornament,1380,70,100,100);
  return new Promise((resolve,reject) => { try { canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG 생성에 실패했어요. 다시 시도해주세요.')), 'image/png'); } catch { reject(new Error('외부 이미지의 다운로드 권한을 확인해주세요. 로컬 images/ 이미지를 사용하면 저장할 수 있어요.')); } });
}
export function downloadBlob(blob, filename) {
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
