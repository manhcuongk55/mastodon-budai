import React, { useEffect, useState, useCallback } from 'react';
import { useIdentity } from 'mastodon/identity_context';
import { p2pTrust } from 'mastodon/services/p2p_trust_service';

export const P2PTrustBadge: React.FC<{ targetAccountId: string; targetUsername: string }> = ({ targetAccountId, targetUsername }) => {
  const identity = useIdentity();
  const [vouches, setVouches] = useState<string[]>([]);
  
  // Vouch PIN State
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);
  const [inputPin, setInputPin] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  useEffect(() => {
    // Subscribe to the decentralized trust graph for this user
    const unsubscribe = p2pTrust.subscribeToVouches(targetAccountId, (newVouches: string[]) => {
      setVouches(newVouches);
    });
    
    return () => {
      unsubscribe();
    };
  }, [targetAccountId]);

  // User A generates a PIN to vouch for User B
  const handleGeneratePin = useCallback(() => {
    if (!identity.accountId) {
      alert("You must be logged in to vouch.");
      return;
    }
    const pin = String((p2pTrust as any).generateVouchPin(identity.accountId, targetAccountId));
    setGeneratedPin(pin);
  }, [identity, targetAccountId]);

  // User B redeems a PIN given by User A
  const handleRedeemPin = useCallback(async () => {
    if (!identity.accountId || !inputPin) return;
    setIsVerifying(true);
    
    const success = await (p2pTrust as any).verifyVouchPin(inputPin, identity.accountId);
    setIsVerifying(false);
    
    if (success) {
      alert("✅ Vouch successfully verified via P2P Mesh!");
      setInputPin('');
    } else {
      alert("❌ Invalid or expired Vouch PIN.");
    }
  }, [identity, inputPin]);

  const handlePinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPin(e.target.value.replace(/\D/g, ''));
  }, []);

  const handleRedeemClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    void handleRedeemPin();
  }, [handleRedeemPin]);

  const hasMyVouch = identity.accountId ? vouches.includes(identity.accountId) : false;
  const isMyProfile = identity.accountId === targetAccountId;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          padding: '6px 14px', 
          background: vouches.length >= 3 ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 255, 255, 0.05)', 
          border: `1px solid ${vouches.length >= 3 ? 'rgba(74, 222, 128, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`, 
          borderRadius: '20px', 
          color: vouches.length >= 3 ? '#4ADE80' : '#888', 
          fontSize: '16px',
          fontWeight: 600
        }}>
          {vouches.length >= 3 ? '🛡️ Network Verified' : '🌐 P2P Trust Level'} ({vouches.length})
        </div>
        
        {/* If viewing someone else's profile, and I haven't vouched for them yet */}
        {!isMyProfile && !hasMyVouch && (
          <button 
            type="button"
            onClick={handleGeneratePin}
            className="button button-secondary"
            style={{ padding: '6px 16px', fontSize: '15px' }}
          >
            Generate Vouch Code
          </button>
        )}
        
        {hasMyVouch && !isMyProfile && (
          <span style={{ fontSize: '14px', color: '#4ADE80', fontWeight: 500 }}>✓ You Vouched</span>
        )}
      </div>

      {/* Show the Generated PIN to User A */}
      {generatedPin && !isMyProfile && (
        <div style={{ padding: '12px', background: '#FFF3CD', border: '1px solid #FFEEBA', color: '#856404', borderRadius: '6px', fontSize: '15px' }}>
          <strong>Tell this 6-digit code to @{targetUsername}:</strong>
          <div style={{ fontSize: '32px', letterSpacing: '4px', fontWeight: 'bold', margin: '8px 0', color: '#000' }}>
            {generatedPin}
          </div>
          <small>Valid for 5 minutes. They must enter it on their profile to complete the verification over the P2P Mesh.</small>
        </div>
      )}

      {/* If viewing my own profile, show the input to redeem a Vouch PIN */}
      {isMyProfile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '16px' }}>
          <strong style={{ fontSize: '15px' }}>Received a Vouch Code?</strong>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              maxLength={6}
              placeholder="000000"
              value={inputPin}
              onChange={handlePinChange} // numbers only
              style={{ padding: '10px 14px', fontSize: '20px', letterSpacing: '2px', width: '120px', borderRadius: '4px', border: '1px solid #CCC' }}
            />
            <button 
              type="button"
              className="button"
              onClick={handleRedeemClick}
              disabled={inputPin.length !== 6 || isVerifying}
              style={{ fontSize: '16px', padding: '0 20px' }}
            >
              {isVerifying ? 'Verifying...' : 'Redeem Vouch'}
            </button>
          </div>
          <span style={{ fontSize: '13px', color: '#666' }}>
            Enter the 6-digit code given to you by a peer to securely accept their vouch.
          </span>
        </div>
      )}
    </div>
  );
};
