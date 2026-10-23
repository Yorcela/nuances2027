(function(){
  var $=function(id){return document.getElementById(id)};
  function el(tag,cls,text){var e=document.createElement(tag); if(cls)e.className=cls; if(text!=null)e.textContent=text; return e}
  function fmt(v,u){return v.toLocaleString('fr-FR',{minimumFractionDigits:u==='%'?1:0,maximumFractionDigits:1})+(u==='%'?' %':' '+u)}
  function icon(name){var i=el('span','sit-ico'); i.style.setProperty('--icon','url(icons/ph-'+name+'.svg)'); i.setAttribute('aria-hidden','true'); return i}
  function title(t){
    var h=el('h3','stat-label',t.l);
    if(t.tip){var b=el('button','info-i','i'); b.type='button'; b.setAttribute('aria-label','Plus d\u2019informations : '+t.l);
      b.addEventListener('mouseenter',function(){tip(b,t.tip)}); b.addEventListener('focus',function(){tip(b,t.tip)}); b.addEventListener('click',function(e){e.stopPropagation(); tip(b,t.tip)}); b.addEventListener('mouseleave',untip); b.addEventListener('blur',untip); h.appendChild(b)}
    return h;
  }
  function src(d,k){var s=d.sources[k], a=el('a','stat-src',s.org+' ↗'); a.href=s.url; a.target='_blank'; a.rel='noopener'; a.title=s.label; return a}
  function shade(i,n){return 'color-mix(in srgb, var(--c) '+Math.round(100-i*(70/Math.max(1,n-1)))+'%, #fff)'}
  function stat(d,t,sec,hero){
    var c=el('article','stat'+(hero?' stat-hero':''));
    if(hero) c.appendChild(icon(sec.icon));
    c.appendChild(el('p','stat-v',t.v)); c.appendChild(title(t));
    if(t.d) c.appendChild(el('p','stat-d',t.d));
    if(t.p) c.appendChild(el('span','stat-pill',t.p));
    c.appendChild(src(d,t.s)); return c;
  }
  function donut(d,t){
    var c=el('article','stat stat-wide'); c.appendChild(title(t));
    var tot=t.items.reduce(function(a,i){return a+i[1]},0), acc=0, stops=[];
    t.items.forEach(function(i,k){var a=acc/tot*100, b=(acc+i[1])/tot*100; stops.push(shade(k,t.items.length)+' '+a+'% '+b+'%'); acc+=i[1]});
    var row=el('div','donut-row'), ring=el('div','donut'); ring.style.background='conic-gradient('+stops.join(',')+')';
    ring.setAttribute('role','img'); ring.setAttribute('aria-label',t.items.map(function(i){return i[0]+' : '+fmt(i[1],t.unit)}).join(', '));
    var top=t.items.reduce(function(m,i){return i[1]>m[1]?i:m}), mid=el('div','donut-mid');
    mid.appendChild(el('b',null,Math.round(top[1]/tot*100)+' %')); mid.appendChild(el('span',null,top[0])); ring.appendChild(mid);
    var ul=el('ul','legend');
    t.items.forEach(function(i,k){
      var li=el('li'), dot=el('i','dot'); dot.style.background=shade(k,t.items.length); li.appendChild(dot);
      li.appendChild(el('span','lg-name',i[0])); li.appendChild(el('b','lg-val',fmt(i[1],t.unit))); ul.appendChild(li);
    });
    row.appendChild(ring); row.appendChild(ul); c.appendChild(row); c.appendChild(src(d,t.s)); return c;
  }
  function bars(d,t){
    var c=el('article','stat stat-wide'); c.appendChild(title(t));
    var tot=t.unit==='%'?100:t.items.reduce(function(a,i){return a+i[1]},0), ul=el('ul','sbars'+(t.nowrap?' nowrap':''));
    t.items.forEach(function(i){
      var pct=i[1]/tot*100, li=el('li'); li.appendChild(el('span','sb-name',i[0]));
      var bar=el('span','sb-bar'), fill=el('span','sb-fill'); fill.style.width=pct+'%'; bar.appendChild(fill); li.appendChild(bar);
      li.appendChild(el('b','sb-val',fmt(i[1],t.unit)+(t.unit==='%'?'':' ('+(pct<1?pct.toLocaleString('fr-FR',{maximumFractionDigits:1}):Math.round(pct))+' %)'))); ul.appendChild(li);
    });
    c.appendChild(ul); c.appendChild(src(d,t.s)); if(t.s2){var a2=src(d,t.s2); a2.style.marginLeft='12px'; c.lastChild.insertAdjacentElement('afterend',a2)} return c;
  }
  function link(d,k,txt){var s=d.sources[k], a=el('a','stat-src',txt||s.org+' ↗'); a.href=s.url; a.target='_blank'; a.rel='noopener'; a.title=s.label; return a}
  function rules(d,t){
    var c=el('article','stat stat-wide'); c.appendChild(title(t));
    var g=el('div','rules');
    (t.items||[]).forEach(function(i){
      var r=el('div','rule'); r.appendChild(el('p','rule-k',i.k));
      var tr=el('div','rule-track');
      var f=el('span','rule-fr'); f.style.width=(i.fr/i.max*100)+'%'; tr.appendChild(f);
      var e=el('span','rule-ea'); e.style.left=(i.ea/i.max*100)+'%'; tr.appendChild(e);
      var m=el('span','rule-ref'); m.style.left=(i.ref/i.max*100)+'%'; m.appendChild(el('em',null,i.rule)); tr.appendChild(m);
      r.appendChild(tr);
      var lg=el('p','rule-lg'); lg.appendChild(el('b',null,i.frl)); lg.appendChild(document.createTextNode(' · '+i.eal)); r.appendChild(lg);
      r.appendChild(el('p','stat-pill',i.gap)); r.appendChild(link(d,i.s)); g.appendChild(r);
    });
    if(t.items&&t.items.length) c.appendChild(g);
    var ul=el('ul','facts');
    t.facts.forEach(function(f){var li=el('li'); li.appendChild(document.createTextNode(f.t+' ')); li.appendChild(link(d,f.s)); ul.appendChild(li)});
    c.appendChild(ul); c.appendChild(src(d,t.s)); return c;
  }
  var tipEl=null;
  function untip(){if(tipEl){tipEl.remove(); tipEl=null}}
  function tip(b,text){
    untip(); tipEl=el('div','tip',text); tipEl.setAttribute('role','tooltip'); document.body.appendChild(tipEl);
    var r=b.getBoundingClientRect(), w=Math.min(260,innerWidth-24), x=Math.max(12,Math.min(innerWidth-w-12,r.left+r.width/2-w/2));
    tipEl.style.width=w+'px'; tipEl.style.left=x+'px';
    var h=tipEl.offsetHeight; tipEl.style.top=(r.bottom+8+h>innerHeight&&r.top-8-h>0?r.top-8-h:r.bottom+8)+'px';
  }
  document.addEventListener('keydown',function(e){if(e.key==='Escape')untip()});
  document.addEventListener('click',untip);
  function table(d,t){
    var c=el('article','stat stat-wide'); c.appendChild(title(t));
    var w=el('div','tbl-wrap'), tb=el('table','tbl'), th=el('thead'), tr=el('tr');
    t.head.forEach(function(h){
      var th=el('th'); th.appendChild(document.createTextNode(h.h||h));
      if(h.tip){var b=el('button','info-i','i'); b.type='button'; b.setAttribute('aria-label','Plus d\u2019informations : '+h.h); b.addEventListener('mouseenter',function(){tip(b,h.tip)}); b.addEventListener('focus',function(){tip(b,h.tip)}); b.addEventListener('click',function(e){e.stopPropagation(); tip(b,h.tip)}); b.addEventListener('mouseleave',untip); b.addEventListener('blur',untip); th.appendChild(b)}
      tr.appendChild(th);
    }); th.appendChild(tr); tb.appendChild(th);
    var bd=el('tbody'); t.rows.forEach(function(r){var x=el('tr'); r.forEach(function(v,i){x.appendChild(el(i?'td':'th',null,v))}); bd.appendChild(x)});
    tb.appendChild(bd); w.appendChild(tb); c.appendChild(w); c.appendChild(src(d,t.s)); if(t.s2){var a2=src(d,t.s2); a2.style.marginLeft='12px'; c.lastChild.insertAdjacentElement('afterend',a2)} return c;
  }
  function sgn(v,u,mode){return mode==='deficit'?(v>0?'+':'')+v.toLocaleString('fr-FR',{minimumFractionDigits:1,maximumFractionDigits:1})+' '+u:fmt(v,u)}
  function rank(d,t){
    var c=el('article','stat stat-wide'); c.appendChild(title(t));
    var div=t.mode==='solde', lin=t.mode==='dette', ul=el('ul','sbars rank'+(div?' rank-div':''));
    var items=t.items.filter(function(i){return !t.only||i[2]==='eu'||t.only.indexOf(i[0])>-1});
    if(div||lin){
      var first=items.filter(function(i){return i[2]==='eu'}), rest=items.filter(function(i){return i[2]!=='eu'});
      rest.sort(function(a,b){return t.mode==='solde'?b[1]-a[1]:a[1]-b[1]});
      items=first.concat(rest);
      var ax=el('li','rank-axis'); ax.appendChild(el('span','sb-name',''));
      var sc=el('span','rank-scale');
      if(lin){
        sc.classList.add('rank-scale-lin');
        sc.appendChild(el('i',null,'0 %'));
        var mk=el('i','rs-ref',t.ref+' %'); mk.style.left=(t.ref/t.scale*100)+'%'; sc.appendChild(mk);
        sc.appendChild(el('i','rs-end',t.scale+' %'));
      } else { sc.appendChild(el('i',null,'−10 %')); sc.appendChild(el('i',null,'0')); sc.appendChild(el('i',null,'+10 %')); }
      ax.appendChild(sc); ax.appendChild(el('b','sb-val','')); ul.appendChild(ax);
    }
    var max=Math.max.apply(null,items.map(function(i){return i[1]}));
    items.forEach(function(i){
      var li=el('li',(i[2]==='fr'?'is-fr ':'')+(i[2]==='eu'?'is-eu':'')); li.appendChild(el('span','sb-name',i[0]));
      var bar=el('span','sb-bar'), fill=el('span','sb-fill');
      if(lin){
        fill.style.width=Math.min(100,i[1]/t.scale*100)+'%'; fill.classList.add(i[1]>t.ref?'neg':'pos');
        var rm=el('span','sb-ref'); rm.style.left=(t.ref/t.scale*100)+'%'; bar.appendChild(rm);
      } else if(div){
        bar.classList.add('sb-div');
        var delta=t.mode==='solde'?i[1]:t.center-i[1], w=Math.min(50,Math.abs(delta)/t.scale*50);
        fill.style.width=w+'%'; fill.classList.add(delta<0?'neg':'pos');
      } else fill.style.width=(t.unit==='%'?i[1]:i[1]/max*100)+'%';
      bar.insertBefore(fill,bar.firstChild); li.appendChild(bar);
      li.appendChild(el('b','sb-val',t.mode==='solde'?(i[1]>0?'+':'')+i[1].toLocaleString('fr-FR',{minimumFractionDigits:1,maximumFractionDigits:1})+' %':fmt(i[1],t.unit))); ul.appendChild(li);
    });
    c.appendChild(ul); c.appendChild(src(d,t.s)); return c;
  }
  var hd=document.querySelector('.site-header');
  function setHH(){document.documentElement.style.setProperty('--hh',(hd?hd.offsetHeight:60)+'px')}
  setHH(); window.addEventListener('resize',setHH);
  fetch('data/situation.json').then(function(r){return r.json()}).then(function(d){
    var nav=$('sit-nav'), root=$('sit');
    d.sections.forEach(function(s){
      var a=el('a',null,s.title), dot=el('i','dot'); dot.style.background=s.color; a.insertBefore(dot,a.firstChild); a.href='#'+s.id; nav.appendChild(a);
      var sec=el('section','sit-sec'); sec.id=s.id; sec.style.setProperty('--c',s.color);
      var h=el('div','sit-head'); h.appendChild(icon(s.icon)); h.appendChild(el('h2',null,s.title)); sec.appendChild(h);
      var plain=s.tiles.filter(function(t){return !t.t}), wides=s.tiles.filter(function(t){return t.t});
      var top=el('div','sit-top');
      if(plain.length) top.appendChild(stat(d,plain[0],s,true));
      top.appendChild(el('p','sit-intro',s.intro));
      sec.appendChild(top);
      var smalls=plain.slice(1), n=smalls.length;
      if(n){
        var cols=n<=2?2:n===3?3:n===4?4:n<=6?3:4, g=el('div','sit-smalls'); g.style.setProperty('--cols',cols);
        smalls.forEach(function(t){g.appendChild(stat(d,t,s,false))}); sec.appendChild(g);
      }
      if(wides.length){
        var w=el('div','sit-wides');
        var pair=null;
        wides.forEach(function(t,k){
          var card=t.t==='rank'?rank(d,t):t.t==='table'?table(d,t):t.t==='rules'?rules(d,t):t.t==='donut'?donut(d,t):bars(d,t);
          if(t.t==='donut'&&(pair||(wides[k+1]&&wides[k+1].t==='donut'))){
            if(!pair){pair=el('div','sit-pair'); w.appendChild(pair)}
            pair.appendChild(card);
            if(!(wides[k+1]&&wides[k+1].t==='donut')) pair=null;
          } else {pair=null; w.appendChild(card)}
        });
        sec.appendChild(w);
      }
      root.appendChild(sec);
    });
    if('IntersectionObserver' in window){
      var links=nav.querySelectorAll('a');
      var io=new IntersectionObserver(function(es){es.forEach(function(e){
        if(e.isIntersecting) links.forEach(function(a){if(a.getAttribute('href')==='#'+e.target.id) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current')});
      })},{rootMargin:'-30% 0px -60% 0px'});
      document.querySelectorAll('.sit-sec').forEach(function(s){io.observe(s)});
    }
  }).catch(function(){ $('sit').appendChild(el('p',null,'Les chiffres ne sont pas disponibles pour le moment.')) });
})();
