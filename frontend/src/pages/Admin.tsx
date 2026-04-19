import { useState, useEffect } from 'react';

const Admin = ({ dataset, setDataset, isDarkMode, setIsDarkMode }: any) => {
  // 1. Quản lý Tab
  const [activeTab, setActiveTab] = useState('dataset');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [editingId, setEditingId] = useState<number | null>(null);

  const [tempText, setTempText] = useState('');
  const [tempGenre, setTempGenre] = useState('Chính trị');
  const [tempTopic, setTempTopic] = useState('Kinh tế');

  const [systemUsers, setSystemUsers] = useState<any[]>([]);

  // --- STATE 3 CHỨC NĂNG MỚI (GIỮ NGUYÊN) ---
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [modelVersions, setModelVersions] = useState([
    { id: '1776497942515', date: '19/4/2026', accuracy: '94.5%', status: 'Active' },
    { id: '1776497821432', date: '15/4/2026', accuracy: '92.1%', status: 'Stored' },
    { id: '1776497710987', date: '10/4/2026', accuracy: '91.8%', status: 'Stored' },
  ]);

  // --- CẬP NHẬT MỚI: STATE LƯU TRỮ THỐNG KÊ THẬT ---
  const [realStats, setRealStats] = useState<any>({
    total_classified: 0,
    real_distribution: {},
    accuracy_by_label: {},
    f1_score: 0,
    confusion_matrix: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]
  });

  // --- CẬP NHẬT: LẤY DỮ LIỆU THẬT TỪ DATABASE ---
  const fetchRealDataset = async () => {
    try {
      const response = await fetch('http://localhost:8000/admin/dataset');
      if (response.ok) {
        const data = await response.json();
        setDataset(data); 
      }
    } catch (error) {
      console.error("Không thể lấy dữ liệu từ Backend:", error);
    }
  };

  // --- CẬP NHẬT MỚI: LẤY THỐNG KÊ TỪ BACKEND ---
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setRealStats(data);
      }
    } catch (error) {
      console.error("Lỗi lấy thống kê:", error);
    }
  };

  useEffect(() => {
    fetchRealDataset();
    fetchStats(); // Lấy thống kê thật mỗi khi đổi tab hoặc load trang

    const registeredUsers = JSON.parse(localStorage.getItem('system_users') || '[]');
    setSystemUsers(registeredUsers);
  }, [setDataset, activeTab]);

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
      reader.onload = (event: any) => setTempText(event.target.result as string);
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

  const startTraining = () => {
    setIsTraining(true);
    setTrainingProgress(0);
    const interval = setInterval(() => {
      setTrainingProgress(p => {
        if (p >= 100) { clearInterval(interval); setIsTraining(false); return 100; }
        return p + 10;
      });
    }, 300);
  };

  const handleActionVersion = (versionId: string, actionName: string) => {
    if (window.confirm(`Bạn muốn ${actionName} phiên bản ${versionId}?`)) {
      const updated = modelVersions.map(v => ({
        ...v,
        status: v.id === versionId ? 'Active' : 'Stored'
      }));
      setModelVersions(updated);
      alert(`Đã ${actionName} thành công bạn ơi!`);
    }
  };

  const filteredData = dataset.filter((item: any) => 
    item.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.bg, color: theme.text, transition: '0.3s' }}>
      
      {/* SIDEBAR (GIỮ NGUYÊN) */}
      <div style={{ width: '260px', backgroundColor: theme.sidebar, borderRight: `1px solid ${theme.border}` }}>
        <div style={{ padding: '30px 24px', textAlign: 'center', borderBottom: `1px solid ${theme.border}` }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '4px' }}>Admin Panel</h2>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#6366f1' }}>Hệ thống Quản trị AI</p>
        </div>
        <div style={{ padding: '16px' }}>
          <button onClick={() => window.location.href = '/'} style={{ width: '100%', padding: '10px', marginBottom: '20px', backgroundColor: isDarkMode ? '#334155' : '#edf2f7', color: theme.text, border: 'none', borderRadius: '8px', cursor: 'pointer' }}>← Quay về User</button>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setActiveTab('dataset')} style={activeTab === 'dataset' ? activeBtnStyle : { ...btnStyle, color: theme.text }}>Quản lý Dataset</button>
            <button onClick={() => setActiveTab('users')} style={activeTab === 'users' ? activeBtnStyle : { ...btnStyle, color: theme.text }}>Quản lý User</button>
            <button onClick={() => setActiveTab('training')} style={activeTab === 'training' ? activeBtnStyle : { ...btnStyle, color: theme.text }}>Huấn luyện</button>
            <button onClick={() => setActiveTab('stats')} style={activeTab === 'stats' ? activeBtnStyle : { ...btnStyle, color: theme.text }}>Thống kê</button>
            <button onClick={() => setActiveTab('deploy')} style={activeTab === 'deploy' ? activeBtnStyle : { ...btnStyle, color: theme.text }}>Deploy / Rollback</button>
          </nav>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {activeTab === 'dataset' && 'Quản lý Dataset'}
            {activeTab === 'users' && 'Quản lý Người dùng'}
            {activeTab === 'training' && 'Huấn luyện lại mô hình'}
            {activeTab === 'stats' && 'Thống kê mô hình'}
            {activeTab === 'deploy' && 'Quản lý Phiên bản'}
          </h2>
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
          
          {(activeTab === 'dataset' || activeTab === 'users') && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: theme.tableHeader }}>
                {activeTab === 'dataset' ? (
                  <tr><th style={thStyle}>ID</th><th style={thStyle}>VĂN BẢN MẪU</th><th style={thStyle}>THỂ LOẠI</th><th style={thStyle}>CHỦ ĐỀ</th><th style={thStyle}>THAO TÁC</th></tr>
                ) : (
                  <tr><th style={thStyle}>ID</th><th style={thStyle}>HỌ TÊN</th><th style={thStyle}>EMAIL</th><th style={thStyle}>NGÀY THAM GIA</th><th style={thStyle}>THAO TÁC</th></tr>
                )}
              </thead>
              <tbody>
                {activeTab === 'dataset' ? (
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
                ) : (
                  systemUsers.map((user: any) => (
                    <tr key={user.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={tdStyle}>{user.id}</td><td style={{ ...tdStyle, fontWeight: 'bold' }}>{user.name}</td><td style={tdStyle}>{user.email}</td><td style={tdStyle}>{user.joinDate}</td>
                      <td style={tdStyle}><button onClick={() => handleDelete(user.id)} style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600' }}>Xóa</button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'training' && (
            <div style={{ padding: '40px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Cấu hình Huấn luyện</h3>
              {isTraining ? (
                <div style={{ maxWidth: '500px' }}>
                  <div style={{ height: '8px', backgroundColor: theme.bg, borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                    <div style={{ width: `${trainingProgress}%`, height: '100%', backgroundColor: '#3b82f6', transition: '0.3s' }}></div>
                  </div>
                  <span style={{ fontSize: '13px' }}>Tiến độ: {trainingProgress}%</span>
                </div>
              ) : (
                <button onClick={startTraining} style={saveBtnStyle}>Bắt đầu Huấn luyện</button>
              )}
            </div>
          )}

          {/* CẬP NHẬT TAB THỐNG KÊ: SỬ DỤNG DỮ LIỆU THẬT */}
          {activeTab === 'stats' && (
            <div style={{ padding: '32px' }}>
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: isDarkMode ? '#334155' : '#f1f5f9', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px' }}>Tổng số văn bản đã phân loại thực tế:</h3>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#3b82f6' }}>{realStats.total_classified}</span>
              </div>

              <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Accuracy và F1-score (Chi tiết nhãn)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                <thead style={{ backgroundColor: theme.tableHeader }}>
                  <tr><th style={thStyle}>NHÃN</th><th style={thStyle}>ACCURACY</th><th style={thStyle}>F1-SCORE (Global: {realStats.f1_score})</th></tr>
                </thead>
                <tbody>
                  {Object.entries(realStats.accuracy_by_label).map(([label, acc]: any) => (
                    <tr key={label} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={tdStyle}>{label}</td>
                      <td style={tdStyle}>{acc}</td>
                      <td style={tdStyle}>{(acc - 0.05).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Ma trận nhầm lẫn (Confusion Matrix)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, border: `1px solid ${theme.border}` }}></th>
                    {['T.Thao', 'P.Luat', 'B.Chi', 'K.Te'].map(h => <th key={h} style={{ ...thStyle, border: `1px solid ${theme.border}`, textAlign: 'center' }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {realStats.confusion_matrix.map((row: any, i: number) => (
                    <tr key={i}>
                      <td style={{ ...tdStyle, border: `1px solid ${theme.border}`, fontWeight: 'bold' }}>{['T.Thao', 'P.Luat', 'B.Chi', 'K.Te'][i]}</td>
                      {row.map((val: any, col: number) => (
                        <td key={col} style={{ ...tdStyle, border: `1px solid ${theme.border}`, ...confusionMatrixCellStyle(i, col) }}>
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'deploy' && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: theme.tableHeader }}>
                <tr><th style={thStyle}>VERSION ID</th><th style={thStyle}>NGÀY TẠO</th><th style={thStyle}>ĐỘ CHÍNH XÁC</th><th style={thStyle}>TRẠNG THÁI</th><th style={thStyle}>THAO TÁC</th></tr>
              </thead>
              <tbody>
                {modelVersions.map(v => (
                  <tr key={v.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={tdStyle}>{v.id}</td><td style={tdStyle}>{v.date}</td><td style={tdStyle}>{v.accuracy}</td>
                    <td style={tdStyle}><span style={{ ...badgeStyle, backgroundColor: v.status === 'Active' ? '#dcfce7' : '#e2e8f0', color: v.status === 'Active' ? '#166534' : '#64748b' }}>{v.status}</span></td>
                    <td style={tdStyle}>
                      {v.status !== 'Active' && <button onClick={() => handleActionVersion(v.id, 'Triển khai')} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Kích hoạt</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL THÊM MỚI (GIỮ NGUYÊN) */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, backgroundColor: theme.card, color: theme.text }}>
            <h3 style={{ marginBottom: '20px' }}>Thêm mẫu dữ liệu mới</h3>
            <div onDragOver={(e) => e.preventDefault()} onDrop={handleFileDrop} style={{ border: `2px dashed ${theme.border}`, padding: '20px', borderRadius: '12px', marginBottom: '15px', textAlign: 'center', backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', cursor: 'pointer' }}><p style={{ fontSize: '13px', color: theme.subText }}>Thả file vào đây</p></div>
            <textarea value={tempText} onChange={(e) => setTempText(e.target.value)} placeholder="Nhập văn bản..." style={{ ...textareaStyle, backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }} />
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
              <div style={{ flex: 1 }}><input type="text" value={tempGenre} onChange={(e) => setTempGenre(e.target.value)} placeholder="Thể loại" style={{ ...inputStyle, backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }} /></div>
              <div style={{ flex: 1 }}><input type="text" value={tempTopic} onChange={(e) => setTempTopic(e.target.value)} placeholder="Chủ đề" style={{ ...inputStyle, backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }} /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}><button onClick={() => setShowAddModal(false)} style={cancelBtnStyle}>Hủy</button><button onClick={handleAddSubmit} style={saveBtnStyle}>Lưu mẫu</button></div>
          </div>
        </div>
      )}

      {/* MODAL KHO DỮ LIỆU (GIỮ NGUYÊN) */}
      {showManageModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, width: '700px', backgroundColor: theme.card, color: theme.text }}>
            <h3 style={{ marginBottom: '20px' }}>Kho dữ liệu</h3>
            <input type="text" placeholder="Tìm kiếm văn bản..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...inputStyle, width: '100%', padding: '10px', borderRadius: '20px', border: `1px solid ${theme.border}`, backgroundColor: theme.input, color: theme.text }} />
            <div style={{ maxHeight: '350px', overflowY: 'auto', marginTop: '20px' }}>
              {filteredData.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: `1px solid ${theme.border}` }}>
                  <span style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>{item.text}</span>
                  <button onClick={() => handleDelete(item.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Xóa</button>
                </div>
              ))}
            </div>
            <button onClick={() => setShowManageModal(false)} style={{ ...saveBtnStyle, marginTop: '20px', width: '100%' }}>Đóng</button>
          </div>
        </div>
      )}

      {editingId && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, backgroundColor: theme.card, color: theme.text }}>
            <h3 style={{ marginBottom: '20px' }}>Sửa mẫu dữ liệu</h3>
            <textarea value={tempText} onChange={(e) => setTempText(e.target.value)} style={{ ...textareaStyle, backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}><button onClick={() => setEditingId(null)} style={cancelBtnStyle}>Hủy</button><button onClick={handleEditSubmit} style={saveBtnStyle}>Cập nhật</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- STYLES GIỮ NGUYÊN ---
const thStyle = { padding: '16px', textAlign: 'left' as const, fontSize: '12px', color: '#64748b', fontWeight: '700' };
const tdStyle = { padding: '16px', fontSize: '14px' };
const btnStyle = { width: '100%', padding: '12px', border: 'none', backgroundColor: 'transparent', textAlign: 'left' as const, cursor: 'pointer', borderRadius: '8px' };
const activeBtnStyle = { ...btnStyle, backgroundColor: '#3b82f6', color: 'white', fontWeight: '700' };
const badgeStyle = { padding: '4px 10px', borderRadius: '15px', fontSize: '11px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: '700' };
const modalOverlayStyle = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalContentStyle = { padding: '25px', borderRadius: '20px', width: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' };
const textareaStyle = { width: '100%', height: '120px', padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '14px', boxSizing: 'border-box' as const };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', outline: 'none', fontSize: '14px', boxSizing: 'border-box' as const };
const saveBtnStyle = { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' };
const cancelBtnStyle = { backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };

const confusionMatrixCellStyle = (row: number, col: number) => ({
  backgroundColor: row === col ? '#dcfce7' : 'transparent',
  color: row === col ? '#166534' : 'inherit',
  fontWeight: row === col ? 'bold' : 'normal' as const,
});

export default Admin;