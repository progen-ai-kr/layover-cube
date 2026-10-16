import { collection } from '../data/collection.js';
import { worldArt } from '../data/world.js';
import { icon } from './icons.js';

export function renderWorld() {
  document.querySelectorAll('[data-world-image]').forEach(img => {
    const source = worldArt[img.dataset.worldImage];
    if (source) img.src = source;
  });
  const collage = document.querySelector('[data-world-collage="collection"]');
  if (collage) collage.innerHTML = collection.map((look,index) => `<button class="world-fashion-photo" data-action="look" data-id="${look.id}" aria-label="${look.title} 화보 자세히 보기"><img src="${look.image}" alt="${look.title}" width="600" height="800" ${index?'loading="lazy"':''}><span class="script">${look.title}</span></button>`).join('');
  document.querySelectorAll('.section-intro, .chapter-heading').forEach(header => {
    const crest=document.createElement('span');
    crest.className='world-crest';crest.setAttribute('aria-hidden','true');crest.innerHTML=icon('bow');
    header.prepend(crest);
  });
  const header=document.querySelector('.lumino-header');
  const updateHeader=()=>header?.classList.toggle('is-scrolled',scrollY>40);
  updateHeader();window.addEventListener('scroll',updateHeader,{passive:true});
  const directory=document.querySelector('.header-directory');
  document.addEventListener('click',event=>{
    if(directory?.open && (!directory.contains(event.target)||event.target.closest('a,button'))) directory.open=false;
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape' && directory?.open){directory.open=false;directory.querySelector('summary').focus();}
  });
}
