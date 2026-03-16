import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';
import api from 'mastodon/api';
import { me } from 'mastodon/initial_state';

const CLAIM_TYPES = {
  marketing:    { icon: '📢', label: 'Marketing', color: '#F59E0B' },
  product:      { icon: '📦', label: 'Sản Phẩm', color: '#3B82F6' },
  location:     { icon: '📍', label: 'Địa Điểm', color: '#10B981' },
  identity:     { icon: '👤', label: 'Danh Tính', color: '#8B5CF6' },
  content:      { icon: '📝', label: 'Nội Dung', color: '#EC4899' },
  real_estate:  { icon: '🏠', label: 'Bất Động Sản', color: '#EF4444' },
};

const mapStateToProps = (state) => ({
  myAccount: state.getIn(['accounts', me]),
});

class VerificationDashboard extends ImmutablePureComponent {
  state = {
    tasks: [],
    contributions: null,
    loading: true,
    activeTab: 'tasks',
    selectedTask: null,
    evidenceForm: { evidence_type: 'text', evidence_text: '', vote: 'confirm', confidence: 0.8 },
    submitting: false,
    message: null,
  };

  componentDidMount() {
    this.fetchTasks();
    this.fetchContributions();
  }

  fetchTasks = () => {
    this.setState({ loading: true });
    api().get('/api/v1/verification_tasks')
      .then(res => this.setState({ tasks: res.data, loading: false }))
      .catch(() => this.setState({ loading: false }));
  };

  fetchContributions = () => {
    api().get('/api/v1/verification_tasks/my_contributions')
      .then(res => this.setState({ contributions: res.data }))
      .catch(() => {});
  };

  handleSubmitEvidence = (taskId) => {
    const { evidenceForm } = this.state;
    this.setState({ submitting: true, message: null });

    api().post(`/api/v1/verification_tasks/${taskId}/submit_evidence`, evidenceForm)
      .then(res => {
        this.setState({
          submitting: false,
          message: { type: 'success', text: `✅ Đã gửi! ${res.data.reward}` },
          selectedTask: null,
          evidenceForm: { evidence_type: 'text', evidence_text: '', vote: 'confirm', confidence: 0.8 },
        });
        this.fetchTasks();
        this.fetchContributions();
      })
      .catch(err => {
        this.setState({
          submitting: false,
          message: { type: 'error', text: err.response?.data?.error || err.response?.data?.errors?.join(', ') || 'Lỗi' },
        });
      });
  };

