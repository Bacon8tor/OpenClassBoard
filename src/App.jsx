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
    input: { border: '1px solid #ccc', borderRadius: '4px', padding: '2px 4px', fontSize: '12px' },
    close: { fontSize: '8px', padding: '0 4px', marginLeft: '8px', border: '1px solid #aaa', borderRadius: '4px', cursor: 'pointer' }
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
    margin: '8px 0',
    cursor: 'pointer',
    backgroundColor: c === color ? c : '#666'
  });

  const boxStyle = {
    width: '70px',
    padding: '10px',
    backgroundColor: '#222',
    border: '3px solid #333',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };

  return (
    <div ref={ref}>
      <WidgetWrapper title="Stoplight" onRemove={onRemove} onRename={onRename}>
        <div style={boxStyle}>
          <div onClick={() => setColor('red')} style={circleStyle('red')} />
          <div onClick={() => setColor('yellow')} style={circleStyle('yellow')} />
          <div onClick={() => setColor('green')} style={circleStyle('green')} />
        </div>
        <div style={{ marginTop: '8px', fontSize: '14px' }}>
          Active: <b>{color}</b>
        </div>
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

  const parseTime = (str) => {
    const parts = str.split(':');
    let mm = 0, ss = 0;
    if (parts.length === 2) {
      mm = parseInt(parts[0]) || 0;
      ss = parseInt(parts[1]) || 0;
    } else {
      mm = parseInt(parts[0]) || 0;
    }
    return mm * 60 + ss;
  };

  const handleManualChange = (e) => {
    const sec = parseTime(e.target.value);
    setSecondsLeft(Math.max(0, sec));
  };

  return (
    <div ref={ref}>
      <WidgetWrapper title="Timer" onRemove={onRemove} onRename={onRename}>
        {/* Editable timer display */}
        <input
          value={format(secondsLeft)}
          onChange={handleManualChange}
          style={{
            fontSize: '28px',
            textAlign: 'center',
            fontFamily: 'monospace',
            width: '100px'
          }}
        />

        {/* Controls */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'center' }}>
          <button onClick={() => setRunning(r => !r)}>{running ? 'Pause' : 'Start'}</button>
          <button onClick={() => { clearInterval(intervalRef.current); setRunning(false); setSecondsLeft(0); }}>Reset</button>
        </div>

        {/* Adjust time */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', justifyContent: 'center' }}>
          <button onClick={() => setSecondsLeft(prev => Math.max(0, prev - 60))}>-1m</button>
          <button onClick={() => setSecondsLeft(prev => prev + 60)}>+1m</button>
        </div>
      </WidgetWrapper>
    </div>
  );
}

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

// --- Dice Roll Widget ---
function DiceWidget({ onRemove, onRename }) {
  const { ref } = useDraggable({ x: 200, y: 200 });
  const [sides, setSides] = useState(6);   // number of sides
  const [count, setCount] = useState(1);   // number of dice
  const [results, setResults] = useState([1]);

  const rollDice = () => {
    const newResults = Array.from({ length: count }, () =>
      Math.floor(Math.random() * sides) + 1
    );
    setResults(newResults);
  };

  const diceStyle = {
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    borderRadius: '8px',
    backgroundColor: '#fff',
    border: '2px solid #333',
    margin: '6px',
    userSelect: 'none'
  };

  return (
    <div ref={ref}>
      <WidgetWrapper title="Dice" onRemove={onRemove} onRename={onRename}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {results.map((val, i) => (
            <div key={i} style={diceStyle}>{val}</div>
          ))}
        </div>

        <button onClick={rollDice} style={{ display: 'block', margin: '8px auto' }}>Roll</button>

        <div style={{ marginTop: '8px', fontSize: '14px', textAlign: 'center' }}>
          <label>
            Dice: <input
              type="number"
              min="1"
              value={count}
              onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
              style={{ width: '50px', marginLeft: '4px' }}
            />
          </label>
          <br />
          <label>
            Sides: <input
              type="number"
              min="2"
              value={sides}
              onChange={(e) => setSides(Math.max(2, Number(e.target.value)))}
              style={{ width: '50px', marginLeft: '4px' }}
            />
          </label>
        </div>
      </WidgetWrapper>
    </div>
  );
}

