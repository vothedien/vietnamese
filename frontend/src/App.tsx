import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Classify from './pages/Classify';
import History from './pages/History';
import Admin from './pages/Admin';

// --- 1. COMPONENT HIỂN THỊ NỘI DUNG CHÍNH ---
const AppContent = ({ 
  isAuthenticated, 
  setIsAuthenticated, 
  userRole, 
  setUserRole, 
  dataset, 
  setDataset, 
  addDataFromUser,
  isDarkMode,
  setIsDarkMode 
}: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPage = location.pathname === '/admin';
  const navLinkStyle = { color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '600' };

  const handleLoginSuccess = (role: any) => {
    setIsAuthenticated(true);
    setUserRole(role);
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{ 
      backgroundColor: isDarkMode ? '#0f172a' : '#f0f2f5', 
      minHeight: '100vh',
      transition: '0.3s' 
    }}>
      {!isAuthenticated ? (
        <Routes>
          <Route path="*" element={<Auth onLoginSuccess={handleLoginSuccess} />} />
        </Routes>
      ) : (
        <>
          {/* Thanh Navbar */}
          {!isAdminPage && (
            <nav style={{
              backgroundColor: '#1a365d', padding: '12px 40px', display: 'flex',
              justifyContent: 'flex-end', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Link to="/" style={navLinkStyle}>Trang chủ</Link>
                <Link to="/history" style={navLinkStyle}>Lịch sử</Link>
                
                {/* Nút Sáng/Tối */}
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  style={{ 
                    backgroundColor: 'transparent', color: 'white', 
                    border: '1px solid rgba(255,255,255,0.3)', padding: '5px 12px', 
                    borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                  }}
                >
                  {isDarkMode ? 'Sáng' : 'Tối'}
                </button>

                <button 
                  onClick={() => { setIsAuthenticated(false); setUserRole('user'); navigate('/'); }}
                  style={{ backgroundColor: '#e53e3e', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  Đăng xuất
                </button>
              </div>
            </nav>
          )}

          <div style={{ padding: isAdminPage ? '0' : '20px' }}>
            <Routes>
              {/* Truyền isDarkMode xuống trang Classify */}
              <Route path="/" element={<Classify addDataFromUser={addDataFromUser} isDarkMode={isDarkMode} />} />
              
              <Route path="/history" element={<History isDarkMode={isDarkMode} />} />
              
              {/* Truyền mọi thứ xuống trang Admin */}
              <Route path="/admin" element={
                userRole === 'admin' ? 
                <Admin dataset={dataset} setDataset={setDataset} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /> : 
                <Navigate to="/" />
              } />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </>
      )}
    </div>
  );
};

// --- 2. COMPONENT GỐC QUẢN LÝ STATE ---
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [dataset, setDataset] = useState([
    { id: 1, text: "Chứng khoán hôm nay tăng mạnh...", genre: "Tin tức", topic: "Kinh doanh" },
    { id: 2, text: "U23 Việt Nam tập luyện tại Hà Nội...", genre: "Tin tức", topic: "Thể thao" }
  ]);

  const addDataFromUser = (newText: string, genre: string, topic: string) => {
    const newItem = {
      id: dataset.length > 0 ? Math.max(...dataset.map(d => d.id)) + 1 : 1,
      text: newText,
      genre: genre,
      topic: topic
    };
    setDataset(prev => [...prev, newItem]);
  };

  return (
    <Router>
      <AppContent 
        isAuthenticated={isAuthenticated} 
        setIsAuthenticated={setIsAuthenticated} 
        userRole={userRole} 
        setUserRole={setUserRole} 
        dataset={dataset}
        setDataset={setDataset}
        addDataFromUser={addDataFromUser}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
    </Router>
  );
}

export default App;