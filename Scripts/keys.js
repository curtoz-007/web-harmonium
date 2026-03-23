// Keys.js
/* ═══════════════════════════════════════════════════
   MOBILE DETECTION
═══════════════════════════════════════════════════ */
function isMobile(){return window.innerWidth<=600;}

/* ═══════════════════════════════════════════════════
   PORTRAIT LOCK
   On touch devices in portrait: show overlay, block use
═══════════════════════════════════════════════════ */
function checkOrientation(){
  var overlay = document.getElementById('portraitOverlay');
  if(!overlay) return;
  var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if(!isTouch){ overlay.classList.remove('show'); return; }
  var portrait = window.innerHeight > window.innerWidth;
  if(portrait){
    overlay.classList.add('show');
  } else {
    overlay.classList.remove('show');
  }
}
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', function(){ setTimeout(checkOrientation, 150); });
window.addEventListener('load', checkOrientation);

/* ═══════════════════════════════════════════════════
   NOTE HELPER TOGGLE
═══════════════════════════════════════════════════ */
function applyNoteHelperState(enabled){
  localStorage.setItem('webharmonium.noteHelper', enabled ? 'true' : 'false');
  var panel = document.getElementById('noteHelper');
  if(!panel) return;
  panel.style.display = enabled ? 'block' : 'none';
  // Also sync the checkbox if settings is open
  var tog = document.getElementById('noteHelperToggle');
  if(tog) tog.checked = enabled;
}

function setNoteHelperEnabled(enabled){
  applyNoteHelperState(enabled);
}

/* ═══════════════════════════════════════════════════
   BLACK KEY LAYOUT
   Desktop: absolute left positioning inside flex row
   Mobile:  absolute top positioning inside horizontal layout
═══════════════════════════════════════════════════ */
var bkLayout=[
  {id:'bk1',    after:0,  note:'C#'},
  {id:'bk2',    after:1,  note:'D#'},
  {id:'bk4',    after:3,  note:'E♭'},
  {id:'bk5',    after:4,  note:'F#'},
  {id:'bk7',    after:6,  note:'G#'},
  {id:'bk8',    after:7,  note:'A#'},
  {id:'bk9',    after:8,  note:'B♭'},
  {id:'bkDash', after:10, note:'C#'},
  {id:'bkEq',   after:11, note:'D#'},
];

function layoutKeys(){
  var row=document.getElementById('keysRow');if(!row)return;
  var whites=row.querySelectorAll('.wk');
  var mobile=isMobile();

  bkLayout.forEach(function(e){
    var bk=document.getElementById(e.id);
    var wk=whites[e.after];
    if(!bk||!wk)return;

    if(mobile){
      var wkTop=wk.offsetLeft;
      var wkW=wk.offsetWidth;
      var bkH=bk.offsetHeight;
      bk.style.left='';
      bk.style.top=(wkTop + wkW/2 - bkH/2)+'px';
    } else {
      bk.style.top='';
      bk.style.left=(wk.offsetLeft+wk.offsetWidth-bk.offsetWidth/2)+'px';
    }
  });
}

window.addEventListener('load',layoutKeys);
window.addEventListener('resize',function(){layoutKeys();showOskIfMobile();buildOskKeyboard();});
window.addEventListener('orientationchange',function(){setTimeout(function(){layoutKeys();showOskIfMobile();buildOskKeyboard();},300);});

var _origInit=init;
init=function(){
  _origInit();
  requestAnimationFrame(layoutKeys);
  // Note helper: off by default unless user enabled it
  var enabled = localStorage.getItem('webharmonium.noteHelper') === 'true';
  applyNoteHelperState(enabled);
  rebuildHelperDropdown();
  restoreSession();
  buildOskKeyboard();
  showOskIfMobile();
};

/* ═══════════════════════════════════════════════════
   KEYBOARD VISUAL PRESS
═══════════════════════════════════════════════════ */
function getKeyEl(k){
  return document.querySelector('.wk[key="'+k+'"]')||document.querySelector('.bk[key="'+k+'"]');
}
(function(){
  var od=window.onkeydown,ou=window.onkeyup;
  window.onkeydown=function(ev){
    if(od)od(ev);
    if(!ev.repeat){var el=getKeyEl(ev.key);if(el)el.classList.add('pressed');onNoteKeyDown(ev.key);}
  };
  window.onkeyup=function(ev){
    if(ou)ou(ev);
    var el=getKeyEl(ev.key);if(el)el.classList.remove('pressed');
    onNoteKeyUp(ev.key);
  };
})();

