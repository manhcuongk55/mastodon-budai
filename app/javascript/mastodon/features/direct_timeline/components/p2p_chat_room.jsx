import React, { useState, useEffect, useRef } from 'react';
import { p2pChat } from '../../../services/p2p_chat_service';
import LockIcon from '@/material-icons/400-24px/lock.svg?react';
import LockOpenIcon from '@/material-icons/400-24px/lock_open-fill.svg?react';
import SendIcon from '@/material-icons/400-24px/send.svg?react';
import { useIdentity } from 'mastodon/identity_context';

export const P2PChatRoom = () => {
  const { account } = useIdentity();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [roomAuth, setRoomAuth] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(p2pChat.isP2pAuthenticated);
  const [authError, setAuthError] = useState('');
  const [roomId, setRoomId] = useState('makai_global_p2p'); // Default room
  
  const bottomRef = useRef(null);
  const username = account?.username || `Guest_${Math.floor(Math.random() * 9999)}`;

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Subscribe to room when authenticated
  useEffect(() => {
    let unsubscribe;
    if (isAuthenticated) {
      setMessages([]); // Clear previous room messages
      p2pChat.subscribeToRoom(roomId, (msg) => {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.find(m => m.id === msg.id)) return prev;
          
          return [...prev, msg].sort((a, b) => a.timestamp - b.timestamp);
        });
      }).then(unsub => {
        unsubscribe = unsub;
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated, roomId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    // For off-grid messaging, we need an encryption keypass (master password)
    // We bind it to their current mastodon username for convenience but require a local PIN/Password
    if (!roomAuth) return setAuthError("Need an encryption PIN/Passphrase");
    
    const result = await p2pChat.authenticate(username, roomAuth);
    if (result.success) {
      setIsAuthenticated(true);
    } else {
      setAuthError(result.error?.message || "Failed to generate keys");
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      await p2pChat.sendMessage(roomId, inputText, username);
      setInputText('');
    } catch(err) {
      console.error(err);
      setAuthError("Failed to encrypt/send message");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p2p-chat-auth" style={{ padding: '20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}><LockIcon style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Enable Off-Grid P2P Messaging</h2>
        <p style={{ color: '#606984', marginBottom: '20px', fontSize: '14px' }}>
          Your messages here are end-to-end encrypted directly between peers (GunJS SEA). They never touch the Mastodon database.
        </p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
          <input 
            type="password" 
            placeholder="Create an Encryption PIN/Passphrase" 
            value={roomAuth}
            onChange={(e) => setRoomAuth(e.target.value)}
            className="setting-text"
            style={{ borderRadius: '4px', border: '1px solid #1f232b', background: '#0f1419', color: '#fff' }}
          />
          {authError && <div style={{ color: '#ff5050', fontSize: '13px' }}>{authError}</div>}
          <button type="submit" className="button button-primary">Generate Keys & Connect</button>
        </form>
      </div>
    );
  }

  return (
    <div className="p2p-chat-room" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LockOpenIcon style={{ color: '#4ade80' }} />
          <div>
            <div style={{ fontWeight: '600' }}>#{roomId}</div>
            <div style={{ fontSize: '12px', color: '#4ade80' }}>Connected · P2P Encrypted</div>
          </div>
        </div>
        <button className="text-btn" onClick={() => p2pChat.logout() || setIsAuthenticated(false)} style={{ color: '#ff6b6b' }}>Lock</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#606984', marginTop: '20px' }}>
            No messages in this P2P channel yet. Note: Because it's off-grid, you only see messages broadcast while you are synchronized or stored locally.
          </div>
        )}
        
        {messages.map(msg => {
          const isMe = msg.author === username;
          return (
            <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              <div style={{ fontSize: '12px', color: '#606984', marginBottom: '4px', textAlign: isMe ? 'right' : 'left' }}>
                {msg.author}
              </div>
              <div style={{ 
                background: isMe ? '#2b90d9' : '#1f232b',
                color: '#fff',
                padding: '10px 14px',
                borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                wordBreak: 'break-word'
              }}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ padding: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Encrypted message..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="setting-text"
          style={{ flex: 1, borderRadius: '20px', border: '1px solid #1f232b', background: '#0f1419', color: '#fff', padding: '10px 15px' }}
        />
        <button type="submit" className="button button-primary" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SendIcon width="18" height="18" />
        </button>
      </form>
    </div>
  );
};
