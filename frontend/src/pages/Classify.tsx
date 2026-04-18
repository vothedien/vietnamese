import { useState, useEffect } from 'react';
import { predictApi } from '../api/client';
import type { PredictResponse } from '../api/types';

const Classify = ({ addDataFromUser, isDarkMode }: any) => { 
  const [text, setText] = useState(() => localStorage.getItem('temp_text_uth') || '');
  const [result, setResult] = useState<(PredictResponse & { id: string }) | null>(null);
  const [loadingManual, setLoadingManual] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loadingBulk, setLoadingBulk] = useState(false);
  const [isUploadView, setIsUploadView] = useState(false);
  const [tempFiles, setTempFiles] = useState<File[]>([]);

  useEffect(() => {
    localStorage.setItem('temp_text_uth', text);
  }, [text]);

  const theme = {
    card: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#f1f5f9' : '#2d3748',
    subText: isDarkMode ? '#94a3b8' : '#718096',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    inputBg: isDarkMode ? '#0f172a' : '#ffffff',
    header: isDarkMode ? '#60a5fa' : '#1a365d',
    bulkBg: isDarkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc'
  };

  const handleManualClassify = async () => {
    // ĐÃ CẬP NHẬT CÂU THÔNG BÁO MỚI TẠI ĐÂY
    if (text.trim().length < 10) { 
      alert("Văn bản ngắn quá bạn ơi"); 
      return; 
    }
    setLoadingManual(true);
    try {
      const response = await predictApi.classifyText({ text });
      const entryId = Date.now().toString();
      const newResult = { ...response.data, id: entryId };
      setResult(newResult);
      
      const currentHistory = JSON.parse(localStorage.getItem('classification_history') || '[]');
      const newEntry = {
        id: parseInt(entryId),
        text: text,
        genre: newResult.genre,
        topic: newResult.topic,
        timestamp: new Date().toLocaleString('vi-VN')
      };
      localStorage.setItem('classification_history', JSON.stringify([...currentHistory, newEntry]));
      addDataFromUser(text, newResult.genre, newResult.topic); 
      
    } catch (error) { 
      alert("Lỗi kết nối Backend!"); 
    } finally { 
      setLoadingManual(false); 
    }
  };

  const handleUpdateLabel = (type: 'genre' | 'topic', value: string) => {
    if (!result) return;
    const updatedResult = { ...result, [type]: value };
    setResult(updatedResult);
    const currentHistory = JSON.parse(localStorage.getItem('classification_history') || '[]');
    const updatedHistory = currentHistory.map((item: any) => 
      item.id === parseInt(result.id) ? { ...item, [type]: value } : item
    );
    localStorage.setItem('classification_history', JSON.stringify(updatedHistory));
  };

  const handleBulkAction = () => {
    if (selectedFiles.length === 0) {
      setIsUploadView(true);
    } else {
      handleBulkClassify();
    }
  };

  const handleBulkClassify = async () => {
    setLoadingBulk(true);
    try {
      const response = await predictApi.uploadCSV(selectedFiles);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'file.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) { alert("Lỗi xử lý file!"); } finally { setLoadingBulk(false); }
  };

  if (isUploadView) {
    return (
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', color: theme.text }}>
        <h2 style={{ color: theme.header, borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>Add submission</h2>
        <div style={{ backgroundColor: theme.card, padding: '20px', borderRadius: '8px', marginTop: '20px', border: `1px solid ${theme.border}` }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ cursor: 'pointer', fontSize: '24px' }}>
               📁 <input type="file" multiple hidden onChange={(e) => setTempFiles([...tempFiles, ...Array.from(e.target.files || [])].slice(0, 4))} accept=".csv,.txt"/>
            </label>
          </div>
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); setTempFiles([...tempFiles, ...Array.from(e.dataTransfer.files)].slice(0, 4)); }}
            style={{ border: `2px dashed ${theme.border}`, padding: '40px', textAlign: 'center', backgroundColor: theme.inputBg, minHeight: '150px' }}
          >
            {tempFiles.length === 0 ? <p style={{ color: theme.subText }}>You can drag and drop files here to add them.</p> : (
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {tempFiles.map((f, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <div style={{ fontSize: '40px' }}>📊</div>
                    <div style={{ fontSize: '10px' }}>{f.name}</div>
                    <button onClick={() => setTempFiles(tempFiles.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button onClick={() => { setSelectedFiles(tempFiles); setIsUploadView(false); }} style={{ backgroundColor: '#007074', color: 'white', padding: '8px 25px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save changes</button>
            <button onClick={() => setIsUploadView(false)} style={{ backgroundColor: theme.subText, color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', color: theme.text }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', color: theme.header, fontWeight: '800' }}>Hệ thống Phân loại Văn bản Tiếng Việt</h1>
        <p style={{ color: theme.subText }}>Đồ án thực tập tốt nghiệp - UTH</p>
      </header>

      <section style={{ backgroundColor: theme.card, padding: '25px', borderRadius: '16px', marginBottom: '30px', border: `1px solid ${theme.border}` }}>
        <h3 style={{ borderLeft: '4px solid #3182ce', paddingLeft: '12px', marginBottom: '20px' }}>Phân loại thủ công</h3>
        
        <textarea 
          rows={6} 
          style={{ width: '100%', padding: '15px', borderRadius: '12px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, boxSizing: 'border-box', resize: 'vertical', maxWidth: '100%' }} 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="Bạn nhập nội dung..." 
        />

        <button onClick={handleManualClassify} style={{ marginTop: '20px', width: '100%', padding: '14px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          {loadingManual ? 'Đang phân tích...' : 'Phân loại ngay'}
        </button>

        {result && (
          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: isDarkMode ? '#0f172a' : '#f7fafc', borderRadius: '12px', border: `1px solid #3182ce` }}>
            <p style={{ fontSize: '12px', color: theme.subText, marginBottom: '10px' }}> Bạn có thể nhập trực tiếp để thay đổi nhãn </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: theme.subText }}>THỂ LOẠI</span>
                <input type="text" value={result.genre} onChange={(e) => handleUpdateLabel('genre', e.target.value)} style={{ display: 'block', width: '100%', border: 'none', backgroundColor: 'transparent', fontSize: '18px', fontWeight: 'bold', color: '#dd6b20', textAlign: 'center', outline: 'none' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: theme.subText }}>CHỦ ĐỀ</span>
                <input type="text" value={result.topic} onChange={(e) => handleUpdateLabel('topic', e.target.value)} style={{ display: 'block', width: '100%', border: 'none', backgroundColor: 'transparent', fontSize: '18px', fontWeight: 'bold', color: '#38a169', textAlign: 'center', outline: 'none' }} />
              </div>
            </div>
            
            <button 
              onClick={() => {
                const header = "Van ban,The loai,Chu de\n";
                const row = `"${text.replace(/"/g, '""')}",${result.genre},${result.topic}`;
                const blob = new Blob(["\ufeff" + header + row], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.setAttribute("download", "file.csv");
                link.click();
              }}
              style={{ marginTop: '15px', width: '100%', padding: '10px', backgroundColor: '#2d3748', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Tải kết quả (.csv)
            </button>
          </div>
        )}
      </section>

      <section style={{ backgroundColor: theme.bulkBg, padding: '25px', borderRadius: '16px', border: `2px dashed ${theme.border}` }}>
        <h3 style={{ color: theme.text, borderLeft: '4px solid #38a169', paddingLeft: '12px' }}>Phân loại hàng loạt</h3>
        <div style={{ marginTop: '15px', padding: '20px', backgroundColor: theme.card, borderRadius: '12px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
          {selectedFiles.length > 0 ? <p style={{color: '#38a169'}}>✅ {selectedFiles.length} file đã sẵn sàng</p> : <p>Chưa có file nào được chọn</p>}
          <button onClick={() => { setTempFiles(selectedFiles); setIsUploadView(true); }} style={{ backgroundColor: isDarkMode ? '#334155' : '#eee', padding: '8px 20px', border: `1px solid ${theme.border}`, cursor: 'pointer', borderRadius: '6px', marginTop: '10px' }}>Choose Files</button>
        </div>
        <button onClick={handleBulkAction} disabled={loadingBulk} style={{ marginTop: '15px', width: '100%', padding: '14px', backgroundColor: '#38a169', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          {loadingBulk ? 'Đang xử lý...' : selectedFiles.length === 0 ? 'Tải lên file để phân loại' : 'Bắt đầu phân loại ngay'}
        </button>
      </section>
    </div>
  );
};

export default Classify;