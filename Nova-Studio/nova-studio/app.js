'use strict';
const $ = (id) => document.getElementById(id);
const KEY = 'nova-studio-settings-v1';
const DB = 'nova-studio-assets';
const FONT = {
  system: 'system-ui, sans-serif', modern: '"Segoe UI", Arial, sans-serif', rounded: '"Arial Rounded MT Bold", "Trebuchet MS", sans-serif',
  classic: 'Georgia, serif', editorial: '"Times New Roman", serif', mono: '"JetBrains Mono", "DejaVu Sans Mono", monospace',
  condensed: '"Arial Narrow", "Liberation Sans Narrow", sans-serif', playful: '"Comic Sans MS", cursive', custom: '"NovaCustom", system-ui, sans-serif'
};
const fonts = [['system','Sistema'],['modern','Moderna'],['rounded','Arredondada'],['classic','Serifada'],['editorial','Editorial'],['mono','Monoespaçada'],['condensed','Condensada'],['playful','Descontraída'],['custom','Minha fonte (upload)']];
const weights = [['100','Ultrafina'],['200','Muito fina'],['300','Leve'],['400','Normal'],['500','Média'],['600','Seminegrito'],['700','Negrito'],['800','Extra negrito'],['900','Pesada']];
const dateFormats = [['full','sexta-feira, 27 de novembro'],['short','sex., 27 de nov.'],['numeric','27/11/2026'],['long','27 de novembro de 2026'],['day','sexta-feira'],['month','novembro de 2026']];
const zones = [['local','Horário do dispositivo'],['America/Sao_Paulo','Brasília (São Paulo)'],['America/Manaus','Manaus'],['America/Rio_Branco','Rio Branco'],['America/New_York','Nova York'],['Europe/Lisbon','Lisboa'],['Europe/London','Londres'],['Europe/Paris','Paris'],['Asia/Tokyo','Tóquio'],['UTC','UTC'],['custom','Outro fuso (IANA)']];
const engines = { google:'https://www.google.com/search?q=', bing:'https://www.bing.com/search?q=', duck:'https://duckduckgo.com/?q=', brave:'https://search.brave.com/search?q=', yahoo:'https://search.yahoo.com/search?p=' };
const themes = {
  aurora: {name:'Aurora', a:'#142744', b:'#111425', c:'#51263b', text:'#eff5ff', bar:'#131b2c'},
  midnight: {name:'Meia-noite', a:'#10131b', b:'#10131b', c:'#161c30', text:'#ffffff', bar:'#141824'},
  crimson: {name:'Carmesim', a:'#181d38', b:'#090d18', c:'#8d1a37', text:'#ffffff', bar:'#141220'},
  lilac: {name:'Lavanda', a:'#4a426e', b:'#272642', c:'#be87b7', text:'#f8edff', bar:'#27213d'},
  sand: {name:'Dunas', a:'#aa795c', b:'#55434c', c:'#272c47', text:'#fff2e0', bar:'#352b2f'},
  forest: {name:'Floresta', a:'#172e31', b:'#101a21', c:'#406c55', text:'#e4fff1', bar:'#142623'}
};
const gradient = (a,b,c) => `radial-gradient(ellipse at 19% 12%, ${a}, transparent 63%), radial-gradient(ellipse at 92% 85%, ${c}, transparent 68%), ${b}`;
const textBase = {font:'system',weight:'500',color:'#eff5ff',opacity:100,spacing:0,italic:false,shadow:14,shadowColor:'#080a15',glow:0,gradient:false,gradientColor:'#a8b7ff',align:'center',scaleMobile:true,glass:false,glassTint:18,glassBlur:9,glassShine:58,glassEdge:0.8,glassSaturation:130};
const defaults = {
  background:{type:'gradient',color:'#111425',a:'#142744',b:'#111425',c:'#51263b',dim:8,blur:0,brightness:100,saturation:100,zoom:100,x:50,y:50,fit:'cover',assetName:'',assetKind:'',assetId:''},
  clock:{...textBase,show:true,x:50,y:28,size:110,weight:'300',spacing:-5,format:'24',seconds:false,period:true,zone:'local',customZone:'America/Sao_Paulo'},
  date:{...textBase,show:true,x:50,y:15,size:20,weight:'500',format:'full',uppercase:false},
  logo:{...textBase,show:true,x:50,y:48,size:54,weight:'600',spacing:-3,text:'Google',gradient:false},
  search:{show:true,x:50,y:59,width:680,height:56,radius:30,background:'#131b2c',opacity:65,textColor:'#ffffff',placeholderColor:'#b9c3d7',borderColor:'#ffffff',borderOpacity:20,borderWidth:1,blur:18,shadow:20,focus:'#a8b7ff',font:'system',fontSize:16,placeholder:'Pesquisar no Google',icon:true,button:true,engine:'google',customEngine:'https://www.google.com/search?q={query}'},
  links:{show:true,x:50,y:74,width:750,size:54,radius:18,background:'#ffffff',opacity:11,borderColor:'#ffffff',borderOpacity:18,blur:12,color:'#eff5ff',fontSize:12,gap:16,labels:true,newTab:false,items:[{name:'YouTube',url:'https://www.youtube.com/',icon:'▶'},{name:'GitHub',url:'https://github.com/',icon:'⌘'},{name:'Gmail',url:'https://mail.google.com/',icon:'✉'},{name:'ChatGPT',url:'https://chatgpt.com/',icon:'✳'}]},
  note:{...textBase,show:false,x:50,y:90,size:16,text:'Um dia de cada vez.',weight:'400',opacity:80},
  layout:{motion:'fade',showHandles:true,snapCenter:true,snapWidgets:true,snapDistance:10}, fontAsset:{name:'',id:''}
};
const clone = (o) => JSON.parse(JSON.stringify(o));
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
const get = (path) => path.split('.').reduce((v,k)=>v[k],settings);
function set(path,value){const keys=path.split('.');const key=keys.pop();keys.reduce((v,k)=>v[k],settings)[key]=value;}
const rgba = (hex,op) => {const c=/^#[0-9a-f]{6}$/i.test(hex)?hex:'#000000';return `rgba(${parseInt(c.slice(1,3),16)},${parseInt(c.slice(3,5),16)},${parseInt(c.slice(5,7),16)},${clamp(op,0,100)/100})`;};
const safeUrl = (raw) => {try{const u=new URL(raw);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}};
const normalUrl = (raw) => {const s=raw.trim();return safeUrl(s)||(!s.includes(':') && s.includes('.')?safeUrl('https://'+s):null);};
const fieldRules = new Map();
const range = (key,label,min,max,step=1,unit='') => {const x={key,label,type:'range',min,max,step,unit};fieldRules.set(key,x);return x;};
const choice = (key,label,options) => {const x={key,label,type:'select',options};fieldRules.set(key,x);return x;};
const color = (key,label) => {const x={key,label,type:'color'};fieldRules.set(key,x);return x;};
const toggle = (key,label) => {const x={key,label,type:'checkbox'};fieldRules.set(key,x);return x;};
const text = (key,label,max=140,area=false) => {const x={key,label,type:area?'textarea':'text',max};fieldRules.set(key,x);return x;};
const section = (title,fields,help='') => ({title,fields,help});
const textStyle = (k,maxSize=180) => [choice(`${k}.font`,'Fonte',fonts),choice(`${k}.weight`,'Peso da fonte',weights),range(`${k}.size`,'Tamanho',10,maxSize,1,' px'),color(`${k}.color`,'Cor do texto'),range(`${k}.opacity`,'Opacidade',0,100,1,'%'),range(`${k}.spacing`,'Espaçamento das letras',-10,25,.5,' px'),choice(`${k}.align`,'Alinhamento',[['left','Esquerda'],['center','Centro'],['right','Direita']]),toggle(`${k}.italic`,'Itálico'),toggle(`${k}.scaleMobile`,'Reduzir em telas pequenas')];
const textEffects = (k) => [range(`${k}.shadow`,'Sombra',0,50,1,' px'),color(`${k}.shadowColor`,'Cor da sombra'),range(`${k}.glow`,'Brilho / neon',0,50,1,' px'),toggle(`${k}.gradient`,'Texto em degradê'),color(`${k}.gradientColor`,'Segunda cor do degradê')];
const glassFields=(k)=>[toggle(`${k}.glass`,'Ativar modo vidro'),range(`${k}.glassTint`,'Intensidade da cor',0,100,1,'%'),range(`${k}.glassBlur`,'Desfoque dentro das letras',0,30,1,' px'),range(`${k}.glassShine`,'Reflexo de luz',0,100,1,'%'),range(`${k}.glassEdge`,'Contorno do vidro',0,3,.1,' px'),range(`${k}.glassSaturation`,'Saturação do vidro',0,200,1,'%')];
const glassSection=(k,label)=>section('Vidro • '+label,glassFields(k),'O fundo aparece através das letras. Ajuste a cor, o reflexo e o desfoque. O vidro tem prioridade sobre o degradê convencional.');
const widgetNames={clock:'Relógio',date:'Data',logo:'Logotipo',search:'Pesquisa',links:'Atalhos',note:'Mensagem'};
const positions={};for(const k of Object.keys(widgetNames)) positions[k]=[range(`${k}.x`,'Horizontal',0,100,0.1,'%'),range(`${k}.y`,'Vertical',0,100,0.1,'%')];
const categories={
  themes:{label:'Temas',icon:'spark',title:'Seu estilo',desc:'Comece com um tema e ajuste cada detalhe.',sections:[]},
  background:{label:'Fundo',icon:'image',title:'Papel de parede',desc:'Use cores, uma imagem, GIF ou vídeo do seu computador.',sections:[section('Tipo de fundo',[choice('background.type','Fundo',[['gradient','Degradê'],['solid','Cor sólida'],['asset','Meu wallpaper']]),color('background.color','Cor sólida'),color('background.a','Degradê • primeira cor'),color('background.b','Degradê • base'),color('background.c','Degradê • terceira cor')]),section('Ajuste da imagem',[choice('background.fit','Preenchimento',[['cover','Preencher'],['contain','Conter'],['stretch','Esticar']]),range('background.x','Posição horizontal',0,100,1,'%'),range('background.y','Posição vertical',0,100,1,'%'),range('background.zoom','Zoom',100,200,1,'%')]),section('Efeitos do fundo',[range('background.dim','Escurecimento',0,90,1,'%'),range('background.blur','Desfoque',0,30,1,' px'),range('background.brightness','Luminosidade',30,180,1,'%'),range('background.saturation','Saturação',0,200,1,'%')])]},
  clock:{label:'Relógio',icon:'clock',title:'Relógio e data',desc:'Estilo de tela bloqueada: personalize os dois elementos separadamente.',sections:[section('Relógio',[toggle('clock.show','Exibir relógio'),choice('clock.format','Formato',[['24','24 horas'],['12','12 horas']]),toggle('clock.seconds','Mostrar segundos'),toggle('clock.period','Mostrar AM/PM no formato 12h'),choice('clock.zone','Fuso horário',zones),text('clock.customZone','Fuso personalizado (IANA)',100)],'O horário acompanha o relógio do computador. O fuso personalizado só é usado quando selecionado.'),section('Tipografia do relógio',textStyle('clock',260)),section('Efeitos do relógio',textEffects('clock')),glassSection('clock','relógio'),section('Data',[toggle('date.show','Exibir data'),choice('date.format','Formato da data',dateFormats),toggle('date.uppercase','Letras maiúsculas'),...textStyle('date',80)]),section('Efeitos da data',textEffects('date')),glassSection('date','data')]},
  logo:{label:'Logo',icon:'type',title:'Logotipo e mensagem',desc:'Mude o Google ou use seu próprio texto.',sections:[section('Logotipo',[toggle('logo.show','Exibir logotipo'),text('logo.text','Texto do logotipo',100),...textStyle('logo',160)]),section('Efeitos do logotipo',textEffects('logo')),glassSection('logo','logotipo'),section('Mensagem pessoal',[toggle('note.show','Exibir mensagem'),text('note.text','Sua mensagem',220,true),...textStyle('note',80)]),section('Efeitos da mensagem',textEffects('note')),glassSection('note','mensagem')]},
  search:{label:'Pesquisa',icon:'search',title:'Barra de pesquisa',desc:'Controle a aparência sem perder a pesquisa na web.',sections:[section('Pesquisa',[toggle('search.show','Exibir barra'),choice('search.engine','Buscador',[['google','Google'],['bing','Bing'],['duck','DuckDuckGo'],['brave','Brave Search'],['yahoo','Yahoo'],['custom','Personalizado']]),text('search.customEngine','URL com {query}',500),text('search.placeholder','Texto de dica',120),toggle('search.icon','Mostrar lupa'),toggle('search.button','Mostrar botão de pesquisar')],'Para um buscador próprio, use uma URL HTTPS ou HTTP com {query} no lugar do texto pesquisado.'),section('Dimensões',[range('search.width','Largura',200,1000,5,' px'),range('search.height','Altura',34,100,1,' px'),range('search.radius','Arredondamento',0,60,1,' px')]),section('Cores e tipografia',[color('search.background','Cor da barra'),range('search.opacity','Opacidade do fundo',0,100,1,'%'),color('search.textColor','Texto'),color('search.placeholderColor','Texto de dica'),choice('search.font','Fonte',fonts),range('search.fontSize','Tamanho do texto',11,28,1,' px'),color('search.focus','Cor de foco')]),section('Borda e efeitos',[color('search.borderColor','Cor da borda'),range('search.borderOpacity','Opacidade da borda',0,100,1,'%'),range('search.borderWidth','Espessura',0,5,.5,' px'),range('search.blur','Desfoque de vidro',0,40,1,' px'),range('search.shadow','Sombra',0,60,1,' px')])]},
  links:{label:'Atalhos',icon:'grid',title:'Seus atalhos',desc:'Adicione sites com nome e ícone, sem acesso ao histórico.',sections:[section('Aparência',[toggle('links.show','Exibir atalhos'),toggle('links.labels','Mostrar nomes'),toggle('links.newTab','Abrir em outra guia'),range('links.width','Largura do grupo',180,1200,10,' px'),range('links.size','Tamanho dos ícones',30,90,1,' px'),range('links.radius','Arredondamento',0,50,1,' px'),range('links.gap','Espaçamento',0,40,1,' px'),color('links.background','Cor dos cartões'),range('links.opacity','Opacidade',0,100,1,'%'),color('links.borderColor','Cor da borda'),range('links.borderOpacity','Opacidade da borda',0,100,1,'%'),range('links.blur','Desfoque',0,30,1,' px'),color('links.color','Cor do texto'),range('links.fontSize','Tamanho dos nomes',9,22,1,' px')])]},
  layout:{label:'Layout',icon:'layout',title:'Organize a tela',desc:'Arraste os elementos na prévia ou ajuste as posições com precisão.',sections:[section('Movimento',[choice('layout.motion','Animação ao abrir',[['none','Nenhuma'],['fade','Desvanecer'],['slide','Subir suavemente'],['scale','Aproximar']]),toggle('layout.showHandles','Mostrar contornos de edição'),toggle('layout.snapCenter','Encaixar no centro da tela'),toggle('layout.snapWidgets','Alinhar com outros elementos'),range('layout.snapDistance','Distância de encaixe',2,24,1,' px')],'Linhas-guia aparecem ao arrastar. Segure Shift para mover sem encaixe.'),...Object.keys(widgetNames).map(k=>section(widgetNames[k],positions[k]))]},
  backup:{label:'Ajustes',icon:'settings',title:'Fontes e configurações',desc:'Seus ajustes e arquivos ficam no próprio navegador.',sections:[]}
};
function normalize(raw){
  const out=clone(defaults); if(!raw || typeof raw!=='object')return out;
  for(const [key,f] of fieldRules){const [a,b]=key.split('.');const val=raw[a]?.[b];if(f.type==='range'&&typeof val==='number'&&Number.isFinite(val))out[a][b]=clamp(val,f.min,f.max);else if(f.type==='color'&&typeof val==='string'&&/^#[0-9a-f]{6}$/i.test(val))out[a][b]=val;else if(f.type==='checkbox'&&typeof val==='boolean')out[a][b]=val;else if(f.type==='select'&&f.options.some(o=>o[0]===val))out[a][b]=val;else if(['text','textarea'].includes(f.type)&&typeof val==='string')out[a][b]=val.slice(0,f.max);}
  for(const [a,keys] of [['background',['assetName','assetKind','assetId']],['fontAsset',['name','id']]])for(const k of keys)if(typeof raw[a]?.[k]==='string')out[a][k]=raw[a][k].slice(0,255);
  if(Array.isArray(raw.links?.items))out.links.items=raw.links.items.slice(0,24).filter(x=>x&&typeof x==='object').map(x=>({name:String(x.name??'').slice(0,50),url:String(x.url??'').slice(0,1000),icon:String(x.icon??'').slice(0,12)}));
  return out;
}
let settings;try{settings=normalize(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{settings=clone(defaults);}
let currentTab='themes', editing=false, toastTimer, savedTimer, assetUrls={wallpaper:null,font:null}, loadedAsset={wallpaper:null,font:null}, assetRequest={wallpaper:0,font:0}, customFace=null, dbPromise, pendingSave=false;
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3600);}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(settings));pendingSave=false;$('save-status').textContent='Salvo neste dispositivo';}catch(e){$('save-status').textContent='Falha ao salvar';toast('Não foi possível salvar os ajustes. Exporte um backup.');}}
function scheduleSave(){pendingSave=true;$('save-status').textContent='Salvando…';clearTimeout(savedTimer);savedTimer=setTimeout(persist,120);}
window.addEventListener('pagehide',()=>{if(pendingSave)persist();});
function openDb(){if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('assets');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});return dbPromise;}
async function assetOp(mode, fn){const db=await openDb();return new Promise((resolve,reject)=>{const t=db.transaction('assets',mode);let request=fn(t.objectStore('assets'));t.oncomplete=()=>resolve(request.result);t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);});}
const readAsset=(k)=>assetOp('readonly',s=>s.get(k));
const putAsset=(k,v)=>assetOp('readwrite',s=>s.put(v,k));
const deleteAsset=(k)=>assetOp('readwrite',s=>s.delete(k));
function newId(){return globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`;}
function fontValid(blob,name){return blob.size>0&&blob.size<=10*1024*1024&&/\.(ttf|otf|woff2?)$/i.test(name);}
function wallpaperValid(blob){return blob.size>0&&blob.size<=50*1024*1024&&/^(image\/(png|jpeg|webp|gif|avif|bmp)|video\/(mp4|webm|ogg))$/i.test(blob.type);}
async function refreshAsset(kind,force=false){
  const desired=kind==='wallpaper'?settings.background.assetId:settings.fontAsset.id;
  if(!force&&desired===loadedAsset[kind])return;
  const token=++assetRequest[kind];loadedAsset[kind]=desired;
  try{
    const entry=desired?await readAsset(kind):null;if(token!==assetRequest[kind])return;
    if(kind==='font'){
      if(customFace){document.fonts.delete(customFace);customFace=null;}
      if(assetUrls.font){URL.revokeObjectURL(assetUrls.font);assetUrls.font=null;}
      if(entry?.blob){const u=URL.createObjectURL(entry.blob);const face=new FontFace('NovaCustom',`url("${u}")`);try{await face.load();if(token!==assetRequest.font){URL.revokeObjectURL(u);return;}document.fonts.add(face);customFace=face;assetUrls.font=u;maskCache.clear();queueGlass();}catch(e){URL.revokeObjectURL(u);throw e;}}
    }else{const v=$('background-video');v.pause();v.removeAttribute('src');v.load();if(assetUrls.wallpaper)URL.revokeObjectURL(assetUrls.wallpaper);assetUrls.wallpaper=entry?.blob?URL.createObjectURL(entry.blob):null;}
    render();
  }catch(e){if(token===assetRequest[kind])toast(kind==='font'?'Não foi possível carregar a fonte. Usando fonte do sistema.':'Não foi possível carregar o wallpaper.');console.warn(e);}
}
function applyBackground(){
  const b=settings.background,w=$('wallpaper'),v=$('background-video');const u=assetUrls.wallpaper;
  const isVideo=b.type==='asset'&&!!u&&b.assetKind==='video';
  w.style.background=b.type==='solid'?b.color:gradient(b.a,b.b,b.c);
  if(b.type==='asset'&&u&&!isVideo)w.style.backgroundImage=`url("${u}")`;
  w.style.backgroundSize=b.fit==='stretch'?'100% 100%':b.fit;w.style.backgroundPosition=`${b.x}% ${b.y}%`;w.style.backgroundRepeat='no-repeat';
  w.style.transform=`scale(${b.zoom/100 + b.blur/350})`;w.style.transformOrigin=`${b.x}% ${b.y}%`;w.style.filter=`blur(${b.blur}px) brightness(${b.brightness}%) saturate(${b.saturation}%)`;
  v.hidden=!isVideo;if(isVideo){if(v.getAttribute('src')!==u){v.src=u;v.play().catch(()=>{});}v.style.objectFit=b.fit==='stretch'?'fill':b.fit;v.style.objectPosition=`${b.x}% ${b.y}%`;}else if(!v.paused)v.pause();
  if(isVideo&&v.paused&&!document.hidden)v.play().catch(()=>{});
  $('overlay').style.opacity=b.dim/100;
}
function renderPosition(k){const el=$(k+'-widget'),s=settings[k];el.hidden=!s.show;el.style.left=`${s.x}%`;el.style.top=`${s.y}%`;}
const textWidgets=['clock','date','logo','note'];
const maskCache=new Map();let glassFrame=0;
function queueGlass(){if(!glassFrame)glassFrame=requestAnimationFrame(()=>{glassFrame=0;for(const k of textWidgets)refreshGlass(k);});}
function styleText(k){
  const el=$(k+'-text'),s=settings[k];
  el.style.fontFamily=FONT[s.font];el.style.fontWeight=s.weight;
  el.style.fontSize=s.scaleMobile?`clamp(${Math.min(s.size,12)}px, min(${s.size}px, ${s.size/10}vw), ${s.size}px)`:`${s.size}px`;
  el.style.fontStyle=s.italic?'italic':'normal';el.style.letterSpacing=s.spacing+'px';el.style.color=s.color;el.style.opacity=s.opacity/100;el.style.textAlign=s.align;
  el.style.textShadow=`0 3px ${s.shadow}px ${s.shadow?s.shadowColor:'transparent'}, 0 0 ${s.glow}px ${s.glow?s.color:'transparent'}`;
  el.style.backgroundImage=s.gradient?`linear-gradient(125deg,${s.color},${s.gradientColor})`:'none';
  el.style.backgroundClip=s.gradient?'text':'border-box';el.style.webkitTextFillColor=s.gradient?'transparent':'currentcolor';
  el.style.webkitTextStroke='0 transparent';el.classList.toggle('glass-text',s.glass);
  if(s.gradient)el.style.textShadow='none';
  if(s.glass){
    const shine=s.glassShine,tint=s.glassTint;
    el.style.backgroundImage=`linear-gradient(145deg,${rgba('#ffffff',shine*.66)} 0%,${rgba(s.color,tint)} 36%,${rgba(s.color,tint*.35)} 58%,${rgba('#ffffff',shine*.32)} 100%)`;
    el.style.backgroundClip='text';el.style.webkitTextFillColor='transparent';
    el.style.webkitTextStroke=`${s.glassEdge}px ${rgba('#ffffff',shine*.82)}`;
    // Ordinary text shadows paint inside transparent glyphs, so use subtle edge glow only.
    el.style.textShadow=s.glow?`0 0 ${s.glow}px ${rgba(s.color,18)}`:'none';
  }
}
// Paint a glyph-shaped mask from the actual text layout, including AM/PM,
// font choice, wrapped lines and letter spacing. Only the glass layer is masked;
// the underlying DOM text stays accessible and provides the specular highlight.
function refreshGlass(k){
  const el=$(k+'-text'),w=$(k+'-widget'),s=settings[k];let layer=w.querySelector('.glass-layer');
  if(!s.show||!s.glass||!s.glassBlur||!el.textContent){if(layer)layer.hidden=true;return;}
  if(!layer){layer=document.createElement('div');layer.className='glass-layer';layer.setAttribute('aria-hidden','true');w.append(layer);}
  const box=el.getBoundingClientRect(),width=el.offsetWidth,height=el.offsetHeight;
  if(width<1||height<1){layer.hidden=true;return;}
  const css=getComputedStyle(el),period=el.querySelector('.period');
  const key=JSON.stringify([el.textContent,width,height,css.fontFamily,css.fontSize,css.fontStyle,css.fontWeight,css.letterSpacing,css.textAlign,period?.textContent,settings.fontAsset.id]);
  if(maskCache.get(k)!==key||!layer.style.maskImage){
    try{
      const dpr=Math.min(devicePixelRatio||1,2),canvas=document.createElement('canvas');
      canvas.width=Math.ceil(width*dpr);canvas.height=Math.ceil(height*dpr);
      const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);ctx.fillStyle='#fff';ctx.textBaseline='alphabetic';
      const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),range=document.createRange();let txt;
      while((txt=walk.nextNode())){
        const style=getComputedStyle(txt.parentElement);ctx.font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        if('letterSpacing' in ctx)ctx.letterSpacing=style.letterSpacing==='normal'?'0px':style.letterSpacing;
        const metrics=ctx.measureText('Hg');const ascent=metrics.fontBoundingBoxAscent??parseFloat(style.fontSize)*.8;
        const segs=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(txt.data)].map(a=>({index:a.index,len:a.segment.length})):Array.from(txt.data).reduce((a,ch)=>{a.push({index:a.length?a.at(-1).index+a.at(-1).len:0,len:ch.length});return a;},[]);
        let run=null;
        const draw=()=>{if(run){ctx.fillText(txt.data.slice(run.start,run.end),run.x-box.left,run.y-box.top+ascent);run=null;}};
        for(const seg of segs){range.setStart(txt,seg.index);range.setEnd(txt,seg.index+seg.len);const r=range.getBoundingClientRect();if(!r.width||!r.height){draw();continue;}if(run&&Math.abs(run.y-r.top)>.5)draw();if(!run)run={start:seg.index,end:seg.index+seg.len,x:r.left,y:r.top};else run.end=seg.index+seg.len;}draw();
      }
      layer.style.maskImage=`url("${canvas.toDataURL('image/png')}")`;maskCache.set(k,key);
    }catch(err){layer.hidden=true;console.warn('Glass mask:',err);return;}
  }
  layer.style.backdropFilter=`blur(${s.glassBlur}px) saturate(${s.glassSaturation}%)`;
  layer.style.opacity=s.opacity/100;layer.hidden=false;
}
function getTimeZone(){const c=settings.clock;const zone=c.zone==='custom'?c.customZone:c.zone;if(zone==='local')return undefined;try{new Intl.DateTimeFormat('pt-BR',{timeZone:zone});return zone;}catch{return undefined;}}
let lastClock='';let lastDate='';
function tick(){const c=settings.clock,d=settings.date,now=new Date(),tz=getTimeZone();const opt={hour:'2-digit',minute:'2-digit',hourCycle:c.format==='24'?'h23':'h12',timeZone:tz};if(c.seconds)opt.second='2-digit';const parts=new Intl.DateTimeFormat('en-GB',opt).formatToParts(now);const time=parts.filter(p=>p.type!=='dayPeriod').map(p=>p.value).join('').trim();const period=c.format==='12'&&c.period?(parts.find(p=>p.type==='dayPeriod')?.value||'').toUpperCase():'';const key=time+'|'+period;if(key!==lastClock){lastClock=key;$('clock-text').textContent=time;if(period){const span=document.createElement('span');span.className='period';span.textContent=period;$('clock-text').append(span);}}
  const formats={full:{weekday:'long',day:'numeric',month:'long'},short:{weekday:'short',day:'numeric',month:'short'},numeric:{day:'2-digit',month:'2-digit',year:'numeric'},long:{day:'numeric',month:'long',year:'numeric'},day:{weekday:'long'},month:{month:'long',year:'numeric'}};let date=new Intl.DateTimeFormat('pt-BR',{...formats[d.format],timeZone:tz}).format(now);if(d.uppercase)date=date.toUpperCase();else date=date.charAt(0).toUpperCase()+date.slice(1);if(date!==lastDate){lastDate=date;$('date-text').textContent=date;}queueGlass();}
function renderSearch(){const s=settings.search,el=$('search-widget'),f=$('search-form');el.style.width=`${s.width}px`;f.style.height=s.height+'px';f.style.borderRadius=s.radius+'px';f.style.background=rgba(s.background,s.opacity);f.style.color=s.textColor;f.style.border=`${s.borderWidth}px solid ${rgba(s.borderColor,s.borderOpacity)}`;f.style.backdropFilter=`blur(${s.blur}px)`;f.style.boxShadow=`0 8px ${s.shadow}px ${s.shadow?'#0005':'transparent'}`;f.style.setProperty('--search-shadow',f.style.boxShadow);f.style.setProperty('--focus-color',s.focus);f.style.setProperty('--focus-ring',rgba(s.focus,20));f.style.setProperty('--placeholder',s.placeholderColor);f.style.fontFamily=FONT[s.font];f.style.fontSize=s.fontSize+'px';$('search-input').placeholder=s.placeholder;$('search-icon').hidden=!s.icon;$('search-submit').hidden=!s.button;}
let linksSignature='';
function renderLinks(){const s=settings.links,el=$('links-widget'),nav=$('quick-links');el.style.width=s.width+'px';el.style.color=s.color;const props={'--tile-size':s.size+'px','--tile-width':Math.max(s.size, s.labels?76:0)+'px','--tile-radius':s.radius+'px','--tile-bg':rgba(s.background,s.opacity),'--tile-border':rgba(s.borderColor,s.borderOpacity),'--tile-blur':s.blur+'px','--tile-icon':Math.round(s.size*.42)+'px','--link-font':s.fontSize+'px','--link-gap':s.gap+'px'};Object.entries(props).forEach(([k,v])=>nav.style.setProperty(k,v));const sig=JSON.stringify([s.items,s.newTab,s.labels,editing]);if(sig===linksSignature)return;linksSignature=sig;nav.replaceChildren();for(const item of s.items){const url=normalUrl(item.url);if(!url)continue;const a=document.createElement('a');a.className='quick-link';a.href=url;a.title=item.name||url;if(s.newTab){a.target='_blank';a.rel='noopener noreferrer';}if(editing)a.addEventListener('click',e=>e.preventDefault());const tile=document.createElement('span');tile.className='tile';tile.textContent=item.icon||item.name.slice(0,1).toUpperCase()||'•';const label=document.createElement('span');label.className='link-label';label.textContent=item.name||new URL(url).hostname;a.append(tile);if(s.labels)a.append(label);a.setAttribute('aria-label',item.name||url);nav.append(a);}if(!nav.children.length&&editing){const empty=document.createElement('span');empty.className='empty-links';empty.textContent='Adicione atalhos no painel.';nav.append(empty);}}
function render(){applyBackground();for(const k of Object.keys(widgetNames))renderPosition(k);for(const k of ['clock','date','logo','note'])styleText(k);$('logo-text').textContent=settings.logo.text;$('note-text').textContent=settings.note.text;tick();renderSearch();renderLinks();document.body.classList.toggle('no-handles',!settings.layout.showHandles);}
function update(key,value){set(key,value);render();scheduleSave();}
function setEditMode(mode){
  clearGuides();
  editing=mode!=='off';
  document.body.classList.toggle('editing',editing);
  document.body.classList.toggle('panel-open',mode==='panel');
  $('settings').hidden=mode!=='panel';
  $('editing-tip').hidden=!editing;
  $('full-edit-toolbar').hidden=mode!=='full';
  $('open-settings').setAttribute('aria-expanded',String(editing));
  render();
  for(const el of document.querySelectorAll('.widget')){
    const name=widgetNames[el.dataset.widget];
    el.firstElementChild.inert=editing;
    if(editing){el.tabIndex=0;el.setAttribute('aria-label',`Mover ${name.toLowerCase()}. Use as setas para ajustar.`);el.title=`Arraste para mover ${name.toLowerCase()} • Duplo clique para personalizar`;}
    else{el.removeAttribute('tabindex');el.removeAttribute('aria-label');el.removeAttribute('title');el.classList.remove('drag-active','selected-widget');}
  }
  if(mode==='panel'){renderPanel();$('close-settings').focus();}
  else if(mode==='full'){$('back-settings').focus();}
  else{if(pendingSave)persist();$('open-settings').focus();}
}
function openPanel(){setEditMode('panel');}
function openFullEdit(){setEditMode('full');}
function closePanel(){setEditMode('off');}
const svgPaths={spark:'<path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19"/>',image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 3-3 6 6"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',type:'<path d="M4 20 12 4l8 16M7 14h10"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',layout:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 10h18M10 10v11"/>',settings:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="currentColor"/><circle cx="15" cy="12" r="2" fill="currentColor"/><circle cx="10" cy="18" r="2" fill="currentColor"/>'};
function node(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;}
function button(label,fn,cls='secondary-button'){const b=node('button',cls,label);b.type='button';b.addEventListener('click',fn);return b;}
function renderTabs(){const nav=$('tabs');nav.replaceChildren();for(const [id,tab] of Object.entries(categories)){const b=button('',()=>{currentTab=id;renderPanel();},'tab'+(id===currentTab?' active':''));b.setAttribute('aria-pressed',String(id===currentTab));b.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svgPaths[tab.icon]}</svg>`;b.append(node('span','',tab.label));nav.append(b);}}
function makeField(f){const value=get(f.key),wrap=node('div','field'+(f.type==='color'?' color-field':f.type==='checkbox'?' toggle-field':''));const head=node('div','field-head');const id='f-'+f.key.replace('.','-');const label=node('label','',f.label);label.htmlFor=id;head.append(label);wrap.append(head);let input;if(f.type==='select'){input=node('select');for(const [v,label] of f.options){const o=node('option','',label);o.value=v;input.append(o);}}else if(f.type==='textarea'){input=node('textarea');input.rows=2;input.maxLength=f.max;}else{input=node('input');input.type=f.type;if(f.type==='text')input.maxLength=f.max;if(f.type==='range'){input.min=f.min;input.max=f.max;input.step=f.step;const out=node('output','',value+f.unit);out.htmlFor=id;head.append(out);input.addEventListener('input',()=>out.textContent=input.value+f.unit);}}
  input.id=id;input.dataset.key=f.key;if(f.type==='checkbox')input.checked=value;else input.value=value;input.addEventListener('input',()=>{update(f.key,f.type==='checkbox'?input.checked:f.type==='range'?Number(input.value):input.value);});wrap.append(input);return wrap;}
