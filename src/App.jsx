import React, { useEffect, useRef, useState } from 'react';

// --- Utility: simple drag hook ---
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

  return { ref };
}

// --- Generic Widget Wrapper ---
function WidgetWrapper({ title, children, onRemove, onRename }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(title);

  const styles = {
    wrapper: {
      padding: '12px',
      borderRadius: '8px',
      background: 'rgba(255,255,255,0.8)',
      border: '1px solid #ccc',
      position: 'absolute',
      minWidth: '160px',
      color: 'black'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    },
    title: { fontWeight: '600', cursor: 'pointer' },
    input: { border: '1px solid #ccc', borderRadius: '4px', padding: '2px 4px', fontSize: '14px' },
    close: { fontSize: '12px', padding: '0 4px', marginLeft: '8px', border: '1px solid #aaa', borderRadius: '4px', cursor: 'pointer' }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => { setEditing(false); onRename && onRename(name); }}
            style={styles.input}
            autoFocus
          />
        ) : (
          <div style={styles.title} onClick={() => setEditing(true)}>{name}</div>
        )}
        <button onClick={onRemove} style={styles.close}>✕</button>
      </div>
      {children}
    </div>
  );
}

// --- Stoplight Widget ---
function Stoplight({ onRemove, onRename }) {
  const [color, setColor] = useState('red');
  const { ref } = useDraggable({ x: 80, y: 80 });

  const circleStyle = (c) => ({
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid #333',
    margin: '6px 0',
    cursor: 'pointer',
    backgroundColor: c === color ? c : '#666'
  });

  return (
    <div ref={ref}>
      <WidgetWrapper title="Stoplight" onRemove={onRemove} onRename={onRename}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div onClick={() => setColor('red')} style={circleStyle('red')} />
          <div onClick={() => setColor('yellow')} style={circleStyle('yellow')} />
          <div onClick={() => setColor('green')} style={circleStyle('green')} />
        </div>
        <div style={{ marginTop: '8px', fontSize: '14px' }}>Active: <b>{color}</b></div>
      </WidgetWrapper>
    </div>
  );
}

// --- Clock Widget ---
function ClockWidget({ onRemove, onRename }) {
  const [now, setNow] = useState(new Date());
  const { ref } = useDraggable({ x: 320, y: 80 });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div ref={ref}>
      <WidgetWrapper title="Clock" onRemove={onRemove} onRename={onRename}>
        <div style={{ fontSize: '24px', fontFamily: 'monospace' }}>{now.toLocaleTimeString()}</div>
        <div style={{ fontSize: '12px', color: '#555' }}>{now.toLocaleDateString()}</div>
      </WidgetWrapper>
    </div>
  );
}

// --- Timer Widget ---
function TimerWidget({ onRemove, onRename }) {
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);
  const [initialSeconds, setInitialSeconds] = useState(5 * 60);
  const { ref } = useDraggable({ x: 80, y: 260 });
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const format = (s) => {
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  function applyMinutes(m) {
    const sec = Math.max(0, Math.floor(Number(m) || 0) * 60);
    setSecondsLeft(sec);
    setInitialSeconds(sec);
  }

  return (
    <div ref={ref}>
      <WidgetWrapper title="Timer" onRemove={onRemove} onRename={onRename}>
        <div style={{ fontSize: '28px', textAlign: 'center', fontFamily: 'monospace' }}>{format(secondsLeft)}</div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button onClick={() => setRunning(r => !r)}>{running ? 'Pause' : 'Start'}</button>
          <button onClick={() => { clearInterval(intervalRef.current); setRunning(false); setSecondsLeft(initialSeconds); }}>Reset</button>
        </div>
        <div style={{ fontSize: '12px', marginTop: '6px' }}>Set minutes:</div>
        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
          <input defaultValue={Math.floor(initialSeconds/60)} onBlur={(e)=>applyMinutes(e.target.value)} type="number" min="0" style={{ width: '50px' }} />
          <button onClick={()=>{ setSecondsLeft(prev => prev + 60); setInitialSeconds(prev => prev + 60); }}>+1m</button>
        </div>
      </WidgetWrapper>
    </div>
  );
}

