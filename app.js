const items=window.GARDEN_ITEMS||[];
const grid=document.getElementById('giftGrid');
const empty=document.getElementById('emptyState');
const search=document.getElementById('searchInput');
const priceFilter=document.getElementById('priceFilter');
const sortOrder=document.getElementById('sortOrder');
const filters=[...document.querySelectorAll('.filter')];
let active='all';

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

function card(item){return `<article class="card" data-category="${item.category}"><div class="visual"><span class="tag">${item.collection}</span>${item.icon}</div><div class="content"><h2>${item.name}</h2><p class="description">${item.description}</p><p class="story">${item.story}</p><div class="price">${item.price}</div><div class="meta"><span class="pill">Prioridade alta</span><span class="pill">Desejado</span></div><a class="buy" href="${item.url}" target="_blank" rel="noopener noreferrer">Ver presente</a><div class="note">Valores, tamanhos e disponibilidade podem mudar na loja.</div></div></article>`}

function render(){
  const term=search.value.trim().toLocaleLowerCase('pt-BR');
  const selectedPrice=priceFilter.value;
  const selectedSort=sortOrder.value;
  let filtered=items.filter(i=>{
    const text=`${i.name} ${i.collection} ${i.description}`.toLocaleLowerCase('pt-BR');
    return (active==='all'||i.category===active)&&text.includes(term)&&matchesPrice(numericPrice(i.price),selectedPrice);
  });
  filtered=filtered.map((item,index)=>({item,index,value:numericPrice(item.price)}));
  if(selectedSort==='priceAsc')filtered.sort((a,b)=>(a.value??Infinity)-(b.value??Infinity)||a.index-b.index);
  if(selectedSort==='priceDesc')filtered.sort((a,b)=>(b.value??-Infinity)-(a.value??-Infinity)||a.index-b.index);
  if(selectedSort==='nameAsc')filtered.sort((a,b)=>a.item.name.localeCompare(b.item.name,'pt-BR'));
  const result=filtered.map(entry=>entry.item);
  grid.innerHTML=result.map(card).join('');
  empty.style.display=result.length?'none':'block';
  document.getElementById('visibleCount').textContent=result.length;
}

filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(b=>b.classList.remove('active'));btn.classList.add('active');active=btn.dataset.filter;render()}));
search.addEventListener('input',render);
priceFilter.addEventListener('change',render);
sortOrder.addEventListener('change',render);
document.getElementById('totalCount').textContent=items.length;
document.getElementById('shareBtn').addEventListener('click',async()=>{const data={title:document.title,text:'Conheça o Jardim de Desejos de Michèlé Joohann',url:location.href};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(location.href);alert('Link copiado!')}}catch(e){}});
render();