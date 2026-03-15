import React, { useState, useEffect } from 'react';
import api from 'mastodon/api';

const FOCUS_AREAS = [
  { value: 'crypto_scam', label: '🔐 Chống Lừa Đảo Crypto', emoji: '🔐' },
  { value: 'health_fake', label: '🏥 Chống Tin Giả Y Tế', emoji: '🏥' },
  { value: 'politics', label: '🏛️ Kiểm Chứng Chính Trị', emoji: '🏛️' },
  { value: 'real_estate', label: '🏠 Sự Thật Bất Động Sản', emoji: '🏠' },
  { value: 'ecommerce', label: '🛍️ Review Thật Thương Mại', emoji: '🛍️' },
  { value: 'environment', label: '🌿 Môi Trường Sự Thật', emoji: '🌿' },
  { value: 'general', label: '🔍 Săn Sự Thật Tổng Hợp', emoji: '🔍' },
];

const GuildCard = ({ guild, onJoin, onLeave, memberOf }) => {
  const isMember = memberOf.includes(guild.id);
  const repPercent = Math.min(100, (guild.reputation_points / 1000) * 100);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px',
      border: '1px solid rgba(255,255,255,0.08)', marginBottom: '12px',
      transition: 'border-color 0.2s', cursor: 'default',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '15px', color: '#fff' }}>{guild.name}</div>
          <div style={{ fontSize: '12px', color: '#F4C542', marginTop: '2px' }}>
            {FOCUS_AREAS.find(f => f.value === guild.focus_area)?.label || guild.focus_area}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '10px' }}>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#F4C542' }}>
            {guild.reputation_points.toLocaleString()}
          </div>
          <div style={{ fontSize: '10px', color: '#888' }}>điểm danh dự</div>
        </div>
      </div>

      {guild.description && (
        <p style={{ fontSize: '13px', color: '#aaa', margin: '0 0 10px', lineHeight: '1.4' }}>{guild.description}</p>
      )}

      {/* Reputation bar */}
      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: '4px', marginBottom: '12px' }}>
        <div style={{ background: 'linear-gradient(90deg, #F4C542, #4ADE80)', width: `${repPercent}%`, height: '100%', borderRadius: '4px', transition: 'width 0.5s' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#666' }}>👥 {guild.member_count} thành viên</span>
        {isMember ? (
          <button onClick={() => onLeave(guild.id)} style={{
            background: 'transparent', border: '1px solid #555', color: '#888',
            borderRadius: '8px', padding: '5px 14px', fontSize: '12px', cursor: 'pointer',
          }}>Rời Băng</button>
        ) : (
          <button onClick={() => onJoin(guild.id)} style={{
            background: 'rgba(244,197,66,0.15)', border: '1px solid #F4C542',
            color: '#F4C542', borderRadius: '8px', padding: '5px 14px', fontSize: '12px', cursor: 'pointer',
            fontWeight: '600',
          }}>⚔️ Gia Nhập</button>
        )}
      </div>
    </div>
  );
};

const TruthHunterGuilds = () => {
  const [guilds, setGuilds] = useState([]);
  const [memberOf, setMemberOf] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', focus_area: 'crypto_scam' });

  const fetchGuilds = async () => {
    try {
      const res = await api().get('/api/v1/guilds');
      setGuilds(res.data);
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchGuilds(); }, []);

  const handleJoin = async (guildId) => {
    try {
      await api().post(`/api/v1/guilds/${guildId}/join`);
      setMemberOf(prev => [...prev, guildId]);
    } catch (e) { /* ignore */ }
  };

  const handleLeave = async (guildId) => {
    try {
      await api().delete(`/api/v1/guilds/${guildId}/leave`);
      setMemberOf(prev => prev.filter(id => id !== guildId));
    } catch (e) { /* ignore */ }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api().post('/api/v1/guilds', { guild: form });
      setGuilds(prev => [res.data, ...prev]);
      setMemberOf(prev => [...prev, res.data.id]);
      setShowCreate(false);
      setForm({ name: '', description: '', focus_area: 'crypto_scam' });
    } catch (e) { /* ignore */ }
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: '#fff', padding: '10px 14px', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', marginTop: '6px',
  };

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>⚔️ Bang Hội Săn Sự Thật</h2>
          <p style={{ color: '#888', margin: '4px 0 0', fontSize: '13px' }}>
            Cạnh tranh trên Bảng Vàng — Nhóm nào kiểm chứng nhiều sự thật nhất sẽ thắng
          </p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={{
          background: '#F4C542', color: '#000', border: 'none', borderRadius: '10px',
          padding: '8px 16px', fontWeight: '700', cursor: 'pointer', flexShrink: 0,
        }}>
          + Lập Bang
        </button>
      </div>

      {/* Create Guild Form */}
      {showCreate && (
        <form onSubmit={handleCreate} style={{
          background: 'rgba(244,197,66,0.08)', border: '1px solid rgba(244,197,66,0.2)',
          borderRadius: '12px', padding: '16px', marginBottom: '20px',
        }}>
          <h3 style={{ color: '#F4C542', margin: '0 0 14px', fontSize: '15px' }}>🏴‍☠️ Lập Bang Hội Mới</h3>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase' }}>Tên Bang Hội</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inputStyle} placeholder='Ví dụ: Đội Cảnh Sát Crypto' />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase' }}>Lĩnh Vực Chuyên Trách</label>
            <select value={form.focus_area} onChange={e => setForm({ ...form, focus_area: e.target.value })} style={{ ...inputStyle }}>
              {FOCUS_AREAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase' }}>Mô Tả (tuỳ chọn)</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder='Sứ mệnh của nhóm bạn là gì?' />
          </div>
          <button type='submit' style={{
            width: '100%', background: '#F4C542', color: '#000', border: 'none',
            borderRadius: '8px', padding: '10px', fontWeight: '700', cursor: 'pointer',
          }}>
            Thành Lập Bang
          </button>
        </form>
      )}

      {/* Leaderboard */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>Đang tải Bảng Vàng...</div>
      ) : guilds.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚔️</div>
          <p>Chưa có Bang Hội nào. Hãy là người đặt nền móng đầu tiên!</p>
        </div>
      ) : (
        guilds.map((guild, idx) => (
          <div key={guild.id} style={{ position: 'relative' }}>
            {idx < 3 && (
              <div style={{
                position: 'absolute', top: '16px', left: '-8px',
                background: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32',
                color: '#000', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', fontWeight: '800', zIndex: 1,
              }}>
                #{idx + 1}
              </div>
            )}
            <GuildCard
              guild={guild}
              onJoin={handleJoin}
              onLeave={handleLeave}
              memberOf={memberOf}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default TruthHunterGuilds;