/* ═══════════════════════════════════════════════════
   MOBILE ON-SCREEN KEYBOARD 
   White keys: ` q w e r t y u i o p [ ] \
   Black keys: 1 2 | 4 5 | 7 8 9 | - =
═══════════════════════════════════════════════════ */
var MOB_WHITE = [
  {k:'`', lb:'`', nt:''},
  {k:'q', lb:'q', nt:''},
  {k:'w', lb:'w', nt:''},
  {k:'e', lb:'e', nt:'C'},
  {k:'r', lb:'r', nt:'D'},
  {k:'t', lb:'t', nt:'E'},
  {k:'y', lb:'y', nt:'F'},
  {k:'u', lb:'u', nt:'G'},
  {k:'i', lb:'i', nt:'A'},
  {k:'o', lb:'o', nt:'B'},
  {k:'p', lb:'p', nt:''},
  {k:'[', lb:'[', nt:''},
  {k:']', lb:']', nt:''},
  {k:'\\', lb:'\\', nt:''},
];

var MOB_BLACK = [
  {after:0, k:'1', lb:'1'},
  {after:1, k:'2', lb:'2'},
  {after:3, k:'4', lb:'4'},
  {after:4, k:'5', lb:'5'},
  {after:6, k:'7', lb:'7'},
  {after:7, k:'8', lb:'8'},
  {after:8, k:'9', lb:'9'},
  {after:10,k:'-', lb:'-'},
  {after:11,k:'=', lb:'='},
];

var oskActiveKeys = {};

function buildOskKeyboard(){
  var wrap = document.getElementById('mobKeysWrap');
  if(!wrap) return;
  wrap.innerHTML = '';

  var totalWhite = MOB_WHITE.length;

  var stageW = wrap.parentElement ? wrap.parentElement.clientWidth : window.innerWidth - 40;
  var wkW = Math.floor(stageW / totalWhite);
  var wkH = Math.min(Math.floor(wkW * 3.2), 200);
  var bkW = Math.floor(wkW * 0.62);
  var bkH = Math.floor(wkH * 0.60);

  wrap.style.height = wkH + 'px';

  MOB_WHITE.forEach(function(def){
    var el = document.createElement('div');
    el.className = 'mob-wk';
    el.dataset.key = def.k;
    el.style.height = wkH + 'px';
    el.style.width = wkW + 'px';
    el.style.flex = 'none';
    if(def.lb) el.innerHTML = '<span class="mob-kb">'+def.lb+'</span>'+(def.nt?'<span class="mob-nt">'+def.nt+'</span>':'');
    attachOskTouch(el, def.k);
    wrap.appendChild(el);
  });

  MOB_BLACK.forEach(function(def){
    var el = document.createElement('div');
    el.className = 'mob-bk';
    el.dataset.key = def.k;
    el.style.width  = bkW + 'px';
    el.style.height = bkH + 'px';
    var leftPx = (def.after + 1) * wkW - Math.floor(bkW / 2);
    el.style.left = leftPx + 'px';
    el.innerHTML = '<span class="mob-kb">'+def.lb+'</span>';
    attachOskTouch(el, def.k);
    wrap.appendChild(el);
  });
}

function attachOskTouch(el, keyChar){
  el.addEventListener('touchstart', function(e){
    e.preventDefault();
    oskKeyDown(keyChar, el);
  },{passive:false});
  el.addEventListener('touchend', function(e){
    e.preventDefault();
    oskKeyUp(keyChar, el);
  },{passive:false});
  el.addEventListener('touchcancel', function(e){
    e.preventDefault();
    oskKeyUp(keyChar, el);
  },{passive:false});
  el.addEventListener('mousedown',  function(e){ oskKeyDown(keyChar, el); });
  el.addEventListener('mouseup',    function(e){ oskKeyUp(keyChar, el); });
  el.addEventListener('mouseleave', function(e){ if(oskActiveKeys[keyChar]) oskKeyUp(keyChar, el); });
}

function oskKeyDown(keyChar, btn){
  if(oskActiveKeys[keyChar])return;
  oskActiveKeys[keyChar]=true;
  if(context&&context.state==='suspended')context.resume();
  if(typeof keyboardMap!=='undefined'&&typeof keyboardMap[keyChar]!=='undefined'){
    noteOn(keyboardMap[keyChar]);
  }
  if(btn)btn.classList.add('oskpressed');
  var mainKey=getKeyEl(keyChar);
  if(mainKey)mainKey.classList.add('pressed');
  onNoteKeyDown(keyChar);
}

