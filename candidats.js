(function(){
  var NUANCE_COLORS={'Extrême gauche':'#7F1D2D','Gauche radicale':'#C8312B','Gauche':'#E0678A','Centre':'#D99A00','Droite':'#2F6BC4','Extrême droite':'#121B33'};
  var POLL_NAME={arthaud:'Arthaud',melenchon:'Mélenchon',roussel:'Roussel',tondelier:'Tondelier',glucksmann:'Glucksmann',attal:'Attal',philippe:'Philippe',
    lisnard:'Lisnard',retailleau:'Retailleau',dupontaignan:'Dupont-Aignan',lepen:'Le Pen',zemmour:'Zemmour'};
  
  var $=function(id){return document.getElementById(id)};
  var cands, info, polls, gloss=[], byId={}, lastFocus=null, tab='bio';
  var drawer=$('drawer'), overlay=$('overlay');

  function el(tag,cls,text){var e=document.createElement(tag); if(cls)e.className=cls; if(text!=null)e.textContent=text; return e}
  function num(v){return String(v).replace('.',',')}
  function color(c){return NUANCE_COLORS[c.nuance]||'#6B7280'}
  function weekLabel(iso){
    var a=new Date(iso+'T12:00:00'), b=new Date(a.getTime()+6*864e5);
    var l=function(d,o){return d.toLocaleDateString('fr-FR',o)};
    return 'du '+l(a,{day:'numeric',month:'long'})+' au '+l(b,{day:'numeric',month:'long',year:'numeric'});
  }
  function link(href,text){var a=el('a',null,text); a.href=href; a.target='_blank'; a.rel='noopener'; return a}

  /* Sondage actuel : moyenne de la dernière semaine, rang et évolution */
  function pollOf(id){
    var name=POLL_NAME[id]; if(!name||!polls) return null;
    var w=polls.weeks[0], e=w.average[name]; if(!e) return null;
    var ranked=Object.keys(w.average).filter(function(n){return n!=='Candidat RN'}).sort(function(a,b){return w.average[b].value-w.average[a].value});
    var prev=polls.weeks[1]&&polls.weeks[1].average[name];
    return {value:e.value,n:e.n,week:w.week,polls:w.polls,rank:ranked.indexOf(name)+1,total:ranked.length,delta:prev?Math.round((e.value-prev.value)*10)/10:null};
  }

  function chip(c){
    var s=el('span','cd-nuance'); s.style.setProperty('--k',color(c)); s.appendChild(el('i')); s.appendChild(document.createTextNode(c.nuance)); return s;
  }
  function logo(id){var i=el('img','cd-logo'); i.src='logos/'+info[id].logo; i.alt=''; return i}

  function renderGrid(){
    var g=$('cd-grid'); g.innerHTML='';
    cands.forEach(function(c){
      var li=el('li'), b=el('button','cd-card'); b.type='button'; b.style.setProperty('--k',color(c));
      b.setAttribute('aria-label',c.name+', '+c.party+', '+c.nuance);
      var pic=el('span','cd-card-pic'), img=el('img'); img.src='photos/'+c.id+'.jpg'; img.alt=''; pic.appendChild(img); pic.appendChild(logo(c.id));
      b.appendChild(pic);
      var t=el('span','cd-card-txt'); t.appendChild(el('b',null,c.name)); t.appendChild(el('span','cd-card-party',c.party)); t.appendChild(chip(c));
      b.appendChild(t);
      var p=pollOf(c.id), v=el('span','cd-card-poll');
      v.appendChild(el('b',null,p?num(p.value)+' %':'—')); v.appendChild(el('small',null,p?'sondages':'non testé'));
      b.appendChild(v);
      b.addEventListener('click',function(){openDrawer(c,b)});
      li.appendChild(b); g.appendChild(li);
    });
  }

  function renderPoll(c){
    var box=$('d-poll'); box.innerHTML=''; var p=pollOf(c.id);
    box.appendChild(el('h3',null,'Sondages'));
    if(!p){ box.appendChild(el('p','cd-poll-none','Pas testé dans les sondages de la dernière semaine (ou trop peu pour calculer une moyenne).')); return }
    var row=el('div','cd-poll-row');
    row.appendChild(el('b','cd-poll-val',num(p.value)+' %'));
    var meta=el('div','cd-poll-meta');
    meta.appendChild(el('span',null,p.rank+(p.rank===1?'er':'e')+' sur '+p.total+' candidats testés'));
    if(p.delta!=null){
      var d=el('span','cd-delta '+(p.delta>0?'up':p.delta<0?'down':'flat'),(p.delta>0?'▲ +':p.delta<0?'▼ ':'= ')+(p.delta===0?'stable':num(p.delta)+' pt')+' sur la semaine');
      meta.appendChild(d);
    }
    row.appendChild(meta); box.appendChild(row);
    box.appendChild(el('p','cd-poll-src','Moyenne de '+p.polls+' sondage'+(p.polls>1?'s':'')+', semaine '+weekLabel(p.week)+'.'));
  }

  function years(m){return m[1]===null?'depuis '+m[0]:m[0]===m[1]?String(m[0]):m[0]+' – '+m[1]}
  function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
  function termRegex(){
    var all=[]; gloss.forEach(function(g,gi){g.match.forEach(function(m){all.push({gi:gi,m:m,cs:g.cs})})});
    all.sort(function(a,b){return b.m.length-a.m.length});
    return all;
  }
  /* Insère dans le texte des boutons « terme » qui ouvrent une définition ; première occurrence par fiche seulement */
  function fillTerms(node,text,seen){
    var hits=[];
    termRegex().forEach(function(t){
      if(seen[t.gi]) return;
      var re=new RegExp('(^|[^\\p{L}])('+esc(t.m)+')(?![\\p{L}])',t.cs?'u':'iu'), m=re.exec(text);
      if(!m) return;
      var s=m.index+m[1].length, e=s+m[2].length;
      if(hits.some(function(h){return s<h.e&&e>h.s||h.gi===t.gi})) return;
      hits.push({s:s,e:e,gi:t.gi});
    });
    hits.sort(function(a,b){return a.s-b.s});
    var pos=0;
    hits.forEach(function(h){
      seen[h.gi]=true;
      if(h.s>pos) node.appendChild(document.createTextNode(text.slice(pos,h.s)));
      var b=el('button','cd-term',text.slice(h.s,h.e)); b.type='button'; b.setAttribute('aria-expanded','false');
      b.addEventListener('click',function(){toggleTerm(node,b,gloss[h.gi])});
      node.appendChild(b); pos=h.e;
    });
    if(pos<text.length) node.appendChild(document.createTextNode(text.slice(pos)));
  }
  function toggleTerm(para,btn,g){
    var panel=$('panel-bio'), card=para._card, open=btn.getAttribute('aria-expanded')==='true';
    Array.prototype.forEach.call(panel.querySelectorAll('.cd-term'),function(b){b.setAttribute('aria-expanded','false')});
    Array.prototype.forEach.call(panel.querySelectorAll('.cd-term-card'),function(c){c.hidden=true});
    if(open) return;
    btn.setAttribute('aria-expanded','true');
    card.innerHTML=''; card.appendChild(el('b',null,g.label)); card.appendChild(el('span',null,g.def)); card.hidden=false;
  }
  function renderBio(c,i){
    var p=$('panel-bio'); p.innerHTML='';
    var seen={};
    i.bio.forEach(function(t){
      var para=el('p','cd-bio'); fillTerms(para,t,seen); p.appendChild(para);
      var card=el('div','cd-term-card'); card.hidden=true; card.setAttribute('role','note'); p.appendChild(card); para._card=card;
    });
    p.appendChild(el('h3','cd-h','Mandats et fonctions'));
    if(!i.mandats.length) p.appendChild(el('p','cd-none','Aucun mandat électif ni fonction gouvernementale.'));
    else {
      var ml=el('ul','cd-mandats');
      i.mandats.slice().sort(function(a,b){return b[0]-a[0]||(b[1]||9999)-(a[1]||9999)}).forEach(function(m){
        var li=el('li'); li.appendChild(el('b',null,years(m))); li.appendChild(el('span',null,m[2])); ml.appendChild(li);
      });
      p.appendChild(ml);
    }
    var src=el('p','cd-src'); src.appendChild(document.createTextNode('Source : ')); src.appendChild(link(i.source.url,i.source.label+' ↗')); p.appendChild(src);
  }

  function renderPres(c,i){
    var p=$('panel-pres'); p.innerHTML='';
    var own=i.results.some(function(r){return r.who===c.name}) ;
    p.appendChild(el('p','cd-lead',own?'Résultats du candidat au premier tour, avec le second tour pour les finalistes.':'Résultats du premier tour pour le candidat du camp (à défaut du candidat lui-même).'));
    var ul=el('ul','cd-res');
    i.results.slice().sort(function(a,b){return b.year-a.year}).forEach(function(r){
      var li=el('li','cd-res-item'); li.style.setProperty('--k',color(c));
      var head=el('div','cd-res-head'); head.appendChild(el('b',null,String(r.year)));
      var a=link(info.__elections[r.year],'Élection de '+r.year+' ↗'); a.className='cd-res-link'; head.appendChild(a); li.appendChild(head);
      if(r.who){
        li.appendChild(el('p','cd-res-who',r.who+' · '+r.party));
        [['Premier tour',r.t1],['Second tour',r.t2]].forEach(function(t){
          if(t[1]==null) return;
          var bar=el('div','cd-res-bar'), fill=el('span'); fill.style.width=Math.min(100,t[1])+'%'; bar.appendChild(fill);
          bar.setAttribute('role','img'); bar.setAttribute('aria-label',t[0]+' : '+num(t[1].toFixed(2))+' %');
          var line=el('div','cd-res-line'); line.appendChild(el('small','cd-res-round',t[0])); line.appendChild(bar); line.appendChild(el('b',null,num(t[1].toFixed(2))+' %')); li.appendChild(line);
        });
        if(r.note) li.appendChild(el('p','cd-res-note',r.note));
      } else li.appendChild(el('p','cd-res-none',r.note));
      ul.appendChild(li);
    });
    p.appendChild(ul);
    if(i.resultsNote) p.appendChild(el('p','cd-note',i.resultsNote));
  }

  function setTab(t,focus){
    tab=t;
    Array.prototype.forEach.call(drawer.querySelectorAll('[role="tab"]'),function(b){
      var on=b.dataset.tab===t; b.setAttribute('aria-selected',String(on)); b.tabIndex=on?0:-1; if(on&&focus) b.focus();
    });
    $('panel-bio').hidden=t!=='bio'; $('panel-pres').hidden=t!=='pres';
  }
  Array.prototype.forEach.call(drawer.querySelectorAll('[role="tab"]'),function(b){
    b.addEventListener('click',function(){setTab(b.dataset.tab)});
    b.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'||e.key==='Home'||e.key==='End'){e.preventDefault(); setTab(tab==='bio'?'pres':'bio',true)}
    });
  });

  function openDrawer(c,trigger){
    if(trigger) lastFocus=trigger;
    var i=info[c.id];
    drawer.style.setProperty('--k',color(c));
    $('d-photo').src='photos/'+c.id+'.jpg';
    $('d-title').textContent=c.name;
    $('d-born').textContent=i.born?'Né le '+i.born:'';
    $('d-born').hidden=!i.born;
    var pt=$('d-party'); pt.innerHTML=''; pt.appendChild(logo(c.id)); pt.appendChild(el('b',null,c.party)); pt.appendChild(chip(c));
    renderPoll(c); renderBio(c,i); renderPres(c,i); setTab('bio');
    drawer.hidden=false; overlay.hidden=false;
    setTimeout(function(){drawer.classList.add('is-open'); overlay.classList.add('is-open')},20);
    document.body.classList.add('no-scroll');
    $('d-close').focus(); drawer.scrollTop=0;
    try{history.replaceState(null,'','#'+c.id)}catch(e){}
  }
  function closeDrawer(){
    drawer.classList.remove('is-open'); overlay.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    setTimeout(function(){drawer.hidden=true; overlay.hidden=true},200);
    try{history.replaceState(null,'',location.pathname)}catch(e){}
    if(lastFocus&&document.body.contains(lastFocus)) lastFocus.focus();
  }
  $('d-close').addEventListener('click',closeDrawer);
  overlay.addEventListener('click',closeDrawer);
  document.addEventListener('keydown',function(e){
    if(drawer.hidden) return;
    if(e.key==='Escape'){closeDrawer(); return}
    if(e.key==='Tab'){
      var f=drawer.querySelectorAll('button:not([hidden]),a[href]'); f=Array.prototype.filter.call(f,function(n){return n.offsetParent!==null});
      if(!f.length) return;
      var first=f[0], last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault(); last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault(); first.focus()}
    }
  });

  function json(u){return fetch(u).then(function(r){return r.json()})}
  Promise.all([json('data/programmes.json'),json('data/candidats.json'),json('data/sondages.json').catch(function(){return null}),json('data/glossaire.json').catch(function(){return {terms:[]}})]).then(function(r){
    cands=r[0].candidates; info=r[1].candidates; info.__elections=r[1].elections; polls=r[2]; gloss=r[3].terms;
    cands=cands.filter(function(c){return info[c.id]});
    cands.forEach(function(c){byId[c.id]=c});
    renderGrid();
    var id=location.hash.replace(/^#/,'');
    if(byId[id]) openDrawer(byId[id]);
  });
})();