// --- Name Picker Widget ---
function NamePickerWidget({ onRemove, onRename }) {
  const { ref } = useDraggable({ x: 200, y: 300 });
  const [inputText, setInputText] = useState('');
  const [names, setNames] = useState([]);
  const [picked, setPicked] = useState(null);
  const [excludePicked, setExcludePicked] = useState(false);

  const loadNames = () => {
    const list = inputText
      .split(',')
      .map(n => n.trim())
      .filter(n => n.length > 0);
    setNames(list);
    setPicked(null);
  };

  const pickRandom = () => {
    if (names.length === 0) return;

    const choice = names[Math.floor(Math.random() * names.length)];
    setPicked(choice);

    if (excludePicked) {
      setNames(prev => prev.filter(n => n !== choice));
    }
  };

  return (
    <div ref={ref}>
      <WidgetWrapper title="Name Picker" onRemove={onRemove} onRename={onRename}>
        <textarea
          placeholder="Enter names, separated by commas"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={3}
          style={{ width: '100%', marginBottom: '8px' }}
        />

        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <button onClick={loadNames}>Load Names</button>
          <button onClick={pickRandom} disabled={names.length === 0}>Pick Random</button>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
          <input
            type="checkbox"
            checked={excludePicked}
            onChange={(e) => setExcludePicked(e.target.checked)}
          />
          Exclude already picked names
        </label>

        {picked && (
          <div style={{
            marginTop: '8px',
            padding: '8px',
            background: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '6px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            🎉 {picked} 🎉
          </div>
        )}
      </WidgetWrapper>
    </div>
  );
}

// --- Image Widget (Resizable with Drag Handle) ---
function ImageWidget({ onRemove, onRename }) {
  const { ref } = useDraggable({ x: 250, y: 150 });
  const [imgSrc, setImgSrc] = useState('');
  const [size, setSize] = useState({ width: 200, height: 200 });
  const resizingRef = useRef(false);

  const handleFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImgSrc(url);
  };

  // mouse events for resizing
  useEffect(() => {
    const onMove = (e) => {
      if (!resizingRef.current) return;
      setSize(prev => ({
        width: Math.max(50, e.clientX - ref.current.getBoundingClientRect().left),
        height: Math.max(50, e.clientY - ref.current.getBoundingClientRect().top)
      }));
    };

    const onUp = () => {
      resizingRef.current = false;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <div ref={ref}>
      <WidgetWrapper title="Image" onRemove={onRemove} onRename={onRename}>
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            border: '1px solid #ccc',
            borderRadius: '6px',
            overflow: 'hidden'
          }}
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt="Widget"
              style={{
                width: `${size.width}px`,
                height: `${size.height}px`,
                display: 'block',
                objectFit: 'contain',
                background: '#fff'
              }}
            />
          ) : (
            <div
              style={{
                width: `${size.width}px`,
                height: `${size.height}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed #aaa',
                color: '#555',
                fontSize: '14px',
                background: '#fafafa'
              }}
            >
              No image loaded
            </div>
          )}

          {/* Resize handle */}
          <div
            onMouseDown={() => (resizingRef.current = true)}
            style={{
              width: '16px',
              height: '16px',
              position: 'absolute',
              right: '0',
              bottom: '0',
              cursor: 'se-resize',
              background: 'rgba(0,0,0,0.3)',
              borderTopLeftRadius: '4px'
            }}
          ></div>
        </div>

        {/* Controls */}
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <input
            type="text"
            placeholder="Image URL"
            onKeyDown={(e) => {
              if (e.key === 'Enter') setImgSrc(e.target.value);
            }}
            style={{ width: '100%' }}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files && e.target.files[0])}
          />
        </div>
      </WidgetWrapper>
    </div>
  );
}

// --- Conversion Widget with Liquid / Powder Selector ---
function ConversionWidget({ onRemove, onRename }) {
  const { ref } = useDraggable({ x: 300, y: 200 });
  const [inputValue, setInputValue] = useState('');
  const [fromUnit, setFromUnit] = useState('cups');
  const [toUnit, setToUnit] = useState('ml');
  const [ingredient, setIngredient] = useState('liquid'); // liquid, flour, sugar, cocoa
  const [result, setResult] = useState(null);

  const powderDensities = { flour: 120, sugar: 200, cocoa: 125 }; // grams per cup

  const baseConversion = {
    cups: { ml: 240, tbsp: 16, tsp: 48, oz: 8, g: 240, lb: 0.53, kg: 0.24 },
    tbsp: { ml: 15, cups: 1/16, tsp: 3, oz: 0.5, g: 15, lb: 0.033, kg: 0.015 },
    tsp: { ml: 5, cups: 1/48, tbsp: 1/3, oz: 0.1667, g: 5, lb: 0.011, kg: 0.005 },
    ml: { cups: 1/240, tbsp: 1/15, tsp: 1/5, oz: 0.0338, g: 1, lb: 0.0022, kg: 0.001 },
    oz: { cups: 1/8, tbsp: 2, tsp: 6, ml: 29.5735, g: 28.35, lb: 1/16, kg: 0.02835 },
    g: { cups: 1/240, tbsp: 1/15, tsp: 1/5, ml: 1, oz: 1/28.35, lb: 0.0022, kg: 0.001 },
    lb: { cups: 1/0.53, tbsp: 1/0.033, tsp: 1/0.011, ml: 453.6, oz: 16, g: 453.6, kg: 0.4536 },
    kg: { cups: 1/0.24, tbsp: 1/0.015, tsp: 1/0.005, ml: 1000, oz: 35.274, g: 1000, lb: 2.2046 }
  };

  const getConversionFactor = (from, to, ingredientType='liquid') => {
    // Powder conversion: cups ⇄ grams
    if (ingredientType !== 'liquid') {
      const density = powderDensities[ingredientType] || 120;
      if (from === 'cups' && to === 'g') return density;
      if (from === 'g' && to === 'cups') return 1 / density;
    }

    if (!baseConversion[from] || !baseConversion[from][to]) {
      throw new Error('Conversion not supported');
    }

    return baseConversion[from][to];
  };

  const convert = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setResult('Invalid input');
      return;
    }

    try {
      const factor = getConversionFactor(fromUnit, toUnit, ingredient);
      setResult((value * factor).toFixed(2) + ' ' + toUnit);
    } catch (e) {
      setResult(e.message);
    }
  };

  const unitOptions = ['cups','tbsp','tsp','ml','oz','g','lb','kg'];
  const ingredientOptions = ['liquid','flour','sugar','cocoa'];

  return (
    <div ref={ref}>
      <WidgetWrapper title="Conversion" onRemove={onRemove} onRename={onRename}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Input */}
          <input
            type="number"
            placeholder="Enter value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ padding: '4px' }}
          />

          {/* Ingredient type selector */}
          <select value={ingredient} onChange={e=>setIngredient(e.target.value)}>
            {ingredientOptions.map(i => <option key={i} value={i}>{i}</option>)}
          </select>

          {/* Unit selectors */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
              {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <span style={{ fontWeight: 'bold' }}>→</span>
            <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
              {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          {/* Convert button */}
          <button onClick={convert}>Convert</button>

          {/* Result */}
          {result && (
            <div style={{
              marginTop: '8px',
              padding: '6px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              background: '#f9f9f9',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {result}
            </div>
          )}
        </div>
      </WidgetWrapper>
    </div>
  );
}



// --- Background Controls ---
function BackgroundControls({ onSetUrl, onFile, onColor, color }) {
  const [minimized, setMinimized] = useState(false);

  const containerStyle = {
    background: 'rgba(255,255,255,0.8)',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    width: '220px',
    color: 'black'
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ fontWeight: '600' }}>Background</div>
        <button
          onClick={() => setMinimized(m => !m)}
          style={{
            fontSize: '12px',
            border: '1px solid #aaa',
            borderRadius: '4px',
            padding: '2px 6px',
            cursor: 'pointer'
          }}
        >
          {minimized ? '+' : '-'}
        </button>
      </div>

      {!minimized && (
        <>
          <input
            placeholder="Image URL"
            onKeyDown={(e) => { if (e.key === 'Enter') onSetUrl(e.target.value); }}
            style={{ width: '100%', marginBottom: '6px' }}
          />
          <div style={{ fontSize: '12px' }}>Or upload an image:</div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFile(e.target.files && e.target.files[0])}
            style={{ marginBottom: '6px' }}
          />
          <div style={{ fontSize: '12px' }}>Or pick a background color:</div>
          <input
            type="color"
            value={color}
            onChange={(e) => onColor(e.target.value)}
            style={{ marginTop: '4px', width: '48px', height: '32px', padding: 0 }}
          />
          <button
            onClick={() => onSetUrl('')}
            style={{ display: 'block', marginTop: '8px' }}
          >
            Clear
          </button>
        </>
      )}
    </div>
  );
}


// --- Main app ---
export default function ClassroomScreen() {
  const [bgUrl, setBgUrl] = useState('');
  const [bgFileObjectUrl, setBgFileObjectUrl] = useState(null);
  const [bgColor, setBgColor] = useState('#800cb6ff');

  const [widgets, setWidgets] = useState([]);

  // useEffect(()=>{
  //   return ()=>{
  //     if(bgFileObjectUrl) URL.revokeObjectURL(bgFileObjectUrl);
  //   };
  // }, [bgFileObjectUrl]);
// --- Inside ClassroomScreen ---
useEffect(() => {
  // Load saved state on mount
  const saved = localStorage.getItem('classroomScreen');
  if (saved) {
    const data = JSON.parse(saved);
    setWidgets(data.widgets || []);
    setBgUrl(data.bgUrl || '');
    setBgColor(data.bgColor || '#800cb6ff');
  }
}, []);

function saveScreen() {
  const data = {
    widgets,
    bgUrl,
    bgColor
  };
  localStorage.setItem('classroomScreen', JSON.stringify(data));
  alert('Screen layout saved!');
}
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
        w.type === 'poll' ? <PollWidget key={w.id} onRemove={()=>removeWidget(w.id)} onRename={(title)=>renameWidget(w.id,title)} /> : 
        w.type === 'dice' ? <DiceWidget key={w.id} onRemove={()=>removeWidget(w.id)} onRename={(t)=>renameWidget(w.id,t)} /> : 
        w.type === 'namepicker' ? <NamePickerWidget key={w.id} onRemove={() => removeWidget(w.id)} onRename={(t) => renameWidget(w.id, t)} /> :
        w.type === 'image' ? <ImageWidget key={w.id} onRemove={() => removeWidget(w.id)} onRename={(t)=>renameWidget(w.id,t)} /> : 
        w.type === 'conversion' ? <ConversionWidget key={w.id} onRemove={() => removeWidget(w.id)} onRename={(t)=>renameWidget(w.id,t)} /> : null
      ))}

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.7)', borderTop: '1px solid #ccc', padding: '4px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <button onClick={()=>addWidget('stoplight')}>Add Stoplight</button>
        <button onClick={()=>addWidget('clock')}>Add Clock</button>
        <button onClick={()=>addWidget('timer')}>Add Timer</button>
        <button onClick={()=>addWidget('poll')}>Add Poll</button>
        <button onClick={() => addWidget('dice')}>Add Dice</button>
        <button onClick={() => addWidget('conversion')}>Add Conversion</button>
        <button onClick={() => addWidget('namepicker')}>Add Name Picker</button>
        <button onClick={() => addWidget('image')}>Add Image</button>

        <button onClick={saveScreen}>Save Screen</button>
        <button onClick={() => {
          setWidgets([]);
          setBgUrl('');
          setBgColor('#800cb6ff');
          localStorage.removeItem('classroomScreen');
        }}>Reset Layout</button>

      </div>
    </div>
  );
}
