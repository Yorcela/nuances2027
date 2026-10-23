(function(){
  var hemi=document.querySelector('.hemi');
  var sectors=hemi.querySelectorAll('.sector');
  var buttons=hemi.querySelectorAll('.legend button');
  var defs=document.querySelectorAll('#detail .def:not(.hint)');
  var hint=document.querySelector('#detail .hint');
  function select(n){
    hint.hidden=true;
    hemi.classList.add('has-active');
    defs.forEach(function(d,i){d.hidden=i!==n});
    sectors.forEach(function(s){s.classList.toggle('active',+s.dataset.n===n)});
    buttons.forEach(function(b){b.setAttribute('aria-pressed',String(+b.dataset.n===n))});
  }
  defs.forEach(function(d){d.hidden=true});
  hint.hidden=false;
  sectors.forEach(function(s){
    var n=+s.dataset.n;
    s.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')select(n)});
    s.addEventListener('click',function(){select(n)});
    s.addEventListener('focus',function(){select(n)});
    s.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();select(n)}});
  });
  buttons.forEach(function(b){
    b.addEventListener('click',function(){select(+b.dataset.n)});
  });
  var info=document.querySelector('.hemi .info');
  var toggle=info&&info.querySelector('.info-toggle');
  if(toggle) toggle.addEventListener('click',function(){
    var collapsed=info.classList.toggle('collapsed');
    toggle.setAttribute('aria-expanded',String(!collapsed));
  });
})();
