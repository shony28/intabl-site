const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const code=fs.readFileSync(require('node:path').join(__dirname,'../assets/js/analytics.js'),'utf8');
function run(saved=null,hostname='intabl.com') {
 const scripts=[],elements=[],listeners={},storage=new Map(saved?[['intabl_analytics_consent_v1',saved]]:[]);
 const element=()=>({dataset:{},addEventListener(k,fn){this[k]=fn},setAttribute(){},append(){},focus(){},querySelector(){return {focus(){}}}});
 const document={cookie:'_ga=old',head:{append(s){scripts.push(s)}},body:{append(e){elements.push(e)}},createElement:element,querySelector(){return {append(e){elements.push(e)}}},addEventListener(k,fn){listeners[k]=fn}};
 const window={};vm.runInNewContext(code,{window,document,location:{hostname,origin:'https://'+hostname,pathname:'/guide.html',href:'https://'+hostname+'/guide.html?secret=test#private'},URL,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}});
 return {scripts,elements,window,choose(v){elements[0].click({target:{closest(){return {dataset:{choice:v}}}}})},click(href){listeners.click({target:{closest(){return {href}}}})}};
}
test('no Google script until explicit consent, including saved refusal',()=>{for(const s of [null,'denied'])assert.equal(run(s).scripts.length,0)});
test('accept loads once, strips URL details, disables ads, revoke stops events',()=>{const r=run();r.choose('granted');r.choose('granted');assert.equal(r.scripts.length,1);const c=r.window.dataLayer.find(x=>x[0]==='config')[2];assert.equal(c.page_location,'https://intabl.com/guide.html');assert.equal(c.page_referrer,'');assert.equal(c.allow_google_signals,false);r.click('https://t.me/shonyrecords');assert.equal(r.window.dataLayer.at(-1)[1],'contact_telegram');r.choose('denied');assert.equal(r.window['ga-disable-G-LD77VMCPGV'],true);const n=r.window.dataLayer.length;r.click('https://t.me/shonyrecords');assert.equal(r.window.dataLayer.length,n)});
test('saved consent loads and other hosts are excluded',()=>{assert.equal(run('granted').scripts.length,1);assert.equal(run('granted','demo.intabl.com').scripts.length,0)});
