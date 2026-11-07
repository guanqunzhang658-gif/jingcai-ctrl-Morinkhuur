/* Navigation, reader controls and accessible media interactions. No remote runtime. */
const menu = document.querySelector('.menu-toggle');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  document.querySelector('.side').classList.toggle('is-open', open);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    menu?.setAttribute('aria-expanded', 'false');
    document.querySelector('.side')?.classList.remove('is-open');
    document.querySelector('dialog[open]')?.close();
  }
});
const search = document.querySelector('.search input');
if (search) {
  const cards = [...document.querySelectorAll('.record-grid .record-card')];
  const counter = document.querySelector('.resultline span');
  const empty = document.createElement('p');
  empty.className = 'empty-state'; empty.hidden = true;
  empty.textContent = '没有找到匹配的资料，试试其他关键词。';
  document.querySelector('.record-grid').after(empty);
  counter.setAttribute('aria-live', 'polite');
  search.addEventListener('input', () => {
    const q = search.value.trim().toLocaleLowerCase();
    let count = 0;
    cards.forEach(c => {c.hidden = !c.textContent.toLocaleLowerCase().includes(q); if (!c.hidden) count++;});
    counter.textContent = `${count} 项资料`; empty.hidden = count > 0;
  });
}
document.querySelectorAll('[data-filter]').forEach(b => {
  b.setAttribute('aria-pressed', String(b.classList.contains('on')));
  b.addEventListener('click', () => {
    b.parentElement.querySelectorAll('button').forEach(x => {x.classList.remove('on');x.setAttribute('aria-pressed','false');});
    b.classList.add('on'); b.setAttribute('aria-pressed','true');
    document.querySelector('.record-grid')?.classList.toggle('list-view', b.textContent === '列表');
  });
});
document.querySelector('.preview-top a')?.addEventListener('click', e => {
  e.preventDefault(); document.querySelector('.preview').hidden = true;
});
// Image lightbox keeps the underlying page and scroll position intact.
const lightbox = document.createElement('dialog'); lightbox.className = 'lightbox';
lightbox.innerHTML = '<button class="lightbox-close" aria-label="关闭大图">关闭 ×</button><img alt=""><p></p>';
document.body.append(lightbox);
const closeLightbox = () => lightbox.close();
lightbox.querySelector('button').onclick = closeLightbox;
lightbox.addEventListener('click', e => {if (e.target === lightbox) closeLightbox();});
document.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => {
  const source = document.querySelector('.detail-image>img');
  const image = lightbox.querySelector('img'); image.src = source.src; image.alt = source.alt;
  lightbox.querySelector('p').textContent = source.alt; lightbox.showModal();
}));
// Keep all original material/tool text available, with functional tab switching.
document.querySelectorAll('.craft-tab-bar').forEach(bar => {
  const parent = bar.parentElement;
  const tabs = [...bar.querySelectorAll('.craft-tab')];
  const panels = [...parent.querySelectorAll(':scope > .craft-tab-content')];
  if (!panels.length) return;
  bar.setAttribute('role','tablist');
  tabs.forEach((tab,i) => {
    tab.setAttribute('role','tab');
    const show = () => {
      tabs.forEach((t,j) => {t.classList.toggle('active',i===j);t.setAttribute('aria-selected',String(i===j));});
      panels.forEach((p,j) => {p.hidden=i!==j;p.classList.toggle('active',i===j);});
    };
    tab.addEventListener('click',show); if(i===0)show();
  });
});
// One audio stream at a time; recover visibly from missing or unsupported media.
let activeAudio, activeSound;
document.querySelectorAll('.sound-item').forEach(button => {
  button.setAttribute('role','button');button.setAttribute('tabindex','0');button.setAttribute('aria-pressed','false');
  const toggle = async () => {
    if (activeSound === button && activeAudio && !activeAudio.paused) {activeAudio.pause();button.setAttribute('aria-pressed','false');return;}
    activeAudio?.pause();activeSound?.setAttribute('aria-pressed','false');
    const audio = new Audio(`assets/performance/sounds/${encodeURIComponent(button.dataset.sound)}.mp3`);
    activeAudio=audio;activeSound=button;
    let status=document.querySelector('.audio-status');
    if(!status){status=document.createElement('p');status.className='audio-status';status.setAttribute('role','status');button.parentElement.after(status);}
    try {await audio.play();button.setAttribute('aria-pressed','true');status.textContent='正在播放：'+button.textContent.trim();}
    catch {status.textContent='这段音频暂时无法播放，请稍后重试。';}
    audio.onended=()=>{button.setAttribute('aria-pressed','false');status.textContent='播放结束';};
  };
  button.addEventListener('click',toggle);button.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
});
// Render the original 800px lineage diagram inside its own scroll area.
document.querySelectorAll('.heritage-tree-wrap').forEach(tree=>{
  const wrap=document.createElement('div');wrap.className='lineage-scroll';wrap.tabIndex=0;
  wrap.setAttribute('aria-label','传承关系图，可横向滚动查看');tree.before(wrap);wrap.append(tree);
});
document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{
  img.classList.add('image-unavailable');img.alt=img.alt+'（图像暂时无法载入）';
},{once:true}));
// Remove obsolete original-site controls only where every item is already visible.
document.querySelectorAll('.sort-btn').forEach(button=>button.addEventListener('click',()=>{
  const chart=document.querySelector('.bar-chart');if(!chart)return;
  const bars=[...chart.querySelectorAll('.music-bar')];
  if(!bars[0]?.dataset.originalIndex)bars.forEach((b,i)=>b.dataset.originalIndex=String(i));
  const descending=button.textContent.includes('排序');
  bars.sort((a,b)=>descending?Number(b.dataset.score)-Number(a.dataset.score):Number(a.dataset.originalIndex)-Number(b.dataset.originalIndex)).forEach(b=>chart.append(b));
  button.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===button));
}));
document.querySelectorAll('.music-bar').forEach(bar=>{
  bar.tabIndex=0;bar.setAttribute('role','button');bar.setAttribute('aria-label',`${bar.dataset.name}，${bar.dataset.score}`);
  const update=()=>{
    const data=d.songData?.[bar.dataset.name];
    const name=document.querySelector('.bar-info-name'),desc=document.querySelector('.bar-info-desc');
    if(name)name.textContent=bar.dataset.name;
    if(desc&&data)desc.textContent=data.description||'';
    const score=document.querySelector('.bar-info-score');if(score)score.textContent=bar.dataset.score;
    const group=document.querySelector('.bar-info-group');if(group)group.textContent=bar.dataset.group||bar.dataset.category||'';
  };
  bar.addEventListener('click',update);bar.addEventListener('keydown',e=>{if(e.key==='Enter')update();});
});
// Original section-level links now point to real pages in the three-level site.
const sectionLinks={hero:'index.html',dashboard:'browse.html?topic=instrument-types',heritage:'reader.html?topic=heritage'};
document.querySelectorAll('a[href^="#"]').forEach(a=>{const id=a.getAttribute('href').slice(1);if(!document.getElementById(id)&&sectionLinks[id])a.href=sectionLinks[id];});
const openImage=image=>{if(!image)return;const target=lightbox.querySelector('img');target.src=image.src;target.alt=image.alt;lightbox.querySelector('p').textContent=image.alt;lightbox.showModal();};
document.querySelector('.instrument-stage-zoom')?.addEventListener('click',()=>openImage(document.querySelector('.instrument-kind-stage img')));
document.querySelector('#historyZoomBtn')?.addEventListener('click',()=>openImage(document.querySelector('#historySlideImg')));
document.querySelector('#historyOverviewBtn')?.addEventListener('click',()=>document.querySelector('.history-pics')?.scrollIntoView({block:'start'}));
document.querySelectorAll('.branch-toggle').forEach(button=>{
 const panel=button.parentElement.querySelector('.branch-list')||button.nextElementSibling;
 if(!panel)return;button.setAttribute('aria-expanded','true');
 button.addEventListener('click',()=>{panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));});
});
let historyStep=0;
function selectHistory(index){
 const acts=[...document.querySelectorAll('[data-act]')];if(!acts.length)return;
 historyStep=Math.max(0,Math.min(index,acts.length-1));
 const names=['xiqin','huobusi','mawei','chaoer','modern'];const item=d.history[historyStep];
 const image=document.querySelector('#historySlideImg');if(image){image.src='assets/history/history-'+names[historyStep]+'.jpeg';image.alt=item.title;}
 const title=document.querySelector('#chartTitleZh');if(title)title.textContent=item.title;
 document.querySelectorAll('[data-step]').forEach((p,i)=>p.classList.toggle('active',i===historyStep));
 const counter=document.querySelector('#actCounter');if(counter)counter.textContent=`${historyStep+1} / ${acts.length}`;
 const badge=document.querySelector('#chartStageBadge');if(badge)badge.textContent=`0${historyStep+1} / 05`;
 const prev=document.querySelector('#prevBtn'),next=document.querySelector('#nextBtn');if(prev)prev.disabled=historyStep===0;if(next)next.disabled=historyStep===acts.length-1;
 acts[historyStep].scrollIntoView({block:'start'});
}
document.querySelector('#prevBtn')?.addEventListener('click',()=>selectHistory(historyStep-1));
document.querySelector('#nextBtn')?.addEventListener('click',()=>selectHistory(historyStep+1));
document.querySelectorAll('[data-step]').forEach((step,i)=>{step.tabIndex=0;step.setAttribute('role','button');step.addEventListener('click',()=>selectHistory(i));step.addEventListener('keydown',e=>{if(e.key==='Enter')selectHistory(i);});});
document.querySelectorAll('.patterns-type-item,.patterns-gallery-item,.patterns-guide-item').forEach(item=>{
 const type=item.dataset.type||item.dataset.guideTypes;
 if(!d.patternsData[type])return;item.tabIndex=0;item.setAttribute('role','button');
 const select=()=>{
  const value=d.patternsData[type];
  for(const [id,key] of [['patternsDetailName','name'],['patternsDetailRegion','region'],['patternsDetailEra','era'],['patternsDetailCase','case'],['patternsDetailLocation','location']]){const el=document.getElementById(id);if(el)el.textContent=value[key]||'';}
  document.querySelectorAll('[data-type]').forEach(e=>e.classList.toggle('active',e.dataset.type===type));
 };
 item.addEventListener('click',select);item.addEventListener('keydown',e=>{if(e.key==='Enter')select();});
});
document.querySelectorAll('.instrument-shape-strip [data-instrument],.instrument-kind-item').forEach(item=>{
 item.tabIndex=0;item.setAttribute('role','button');
 const select=()=>{
  const source=document.querySelector('.instrument-kind-item[data-instrument="'+item.dataset.instrument+'"]');if(!source)return;
  const image=document.querySelector('.instrument-kind-stage img');image.src=source.dataset.image;image.alt=source.dataset.title;
  document.querySelector('.instrument-kind-detail h3').textContent=source.dataset.title;
  const keys=['region','category','material','head','pattern','meaning','color'];document.querySelectorAll('.instrument-kind-detail dd').forEach((dd,i)=>dd.textContent=source.dataset[keys[i]]||'');
  document.querySelectorAll('[data-instrument]').forEach(el=>el.classList.toggle('active',el.dataset.instrument===item.dataset.instrument));
 };
 item.addEventListener('click',select);item.addEventListener('keydown',e=>{if(e.key==='Enter')select();});
});
