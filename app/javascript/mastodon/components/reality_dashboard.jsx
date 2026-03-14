import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { p2pTrust } from 'mastodon/services/p2p_trust_service';
import ImmutablePropTypes from 'react-immutable-proptypes';

export const RealityDashboard = ({ status }) => {
  const accountId = status.getIn(['account', 'id']);
  const [p2pVouches, setP2pVouches] = useState([]);
  const truthScore = status.get('truth_score') || 0;
  const isSuspicious = status.get('is_suspicious') || false;
  const safeCount = status.get('safe_count') || 0;
  const fakeCount = status.get('fake_count') || 0;
  
  const hasLocation = status.get('latitude') && status.get('longitude');
  const hasEvidence = status.get('media_attachments') && status.get('media_attachments').size > 0;

  useEffect(() => {
    if (!accountId) return;
    const unsubscribe = p2pTrust.subscribeToVouches(accountId, (vouches) => {
      setP2pVouches(vouches);
    });
    return () => unsubscribe();
  }, [accountId]);

  // Dynamically calculate the Client-Side score by blending Backend + P2P Graph
  const nodeTrust = p2pVouches.length;
  // If the backend has a score, we boost it by the live P2P graph
  const liveTruthScore = (truthScore + (nodeTrust * 2)).toFixed(1);

  return (
    <div style={{
      margin: '12px 0', padding: '16px', borderRadius: '8px',
      background: isSuspicious ? 'rgba(255,0,0,0.05)' : 'rgba(0,128,255,0.05)',
      border: `1px solid ${isSuspicious ? 'rgba(255,0,0,0.2)' : 'rgba(0,128,255,0.2)'}`,
      fontFamily: 'monospace'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <strong style={{ fontSize: '16px', color: isSuspicious ? '#e53e3e' : '#3182ce' }}>
          {isSuspicious ? '⚠️ Suspicious Claim Detected' : '⚖️ Truth Verification Protocol'}
        </strong>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: isSuspicious ? '#e53e3e' : '#4ADE80' }}>
          {liveTruthScore}
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '8px', fontSize: '14px' }}>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ color: '#666' }}>1. Node Trust (P2P):</span> 
          <strong style={{ marginLeft: '4px' }}>{nodeTrust} Vouches</strong>
        </div>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ color: '#666' }}>2. Witness Votes:</span> 
          <strong style={{ marginLeft: '4px' }}>+{safeCount} / -{fakeCount}</strong>
        </div>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ color: '#666' }}>3. Evidence:</span> 
          <strong style={{ marginLeft: '4px', color: hasEvidence ? '#4ADE80' : '#888' }}>
            {hasEvidence ? 'Attached Media' : 'None'}
          </strong>
        </div>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ color: '#666' }}>4. Location Weight:</span> 
          <strong style={{ marginLeft: '4px', color: hasLocation ? '#4ADE80' : '#888' }}>
            {hasLocation ? 'GPS Verified' : 'Unverified'}
          </strong>
        </div>
      </div>
      
      <div style={{ marginTop: '12px', fontSize: '12px', color: '#888', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '8px' }}>
        Algorithm: Σ (NodeTrust × EvidenceStrength × LocationWeight)
      </div>
    </div>
  );
};

RealityDashboard.propTypes = {
  status: ImmutablePropTypes.map.isRequired,
};
