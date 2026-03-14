import React, { useEffect, useState, useCallback } from 'react';
import { useIdentity } from 'mastodon/identity_context';
import { p2pTrust } from 'mastodon/services/p2p_trust_service';

export const P2PTrustBadge: React.FC<{ targetAccountId: string; targetUsername: string }> = ({ targetAccountId, targetUsername }) => {
  const identity = useIdentity();
  const [vouches, setVouches] = useState<string[]>([]);
  
  useEffect(() => {
    // Subscribe to the decentralized trust graph for this user
    const unsubscribe = p2pTrust.subscribeToVouches(targetAccountId, (newVouches: string[]) => {
      setVouches(newVouches);
    });
    
    return () => {
      unsubscribe();
    };
  }, [targetAccountId]);

  const handleVouch = useCallback(() => {
    if (!identity.accountId) {
      alert("You must be logged in to vouch.");
      return;
    }
    // In a fully anonymous P2P this would use cryptographic keys (SEA).
    // Here we use Mastodon ID as a lightweight identity marker.
    p2pTrust.vouchForUser(identity.accountId, targetAccountId);
  }, [identity, targetAccountId]);

  const hasMyVouch = identity.accountId ? vouches.includes(identity.accountId) : false;
  
  // The user requested optimized running purely on device (no backend). 
  // GunJS handles this perfectly. It syncs locally and P2P via WebSockets.
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          padding: '4px 10px', 
          background: vouches.length >= 3 ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 255, 255, 0.05)', 
          border: `1px solid ${vouches.length >= 3 ? 'rgba(74, 222, 128, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`, 
          borderRadius: '20px', 
          color: vouches.length >= 3 ? '#4ADE80' : '#888', 
          fontSize: '13px' 
        }}>
          {vouches.length >= 3 ? '🛡️ Network Verified' : '🌐 P2P Trust Level'} ({vouches.length})
        </div>
        
        {identity.accountId && identity.accountId !== targetAccountId && !hasMyVouch && (
          <button 
            type="button"
            onClick={handleVouch}
            className="button button-secondary"
            style={{ padding: '2px 10px', fontSize: '13px', height: 'auto', lineHeight: '22px' }}
          >
            Vouch for @{targetUsername}
          </button>
        )}
        
        {hasMyVouch && (
          <span style={{ fontSize: '12px', color: '#4ADE80' }}>✓ You Vouched</span>
        )}
      </div>
    </div>
  );
};
