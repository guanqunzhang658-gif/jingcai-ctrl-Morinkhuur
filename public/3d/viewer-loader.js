(function () {
  var status = document.getElementById('status');
  var notice = document.createElement('div');
  notice.className = 'load-notice'; notice.hidden = true;
  notice.innerHTML = '<span></span><button type="button">重新载入</button>';
  document.body.appendChild(notice);
  function hint(message) {notice.hidden=false;notice.querySelector('span').textContent=message;}
  notice.querySelector('button').onclick = function () {var url=new URL(location.href);url.searchParams.set('retry',Date.now());location.replace(url.href);};
  var quality=document.getElementById('quality');
  var full=new URLSearchParams(location.search).get('quality')==='full';
  if(quality){quality.textContent=full?'切换轻量版':'高清细节';quality.onclick=function(){var url=new URL(location.href);url.searchParams.set('quality',full?'lite':'full');location.replace(url.href);};}
  var slow=setTimeout(function(){if(document.body.dataset.modelReady!=='true')hint('网络较慢，正在继续加载；也可以重试。');},20000);
  window.addEventListener('morin-ready',function(){clearTimeout(slow);notice.hidden=true;});
  window.addEventListener('morin-error',function(){clearTimeout(slow);hint('载入未完成，请重试，或更换网络后再打开。');});
  function fail(error){clearTimeout(slow);status.textContent='三维引擎未能载入。';document.body.dataset.modelError='engine';hint('请重试；若仍失败，请使用更新的系统浏览器。');console.error(error);}
  // Import failures are caught here as well: they occur before viewer.js can run its own try/catch.
  import('./viewer.js?v=mobile-fix-2').catch(fail);
}());