function oskKeyUp(keyChar, btn){
  if(!oskActiveKeys[keyChar])return;
  oskActiveKeys[keyChar]=false;
  if(typeof keyboardMap!=='undefined'&&typeof keyboardMap[keyChar]!=='undefined'){
    noteOff(keyboardMap[keyChar]);
  }
  if(btn)btn.classList.remove('oskpressed');
  var mainKey=getKeyEl(keyChar);
  if(mainKey)mainKey.classList.remove('pressed');
  onNoteKeyUp(keyChar);
}

function showOskIfMobile(){
  var panel   = document.getElementById('mobileOskPanel');
  var hint    = document.getElementById('landscapeHint');
  var cabinet = document.querySelector('.cabinet');
  if(!panel) return;

  var isTouch   = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  var mobile    = isTouch && (window.innerWidth <= 900 || window.innerHeight <= 600);
  var landscape = window.innerWidth > window.innerHeight;

  if(mobile && !landscape){
    panel.style.display = 'flex';
    if(hint)    hint.style.display    = 'none';
    if(cabinet) cabinet.style.display = 'none';
    requestAnimationFrame(function(){ buildOskKeyboard(); });
  } else if(mobile && landscape){
    panel.style.display = 'none';
    if(hint)    hint.style.display    = 'none';
    if(cabinet) cabinet.style.display = '';
  } else {
    panel.style.display = 'none';
    if(hint)    hint.style.display    = 'none';
    if(cabinet) cabinet.style.display = '';
  }
}

/* ═══════════════════════════════════════════════════
   VOLUME / REVERB SYNC
═══════════════════════════════════════════════════ */
function syncVolume(v){
  document.getElementById('myRange').value=v;document.getElementById('myRangeModal').value=v;
  document.getElementById('volumeLevel').innerText=v+'%';document.getElementById('volumeLevelModal').innerText=v+'%';
  if(typeof gainNode!=='undefined'&&gainNode!=null)gainNode.gain.value=v/100;
  if(typeof Storage!=='undefined')localStorage.setItem('webharmonium.volume',v);
}
document.getElementById('myRange').addEventListener('input',function(){syncVolume(this.value);});
function syncReverb(c){document.getElementById('useReverb').checked=c;document.getElementById('useReverbModal').checked=c;updateReverbState(c);}
document.getElementById('useReverb').addEventListener('change',function(){syncReverb(this.checked);});

/* ═══════════════════════════════════════════════════
   SETTINGS MODAL
═══════════════════════════════════════════════════ */
function openSettings(){
  document.getElementById('myRangeModal').value=document.getElementById('myRange').value;
  document.getElementById('volumeLevelModal').innerText=document.getElementById('myRange').value+'%';
  document.getElementById('useReverbModal').checked=document.getElementById('useReverb').checked;
  // Sync note helper toggle
  var enabled = localStorage.getItem('webharmonium.noteHelper') === 'true';
  var tog = document.getElementById('noteHelperToggle');
  if(tog) tog.checked = enabled;
  renderSongList();
  document.getElementById('settingsOverlay').classList.add('open');
}
function closeSettings(){document.getElementById('settingsOverlay').classList.remove('open');}
document.getElementById('settingsBtn').addEventListener('click',openSettings);

/* ═══════════════════════════════════════════════════
   SESSION / COOKIE PERSISTENCE
═══════════════════════════════════════════════════ */
function setCookie(name,value,days){
  var d=new Date();d.setTime(d.getTime()+(days*86400000));
  document.cookie=name+'='+encodeURIComponent(value)+';expires='+d.toUTCString()+';path=/';
}
function getCookie(name){
  var v=document.cookie.match('(^|;)\\s*'+name+'\\s*=\\s*([^;]+)');
  return v?decodeURIComponent(v.pop()):null;
}
function saveSession(){
  setCookie('wh_song',helperCurrentSong,1);
  setCookie('wh_pos',helperCursorIndex,1);
}
function restoreSession(){
  var s=getCookie('wh_song'),p=getCookie('wh_pos');
  if(s!==null){
    var sel=document.getElementById('helperSongSelect');
    if(sel.querySelector('option[value="'+s+'"]')){sel.value=s;loadHelperSong(parseInt(s),false);}
  }
  if(p!==null&&helperTokens.length>0){
    var pi=parseInt(p)||0;
    helperCursorIndex=Math.min(pi,helperTokens.length-1);
    renderHelperState();
  }
}

