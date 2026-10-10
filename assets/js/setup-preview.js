(() => {
  'use strict';
  const dialog = document.getElementById('setup-preview');
  if (!dialog) return;
  dialog.querySelector('.setup-preview-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('#setup-preview-continue').addEventListener('click', () => dialog.close());
  function closeOnBackdrop(modal) {
    modal.addEventListener('click', event => {
      if (event.target !== modal) return;
      const r = modal.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close();
    });
  }
  closeOnBackdrop(dialog);
  const viewer = document.createElement('dialog');
  viewer.id = 'setup-image-viewer';
  viewer.setAttribute('aria-label', 'Збільшений скріншот');
  viewer.innerHTML = '<button type="button" class="setup-image-close" aria-label="Закрити фото" autofocus>×</button><img alt=""><div class="setup-image-navigation"><button type="button" class="setup-image-prev" aria-label="Попереднє фото">←</button><span class="setup-image-counter" aria-live="polite" aria-atomic="true"></span><button type="button" class="setup-image-next" aria-label="Наступне фото">→</button></div>';
  document.body.append(viewer);
  const image = viewer.querySelector('img');
  const links = [...dialog.querySelectorAll('.setup-preview-steps a')];
  let current = 0;
  function show(index) {
    current = (index + links.length) % links.length;
    image.src = links[current].href;
    image.alt = links[current].querySelector('img').alt;
    viewer.querySelector('.setup-image-counter').textContent = (current + 1) + ' / ' + links.length;
  }
  viewer.querySelector('.setup-image-prev').addEventListener('click', () => show(current - 1));
  viewer.querySelector('.setup-image-next').addEventListener('click', () => show(current + 1));
  viewer.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();show(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  let touchStart = null;
  image.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? {x:event.touches[0].clientX,y:event.touches[0].clientY} : null;
  }, {passive:true});
  image.addEventListener('touchcancel', () => {touchStart = null;});
  image.addEventListener('touchend', event => {
    if (!touchStart || event.touches.length) {touchStart = null;return;}
    const touch = event.changedTouches[0], dx = touch.clientX - touchStart.x, dy = touch.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
  }, {passive:true});
  image.draggable = false;
  let opener;
  viewer.querySelector('button').addEventListener('click', () => viewer.close());
  closeOnBackdrop(viewer);
  viewer.addEventListener('close', () => { if (dialog.open && opener) opener.focus(); });
  links.forEach((link, index) => {
    link.addEventListener('click', event => {
      if (typeof viewer.showModal !== 'function') return;
      event.preventDefault();
      opener = link;
      show(index);
      viewer.showModal();
    });
  });
})();
