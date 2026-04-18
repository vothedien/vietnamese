import { useState, useMemo, useEffect } from 'react';

interface HistoryItem {
  id: number;
  text: string;
  genre: string;
  topic: string;
  timestamp: string;
}

const History = ({ isDarkMode }: any) => {
  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f0f2f5',
    card: isDarkMode ? '#1e293b' : 'white',
    text: isDarkMode ? '#f1f5f9' : '#1a365d',
    subText: isDarkMode ? '#94a3b8' : '#718096',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    tableHeader: isDarkMode ? '#0f172a' : '#f7fafc',
    badgeGenreBg: isDarkMode ? 'rgba(221, 107, 32, 0.2)' : '#fffaf3',
    badgeTopicBg: isDarkMode ? 'rgba(56, 161, 105, 0.2)' : '#f0fff4',
  };

  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [filterGenre, setFilterGenre] = useState('All');
  const [filterTopic, setFilterTopic] = useState('All');
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ genre: '', topic: '' });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('classification_history') || '[]');
    setHistoryData(saved);
  }, []);

  // Sử dụng useMemo để lấy danh sách nhãn duy nhất (Sửa lỗi cảnh báo vàng)
  const genres = useMemo(() => ['All', ...new Set(historyData.map(item => item.genre))], [historyData]);
  const topics = useMemo(() => ['All', ...new Set(historyData.map(item => item.topic))], [historyData]);

  const deleteItem = (id: number) => {
    const updated = historyData.filter(item => item.id !== id);
    localStorage.setItem('classification_history', JSON.stringify(updated));
    setHistoryData(updated);
    setActiveMenu(null);
  };

  const saveEdit = (id: number) => {
    const updated = historyData.map(item => 
      item.id === id ? { ...item, genre: editData.genre, topic: editData.topic } : item
    );
    localStorage.setItem('classification_history', JSON.stringify(updated));
    setHistoryData(updated);
    setEditingId(null);
    setActiveMenu(null);
  };

  const filteredData = historyData.filter(item => {
    const matchGenre = filterGenre === 'All' || item.genre === filterGenre;
    const matchTopic = filterTopic === 'All' || item.topic === filterTopic;
    return matchGenre && matchTopic;
  });

  const selectStyle = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.card,
    color: theme.text,
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer'
  };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '40px 20px', transition: '0.3s', fontFamily: 'Arial' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* THANH TIÊU ĐỀ - KHÔI PHỤC ICON TÌM KIẾM VÀ BỘ LỌC */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid #3182ce`, paddingBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Nút tìm kiếm (Kính lúp) đã quay trở lại */}
            <div style={{ backgroundColor: isDarkMode ? '#3182ce' : '#1a365d', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h2 style={{ color: theme.text, margin: 0 }}>Lịch sử phân loại</h2>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: theme.text }}>Thể loại:</span>
              <select style={selectStyle} value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)}>
                {genres.map(g => <option key={g} value={g} style={{backgroundColor: theme.card}}>{g}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: theme.text }}>Chủ đề:</span>
              <select style={selectStyle} value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)}>
                {topics.map(t => <option key={t} value={t} style={{backgroundColor: theme.card}}>{t}</option>)}
              </select>
            </div>
            <button 
                onClick={() => { if(window.confirm("Xóa toàn bộ lịch sử?")) { localStorage.setItem('classification_history', '[]'); setHistoryData([]); }}} 
                style={{ backgroundColor: '#e53e3e', color: 'white', border: 'none', padding: '9px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
            >
              Xóa tất cả
            </button>
          </div>
        </div>
        
        {/* NỘI DUNG BẢNG */}
        <div style={{ 
            marginTop: '20px', 
            backgroundColor: theme.card, 
            borderRadius: '12px', 
            border: `1px solid ${theme.border}`, 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
            minHeight: filteredData.length <= 2 ? '350px' : 'auto',
            overflow: 'visible',
            paddingBottom: '50px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: theme.tableHeader, textAlign: 'left' }}>
                <th style={{ padding: '15px', borderBottom: `1px solid ${theme.border}`, color: theme.text }}>Thời gian</th>
                <th style={{ padding: '15px', borderBottom: `1px solid ${theme.border}`, color: theme.text }}>Văn bản</th>
                <th style={{ padding: '15px', borderBottom: `1px solid ${theme.border}`, color: theme.text }}>Thể loại</th>
                <th style={{ padding: '15px', borderBottom: `1px solid ${theme.border}`, color: theme.text }}>Chủ đề</th>
                <th style={{ padding: '15px', borderBottom: `1px solid ${theme.border}`, color: theme.text, textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {[...filteredData].reverse().map((item) => (
                <tr key={item.id} style={{ borderBottom: `1px solid ${theme.border}`, color: theme.text }}>
                  <td style={{ padding: '15px', fontSize: '12px', color: theme.subText }}>{item.timestamp}</td>
                  <td style={{ padding: '15px', fontSize: '14px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.text}>
                    {item.text}
                  </td>
                  <td style={{ padding: '15px' }}>
                    {editingId === item.id ? 
                        <input value={editData.genre} onChange={(e) => setEditData({ ...editData, genre: e.target.value })} style={{ width: '80px', border: '1px solid #3182ce', borderRadius: '4px' }} /> 
                        : <span style={{ backgroundColor: theme.badgeGenreBg, color: '#dd6b20', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{item.genre}</span>
                    }
                  </td>
                  <td style={{ padding: '15px' }}>
                    {editingId === item.id ? 
                        <input value={editData.topic} onChange={(e) => setEditData({ ...editData, topic: e.target.value })} style={{ width: '80px', border: '1px solid #3182ce', borderRadius: '4px' }} /> 
                        : <span style={{ backgroundColor: theme.badgeTopicBg, color: '#38a169', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{item.topic}</span>
                    }
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center', position: 'relative' }}>
                    {editingId === item.id ? (
                        <button onClick={() => saveEdit(item.id)} style={{ color: '#3182ce', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer' }}>Lưu</button>
                    ) : (
                        <button onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: theme.subText }}>⋮</button>
                    )}
                    
                    {activeMenu === item.id && (
                      <div style={{ position: 'absolute', right: '40px', top: '10px', backgroundColor: theme.card, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', borderRadius: '8px', zIndex: 10000, border: `1px solid ${theme.border}`, minWidth: '130px' }}>
                        <button style={{ display: 'block', width: '100%', padding: '12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: theme.text, fontSize: '13px' }} onClick={() => { setEditingId(item.id); setEditData({ genre: item.genre, topic: item.topic }); setActiveMenu(null); }}>Chỉnh sửa</button>
                        <button style={{ display: 'block', width: '100%', padding: '12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: '#e53e3e', fontSize: '13px', borderTop: `1px solid ${theme.border}` }} onClick={() => deleteItem(item.id)}>Xóa dòng này</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;