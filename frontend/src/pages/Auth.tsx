import { useState, useEffect } from 'react';

interface AuthProps {
  onLoginSuccess: (role: string) => void;
}

const Auth = ({ onLoginSuccess }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  
  // FIX 1: Đảm bảo các giá trị ban đầu là chuỗi rỗng, không để sẵn thông tin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState({
    email: false,
    password: false,
    name: false,
  });

  // Load thông tin nếu người dùng đã chọn "Ghi nhớ" trước đó
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    const savedPass = localStorage.getItem('remembered_password');
    if (savedEmail && savedPass) {
      setEmail(savedEmail);
      setPassword(savedPass);
      setRememberMe(true);
    }
  }, []);

  const validateEmail = (val: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const commonTypos = ['.con', '.comn', '.vnn', '.eduu'];
    const hasTypo = commonTypos.some(typo => val.toLowerCase().endsWith(typo));
    return regex.test(val) && !hasTypo;
  };

  const validatePassword = (val: string) => {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
    return regex.test(val);
  };

  const validateName = (val: string) => {
    const regex = /^([A-ZÀ-Ỹ][a-zà-ỹ]*(\s[A-ZÀ-Ỹ][a-zà-ỹ]*)*)$/;
    return regex.test(val);
  };

  useEffect(() => {
    // FIX 2: Nếu là thông tin Admin thì không bật báo đỏ (bỏ qua bắt lỗi cho Admin)
    const isAdmin = email === 'admin@uth.edu.vn' && password === 'Admin@123';
    
    if (isAdmin) {
      setErrors({ email: false, password: false, name: false });
    } else {
      setErrors({
        email: email.length > 0 && !validateEmail(email),
        password: password.length > 0 && !validatePassword(password),
        name: !isLogin && name.length > 0 && !validateName(name),
      });
    }
  }, [email, password, name, isLogin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // KIỂM TRA ĐẶC CÁCH ADMIN
    const isAdmin = email === 'admin@uth.edu.vn' && password === 'Admin@123';
    
    if (isAdmin) {
      onLoginSuccess('admin');
      return;
    }

    const isEmailOk = validateEmail(email);
    const isPassOk = validatePassword(password);
    const isNameOk = isLogin || validateName(name);

    if (isEmailOk && isPassOk && isNameOk) {
      const registeredUsers = JSON.parse(localStorage.getItem('system_users') || '[]');

      if (isLogin) {
        const userFound = registeredUsers.find((u: any) => u.email === email && u.password === password);

        if (userFound) {
          if (rememberMe) {
            localStorage.setItem('remembered_email', email);
            localStorage.setItem('remembered_password', password);
          } else {
            localStorage.removeItem('remembered_email');
            localStorage.removeItem('remembered_password');
          }
          onLoginSuccess('user');
        } else {
          alert("Không tìm thấy tài khoản đăng nhập của bạn, vui lòng đăng ký!");
        }
      } else {
        const newUser = {
          id: Date.now(),
          name: name,
          email: email,
          password: password,
          role: 'user',
          joinDate: new Date().toLocaleDateString('vi-VN')
        };
        localStorage.setItem('system_users', JSON.stringify([...registeredUsers, newUser]));
        alert("Đăng ký thành công! Bạn hãy đăng nhập lại để bắt đầu nhé.");
        setIsLogin(true);
      }
    } else {
      // FIX 3: Đổi Duy -> Bạn trong câu thông báo lỗi
      alert("Bạn ơi, thông tin chưa đúng định dạng. Bạn kiểm tra các ô báo đỏ nhé!");
    }
  };

  const handleSocialLogin = (platform: string) => {
    alert(`Hệ thống đang mô phỏng kết nối đến ${platform}...`);
  };

  const inputStyle = (hasError: boolean) => ({
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: `2px solid ${hasError ? '#e53e3e' : '#cbd5e0'}`,
    boxSizing: 'border-box' as const,
    outline: 'none',
    backgroundColor: hasError ? '#fff5f5' : '#fff',
    transition: 'all 0.2s'
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Arial' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '40px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#1a365d', marginBottom: '8px' }}>
            {isLogin ? 'Đăng Nhập Hệ Thống' : 'Tạo Tài Khoản Mới'}
          </h2>
          <p style={{ color: '#718096', fontSize: '14px' }}>Đồ án thực tập tốt nghiệp - UTH</p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>Họ và tên</label>
              <input type="text" placeholder="Ví dụ: Đào Văn Duy" style={inputStyle(errors.name)} value={name} onChange={(e) => setName(e.target.value)} />
              {errors.name && <small style={{ color: '#e53e3e' }}>Họ tên phải viết hoa chữ cái đầu!</small>}
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>Email đăng nhập</label>
            <input type="text" placeholder="example@gmail.com" style={inputStyle(errors.email)} value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <small style={{ color: '#e53e3e' }}>Email không hợp lệ!</small>}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>Mật khẩu</label>
            <input type="password" placeholder="••••••••" style={inputStyle(errors.password)} value={password} onChange={(e) => setPassword(e.target.value)} />
            {errors.password && (
              <small style={{ color: '#e53e3e', fontSize: '11px' }}>
                Cần 6+ ký tự, 1 chữ HOA, 1 ký tự đặc biệt
              </small>
            )}
          </div>

          {isLogin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <input 
                type="checkbox" id="remember" checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="remember" style={{ fontSize: '13px', color: '#4a5568', cursor: 'pointer' }}>Ghi nhớ mật khẩu</label>
            </div>
          )}

          <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
            {isLogin ? 'Đăng nhập ngay' : 'Đăng ký tài khoản'}
          </button>
        </form>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#a0aec0', marginBottom: '15px', position: 'relative' }}>
            <span style={{ backgroundColor: '#fff', padding: '0 10px', position: 'relative', zIndex: 1 }}>Hoặc đăng nhập bằng</span>
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => handleSocialLogin('Google')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>
              <img src="https://authjs.dev/img/providers/google.svg" width="18" alt="G" /> Google
            </button>
            <button onClick={() => handleSocialLogin('Facebook')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#1877F2' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg" width="18" alt="F" /> Facebook
            </button>
          </div>
        </div>

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', borderTop: '1px solid #edf2f7', paddingTop: '20px' }}>
          <span style={{ color: '#718096' }}>{isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}</span>
          <button type="button" onClick={() => { setIsLogin(!isLogin); setErrors({ email: false, password: false, name: false }); }} style={{ background: 'none', border: 'none', color: '#3182ce', fontWeight: 'bold', cursor: 'pointer', marginLeft: '8px' }}>
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;