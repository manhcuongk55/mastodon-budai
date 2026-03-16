import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';
import api from 'mastodon/api';

const AGENT_TYPE_CONFIG = {
  assistant:  { icon: '🤖', label: 'Trợ Lý', color: '#3B82F6' },
  marketing:  { icon: '📢', label: 'Marketing', color: '#F59E0B' },
  analytics:  { icon: '📊', label: 'Phân Tích', color: '#8B5CF6' },
  creative:   { icon: '🎨', label: 'Sáng Tạo', color: '#EC4899' },
  autonomous: { icon: '⚡', label: 'Tự Chủ', color: '#EF4444' },
  other:      { icon: '🔧', label: 'Khác', color: '#6B7280' },
};

class AiAgentRegistry extends ImmutablePureComponent {
  state = {
    agents: [],
    stats: null,
    loading: true,
    showRegisterForm: false,
    formData: { agent_name: '', agent_type: 'assistant', operator_name: '', operator_url: '', purpose: '', capabilities: '' },
    submitting: false,
    error: null,
    success: null,
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    this.setState({ loading: true });
    Promise.all([
      api().get('/api/v1/ai_agent_registry'),
      api().get('/api/v1/ai_agent_registry/stats'),
    ]).then(([agentsRes, statsRes]) => {
      this.setState({ agents: agentsRes.data, stats: statsRes.data, loading: false });
    }).catch(() => this.setState({ loading: false }));
  };

  handleRegister = () => {
    const { formData } = this.state;
    this.setState({ submitting: true, error: null, success: null });
    api().post('/api/v1/ai_agent_registry', formData)
      .then(() => {
        this.setState({
          submitting: false,
          success: '✅ Đăng ký thành công! Đang chờ Guardian duyệt.',
          showRegisterForm: false,
          formData: { agent_name: '', agent_type: 'assistant', operator_name: '', operator_url: '', purpose: '', capabilities: '' },
        });
        this.fetchData();
      })
      .catch(err => {
        this.setState({
          submitting: false,
          error: err.response?.data?.errors?.join(', ') || 'Đăng ký thất bại',
        });
      });
  };

  updateForm = (field, value) => {
    this.setState(prev => ({ formData: { ...prev.formData, [field]: value } }));
  };

