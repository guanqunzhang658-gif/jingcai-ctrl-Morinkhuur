(function () {
  var status = document.getElementById('status');
  var stage = document.getElementById('stage');
  var panel = null;

  function reload() {
    var url = new URL(location.href);
    url.searchParams.set('retry', Date.now());
    location.replace(url.href);
  }

  function showFallback(title, message) {
    if (status) status.textContent = title + '。';
    if (!stage) return;
    if (!panel || !panel.isConnected) {
      panel = document.createElement('div');
      panel.className = 'stage-fallback';
      panel.setAttribute('role', 'alert');
      panel.innerHTML =
        '<img src="../img/morin-khuur-watercolor.png" alt="马头琴结构示意插画">' +
        '<div class="fallback-copy">' +
        '<p class="fallback-kicker">3D MODEL UNAVAILABLE</p>' +
        '<h2></h2>' +
        '<p class="fallback-note"></p>' +
        '<div class="fallback-actions">' +
        '<button type="button" class="retry">重新载入</button>' +
        '<a href="assets/morin-mobile.glb" download>下载轻量模型 .GLB</a>' +
        '<a href="../chapters/anatomy.html">看文字版结构说明 ↗</a>' +
        '</div></div>';
      panel.querySelector('.retry').addEventListener('click', reload);
      stage.appendChild(panel);
    } else if (panel.parentNode !== stage) {
      stage.appendChild(panel);
    }
    panel.querySelector('h2').textContent = title;
    panel.querySelector('.fallback-note').textContent = message;
    document.body.dataset.modelError = 'shown';
  }

  // QA：?state=fail 可强制展示失败兜底，便于本地核对样式
  if (new URLSearchParams(location.search).get('state') === 'fail') {
    showFallback('三维模型未能载入', '模型文件没有下载完成。请检查网络后重试；也可以直接下载轻量模型，或先看文字版结构说明。');
  }

  var quality = document.getElementById('quality');
  var full = new URLSearchParams(location.search).get('quality') === 'full';
  if (quality) {
    quality.textContent = full ? '切换轻量版' : '高清细节';
    quality.onclick = function () {
      var url = new URL(location.href);
      url.searchParams.set('quality', full ? 'lite' : 'full');
      location.replace(url.href);
    };
  }

  var slow = setTimeout(function () {
    if (document.body.dataset.modelReady !== 'true' && !panel && status) {
      status.textContent = '网络较慢，模型仍在载入；稍等片刻，或点下方“重新载入”。';
    }
  }, 15000);

  window.addEventListener('morin-ready', function () {
    clearTimeout(slow);
    if (panel) { panel.remove(); panel = null; }
    if (status) status.textContent = '';
  });

  window.addEventListener('morin-error', function () {
    clearTimeout(slow);
    showFallback('三维模型未能载入', '模型文件没有下载完成。请检查网络后重试；也可以直接下载轻量模型，或先看文字版结构说明。');
  });

  function fail(error) {
    clearTimeout(slow);
    showFallback('三维引擎未能启动', '当前浏览器没有可用的 WebGL 支持，或图形驱动被禁用。请更新系统浏览器后重试；文字与图片说明不受影响。');
    console.error(error);
  }

  // Import failures are caught here as well: they occur before viewer.js can run its own try/catch.
  import('./viewer.js?v=study1').catch(fail);
}());