function makeSection(title,fields=[],help=''){
  const sec=node('section','section');if(fields.length)sec.dataset.section=fields[0].key;
  const heading=node('h3','section-title',title);heading.tabIndex=-1;
  const k=fields[0]?.key.split('.')[0];
  if(textWidgets.includes(k)&&fields[0].key===k+'.show'){
    const row=node('div','section-heading');row.append(heading,button('Vidro',()=>scrollToSection(k+'.glass'),'section-shortcut'));sec.append(row);
  }else sec.append(heading);
  if(help)sec.append(node('p','help',help));for(const f of fields)sec.append(makeField(f));return sec;
}
function setTheme(id){const t=themes[id];Object.assign(settings.background,{type:'gradient',a:t.a,b:t.b,c:t.c,dim:8,blur:0,brightness:100,saturation:100,zoom:100});for(const k of ['clock','date','logo','note'])settings[k].color=t.text;settings.search.background=t.bar;settings.links.color=t.text;render();persist();toast('Tema '+t.name+' aplicado.');}
function fileChooser(label,accept,onFile){const group=node('div','button-row');const input=node('input','asset-input');input.type='file';input.accept=accept;input.tabIndex=-1;input.setAttribute('aria-label',label);const b=button(label,()=>input.click());input.addEventListener('change',async()=>{const file=input.files[0];if(!file)return;b.disabled=true;try{await onFile(file);}catch(e){console.warn(e);toast(e.message||'Não foi possível importar o arquivo.');}finally{b.disabled=false;input.value='';}});group.append(input,b);return group;}
async function uploadWallpaper(file){if(!wallpaperValid(file))throw Error('Use PNG, JPG, WebP, GIF, AVIF, BMP, MP4 ou WebM de até 50 MB.');await putAsset('wallpaper',{name:file.name,blob:file});Object.assign(settings.background,{assetName:file.name,assetKind:file.type.startsWith('video/')?'video':'image',assetId:newId(),type:'asset'});persist();await refreshAsset('wallpaper',true);renderPanel();toast('Wallpaper aplicado.');}
async function uploadFont(file){if(!fontValid(file,file.name))throw Error('Use uma fonte TTF, OTF, WOFF ou WOFF2 de até 10 MB.');const url=URL.createObjectURL(file);try{const test=new FontFace('NovaValidation',`url("${url}")`);await test.load();}catch{throw Error('O arquivo não é uma fonte compatível.');}finally{URL.revokeObjectURL(url);}await putAsset('font',{name:file.name,blob:file});settings.fontAsset={name:file.name,id:newId()};settings.clock.font='custom';persist();await refreshAsset('font',true);renderPanel();toast('Fonte importada e aplicada ao relógio.');}
async function removeWallpaper(){await deleteAsset('wallpaper');Object.assign(settings.background,{assetName:'',assetKind:'',assetId:'',type:'gradient'});persist();await refreshAsset('wallpaper',true);renderPanel();}
async function removeFont(){await deleteAsset('font');settings.fontAsset={name:'',id:''};for(const k of ['clock','date','logo','note','search'])if(settings[k].font==='custom')settings[k].font='system';persist();await refreshAsset('font',true);renderPanel();}
function assetSection(kind){const isFont=kind==='font',name=isFont?settings.fontAsset.name:settings.background.assetName;const sec=makeSection(isFont?'Minha fonte':'Meu wallpaper',[],isFont?'Importe uma fonte local e selecione “Minha fonte (upload)” em qualquer elemento. A fonte é aplicada ao relógio inicialmente.':'Imagens, GIFs e vídeos locais de até 50 MB. Vídeos são reproduzidos em loop, sem som.');sec.append(fileChooser(isFont?'Importar fonte':'Escolher wallpaper',isFont?'.ttf,.otf,.woff,.woff2':'image/png,image/jpeg,image/webp,image/gif,image/avif,image/bmp,video/mp4,video/webm,video/ogg',isFont?uploadFont:uploadWallpaper));if(name){const row=node('div','asset-row');row.append(node('span','',name),button('Remover',async()=>{try{await(isFont?removeFont():removeWallpaper());}catch(e){toast('Não foi possível remover o arquivo.');}}));sec.append(row);}return sec;}
function linkSection(){const sec=makeSection('Meus sites',[],'Use um emoji, letra ou símbolo como ícone. Informe um endereço HTTP/HTTPS.');settings.links.items.forEach((item,i)=>{const row=node('div','link-editor');for(const [key,label,cls,max] of [['icon','Ícone','link-icon-input',12],['name','Nome','',50],['url','Endereço','url-input',1000]]){const inp=node('input',cls);inp.type='text';inp.value=item[key];inp.placeholder=key==='url'?'https://exemplo.com':label;inp.maxLength=max;inp.setAttribute('aria-label',`${label} do atalho ${i+1}`);inp.addEventListener('input',()=>{item[key]=inp.value;renderLinks();scheduleSave();});inp.addEventListener('blur',()=>{if(key==='url'&&item.url){const u=normalUrl(item.url);if(u){item.url=u;inp.value=u;renderLinks();scheduleSave();}else toast('Endereço inválido. Use http:// ou https://.');}});if(key==='url'){const actions=node('div','link-actions');if(i>0)actions.append(button('↑',()=>{[settings.links.items[i-1],settings.links.items[i]]=[settings.links.items[i],settings.links.items[i-1]];render();persist();renderPanel();},'icon-button'));const remove=button('×',()=>{settings.links.items.splice(i,1);render();persist();renderPanel();},'icon-button');remove.setAttribute('aria-label','Excluir atalho '+(i+1));actions.append(remove);row.append(actions);}row.append(inp);}sec.append(row);});const add=button('+ Adicionar atalho',()=>{settings.links.items.push({name:'Novo site',url:'',icon:'★'});render();persist();renderPanel();},'secondary-button full');add.disabled=settings.links.items.length>=24;sec.append(add);return sec;}
function syncPositionFields(k){for(const p of ['x','y']){const inp=$('f-'+k+'-'+p);if(inp){inp.value=settings[k][p];const out=inp.closest('.field').querySelector('output');if(out)out.textContent=settings[k][p]+'%';}}}
function positionButtons(k){const grid=node('div','position-grid');const dirs=[['↖',18,18],['↑',50,18],['↗',82,18],['←',18,50],['•',50,50],['→',82,50],['↙',18,82],['↓',50,82],['↘',82,82]];for(const [label,x,y] of dirs){const b=button(label,()=>{settings[k].x=x;settings[k].y=y;renderPosition(k);syncPositionFields(k);scheduleSave();},'');b.title=`Posição ${x}%, ${y}%`;grid.append(b);}return grid;}
const toDataURL=blob=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob);});
async function exportBackup(){try{const assets={};for(const k of ['wallpaper','font']){const a=await readAsset(k);if(a?.blob)assets[k]={name:a.name,data:await toDataURL(a.blob)};}const backup={format:'nova-studio',version:1,settings:clone(settings),assets};const url=URL.createObjectURL(new Blob([JSON.stringify(backup)],{type:'application/json'}));const a=node('a');a.href=url;a.download='nova-studio-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);toast('Backup exportado.');}catch(e){console.warn(e);toast('Falha ao exportar o backup.');}}
function decodeAsset(entry){if(!entry||typeof entry.name!=='string'||typeof entry.data!=='string')throw Error('Arquivo de backup inválido.');const m=entry.data.match(/^data:([^;,]*);base64,([A-Za-z0-9+/=\r\n]+)$/);if(!m)throw Error('Arquivo incorporado inválido.');const raw=atob(m[2]),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return {name:entry.name.slice(0,255),blob:new Blob([bytes],{type:m[1]})};}
async function importBackup(file){if(file.size>85*1024*1024)throw Error('Backup maior que 85 MB.');const raw=JSON.parse(await file.text());if(raw.format!=='nova-studio'||raw.version!==1||!raw.settings)throw Error('Selecione um backup Nova Studio válido.');const next=normalize(raw.settings),assets={};for(const k of ['wallpaper','font'])if(raw.assets?.[k]){assets[k]=decodeAsset(raw.assets[k]);if(!(k==='font'?fontValid(assets[k].blob,assets[k].name):wallpaperValid(assets[k].blob)))throw Error('O backup contém um arquivo não compatível.');}
  if(!confirm('Substituir todas as configurações atuais pelo backup?'))return;
  const db=await openDb();await new Promise((resolve,reject)=>{const t=db.transaction('assets','readwrite'),store=t.objectStore('assets');for(const k of ['wallpaper','font']){if(assets[k])store.put(assets[k],k);else store.delete(k);}t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);});
  if(assets.wallpaper)Object.assign(next.background,{assetName:assets.wallpaper.name,assetKind:assets.wallpaper.blob.type.startsWith('video/')?'video':'image',assetId:newId()});else{next.background.assetId='';next.background.assetName='';next.background.assetKind='';if(next.background.type==='asset')next.background.type='gradient';}next.fontAsset=assets.font?{name:assets.font.name,id:newId()}:{name:'',id:''};settings=next;persist();await Promise.all([refreshAsset('font',true),refreshAsset('wallpaper',true)]);render();renderPanel();toast('Backup restaurado.');}
async function resetAll(){if(!confirm('Restaurar o tema original e apagar os arquivos importados?'))return;try{await Promise.all([deleteAsset('wallpaper'),deleteAsset('font')]);settings=clone(defaults);persist();await Promise.all([refreshAsset('wallpaper',true),refreshAsset('font',true)]);render();renderPanel();toast('Configurações restauradas.');}catch{toast('Não foi possível restaurar as configurações.');}}
function replayMotion(){for(const el of document.querySelectorAll('.widget > :first-child')){el.classList.remove('motion-fade','motion-slide','motion-scale');if(el.parentElement.hidden)continue;void el.offsetWidth;if(settings.layout.motion!=='none'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){el.classList.add('motion-'+settings.layout.motion);el.addEventListener('animationend',()=>{el.classList.remove('motion-fade','motion-slide','motion-scale');maskCache.delete(el.parentElement.dataset.widget);queueGlass();},{once:true});}}}
function renderPanel(){renderTabs();const content=$('panel-content'),oldScroll=content.scrollTop,oldTab=content.dataset.tab;content.replaceChildren();content.dataset.tab=currentTab;const tab=categories[currentTab],intro=node('div','panel-intro');intro.append(node('p','eyebrow','PERSONALIZAÇÃO'),node('h2','panel-title',tab.title),node('p','panel-desc',tab.desc));content.append(intro);
  if(currentTab==='themes'){const g=node('div','preset-grid');for(const [id,t] of Object.entries(themes)){const b=button('',()=>setTheme(id),'preset'),preview=node('div','preset-preview');preview.style.background=gradient(t.a,t.b,t.c);preview.style.color=t.text;preview.append(node('span','','09:41'));b.append(preview,node('span','preset-name',t.name));g.append(b);}content.append(g);const sec=makeSection('Faça do seu jeito',[],'Os temas alteram apenas cores e fundo. Seus textos, posições e atalhos são preservados. Explore as categorias acima para personalizar cada detalhe.');sec.append(button('Personalizar fundo',()=>{currentTab='background';renderPanel();},'secondary-button full'));content.append(sec);}
  if(currentTab==='background')content.append(assetSection('wallpaper'));
  if(currentTab==='links')content.append(linkSection());
  if(currentTab==='backup'){content.append(assetSection('font'));const sec=makeSection('Backup e restauração',[],'Exporte suas configurações, wallpaper e fonte para um arquivo JSON. Importe em outro perfil ou computador.');sec.append(button('Exportar backup completo',exportBackup,'secondary-button full'),node('div','asset-row'),fileChooser('Importar backup','.json,application/json',importBackup));content.append(sec);const reset=makeSection('Restaurar padrão',[],'Isso apaga os ajustes e arquivos importados desta extensão.');reset.append(button('Restaurar todas as configurações',resetAll,'danger-button full'));content.append(reset);}
  tab.sections.forEach((s,i)=>{const sec=makeSection(s.title,s.fields,s.help);if(currentTab==='layout'&&i===0){sec.append(button('Mover em tela cheia',openFullEdit,'secondary-button full'),node('div','asset-row'),button('Visualizar animação',replayMotion,'secondary-button full'),node('p','help','Arraste os elementos e use as linhas-guia para centralizar. Dê dois cliques em um elemento para abrir seus ajustes. Segure Shift para desativar o encaixe durante o arraste.'));}else if(currentTab==='layout'){sec.append(positionButtons(Object.keys(widgetNames)[i-1]));}content.append(sec);});content.scrollTop=oldTab===currentTab?oldScroll:0;
}
// Jump directly to the relevant settings group, rather than just its tab.
const widgetSections={clock:['clock','clock.show'],date:['clock','date.show'],logo:['logo','logo.show'],note:['logo','note.show'],search:['search','search.show'],links:['links','links.show']};
function jumpToWidget(k){
  const target=widgetSections[k];if(!target)return;
  currentTab=target[0];setEditMode('panel');
  document.querySelectorAll('.widget.selected-widget').forEach(el=>el.classList.remove('selected-widget'));
  $(k+'-widget').classList.add('selected-widget');
  scrollToSection(target[1]);
}
function scrollToSection(key){
  const content=$('panel-content');content.querySelectorAll('.section-target').forEach(el=>el.classList.remove('section-target'));
  const sec=[...content.querySelectorAll('[data-section]')].find(el=>el.dataset.section===key);
  if(sec){content.scrollTop=sec.getBoundingClientRect().top-content.getBoundingClientRect().top+content.scrollTop-12;sec.classList.add('section-target');sec.querySelector('h3').focus({preventScroll:true});}
}
function clearGuides(){for(const axis of ['x','y'])$('guide-'+axis).hidden=true;}
function showGuide(axis,hit){const line=$('guide-'+axis);line.hidden=!hit;if(!hit)return;line.style[axis==='x'?'left':'top']=hit.pos+'%';line.dataset.kind=hit.kind;line.querySelector('span').textContent=hit.label;}
function snapAxis(k,axis,pixel,extent){
  const layout=settings.layout,center=extent/2;
  if(layout.snapCenter&&Math.abs(pixel-center)<=layout.snapDistance)return {pixel:center,pos:50,kind:'center',label:axis==='x'?'Centro horizontal':'Centro vertical'};
  if(!layout.snapWidgets)return null;
  let best=null;
  for(const other of Object.keys(widgetNames)){
    if(other===k||!settings[other].show)continue;
    const pos=settings[other][axis],candidate=pos*extent/100,delta=Math.abs(pixel-candidate);
    if(delta<=layout.snapDistance&&(!best||delta<best.delta))best={pixel:candidate,pos,kind:'widget',label:'Alinhado com '+widgetNames[other].toLowerCase(),delta};
  }
  return best;
}
// Coordinates stay relative to the canvas. Snapping uses independent axes,
// prioritizing the canvas center; the Shift key temporarily disables it.
function moveWidget(el,k,cx,cy,{snap=false}={}){
  const r=$('stage').getBoundingClientRect(),w=el.offsetWidth,h=el.offsetHeight;
  if(!r.width||!r.height)return;
  const bounded=(v,size,extent)=>{const margin=Math.min(extent/2,size/2+6);return clamp(v,margin,extent-margin);};
  let x=bounded(cx,w,r.width),y=bounded(cy,h,r.height);
  const sx=snap?snapAxis(k,'x',x,r.width):null,sy=snap?snapAxis(k,'y',y,r.height):null;
  const validX=sx&&Math.abs(bounded(sx.pixel,w,r.width)-sx.pixel)<.01?sx:null;
  const validY=sy&&Math.abs(bounded(sy.pixel,h,r.height)-sy.pixel)<.01?sy:null;
  settings[k].x=validX?validX.pos:Math.round(x/r.width*1000)/10;
  settings[k].y=validY?validY.pos:Math.round(y/r.height*1000)/10;
  showGuide('x',validX);showGuide('y',validY);
  renderPosition(k);syncPositionFields(k);scheduleSave();
}
function dragInit(){
  for(const el of document.querySelectorAll('.widget')){
    const k=el.dataset.widget;let drag=null,lastDrag=0;
    el.addEventListener('pointerdown',e=>{
      if(!editing||e.button!==0||!e.isPrimary||drag)return;
      e.preventDefault();el.focus({preventScroll:true});
      document.querySelectorAll('.widget.selected-widget').forEach(w=>w.classList.remove('selected-widget'));
      el.classList.add('selected-widget');
      const box=el.getBoundingClientRect();
      drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,moved:false,dx:e.clientX-(box.left+box.width/2),dy:e.clientY-(box.top+box.height/2)};
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove',e=>{
      if(!drag||drag.id!==e.pointerId||!editing)return;
      if(!drag.moved&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<4)return;
      if(!drag.moved){drag.moved=true;document.body.classList.add('dragging');el.classList.add('drag-active');}
      const r=$('stage').getBoundingClientRect();
      moveWidget(el,k,e.clientX-r.left-drag.dx,e.clientY-r.top-drag.dy,{snap:!e.shiftKey});
    });
    const end=e=>{
      if(!drag||drag.id!==e.pointerId)return;
      if(drag.moved)lastDrag=performance.now();
      drag=null;document.body.classList.remove('dragging');el.classList.remove('drag-active');clearGuides();
      if(pendingSave)persist();
    };
    el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);el.addEventListener('lostpointercapture',end);
    el.addEventListener('click',e=>{if(editing){e.preventDefault();e.stopPropagation();}},true);
    el.addEventListener('dblclick',e=>{
      if((!editing&&!textWidgets.includes(k))||(lastDrag&&performance.now()-lastDrag<350))return;
      e.preventDefault();e.stopPropagation();jumpToWidget(k);
    });
    el.addEventListener('keydown',e=>{
      const dirs={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
      if(!editing||e.target!==el)return;
      if(e.key==='Enter'){e.preventDefault();jumpToWidget(k);return;}
      if(!Object.hasOwn(dirs,e.key))return;
      e.preventDefault();const r=$('stage').getBoundingClientRect(),[dx,dy]=dirs[e.key],step=e.shiftKey?10:1;
      moveWidget(el,k,settings[k].x*r.width/100+dx*step,settings[k].y*r.height/100+dy*step);
    });
  }
}
$('search-form').addEventListener('submit',e=>{e.preventDefault();if(editing)return;const q=$('search-input').value.trim();if(!q)return;const s=settings.search;let url;if(s.engine==='custom'){if(!s.customEngine.includes('{query}')){toast('Inclua {query} na URL do buscador personalizado.');return;}url=safeUrl(s.customEngine.replaceAll('{query}',encodeURIComponent(q)));}else url=safeUrl(engines[s.engine]+encodeURIComponent(q));if(!url){toast('URL do buscador inválida.');return;}location.assign(url);});
$('open-settings').addEventListener('click',openPanel);$('close-settings').addEventListener('click',closePanel);$('done').addEventListener('click',closePanel);$('full-edit').addEventListener('click',openFullEdit);$('back-settings').addEventListener('click',openPanel);$('full-done').addEventListener('click',closePanel);document.addEventListener('keydown',e=>{if(e.altKey&&e.shiftKey&&e.code==='KeyP'){e.preventDefault();editing?closePanel():openPanel();}else if(e.key==='Escape'&&editing)closePanel();});
window.addEventListener('storage',e=>{if(e.key===KEY){try{settings=normalize(JSON.parse(e.newValue||'null'));render();refreshAsset('wallpaper');refreshAsset('font');if(editing)renderPanel();}catch{}}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)$('background-video').pause();else{tick();applyBackground();}});
$('background-video').addEventListener('error',()=>{if(settings.background.type==='asset'&&assetUrls.wallpaper&&settings.background.assetKind==='video')toast('Vídeo não compatível com este navegador.');});
render();dragInit();const glassResize=new ResizeObserver(queueGlass);for(const k of textWidgets)glassResize.observe($(k+'-text'));document.fonts.addEventListener('loadingdone',()=>{maskCache.clear();queueGlass();});window.addEventListener('resize',queueGlass);setInterval(tick,1000);refreshAsset('wallpaper');refreshAsset('font');replayMotion();
