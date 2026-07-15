const items=window.GARDEN_ITEMS||[];
const grid=document.getElementById('giftGrid');
const empty=document.getElementById('emptyState');
const search=document.getElementById('searchInput');
const priceFilter=document.getElementById('priceFilter');
const sortOrder=document.getElementById('sortOrder');
const filters=[...document.querySelectorAll('.filter')];
const modal=document.getElementById('imageModal');
const modalImage=document.getElementById('modalImage');
const modalCaption=document.getElementById('modalCaption');
let active='all';
const state=JSON.parse(localStorage.getItem('gardenState')||'{}');

function key(item){return item.url||item.name}
function save(){localStorage.setItem('gardenState',JSON.stringify(state))}
function statusOf(item){return state[key(item)]||{favorite:false,reserved:false,realized:false}}
function numericPrice(priceText=''){
  if(/consultar/i.test(priceText))return null;
  const matches=[...priceText.matchAll(/R\$\s*([\d.]+,\d{2})/g)];
  if(!matches.length)return null;
  const values=matches.map(m=>Number(m[1].replace(/\./g,'').replace(',','.'))).filter(Number.isFinite);
  return values.length?Math.min(...values):null;
}
function matchesPrice(value,filter){
  if(filter==='all')return true;
  if(filter==='unknown')return value===null;
  if(value===null)return false;
  if(filter==='under100')return value<100;
  if(filter==='100to250')return value>=100&&value<=250;
  if(filter==='250to500')return value>250&&value<=500;
  if(filter==='over500')return value>500;
  return true;
}
function visual(item,index){
  if(item.image)return `<button class="image-button" data-image="${item.image}" data-name="${item.name}"><img src="${item.image}" alt="${item.name}" loading="lazy"></button>`;
  return `<div class="icon-fallback" aria-label="Imagem ainda não adicionada">${item.icon}<small>Foto em breve</small></div>`;
}
function card(item,index){
  const s=statusOf(item);
  const isNew=item.new||/Magia da Fada/i.test(item.collection);
  return `<article class="card ${s.realized?'is-realized':''}" data-category="${item.category}">
    <div class="visual"><span class="tag">${item.collection}</span>${isNew?'<span class="new-badge">Novo</span>':''}${visual(item,index)}</div>
    <div class="content"><h2>${item.name}</h2><p class="description">${item.description}</p><p class="story">${item.story}</p><div class="price">${item.price}</div>
    <div class="meta"><span class="pill">Prioridade alta</span><span class="pill">${s.realized?'Realizado':s.reserved?'Reservado':'Desejado'}</span></div>
    <div class="card-tools">
      <button class="tool favorite ${s.favorite?'active':''}" data-action="favorite" data-key="${encodeURIComponent(key(item))}">${s.favorite?'♥':'♡'} Favorito</button>
      <button class="tool ${s.reserved?'active':''}" data-action="reserved" data-key="${encodeURIComponent(key(item))}">🎁 ${s.reserved?'Reservado':'Vou presentear'}</button>
      <button class="tool ${s.realized?'active':''}" data-action="realized" data-key="${encodeURIComponent(key(item))}">✨ ${s.realized?'Realizado':'Marcar realizado'}</button>
    </div>
    <a class="buy" href="${item.url}" target="_blank" rel="noopener noreferrer">Ver presente</a><div class="note">Valores, tamanhos e disponibilidade podem mudar na loja.</div></div></article>`;
}
function render(){
  const term=search.value.trim().toLocaleLowerCase('pt-BR');
  let filtered=items.filter(i=>{
    const s=statusOf(i);const text=`${i.name} ${i.collection} ${i.description}`.toLocaleLowerCase('pt-BR');
    const categoryMatch=active==='all'||i.category===active||(active==='favorites'&&s.favorite)||(active==='realized'&&s.realized);
    return categoryMatch&&text.includes(term)&&matchesPrice(numericPrice(i.price),priceFilter.value);
  }).map((item,index)=>({item,index,value:numericPrice(item.price)}));
  if(sortOrder.value==='priceAsc')filtered.sort((a,b)=>(a.value??Infinity)-(b.value??Infinity)||a.index-b.index);
  if(sortOrder.value==='priceDesc')filtered.sort((a,b)=>(b.value??-Infinity)-(a.value??-Infinity)||a.index-b.index);
  if(sortOrder.value==='nameAsc')filtered.sort((a,b)=>a.item.name.localeCompare(b.item.name,'pt-BR'));
  const result=filtered.map(entry=>entry.item);
  grid.innerHTML=result.map(card).join('');empty.style.display=result.length?'none':'block';
  document.getElementById('visibleCount').textContent=result.length;
  const realized=items.filter(i=>statusOf(i).realized).length;
  document.getElementById('realizedCount').textContent=realized;
  document.getElementById('progressBar').style.width=`${items.length?realized/items.length*100:0}%`;
}
filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(b=>b.classList.remove('active'));btn.classList.add('active');active=btn.dataset.filter;render()}));
[search,priceFilter,sortOrder].forEach(el=>el.addEventListener(el===search?'input':'change',render));
grid.addEventListener('click',e=>{
  const imageBtn=e.target.closest('.image-button');
  if(imageBtn){modalImage.src=imageBtn.dataset.image;modalImage.alt=imageBtn.dataset.name;modalCaption.textContent=imageBtn.dataset.name;modal.showModal();return}
  const button=e.target.closest('[data-action]');if(!button)return;
  const itemKey=decodeURIComponent(button.dataset.key);const current=state[itemKey]||{favorite:false,reserved:false,realized:false};
  current[button.dataset.action]=!current[button.dataset.action];state[itemKey]=current;save();render();
});
document.getElementById('closeModal').addEventListener('click',()=>modal.close());
modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});
document.getElementById('totalCount').textContent=items.length;
document.getElementById('shareBtn').addEventListener('click',async()=>{const data={title:document.title,text:'Conheça o Jardim de Desejos de Michèlé Joohann',url:location.href};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(location.href);alert('Link copiado!')}}catch(e){}});
render();