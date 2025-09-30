import React, { useState, useEffect } from "react";
import { ref, onValue, set, get } from 'firebase/database';
import { database } from '../firebase';

export default function VotingPage({ pollId }) {
  const [pollData, setPollData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate or retrieve persistent voter ID from localStorage
  const [voterId] = useState(() => {
    const storageKey = `voter_${pollId}`;
    const existingVoterId = localStorage.getItem(storageKey);

    if (existingVoterId) {
      console.log('📱 Using existing voter ID from localStorage:', existingVoterId);
      return existingVoterId;
    }

    const newVoterId = `voter_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    localStorage.setItem(storageKey, newVoterId);
    console.log('🆕 Created new voter ID:', newVoterId);
    return newVoterId;
  });

  // Debug: Log important info
  useEffect(() => {
    console.log('🗳️ Voting page loaded for poll:', pollId);
    console.log('👤 Voter ID:', voterId);
    console.log('🔗 Database URL:', database.app.options.databaseURL);
  }, [pollId, voterId]);

  useEffect(() => {
    const pollRef = ref(database, `polls/${pollId}`);
    console.log('📡 Setting up Firebase listener for poll:', pollId);

    // Check localStorage first for local vote tracking
    const hasVotedLocally = localStorage.getItem(`voted_${pollId}`) === 'true';
    if (hasVotedLocally) {
      console.log('🔒 User has already voted (localStorage check)');
    }

    // Listen for real-time updates
    const unsubscribe = onValue(pollRef, (snapshot) => {
      console.log('📥 Received Firebase data:', snapshot.val());
      const data = snapshot.val();

      if (data) {
        setPollData(data);

        // Check if this voter already voted (Firebase OR localStorage)
        const voters = data.voters || {};
        const alreadyVotedFirebase = !!voters[voterId];
        const alreadyVoted = alreadyVotedFirebase || hasVotedLocally;

        setHasVoted(alreadyVoted);
        setSelectedOption(voters[voterId] || null);
        setError(null);

        console.log('✅ Poll data loaded successfully');
        console.log('🗳️ Has already voted (Firebase):', alreadyVotedFirebase);
        console.log('🗳️ Has already voted (localStorage):', hasVotedLocally);
        console.log('🗳️ Final hasVoted status:', alreadyVoted);
      } else {
        console.log('❌ No poll data found');
        setPollData(null);
        setError('Poll not found or not live yet');
      }
      setLoading(false);
    }, (error) => {
      console.error('❌ Firebase read error:', error);
      setError(`Database error: ${error.message}`);
      setLoading(false);
    });

    return () => {
      console.log('🔌 Disconnecting Firebase listener');
      unsubscribe();
    };
  }, [pollId, voterId]);

  const submitVote = async () => {
    if (!selectedOption || hasVoted || !pollData) {
      console.log('❌ Vote blocked:', { selectedOption, hasVoted, pollData: !!pollData });
      return;
    }

    console.log('🗳️ Submitting vote for:', selectedOption);
    
    try {
      setError(null);
      
      // First, get the current poll data to ensure we have the latest votes
      const pollRef = ref(database, `polls/${pollId}`);
      const snapshot = await get(pollRef);
      
      if (!snapshot.exists()) {
        throw new Error('Poll no longer exists');
      }
      
      const currentData = snapshot.val();
      console.log('📊 Current poll data:', currentData);
      
      // Update votes count
      const newVotes = {
        ...currentData.votes,
        [selectedOption]: (currentData.votes[selectedOption] || 0) + 1
      };

      // Track voter to prevent double voting
      const newVoters = {
        ...currentData.voters,
        [voterId]: selectedOption
      };

      // Prepare updated data
      const updatedData = {
        ...currentData,
        votes: newVotes,
        voters: newVoters,
        lastVote: Date.now() // Add timestamp for debugging
      };

      console.log('💾 Saving updated data:', updatedData);

      // Update Firebase
      await set(pollRef, updatedData);

      console.log('✅ Vote submitted successfully!');
      setHasVoted(true);

      // Mark as voted in localStorage to prevent refresh-based revoting
      localStorage.setItem(`voted_${pollId}`, 'true');

    } catch (error) {
      console.error('❌ Vote submission failed:', error);
      setError(`Failed to submit vote: ${error.message}`);
      
      // Show more specific error messages
      if (error.code === 'PERMISSION_DENIED') {
        setError('Permission denied. The poll may have ended or database rules are too restrictive.');
      } else if (error.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`Error: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}>
        <div style={{
          background: "white",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #e2e8f0",
            borderTop: "4px solid #4F46E5",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }} />
          <div style={{ color: "#6B7280", fontSize: "16px" }}>Loading poll...</div>
          <div style={{ color: "#9CA3AF", fontSize: "12px", marginTop: "8px" }}>
            Poll ID: {pollId}
          </div>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (!pollData || error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "20px"
      }}>
        <div style={{
          background: "white",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          textAlign: "center",
          maxWidth: "400px"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>😕</div>
          <h2 style={{ color: "#1f2937", marginBottom: "8px" }}>Poll Not Found</h2>
          <p style={{ color: "#6B7280", margin: "0 0 16px 0" }}>
            {error || "The poll you're looking for doesn't exist or isn't live yet."}
          </p>
          <div style={{
            background: "#f9fafb",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#6B7280",
            fontFamily: "monospace"
          }}>
            Poll ID: {pollId}
          </div>
          
          {/* Debug info */}
          <details style={{ marginTop: "16px", textAlign: "left" }}>
            <summary style={{ cursor: "pointer", color: "#6B7280", fontSize: "12px" }}>
              Debug Info
            </summary>
            <div style={{ 
              background: "#f3f4f6", 
              padding: "8px", 
              borderRadius: "4px", 
              fontSize: "10px",
              fontFamily: "monospace",
              marginTop: "8px",
              color: "#374151"
            }}>
              <div>Poll ID: {pollId}</div>
              <div>Voter ID: {voterId}</div>
              <div>Error: {error || 'No poll data'}</div>
              <div>Database: {database?.app?.options?.databaseURL || 'Not configured'}</div>
            </div>
          </details>
        </div>
      </div>
    );
  }

  const totalVotes = Object.values(pollData.votes || {}).reduce((sum, v) => sum + v, 0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "500px",
        margin: "0 auto",
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
        overflow: "hidden"
      }}>
        
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
          color: "white",
          padding: "24px",
          textAlign: "center"
        }}>
          <h1 style={{
            margin: "0 0 8px 0",
            fontSize: "24px",
            fontWeight: "700"
          }}>
            {pollData.title}
          </h1>
          <p style={{
            margin: 0,
            opacity: 0.9,
            fontSize: "14px"
          }}>
            {hasVoted ? "Thanks for voting!" : "Choose your option below"}
          </p>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "8px"
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#10b981",
              animation: "pulse 1s infinite"
            }} />
            <span style={{ fontSize: "12px", opacity: 0.9 }}>LIVE</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "12px 24px",
            fontSize: "14px"
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Content */}
        <div style={{ padding: "24px" }}>
          
          {hasVoted ? (
            // Results view
            <div>
              <h3 style={{
                color: "#1f2937",
                marginBottom: "20px",
                textAlign: "center",
                fontSize: "18px"
              }}>
                Live Results
              </h3>
              
              {pollData.options.map(option => {
                const votes = pollData.votes[option] || 0;
                const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                
                return (
                  <div key={option} style={{
                    marginBottom: "16px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    padding: "16px",
                    position: "relative",
                    overflow: "hidden",
                    border: option === selectedOption ? "2px solid #4F46E5" : "1px solid #e2e8f0"
                  }}>
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: "100%",
                      width: `${percentage}%`,
                      background: option === selectedOption ? 
                        "linear-gradient(90deg, #4F46E5, #7C3AED)" :
                        "linear-gradient(90deg, #10B981, #059669)",
                      opacity: 0.15,
                      transition: "width 0.8s ease"
                    }} />
                    
                    <div style={{
                      position: "relative",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div style={{
                        fontWeight: "600",
                        color: "#1f2937",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        {option === selectedOption && <span>✅</span>}
                        {option}
                      </div>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        fontSize: "14px"
                      }}>
                        <span style={{ fontWeight: "700", color: "#4F46E5" }}>
                          {votes} vote{votes !== 1 ? 's' : ''}
                        </span>
                        <span style={{ 
                          color: "#6B7280", 
                          minWidth: "40px",
                          fontWeight: "600"
                        }}>
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div style={{
                textAlign: "center",
                marginTop: "24px",
                padding: "16px",
                background: "#f0f9ff",
                borderRadius: "12px",
                border: "2px solid #e0f2fe"
              }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>🎉</div>
                <div style={{ color: "#0369a1", fontWeight: "600", fontSize: "16px" }}>
                  Total votes: {totalVotes}
                </div>
                <div style={{ color: "#0369a1", fontSize: "12px", marginTop: "4px" }}>
                  Results update in real-time
                </div>
              </div>
            </div>
          ) : (
            // Voting view
            <div>
              <h3 style={{
                color: "#1f2937",
                marginBottom: "20px",
                textAlign: "center",
                fontSize: "18px"
              }}>
                Select your choice:
              </h3>
              
              {pollData.options.map(option => (
                <button
                  key={option}
                  onClick={() => setSelectedOption(option)}
                  style={{
                    width: "100%",
                    marginBottom: "12px",
                    padding: "16px",
                    border: selectedOption === option ? "3px solid #4F46E5" : "2px solid #e2e8f0",
                    borderRadius: "12px",
                    background: selectedOption === option ? "#f0f9ff" : "white",
                    color: selectedOption === option ? "#1e40af" : "#374151",
                    fontSize: "16px",
                    fontWeight: selectedOption === option ? "600" : "500",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textAlign: "left",
                    boxShadow: selectedOption === option ? "0 4px 12px rgba(79, 70, 229, 0.2)" : "0 1px 3px rgba(0,0,0,0.1)"
                  }}
                  onMouseEnter={e => {
                    if (selectedOption !== option) {
                      e.target.style.background = "#f8fafc";
                      e.target.style.borderColor = "#cbd5e1";
                      e.target.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (selectedOption !== option) {
                      e.target.style.background = "white";
                      e.target.style.borderColor = "#e2e8f0";
                      e.target.style.transform = "translateY(0)";
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: "2px solid",
                      borderColor: selectedOption === option ? "#4F46E5" : "#d1d5db",
                      background: selectedOption === option ? "#4F46E5" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      {selectedOption === option && (
                        <div style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "white"
                        }} />
                      )}
                    </div>
                    {option}
                  </div>
                </button>
              ))}
              
              <button
                onClick={submitVote}
                disabled={!selectedOption}
                style={{
                  width: "100%",
                  marginTop: "20px",
                  padding: "16px",
                  border: "none",
                  borderRadius: "12px",
                  background: selectedOption ? 
                    "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" : 
                    "#e2e8f0",
                  color: selectedOption ? "white" : "#9ca3af",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: selectedOption ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease",
                  boxShadow: selectedOption ? "0 4px 12px rgba(79, 70, 229, 0.3)" : "none"
                }}
                onMouseEnter={e => {
                  if (selectedOption) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 16px rgba(79, 70, 229, 0.4)";
                  }
                }}
                onMouseLeave={e => {
                  if (selectedOption) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.3)";
                  }
                }}
              >
                Submit Vote
              </button>

              {/* Live vote count */}
              <div style={{
                textAlign: "center",
                marginTop: "16px",
                padding: "12px",
                background: "#f8fafc",
                borderRadius: "8px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "4px" }}>
                  Current votes
                </div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#4F46E5" }}>
                  {totalVotes}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div style={{
        textAlign: "center",
        marginTop: "24px",
        color: "rgba(255,255,255,0.8)",
        fontSize: "14px"
      }}>
        Powered by OpenClassBoard
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
    </div>
  );
}