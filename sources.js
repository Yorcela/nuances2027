(function(){
  var table=document.getElementById('grid');
  var body=table.tBodies[0];
  var rows=Array.prototype.slice.call(body.rows);
  var total=+table.dataset.total;
  var fCat=document.getElementById('f-cat');
  var fSrc=document.getElementById('f-src');
  var fDate=document.getElementById('f-date');
  var count=document.getElementById('count');
  var empty=document.getElementById('empty');
  var buttons=table.querySelectorAll('thead button');
  var sort={col:-1,dir:1};
  function norm(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
  function key(row,col){
    var c=row.cells[col];
    if(col===3) return c.dataset.sort||'';
    return norm(c.textContent);
  }
  function render(){
    var cat=fCat.value, src=norm(fSrc.value.trim()), date=norm(fDate.value.trim());
    var list=rows.filter(function(r){
      return (!cat||r.cells[1].dataset.cat===cat)
        &&(!src||norm(r.cells[2].textContent).indexOf(src)>-1)
        &&(!date||norm(r.cells[3].textContent).indexOf(date)>-1);
    });
    if(sort.col>-1){
      list.sort(function(a,b){
        var x=key(a,sort.col), y=key(b,sort.col);
        if(sort.col===3){
          if(!x&&!y) return 0;
          if(!x) return 1;
          if(!y) return -1;
        }
        return x<y?-sort.dir:x>y?sort.dir:0;
      });
    }
    rows.forEach(function(r){r.hidden=true});
    list.forEach(function(r){r.hidden=false;body.appendChild(r)});
    count.textContent=list.length+' source'+(list.length>1?'s':'')+' sur '+total+' — triez ou filtrez par catégorie, nom de source ou date.';
    empty.hidden=list.length>0;
  }
  buttons.forEach(function(b){
    b.addEventListener('click',function(){
      var col=+b.dataset.col;
      sort.dir=sort.col===col?-sort.dir:1;
      sort.col=col;
      buttons.forEach(function(x){x.parentNode.setAttribute('aria-sort','none')});
      b.parentNode.setAttribute('aria-sort',sort.dir===1?'ascending':'descending');
      render();
    });
  });
  [fCat,fSrc,fDate].forEach(function(f){f.addEventListener('input',render)});
})();
