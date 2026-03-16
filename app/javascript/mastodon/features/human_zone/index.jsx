import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';
import api from 'mastodon/api';
import { me } from 'mastodon/initial_state';

const messages = defineMessages({
  title: { id: 'human_zone.title', defaultMessage: 'Human-Only Zone' },
});

const mapStateToProps = (state) => ({
  myAccount: state.getIn(['accounts', me]),
});

class HumanOnlyZone extends ImmutablePureComponent {
  state = {
    statuses: [],
    loading: true,
    posting: false,
    newText: '',
    error: null,
  };

  componentDidMount() {
    this.fetchFeed();
  }

  fetchFeed = () => {
    this.setState({ loading: true });
    api().get('/api/v1/human_zone/feed')
      .then(res => {
        this.setState({ statuses: res.data, loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  handlePost = () => {
    const { newText } = this.state;
    if (!newText.trim()) return;

    this.setState({ posting: true, error: null });
    api().post('/api/v1/human_zone/post', { text: newText })
      .then(res => {
        this.setState(prev => ({
          statuses: [res.data, ...prev.statuses],
          newText: '',
          posting: false,
        }));
      })
      .catch(err => {
        const msg = err.response?.data?.error || 'Không thể đăng bài. Hãy xác minh danh tính trước.';
        this.setState({ error: msg, posting: false });
      });
  };

  isVerified = () => {
    const { myAccount } = this.props;
    if (!myAccount) return false;
    const isGuardian = myAccount.get('is_guardian');
    const trustScore = myAccount.get('trust_score') || 0;
    return isGuardian || trustScore >= 70;
  };

  render() {
    const { statuses, loading, posting, newText, error } = this.state;
    const verified = this.isVerified();
    const { myAccount } = this.props;

    return (
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerGlow} />
          <h1 style={styles.title}>🛡️ Khu Vực Người Thật</h1>
          <p style={styles.subtitle}>Human-Only Verification Zone</p>
          <div style={styles.badge}>
            <span style={styles.badgeIcon}>{verified ? '✅' : '🔒'}</span>
            <span style={styles.badgeText}>
              {verified ? 'Đã Xác Minh — Bạn là Người Thật' : 'Chưa Xác Minh'}
            </span>
          </div>
        </div>

        {/* Stats Bar */}
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>{statuses.length}</span>
            <span style={styles.statLabel}>Bài Đăng</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statNumber}>🛡️</span>
            <span style={styles.statLabel}>Chỉ Người Thật</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statNumber}>🤖❌</span>
            <span style={styles.statLabel}>Không Bot / AI</span>
          </div>
        </div>

        {/* Gate Banner for non-verified */}
        {!verified && (
          <div style={styles.gateBanner}>
            <div style={styles.gateIcon}>🛡️</div>
            <h2 style={styles.gateTitle}>Xác Minh Để Tham Gia</h2>
            <p style={styles.gateDesc}>
              Khu vực này chỉ dành cho người dùng đã được xác minh danh tính thật.
              Trở thành <strong>Guardian</strong> hoặc đạt <strong>Trust Score ≥ 70</strong> để đăng bài.
            </p>
            <div style={styles.gateSteps}>
              <div style={styles.gateStep}>
                <span style={styles.stepNum}>1</span>
                <span>Xác minh khuôn mặt</span>
              </div>
              <div style={styles.gateStep}>
                <span style={styles.stepNum}>2</span>
                <span>Nhận 3 Vouch từ Guardian</span>
              </div>
              <div style={styles.gateStep}>
                <span style={styles.stepNum}>3</span>
                <span>Đạt Trust Score ≥ 70</span>
              </div>
            </div>
            <a href='/guardians' style={styles.gateCta}>
              🚀 Bắt Đầu Xác Minh
            </a>
          </div>
        )}

        {/* Compose Area - Only for verified */}
        {verified && (
          <div style={styles.composeArea}>
            <div style={styles.composeHeader}>
              <span style={styles.composeAvatar}>
                {myAccount?.get('display_name')?.charAt(0) || '👤'}
              </span>
              <span style={styles.composeLabel}>Đăng bài trong Khu Vực Người Thật</span>
            </div>
            <textarea
              style={styles.textarea}
              placeholder="Chia sẻ sự thật đã xác minh... (chỉ người thật mới đọc được)"
              value={newText}
              onChange={(e) => this.setState({ newText: e.target.value })}
              rows={3}
            />
            {error && <div style={styles.errorMsg}>{error}</div>}
            <button
              style={{
                ...styles.postBtn,
                opacity: posting || !newText.trim() ? 0.5 : 1
              }}
              onClick={this.handlePost}
              disabled={posting || !newText.trim()}
            >
              {posting ? '⏳ Đang đăng...' : '🛡️ Đăng Bài Người Thật'}
            </button>
          </div>
        )}

        {/* Feed */}
        <div style={styles.feed}>
          <h2 style={styles.feedTitle}>📜 Feed Người Thật</h2>

          {loading && (
            <div style={styles.loadingState}>
              <div style={styles.spinner} />
              <span>Đang tải...</span>
            </div>
          )}

          {!loading && statuses.length === 0 && (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🌱</span>
              <p>Chưa có bài đăng nào trong Khu Vực Người Thật.</p>
              <p style={styles.emptyHint}>Hãy là người đầu tiên đăng bài!</p>
            </div>
          )}

          {statuses.map((status) => (
            <div key={status.id} style={styles.statusCard}>
              <div style={styles.statusHeader}>
                <div style={styles.statusAvatar}>
                  <img
                    src={status.account?.avatar}
                    alt={status.account?.display_name}
                    style={styles.avatarImg}
                  />
                  <div style={styles.verifiedDot} />
                </div>
                <div style={styles.statusMeta}>
                  <span style={styles.statusName}>
                    {status.account?.display_name}
                    <span style={styles.verifiedBadge}> ✅ Người Thật</span>
                  </span>
                  <span style={styles.statusTime}>
                    @{status.account?.acct} · {new Date(status.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
              <div
                style={styles.statusContent}
                dangerouslySetInnerHTML={{ __html: status.content }}
              />
              <div style={styles.statusFooter}>
                <span style={styles.humanTag}>🛡️ Human Zone</span>
                {status.truth_score > 0 && (
                  <span style={styles.truthTag}>🎯 Truth: {Math.round(status.truth_score)}%</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

// Premium UI Styles
const styles = {
  container: {
    maxWidth: '680px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  header: {
    position: 'relative',
    textAlign: 'center',
    padding: '40px 20px 30px',
    background: 'linear-gradient(135deg, #0a1628 0%, #1a2a4a 50%, #0d2137 100%)',
    borderRadius: '24px',
    marginBottom: '20px',
    overflow: 'hidden',
    border: '1px solid rgba(74, 222, 128, 0.3)',
    boxShadow: '0 0 40px rgba(74, 222, 128, 0.1)',
  },
  headerGlow: {
    position: 'absolute',
    top: '-50%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(74, 222, 128, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#4ADE80',
    margin: '0 0 8px 0',
    position: 'relative',
    zIndex: 1,
    textShadow: '0 0 20px rgba(74, 222, 128, 0.3)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    margin: '0 0 20px 0',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    position: 'relative',
    zIndex: 1,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    borderRadius: '50px',
    background: 'rgba(74, 222, 128, 0.1)',
    border: '1px solid rgba(74, 222, 128, 0.3)',
    position: 'relative',
    zIndex: 1,
  },
  badgeIcon: { fontSize: '18px' },
  badgeText: { color: '#4ADE80', fontSize: '13px', fontWeight: '600' },

  statsBar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    padding: '16px 24px',
    background: 'rgba(26, 42, 74, 0.5)',
    borderRadius: '16px',
    marginBottom: '20px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  statNumber: { fontSize: '20px', fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' },
  statDivider: { width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' },

  gateBanner: {
    textAlign: 'center',
    padding: '40px 30px',
    background: 'linear-gradient(135deg, #1a0a28 0%, #2a1a3a 50%, #1a0a28 100%)',
    borderRadius: '24px',
    marginBottom: '20px',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    boxShadow: '0 0 30px rgba(168, 85, 247, 0.1)',
  },
  gateIcon: { fontSize: '48px', marginBottom: '12px' },
  gateTitle: { fontSize: '22px', fontWeight: '700', color: '#A855F7', margin: '0 0 12px 0' },
  gateDesc: { fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: '0 0 24px 0' },
  gateSteps: { display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  gateStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(168, 85, 247, 0.1)',
    borderRadius: '12px',
    color: '#D8B4FE',
    fontSize: '13px',
  },
  stepNum: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#A855F7',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '700',
  },
  gateCta: {
    display: 'inline-block',
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
    color: '#fff',
    borderRadius: '50px',
    fontSize: '15px',
    fontWeight: '700',
    textDecoration: 'none',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 20px rgba(168, 85, 247, 0.3)',
  },

  composeArea: {
    padding: '24px',
    background: 'rgba(10, 22, 40, 0.8)',
    borderRadius: '20px',
    marginBottom: '20px',
    border: '1px solid rgba(74, 222, 128, 0.2)',
  },
  composeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  composeAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4ADE80, #22C55E)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: '#fff',
    fontWeight: '700',
  },
  composeLabel: { color: 'rgba(255,255,255,0.7)', fontSize: '14px' },
  textarea: {
    width: '100%',
    padding: '16px',
    borderRadius: '16px',
    border: '1px solid rgba(74, 222, 128, 0.2)',
    background: 'rgba(0,0,0,0.3)',
    color: '#fff',
    fontSize: '15px',
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  errorMsg: {
    color: '#FF6B6B',
    fontSize: '13px',
    padding: '8px 12px',
    background: 'rgba(255, 107, 107, 0.1)',
    borderRadius: '8px',
    marginTop: '8px',
  },
  postBtn: {
    marginTop: '12px',
    width: '100%',
    padding: '14px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #4ADE80, #22C55E)',
    color: '#0a1628',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 20px rgba(74, 222, 128, 0.3)',
  },

  feed: {
    marginTop: '8px',
  },
  feedTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '16px',
  },
  loadingState: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(74, 222, 128, 0.2)',
    borderTopColor: '#4ADE80',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: 'rgba(255,255,255,0.5)',
  },
  emptyIcon: { fontSize: '48px', display: 'block', marginBottom: '12px' },
  emptyHint: { fontSize: '13px', color: 'rgba(255,255,255,0.3)' },

  statusCard: {
    padding: '20px',
    background: 'rgba(10, 22, 40, 0.6)',
    borderRadius: '16px',
    marginBottom: '12px',
    border: '1px solid rgba(74, 222, 128, 0.15)',
    transition: 'border-color 0.2s',
  },
  statusHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  statusAvatar: { position: 'relative' },
  avatarImg: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '2px solid #4ADE80',
  },
  verifiedDot: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: '#4ADE80',
    border: '2px solid #0a1628',
  },
  statusMeta: { display: 'flex', flexDirection: 'column' },
  statusName: { color: '#fff', fontWeight: '600', fontSize: '15px' },
  verifiedBadge: { color: '#4ADE80', fontSize: '12px', fontWeight: '500' },
  statusTime: { color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' },
  statusContent: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '15px',
    lineHeight: '1.6',
    marginBottom: '12px',
  },
  statusFooter: {
    display: 'flex',
    gap: '8px',
  },
  humanTag: {
    padding: '4px 12px',
    borderRadius: '50px',
    background: 'rgba(74, 222, 128, 0.1)',
    color: '#4ADE80',
    fontSize: '11px',
    fontWeight: '600',
  },
  truthTag: {
    padding: '4px 12px',
    borderRadius: '50px',
    background: 'rgba(244, 197, 66, 0.1)',
    color: '#F4C542',
    fontSize: '11px',
    fontWeight: '600',
  },
};

export default connect(mapStateToProps)(injectIntl(HumanOnlyZone));
