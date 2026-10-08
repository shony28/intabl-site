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
  viewer.innerHTML = '<button type="button" class="setup-image-close" aria-label="Закрити фото" autofocus>×</button><img alt="">';
  document.body.append(viewer);
  const image = viewer.querySelector('img');
  let opener;
  viewer.querySelector('button').addEventListener('click', () => viewer.close());
  closeOnBackdrop(viewer);
  viewer.addEventListener('close', () => { if (dialog.open && opener) opener.focus(); });
  dialog.querySelectorAll('.setup-preview-steps a').forEach(link => {
    link.addEventListener('click', event => {
      if (typeof viewer.showModal !== 'function') return;
      event.preventDefault();
      opener = link;
      image.src = link.href;
      image.alt = link.querySelector('img').alt;
      viewer.showModal();
    });
  });
})();
