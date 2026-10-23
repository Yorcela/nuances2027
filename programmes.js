(function(){
  var NUANCE_COLORS={'Extrême gauche':'#7F1D2D','Gauche radicale':'#C8312B','Gauche':'#E0678A','Centre':'#D99A00','Droite':'#2F6BC4','Extrême droite':'#121B33'};
  var PREVIEW=6;
  var THEMES={economie:['coins','#D99A00'],fiscalite:['percent','#7A5AF8'],retraites:['hand-heart','#E4572E'],sante:['heartbeat','#E5484D'],
    education:['graduation-cap','#3B82F6'],immigration:['identification-card','#0E9F9A'],securite:['shield-check','#334155'],ecologie:['leaf','#2F9E5B'],
    logement:['house-line','#B45309'],institutions:['scales','#4F46E5'],europe:['globe-hemisphere-west','#0284C7'],agriculture:['plant','#65A30D'],
    societe:['users-three','#DB2777'],autre:['dots-three-circle','#6B7280']};
  var SUBJECTS={transport:['Transports','car','#0F766E'],public:['Services publics','bank','#475569'],energie:['Technologie & énergie','lightning','#CA8A04']};
  var RE_TRANSPORT=/\b(transports?|trains?|ferroviaires?|fret|covoiturage|autopartage|m[ée]tro|tramway|mobilit[ée]s? douces?|leasing social|v[ée]los?|véloroutes?)\b/i;
  var RE_TRANSPORT_CS=/\b(SNCF|TER)\b/;
  var RE_PUBLIC=/(services? publics?|fonction publique|fonctionnaires|guichets? (physiques?|unique)|La Poste|agents publics)/i;
  var RE_ENERGIE=/(fibre|haut d[ée]bit|intelligence artificielle|\bIA\b|quantique|semi-conducteurs|[ée]nergi|[ée]lectricit|nucl[ée]aire|\bEPR|r[ée]acteurs?|\bEDF\b|\bEngie\b|hydro[ée]lectrique|hydrog[èe]ne|solaires?|photovolta|[ée]oliennes?|renouvelables?|\bgaz\b|carburants?|CSPE|barrages?|thorium|p[ée]trole)/i;
  var RE_NOT=/(dissuasion|secteurs strat[ée]giques|coupures d'eau|euro num[ée]rique)/i;
  function subjectOf(p){
    if(RE_NOT.test(p.text)) return null;
    if(RE_TRANSPORT.test(p.text)||RE_TRANSPORT_CS.test(p.text)) return 'transport';
    if(RE_PUBLIC.test(p.text)) return 'public';
    if(RE_ENERGIE.test(p.text)) return 'energie';
    return null;
  }
  function pbadge(p,big){
    var s=subjectOf(p), b;
    if(s){ b=el('span','tbadge'+(big?' tbadge-lg':'')); b.style.setProperty('--c',SUBJECTS[s][2]); b.style.setProperty('--icon','url(icons/ph-'+SUBJECTS[s][1]+'.svg)'); b.title=SUBJECTS[s][0]+' · '+cats[p.category]; }
    else { b=tbadge(p.category,big); b.title=cats[p.category]; }
    return b;
  }
  function plabel(p){var s=subjectOf(p); return s?SUBJECTS[s][0]+' · '+cats[p.category]:cats[p.category]}
  var STATUS={'publie':'Programme publié','partiel':'Programme partiel','non-publie':'Pas de programme publié','non-trouve':'Aucun programme trouvé','non-collecte':'Non collecté'};
  var $=function(id){return document.getElementById(id)};
  var data, cats={}, byId={};
  var state={cands:{},themes:{},open:{}};
  var lastFocus=null;

  function el(tag,cls,text){var e=document.createElement(tag); if(cls)e.className=cls; if(text!=null)e.textContent=text; return e}
  function plural(n,w){return n+' '+w+(n>1?'s':'')}
  function host(u){try{return new URL(u).hostname.replace(/^www\./,'')}catch(e){return u}}
  function tbadge(id,big){
    var t=THEMES[id]||['squares-four','#6B7280'], b=el('span','tbadge'+(big?' tbadge-lg':''));
    b.style.setProperty('--c',t[1]); b.style.setProperty('--icon','url(icons/ph-'+t[0]+'.svg)');
    return b;
  }
  function color(c){return NUANCE_COLORS[c.nuance]||'#6B7280'}

  function matches(p,c){
    return state.cands[c.id]&&(!hasThemes()||state.themes[p.category]);
  }
  function count(){
    var n=0; data.candidates.forEach(function(c){c.proposals.forEach(function(p){if(matches(p,c))n++})}); return n;
  }

  function hasThemes(){for(var k in state.themes){if(state.themes[k])return true} return false}
  function themeList(){return data.categories.filter(function(k){return state.themes[k.id]})}
  function selected(){return data.candidates.filter(function(c){return state.cands[c.id]})}
  function allSelected(){return selected().length===data.candidates.length}

  function renderFilters(){
    var fc=$('f-cands'); fc.innerHTML='';
    var tli=el('li'), tous=el('button','pf-all',allSelected()?'Aucun':'Tous'); tous.type='button'; tous.setAttribute('aria-pressed',allSelected()?'true':'false');
    tous.addEventListener('click',function(){var on=!allSelected(); data.candidates.forEach(function(c){state.cands[c.id]=on}); update()});
    tli.appendChild(tous); fc.appendChild(tli);
    data.candidates.forEach(function(c){
      var n=c.proposals.filter(function(p){return !hasThemes()||state.themes[p.category]}).length;
      var li=el('li'), b=el('button','pf-cand'); b.type='button';
      b.setAttribute('aria-pressed',state.cands[c.id]?'true':'false');
      b.title=c.name+' ('+c.party+') · '+plural(n,'proposition'); b.setAttribute('aria-label',b.title);
      b.style.setProperty('--k',color(c));
      var img=el('img'); img.src='photos/'+c.id+'.jpg'; img.alt=''; b.appendChild(img);
      b.appendChild(el('span','pf-n',String(n)));
      if(!n) b.classList.add('is-empty');
      b.addEventListener('click',function(){
        state.cands[c.id]=!state.cands[c.id];
        update();
      });
      li.appendChild(b); fc.appendChild(li);
    });
    renderCombo();
    $('pf-count').textContent=plural(count(),'proposition')+(hasThemes()||!allSelected()?' correspondant aux filtres':'');
  }


  /* Combobox personnalisée : sélection multiple des thèmes */
  var combo={open:false,active:0,built:false,opts:[]};
  function themeCount(id){
    var n=0; selected().forEach(function(c){c.proposals.forEach(function(p){if(p.category===id)n++})}); return n;
  }
  function renderCombo(){
    var root=$('f-combo');
    if(!combo.built){
      root.innerHTML='';
      var btn=el('button','pf-combo-btn'); btn.type='button'; btn.id='f-combo-btn';
      btn.setAttribute('role','combobox'); btn.setAttribute('aria-haspopup','listbox'); btn.setAttribute('aria-expanded','false'); btn.setAttribute('aria-controls','f-combo-list'); btn.setAttribute('aria-labelledby','l-theme f-combo-btn');
      var pop=el('div','pf-combo-pop'); pop.hidden=true;
      var list=el('ul','pf-combo-list'); list.id='f-combo-list'; list.setAttribute('role','listbox'); list.setAttribute('aria-multiselectable','true'); list.setAttribute('aria-labelledby','l-theme'); list.tabIndex=-1;
      var foot=el('div','pf-combo-foot');
      var clear=el('button','pf-combo-clear','Effacer la sélection'); clear.type='button';
      clear.addEventListener('click',function(){state.themes={}; update(); btn.focus()});
      foot.appendChild(clear); pop.appendChild(list); pop.appendChild(foot);
      root.appendChild(btn); root.appendChild(pop);
      btn.addEventListener('click',function(){combo.open?closeCombo(true):openCombo()});
      btn.addEventListener('keydown',function(e){
        if(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='Enter'||e.key===' '){e.preventDefault(); if(!combo.open) openCombo()}
      });
      list.addEventListener('keydown',function(e){
        var n=combo.opts.length;
        if(e.key==='ArrowDown'){e.preventDefault(); setActive(Math.min(n-1,combo.active+1))}
        else if(e.key==='ArrowUp'){e.preventDefault(); setActive(Math.max(0,combo.active-1))}
        else if(e.key==='Home'){e.preventDefault(); setActive(0)}
        else if(e.key==='End'){e.preventDefault(); setActive(n-1)}
        else if(e.key===' '||e.key==='Enter'){e.preventDefault(); toggleTheme(combo.opts[combo.active])}
        else if(e.key==='Escape'||e.key==='Tab'){if(e.key==='Escape')e.preventDefault(); closeCombo(e.key==='Escape')}
      });
      document.addEventListener('mousedown',function(e){if(combo.open&&!root.contains(e.target)) closeCombo(false)});
      combo.built=true;
    }
    var btn=$('f-combo-btn'); btn.innerHTML='';
    var sel=themeList();
    var badges=el('span','pf-combo-badges');
    if(!sel.length){ badges.appendChild(tbadge('tous')) }
    else sel.slice(0,4).forEach(function(k){badges.appendChild(tbadge(k.id))});
    btn.appendChild(badges);
    btn.appendChild(el('span','pf-combo-text',!sel.length?'Tous les thèmes':(sel.length===1?sel[0].label:sel.length+' thèmes sélectionnés')));
    btn.appendChild(el('span','pf-combo-chev'));
    var list=$('f-combo-list'); list.innerHTML=''; combo.opts=[];
    data.categories.forEach(function(k){
      var n=themeCount(k.id), on=!!state.themes[k.id];
      var li=el('li','pf-combo-opt'); li.id='f-opt-'+k.id; li.setAttribute('role','option'); li.setAttribute('aria-selected',on?'true':'false');
      if(!n&&!on) li.setAttribute('aria-disabled','true');
      li.appendChild(el('span','pf-check'));
      li.appendChild(tbadge(k.id)); li.appendChild(el('span','pf-opt-label',k.label)); li.appendChild(el('span','pf-opt-n',String(n)));
      li.addEventListener('click',function(){toggleTheme(k.id)});
      li.addEventListener('mousemove',function(){var i=combo.opts.indexOf(k.id); if(i!==combo.active) setActive(i,true)});
      list.appendChild(li); combo.opts.push(k.id);
    });
    setActive(Math.min(combo.active,combo.opts.length-1),true);
  }
  function setActive(i,silent){
    combo.active=i;
    var list=$('f-combo-list');
    Array.prototype.forEach.call(list.children,function(li,j){li.classList.toggle('is-active',j===i)});
    var cur=list.children[i];
    if(cur){list.setAttribute('aria-activedescendant',cur.id); if(!silent) cur.scrollIntoView({block:'nearest'})}
  }
  function toggleTheme(id){
    var li=$('f-opt-'+id);
    if(li&&li.getAttribute('aria-disabled')==='true') return;
    state.themes[id]=!state.themes[id];
    var keep=combo.active; update(); setActive(keep,true);
    if(combo.open) $('f-combo-list').focus();
  }
  function openCombo(){
    combo.open=true; $('f-combo-btn').setAttribute('aria-expanded','true');
    document.querySelector('.pf-combo-pop').hidden=false;
    var first=combo.opts.findIndex(function(id){return state.themes[id]}); setActive(first>-1?first:0);
    $('f-combo-list').focus();
  }
  function closeCombo(focusBtn){
    combo.open=false; $('f-combo-btn').setAttribute('aria-expanded','false');
    document.querySelector('.pf-combo-pop').hidden=true;
    if(focusBtn) $('f-combo-btn').focus();
  }

  function card(c,p){
    var b=el('button','pcard'); b.type='button'; b.style.setProperty('--k',color(c));
    var top=el('span','pcard-top'); top.appendChild(pbadge(p)); top.appendChild(el('span','sr',plabel(p)));
    if(p.kind==='orientation') top.appendChild(el('span','pcard-flag','Orientation'));
    else if(p.edition) top.appendChild(el('span','pcard-flag','Édition '+p.edition));
    b.appendChild(top); b.appendChild(el('span','pcard-text',p.text));
    b.addEventListener('click',function(){openDrawer(c,p,b)});
    return b;
  }

  function renderParties(){
    var root=$('parties'); root.innerHTML='';
    data.candidates.forEach(function(c){
      if(!state.cands[c.id]) return;
      var list=c.proposals.filter(function(p){return matches(p,c)});
      var sec=el('section','prog-party'); sec.style.setProperty('--k',color(c));
      var head=el('header','party-head');
      var img=el('img','party-photo'); img.src='photos/'+c.id+'.jpg'; img.alt=''; head.appendChild(img);
      var who=el('div','party-who');
      who.appendChild(el('h2',null,c.party));
      who.appendChild(el('p','party-sub',c.name+' · '+c.nuance));
      head.appendChild(who);
      var meta=el('div','party-meta');
      meta.appendChild(el('span','party-status is-'+c.status,STATUS[c.status]||c.status));
      meta.appendChild(el('span','party-n',plural(c.proposals.length,'proposition')));
      head.appendChild(meta); sec.appendChild(head);
      if(c.status!=='publie'||!c.proposals.length) sec.appendChild(el('p','party-note',c.statusNote));
      if(hasThemes()&&!list.length&&c.proposals.length) sec.appendChild(el('p','party-note','Aucune proposition sur ce thème dans les pages analysées.'));
      if(list.length){
        var expanded=hasThemes()||selected().length===1||state.open[c.id];
        var limit=expanded?list.length:PREVIEW;
        var grid=el('div','pgrid');
        list.slice(0,limit).forEach(function(p){grid.appendChild(card(c,p))});
        sec.appendChild(grid);
        if(list.length>limit){
          var more=el('button','party-more','Voir les '+list.length+' propositions'); more.type='button';
          more.addEventListener('click',function(){state.open[c.id]=true; renderParties()});
          sec.appendChild(more);
        } else if(state.open[c.id]&&list.length>PREVIEW&&!hasThemes()&&selected().length>1){
          var less=el('button','party-more','Réduire'); less.type='button';
          less.addEventListener('click',function(){state.open[c.id]=false; renderParties()});
          sec.appendChild(less);
        }
      }
      root.appendChild(sec);
    });
    if(!root.children.length) root.appendChild(el('p','party-note',selected().length?'Aucune proposition ne correspond aux filtres.':'Aucun candidat sélectionné.'));
  }

  function update(){
    var h=[]; if(!allSelected()) h.push('candidats='+(selected().length?selected().map(function(c){return c.id}).join(','):'none')); if(hasThemes()) h.push('themes='+themeList().map(function(k){return k.id}).join(','));
    try{history.replaceState(null,'',h.length?'#'+h.join('&'):location.pathname)}catch(e){}
    renderFilters(); renderParties();
  }

  /* Drawer */
  var drawer=$('drawer'), overlay=$('overlay');
  function resolve(ref){var a=ref.split(':'), c=byId[a[0]], p=c&&c.proposals[+a[1]]; return p?{c:c,p:p}:null}
  function amounts(t){
    var m=t.match(/\d[\d\u00a0\u202f ,.]*\s?(?:milliards?|millions?)(?:\s+d['’]euros?)?/gi);
    return m?m.map(function(s){return s.trim()}):[];
  }
  function openDrawer(c,p,trigger){
    if(trigger) lastFocus=trigger;
    drawer.style.setProperty('--k',color(c));
    var dt=$('d-theme'); dt.innerHTML=''; dt.appendChild(pbadge(p,true)); dt.appendChild(el('span',null,plabel(p)));
    $('d-title').textContent=p.text;
    var badges=$('d-badges'); badges.innerHTML='';
    if(p.kind==='orientation') badges.appendChild(el('span','badge','Orientation générale'));
    if(p.edition) badges.appendChild(el('span','badge badge-warn','Programme de l’édition '+p.edition));
    var who=$('d-who'); who.innerHTML='';
    var img=el('img'); img.src='photos/'+c.id+'.jpg'; img.alt=''; who.appendChild(img);
    var t=el('div'); t.appendChild(el('b',null,c.name)); t.appendChild(el('span',null,c.party+' · '+c.nuance)); who.appendChild(t);
    var a=$('d-source'); a.href=p.source; a.textContent='Voir la page officielle · '+host(p.source)+' ↗';
    var note=$('d-note');
    if(c.status!=='publie'){note.textContent=c.statusNote; note.hidden=false} else note.hidden=true;
    var am=$('d-amount'), mt=amounts(p.text);
    am.hidden=!mt.length; if(mt.length) am.textContent='Montant annoncé : '+mt.join(' · ');
    var cs=$('d-cost'); cs.hidden=!p.cost;
    if(p.cost){
      $('dc-amount').textContent=p.cost.amount;
      var lv=$('dc-level'); lv.textContent=p.cost.level?'Réalisme : '+p.cost.level:''; lv.hidden=!p.cost.level; lv.dataset.l=p.cost.level||'';
      $('dc-text').textContent=p.cost.real;
      var sl=$('dc-src'); sl.innerHTML;
      sl.innerHTML=''; p.cost.src.forEach(function(s){var li=el('li'), a2=el('a',null,s.label+' ↗'); a2.href=s.url; a2.target='_blank'; a2.rel='noopener'; li.appendChild(a2); sl.appendChild(li)});
    }
    var links=$('d-links'); links.hidden=true;
    [['sim','d-sim'],['opp','d-opp']].forEach(function(k){
      var box=$(k[1]), tg=(p[k[0]]||[]).map(resolve).filter(Boolean);
      box.hidden=!tg.length; if(!tg.length) return;
      links.hidden=false;
      var l=box.querySelector('.dl-list'); l.innerHTML='';
      tg.forEach(function(tgt){
        var b=el('button','dl-btn'); b.type='button';
        var im=el('img'); im.src='photos/'+tgt.c.id+'.jpg'; im.alt=''; b.appendChild(im);
        b.title=tgt.c.name+' · '+tgt.p.text; b.setAttribute('aria-label',tgt.c.name+' : '+tgt.p.text);
        b.style.setProperty('--k',color(tgt.c));
        b.addEventListener('click',function(){openDrawer(tgt.c,tgt.p)});
        l.appendChild(b);
      });
    });
    var others=c.proposals.filter(function(q){return q.category===p.category&&q!==p});
    var more=$('d-more'), list=$('d-more-list'); list.innerHTML='';
    more.hidden=!others.length;
    others.slice(0,3).forEach(function(q){
      var li=el('li'), b=el('button',null,q.text); b.type='button';
      b.addEventListener('click',function(){openDrawer(c,q)});
      li.appendChild(b); list.appendChild(li);
    });
    drawer.hidden=false; overlay.hidden=false;
    setTimeout(function(){drawer.classList.add('is-open'); overlay.classList.add('is-open')},20);
    document.body.classList.add('no-scroll');
    $('d-close').focus(); drawer.scrollTop=0;
  }
  function closeDrawer(){
    drawer.classList.remove('is-open'); overlay.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    setTimeout(function(){drawer.hidden=true; overlay.hidden=true},200);
    if(lastFocus&&document.body.contains(lastFocus)) lastFocus.focus();
  }
  $('d-close').addEventListener('click',closeDrawer);
  overlay.addEventListener('click',closeDrawer);
  document.addEventListener('keydown',function(e){
    if(drawer.hidden) return;
    if(e.key==='Escape'){closeDrawer(); return}
    if(e.key==='Tab'){
      var f=drawer.querySelectorAll('button,a[href]'); if(!f.length) return;
      var first=f[0], last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault(); last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault(); first.focus()}
    }
  });

  fetch('data/programmes.json').then(function(r){return r.json()}).then(function(d){
    data=d;
    d.categories.forEach(function(k){cats[k.id]=k.label});
    d.candidates.forEach(function(c){byId[c.id]=c});
    d.candidates.forEach(function(c){state.cands[c.id]=true});
    location.hash.replace(/^#/,'').split('&').forEach(function(kv){
      var p=kv.split('=');
      if(p[0]==='candidats'||p[0]==='candidat'){
        if(p[1]==='none'){d.candidates.forEach(function(c){state.cands[c.id]=false})}
        var ids=p[1].split(',').filter(function(id){return byId[id]});
        if(ids.length){d.candidates.forEach(function(c){state.cands[c.id]=ids.indexOf(c.id)>-1})}
      }
      if(p[0]==='theme'||p[0]==='themes') p[1].split(',').forEach(function(id){if(cats[id]) state.themes[id]=true});
    });
    update();
  }).catch(function(){
    $('parties').appendChild(el('p','party-note','Les programmes ne sont pas disponibles pour le moment.'));
  });
})();
