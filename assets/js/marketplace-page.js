import {splitLabels,appendLabels} from './product-labels.mjs?v=2';
const form=document.getElementById('market-search'),region=form.elements.region,cityText=document.getElementById('market-city'),cityId=form.elements.city,list=document.getElementById('market-cities'),locationStatus=document.getElementById('location-status');
let places=[],version=0;const cache=new Map();
function suggestions(){const q=cityText.value.trim().toLocaleLowerCase('uk');list.replaceChildren(...places.filter(p=>(p.label||p.name).toLocaleLowerCase('uk').includes(q)).slice(0,40).map(p=>{const o=document.createElement('option');o.value=p.label||p.name;return o;}));}
async function loadCities(restore=false){
 const filter=form.querySelector('.location-filter');if(filter){filter.querySelector('summary span').textContent=region.value?'· '+region.selectedOptions[0].textContent:'· уся Україна';if(restore&&region.value)filter.open=true;}
 const run=++version;places=[];list.replaceChildren();cityText.disabled=true;cityText.setCustomValidity('');
 if(!restore){cityText.value='';cityId.value='';}
 if(!region.value){cityText.value='';cityId.value='';locationStatus.textContent='Місто можна обрати після області. Без фільтрів шукаємо по всій Україні.';return;}
 locationStatus.textContent='Завантажуємо населені пункти…';
 try{if(!cache.has(region.value)){const r=await fetch(form.dataset.locations+region.value+'.json',{credentials:'omit'});if(!r.ok)throw Error();cache.set(region.value,await r.json());}if(run!==version)return;places=cache.get(region.value);cityText.disabled=false;if(restore&&cityId.value)cityText.value=places.find(p=>p.id===cityId.value)?.label||'';suggestions();locationStatus.textContent='Необов’язково: почніть вводити місто або село й виберіть підказку.';}
 catch{if(run===version){cityId.value='';cityText.value='';locationStatus.textContent='Не вдалося завантажити міста. Доступний пошук по області; для повтору виберіть область ще раз.';}}
}
region.addEventListener('change',()=>void loadCities());cityText.addEventListener('input',()=>{cityId.value=places.find(p=>(p.label||p.name)===cityText.value)?.id||'';cityText.setCustomValidity(cityText.value&&!cityId.value?'Виберіть населений пункт із підказок.':'');suggestions();});cityText.addEventListener('focus',suggestions);
void loadCities(true);
const api=document.body.dataset.marketApi;
const categorySelect=form.elements.category;

if(api&&categorySelect){
 (async()=>{const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);try{const url=new URL(api);url.search='view=categories';const response=await fetch(url,{credentials:'omit',signal:controller.signal});const body=await response.json();if(!response.ok||!body.success)throw Error();
 for(const category of body.data.categories){const option=document.createElement('option');option.value=category.id;option.textContent=category.label;const existing=[...categorySelect.options].find(o=>o.value===String(category.id));if(existing)existing.textContent=category.label;else categorySelect.append(option);}
 }catch{const hint=document.createElement('p');hint.className='hint';hint.textContent='Категорії тимчасово недоступні. Пошук товарів продовжує працювати.';categorySelect.after(hint);}finally{clearTimeout(timeout);}})();
}
if(api){
 const results=document.getElementById('results'),status=document.getElementById('search-status'),prev=document.getElementById('previous'),next=document.getElementById('next'),submit=form.querySelector('[type=submit]');let page=1,active=new URLSearchParams(),searchRun=0;
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 async function search(params,push=false){
  const run=++searchRun,controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
  submit.disabled=true;prev.disabled=true;next.disabled=true;results.setAttribute('aria-busy','true');status.textContent='Шукаємо товари…';
  try{const request=new URL(api);request.search=new URLSearchParams([...params,['format','json']]);const response=await fetch(request,{credentials:'omit',signal:controller.signal}),body=await response.json();if(!response.ok||!body.success)throw Error(body.error?.message||'Пошук тимчасово недоступний. Повторіть спробу.');
   if(run!==searchRun)return;const {items,more}=body.data;active=new URLSearchParams(params);page=Number(active.get('page')||1);results.replaceChildren();
   for(const p of items){const article=el('article',undefined,'product-card'),content=el('div',undefined,'card');const placeholder=()=>el('div','Без фото','no-photo');let media=placeholder();if(p.image_url){try{const url=new URL(p.image_url);if(url.protocol==='https:'){media=el('img');media.src=url.href;media.alt=p.name;media.loading='lazy';media.referrerPolicy='no-referrer';media.onerror=()=>media.replaceWith(placeholder());}}catch{}}
    const target=new URL('https://'+p.host+'/');target.searchParams.set('product',p.product_id);const photoLink=el('a',undefined,'market-photo-link');photoLink.href=target.href;photoLink.setAttribute('aria-label','Переглянути '+p.name);photoLink.append(media);const markers=splitLabels(p.category);appendLabels(photoLink,markers.labels);const heading=el('h2'),titleLink=el('a',p.name,'market-title-link');titleLink.href=target.href;heading.append(titleLink);content.append(el('p',markers.tags.join('; '),'hint'),heading,el('strong',new Intl.NumberFormat('uk-UA',{style:'currency',currency:'UAH'}).format(p.price_minor/100)),el('p',p.shop_name),el('p',p.city||'','hint'));const link=el('a','Переглянути товар ↗','button');link.href=target.href;content.append(link);article.append(photoLink,content);results.append(article);
   }
   if(!items.length){const empty=el('section',undefined,'empty');empty.append(el('h2','За цим запитом товарів поки немає'),el('p','Спробуйте іншу назву або приберіть фільтри категорії чи розташування. Продавці поступово додають свої товари.'));results.append(empty);}
   status.textContent=items.length?'Показано '+items.length+' · Сторінка '+page:'Нічого не знайдено';prev.hidden=page<=1;next.hidden=!more;
   if(push)history.pushState(null,'','?'+params.toString());
  }catch(error){if(run!==searchRun)return;results.replaceChildren(el('p',error.name==='AbortError'?'Сервер відповідає надто довго. Натисніть «Знайти товари» ще раз.':error.message,'error'));status.textContent='Не вдалося виконати пошук';prev.hidden=true;next.hidden=true;}
  finally{clearTimeout(timeout);if(run===searchRun){submit.disabled=false;prev.disabled=false;next.disabled=false;results.removeAttribute('aria-busy');}}
 }
 form.addEventListener('submit',event=>{event.preventDefault();const params=new URLSearchParams(new FormData(form));params.delete('city_label');params.delete('page');void search(params,true);});
 prev.addEventListener('click',()=>{const p=new URLSearchParams(active);p.set('page',String(page-1));void search(p,true);});next.addEventListener('click',()=>{const p=new URLSearchParams(active);p.set('page',String(page+1));void search(p,true);});
 function restore(){const p=new URLSearchParams(location.search);form.elements.q.value=p.get('q')||'';if(categorySelect){const id=p.get('category')||'';if(id&&![...categorySelect.options].some(o=>o.value===id)){const option=document.createElement('option');option.value=id;option.textContent='Недоступна категорія — оберіть іншу';categorySelect.append(option);}categorySelect.value=id;}region.value=p.get('region')||'';cityId.value=p.get('city')||'';void loadCities(true);void search(p);}
 window.addEventListener('popstate',restore);restore();
}
