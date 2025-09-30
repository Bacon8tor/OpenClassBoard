import React, { useEffect, useState } from "react";
import { ref, set, onValue, get, remove } from 'firebase/database';
import { database } from '../../firebase';
import useDraggable from "../../hooks/useDraggable";
import useWidgetDimensions from "../../hooks/useWidgetDimensions";
import WidgetWrapper from "../WidgetWrapper";

export default function PollWidget({ onRemove, onRename, position, registerRef, glassButtonStyle, widgetTransparency, hideTitles }) {
  const { ref: widgetRef, getPosition } = useDraggable(position || { x: 200, y: 260, width: 320, height: 480 });
  const { ref: contentRef, fontSize, spacing, isSmall, isMedium, dimensions } = useWidgetDimensions();
  
  const cleanupOldPolls = async () => {
  try {
    console.log('🧹 Cleaning up old polls...');
    const pollsRef = ref(database, 'polls');
    const snapshot = await get(pollsRef);
    
    if (snapshot.exists()) {
      const polls = snapshot.val();
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
      let deletedCount = 0;
      
      for (const [pollId, pollData] of Object.entries(polls)) {
        // Skip current poll
        if (pollId === pollId) continue;
        
        if (pollData.created && pollData.created < oneDayAgo) {
          await remove(ref(database, `polls/${pollId}`));
          deletedCount++;
          console.log(`🗑️ Deleted old poll: ${pollId}`);
        }
      }
      
      if (deletedCount > 0) {
        console.log(`✅ Cleanup complete: ${deletedCount} old polls deleted`);
      } else {
        console.log('✅ No old polls to delete');
      }
    }
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
};


  useEffect(() => { if (registerRef) registerRef(getPosition); }, [getPosition, registerRef]);

  const [options, setOptions] = useState(["Option A", "Option B", "Option C"]);
  const [votes, setVotes] = useState({});
  const [newOption, setNewOption] = useState("");
  const [editValues, setEditValues] = useState({});
  const [pollTitle, setPollTitle] = useState("Quick Poll");
  const [editingTitle, setEditingTitle] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [pollId] = useState(() => `poll_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);
  const [isLive, setIsLive] = useState(false);
  const [firebaseError, setFirebaseError] = useState(null);

  // Debug: Log the poll ID when component mounts
  useEffect(() => {
    console.log('🎯 Poll Widget created with ID:', pollId);
  }, [pollId]);

  // Firebase real-time sync
  useEffect(() => {
    if (!isLive) {
      console.log('📴 Poll is offline, skipping Firebase sync');
      return;
    }


    console.log('🔄 Setting up Firebase sync for poll:', pollId);
    const pollRef = ref(database, `polls/${pollId}`);
    
    // Listen for changes
    const unsubscribe = onValue(pollRef, (snapshot) => {
      console.log('📡 Received Firebase update:', snapshot.val());
      const data = snapshot.val();
      if (data) {
        setOptions(data.options || []);
        setVotes(data.votes || {});
        setPollTitle(data.title || "Quick Poll");
        setFirebaseError(null);
      }
    }, (error) => {
      console.error('❌ Firebase read error:', error);
      setFirebaseError(error.message);
    });

    // Initialize poll in Firebase with proper structure
    const initialVotes = {};
    options.forEach(option => {
      initialVotes[option] = 0; // Initialize all options with 0 votes
    });

    const initialData = {
      title: pollTitle,
      options: options,
      votes: initialVotes,
      voters: {},
      created: Date.now(),
      isLive: true
    };

    console.log('💾 Saving initial poll data to Firebase:', initialData);
    
    set(pollRef, initialData)
      .then(() => {
        console.log('✅ Successfully saved poll to Firebase!');
        setFirebaseError(null);
      })
      .catch((error) => {
        console.error('❌ Firebase write error:', error);
        setFirebaseError(error.message);
      });

    return () => {
      console.log('🔌 Disconnecting Firebase listener');
      // Set poll as offline when component unmounts or goes offline
      set(ref(database, `polls/${pollId}/isLive`), false).catch(console.error);
      unsubscribe();
    };
  }, [isLive, pollId]);
useEffect(() => {
  // Run cleanup when poll widget loads
  cleanupOldPolls();
  
  // Optional: Run cleanup every 2 hours
  const cleanupInterval = setInterval(cleanupOldPolls, 2 * 60 * 60 * 1000);
  
  return () => clearInterval(cleanupInterval);
}, []); // Empty dependency array means this runs once when component mounts
  // Update Firebase when local state changes (teacher actions)
  const updateFirebase = async (updates) => {
    if (!isLive) {
      console.log('📴 Poll offline, not updating Firebase');
      return;
    }

    const pollRef = ref(database, `polls/${pollId}`);

    // Get current data from Firebase to preserve voters
    const snapshot = await get(pollRef);
    const currentData = snapshot.exists() ? snapshot.val() : {};

    // Ensure votes object has all options initialized
    const currentVotes = votes;
    const allOptions = updates.options || options;
    const properVotes = {};
    allOptions.forEach(option => {
      properVotes[option] = currentVotes[option] || 0;
    });

    const data = {
      title: pollTitle,
      options: allOptions,
      votes: updates.votes || properVotes,
      voters: currentData.voters || {}, // Preserve existing voters
      created: currentData.created || Date.now(), // Preserve original creation time
      isLive: true,
      ...updates
    };

    console.log('📤 Updating Firebase with:', data);

    try {
      await set(pollRef, data);
      console.log('✅ Firebase update successful');
      setFirebaseError(null);
    } catch (error) {
      console.error('❌ Firebase update error:', error);
      setFirebaseError(error.message);
    }
  };

  const vote = (option) => {
    console.log('🗳️ Vote cast for:', option);
    const newVotes = { ...votes, [option]: (votes[option] || 0) + 1 };
    setVotes(newVotes);
    updateFirebase({ votes: newVotes });
  };

  const addOption = () => {
    const trimmed = newOption.trim();
    if (trimmed && !options.includes(trimmed) && options.length < 6) {
      const newOptions = [...options, trimmed];
      setOptions(newOptions);
      setNewOption("");
      
      // Initialize vote count for new option
      const newVotes = { ...votes, [trimmed]: 0 };
      setVotes(newVotes);
      
      updateFirebase({ options: newOptions, votes: newVotes });
    }
  };

  const deleteOption = (opt) => {
    if (options.length <= 2) return;
    const newOptions = options.filter(o => o !== opt);
    const newVotes = { ...votes };
    delete newVotes[opt];
    
    setOptions(newOptions);
    setVotes(newVotes);
    setEditValues(prev => {
      const { [opt]: _, ...rest } = prev;
      return rest;
    });
    
    updateFirebase({ options: newOptions, votes: newVotes });
  };

  const resetPoll = () => {
    const newVotes = {};
    options.forEach(option => {
      newVotes[option] = 0;
    });
    setVotes(newVotes);
    updateFirebase({ votes: newVotes, voters: {} });
  };

  const updateTitle = (newTitle) => {
    setPollTitle(newTitle);
    updateFirebase({ title: newTitle });
  };

  const updateOption = (oldName, newName) => {
    if (!newName || newName === oldName || options.includes(newName)) return;

    const newOptions = options.map(o => (o === oldName ? newName : o));
    const newVotes = { ...votes };
    if (votes[oldName] !== undefined) {
      newVotes[newName] = votes[oldName];
      delete newVotes[oldName];
    }

    setOptions(newOptions);
    setVotes(newVotes);
    setEditValues(prev => {
      const { [oldName]: _, ...rest } = prev;
      return rest;
    });

    updateFirebase({ options: newOptions, votes: newVotes });
  };

  const toggleLive = () => {
    const newLiveState = !isLive;
    console.log('🔄 Toggling live state to:', newLiveState);
    setIsLive(newLiveState);
    
    if (newLiveState) {
      console.log('🚀 Poll is now LIVE! Poll ID:', pollId);
      console.log('🔗 Voting URL:', `${window.location.origin}/vote/${pollId}`);
    } else {
      console.log('⏹️ Poll stopped');
      // Update Firebase to mark poll as offline
      if (pollId) {
        set(ref(database, `polls/${pollId}/isLive`), false).catch(console.error);
      }
    }
  };

  // Generate voting URL
  const votingUrl = `${window.location.origin}/vote/${pollId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(votingUrl)}`;

  // Calculate responsive sizes
  const titleSize = fontSize(16, 12, 20);
  const buttonSize = fontSize(11, 9, 14);
  const textSize = fontSize(12, 10, 15);
  const inputSize = fontSize(10, 8, 12);
  const pad = spacing(12, 8, 16);
  const gap = spacing(6, 4, 10);

  const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);
  const maxVotes = Math.max(...Object.values(votes), 1);

  const modernButtonStyle = {
    border: "none",
    borderRadius: "8px",
    padding: `${spacing(8, 6, 12)}px ${spacing(12, 8, 16)}px`,
    fontSize: `${buttonSize}px`,
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px"
  };

  const voteButtonStyle = (optionVotes) => ({
    ...modernButtonStyle,
    background: optionVotes > 0 ? 
      "linear-gradient(135deg, #4F46E5, #7C3AED)" : 
      "linear-gradient(135deg, #6B7280, #9CA3AF)",
    color: "white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  });

  return (
    <div ref={widgetRef}>
      <WidgetWrapper title="Poll" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle} widgetTransparency={widgetTransparency} hideTitles={hideTitles}>
        <div 
          ref={contentRef}
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            height: "100%",
            gap: `${gap}px`,
            padding: `${pad}px`,
            background: isLive ? 
              "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)" :
              "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            borderRadius: "12px",
            border: isLive ? "2px solid #10b981" : "1px solid #e2e8f0"
          }}
        >
          
          {/* Firebase Error Display */}
          {firebaseError && (
            <div style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              padding: "8px",
              borderRadius: "6px",
              fontSize: "12px",
              marginBottom: gap
            }}>
              Firebase Error: {firebaseError}
            </div>
          )}

          {/* Debug Info */}
          {isLive && (
            <div style={{
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              color: "#0369a1",
              padding: "8px",
              borderRadius: "6px",
              fontSize: "10px",
              marginBottom: gap,
              fontFamily: "monospace"
            }}>
              URL: <a href={votingUrl} target="_blank" rel="noopener noreferrer">Link</a>
            </div>
          )}
          
          {/* Live Status & Controls */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: `${gap}px`,
            flexShrink: 0
          }}>
            <button
              onClick={toggleLive}
              style={{
                ...modernButtonStyle,
                background: isLive ? 
                  "linear-gradient(135deg, #EF4444, #DC2626)" :
                  "linear-gradient(135deg, #10B981, #059669)",
                color: "white",
                padding: `${spacing(4, 3, 6)}px ${spacing(8, 6, 10)}px`,
                fontSize: `${fontSize(9, 7, 11)}px`
              }}
            >
              {isLive ? "🔴 STOP" : "🟢 GO LIVE"}
            </button>
            
            <div style={{
              fontSize: `${fontSize(10, 8, 12)}px`,
              color: isLive ? "#059669" : "#6B7280",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              {isLive ? (
                <>
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#10b981",
                    animation: "pulse 1s infinite"
                  }} />
                  LIVE
                </>
              ) : "OFFLINE"}
            </div>
          </div>

          {/* Poll Title */}
          <div style={{ 
            textAlign: "center",
            marginBottom: `${gap}px`,
            flexShrink: 0
          }}>
            {editingTitle ? (
              <input
                value={pollTitle}
                onChange={e => setPollTitle(e.target.value)}
                onBlur={() => {
                  setEditingTitle(false);
                  updateTitle(pollTitle);
                }}
                onKeyDown={e => { 
                  if (e.key === "Enter") {
                    setEditingTitle(false);
                    updateTitle(pollTitle);
                  }
                }}
                autoFocus
                style={{
                  fontSize: `${titleSize}px`,
                  fontWeight: "700",
                  textAlign: "center",
                  border: "2px solid #4F46E5",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  background: "white",
                  width: "100%"
                }}
              />
            ) : (
              <h3 
                onClick={() => setEditingTitle(true)}
                style={{
                  fontSize: `${titleSize}px`,
                  fontWeight: "700",
                  color: "#1e293b",
                  margin: 0,
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px"
                }}
              >
                {pollTitle}
              </h3>
            )}
          </div>

          {/* Options */}
          <div style={{ 
            flex: 1, 
            overflowY: "auto", 
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: `${spacing(8, 6, 12)}px`
          }}>
            {options.map((option, index) => {
              const voteCount = votes[option] || 0;
              const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              const barWidth = totalVotes > 0 ? (voteCount / maxVotes) * 100 : 0;
              
              return (
                <div key={option} style={{ 
                  background: "white",
                  borderRadius: "12px",
                  padding: `${spacing(12, 8, 16)}px`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #e2e8f0",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  
                  {/* Progress bar */}
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: `${barWidth}%`,
                    background: voteCount > 0 ? 
                      "linear-gradient(90deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)" :
                      "transparent",
                    transition: "width 0.5s ease",
                    borderRadius: "12px"
                  }} />
                  
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: `${gap}px`,
                    position: "relative",
                    zIndex: 1
                  }}>
                    {/* Vote button */}
                    <button 
                      style={voteButtonStyle(voteCount)}
                      onClick={() => vote(option)}
                    >
                      <span style={{ fontSize: "14px" }}>👍</span>
                      {!isSmall && "Vote"}
                    </button>
                    
                    {/* Option text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {!isSmall && editValues[option] !== undefined ? (
                        <input
                          type="text"
                          value={editValues[option]}
                          onChange={e => setEditValues(prev => ({ ...prev, [option]: e.target.value }))}
                          onKeyDown={e => { 
                            if (e.key === "Enter") {
                              updateOption(option, editValues[option]);
                            }
                          }}
                          onBlur={() => updateOption(option, editValues[option])}
                          style={{ 
                            width: "100%",
                            fontSize: `${textSize}px`,
                            padding: "4px 8px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            background: "#f9fafb",
                            color: "black"
                          }}
                        />
                      ) : (
                        <div 
                          onClick={!isSmall ? () => setEditValues(prev => ({ ...prev, [option]: option })) : undefined}
                          style={{
                            fontSize: `${textSize}px`,
                            fontWeight: "500",
                            color: "#374151",
                            cursor: !isSmall ? "pointer" : "default",
                            wordBreak: "break-word"
                          }}
                        >
                          {option}
                        </div>
                      )}
                    </div>
                    
                    {/* Vote count */}
                    <div style={{ 
                      textAlign: "right",
                      minWidth: isSmall ? "40px" : "60px"
                    }}>
                      <div style={{ 
                        fontSize: `${fontSize(14, 11, 16)}px`,
                        fontWeight: "700",
                        color: voteCount > 0 ? "#4F46E5" : "#6B7280"
                      }}>
                        {voteCount}
                      </div>
                      {!isSmall && totalVotes > 0 && (
                        <div style={{ 
                          fontSize: `${fontSize(10, 8, 12)}px`,
                          color: "#9CA3AF"
                        }}>
                          {percentage}%
                        </div>
                      )}
                    </div>
                    
                    {/* Delete button */}
                    {options.length > 2 && (
                      <button 
                        style={{
                          ...modernButtonStyle,
                          background: "#EF4444",
                          color: "white",
                          padding: `${spacing(4, 3, 6)}px`,
                          fontSize: "12px",
                          borderRadius: "6px"
                        }}
                        onClick={() => deleteOption(option)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Add new option */}
          {options.length < 6 && (
            <div style={{ 
              flexShrink: 0,
              display: "flex",
              gap: `${gap}px`,
              alignItems: "center",
              background: "white",
              padding: `${spacing(8, 6, 12)}px`,
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              color:"black"
            }}>
              <input
                value={newOption}
                onChange={e => setNewOption(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addOption(); }}
                placeholder={isSmall ? "New..." : "Add new option..."}
                style={{ 
                  flex: 1,
                  fontSize: `${inputSize}px`,
                  padding: `${spacing(6, 4, 8)}px`,
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  background: "#f9fafb",
                  color: "black"
                }}
              />
              <button 
                style={{
                  ...modernButtonStyle,
                  background: "linear-gradient(135deg, #10B981, #059669)",
                  color: "white",
                  padding: `${spacing(6, 4, 8)}px ${spacing(12, 8, 16)}px`
                }} 
                onClick={addOption}
              >
                {isSmall ? "+" : "Add"}
              </button>
            </div>
          )}

          {/* Controls */}
          <div style={{
            flexShrink: 0,
            display: "flex",
            gap: `${gap}px`,
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            {/* QR Code toggle */}
            <button
              onClick={() => setShowQR(!showQR)}
              disabled={!isLive}
              style={{
                ...modernButtonStyle,
                background: showQR && isLive ? 
                  "linear-gradient(135deg, #4F46E5, #7C3AED)" : 
                  "linear-gradient(135deg, #6B7280, #9CA3AF)",
                color: "white",
                padding: `${spacing(6, 4, 8)}px ${spacing(8, 6, 12)}px`,
                fontSize: `${fontSize(10, 8, 12)}px`,
                opacity: isLive ? 1 : 0.5,
                cursor: isLive ? "pointer" : "not-allowed"
              }}
            >
              📱 {isSmall ? "QR" : "QR Vote"}
            </button>

            {/* Reset button */}
            <button 
              style={{
                ...modernButtonStyle,
                background: "linear-gradient(135deg, #EF4444, #DC2626)",
                color: "white",
                padding: `${spacing(6, 4, 8)}px ${spacing(8, 6, 12)}px`,
                fontSize: `${fontSize(10, 8, 12)}px`
              }}
              onClick={resetPoll}
              disabled={totalVotes === 0}
            >
              🔄 Reset
            </button>

            {/* Total votes */}
            <div style={{
              fontSize: `${fontSize(12, 10, 14)}px`,
              color: "#6B7280",
              fontWeight: "600"
            }}>
              {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
            </div>
          </div>

          {/* QR Code display */}
          {showQR && isLive && (
            <div style={{
              flexShrink: 0,
              background: "white",
              padding: `${spacing(12, 8, 16)}px`,
              borderRadius: "12px",
              border: "2px solid #4F46E5",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.15)"
            }}>
              <div style={{
                fontSize: `${fontSize(12, 10, 14)}px`,
                fontWeight: "600",
                color: "#4F46E5",
                marginBottom: `${spacing(8, 6, 12)}px`
              }}>
                Scan to Vote
              </div>
              <img 
                src={qrCodeUrl} 
                alt="QR Code for voting"
                style={{
                  width: `${Math.min(120, dimensions.width - 80)}px`,
                  height: `${Math.min(120, dimensions.width - 80)}px`,
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px"
                }}
              />
              <div style={{
                fontSize: `${fontSize(8, 7, 10)}px`,
                color: "#9CA3AF",
                marginTop: `${spacing(4, 3, 6)}px`,
                wordBreak: "break-all"
              }}>
                {votingUrl}
              </div>
            </div>
          )}
        </div>

        {/* CSS animations */}
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}
        </style>
      </WidgetWrapper>
    </div>
  );
}