// --- Poll Widget ---
function PollWidget({ onRemove, onRename }) {
  const { ref } = useDraggable({ x: 200, y: 200 });
  const [options, setOptions] = useState(["Option 1", "Option 2"]);
  const [votes, setVotes] = useState(() => options.map(() => 0));
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    // Keep votes array in sync with options length
    setVotes(v => {
      if (v.length === options.length) return v;
      if (v.length < options.length) return [...v, ...Array(options.length - v.length).fill(0)];
      return v.slice(0, options.length);
    });
  }, [options]);

  const vote = (i) => {
    setVotes(v => v.map((val, idx) => idx === i ? val + 1 : val));
  };

  const addOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed) return;
    setOptions(o => [...o, trimmed]);
    setNewOption('');
  };

  const removeOption = (index) => {
    setOptions(o => o.filter((_, i) => i !== index));
    setVotes(v => v.filter((_, i) => i !== index));
  };

  const updateOption = (index, value) => {
    setOptions(o => o.map((opt, i) => i === index ? value : opt));
  };

  return (
    <div ref={ref}>
      <WidgetWrapper title="Poll" onRemove={onRemove} onRename={onRename}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input value={opt} onChange={(e) => updateOption(i, e.target.value)} style={{ flex: 1 }} />
              <button onClick={() => vote(i)}>Vote</button>
              <div style={{ minWidth: '60px', textAlign: 'right' }}>{votes[i]} votes</div>
              <button onClick={() => removeOption(i)} style={{ marginLeft: '6px' }}>Remove</button>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <input placeholder="New option" value={newOption} onChange={(e) => setNewOption(e.target.value)} style={{ flex: 1 }} />
            <button onClick={addOption}>Add</button>
          </div>
        </div>
      </WidgetWrapper>
    </div>
  );
}

// --- Background Controls ---
function BackgroundControls({ onSetUrl, onFile, onColor, color }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.8)', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', width: '220px', color: 'black' }}>
      <div style={{ fontWeight: '600', marginBottom: '6px' }}>Background</div>
      <input placeholder="Image URL" onKeyDown={(e)=>{ if(e.key==='Enter') onSetUrl(e.target.value); }} style={{ width: '100%', marginBottom: '6px' }} />
      <div style={{ fontSize: '12px' }}>Or upload an image:</div>
      <input type="file" accept="image/*" onChange={(e)=>onFile(e.target.files && e.target.files[0])} style={{ marginBottom: '6px' }} />
      <div style={{ fontSize: '12px' }}>Or pick a background color:</div>
      <input type="color" value={color} onChange={(e)=>onColor(e.target.value)} style={{ marginTop: '4px', width: '48px', height: '32px', padding: 0 }} />
      <button onClick={()=>onSetUrl('')} style={{ display: 'block', marginTop: '8px' }}>Clear</button>
    </div>
  );
}

// --- Main app ---
export default function ClassroomScreen() {
  const [bgUrl, setBgUrl] = useState('');
  const [bgFileObjectUrl, setBgFileObjectUrl] = useState(null);
  const [bgColor, setBgColor] = useState('#800cb6ff');

  const [widgets, setWidgets] = useState([]);

  useEffect(()=>{
    return ()=>{
      if(bgFileObjectUrl) URL.revokeObjectURL(bgFileObjectUrl);
    };
  }, [bgFileObjectUrl]);

  function handleFile(file){
    if(!file) return;
    const url = URL.createObjectURL(file);
    setBgFileObjectUrl(url);
    setBgUrl(url);
  }

  function addWidget(type){
    setWidgets(prev => [...prev, { id: Date.now(), type, title: type.charAt(0).toUpperCase() + type.slice(1) }]);
  }

  function removeWidget(id){
    setWidgets(prev => prev.filter(w => w.id !== id));
  }

  function renameWidget(id, newTitle){
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, title: newTitle } : w));
  }

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
        {bgUrl ? (
          <div style={{ width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${bgUrl})` }} />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: bgColor }} />
        )}
      </div>

      <div style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <BackgroundControls onSetUrl={(u)=>setBgUrl(u)} onFile={handleFile} onColor={(c)=>setBgColor(c)} color={bgColor} />
        <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: '14px', color: '#000000' }}>
          <div style={{ fontWeight: '600' }}>Classroom Screen</div>
          <div>Drag widgets to arrange the screen for your class.</div>
        </div>
      </div>

      {widgets.map(w => (
        w.type === 'stoplight' ? <Stoplight key={w.id} onRemove={()=>removeWidget(w.id)} onRename={(title)=>renameWidget(w.id,title)} /> :
        w.type === 'clock' ? <ClockWidget key={w.id} onRemove={()=>removeWidget(w.id)} onRename={(title)=>renameWidget(w.id,title)} /> :
        w.type === 'timer' ? <TimerWidget key={w.id} onRemove={()=>removeWidget(w.id)} onRename={(title)=>renameWidget(w.id,title)} /> :
        w.type === 'poll' ? <PollWidget key={w.id} onRemove={()=>removeWidget(w.id)} onRename={(title)=>renameWidget(w.id,title)} /> : null
      ))}

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.7)', borderTop: '1px solid #ccc', padding: '8px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <button onClick={()=>addWidget('stoplight')}>Add Stoplight</button>
        <button onClick={()=>addWidget('clock')}>Add Clock</button>
        <button onClick={()=>addWidget('timer')}>Add Timer</button>
        <button onClick={()=>addWidget('poll')}>Add Poll</button>
      </div>
    </div>
  );
}
