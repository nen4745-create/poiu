
import React, { useState, useEffect, useCallback } from 'react';
import { Student, AttendanceRecord, AttendanceStatus, Notice, UserRole, Homework, HomeworkSubmission, HomeworkStatus, Post, AppNotification, GradeRecord, TimetableEntry } from './types';
import { INITIAL_STUDENTS, INITIAL_ATTENDANCE, INITIAL_NOTICES, INITIAL_HOMEWORKS, INITIAL_SUBMISSIONS, INITIAL_POSTS, INITIAL_GRADES, INITIAL_TIMETABLE } from './constants';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { AttendanceTracker } from './components/AttendanceTracker';
import { AttendanceHistory } from './components/AttendanceHistory';
import { NoticeBoard } from './components/NoticeBoard';
import { TimetableManager } from './components/TimetableManager';
import { HomeworkManager } from './components/HomeworkManager';
import { CommunityBoard } from './components/CommunityBoard';
import { GradeManager } from './components/GradeManager';
import { NotificationToast } from './components/NotificationToast';
import { Login } from './components/Login';
import { ShareGuide } from './components/ShareGuide';
import { getAttendanceInsights } from './services/geminiService';

const AUTH_KEY = 'BUMCHEON_SESSION_V5';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('notices');
  const [role, setRole] = useState<UserRole>('admin');
  const [userName, setUserName] = useState('');
  const [loggedInStudentId, setLoggedInStudentId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [timetable, setTimetable] = useState<TimetableEntry[]>(INITIAL_TIMETABLE);
  const [homeworks, setHomeworks] = useState<Homework[]>(INITIAL_HOMEWORKS);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>(INITIAL_SUBMISSIONS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [grades, setGrades] = useState<GradeRecord[]>(INITIAL_GRADES);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const currentUserId = (role === 'student' || role === 'parent') ? (loggedInStudentId || '1') : 'admin_id';

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleCopyLink = () => {
    const isInsideIframe = window.self !== window.top;
    const url = window.location.href;
    
    if (isInsideIframe || url.includes('aistudio.google.com')) {
      alert('⚠️ 현재 주소는 "비밀 개발용" 주소입니다.\n\n다른 사람에게 보내면 [404 에러]가 납니다!\n\n진짜 주소를 만드는 방법은 [배포 가이드] 메뉴를 확인해 주세요.');
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('✅ 학원 어플 전용 주소가 복사되었습니다!');
      });
    }
  };

  const handleInstallClick = async () => {
    const isInsideIframe = window.self !== window.top;
    if (isInsideIframe) {
      setShowInstallGuide(true);
      return;
    }
    if (!deferredPrompt) {
      setShowInstallGuide(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const triggerNotification = useCallback((title: string, body: string, type: AppNotification['type'], studentId?: string) => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      body,
      timestamp: new Date().toISOString(),
      type,
      studentId,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    setActiveToast(newNotif);
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: 'https://api.dicebear.com/7.x/initials/svg?seed=B&backgroundColor=4f46e5' });
      } catch (e) { console.warn(e); }
    }
  }, []);

  useEffect(() => {
    const savedSession = localStorage.getItem(AUTH_KEY);
    if (savedSession) {
      try {
        const { role: savedRole, userName: savedName, studentId } = JSON.parse(savedSession);
        setRole(savedRole);
        setUserName(savedName);
        setLoggedInStudentId(studentId);
        setIsAuthenticated(true);
        if (savedRole === 'student' || savedRole === 'parent') setActiveTab('notices');
      } catch (e) { localStorage.removeItem(AUTH_KEY); }
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = (selectedRole: UserRole, student: Student | null) => {
    setRole(selectedRole);
    const name = student ? student.name : (selectedRole === 'admin' ? '원장님' : '선생님');
    setUserName(name);
    setLoggedInStudentId(student ? student.id : null);
    setIsAuthenticated(true);
    setActiveTab('notices');
    localStorage.setItem(AUTH_KEY, JSON.stringify({ role: selectedRole, userName: name, studentId: student ? student.id : null, timestamp: new Date().toISOString() }));
    triggerNotification('환영합니다!', `${name}님, 시스템에 접속되었습니다.`, 'notice');
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem(AUTH_KEY);
      setIsAuthenticated(false);
      setUserName('');
      setLoggedInStudentId(null);
      setRole('student');
    }
  };

  const handleMarkAttendance = (studentId: string, status: AttendanceStatus) => {
    const today = new Date().toISOString().split('T')[0];
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const existingIndex = attendance.findIndex(r => r.studentId === studentId && r.date === today);
    if (existingIndex > -1) {
      const newAttendance = [...attendance];
      newAttendance[existingIndex] = { ...newAttendance[existingIndex], status };
      setAttendance(newAttendance);
    } else {
      setAttendance([...attendance, { id: Math.random().toString(36).substr(2, 9), studentId, date: today, status }]);
    }
    triggerNotification(`[출결 알림]`, `${student.name} 학생: ${status}`, 'attendance', studentId);
  };

  const menuItems = [
    { id: 'notices', label: '공지사항', icon: '📢', mobileLabel: '공지', roles: ['admin', 'teacher', 'parent', 'student'] },
    { id: 'timetable', label: '학원 시간표', icon: '🗓️', mobileLabel: '시간표', roles: ['admin', 'teacher', 'parent', 'student'] },
    { id: 'students', label: '학생 명단', icon: '👥', mobileLabel: '명단', roles: ['admin', 'teacher'] },
    { id: 'attendance', label: '출결 체크', icon: '📝', mobileLabel: '체크', roles: ['admin', 'teacher'] },
    { id: 'attendanceHistory', label: '출결 통계', icon: '📊', mobileLabel: '통계', roles: ['admin', 'teacher', 'parent', 'student'] },
    { id: 'grades', label: '성적 분석', icon: '📈', mobileLabel: '성적', roles: ['admin', 'teacher', 'parent', 'student'] },
    { id: 'homework', label: '숙제 관리', icon: '📚', mobileLabel: '숙제', roles: ['admin', 'teacher', 'parent', 'student'] },
    { id: 'community', label: '소통 공간', icon: '💬', mobileLabel: '소통', roles: ['admin', 'teacher', 'parent', 'student'] },
    { id: 'share', label: '어플 배포/공유', icon: '☁️', mobileLabel: '공유', roles: ['admin'] },
    { id: 'dashboard', label: role === 'admin' || role === 'teacher' ? '운영 홈' : '나의 홈', icon: '🏢', mobileLabel: '홈', roles: ['admin', 'teacher', 'parent', 'student'] },
  ].filter(item => item.roles.includes(role));

  if (isInitializing) return <div className="min-h-screen bg-indigo-600 flex items-center justify-center text-white font-black animate-pulse text-2xl">BUMCHEON...</div>;
  if (!isAuthenticated) return <Login onLogin={handleLogin} students={students} />;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 overflow-x-hidden">
      {activeToast && <NotificationToast notification={activeToast} onClose={() => setActiveToast(null)} />}
      
      {showInstallGuide && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowInstallGuide(false)}>
          <div className="bg-white rounded-[3rem] p-8 max-w-sm w-full space-y-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-6 right-6 text-slate-300" onClick={() => setShowInstallGuide(false)}>✕</button>
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white mx-auto shadow-xl">B</div>
            
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">진짜 학원 어플 만들기</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Public App Deployment Guide</p>
            </div>
            
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 space-y-2">
              <p className="text-[11px] font-black text-rose-700 leading-tight">
                🛑 404 에러가 뜨는 이유
              </p>
              <p className="text-[10px] text-rose-600 leading-tight font-medium">
                지금 주소는 '비밀 편집용'이라 다른 사람 폰에서는 안 열립니다. [어플 배포/공유] 탭에서 진짜 학원 주소를 만드는 방법을 확인하세요!
              </p>
            </div>

            <button onClick={() => { setShowInstallGuide(false); setActiveTab('share'); }} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 active:scale-95 transition-all">진짜 주소 만드는 법 보기</button>
          </div>
        </div>
      )}

      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex-col shadow-xl z-30">
        <div className="p-8">
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <span className="bg-indigo-600 w-9 h-9 rounded-xl flex items-center justify-center">B</span> 범천반석학원
          </h1>
        </div>
        <nav className="mt-4 px-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}>
              <span className="text-lg">{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6">
          <button onClick={handleLogout} className="w-full py-3 bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-700">로그아웃</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 sticky top-0 z-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="md:hidden bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs">B</div>
             <div className="flex flex-col">
                <h2 className="text-sm md:text-xl font-black text-slate-900 leading-tight">{menuItems.find(m => m.id === activeTab)?.label || '시스템'}</h2>
                <div className="flex items-center gap-1.5 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span><p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{userName}님 접속 중</p></div>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopyLink} className="bg-slate-100 text-slate-600 px-3 py-2 rounded-xl text-[10px] font-black border border-slate-200 active:bg-slate-200">주소복사</button>
            <button onClick={handleInstallClick} className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-[10px] font-black shadow-lg">공유안내</button>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          {activeTab === 'dashboard' && (
             <div className="space-y-6">
               <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><span className="text-8xl">✨</span></div>
                 <div className="relative z-10">
                   <div className="flex justify-between items-start mb-4"><span className="text-xs font-black bg-white/20 px-2 py-1 rounded-md">{role === 'admin' || role === 'teacher' ? 'AI 운영 리포트' : 'AI 학습 리포트'}</span></div>
                   <p className="text-sm md:text-base font-bold leading-relaxed whitespace-pre-wrap">{loadingInsight ? "데이터 분석 중..." : (aiInsight || "나의 학습 데이터를 분석합니다.")}</p>
                 </div>
               </div>
               <Dashboard students={role === 'admin' || role === 'teacher' ? students : students.filter(s => s.id === loggedInStudentId)} attendance={role === 'admin' || role === 'teacher' ? attendance : attendance.filter(r => r.studentId === loggedInStudentId)} />
             </div>
          )}
          {activeTab === 'notices' && <NoticeBoard notices={notices} role={role} onAddNotice={() => {}} onDeleteNotice={() => {}} />}
          {activeTab === 'timetable' && <TimetableManager timetable={timetable} role={role} onUpdateTimetable={(updated) => setTimetable(updated)} onNotifyAll={() => {}} />}
          {activeTab === 'share' && role === 'admin' && <ShareGuide />}
          {(role === 'admin' || role === 'teacher') && activeTab === 'students' && <StudentList students={students} role={role} onAddStudent={() => {}} onUpdateStudent={() => {}} onDeleteStudent={() => {}} onSendTuitionReminder={() => {}} />}
          {(role === 'admin' || role === 'teacher') && activeTab === 'attendance' && <AttendanceTracker students={students} records={attendance} onMarkAttendance={handleMarkAttendance} />}
          {activeTab === 'attendanceHistory' && <AttendanceHistory students={role === 'admin' || role === 'teacher' ? students : students.filter(s => s.id === loggedInStudentId)} records={role === 'admin' || role === 'teacher' ? attendance : attendance.filter(r => r.studentId === loggedInStudentId)} />}
          {activeTab === 'grades' && <GradeManager grades={grades} students={role === 'admin' || role === 'teacher' ? students : students.filter(s => s.id === loggedInStudentId)} role={role} currentUserId={currentUserId} />}
          {activeTab === 'homework' && <HomeworkManager homeworks={homeworks} submissions={submissions} students={role === 'admin' || role === 'teacher' ? students : students.filter(s => s.id === loggedInStudentId)} role={role} onUpdateStatus={() => {}} onAddHomework={() => {}} />}
          {activeTab === 'community' && <CommunityBoard posts={posts} role={role} currentUserId={currentUserId} onAddPost={() => {}} onDeletePost={() => {}} />}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 py-2.5 flex justify-around items-center z-50 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        {menuItems.slice(0, 5).map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${activeTab === item.id ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">{item.mobileLabel}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
