import React, { useEffect, useRef, useState } from 'react';

// --- Draggable Hook ---
function useDraggable(initial = { x: 40, y: 40 }) {
  const ref = useRef(null);
  const posRef = useRef({ x: initial.x, y: initial.y });
  const [, setTick] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let dragging = false;
    let start = { x: 0, y: 0 };

    function onDown(e) {
      dragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      start = { x: clientX, y: clientY };
      document.body.style.userSelect = 'none';
    }

    function onMove(e) {
      if (!dragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - start.x;
      const dy = clientY - start.y;
      start = { x: clientX, y: clientY };
      posRef.current.x += dx;
      posRef.current.y += dy;
      el.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
      setTick(t => t + 1);
    }

    function onUp() {
      dragging = false;
      document.body.style.userSelect = '';
    }

    el.addEventListener('mousedown', onDown);
    el.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);

    el.style.position = 'absolute';
    el.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;

    return () => {
      el.removeEventListener('mousedown', onDown);
      el.removeEventListener('touchstart', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  return { ref, getPosition: () => posRef.current };
}

// --- Generic Widget Wrapper ---
function WidgetWrapper({ title, children, onRemove, onRename, glassButtonStyle }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(title);

  const styles = {
    wrapper: { padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.8)', border: '1px solid #ccc', position: 'absolute', minWidth: '160px', color: 'black' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    title: { fontWeight: '600', cursor: 'pointer' },
    input: { border: '1px solid #ccc', borderRadius: '4px', padding: '2px 4px', fontSize: '12px' },
    close: { fontSize: '8px', padding: '0 4px', marginLeft: '8px', border: '1px solid #aaa', borderRadius: '4px', cursor: 'pointer' }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        {editing ? (
          <input value={name} onChange={e => setName(e.target.value)} onBlur={() => { setEditing(false); onRename && onRename(name); }} style={styles.input} autoFocus />
        ) : (
          <div style={styles.title} onClick={() => setEditing(true)}>{name}</div>
        )}
        <button onClick={onRemove} style={glassButtonStyle}>✕</button>
      </div>
      {React.Children.map(children, child => React.cloneElement(child, { glassButtonStyle }))}
    </div>
  );
}

// --- Widgets ---
function Stoplight({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
  const [color, setColor] = useState('red');
  const { ref, getPosition } = useDraggable(position || { x: 80, y: 80 });
  useEffect(()=>{if(registerRef)registerRef(getPosition)},[getPosition,registerRef]);
  const circleStyle=(c)=>({ width:'40px', height:'40px', borderRadius:'50%', border:'2px solid #333', margin:'8px 0', cursor:'pointer', backgroundColor:c===color?c:'#666' });
  const boxStyle={ width:'70px', padding:'10px', backgroundColor:'#222', border:'3px solid #333', borderRadius:'12px', display:'flex', flexDirection:'column', alignItems:'center' };
  return <div ref={ref}><WidgetWrapper title="Stoplight" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}><div style={boxStyle}><div onClick={()=>setColor('red')} style={circleStyle('red')} /><div onClick={()=>setColor('yellow')} style={circleStyle('yellow')} /><div onClick={()=>setColor('green')} style={circleStyle('green')} /></div><div style={{ marginTop:'8px', fontSize:'14px' }}>Active: <b>{color}</b></div></WidgetWrapper></div>;
}

function ClockWidget({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
  const [now,setNow] = useState(new Date());
  const { ref, getPosition } = useDraggable(position || { x:320, y:80 });
  useEffect(()=>{if(registerRef)registerRef(getPosition)},[getPosition,registerRef]);
  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(t)},[]);
  return <div ref={ref}><WidgetWrapper title="Clock" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}><div style={{ fontSize:'24px', fontFamily:'monospace'}}>{now.toLocaleTimeString()}</div><div style={{ fontSize:'12px', color:'#555'}}>{now.toLocaleDateString()}</div></WidgetWrapper></div>;
}

