(() => {
  'use strict';
  const create=document.querySelector('a.create-store'),notice=document.getElementById('mobile-create-notice');
  create?.addEventListener('click',event=>{
    const mobile=navigator.userAgentData?.mobile||/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)||matchMedia('(max-width:1024px) and (pointer:coarse)').matches;
    const dialog=mobile?notice:document.getElementById('setup-preview');
    if(typeof dialog?.showModal==='function'){event.preventDefault();dialog.showModal();}
  });
  document.getElementById('mobile-create-close')?.addEventListener('click',()=>notice.close());
})();