/* ═══════════════════════════════════════════════════
   NOTE HELPER
═══════════════════════════════════════════════════ */
var helperCollapsed=false;
var helperCurrentSong='';
var helperTokens=[];
var helperCursorIndex=0;
var heldKeys={};

function toggleHelper(){
  helperCollapsed=!helperCollapsed;
  var n=document.getElementById('helperNotes'),b=document.getElementById('helperToggleBtn');
  n.classList.toggle('collapsed',helperCollapsed);b.textContent=helperCollapsed?'Show':'Hide';
}

var KEY_SET=new Set(['s','a','`','1','q','2','w','e','4','r','5','t','y','7','u','8','i','9','o','p','-','[','=',']','\\',';','+']);
function isNoteChar(c){return KEY_SET.has(c.toLowerCase());}

function isAnnotation(tok){
  if(/^\(.*\)$/.test(tok))return true;
  for(var i=0;i<tok.length;i++){if(!isNoteChar(tok[i]))return true;}
  return false;
}

function renderNotesInHelper(notesText){
  var container=document.getElementById('helperNotes');
  helperTokens=[];
  if(!notesText){container.innerHTML='<div style="color:var(--muted);font-size:.78rem;font-style:italic;">No notes yet.</div>';return;}
  var frag=document.createElement('div');frag.className='helper-lines';
  notesText.split('\n').forEach(function(line){
    if(!line.trim()){var sp=document.createElement('div');sp.style.height='7px';frag.appendChild(sp);return;}
    var row=document.createElement('div');row.className='helper-line';
    line.trim().split(/\s+/).forEach(function(tok){
      if(!tok)return;
      var anno=isAnnotation(tok);
      var span=document.createElement('span');
      span.className='note-token'+(anno?' annotation':'');
      // Normalize + → = and ` alias for display token matching
      var normTok = tok.replace(/\+/g,'=').replace(/~/g,'`');
      span.textContent=tok;           // show original text
      span.dataset.token=normTok.toLowerCase(); // match against normalized
      if(!anno)helperTokens.push(span);
      row.appendChild(span);
    });
    frag.appendChild(row);
  });
  container.innerHTML='';container.appendChild(frag);
  helperCursorIndex=Math.min(helperCursorIndex,Math.max(0,helperTokens.length-1));
  renderHelperState();
}

function renderHelperState(){
  helperTokens.forEach(function(tok,i){
    tok.classList.remove('played','next','lit');
    if(i<helperCursorIndex)        tok.classList.add('played');
    else if(i===helperCursorIndex)  tok.classList.add('next');
  });
  var cur=helperTokens[helperCursorIndex];
  if(cur)cur.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});
}

function resetHelperPos(){helperCursorIndex=0;heldKeys={};renderHelperState();saveSession();}

/* ─── Key normalization ─────────────────────────────
   + and = are the same physical key (= without shift)
   Tab and ` are treated as the same note (both map to note 55)
   ~ and ` are the same key (` without shift vs with)
─────────────────────────────────────────────────── */
function normalizeKey(key){
  if(key === '+')   return '=';
  if(key === 'Tab') return '`';
  if(key === '~')   return '`';
  return key;
}

function onNoteKeyDown(key){
  key = normalizeKey(key);
  if(heldKeys[key])return;
  heldKeys[key]=true;
  if(!helperTokens.length)return;
  var cur=helperTokens[helperCursorIndex];
  if(!cur)return;
  var keyLow=key.toLowerCase();
  var tokLow=cur.dataset.token||'';
  if(cur._matchPos===undefined)cur._matchPos=0;
  if(tokLow[cur._matchPos]!==keyLow)return;
  cur._matchPos++;
  if(cur._matchPos<tokLow.length){cur.classList.add('lit');return;}
  cur._matchPos=0;
  cur.classList.remove('next');cur.classList.add('lit');
  helperCursorIndex++;
  while(
    helperCursorIndex<helperTokens.length &&
    helperTokens[helperCursorIndex] &&
    helperTokens[helperCursorIndex].classList.contains('annotation')
  ){helperCursorIndex++;}
  helperTokens.forEach(function(tok,i){
    if(tok===cur)return;
    tok.classList.remove('played','next','lit');
    if(i<helperCursorIndex)        tok.classList.add('played');
    else if(i===helperCursorIndex)  tok.classList.add('next');
  });
  var next=helperTokens[helperCursorIndex];
  if(next)next.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    if(cur){cur.classList.remove('lit');if(helperTokens.indexOf(cur)<helperCursorIndex)cur.classList.add('played');}
  });});
  saveSession();
}