function TimerWidget({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
  const [running,setRunning]=useState(false);
  const [secondsLeft,setSecondsLeft]=useState(5*60);
  const { ref, getPosition } = useDraggable(position || { x:80, y:260 });
  const intervalRef = useRef(null);
  useEffect(()=>{if(registerRef)registerRef(getPosition)},[getPosition,registerRef]);
  useEffect(()=>{if(running){intervalRef.current=setInterval(()=>setSecondsLeft(s=>{if(s<=1){clearInterval(intervalRef.current);setRunning(false);return 0} return s-1}),1000)} return ()=>clearInterval(intervalRef.current)},[running]);
  const format=s=>{const mm=Math.floor(s/60).toString().padStart(2,'0'); const ss=(s%60).toString().padStart(2,'0'); return `${mm}:${ss}`};
  const parseTime=str=>{const p=str.split(':');let mm=0,ss=0;if(p.length===2){mm=parseInt(p[0])||0;ss=parseInt(p[1])||0;}else mm=parseInt(p[0])||0;return mm*60+ss};
  return <div ref={ref}><WidgetWrapper title="Timer" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}><input value={format(secondsLeft)} onChange={e=>setSecondsLeft(Math.max(0,parseTime(e.target.value)))} style={{fontSize:'28px', textAlign:'center', fontFamily:'monospace', width:'100px'}} /><div style={{ display:'flex', gap:'8px', marginTop:'8px', justifyContent:'center'}}><button style={glassButtonStyle} onClick={()=>setRunning(r=>!r)}>{running?'Pause':'Start'}</button><button style={glassButtonStyle} onClick={()=>{clearInterval(intervalRef.current);setRunning(false);setSecondsLeft(0)}}>Reset</button></div><div style={{ display:'flex', gap:'6px', marginTop:'8px', justifyContent:'center'}}><button style={glassButtonStyle} onClick={()=>setSecondsLeft(prev=>Math.max(0,prev-60))}>-1m</button><button style={glassButtonStyle} onClick={()=>setSecondsLeft(prev=>prev+60)}>+1m</button></div></WidgetWrapper></div>;
}

function PollWidget({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
  const { ref, getPosition } = useDraggable(position || { x:200, y:260 });
  useEffect(()=>{if(registerRef)registerRef(getPosition)},[getPosition,registerRef]);
  const [options,setOptions]=useState(['A','B','C']);
  const [votes,setVotes]=useState({});
  const [newOption,setNewOption]=useState('');
  const vote=(opt)=>setVotes(v=>({...v,[opt]:(v[opt]||0)+1}));
  const addOption=()=>{if(newOption){setOptions(prev=>[...prev,newOption]);setNewOption('');}};
  return <div ref={ref}><WidgetWrapper title="Poll" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}><div>{options.map(o=><div key={o} style={{margin:'4px 0'}}><button style={glassButtonStyle} onClick={()=>vote(o)}>{o}</button> : {votes[o]||0}</div>)}</div><div style={{marginTop:'4px'}}><input value={newOption} onChange={e=>setNewOption(e.target.value)} placeholder="New option"/><button style={glassButtonStyle} onClick={addOption}>Add</button></div></WidgetWrapper></div>;
}

function DiceWidget({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
  const { ref, getPosition } = useDraggable(position || { x:400, y:200 });
  useEffect(()=>{if(registerRef)registerRef(getPosition)},[getPosition,registerRef]);
  const [value,setValue]=useState(1);
  return <div ref={ref}><WidgetWrapper title="Dice" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}><div style={{ fontSize:'36px', textAlign:'center' }}>{value}</div><button style={glassButtonStyle} onClick={()=>setValue(Math.floor(Math.random()*6)+1)}>Roll</button></WidgetWrapper></div>;
}

