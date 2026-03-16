import React from 'react';

/**
 * AiDetectionBadge — Renders a visual indicator when a post
 * is flagged as potentially AI-generated content.
 *
 * Props:
 *   - aiDetected: boolean — whether the post was flagged
 *   - aiConfidence: number (0-100) — confidence score
 */
const AiDetectionBadge = ({ aiDetected, aiConfidence }) => {
  if (!aiDetected || !aiConfidence || aiConfidence < 50) return null;

  const level = aiConfidence >= 80 ? 'high' : aiConfidence >= 60 ? 'medium' : 'low';
  const config = {
    high: {
      bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
      border: 'rgba(239, 68, 68, 0.4)',
      color: '#EF4444',
      icon: '🤖',
      label: 'AI Agent Phát Hiện',
      glow: '0 0 12px rgba(239, 68, 68, 0.2)',
    },
    medium: {
      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))',
      border: 'rgba(245, 158, 11, 0.4)',
      color: '#F59E0B',
      icon: '⚠️',
      label: 'Nghi ngờ AI',
      glow: '0 0 12px rgba(245, 158, 11, 0.2)',
    },
    low: {
      bg: 'linear-gradient(135deg, rgba(148, 163, 184, 0.1), rgba(100, 116, 139, 0.05))',
      border: 'rgba(148, 163, 184, 0.3)',
      color: '#94A3B8',
      icon: '🔍',
      label: 'Đang kiểm tra',
      glow: 'none',
    },
  };

  const c = config[level];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 14px',
      borderRadius: '50px',
      background: c.bg,
      border: `1px solid ${c.border}`,
      boxShadow: c.glow,
      marginTop: '8px',
      width: 'fit-content',
      transition: 'all 0.3s ease',
    }}>
      <span style={{ fontSize: '14px' }}>{c.icon}</span>
      <span style={{
        fontSize: '11px',
        fontWeight: '700',
        color: c.color,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
      }}>
        {c.label}
      </span>
      <span style={{
        fontSize: '10px',
        color: c.color,
        opacity: 0.7,
        fontWeight: '500',
      }}>
        {Math.round(aiConfidence)}%
      </span>
    </div>
  );
};

export default AiDetectionBadge;