function onNoteKeyUp(key){
  key = normalizeKey(key);
  heldKeys[key]=false;
}

function onSongSelect(idx){loadHelperSong(idx===''?null:parseInt(idx),true);}

function loadHelperSong(idx,resetPos){
  if(idx===null||idx===''){
    document.getElementById('helperNotes').innerHTML='<div style="color:var(--muted);font-size:.78rem;font-style:italic;">Select a song above to see notes here.</div>';
    helperTokens=[];helperCursorIndex=0;helperCurrentSong='';return;
  }
  var songs=getSongs(),song=songs[idx];if(!song)return;
  helperCurrentSong=idx;
  if(resetPos)helperCursorIndex=0;
  renderNotesInHelper(song.notes);
  saveSession();
}

function rebuildHelperDropdown(){
  var sel=document.getElementById('helperSongSelect'),songs=getSongs(),prev=sel.value;
  sel.innerHTML='<option value="">— select a song —</option>';
  songs.forEach(function(song,i){var o=document.createElement('option');o.value=i;o.textContent=song.name||('Song '+(i+1));sel.appendChild(o);});
  if(prev!==''&&songs[parseInt(prev)])sel.value=prev;
}

/* ═══════════════════════════════════════════════════
   SONG DATA
═══════════════════════════════════════════════════ */
function getSongs(){
  var s=localStorage.getItem('webharmonium.songs');
  if(s){try{return JSON.parse(s);}catch(e){}}
  if(typeof HARMONIUM_SONGS!=='undefined')return HARMONIUM_SONGS;
  return[];
}
function setSongs(arr){localStorage.setItem('webharmonium.songs',JSON.stringify(arr));}

function renderSongList(){
  var songs=getSongs(),list=document.getElementById('songList');
  list.innerHTML='';songs.forEach(function(song,i){list.appendChild(buildSongItem(song,i));});
}
function buildSongItem(song,i){
  var div=document.createElement('div');div.className='song-item';
  var head=document.createElement('div');head.className='song-item-head';
  var ni=document.createElement('input');ni.className='song-item-name';ni.type='text';ni.placeholder='Song name…';ni.value=song.name||'';
  var db=document.createElement('button');db.className='song-del-btn';db.innerHTML='✕';db.onclick=function(){deleteSongItem(i);};
  head.appendChild(ni);head.appendChild(db);
  var ta=document.createElement('textarea');ta.className='song-item-notes';ta.placeholder='Paste notes here…';ta.value=song.notes||'';
  div.appendChild(head);div.appendChild(ta);return div;
}
function addSongItem(){
  var songs=getSongs();songs.push({name:'',notes:''});setSongs(songs);renderSongList();
  var m=document.querySelector('.modal');m.scrollTop=m.scrollHeight;
}
function deleteSongItem(idx){var songs=getSongs();songs.splice(idx,1);setSongs(songs);renderSongList();rebuildHelperDropdown();}
function saveSongs(){
  var items=document.querySelectorAll('#songList .song-item'),songs=[];
  items.forEach(function(item){
    var name=item.querySelector('.song-item-name').value.trim(),notes=item.querySelector('.song-item-notes').value;
    if(name||notes)songs.push({name:name,notes:notes});
  });
  setSongs(songs);rebuildHelperDropdown();
  if(helperCurrentSong!==''&&songs[helperCurrentSong])loadHelperSong(parseInt(helperCurrentSong),false);
  var btn=document.querySelector('.songs-save-btn'),orig=btn.textContent;
  btn.textContent='✓ Saved!';btn.style.background='linear-gradient(135deg,#3a6a2a,#224a18)';
  setTimeout(function(){btn.textContent=orig;btn.style.background='';},1800);
}
function collectSongsFromForm(){
  var items=document.querySelectorAll('#songList .song-item'),songs=[];
  items.forEach(function(item){
    var name=item.querySelector('.song-item-name').value.trim(),notes=item.querySelector('.song-item-notes').value;
    if(name||notes)songs.push({name:name,notes:notes});
  });return songs;
}
function exportConfigJS(){
  downloadFile('Notes/keynotes.js','// Keynotes.js — Note helpers for Web Harmonium\nvar HARMONIUM_SONGS = '+JSON.stringify(collectSongsFromForm(),null,2)+';\n','text/javascript');
}
function exportConfigJSON(){downloadFile('harmonium-songs.json',JSON.stringify(collectSongsFromForm(),null,2),'application/json');}
function downloadFile(name,content,mime){
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type:mime}));a.download=name;document.body.appendChild(a);a.click();document.body.removeChild(a);
}