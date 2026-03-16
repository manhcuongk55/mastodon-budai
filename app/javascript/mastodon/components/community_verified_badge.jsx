import React from 'react';

/**
 * CommunityVerifiedBadge — Shows a prominent badge when a post has been
 * verified by the community through the verification task system.
 *
 * Props:
 *   - communityVerified: boolean
 *   - verificationCount: number — how many verifiers confirmed
 */
const CommunityVerifiedBadge = ({ communityVerified, verificationCount }) => {
  if (!communityVerified) return null;

  const count = verificationCount || 0;

  return (
    <div style={styles.container}>
      <div style={styles.badge}>
        <span style={styles.icon}>✅</span>
        <div style={styles.info}>
          <span style={styles.label}>Cộng Đồng Xác Minh</span>
          <span style={styles.detail}>{count} người đã xác nhận</span>
        </div>
        <div style={styles.shield}>🛡️</div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '8px',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)',
    border: '1px solid rgba(16, 185, 129, 0.35)',
    boxShadow: '0 0 16px rgba(16, 185, 129, 0.08)',
    transition: 'all 0.3s ease',
  },
  icon: {
    fontSize: '20px',
  },
  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: '0.3px',
  },
  detail: {
    fontSize: '11px',
    color: 'rgba(16, 185, 129, 0.7)',
    marginTop: '1px',
  },
  shield: {
    fontSize: '16px',
    opacity: 0.6,
  },
};

export default CommunityVerifiedBadge;