  render() {
    const { tasks, contributions, loading, activeTab, selectedTask, evidenceForm, submitting, message } = this.state;

    return (
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerGlow} />
          <h1 style={styles.title}>🔍 Xác Thực Dữ Liệu</h1>
          <p style={styles.subtitle}>Community Data Verification</p>
          <p style={styles.desc}>
            Tham gia xác minh thông tin cùng cộng đồng. Gửi bằng chứng, bỏ phiếu, nhận <strong>Truth Berries 🫐</strong>
          </p>
        </div>

        {/* My Stats */}
        {contributions && (
          <div style={styles.myStats}>
            <div style={styles.myStatItem}>
              <span style={styles.myStatNum}>{contributions.total_contributions}</span>
              <span style={styles.myStatLabel}>Đã Xác Minh</span>
            </div>
            <div style={styles.myStatDivider} />
            <div style={styles.myStatItem}>
              <span style={styles.myStatNum}>🫐 {contributions.total_berries_earned}</span>
              <span style={styles.myStatLabel}>Truth Berries</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === 'tasks' ? styles.tabActive : {}) }}
            onClick={() => this.setState({ activeTab: 'tasks' })}
          >
            📋 Nhiệm Vụ ({tasks.length})
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'history' ? styles.tabActive : {}) }}
            onClick={() => this.setState({ activeTab: 'history' })}
          >
            📊 Lịch Sử
          </button>
        </div>

        {message && (
          <div style={{ ...styles.msgBox, borderColor: message.type === 'success' ? '#4ADE80' : '#EF4444', color: message.type === 'success' ? '#4ADE80' : '#EF4444' }}>
            {message.text}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div>
            {loading && <div style={styles.loading}>⏳ Đang tải nhiệm vụ...</div>}

            {!loading && tasks.length === 0 && (
              <div style={styles.empty}>
                <span style={{ fontSize: '48px' }}>🔍</span>
                <p>Chưa có nhiệm vụ xác minh nào.</p>
              </div>
            )}

            {tasks.map(task => {
              const cfg = CLAIM_TYPES[task.claim_type] || CLAIM_TYPES.content;
              const isSelected = selectedTask === task.id;
              return (
                <div key={task.id} style={styles.taskCard}>
                  <div style={styles.taskHeader}>
                    <span style={{ ...styles.taskType, background: `${cfg.color}20`, color: cfg.color }}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <span style={styles.taskReward}>🫐 +{task.reward_berries}</span>
                  </div>

                  <div style={styles.taskClaim}>{task.claim_text}</div>

                  {task.status_account && (
                    <div style={styles.taskSource}>
                      Từ: <strong>{task.status_account}</strong>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div style={styles.progressContainer}>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${task.progress}%`, background: task.progress >= 100 ? '#4ADE80' : '#3B82F6' }} />
                    </div>
                    <span style={styles.progressText}>{task.current_verifiers}/{task.required_verifiers} người</span>
                  </div>

                  <div style={styles.taskMeta}>
                    <span style={styles.taskStatus}>
                      {task.verification_status === 'open' && '🟢 Đang Mở'}
                      {task.verification_status === 'verified' && '✅ Đã Xác Minh'}
                      {task.verification_status === 'rejected' && '❌ Bị Từ Chối'}
                      {task.verification_status === 'in_progress' && '🟡 Đang Tiến Hành'}
                    </span>
                    <span style={styles.taskExpiry}>
                      ⏰ {new Date(task.expires_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  {task.verification_status === 'open' && (
                    <button
                      style={styles.verifyBtn}
                      onClick={() => this.setState({ selectedTask: isSelected ? null : task.id })}
                    >
                      {isSelected ? '✕ Đóng' : '🔍 Tham Gia Xác Minh'}
                    </button>
                  )}

                  {/* Evidence Submission Form */}
                  {isSelected && (
                    <div style={styles.evidenceForm}>
                      <h4 style={styles.evidenceTitle}>📋 Gửi Bằng Chứng</h4>

                      <div style={styles.voteRow}>
                        {['confirm', 'deny', 'unsure'].map(v => (
                          <button key={v} onClick={() => this.setState(s => ({ evidenceForm: { ...s.evidenceForm, vote: v } }))}
                            style={{ ...styles.voteBtn, ...(evidenceForm.vote === v ? {
                              background: v === 'confirm' ? '#4ADE80' : v === 'deny' ? '#EF4444' : '#F59E0B',
                              color: '#000', fontWeight: '700'
                            } : {}) }}>
                            {v === 'confirm' ? '✅ Xác Nhận' : v === 'deny' ? '❌ Từ Chối' : '🤔 Chưa Chắc'}
                          </button>
                        ))}
                      </div>

                      <select style={styles.input} value={evidenceForm.evidence_type}
                        onChange={e => this.setState(s => ({ evidenceForm: { ...s.evidenceForm, evidence_type: e.target.value } }))}>
                        <option value="text">📝 Văn bản</option>
                        <option value="photo">📸 Ảnh</option>
                        <option value="location">📍 Vị trí</option>
                        <option value="document">📄 Tài liệu</option>
                        <option value="video">🎥 Video</option>
                        <option value="review">⭐ Đánh giá</option>
                      </select>

                      <textarea style={styles.textarea} rows={3}
                        placeholder="Mô tả bằng chứng của bạn..."
                        value={evidenceForm.evidence_text}
                        onChange={e => this.setState(s => ({ evidenceForm: { ...s.evidenceForm, evidence_text: e.target.value } }))}
                      />

                      <div style={styles.confidenceRow}>
                        <span style={styles.confidenceLabel}>Độ tin cậy: {Math.round(evidenceForm.confidence * 100)}%</span>
                        <input type="range" min="0" max="100" value={evidenceForm.confidence * 100}
                          onChange={e => this.setState(s => ({ evidenceForm: { ...s.evidenceForm, confidence: e.target.value / 100 } }))}
                          style={styles.slider}
                        />
                      </div>

                      <button style={{ ...styles.submitBtn, opacity: submitting ? 0.5 : 1 }}
                        onClick={() => this.handleSubmitEvidence(task.id)} disabled={submitting}>
                        {submitting ? '⏳ Đang gửi...' : '🚀 Gửi Bằng Chứng & Nhận Berries'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && contributions && (
          <div>
            {contributions.recent.length === 0 && (
              <div style={styles.empty}>
                <span style={{ fontSize: '48px' }}>📊</span>
                <p>Bạn chưa tham gia xác minh nào.</p>
              </div>
            )}

            {contributions.recent.map(item => (
              <div key={item.id} style={styles.historyCard}>
                <div style={styles.historyHeader}>
                  <span style={{
                    ...styles.historyVote,
                    color: item.vote === 'confirm' ? '#4ADE80' : item.vote === 'deny' ? '#EF4444' : '#F59E0B'
                  }}>
                    {item.vote === 'confirm' ? '✅' : item.vote === 'deny' ? '❌' : '🤔'} {item.vote}
                  </span>
                  <span style={styles.historyDate}>{new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
                {item.evidence_text && <div style={styles.historyText}>{item.evidence_text}</div>}
                {item.task && (
                  <div style={styles.historyTask}>
                    📋 {item.task.claim_text}
                    <span style={{ marginLeft: '8px', fontSize: '11px', color: item.task.verification_status === 'verified' ? '#4ADE80' : '#F59E0B' }}>
                      ({item.task.verification_status})
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  container: { maxWidth: '680px', margin: '0 auto', padding: '20px', fontFamily: "'Inter', -apple-system, sans-serif" },
  header: {
    position: 'relative', textAlign: 'center', padding: '40px 20px 30px',
    background: 'linear-gradient(135deg, #0a1a10 0%, #0d2a1a 50%, #0a1a10 100%)',
    borderRadius: '24px', marginBottom: '20px', overflow: 'hidden',
    border: '1px solid rgba(16, 185, 129, 0.3)', boxShadow: '0 0 40px rgba(16, 185, 129, 0.1)',
  },
  headerGlow: {
    position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)',
    width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)', borderRadius: '50%',
  },
  title: { fontSize: '28px', fontWeight: '800', color: '#10B981', margin: '0 0 8px', position: 'relative', zIndex: 1 },
  subtitle: { fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '0 0 12px', letterSpacing: '2px', textTransform: 'uppercase', position: 'relative', zIndex: 1 },
  desc: { fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0, position: 'relative', zIndex: 1 },

  myStats: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', padding: '16px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', marginBottom: '20px', border: '1px solid rgba(16, 185, 129, 0.15)' },
  myStatItem: { textAlign: 'center' },
  myStatNum: { fontSize: '22px', fontWeight: '700', color: '#fff', display: 'block' },
  myStatLabel: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },
  myStatDivider: { width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' },

  tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
  tab: { flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
  tabActive: { background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#10B981' },

  msgBox: { padding: '12px 16px', borderRadius: '12px', border: '1px solid', background: 'rgba(0,0,0,0.2)', marginBottom: '16px', fontSize: '14px' },
  loading: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '40px' },
  empty: { textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' },

  taskCard: { padding: '20px', background: 'rgba(10, 26, 16, 0.6)', borderRadius: '16px', marginBottom: '12px', border: '1px solid rgba(16, 185, 129, 0.15)' },
  taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  taskType: { padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '600' },
  taskReward: { fontSize: '14px', fontWeight: '700', color: '#A78BFA' },
  taskClaim: { fontSize: '15px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.5', marginBottom: '8px' },
  taskSource: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px' },

  progressContainer: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
  progressBar: { flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s' },
  progressText: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' },

  taskMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '12px' },
  taskStatus: { color: 'rgba(255,255,255,0.6)' },
  taskExpiry: { color: 'rgba(255,255,255,0.4)' },

  verifyBtn: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },

  evidenceForm: { marginTop: '16px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' },
  evidenceTitle: { fontSize: '16px', fontWeight: '700', color: '#fff', marginTop: 0, marginBottom: '16px' },
  voteRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
  voteBtn: { flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.7)', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' },

  input: { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '13px', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '13px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: '10px', boxSizing: 'border-box' },

  confidenceRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  confidenceLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' },
  slider: { flex: 1 },

  submitBtn: { width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)' },

  historyCard: { padding: '16px', background: 'rgba(10, 26, 16, 0.4)', borderRadius: '12px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.05)' },
  historyHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  historyVote: { fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' },
  historyDate: { fontSize: '11px', color: 'rgba(255,255,255,0.4)' },
  historyText: { fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' },
  historyTask: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', padding: '6px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' },
};

export default connect(mapStateToProps)(injectIntl(VerificationDashboard));