  render() {
    const { agents, stats, loading, showRegisterForm, formData, submitting, error, success } = this.state;

    return (
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerGlow} />
          <h1 style={styles.title}>🤖 AI Agent Registry</h1>
          <p style={styles.subtitle}>Đăng Ký Minh Bạch · Transparency First</p>
          <p style={styles.desc}>
            Trên MAKAI, AI Agent được yêu cầu đăng ký công khai. Người dùng có thể phân biệt
            bot minh bạch và bot ẩn danh. <strong>Minh bạch = Được tin tưởng.</strong>
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span style={styles.statNum}>{stats.total_registered}</span>
              <span style={styles.statLabel}>Đã Đăng Ký</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statNum}>{stats.total_pending}</span>
              <span style={styles.statLabel}>Đang Chờ Duyệt</span>
            </div>
            {Object.entries(stats.by_type || {}).map(([type, count]) => (
              <div key={type} style={{ ...styles.statCard, borderColor: AGENT_TYPE_CONFIG[type]?.color || '#6B7280' }}>
                <span style={styles.statNum}>{AGENT_TYPE_CONFIG[type]?.icon} {count}</span>
                <span style={styles.statLabel}>{AGENT_TYPE_CONFIG[type]?.label || type}</span>
              </div>
            ))}
          </div>
        )}

        {/* Register CTA */}
        {success && <div style={styles.successMsg}>{success}</div>}

        <button
          style={styles.registerBtn}
          onClick={() => this.setState(prev => ({ showRegisterForm: !prev.showRegisterForm }))}
        >
          {showRegisterForm ? '✕ Đóng' : '➕ Đăng Ký AI Agent Mới'}
        </button>

        {/* Registration Form */}
        {showRegisterForm && (
          <div style={styles.form}>
            <h3 style={styles.formTitle}>📋 Đăng Ký AI Agent</h3>

            <label style={styles.label}>Tên Agent *</label>
            <input style={styles.input} placeholder="VD: TruthBot, SummarizeAI..." value={formData.agent_name}
              onChange={e => this.updateForm('agent_name', e.target.value)} />

            <label style={styles.label}>Loại Agent *</label>
            <select style={styles.select} value={formData.agent_type}
              onChange={e => this.updateForm('agent_type', e.target.value)}>
              {Object.entries(AGENT_TYPE_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
              ))}
            </select>

            <label style={styles.label}>Tên Vận Hành *</label>
            <input style={styles.input} placeholder="Tên công ty hoặc cá nhân vận hành" value={formData.operator_name}
              onChange={e => this.updateForm('operator_name', e.target.value)} />

            <label style={styles.label}>URL Vận Hành</label>
            <input style={styles.input} placeholder="https://example.com" value={formData.operator_url}
              onChange={e => this.updateForm('operator_url', e.target.value)} />

            <label style={styles.label}>Mục Đích *</label>
            <textarea style={styles.textarea} placeholder="Agent này giúp gì cho cộng đồng?" value={formData.purpose}
              onChange={e => this.updateForm('purpose', e.target.value)} rows={3} />

            <label style={styles.label}>Khả Năng</label>
            <textarea style={styles.textarea} placeholder="Agent có thể làm gì? (tóm lược, trả lời, tạo ảnh...)" value={formData.capabilities}
              onChange={e => this.updateForm('capabilities', e.target.value)} rows={2} />

            {error && <div style={styles.errorMsg}>{error}</div>}

            <button style={{ ...styles.submitBtn, opacity: submitting ? 0.5 : 1 }}
              onClick={this.handleRegister} disabled={submitting}>
              {submitting ? '⏳ Đang gửi...' : '🤖 Gửi Đăng Ký'}
            </button>
          </div>
        )}

        {/* Agent List */}
        <h2 style={styles.sectionTitle}>📜 AI Agents Đã Đăng Ký</h2>

        {loading && <div style={styles.loading}>Đang tải...</div>}

        {!loading && agents.length === 0 && (
          <div style={styles.empty}>
            <span style={{ fontSize: '48px' }}>🤖</span>
            <p>Chưa có AI Agent nào được đăng ký.</p>
            <p style={{ fontSize: '13px', opacity: 0.5 }}>Hãy là Agent đầu tiên đăng ký minh bạch!</p>
          </div>
        )}

        {agents.map(agent => {
          const cfg = AGENT_TYPE_CONFIG[agent.agent_type] || AGENT_TYPE_CONFIG.other;
          return (
            <div key={agent.id} style={styles.agentCard}>
              <div style={styles.agentHeader}>
                <div style={styles.agentAvatar}>
                  <img src={agent.account?.avatar} alt="" style={styles.avatarImg} />
                  <div style={{ ...styles.typeDot, background: cfg.color }} />
                </div>
                <div style={styles.agentMeta}>
                  <div style={styles.agentName}>
                    {agent.agent_name}
                    <span style={{ ...styles.typeBadge, background: `${cfg.color}20`, color: cfg.color }}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                  <div style={styles.agentOperator}>
                    Vận hành bởi: <strong>{agent.operator_name}</strong>
                    {agent.operator_url && (
                      <a href={agent.operator_url} target="_blank" rel="noopener noreferrer" style={styles.operatorLink}> 🔗</a>
                    )}
                  </div>
                </div>
                <div style={styles.verifiedBadge}>
                  {agent.verified ? '✅ Verified' : '⏳ Pending'}
                </div>
              </div>
              <div style={styles.agentPurpose}>{agent.purpose}</div>
              {agent.capabilities && (
                <div style={styles.agentCapabilities}>
                  <strong>Khả năng:</strong> {agent.capabilities}
                </div>
              )}
              <div style={styles.agentFooter}>
                <span style={styles.registeredDate}>
                  Đăng ký: {new Date(agent.created_at).toLocaleDateString('vi-VN')}
                </span>
                <span style={styles.accountLink}>@{agent.account?.acct}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

const styles = {
  container: { maxWidth: '680px', margin: '0 auto', padding: '20px', fontFamily: "'Inter', -apple-system, sans-serif" },
  header: {
    position: 'relative', textAlign: 'center', padding: '40px 20px 30px',
    background: 'linear-gradient(135deg, #0a1020 0%, #1a1a3a 50%, #0d1030 100%)',
    borderRadius: '24px', marginBottom: '20px', overflow: 'hidden',
    border: '1px solid rgba(99, 102, 241, 0.3)', boxShadow: '0 0 40px rgba(99, 102, 241, 0.1)',
  },
  headerGlow: {
    position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)',
    width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', borderRadius: '50%',
  },
  title: { fontSize: '28px', fontWeight: '800', color: '#818CF8', margin: '0 0 8px', position: 'relative', zIndex: 1 },
  subtitle: { fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '0 0 12px', letterSpacing: '2px', textTransform: 'uppercase', position: 'relative', zIndex: 1 },
  desc: { fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0, position: 'relative', zIndex: 1 },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '20px' },
  statCard: { padding: '16px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' },
  statNum: { fontSize: '22px', fontWeight: '700', color: '#fff', display: 'block' },
  statLabel: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' },

  registerBtn: {
    width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid rgba(99, 102, 241, 0.3)',
    background: 'rgba(99, 102, 241, 0.1)', color: '#818CF8', fontSize: '15px', fontWeight: '700',
    cursor: 'pointer', marginBottom: '20px', transition: 'all 0.2s',
  },
  successMsg: { padding: '12px 16px', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)', borderRadius: '12px', color: '#4ADE80', marginBottom: '16px', fontSize: '14px' },

  form: { padding: '24px', background: 'rgba(10, 16, 32, 0.8)', borderRadius: '20px', marginBottom: '24px', border: '1px solid rgba(99, 102, 241, 0.2)' },
  formTitle: { fontSize: '18px', fontWeight: '700', color: '#fff', marginTop: 0, marginBottom: '16px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: '4px', marginTop: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' },
  errorMsg: { color: '#FF6B6B', fontSize: '13px', padding: '8px 12px', background: 'rgba(255, 107, 107, 0.1)', borderRadius: '8px', marginTop: '12px' },
  submitBtn: { marginTop: '16px', width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', color: '#fff', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)' },

  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '16px' },
  loading: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '40px' },
  empty: { textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' },

  agentCard: { padding: '20px', background: 'rgba(10, 16, 32, 0.6)', borderRadius: '16px', marginBottom: '12px', border: '1px solid rgba(99, 102, 241, 0.15)' },
  agentHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  agentAvatar: { position: 'relative' },
  avatarImg: { width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #6366F1' },
  typeDot: { position: 'absolute', bottom: 0, right: 0, width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #0a1020' },
  agentMeta: { flex: 1 },
  agentName: { color: '#fff', fontWeight: '600', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  typeBadge: { padding: '2px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: '600' },
  agentOperator: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' },
  operatorLink: { textDecoration: 'none' },
  verifiedBadge: { fontSize: '12px', fontWeight: '600', color: '#4ADE80' },
  agentPurpose: { fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5', marginBottom: '8px' },
  agentCapabilities: { fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5', marginBottom: '8px', padding: '8px 12px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px' },
  agentFooter: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.4)' },
  registeredDate: {},
  accountLink: { color: '#818CF8' },
};

export default connect()(injectIntl(AiAgentRegistry));
