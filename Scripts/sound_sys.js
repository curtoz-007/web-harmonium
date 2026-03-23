var sampleURL = 'Sounds/harmonium-trad-orig.wav';
    var debug = false;
    var AudioContext = AudioContext || webkitAudioContext, context = null;
    var audioBuffer = null, gainNode = null, reverbNode = null, useReverb = false;
    var sourceNodes = new Array(), sourceNodeState = new Array();
    var keyboardMap = {
      "s":53,"S":53,"a":54,"A":54,"`":55,"1":56,"q":57,"Q":57,"2":58,
      "w":59,"W":59,"e":60,"E":60,"4":61,"r":62,"R":62,"5":63,"t":64,"T":64,
      "y":65,"Y":65,"7":66,"u":67,"U":67,"8":68,"i":69,"I":69,"9":70,
      "o":71,"O":71,"p":72,"P":72,"-":73,"[":74,"=":75,"]":76,"\\":77,"'":78,";":79
    };
    var swaramMap = {
      "s":"Ṃ","S":"Ṃ","a":"Ṃ","A":"Ṃ","`":"P̣","1":"Ḍ","q":"Ḍ","Q":"Ḍ","2":"Ṇ",
      "w":"Ṇ","W":"Ṇ","e":"S","E":"S","4":"R","r":"R","R":"R","5":"G","t":"G","T":"G",
      "y":"M","Y":"M","7":"M","u":"P","U":"P","8":"D","i":"D","I":"D","9":"N",
      "o":"N","O":"N","p":"Ṡ","P":"Ṡ","-":"Ṙ","[":"Ṙ","=":"Ġ","]":"Ġ","\\":"Ṁ","'":"Ṁ",";":"Ṗ",",":","
    };
    var notation = "";
    var loopStart = 0.5, loopEnd = 7.5, loop = true;
    var keyMap = new Array(), baseKeyMap = new Array();
    var middleC = 60, rootKey = 62, currentOctave = 3, stackCount = 0;
    var octaveMap = [-36,-24,-12,0,12,24,36];
    var baseKeyNames = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    var keyNames = new Array();

    function getCharLength(str){return[...str].length;}

    function init(){
      var transpose=parseInt(document.getElementById('transpose').innerText);
      var startKey=(middleC-124)+(rootKey-middleC);
      for(i=0;i<128;++i){baseKeyMap[i]=startKey++;keyMap[i]=baseKeyMap[i]+transpose;}
      for(i=0;i<keyMap.length;++i){sourceNodes[i]=null;setSourceNode(i);}
      document.getElementById('mainScreen').style.display='block';
    }

    function setSourceNode(i){
      if(sourceNodes[i]!=null&&sourceNodeState[i]==1)sourceNodes[i].stop(0);
      sourceNodeState[i]=0;sourceNodes[i]=null;
      sourceNodes[i]=context.createBufferSource();
      sourceNodes[i].connect(gainNode).connect(context.destination);
      sourceNodes[i].buffer=audioBuffer;sourceNodes[i].loop=loop;
      sourceNodes[i].loopStart=loopStart;
      if(keyMap[i]!=0)sourceNodes[i].detune.value=keyMap[i]*100;
    }

    function noteOff(note){
      var i=note+octaveMap[currentOctave];
      if(i<sourceNodes.length)setSourceNode(i);
      for(c=1;c<=stackCount;++c){i=note+octaveMap[currentOctave+c];if(i<sourceNodes.length)setSourceNode(i);}
    }

    function noteOn(note){
      var i=note+octaveMap[currentOctave];
      if(i<sourceNodes.length&&sourceNodeState[i]==0){sourceNodes[i].start(0);sourceNodeState[i]=1;}
      for(c=1;c<=stackCount;++c){
        i=note+octaveMap[currentOctave+c];
        if(i<sourceNodes.length&&sourceNodeState[i]==0){sourceNodes[i].start(0);sourceNodeState[i]=1;}
      }
    }

    window.onkeydown=function(event){
      if(!event.repeat&&typeof(keyboardMap[event.key])!="undefined")noteOn(keyboardMap[event.key]);
    };
    window.onkeyup=function(event){
      const key=event.key;
      if(typeof(keyboardMap[key])!="undefined")noteOff(keyboardMap[key]);
      if(key==="Backspace"&&getCharLength(notation)>0)notation=notation.substring(0,getCharLength(notation)-1);
      else if(key==="Delete")notation="";
      else if(key==="Enter"){console.log(notation);notation="";}
      else if(key==="Tab")notation+=",";
      else if(typeof(swaramMap[key])!="undefined")notation+=swaramMap[key];
    };

    function initReverbNode(){
      reverbNode=context.createConvolver();
      var r=new XMLHttpRequest();r.open('GET',"Sounds/reverb.wav",true);r.responseType='arraybuffer';
      r.addEventListener('load',function(){
        context.decodeAudioData(r.response,
          function(buf){reverbNode.buffer=buf;reverbNode.connect(context.destination);updateReverbState(useReverb);},
          function(e){console.error('ERROR:',e);}
        );
      });r.send();
    }

    function load(){
      context=new AudioContext();gainNode=context.createGain();gainNode.gain.value=0.3;gainNode.connect(context.destination);
      if(typeof(Storage)!=="undefined"){
        if(localStorage.getItem("webharmonium.volume")!=null){document.getElementById("myRange").value=localStorage.getItem("webharmonium.volume");onGainChange();}
        if(localStorage.getItem("webharmonium.useReverb")!=null){useReverb=localStorage.getItem("webharmonium.useReverb")=="true";document.getElementById("useReverb").checked=useReverb;}
        if(localStorage.getItem("webharmonium.octave")!=null){currentOctave=localStorage.getItem("webharmonium.octave");try{currentOctave=parseInt(currentOctave);}catch(err){currentOctave=0;}}
        document.getElementById('octave').innerText=currentOctave;
        if(localStorage.getItem("webharmonium.transpose")!=null){
          document.getElementById('transpose').innerText=localStorage.getItem("webharmonium.transpose");
          let cs=parseInt(document.getElementById('transpose').innerText);
          document.getElementById('rootNote').innerText=baseKeyNames[(cs>=0)?cs%12:cs+12];
        }
        if(localStorage.getItem("webharmonium.stack")!=null){stackCount=localStorage.getItem("webharmonium.stack");try{stackCount=parseInt(stackCount);}catch(err){stackCount=0;}}
        document.getElementById('stack').innerText=stackCount;
      }
      initReverbNode();
      var req=new XMLHttpRequest();req.open('GET',sampleURL,true);req.responseType='arraybuffer';
      req.addEventListener('load',function(){
        context.decodeAudioData(req.response,function(buf){audioBuffer=buf;init();},function(e){console.error('ERROR:',e);});
      });req.send();
      requestMIDIAccess();
    }

    function requestMIDIAccess(){
      try{
        var mi=document.getElementById('midiInputDevicesInfo');
        if(navigator.requestMIDIAccess){
          if(mi.innerText.indexOf('Supported!')==-1)mi.innerText+=" Supported! ";
          navigator.requestMIDIAccess().then(onMIDISuccess,onMIDIFailure);
        }else{if(mi.innerText.indexOf('Supported!')==-1)mi.innerText+=" Not Supported! ";}
      }catch(err){document.getElementById('midiInputDevicesInfo').innerText+=" Failed! "+err;}
    }

    var midiAccess=null;
    function onMIDISuccess(ma){
      midiAccess=ma;
      var md=document.getElementById("midiInputDevices");
      for(i=0;i<md.length;++i)md.remove(i);
      for(var input of midiAccess.inputs.values()){
        var opt=document.createElement("option");opt.id=input.id;opt.text=input.name+" by "+input.manufacturer;md.add(opt);input.onmidimessage=getMIDIMessage;
      }
    }
    function onMIDIFailure(e){document.getElementById('midiInputDevicesInfo').innerText+=" Failed! "+e;}
    function getMIDIMessage(msg){
      var cmd=msg.data[0],note=msg.data[1],vel=(msg.data.length>2)?msg.data[2]:0;
      var md=document.getElementById("midiInputDevices");
      if(msg.target.id==md.options[md.selectedIndex].id){
        switch(cmd){
          case 144:if(vel>0)noteOn(note,vel);else noteOff(note);break;
          case 128:noteOff(note);break;
          case 176:if(note==7){document.getElementById("myRange").value=(100*vel)/127;onGainChange();}break;
        }
      }
    }

    function shiftOctave(o){
      if(currentOctave+o>=0&&currentOctave+o<=6){currentOctave+=o;if(typeof(Storage)!=="undefined")localStorage.setItem("webharmonium.octave",currentOctave);}
      document.getElementById('octave').innerText=currentOctave;
    }
    function changeStack(s){
      stackCount+=s;if(stackCount<0)stackCount=0;else if(currentOctave+stackCount>6)stackCount=6-currentOctave;
      document.getElementById('stack').innerText=stackCount;
      if(typeof(Storage)!=="undefined")localStorage.setItem("webharmonium.stack",stackCount);
    }
    function shiftSemitone(st){
      var cs=parseInt(document.getElementById('transpose').innerText);
      if(cs+st>=-11&&cs+st<=11){cs+=st;document.getElementById('transpose').innerText=cs;document.getElementById('rootNote').innerText=baseKeyNames[(cs>=0)?cs%12:cs+12];}
      if(typeof(Storage)!=="undefined")localStorage.setItem("webharmonium.transpose",document.getElementById('transpose').innerText);
      init();
    }
    // Per-element note tracking — each key remembers its own note
    // so multi-touch doesn't cause one key to stop another
    var notePlaying=0; // kept for any external reference
    function play(el){
      var note=keyboardMap[el.getAttribute('key')];
      if(note===undefined)return;
      el._playingNote=note;
      notePlaying=note;
      noteOn(note);
    }
    function stop(el){
      var note=el._playingNote;
      if(note===undefined)return;
      el._playingNote=undefined;
      noteOff(note);
    }
    function onGainChange(){
      if(typeof(Storage)!=="undefined")localStorage.setItem("webharmonium.volume",document.getElementById("myRange").value);
      document.getElementById('volumeLevel').innerText=document.getElementById("myRange").value+"%";
      if(gainNode!=null)gainNode.gain.value=document.getElementById("myRange").value/100;
    }
    function updateReverbState(v){
      useReverb=v;if(typeof(Storage)!=="undefined")localStorage.setItem("webharmonium.useReverb",(useReverb?"true":"false"));
      if(useReverb)gainNode.connect(reverbNode);else{try{gainNode.disconnect(reverbNode);}catch(e){}}
    }
    if("serviceWorker" in navigator){
      window.addEventListener("load",function(){
        navigator.serviceWorker.register("Scripts/serviceworker.js").then(r=>console.log("sw registered")).catch(e=>console.log("sw not registered",e));
      });
    }