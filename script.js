const toggle=document.querySelector('.menu-toggle'),menu=document.querySelector('#menu');
const backgroundRegions=[document.querySelector('main'),document.querySelector('footer')];
function setMenu(open,restoreFocus=true){
 document.body.classList.toggle('menu-open',open);
 toggle.setAttribute('aria-expanded',String(open));
 toggle.setAttribute('aria-label',open?'メニューを閉じる':'メニューを開く');
 menu.setAttribute('aria-hidden',String(!open));menu.inert=!open;
 backgroundRegions.forEach(region=>region.inert=open);
 if(open)toggle.focus({preventScroll:true});
 else if(restoreFocus)toggle.focus({preventScroll:true});
}
toggle.addEventListener('click',()=>setMenu(!document.body.classList.contains('menu-open')));
menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',event=>{
 event.preventDefault();setMenu(false,false);
 const target=document.querySelector(link.hash);target.tabIndex=-1;
 location.hash=link.hash;target.focus({preventScroll:true});
}));
document.addEventListener('keydown',event=>{
 if(!document.body.classList.contains('menu-open'))return;
 if(event.key==='Escape'){event.preventDefault();setMenu(false);}
 if(event.key==='Tab'){
  const items=[...document.querySelectorAll('header a,header button,#menu a')];
  if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items.at(-1).focus();}
  else if(!event.shiftKey&&document.activeElement===items.at(-1)){event.preventDefault();items[0].focus();}
 }
});
const lightbox=document.querySelector('#lightbox'),photo=lightbox.querySelector('img');
const photoStatus=document.querySelector('#photo-status'),retryPhoto=document.querySelector('.photo-retry');
let photoTrigger=null,photoSource='';
function loadPhoto(){
 photoStatus.textContent='写真を読み込んでいます…';retryPhoto.hidden=true;photo.hidden=true;
 photo.onload=()=>{photoStatus.textContent='';photo.hidden=false;};
 photo.onerror=()=>{photoStatus.textContent='写真を読み込めませんでした。再読み込みするか、閉じてもう一度お試しください。';retryPhoto.hidden=false;};
 photo.src=photoSource;
}
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{
 photoTrigger=button;photoSource=button.dataset.image;photo.alt=button.querySelector('img').alt;
 document.querySelector('#photo-caption').textContent=photo.alt;
 lightbox.showModal();document.body.classList.add('photo-open');loadPhoto();
}));
retryPhoto.addEventListener('click',loadPhoto);
lightbox.querySelector('.lightbox-close').addEventListener('click',()=>lightbox.close());
lightbox.addEventListener('click',event=>{if(event.target===lightbox)lightbox.close();});
lightbox.addEventListener('close',()=>{document.body.classList.remove('photo-open');photoTrigger?.focus({preventScroll:true});});
// Reveal text once; move photographs and ambient light in proportion to page scroll.
// Native scrolling stays intact, and the reduced-motion preference disables all travel.
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
const revealTargets=document.querySelectorAll('.section-heading>*,.story-body>p,.identity-caption>*,.identity-board,.type-board>*,.product-heading>*,.product-card,.closing-inner>*,.footer-mark,.footer-links');
if('IntersectionObserver' in window){
  const revealObserver=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}
    }
  },{threshold:.06,rootMargin:'0px 0px -20px 0px'});
  revealTargets.forEach((element,index)=>{
    element.classList.add('reveal');
    element.style.setProperty('--reveal-delay',`${Math.min(index%3*45,90)}ms`);
    revealObserver.observe(element);
  });
  document.documentElement.classList.add('motion-ready');
}
const pageRoot=document.documentElement;
const pageHeader=document.querySelector('header');
const heroSection=document.querySelector('.hero');
const movingPhotos=[...document.querySelectorAll('.full-image .image-button,.photo-pair .image-button')];
const movingSections=[...document.querySelectorAll('.why,.closing')];
const productsSection=document.querySelector('#products');
const chapterLink=document.querySelector('.chapter a');
const chapterStates=[
 {id:'how',code:'02 / 遠野の風土',label:'遠野の風土'},
 {id:'craft',code:'03 / 漬物づくり',label:'漬物づくり'},
 {id:'products',code:'04 / 商品一覧',label:'商品一覧'},
 {id:'why',code:'05 / つくり手',label:'工藤 寛之'},
 {id:'page-footer',code:'TONO ROOTS KUDO',label:'ページ上部へ'}
].map(item=>({...item,node:document.getElementById(item.id)}));
const productCards=[...document.querySelectorAll('.product-card')];
let currentChapter='',currentProduct='';
function paintNavigation(viewport){
 let active={id:'top',code:'TONO ROOTS KUDO',label:'遠野の漬物と旬の野菜'};
 const chapterMarker=Math.max(viewport*.35,parseFloat(getComputedStyle(pageRoot).scrollPaddingTop||'0')+20);
 for(const item of chapterStates)if(item.node.getBoundingClientRect().top<=chapterMarker)active=item;
 if(active.id!==currentChapter){
  currentChapter=active.id;const label=document.createElement('span');label.textContent=active.label;
  chapterLink.replaceChildren(document.createTextNode(active.code+' '),label);
  chapterLink.href=active.id==='page-footer'?'#top':'#'+active.id;
  document.querySelectorAll('#menu a,.product-shortcut').forEach(link=>{
   if(link.hash==='#'+active.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
  });
 }
 let product='',rowTop=-Infinity;
 if(active.id==='products')for(const card of productCards){
  const top=card.getBoundingClientRect().top;
  if(top>viewport*.4)continue;
  if(top>rowTop+2){product=card.id;rowTop=top;}
  else if(Math.abs(top-rowTop)<=2&&location.hash==='#'+card.id)product=card.id;
 }
 const linkedCard=productCards.find(card=>location.hash==='#'+card.id);
 if(active.id==='products'&&linkedCard){
  const bounds=linkedCard.getBoundingClientRect();
  if(bounds.top<viewport&&bounds.bottom>Math.min(100,viewport*.2))product=linkedCard.id;
 }
 if(product!==currentProduct){currentProduct=product;document.querySelectorAll('.product-index a').forEach(link=>{
  if(link.hash==='#'+product)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
 });}
}
const clamp=(number,min,max)=>Math.max(min,Math.min(max,number));
function paintProductLight(viewport){
  const bounds=productsSection.getBoundingClientRect();
  // The change finishes before the first product photograph enters the viewport.
  // Reversing the scroll reverses the same palette, without a time-based fade.
  const light=motionPreference.matches?1:clamp((viewport*.98-bounds.top)/(viewport*.65),0,1);
  const eased=light*light*(3-2*light);
  const rgb=[8,9,11].map((channel,index)=>Math.round(channel+([247,245,237][index]-channel)*eased));
  const linear=rgb.map(channel=>{const value=channel/255;return value<=.04045?value/12.92:((value+.055)/1.055)**2.4;});
  const luminance=linear[0]*.2126+linear[1]*.7152+linear[2]*.0722;
  const bright=luminance>.179;
  const ink=bright?(eased>.85?'#20271f':'#000000'):'#ffffff';
  const body=eased>.85?'#394034':ink;
  const note=eased>.95?'#59624f':ink;
  pageRoot.style.setProperty('--products-rgb',rgb.join(' '));
  pageRoot.style.setProperty('--products-ink',ink);
  pageRoot.style.setProperty('--products-body',body);
  pageRoot.style.setProperty('--products-note',note);
  pageRoot.style.setProperty('--products-line',bright?'#20271f40':'#ffffff4a');
  const underHeader=bounds.top<=pageHeader.offsetHeight&&bounds.bottom>pageHeader.offsetHeight;
  pageHeader.classList.toggle('header-products',underHeader);
  pageRoot.style.setProperty('--scroll-ink',underHeader?ink:'#485136');
}
let frameRequested=false;
function paintScrollMotion(){
  frameRequested=false;
  const y=window.scrollY,viewport=window.innerHeight;
  const range=pageRoot.scrollHeight-viewport;
  const progress=range>0?clamp(y/range,0,1):0;
  pageHeader.classList.toggle('header-scrolled',y>40);
  pageRoot.style.setProperty('--scroll-progress',String(progress));
  paintProductLight(viewport);
  paintNavigation(viewport);
  if(motionPreference.matches)return;
  const heroProgress=clamp(y/heroSection.offsetHeight,0,1);
  heroSection.style.setProperty('--hero-y',`${heroProgress*95}px`);
  heroSection.style.setProperty('--hero-scale',String(1.03+heroProgress*.14));
  pageRoot.style.setProperty('--glow-x',`${Math.sin(progress*Math.PI*2)*160}px`);
  pageRoot.style.setProperty('--glow-y',`${-progress*370}px`);
  for(const photo of movingPhotos){
    const bounds=photo.getBoundingClientRect();
    if(bounds.bottom< -100||bounds.top>viewport+100)continue;
    const position=clamp((viewport-bounds.top)/(viewport+bounds.height),0,1);
    photo.style.setProperty('--photo-y',`${(position-.5)*55}px`);
    photo.style.setProperty('--photo-scale',String(1.04+position*.1));
  }
  for(const section of movingSections){
    const bounds=section.getBoundingClientRect();
    if(bounds.bottom< -100||bounds.top>viewport+100)continue;
    const position=clamp((viewport-bounds.top)/(viewport+bounds.height),0,1);
    section.style.setProperty('--section-y',`${(position-.5)*150}px`);
  }
}
function requestScrollPaint(){if(!frameRequested){frameRequested=true;requestAnimationFrame(paintScrollMotion);}}
window.addEventListener('scroll',requestScrollPaint,{passive:true});
window.addEventListener('resize',requestScrollPaint,{passive:true});
window.addEventListener('pageshow',requestScrollPaint);
window.addEventListener('hashchange',requestScrollPaint);
motionPreference.addEventListener('change',requestScrollPaint);
paintScrollMotion();
