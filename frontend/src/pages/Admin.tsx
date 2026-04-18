import { useState, useEffect } from 'react';

const Admin = ({ dataset, setDataset, isDarkMode, setIsDarkMode }: any) => {
  // 1. Quản lý Tab: 'dataset' hoặc 'users'
  const [activeTab, setActiveTab] = useState('dataset');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [tempText, setTempText] = useState('');
  const [tempGenre, setTempGenre] = useState('Chính trị');
  const [tempTopic, setTempTopic] = useState('Kinh tế');

  // Quản lý danh sách User từ hệ thống
  const [systemUsers, setSystemUsers] = useState<any[]>([]);

  // --- 2. ĐỒNG BỘ DỮ LIỆU (DATASET TỪ LỊCH SỬ & USER TỪ AUTH) ---
  useEffect(() => {
    // Đồng bộ Dataset từ lịch sử phân loại của User
    const userHistory = JSON.parse(localStorage.getItem('classification_history') || '[]');
    if (userHistory.length > 0) {
      const syncedData = userHistory.map((h: any) => ({
        id: h.id,
        text: h.text,
        genre: h.genre,
        topic: h.topic
      }));
      setDataset(syncedData);
    } else {
      setDataset([]); // Trống nếu chưa ai phân loại
    }

    // Đồng bộ danh sách User đã đăng ký từ localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('system_users') || '[]');
    setSystemUsers(registeredUsers);
  }, [setDataset]);

  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f8fafc',
    sidebar: isDarkMode ? '#1e293b' : 'white',
    card: isDarkMode ? '#1e293b' : 'white',
    text: isDarkMode ? '#f1f5f9' : '#1e293b',
    subText: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    input: isDarkMode ? '#0f172a' : 'white',
    tableHeader: isDarkMode ? '#334155' : '#f8fafc',
  };

  const handleFileDrop = (e: any) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => setTempText(event.target.result);
      reader.readAsText(file);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Xóa mục này khỏi hệ thống?")) {
      if (activeTab === 'dataset') {
        setDataset(dataset.filter((item: any) => item.id !== id));
      } else {
        const updatedUsers = systemUsers.filter((u: any) => u.id !== id);
        setSystemUsers(updatedUsers);
        localStorage.setItem('system_users', JSON.stringify(updatedUsers));
      }
    }
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setTempText(item.text);
    setTempGenre(item.genre);
    setTempTopic(item.topic);
  };

  const handleEditSubmit = () => {
    setDataset(dataset.map((item: any) => 
      item.id === editingId ? { ...item, text: tempText, genre: tempGenre, topic: tempTopic } : item
    ));
    setEditingId(null);
  };

  const handleAddSubmit = () => {
    if (!tempText) return alert("Chưa có nội dung!");
    const newId = Date.now();
    setDataset([...dataset, { id: newId, text: tempText, genre: tempGenre, topic: tempTopic }]);
    setTempText('');
    setShowAddModal(false);
  };

  const filteredData = dataset.filter((item: any) => 
    item.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.bg, color: theme.text, transition: '0.3s' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '260px', backgroundColor: theme.sidebar, borderRight: `1px solid ${theme.border}` }}>
        <div style={{ padding: '30px 24px', textAlign: 'center', borderBottom: `1px solid ${theme.border}` }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '4px' }}>Admin Panel</h2>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#6366f1' }}>Hệ thống Quản trị AI</p>
        </div>
        <div style={{ padding: '16px' }}>
          <button onClick={() => window.location.href = '/'} style={{ width: '100%', padding: '10px', marginBottom: '20px', backgroundColor: isDarkMode ? '#334155' : '#edf2f7', color: theme.text, border: 'none', borderRadius: '8px', cursor: 'pointer' }}>← Quay về User</button>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setActiveTab('dataset')} style={activeTab === 'dataset' ? activeBtnStyle : { ...btnStyle, color: theme.text }}>📁 Quản lý Dataset</button>
            <button onClick={() => setActiveTab('users')} style={activeTab === 'users' ? activeBtnStyle : { ...btnStyle, color: theme.text }}>👥 Quản lý User</button>
            <button style={{ ...btnStyle, color: theme.text }}>⚙️ Huấn luyện</button>
            <button style={{ ...btnStyle, color: theme.text }}>📊 Thống kê</button>
          </nav>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>{activeTab === 'dataset' ? 'Quản lý Dataset' : 'Quản lý Người dùng'}</h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ padding: '10px 20px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.card, color: theme.text, cursor: 'pointer', fontWeight: '600' }}>
              {isDarkMode ? 'Sáng' : 'Tối'}
            </button>
            {activeTab === 'dataset' && (
              <>
                <button onClick={() => setShowManageModal(true)} style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>Xóa mẫu dữ liệu</button>
                <button onClick={() => { setTempText(''); setTempGenre('Chính trị'); setTempTopic('Kinh tế'); setShowAddModal(true); }} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>Thêm mẫu dữ liệu</button>
              </>
            )}
          </div>
        </div>

        <div style={{ backgroundColor: theme.card, borderRadius: '12px', border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
          {activeTab === 'dataset' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: theme.tableHeader }}>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>VĂN BẢN MẪU</th>
                  <th style={thStyle}>THỂ LOẠI</th>
                  <th style={thStyle}>CHỦ ĐỀ</th>
                  <th style={thStyle}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {dataset.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: theme.subText }}>Chưa có dữ liệu phân loại nào từ người dùng Duy ơi.</td></tr>
                ) : (
                  dataset.map((item: any) => (
                    <tr key={item.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={tdStyle}>{item.id}</td>
                      <td style={{ ...tdStyle, maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.text}</td>
                      <td style={tdStyle}><span style={badgeStyle}>{item.genre}</span></td>
                      <td style={tdStyle}><span style={{ ...badgeStyle, backgroundColor: '#fef3c7', color: '#92400e' }}>{item.topic}</span></td>
                      <td style={tdStyle}>
                        <button onClick={() => openEditModal(item)} style={{ color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px', fontWeight: '600' }}>Sửa</button>
                        <button onClick={() => handleDelete(item.id)} style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600' }}>Xóa</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: theme.tableHeader }}>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>HỌ TÊN</th>
                  <th style={thStyle}>EMAIL</th>
                  <th style={thStyle}>NGÀY THAM GIA</th>
                  <th style={thStyle}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {systemUsers.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: theme.subText }}>Chưa có người dùng nào đăng ký Duy ơi.</td></tr>
                ) : (
                  systemUsers.map((user: any) => (
                    <tr key={user.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={tdStyle}>{user.id}</td>
                      <td style={{ ...tdStyle, fontWeight: 'bold' }}>{user.name}</td>
                      <td style={tdStyle}>{user.email}</td>
                      <td style={tdStyle}>{user.joinDate}</td>
                      <td style={tdStyle}>
                        <button onClick={() => handleDelete(user.id)} style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600' }}>Xóa</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL THÊM MỚI (FIXED) */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, backgroundColor: theme.card, color: theme.text }}>
            <h3 style={{ marginBottom: '20px' }}>Thêm mẫu dữ liệu mới</h3>
            <div onDragOver={(e) => e.preventDefault()} onDrop={handleFileDrop} style={{ border: `2px dashed ${theme.border}`, padding: '20px', borderRadius: '12px', marginBottom: '15px', textAlign: 'center', backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', cursor: 'pointer' }}>
              <p style={{ fontSize: '13px', color: theme.subText }}>Thả file vào đây</p>
            </div>
            <textarea 
                value={tempText} 
                onChange={(e) => setTempText(e.target.value)} 
                placeholder="Nhập văn bản..." 
                style={{ ...textareaStyle, backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}`, resize: 'vertical', maxWidth: '100%' }} 
            />
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>THỂ LOẠI</label>
                <input type="text" value={tempGenre} onChange={(e) => setTempGenre(e.target.value)} style={{ ...inputStyle, backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>CHỦ ĐỀ</label>
                <input type="text" value={tempTopic} onChange={(e) => setTempTopic(e.target.value)} style={{ ...inputStyle, backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowAddModal(false)} style={cancelBtnStyle}>Hủy</button>
              <button onClick={handleAddSubmit} style={saveBtnStyle}>Lưu mẫu</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SỬA (FIXED) */}
      {editingId && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, backgroundColor: theme.card, color: theme.text }}>
            <h3 style={{ marginBottom: '20px' }}>Sửa mẫu dữ liệu</h3>
            <textarea 
                value={tempText} 
                onChange={(e) => setTempText(e.target.value)} 
                style={{ ...textareaStyle, backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}`, resize: 'vertical', maxWidth: '100%' }} 
            />
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>THỂ LOẠI</label>
                <input type="text" value={tempGenre} onChange={(e) => setTempGenre(e.target.value)} style={{ ...inputStyle, backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>CHỦ ĐỀ</label>
                <input type="text" value={tempTopic} onChange={(e) => setTempTopic(e.target.value)} style={{ ...inputStyle, backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setEditingId(null)} style={cancelBtnStyle}>Hủy</button>
              <button onClick={handleEditSubmit} style={saveBtnStyle}>Cập nhật</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KHO DỮ LIỆU (FIXED) */}
      {showManageModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, width: '700px', backgroundColor: theme.card, color: theme.text }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Kho dữ liệu</h3>
              <div style={{ position: 'relative', width: '200px' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
                <input 
                  type="text" placeholder="Tìm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px 8px 30px', borderRadius: '20px', border: `1px solid ${theme.border}`, backgroundColor: theme.input, color: theme.text, fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {filteredData.length === 0 ? <p style={{textAlign: 'center', padding: '20px'}}>Không tìm thấy kết quả.</p> : (
                filteredData.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '12px', borderBottom: `1px solid ${theme.border}`, gap: '10px' }}>
                    <input type="checkbox" />
                    <span style={{ flex: 1, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.text}</span>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                    >
                      Xóa
                    </button>
                  </div>
                ))
              )}
            </div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button onClick={() => setShowManageModal(false)} style={saveBtnStyle}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const thStyle = { padding: '16px', textAlign: 'left' as const, fontSize: '12px', color: '#64748b', fontWeight: '700' };
const tdStyle = { padding: '16px', fontSize: '14px' };
const btnStyle = { width: '100%', padding: '12px', border: 'none', backgroundColor: 'transparent', textAlign: 'left' as const, cursor: 'pointer', borderRadius: '8px' };
const activeBtnStyle = { ...btnStyle, backgroundColor: '#3b82f6', color: 'white', fontWeight: '700' };
const badgeStyle = { padding: '4px 10px', borderRadius: '15px', fontSize: '11px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: '700' };
const modalOverlayStyle = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalContentStyle = { padding: '25px', borderRadius: '20px', width: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' };
const textareaStyle = { width: '100%', height: '120px', padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '14px', boxSizing: 'border-box' as const };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', outline: 'none', fontSize: '14px' };
const saveBtnStyle = { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' };
const cancelBtnStyle = { backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };

export default Admin;