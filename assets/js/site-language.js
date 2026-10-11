(() => {
  'use strict';
  const key='intabl_site_language', current=document.documentElement.lang;
  let preferred=null;try{preferred=localStorage.getItem(key);}catch(_){}
  document.querySelectorAll('[data-site-language]').forEach(link=>link.addEventListener('click',()=>{try{localStorage.setItem(key,link.dataset.siteLanguage);}catch(_){}}));
  const suggested=preferred||(navigator.language?.toLowerCase().startsWith('en')?'en':null);
  if(current!=='uk'||suggested!=='en')return;
  const panel=document.createElement('div');panel.className='language-suggestion';panel.lang='en';
  const target=location.pathname==='/guide.html'?'/en/guide.html':'/en/';
  panel.innerHTML='<span>Prefer English?</span><a href="'+target+'">View the English version →</a><button type="button" aria-label="Dismiss language suggestion">×</button>';
  panel.querySelector('a').addEventListener('click',()=>{try{localStorage.setItem(key,'en');}catch(_){}});
  panel.querySelector('button').addEventListener('click',()=>{panel.hidden=true;try{localStorage.setItem(key,'uk');}catch(_){}});
  document.querySelector('header')?.after(panel);
})();
