// Keep the entrance independent of the full archive download.
(() => {
let pending;
const controls=[...document.querySelectorAll('[data-open-search],[data-open-directory]')];
function script(src){return new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=src;el.onload=resolve;el.onerror=()=>{el.remove();reject(Error('资料连接暂时不可用'));};document.body.append(el);});}
const note=document.createElement('div');note.className='archive-loading';note.setAttribute('role','status');note.hidden=true;document.body.append(note);
async function load(e){e.preventDefault();e.stopImmediatePropagation();const button=e.currentTarget;note.hidden=false;note.textContent='正在载入检索与目录资料…';
try{if(!pending)pending=(async()=>{if(!window.CONTENT)await script('content.js?v=ger2');await script('atlas.js?v=ger1');})();await pending;controls.forEach(b=>b.removeEventListener('click',load,true));note.hidden=true;button.click();}catch{pending=null;note.textContent='资料加载较慢，请稍后再点搜索或目录重试。';setTimeout(()=>note.hidden=true,8000);}}
controls.forEach(b=>b.addEventListener('click',load,true));document.addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA/.test(e.target.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();document.querySelector('[data-open-search]').click();}});
})();