function NamePickerWidget({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
  const { ref, getPosition } = useDraggable(position || { x:400, y:300 });
  useEffect(()=>{if(registerRef)registerRef(getPosition)},[getPosition,registerRef]);

  const [names,setNames] = useState(['Alice','Bob','Charlie']);
  const [selected,setSelected] = useState('');
  const [uniquePick,setUniquePick] = useState(false);

  const pick = () => {
    if(names.length === 0) return;
    const idx = Math.floor(Math.random() * names.length);
    const picked = names[idx];
    setSelected(picked);
    if(uniquePick){
      setNames(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const resetNames = () => {
    const current = names.join(',');
    setNames(current ? current.split(',') : []);
    setSelected('');
  };

  return (
    <div ref={ref}>
      <WidgetWrapper title="Name Picker" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}>
        <div style={{ marginBottom: 6 }}>
          <input
            value={names.join(',')}
            onChange={e => setNames(e.target.value.split(','))}
            style={{ width:'100%' }}
          />
        </div>
        <div style={{ display:'flex', gap:6, marginBottom:6 }}>
          <button style={glassButtonStyle} onClick={pick}>Pick</button>
          <button style={glassButtonStyle} onClick={resetNames}>Reset</button>
        </div>
        <div style={{ marginBottom:6 }}>
          <label>
            <input type="checkbox" checked={uniquePick} onChange={e=>setUniquePick(e.target.checked)} />
            &nbsp;Don't pick same name twice
          </label>
        </div>
        <div><b>Selected:</b> {selected}</div>
      </WidgetWrapper>
    </div>
  );
}


// function ImageWidget({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
//   const { ref, getPosition } = useDraggable(position || { x:500, y:100 });
//   useEffect(()=>{if(registerRef)registerRef(getPosition)},[getPosition,registerRef]);
//   const [url,setUrl]=useState('');
//   return <div ref={ref}><WidgetWrapper title="Image" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}><input placeholder="Image URL" value={url} onChange={e=>setUrl(e.target.value)} style={{width:'100%', marginBottom:6}}/><button style={glassButtonStyle} onClick={()=>setUrl('')}>Clear</button>{url && <img src={url} alt="widget" style={{ width:'100%', maxHeight:'150px', objectFit:'contain'}} />}</WidgetWrapper></div>;
// }

function ConversionWidget({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
  const { ref, getPosition } = useDraggable(position || { x:500, y:250 });
  useEffect(()=>{if(registerRef)registerRef(getPosition)},[getPosition,registerRef]);
  const [value,setValue]=useState(0);
  const [unit,setUnit]=useState('cups');
  const [result,setResult]=useState(0);
  const densities={flour:120, sugar:200, cocoa:125};
  useEffect(()=>{setResult(unit==='grams'?value*densities['flour']:value)},[value,unit]);
  return <div ref={ref}><WidgetWrapper title="Conversion" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}><input type="number" value={value} onChange={e=>setValue(Number(e.target.value))} style={{width:'60px', marginRight:4}}/><select value={unit} onChange={e=>setUnit(e.target.value)} style={{marginRight:4}}><option value="cups">cups</option><option value="grams">grams</option></select><div style={{marginTop:6}}>Result: {result}</div></WidgetWrapper></div>;
}

// --- Main Component ---
export default function ClassroomScreen() {
  const [bgUrl,setBgUrl]=useState('');
  const [bgColor,setBgColor]=useState('#800cb6ff');
  const [widgets,setWidgets]=useState([]);
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [barMinimized,setBarMinimized]=useState(false);
  const [saveName,setSaveName]=useState('');
  const widgetRefs = useRef({});

  const glassButtonStyle = {
    background: "rgba(255,255,255,0.25)",
    border: "1px solid rgba(255,255,255,0.4)",
    borderRadius: "8px",
    padding: "6px 12px",
    color: "#000",
    fontWeight: "500",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    cursor: "pointer",
    transition: "all 0.2s ease"
  };

  useEffect(()=>{
    const saved=localStorage.getItem('classroomScreen');
    if(saved){
      const data=JSON.parse(saved);
      setWidgets(data.widgets||[]);
      setBgUrl(data.bgUrl||'');
      setBgColor(data.bgColor||'#800cb6ff');
    }
  },[]);

  const addWidget=(type)=>setWidgets(prev=>[...prev,{id:Date.now(),type,title:type.charAt(0).toUpperCase()+type.slice(1)}]);
  const removeWidget=(id)=>setWidgets(prev=>prev.filter(w=>w.id!==id));
  const renameWidget=(id,newTitle)=>setWidgets(prev=>prev.map(w=>w.id===id?{...w,title:newTitle}:w));

  const saveNamedScreen=(name)=>{
    if(!name) return alert('Provide a name!');
    const widgetsWithPos = widgets.map(w=>{const getPos=widgetRefs.current[w.id]; const pos=getPos?getPos():w.position||{x:40,y:40}; return {...w,position:pos}});
    const data={widgets:widgetsWithPos,bgUrl,bgColor};
    const savedScreens=JSON.parse(localStorage.getItem('namedScreens')||'{}');
    savedScreens[name]=data;
    localStorage.setItem('namedScreens',JSON.stringify(savedScreens));
    alert(`Screen saved as "${name}"`);
  };

  const loadNamedScreen=(name)=>{const savedScreens=JSON.parse(localStorage.getItem('namedScreens')||'{}'); const data=savedScreens[name]; if(!data)return alert(`No saved screen found: ${name}`); setWidgets(data.widgets||[]); setBgUrl(data.bgUrl||''); setBgColor(data.bgColor||'#800cb6ff');};
  const deleteNamedScreen=(name)=>{const savedScreens=JSON.parse(localStorage.getItem('namedScreens')||'{}'); delete savedScreens[name]; localStorage.setItem('namedScreens',JSON.stringify(savedScreens)); setSaveName('');};
  const getSavedScreenNames=()=>Object.keys(JSON.parse(localStorage.getItem('namedScreens')||'{}'));

  const handleFile=(file)=>{if(!file)return; setBgUrl(URL.createObjectURL(file));};

  return (
    <div style={{height:'100vh', width:'100vw', position:'relative', overflow:'hidden'}}>
      <div style={{position:'absolute', inset:0, zIndex:-1, backgroundColor:bgColor, backgroundImage:bgUrl?`url(${bgUrl})`:'', backgroundSize:'cover', backgroundPosition:'center'}} />

      {/* Settings */}
      <div style={{position:'absolute', top:8, right:8}}>
        <button style={{...glassButtonStyle, borderRadius:'50%', width:40, height:40}} onClick={()=>setSettingsOpen(o=>!o)}>⚙</button>
        {settingsOpen && (
          <div style={{position:'absolute', top:44, right:0, background:'rgba(255,255,255,0.95)', border:'1px solid #ccc', borderRadius:8, padding:12, width:260,color:'black'}}>
            <label>Background Color:</label>
            <input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)} style={{width:'100%', marginBottom:6}} />
            <label>Or Upload Image:</label>
            <input type="file" accept="image/*" onChange={e=>handleFile(e.target.files[0])} style={{width:'100%', marginBottom:6}} />
            {bgUrl && <button style={{...glassButtonStyle,width:'100%', marginBottom:6}} onClick={()=>setBgUrl('')}>Clear Background Image</button>}
            <input type="text" placeholder="Save name..." value={saveName} onChange={e=>setSaveName(e.target.value)} style={{width:'100%',marginBottom:6}}/>
            <button style={glassButtonStyle} onClick={()=>saveNamedScreen(saveName)}>Save Screen</button>
            <div style={{marginTop:12}}>
              <div style={{fontWeight:600, marginBottom:4}}>Load/Delete Saved Screens:</div>
              {getSavedScreenNames().map(name=>(
                <div key={name} style={{display:'flex', gap:'4px', marginBottom:4}}>
                  <button style={{...glassButtonStyle,flex:1}} onClick={()=>loadNamedScreen(name)}>{name}</button>
                  <button style={{...glassButtonStyle}} onClick={()=>deleteNamedScreen(name)}>✕</button>
                </div>
              ))}
            </div>
            <button style={{...glassButtonStyle, marginTop:12, width:'100%'}} onClick={()=>{setWidgets([]); setBgUrl(''); setBgColor('#800cb6ff'); localStorage.removeItem('classroomScreen')}}>Reset Layout</button>
          </div>
        )}
      </div>

      {/* Widgets */}
      {widgets.map(w=>{
        const commonProps={key:w.id,onRemove:()=>removeWidget(w.id),onRename:t=>renameWidget(w.id,t),position:w.position,registerRef:(getPos)=>widgetRefs.current[w.id]=getPos,glassButtonStyle};
        switch(w.type){
          case 'stoplight': return <Stoplight {...commonProps}/>;
          case 'clock': return <ClockWidget {...commonProps}/>;
          case 'timer': return <TimerWidget {...commonProps}/>;
          case 'poll': return <PollWidget {...commonProps}/>;
          case 'dice': return <DiceWidget {...commonProps}/>;
          case 'namepicker': return <NamePickerWidget {...commonProps}/>;
         // case 'image': return <ImageWidget {...commonProps}/>;
          case 'conversion': return <ConversionWidget {...commonProps}/>;
          default: return null;
        }
      })}

      {/* Bottom Bar */}
      <div style={{
        position:'absolute',
        bottom:0,
        left:0,
        right:0,
        background:'rgba(255,255,255,0.25)',
        borderTop:'1px solid rgba(255,255,255,0.4)',
        backdropFilter:'blur(10px)',
        WebkitBackdropFilter:'blur(10px)',
        padding:6,
        transition:'all 0.3s ease',
        display:'flex',
        flexDirection:'column',
        alignItems:'center'
      }}>
        <div style={{ display:'flex', width:'100%', justifyContent:'flex-start', alignItems:'center', marginBottom: barMinimized ? 0 : 6, gap:12 }}>
          <button style={{...glassButtonStyle,borderRadius:'20px', padding:'4px 10px'}} onClick={()=>setBarMinimized(m=>!m)}>
            {barMinimized ? '▲' : '▼'}
          </button>
          <span style={{ fontWeight:600, fontSize:16 }}>OpenClassScreen</span>
        </div>
        {!barMinimized && (
          <div style={{ display:'flex', justifyContent:'center', gap:'12px', flexWrap:'wrap', width:'100%' }}>
            {['stoplight','clock','timer','poll','dice','namepicker','conversion'].map(t=><button key={t} style={glassButtonStyle} onClick={()=>addWidget(t)}>Add {t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
          </div>
        )}
      </div>
    </div>
  );
}

// import React, { useEffect, useRef, useState } from 'react';

// // --- Draggable Hook ---
// function useDraggable(initial = { x: 40, y: 40 }) {
//   const ref = useRef(null);
//   const posRef = useRef({ x: initial.x, y: initial.y });
//   const [, setTick] = useState(0);

//   useEffect(() => {
//     const el = ref.current;
//     if (!el) return;
//     let dragging = false;
//     let start = { x: 0, y: 0 };

//     function onDown(e) {
//       dragging = true;
//       const clientX = e.touches ? e.touches[0].clientX : e.clientX;
//       const clientY = e.touches ? e.touches[0].clientY : e.clientY;
//       start = { x: clientX, y: clientY };
//       document.body.style.userSelect = 'none';
//     }

//     function onMove(e) {
//       if (!dragging) return;
//       const clientX = e.touches ? e.touches[0].clientX : e.clientX;
//       const clientY = e.touches ? e.touches[0].clientY : e.clientY;
//       const dx = clientX - start.x;
//       const dy = clientY - start.y;
//       start = { x: clientX, y: clientY };
//       posRef.current.x += dx;
//       posRef.current.y += dy;
//       el.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
//       setTick(t => t + 1);
//     }

//     function onUp() {
//       dragging = false;
//       document.body.style.userSelect = '';
//     }

//     el.addEventListener('mousedown', onDown);
//     el.addEventListener('touchstart', onDown, { passive: true });
//     window.addEventListener('mousemove', onMove);
//     window.addEventListener('touchmove', onMove, { passive: false });
//     window.addEventListener('mouseup', onUp);
//     window.addEventListener('touchend', onUp);

//     el.style.position = 'absolute';
//     el.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;

//     return () => {
//       el.removeEventListener('mousedown', onDown);
//       el.removeEventListener('touchstart', onDown);
//       window.removeEventListener('mousemove', onMove);
//       window.removeEventListener('touchmove', onMove);
//       window.removeEventListener('mouseup', onUp);
//       window.removeEventListener('touchend', onUp);
//     };
//   }, []);

//   return { ref, getPosition: () => posRef.current };
// }

// // --- Generic Widget Wrapper ---
// function WidgetWrapper({ title, children, onRemove, onRename }) {
//   const [editing, setEditing] = useState(false);
//   const [name, setName] = useState(title);

//   const styles = {
//     wrapper: { padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.8)', border: '1px solid #ccc', position: 'absolute', minWidth: '160px', color: 'black' },
//     header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
//     title: { fontWeight: '600', cursor: 'pointer' },
//     input: { border: '1px solid #ccc', borderRadius: '4px', padding: '2px 4px', fontSize: '12px' },
//     close: { fontSize: '8px', padding: '0 4px', marginLeft: '8px', border: '1px solid #aaa', borderRadius: '4px', cursor: 'pointer' }
//   };

//   return (
//     <div style={styles.wrapper}>
//       <div style={styles.header}>
//         {editing ? (
//           <input value={name} onChange={e => setName(e.target.value)} onBlur={() => { setEditing(false); onRename && onRename(name); }} style={styles.input} autoFocus />
//         ) : (
//           <div style={styles.title} onClick={() => setEditing(true)}>{name}</div>
//         )}
//         <button onClick={onRemove} style={styles.close}>✕</button>
//       </div>
//       {children}
//     </div>
//   );
// }

// // --- Widgets ---
// function Stoplight({ onRemove, onRename, position, registerRef }) {
//   const [color, setColor] = useState('red');
//   const { ref, getPosition } = useDraggable(position || { x: 80, y: 80 });
//   useEffect(()=>{if(registerRef)registerRef(getPosition)},[getPosition,registerRef]);
//   const circleStyle=(c)=>({ width:'40px', height:'40px', borderRadius:'50%', border:'2px solid #333', margin:'8px 0', cursor:'pointer', backgroundColor:c===color?c:'#666' });
//   const boxStyle={ width:'70px', padding:'10px', backgroundColor:'#222', border:'3px solid #333', borderRadius:'12px', display:'flex', flexDirection:'column', alignItems:'center' };
//   return <div ref={ref}><WidgetWrapper title="Stoplight" onRemove={onRemove} onRename={onRename}><div style={boxStyle}><div onClick={()=>setColor('red')} style={circleStyle('red')} /><div onClick={()=>setColor('yellow')} style={circleStyle('yellow')} /><div onClick={()=>setColor('green')} style={circleStyle('green')} /></div><div style={{ marginTop:'8px', fontSize:'14px' }}>Active: <b>{color}</b></div></WidgetWrapper></div>;
// }

// function ClockWidget({ onRemove, onRename, position, registerRef }) {
//   const [now,setNow] = useState(new Date());
//   const { ref, getPosition } = useDraggable(position || { x:320, y:80 });
//   useEffect(()=>{if(registerRef)registerRef(getPosition)},[getPosition,registerRef]);
//   useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(t)},[]);
//   return <div ref={ref}><WidgetWrapper title="Clock" onRemove={onRemove} onRename={onRename}><div style={{ fontSize:'24px', fontFamily:'monospace'}}>{now.toLocaleTimeString()}</div><div style={{ fontSize:'12px', color:'#555'}}>{now.toLocaleDateString()}</div></WidgetWrapper></div>;
// }

// function TimerWidget({ onRemove, onRename, position, registerRef }) {
//   const [running,setRunning]=useState(false);
//   const [secondsLeft,setSecondsLeft]=useState(5*60);
//   const { ref, getPosition } = useDraggable(position || { x:80, y:260 });
//   const intervalRef = useRef(null);
//   useEffect(()=>{if(registerRef)registerRef(getPosition)},[getPosition,registerRef]);
//   useEffect(()=>{if(running){intervalRef.current=setInterval(()=>setSecondsLeft(s=>{if(s<=1){clearInterval(intervalRef.current);setRunning(false);return 0} return s-1}),1000)} return ()=>clearInterval(intervalRef.current)},[running]);
//   const format=s=>{const mm=Math.floor(s/60).toString().padStart(2,'0'); const ss=(s%60).toString().padStart(2,'0'); return `${mm}:${ss}`};
//   const parseTime=str=>{const p=str.split(':');let mm=0,ss=0;if(p.length===2){mm=parseInt(p[0])||0;ss=parseInt(p[1])||0;}else mm=parseInt(p[0])||0;return mm*60+ss};
//   return <div ref={ref}><WidgetWrapper title="Timer" onRemove={onRemove} onRename={onRename}><input value={format(secondsLeft)} onChange={e=>setSecondsLeft(Math.max(0,parseTime(e.target.value)))} style={{fontSize:'28px', textAlign:'center', fontFamily:'monospace', width:'100px'}} /><div style={{ display:'flex', gap:'8px', marginTop:'8px', justifyContent:'center'}}><button onClick={()=>setRunning(r=>!r)}>{running?'Pause':'Start'}</button><button onClick={()=>{clearInterval(intervalRef.current);setRunning(false);setSecondsLeft(0)}}>Reset</button></div><div style={{ display:'flex', gap:'6px', marginTop:'8px', justifyContent:'center'}}><button onClick={()=>setSecondsLeft(prev=>Math.max(0,prev-60))}>-1m</button><button onClick={()=>setSecondsLeft(prev=>prev+60)}>+1m</button></div></WidgetWrapper></div>;
// }

// // Poll widget
// function PollWidget({ onRemove, onRename, position, registerRef }) {
//   const { ref, getPosition } = useDraggable(position || { x:200, y:200 });
//   useEffect(()=>{if(registerRef)registerRef(getPosition)},[getPosition,registerRef]);
//   const [options,setOptions]=useState(["Option 1","Option 2"]);
//   const [votes,setVotes]=useState({});
//   const [newOption,setNewOption]=useState('');
//   const vote=(opt)=>setVotes(v=>({...v,[opt]:(v[opt]||0)+1}));
//   const addOption=()=>{if(newOption){setOptions(prev=>[...prev,newOption]);setNewOption('');}};
//   return <div ref={ref}><WidgetWrapper title="Poll" onRemove={onRemove} onRename={onRename}><div>{options.map(o=><div key={o} style={{margin:'4px 0'}}><button onClick={()=>vote(o)}>{o}</button> : {votes[o]||0}</div>)}</div><div style={{marginTop:'4px'}}><input value={newOption} onChange={e=>setNewOption(e.target.value)} placeholder="New option"/><button onClick={addOption}>Add</button></div></WidgetWrapper></div>;
// }

// // Dice widget
// function DiceWidget({ onRemove, onRename, position, registerRef }) {
//   const { ref, getPosition } = useDraggable(position || { x:400, y:200 });
//   useEffect(()=>{if(registerRef)registerRef(getPosition)},[getPosition,registerRef]);
//   const [value,setValue]=useState(1);
//   return <div ref={ref}><WidgetWrapper title="Dice" onRemove={onRemove} onRename={onRename}><div style={{ fontSize:'36px', textAlign:'center' }}>{value}</div><button onClick={()=>setValue(Math.floor(Math.random()*6)+1)}>Roll</button></WidgetWrapper></div>;
// }

// // NamePicker widget
// function NamePickerWidget({ onRemove, onRename, position, registerRef }) {
//   const { ref, getPosition } = useDraggable(position || { x:400, y:300 });
//   useEffect(()=>{if(registerRef)registerRef(getPosition)},[getPosition,registerRef]);
//   const [names,setNames]=useState(['Alice','Bob','Charlie']);
//   const [selected,setSelected]=useState('');
//   const pick=()=>{if(names.length>0)setSelected(names[Math.floor(Math.random()*names.length)])};
//   return <div ref={ref}><WidgetWrapper title="Name Picker" onRemove={onRemove} onRename={onRename}><input value={names.join(',')} onChange={e=>setNames(e.target.value.split(','))} /><button onClick={pick}>Pick</button><div>{selected}</div></WidgetWrapper></div>;
// }

// // Image widget
// function ImageWidget({ onRemove, onRename, position, registerRef }) {
//   const { ref, getPosition } = useDraggable(position || { x:500, y:100 });
//   useEffect(()=>{if(registerRef)registerRef(getPosition)},[getPosition,registerRef]);
//   const [url,setUrl]=useState('');
//   return <div ref={ref}><WidgetWrapper title="Image" onRemove={onRemove} onRename={onRename}><input placeholder="Image URL" value={url} onChange={e=>setUrl(e.target.value)} style={{width:'100%'}}/>{url && <img src={url} alt="widget" style={{ width:'100%', maxHeight:'150px', objectFit:'contain'}} />}</WidgetWrapper></div>;
// }

// // Conversion widget
// function ConversionWidget({ onRemove, onRename, position, registerRef }) {
//   const { ref, getPosition } = useDraggable(position || { x:500, y:250 });
//   useEffect(()=>{if(registerRef)registerRef(getPosition)},[getPosition,registerRef]);
//   const [value,setValue]=useState(0);
//   const [unit,setUnit]=useState('cups');
//   const [result,setResult]=useState(0);
//   const densities={flour:120, sugar:200, cocoa:125};
//   useEffect(()=>{setResult(unit==='grams'?value*densities['flour']:value)},[value,unit]);
//   return <div ref={ref}><WidgetWrapper title="Conversion" onRemove={onRemove} onRename={onRename}><input type="number" value={value} onChange={e=>setValue(Number(e.target.value))}/><select value={unit} onChange={e=>setUnit(e.target.value)}><option value="cups">cups</option><option value="grams">grams</option></select><div>Result: {result}</div></WidgetWrapper></div>;
// }

// // --- Main Component ---
// export default function ClassroomScreen() {
//   const [bgUrl,setBgUrl]=useState('');
//   const [bgColor,setBgColor]=useState('#800cb6ff');
//   const [widgets,setWidgets]=useState([]);
//   const [settingsOpen,setSettingsOpen]=useState(false);
//   const [barMinimized,setBarMinimized]=useState(false);
//   const [saveName,setSaveName]=useState('');
//   const widgetRefs = useRef({});

//   useEffect(()=>{
//     const saved=localStorage.getItem('classroomScreen');
//     if(saved){
//       const data=JSON.parse(saved);
//       setWidgets(data.widgets||[]);
//       setBgUrl(data.bgUrl||'');
//       setBgColor(data.bgColor||'#800cb6ff');
//     }
//   },[]);

//   const addWidget=(type)=>setWidgets(prev=>[...prev,{id:Date.now(),type,title:type.charAt(0).toUpperCase()+type.slice(1)}]);
//   const removeWidget=(id)=>setWidgets(prev=>prev.filter(w=>w.id!==id));
//   const renameWidget=(id,newTitle)=>setWidgets(prev=>prev.map(w=>w.id===id?{...w,title:newTitle}:w));

//   const glassButtonStyle={ background:"rgba(255,255,255,0.25)", border:"1px solid rgba(255,255,255,0.4)", borderRadius:"8px", padding:"6px 12px", color:"#000", fontWeight:"500", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", boxShadow:"0 2px 6px rgba(0,0,0,0.15)", cursor:"pointer", transition:"all 0.2s ease" };

//   const saveNamedScreen=(name)=>{
//     if(!name) return alert('Provide a name!');
//     const widgetsWithPos = widgets.map(w=>{const getPos=widgetRefs.current[w.id]; const pos=getPos?getPos():w.position||{x:40,y:40}; return {...w,position:pos}});
//     const data={widgets:widgetsWithPos,bgUrl,bgColor};
//     const savedScreens=JSON.parse(localStorage.getItem('namedScreens')||'{}');
//     savedScreens[name]=data;
//     localStorage.setItem('namedScreens',JSON.stringify(savedScreens));
//     alert(`Screen saved as "${name}"`);
//   };

//   const loadNamedScreen=(name)=>{const savedScreens=JSON.parse(localStorage.getItem('namedScreens')||'{}'); const data=savedScreens[name]; if(!data)return alert(`No saved screen found: ${name}`); setWidgets(data.widgets||[]); setBgUrl(data.bgUrl||''); setBgColor(data.bgColor||'#800cb6ff');};
//   const deleteNamedScreen=(name)=>{const savedScreens=JSON.parse(localStorage.getItem('namedScreens')||'{}'); delete savedScreens[name]; localStorage.setItem('namedScreens',JSON.stringify(savedScreens)); setSaveName('');};
//   const getSavedScreenNames=()=>Object.keys(JSON.parse(localStorage.getItem('namedScreens')||'{}'));

//   const handleFile=(file)=>{if(!file)return; setBgUrl(URL.createObjectURL(file));};

//   return (
//     <div style={{height:'100vh', width:'100vw', position:'relative', overflow:'hidden'}}>
//       <div style={{position:'absolute', inset:0, zIndex:-1, backgroundColor:bgColor, backgroundImage:bgUrl?`url(${bgUrl})`:'', backgroundSize:'cover', backgroundPosition:'center'}} />

//       {/* Settings */}
//       <div style={{position:'absolute', top:8, right:8}}>
//         <button style={{...glassButtonStyle, borderRadius:'50%', width:40, height:40}} onClick={()=>setSettingsOpen(o=>!o)}>⚙</button>
//         {settingsOpen && (
//           <div style={{color:'black',position:'absolute', top:44, right:0, background:'rgba(255,255,255,0.95)', border:'1px solid #ccc', borderRadius:8, padding:12, width:260}}>
//             <label>Background Color:</label>
//             <input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)} style={{width:'100%', marginBottom:6}} />
//             <label>Or Upload Image:</label>
//             <input type="file" accept="image/*" onChange={e=>handleFile(e.target.files[0])} style={{width:'100%', marginBottom:6}} />
//             {bgUrl && <button style={{...glassButtonStyle,width:'100%', marginBottom:6}} onClick={()=>setBgUrl('')}>Clear Background Image</button>}
//             <br></br>
//             <input type="text" placeholder="Save name..." value={saveName} onChange={e=>setSaveName(e.target.value)} style={{width:'100%',marginBottom:6}}/>
//             <button style={glassButtonStyle} onClick={()=>saveNamedScreen(saveName)}>Save Screen</button>
//             <div style={{marginTop:12}}>
//               <div style={{fontWeight:600, marginBottom:4}}>Load/Delete Saved Screens:</div>
//               {getSavedScreenNames().map(name=>(
//                 <div key={name} style={{display:'flex', gap:'4px', marginBottom:4}}>
//                   <button style={{...glassButtonStyle,flex:1}} onClick={()=>loadNamedScreen(name)}>{name}</button>
//                   <button style={{...glassButtonStyle}} onClick={()=>deleteNamedScreen(name)}>✕</button>
//                 </div>
//               ))}
//             </div>
//             <button style={{...glassButtonStyle, marginTop:12, width:'100%'}} onClick={()=>{setWidgets([]); setBgUrl(''); setBgColor('#800cb6ff'); localStorage.removeItem('classroomScreen')}}>Reset Layout</button>
//           </div>
//         )}
//       </div>

//       {/* Widgets */}
//       {widgets.map(w=>{
//         const commonProps={key:w.id,onRemove:()=>removeWidget(w.id),
//           onRename:t=>renameWidget(w.id,t),
//           position:w.position,
//           registerRef:(getPos)=>widgetRefs.current[w.id]=getPos};
//         switch(w.type){
//           case 'stoplight': return <Stoplight {...commonProps}/>;
//           case 'clock': return <ClockWidget {...commonProps}/>;
//           case 'timer': return <TimerWidget {...commonProps}/>;
//           case 'poll': return <PollWidget {...commonProps}/>;
//           case 'dice': return <DiceWidget {...commonProps}/>;
//           case 'namepicker': return <NamePickerWidget {...commonProps}/>;
//           case 'image': return <ImageWidget {...commonProps}/>;
//           case 'conversion': return <ConversionWidget {...commonProps}/>;
//           default: return null;
//         }
//       })}

//       {/* Bottom Bar */}
//       <div style={{
//         position:'absolute',
//         bottom:0,
//         left:0,
//         right:0,
//         background:'rgba(255,255,255,0.25)',
//         borderTop:'1px solid rgba(255,255,255,0.4)',
//         backdropFilter:'blur(10px)',
//         WebkitBackdropFilter:'blur(10px)',
//         padding:6,
//         transition:'all 0.3s ease',
//         display:'flex',
//         flexDirection:'column',
//         alignItems:'center'
//       }}>
//         <div style={{ display:'flex', width:'100%', justifyContent:'flex-start', alignItems:'center', marginBottom: barMinimized ? 0 : 6, gap:12 }}>
//           <button style={{...glassButtonStyle,borderRadius:'20px', padding:'4px 10px'}} onClick={()=>setBarMinimized(m=>!m)}>
//             {barMinimized ? '▲' : '▼'}
//           </button>
//           <span style={{ fontWeight:600, fontSize:16 }}>OpenClassScreen</span>
//         </div>
//         {!barMinimized && (
//           <div style={{ display:'flex', justifyContent:'center', gap:'12px', flexWrap:'wrap', width:'100%' }}>
//             {['stoplight','clock','timer','poll','dice','namepicker','image','conversion'].map(t=><button key={t} style={glassButtonStyle} onClick={()=>addWidget(t)}>Add {t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

