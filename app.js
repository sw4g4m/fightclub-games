(() => {
 'use strict';
 const games=window.FIGHTCLUB_GAMES||[];
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const byId=new Map(games.map(g=>[g.id,g]));
 const storageKey='fightclub-accounts-v1';
 const serviceNames={help:'ساعدني أختار',primary:'بريماري',secondary:'سكندري',offline:'أوفلاين'};
 const serviceDescriptions={help:'هنرشحلك النظام المناسب حسب استخدامك للنت وطريقة لعبك.',primary:'بعد التفعيل، الألعاب الداعمة للأوفلاين تعمل بوجود الإنترنت أو بدونه. وتقدر تزود وتحدّث ألعاب.',secondary:'إنترنت شغال مطلوب للتحقق من الترخيص وقت اللعب، وتقدر تضيف ألعاب وتعمل تحديثات.',offline:'الجهاز يفضل بدون إنترنت. حسب نظام خدمة المكتب، توصيله بالنت يقفل الألعاب عندك وعند المكتب؛ راجعنا قبل أي إضافة أو تحديث.'};
 const categories=[['all','كل الألعاب'],['football','كورة'],['action','أكشن ومغامرات'],['openworld','عالم مفتوح'],['racing','سباق'],['fighting','قتال ومصارعة'],['family','عائلي'],['coop','نلعب سوا'],['shooter','تصويب'],['horror','رعب'],['vr','VR']];
 const categoryNames=Object.fromEntries([...categories,['sports','رياضة']]);
 let stored={};try{stored=JSON.parse(localStorage.getItem(storageKey)||'{}')||{};}catch{}
 let device=stored.device==='ps5'?'ps5':'ps4';
 let selected=new Set((Array.isArray(stored.selected)?stored.selected:[]).filter(id=>byId.has(id)&&byId.get(id).devices.includes(device)));
 let service=Object.hasOwn(serviceNames,stored.service)?stored.service:'help';
 let category='all', query='',sort='poster',onlySelected=false,onlyPs5=false, activeDetails=null,toastTimer;
 const icon=(name,cl='')=>`<svg class="${cl}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const normalize=s=>String(s).toLowerCase().normalize('NFKD').replace(/[\u064B-\u065F\u0670\u0300-\u036f]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 function persist(){try{localStorage.setItem(storageKey,JSON.stringify({device,selected:[...selected],service}));}catch{}}
 function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2600);}
 function openDialog(id){const dialog=$('#'+id);if(!dialog.open)dialog.showModal();}
 function closeDialog(id){$('#'+id).close();}
 function selectedGames(){return [...selected].map(id=>byId.get(id)).filter(Boolean).sort((a,b)=>a.number-b.number);}
 function deviceLabel(){return device==='ps4'?'PlayStation 4':'PlayStation 5';}
 function titleFor(g){return g.titlesByDevice?.[device]||g.title;}
 function editionFor(g){return g.editionsByDevice?.[device]||g.edition;}
 function renderCategories(){
  $('#categories').innerHTML=categories.map(([id,label])=>`<button class="category-chip ${category===id?'active':''}" data-category="${id}" aria-pressed="${category===id}">${label}</button>`).join('');
 }
 function visibleGames(){
  const words=normalize(query).split(/\s+/).filter(Boolean);
  return games.filter(g=>g.devices.includes(device)&&(!onlyPs5||editionFor(g)==='ps5')&&(!onlySelected||selected.has(g.id))&&(category==='all'||(category==='vr'?g.vr:g.tags.includes(category)))&&words.every(word=>normalize(titleFor(g)+' '+g.aliases+' '+String(g.number)).includes(word))).sort((a,b)=>sort==='name'?titleFor(a).localeCompare(titleFor(b),'en'):sort==='selected'?(Number(selected.has(b.id))-Number(selected.has(a.id))||a.number-b.number):a.number-b.number);
 }
 function renderCards(){
  const visible=visibleGames();$('#resultCount').textContent=visible.length;
  $('#resultLabel').textContent=onlySelected?'لعبة من اختياراتك':'لعبة متاحة';
  $('#gamesGrid').innerHTML=visible.map(g=>{
   const checked=selected.has(g.id),label=checked?'تم الاختيار':'اختارها';
   return `<article class="game-card ${checked?'selected':''}" data-game="${g.id}"><div class="cover-area"><button data-toggle="${g.id}" aria-pressed="${checked}" aria-label="${checked?'إزالة':'إضافة'} ${esc(titleFor(g))} من الاختيارات"><img src="${g.cover}" alt="غلاف ${esc(titleFor(g))} الأصلي" loading="lazy" decoding="async" width="160" height="216"></button><span class="cover-overlay"></span><span class="selection-check">${icon('plus','plus')}${icon('check','check')}</span>${g.vr?'<span class="vr-tag">PS VR</span>':''}</div><div class="game-meta"><div class="game-edition"><span>${editionFor(g).toUpperCase()}${device==='ps5'&&editionFor(g)==='ps4'?' · Compatible':''}</span><span class="game-number">#${String(g.number).padStart(2,'0')}</span></div><h3>${esc(titleFor(g))}</h3><div class="card-actions"><button class="choose-button" data-toggle="${g.id}" aria-pressed="${checked}" aria-label="${checked?'إزالة':'اختيار'} ${esc(titleFor(g))}">${icon(checked?'check':'plus')}<span>${label}</span></button><button class="info-button" data-info="${g.id}" aria-label="تفاصيل ${esc(titleFor(g))}">${icon('info')}</button></div></div></article>`;
  }).join('');
  $('#emptyState').hidden=visible.length>0;
  $('#emptyTitle').textContent=onlySelected&&selected.size===0?'لسه ما اخترتش ألعاب':'ملقيناش ألعاب بالشروط دي';
  $('#emptyText').textContent=onlySelected&&selected.size===0?'ارجع لكل الألعاب وعلّم على اللي تحبه.':'جرّب اسم تاني أو شيل التصنيف.';
 }
 function renderDock(){
  const count=selected.size;$('#dockCount').textContent=count;
  $('#dockTitle').textContent=count?`${count} لعبة في اختياراتك`:'اختياراتك مستنياك';
  $('#dockSubtitle').textContent=count?`${deviceLabel()} · جاهزين للمراجعة`:'علّم على الألعاب اللي تحبها';
  $('#reviewOpen').disabled=count===0;
 }
 function renderAll(){
  $$('.device').forEach(b=>{const active=b.dataset.device===device;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  $('#ps4Count').textContent=games.filter(g=>g.devices.includes('ps4')).length+' لعبة';
  $('#ps5Count').textContent=games.filter(g=>g.devices.includes('ps5')).length+' لعبة';
  $('#compatNote').textContent=device==='ps5'?'بتشوف إصدارات PS5 وألعاب PS4 المتوافقة. شارة كل لعبة بتوضح إصدارها؛ ألعاب VR تحتاج تجهيزات خاصة.':'بتشوف الألعاب المتاحة هنا بإصدار PS4. لو جهازك فايف اختار PS5 علشان تشوف كل اختياراته.';
  $('#ps5Only').hidden=device!=='ps5';$('#ps5Only').setAttribute('aria-pressed',String(onlyPs5));
  $('#selectedOnly').setAttribute('aria-pressed',String(onlySelected));
  renderCategories();renderCards();renderDock();
 }
 function setDevice(value){device=value;onlyPs5=false;selected=new Set([...selected].filter(id=>byId.get(id).devices.includes(device)));persist();renderAll();}
 function toggleGame(id){
  const g=byId.get(id);if(!g||!g.devices.includes(device))return;
  const added=!selected.has(id);if(added)selected.add(id);else selected.delete(id);
  persist();renderCards();renderDock();
  if($('#reviewDialog').open)renderReview();
  if(activeDetails===id&&$('#gameDialog').open)renderDetails(id);
  toast(added?'اتضافت لاختياراتك':'اتشالت من اختياراتك');
 }
 function renderDetails(id){
  const g=byId.get(id);if(!g)return;activeDetails=id;
  const editionText=editionFor(g)==='ps5'?'نسخة PS5 المتاحة في الكتالوج. تحتاج جهاز PS5.':device==='ps5'?'نسخة PS4 تعمل بالتوافق المسبق على PS5. ليست ترقية تلقائية لنسخة PS5.':'نسخة PS4 المتاحة في الكتالوج.';
  $('#gameDetails').innerHTML=`<div class="game-details-inner"><img class="detail-cover" src="${g.cover}" alt="غلاف ${esc(titleFor(g))} الأصلي"><div class="detail-copy"><span class="eyebrow">${editionFor(g).toUpperCase()} · #${String(g.number).padStart(2,'0')}</span><h2 id="gameTitle">${esc(titleFor(g))}</h2><div class="detail-tags">${g.tags.map(tag=>`<span>${categoryNames[tag]||tag}</span>`).join('')}${g.vr?'<span>تحتاج PS VR</span>':''}</div><p>${editionText}</p>${g.note?`<p>${esc(g.note)}</p>`:''}<button class="button ${selected.has(id)?'secondary':'primary'}" data-toggle="${id}">${icon(selected.has(id)?'check':'plus')}${selected.has(id)?'إزالة من اختياراتي':'ضيفها لاختياراتي'}</button></div></div>`;
 }
 function renderService(){
  const input=$(`input[name=service][value="${service}"]`);if(input)input.checked=true;
  $('#serviceSummary').textContent=serviceDescriptions[service];
  $('#offlineAckLabel').hidden=service!=='offline';$('#offlineAck').required=service==='offline';
 }
 function renderReview(){
  const list=selectedGames();$('#reviewCount').textContent=list.length+' لعبة';$('#reviewDevice').textContent=deviceLabel();
  $('#reviewItems').innerHTML=list.length?list.map(g=>`<div class="review-item"><img src="${g.cover}" alt="" width="45" height="60"><div><strong>${esc(titleFor(g))}</strong><small>${editionFor(g).toUpperCase()} · رقم ${g.number}${g.vr?' · تحتاج PS VR':''}</small></div><button class="remove-item" data-remove="${g.id}" aria-label="إزالة ${esc(titleFor(g))}">${icon('close')}</button></div>`).join(''):'<p class="order-note">قائمتك فاضية. اقفل المراجعة واختار الألعاب اللي تحبها.</p>';
  $('#reviewVr').hidden=!list.some(g=>g.vr);$('#sendWhatsApp').disabled=list.length===0;$('#copyOrder').disabled=list.length===0;renderService();
 }
 function orderText(){
  const name=$('#customerName').value.trim(),notes=$('#customerNotes').value.trim();
  const list=selectedGames();
  return ['أهلًا Fight Club PS Store 🎮','عايز أستفسر عن تحميل ألعاب الحسابات:',name?'الاسم: '+name:null,'الجهاز: '+deviceLabel(),'نظام التحميل: '+serviceNames[service],`عدد الألعاب: ${list.length}`,'',...list.map((g,i)=>`${i+1}. ${titleFor(g)} [${editionFor(g).toUpperCase()}] — رقم ${g.number}`),list.some(g=>g.vr)?'ملاحظة: القائمة فيها ألعاب PS VR؛ محتاج تأكيد التجهيزات.':null,service==='offline'?'فاهم شروط الأوفلاين وهراجع المكتب قبل توصيل الجهاز بالنت.':null,notes?'\nملاحظاتي: '+notes:null,'','ممكن تأكيد التوفر والأسعار والتفاصيل؟'].filter(line=>line!==null).join('\n');
 }
 function validOrder(){if(!selected.size)return false;if(service==='offline'&&!$('#offlineAck').checked){$('#offlineAck').reportValidity();return false;}return true;}
 $$('.device').forEach(button=>button.addEventListener('click',()=>{const next=button.dataset.device;if(next===device)return;if(next==='ps4'&&[...selected].some(id=>!byId.get(id).devices.includes('ps4')))openDialog('switchDialog');else setDevice(next);}));
 $('#confirmSwitch').addEventListener('click',()=>{setDevice('ps4');closeDialog('switchDialog');toast('اتحولت للفور، واتشالت اختيارات إصدار PS5');});
 $('#categories').addEventListener('click',e=>{const button=e.target.closest('[data-category]');if(button){category=button.dataset.category;renderAll();}});
 document.addEventListener('click',e=>{
  const toggle=e.target.closest('[data-toggle]');if(toggle){toggleGame(toggle.dataset.toggle);return;}
  const info=e.target.closest('[data-info]');if(info){renderDetails(info.dataset.info);openDialog('gameDialog');return;}
  const close=e.target.closest('[data-close]');if(close)closeDialog(close.dataset.close);
  const remove=e.target.closest('[data-remove]');if(remove)toggleGame(remove.dataset.remove);
 });
 $$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target!==d)return;const rect=d.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)d.close();}));
 $('#search').addEventListener('input',e=>{query=e.target.value;renderCards();});
 $('#sort').addEventListener('change',e=>{sort=e.target.value;renderCards();});
 $('#selectedOnly').addEventListener('click',()=>{onlySelected=!onlySelected;renderAll();});
 $('#ps5Only').addEventListener('click',()=>{onlyPs5=!onlyPs5;renderAll();});
 $('#clearFilters').addEventListener('click',()=>{query='';category='all';onlySelected=false;onlyPs5=false;$('#search').value='';renderAll();});
 $('#reviewOpen').addEventListener('click',()=>{renderReview();openDialog('reviewDialog');});
 $('#clearSelection').addEventListener('click',()=>openDialog('clearDialog'));
 $('#confirmClear').addEventListener('click',()=>{selected.clear();persist();renderAll();renderReview();closeDialog('clearDialog');toast('اتمسحت الاختيارات');});
 $$('input[name=service]').forEach(r=>r.addEventListener('change',()=>{service=r.value;$('#offlineAck').checked=false;persist();renderService();}));
 $('#orderForm').addEventListener('submit',e=>{e.preventDefault();if(!validOrder())return;const url='https://wa.me/201015505669?text='+encodeURIComponent(orderText());const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';document.body.append(a);a.click();a.remove();});
 $('#copyOrder').addEventListener('click',async()=>{if(!validOrder())return;const text=orderText();try{await navigator.clipboard.writeText(text);toast('اتنسخت القائمة؛ ابعتها لنا على واتساب');}catch{const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.top='0';document.body.append(ta);ta.select();const ok=document.execCommand('copy');ta.remove();toast(ok?'اتنسخت القائمة':'تعذر النسخ؛ استخدم زر واتساب');}});
 document.addEventListener('keydown',e=>{if(e.key==='/'&&!$('#gameDialog').open&&!$('#reviewDialog').open&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();$('#search').focus();}});
 renderAll();persist();
})();
