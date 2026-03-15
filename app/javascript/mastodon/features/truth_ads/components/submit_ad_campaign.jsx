import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import api from 'mastodon/api';

const messages = defineMessages({
  submit: { id: 'truth_ads.submit', defaultMessage: 'Gửi Hồ Sơ Quảng Cáo' },
  submitting: { id: 'truth_ads.submitting', defaultMessage: 'Đang gửi...' },
  success: { id: 'truth_ads.success', defaultMessage: '🦀 Hồ sơ đã gửi! Đang chờ HCRAB kiểm duyệt...' },
});

const SubmitAdCampaign = () => {
  const intl = useIntl();
  const [form, setForm] = useState({
    product_name: '',
    marketing_text: '',
    target_url: '',
    budget: 100,
  });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await api().post('/api/v1/marketing_claims', { marketing_claim: form });
      setStatus('success');
      setMessage(intl.formatMessage(messages.success));
      setForm({ product_name: '', marketing_text: '', target_url: '', budget: 100 });
    } catch (err) {
      setStatus('error');
      setMessage('Lỗi: ' + (err?.response?.data?.error || 'Không thể gửi hồ sơ'));
    }
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(244,197,66,0.3)',
    borderRadius: '8px', color: '#fff', padding: '10px 14px', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box', marginTop: '6px',
    transition: 'border-color 0.2s',
  };
  const labelStyle = { fontSize: '12px', color: '#aaa', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' };
  const fieldStyle = { marginBottom: '16px' };

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '24px', background: 'rgba(0,0,0,0.7)', borderRadius: '16px', border: '1px solid rgba(244,197,66,0.2)', backdropFilter: 'blur(10px)' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '36px' }}>🦀</div>
        <h2 style={{ color: '#F4C542', margin: '8px 0 4px', fontSize: '20px' }}>HCRAB Truth Advertising</h2>
        <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>Quảng cáo được xác minh bởi 100% người dùng thật</p>
      </div>

      {/* CRAB Steps explained */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
        {[
          { letter: 'C', label: 'Claim', desc: 'Bạn gửi tuyên bố marketing' },
          { letter: 'R', label: 'Reference', desc: 'Hệ thống tìm người thật phù hợp' },
          { letter: 'A', label: 'Authenticate', desc: 'Họ xác nhận bằng bằng chứng thật' },
          { letter: 'B', label: 'Broadcast', desc: 'Quảng cáo được phát sóng có điểm tin cậy' },
        ].map(({ letter, label, desc }) => (
          <div key={letter} style={{ background: 'rgba(244,197,66,0.08)', borderRadius: '8px', padding: '10px', border: '1px solid rgba(244,197,66,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ background: '#F4C542', color: '#000', fontWeight: 'bold', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>{letter}</span>
              <span style={{ color: '#F4C542', fontWeight: '600', fontSize: '13px' }}>{label}</span>
            </div>
            <p style={{ color: '#ccc', fontSize: '11px', margin: 0 }}>{desc}</p>
          </div>
        ))}
      </div>

      {status === 'success' ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#4ADE80', fontSize: '16px', fontWeight: '600' }}>
          {message}
          <button onClick={() => setStatus('idle')} style={{ display: 'block', margin: '12px auto 0', background: 'transparent', border: '1px solid #4ADE80', color: '#4ADE80', borderRadius: '8px', padding: '8px 18px', cursor: 'pointer' }}>
            Gửi thêm tuyên bố khác
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Tên Sản Phẩm / Thương Hiệu</label>
            <input name='product_name' value={form.product_name} onChange={handleChange} required style={inputStyle} placeholder='Ví dụ: Trà thảo mộc Dr. Thanh' />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Tuyên Bố Marketing (Claim)</label>
            <textarea name='marketing_text' value={form.marketing_text} onChange={handleChange} required rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder='Ví dụ: Sản phẩm này giúp thanh nhiệt, giải độc 100% tự nhiên...' />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>URL Trang Đích</label>
            <input type='url' name='target_url' value={form.target_url} onChange={handleChange} style={inputStyle} placeholder='https://your-brand.com' />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Ngân Sách Quảng Cáo (Truth Berries 🫐)</label>
            <input type='number' name='budget' value={form.budget} onChange={handleChange} min={10} required style={inputStyle} />
            <p style={{ color: '#888', fontSize: '11px', margin: '4px 0 0' }}>30% ({Math.round(form.budget * 0.3)} 🫐) được chia cho {'{'}N{'}'} Guardian xác minh thật sự</p>
          </div>

          {status === 'error' && (
            <div style={{ color: '#FF6B6B', fontSize: '13px', marginBottom: '12px' }}>{message}</div>
          )}

          <button
            type='submit'
            disabled={status === 'submitting'}
            style={{
              width: '100%', padding: '12px', background: status === 'submitting' ? 'rgba(244,197,66,0.4)' : '#F4C542',
              color: '#000', fontWeight: '700', fontSize: '15px', border: 'none', borderRadius: '10px',
              cursor: status === 'submitting' ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
            }}
          >
            {status === 'submitting' ? intl.formatMessage(messages.submitting) : '🦀 ' + intl.formatMessage(messages.submit)}
          </button>
          <p style={{ color: '#666', fontSize: '11px', textAlign: 'center', margin: '10px 0 0' }}>
            Chỉ quảng cáo được người thật xác nhận mới được phát sóng. Không có acc ảo.
          </p>
        </form>
      )}
    </div>
  );
};

export default SubmitAdCampaign;
