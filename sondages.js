(function(){
  var PARTY_COLORS={LO:'#7F1D2D',NPA:'#7F1D2D',RP:'#7F1D2D',LFI:'#7F1D2D',PCF:'#C8312B',
    PS:'#F08AA6',PP:'#F08AA6',LE:'#F08AA6',GEN:'#F08AA6',
    RE:'#F2B632',HOR:'#F2B632',MoDem:'#F2B632',UDI:'#F2B632',
    LR:'#2F6BC4',NE:'#2F6BC4',DLF:'#2F6BC4',UDR:'#1F3F8F',RN:'#121B33',REC:'#121B33'};
  var LINE_COLORS={'Le Pen':'#121B33','Zemmour':'#6B7280','Mélenchon':'#7F1D2D','Arthaud':'#B45F6F','Roussel':'#C8312B',
    'Glucksmann':'#E86A8D','Tondelier':'#3A9D5D','Philippe':'#D99A00','Attal':'#F2B632','Retailleau':'#2F6BC4',
    'Lisnard':'#7FA3E0','Dupont-Aignan':'#1F3F8F'};
  var FULL={'Mélenchon':'Jean-Luc Mélenchon','Le Pen':'Marine Le Pen','Philippe':'Édouard Philippe','Glucksmann':'Raphaël Glucksmann',
    'Lisnard':'David Lisnard','Retailleau':'Bruno Retailleau','Attal':'Gabriel Attal','Zemmour':'Éric Zemmour','Roussel':'Fabien Roussel',
    'Tondelier':'Marine Tondelier','Dupont-Aignan':'Nicolas Dupont-Aignan','Arthaud':'Nathalie Arthaud'};
  var PHOTO={'Mélenchon':'melenchon','Le Pen':'lepen','Philippe':'philippe','Glucksmann':'glucksmann','Lisnard':'lisnard',
    'Retailleau':'retailleau','Attal':'attal','Zemmour':'zemmour','Roussel':'roussel','Tondelier':'tondelier',
    'Dupont-Aignan':'dupontaignan','Arthaud':'arthaud'};
  var GROUPS=[
    {name:'Gauche',color:'#C8312B',parties:['LO','NPA','RP','LFI','PCF','PS','PP','LE','GEN']},
    {name:'Centre',color:'#F2B632',parties:['RE','HOR','MoDem','UDI']},
    {name:'Droite',color:'#2F6BC4',parties:['LR','NE','DLF','UDR','RN','REC']}
  ];
  var THRESHOLD=5;

  var $=function(id){return document.getElementById(id)};
  var select=$('polls-week'), sub=$('polls-sub'), meta=$('polls-meta'), bars=$('bars'), runoff=$('runoff');
  var chart=$('chart'), chips=$('chips'), stack=$('stack'), groupsEl=$('groups');
  var tabs=Array.prototype.slice.call(document.querySelectorAll('.tabs [role="tab"]'));
  var data, current=0, tab='sondages', visible={};

  function el(tag,cls,text){var e=document.createElement(tag); if(cls)e.className=cls; if(text!=null)e.textContent=text; return e}
  function svg(tag,attrs){var e=document.createElementNS('http://www.w3.org/2000/svg',tag); for(var k in attrs)e.setAttribute(k,attrs[k]); return e}
  function num(v){return String(v).replace('.',',')}
  function plural(n,w){return n+' '+w+(n>1?'s':'')}
  function day(iso,o){return new Date(iso+'T12:00:00').toLocaleDateString('fr-FR',o)}
  function weekLabel(iso){
    var a=new Date(iso+'T12:00:00'), b=new Date(a.getTime()+6*864e5);
    var l=function(d,o){return d.toLocaleDateString('fr-FR',o)};
    return a.getMonth()===b.getMonth()
      ? l(a,{day:'numeric'})+' au '+l(b,{day:'numeric',month:'long',year:'numeric'})
      : l(a,{day:'numeric',month:'long'})+' au '+l(b,{day:'numeric',month:'long',year:'numeric'});
  }
  function sorted(week){
    return Object.keys(week.average).map(function(n){return [n,week.average[n]]})
      .filter(function(e){return PHOTO[e[0]]})
      .sort(function(x,y){return y[1].value-x[1].value});
  }

  function barRow(e,max){
    var li=el('li','bar-row'); li.style.setProperty('--k',PARTY_COLORS[e[1].party]||'#9CA3AF');
    var full=FULL[e[0]]||e[0];
    var photo=el('span','bar-photo'); photo.title=full+(e[1].party?' ('+e[1].party+')':'');
    var img=el('img'); img.src='photos/'+PHOTO[e[0]]+'.jpg'; img.alt=''; photo.appendChild(img);
    photo.appendChild(el('span','sr',full));
    var track=el('span','bar-track'), fill=el('span','bar-fill'); fill.style.width=e[1].value+'%'; track.appendChild(fill);
    track.setAttribute('role','progressbar'); track.setAttribute('aria-valuemin','0'); track.setAttribute('aria-valuemax','100'); track.setAttribute('aria-valuenow',String(e[1].value)); track.setAttribute('aria-label',full);
    li.appendChild(photo); li.appendChild(track); li.appendChild(el('span','bar-val',num(e[1].value)+' %'));
    return li;
  }

  function renderBars(week){
    var entries=sorted(week);
    var main=entries.filter(function(e){return e[1].value>=THRESHOLD});
    var low=entries.filter(function(e){return e[1].value<THRESHOLD});
    bars.innerHTML='';
    main.forEach(function(e){bars.appendChild(barRow(e,100))});
    var lowEl=$('low'), list=$('low-list');
    list.innerHTML='';
    lowEl.hidden=!low.length;
    low.forEach(function(e){
      var full=FULL[e[0]]||e[0];
      var li=el('li','low-item'); li.style.setProperty('--k',PARTY_COLORS[e[1].party]||'#9CA3AF');
      var p=el('span','bar-photo'); p.title=full+(e[1].party?' ('+e[1].party+')':'');
      var img=el('img'); img.src='photos/'+PHOTO[e[0]]+'.jpg'; img.alt=''; p.appendChild(img); p.appendChild(el('span','sr',full));
      li.appendChild(p); li.appendChild(el('span','low-val',num(e[1].value)+' %'));
      list.appendChild(li);
    });
  }

  function renderRunoff(week){
    var top=sorted(week).slice(0,2);
    runoff.innerHTML='';
    var h=el('h3',null,'Second tour'); h.id='t-runoff'; runoff.appendChild(h);
    var ul=el('ul');
    top.forEach(function(e){
      var li=el('li','ro'); li.style.setProperty('--k',PARTY_COLORS[e[1].party]||'#9CA3AF');
      var img=el('img'); img.src='photos/'+PHOTO[e[0]]+'.jpg'; img.alt=FULL[e[0]]||e[0];
      var box=el('div'); box.appendChild(el('b',null,FULL[e[0]]||e[0])); box.appendChild(el('span',null,e[1].party));
      box.appendChild(el('strong',null,num(e[1].value)+' %'));
      li.appendChild(img); li.appendChild(box); ul.appendChild(li);
    });
    runoff.appendChild(ul);
  }

  function renderNuances(week){
    var entries=sorted(week), max=entries.length?entries[0][1].value:1;
    var totals=GROUPS.map(function(g){
      var list=entries.filter(function(e){return g.parties.indexOf(e[1].party)>-1});
      return {g:g,list:list,total:Math.round(list.reduce(function(s,e){return s+e[1].value},0)*10)/10};
    });
    var sum=totals.reduce(function(s,t){return s+t.total},0)||1;
    stack.innerHTML='';
    stack.setAttribute('aria-label',totals.map(function(t){return t.g.name+' '+num(t.total)+' %'}).join(', '));
    totals.forEach(function(t){
      var s=el('span',null,t.g.name+' '+num(t.total)+' %'); s.style.width=(t.total/sum*100)+'%'; s.style.background=t.g.color;
      if(t.g.name==='Centre') s.style.color='#141413';
      stack.appendChild(s);
    });
    groupsEl.innerHTML='';
    totals.forEach(function(t){
      var card=el('section','group'); card.style.setProperty('--k',t.g.color);
      var head=el('div','group-head'); head.appendChild(el('h3',null,t.g.name)); head.appendChild(el('b',null,num(t.total)+' %')); card.appendChild(head);
      var ol=el('ol','bars');
      t.list.forEach(function(e){ol.appendChild(barRow(e,100))});
      card.appendChild(ol); groupsEl.appendChild(card);
    });
  }

  function renderChart(){
    var weeks=data.weeks.slice().reverse();
    var names=[];
    weeks.forEach(function(w){Object.keys(w.average).forEach(function(n){if(PHOTO[n]&&names.indexOf(n)<0)names.push(n)})});
    var latest=data.weeks[0].average;
    names.sort(function(a,b){return ((latest[b]||{}).value||0)-((latest[a]||{}).value||0)});
    if(!Object.keys(visible).length){
      names.forEach(function(n){if(latest[n]&&latest[n].value>=THRESHOLD) visible[n]=true});
      if(!Object.keys(visible).length&&names.length) visible[names[0]]=true;
    }
    function toggle(n){
      visible[n]=!visible[n];
      if(!Object.keys(visible).some(function(k){return visible[k]})) visible[n]=true;
      renderChart();
    }
    var W=900,H=250,L=36,R=200,T=10,B=28,AV=30,STEP=22;
    var max=0; names.forEach(function(n){weeks.forEach(function(w){if(w.average[n])max=Math.max(max,w.average[n].value)})});
    var top=Math.max(10,Math.ceil(max/10)*10);
    var x=function(i){return L+(weeks.length>1?i*(W-L-R)/(weeks.length-1):0)};
    var y=function(v){return T+(H-T-B)*(1-v/top)};
    var s=svg('svg',{viewBox:'0 0 '+W+' '+H,role:'group','aria-label':'Évolution hebdomadaire de la moyenne des sondages'});
    var grid=svg('g',{'class':'grid'});
    for(var v=0;v<=top;v+=10){
      grid.appendChild(svg('line',{x1:L,x2:W-R,y1:y(v),y2:y(v)}));
      var t=svg('text',{x:L-8,y:y(v)+4,'text-anchor':'end'}); t.textContent=v+' %'; grid.appendChild(t);
    }
    var every=Math.ceil(weeks.length/8);
    weeks.forEach(function(w,i){
      if(i%every===0||i===weeks.length-1){
        var t=svg('text',{x:x(i),y:H-8,'text-anchor':'middle'}); t.textContent=day(w.week,{day:'numeric',month:'short'}); grid.appendChild(t);
      }
    });
    s.appendChild(grid);
    names.filter(function(n){return visible[n]}).forEach(function(n){
      var color=LINE_COLORS[n]||'#9CA3AF', d='', pen=false;
      weeks.forEach(function(w,i){
        var a=w.average[n];
        if(!a){pen=false;return}
        d+=(pen?'L':'M')+x(i).toFixed(1)+' '+y(a.value).toFixed(1); pen=true;
      });
      s.appendChild(svg('path',{'class':'line',d:d,stroke:color}));
      weeks.forEach(function(w,i){
        var a=w.average[n]; if(!a) return;
        var c=svg('circle',{cx:x(i),cy:y(a.value),r:2.6,fill:color});
        var tt=svg('title',{}); tt.textContent=(FULL[n]||n)+' · semaine du '+weekLabel(w.week)+' : '+num(a.value)+' %'; c.appendChild(tt);
        s.appendChild(c);
      });
    });
    /* miniatures : sur la ligne de leur tranche de 10 %, empilées quand plusieurs candidats s'y trouvent */
    var bands={};
    names.forEach(function(n){
      if(!latest[n]) return;
      var k=Math.min(Math.floor(latest[n].value/10),top/10-1);
      (bands[k]=bands[k]||[]).push(n);
    });
    var ax=W-R+16, uid=0;
    Object.keys(bands).forEach(function(k){
      var list=bands[k], cy=y(+k*10+5);
      for(var j=list.length-1;j>=0;j--){
        var n=list[j], color=LINE_COLORS[n]||'#9CA3AF', id='av'+(uid++);
        var g=svg('g',{'class':'av',transform:'translate('+(ax+j*STEP)+' '+(cy-AV/2)+')',role:'button',tabindex:0,
          'aria-pressed':visible[n]?'true':'false','aria-label':(FULL[n]||n)});
        var tt=svg('title',{}); tt.textContent=(FULL[n]||n)+' · '+num(latest[n].value)+' %'; g.appendChild(tt);
        var cp=svg('clipPath',{id:id}); cp.appendChild(svg('circle',{cx:AV/2,cy:AV/2,r:AV/2})); g.appendChild(cp);
        g.appendChild(svg('circle',{cx:AV/2,cy:AV/2,r:AV/2,fill:'#fff'}));
        g.appendChild(svg('image',{href:'photos/'+PHOTO[n]+'.jpg',width:AV,height:AV,'clip-path':'url(#'+id+')',preserveAspectRatio:'xMidYMin slice'}));
        g.appendChild(svg('circle',{cx:AV/2,cy:AV/2,r:AV/2-1.2,fill:'none',stroke:color,'stroke-width':2.4}));
        g.addEventListener('click',(function(nn){return function(){toggle(nn)}})(n));
        g.addEventListener('keydown',(function(nn){return function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle(nn)}}})(n));
        s.appendChild(g);
      }
    });
    chart.innerHTML=''; chart.appendChild(s);
    /* repli petit écran : pastilles sous le graphique */
    chips.innerHTML='';
    names.forEach(function(n){
      var li=el('li'), b=el('button'); b.type='button'; b.setAttribute('aria-pressed',visible[n]?'true':'false');
      b.title=FULL[n]||n; b.setAttribute('aria-label',FULL[n]||n); b.style.setProperty('--k',LINE_COLORS[n]||'#9CA3AF');
      var img=el('img'); img.src='photos/'+PHOTO[n]+'.jpg'; img.alt=''; b.appendChild(img);
      b.addEventListener('click',function(){toggle(n)});
      li.appendChild(b); chips.appendChild(li);
    });
  }

  function updateSub(){
    if(tab==='tendance'){
      var n=data.weeks.length;
      sub.textContent='Évolution de la moyenne hebdomadaire · '+plural(n,'semaine')+' (du '+day(data.weeks[n-1].week,{day:'numeric',month:'long'})+' au '+day(data.weeks[0].week,{day:'numeric',month:'long',year:'numeric'})+')';
    } else {
      var w=data.weeks[current];
      sub.textContent='Moyenne de la semaine du '+weekLabel(w.week)+' · '+plural(w.polls,'sondage')+' ('+w.pollsters.join(', ')+')';
    }
    select.hidden=tab==='tendance';
  }
  function showWeek(i){
    current=i; var w=data.weeks[i];
    renderBars(w); renderRunoff(w); renderNuances(w); updateSub();
  }
  function selectTab(name,focus){
    tab=name;
    tabs.forEach(function(b){
      var on=b.dataset.tab===name;
      b.setAttribute('aria-selected',on?'true':'false'); b.tabIndex=on?0:-1;
      $('panel-'+b.dataset.tab).hidden=!on;
      if(on&&focus) b.focus();
    });
    if(name==='tendance') renderChart();
    updateSub();
  }

  tabs.forEach(function(b,i){
    b.addEventListener('click',function(){selectTab(b.dataset.tab)});
    b.addEventListener('keydown',function(e){
      var j=e.key==='ArrowRight'?(i+1)%tabs.length:e.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:-1;
      if(j>-1){e.preventDefault(); selectTab(tabs[j].dataset.tab,true)}
    });
  });

  fetch('data/sondages.json').then(function(r){return r.json()}).then(function(d){
    data=d;
    data.weeks.forEach(function(w,i){
      var o=el('option',null,'Semaine du '+weekLabel(w.week)+' ('+plural(w.polls,'sondage')+')'); o.value=i; select.appendChild(o);
    });
    select.addEventListener('change',function(){showWeek(+select.value)});
    showWeek(0);
    meta.textContent='Mis à jour le '+day(data.updated,{day:'numeric',month:'long',year:'numeric'})+' · '+plural(data.polls.length,'sondage')+' depuis le '+day(data.polls[data.polls.length-1].date,{day:'numeric',month:'long',year:'numeric'});
  }).catch(function(){
    $('t-polls').closest('section').hidden=true;
  });
})();
