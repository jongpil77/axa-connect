import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  User, Heart, MessageCircle, Gift, Bell, Sparkles, Smile, Frown, Meh, 
  Megaphone, X, Send, Settings, ChevronRight, LogOut, Image as ImageIcon, 
  Coins, Pencil, Trash2, Loader2, Lock, Clock, Award, Wallet, Building2, 
  CornerDownRight, Link as LinkIcon, MapPin, Search, Key, Edit3, 
  ClipboardList, CheckSquare, ChevronLeft, Zap, Users, Briefcase, Utensils,
  ThumbsUp, Coffee, Sun, Moon, PlusCircle, CheckCircle, Plug 
} from 'lucide-react';
// Supabase 클라이언트 전역 초기화 (Static Import 사용)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// --- [필수] Supabase 설정 ---
const SUPABASE_URL = 'https://clsvsqiikgnreqqvcrxj.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsc3ZzcWlpa2ducmVxcXZjcnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzcyNjAsImV4cCI6MjA4MDk1MzI2MH0.lsaycyp6tXjLwb-qB5PIQ0OqKweTWO3WaxZG5GYOUqk';

// --- Supabase 클라이언트 전역 초기화 ---
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 상수 데이터 ---
const ORGANIZATION = {
  '본사': ['보상기획팀', '보상지원팀', 'A&H손해사정지원팀', '고객지원팀'],
  '서울보상부': ['강북대물', '남양주대물', '강남대물', '일산대물', '서울외제차', '강원보상', '동부대인', '서부대인'],
  '경인보상부': ['경인', '인천대물', '강서대물', '성남대물', '수원대물', '경인외제차', '경기대인', '인천대인'],
  '중부보상부': ['중부', '대전대물', '광주대물', '전주대물', '청주대물', '대전대인', '광주대인'],
  '남부보상부': ['남부', '대구대물', '경북대물', '부산대물', '경남대물', '제주보상', '대구대인', '부산대인'],
  '스마트보상부': ['스마트지원', '스피드대물', '프라임대물1', '스피드대인', '프라임대인1', '프라임대인2', '프라임대인3'],
  '특수보상부': ['특수조사센터', '구상보상1', '구상보상2', '의료', 'SIU'],
  'A&H보상부': ['A&H보상1', 'A&H보상2'],
  '사당CS부': ['사당CS'],
  '대구CS부': ['대구CS']
};

const REGIONS = {
    '서울': ['강남구', '서초구', '송파구', '종로구', '마포구', '용산구', '성동구'],
    '경기': ['성남시', '수원시', '용인시', '고양시', '화성시', '안양시'],
    '인천': ['연수구', '남동구', '부평구'],
    '부산': ['해운대구', '수영구', '부산진구'],
    '대구': ['수성구', '중구'],
    '대전': ['유성구', '서구'],
    '광주': ['광산구', '서구'],
    '제주': ['제주시', '서귀포시']  
};

const INITIAL_POINTS = 1000;
const AXA_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/9/94/AXA_Logo.svg"; 

// --- Helper Functions ---
const formatName = (name) => {
  if (!name) return '';
  if (/[가-힣]{2,}/.test(name)) return name.substring(1); 
  return name; 
};

const formatInitial = (name) => {
    if (!name) return '';
    return name.charAt(0);
};

const getWeeklyBirthdays = (profiles) => {
    if (!profiles || profiles.length === 0) return { current: [], next: [] };

    const today = new Date();
    const currentYear = today.getFullYear();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); 
    const endOfCurrentWeek = new Date(startOfWeek);
    endOfCurrentWeek.setDate(startOfWeek.getDate() + 7);

    const endOfNextWeek = new Date(endOfCurrentWeek);
    endOfNextWeek.setDate(endOfCurrentWeek.getDate() + 7);

    const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedToday = normalizeDate(new Date());

    const currentBirthdays = [];
    const nextBirthdays = [];

    profiles.forEach(p => {
        if (!p.birthdate) return;
        const [_, m, d] = p.birthdate.split('-').map(Number);
        // 양력 기준 (User Request)
        const birthDate = new Date(currentYear, m - 1, d); 
        let normalizedBirthDate = normalizeDate(birthDate);

        if (normalizedBirthDate.getTime() === normalizedToday.getTime()) return; // 오늘 생일은 별도 팝업 처리
        
        if (normalizedBirthDate < normalizedToday) {
             const nextYearBirthDate = new Date(currentYear + 1, m - 1, d);
             normalizedBirthDate = normalizeDate(nextYearBirthDate);
        }
        
        const typeLabel = '(양력)'; 

        if (normalizedBirthDate >= normalizedToday && normalizedBirthDate < normalizeDate(endOfCurrentWeek)) {
             currentBirthdays.push({ name: p.name, date: `${m}/${d}`, typeLabel });
        } 
        else if (normalizedBirthDate >= normalizeDate(endOfCurrentWeek) && normalizedBirthDate < normalizeDate(endOfNextWeek)) {
             nextBirthdays.push({ name: p.name, date: `${m}/${d}`, typeLabel });
        }
    });

    return { current: currentBirthdays, next: nextBirthdays };
};

const isToday = (timestamp) => {
    if (!timestamp) return false;
    const date = new Date(timestamp);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

// --- Sub Components ---

const MoodToast = ({ message, emoji, visible }) => {
    if (!visible) return null;
    return (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up w-[90%] max-w-sm pointer-events-none">
            <div className="bg-slate-800/90 backdrop-blur-sm text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700">
                <span className="text-3xl">{emoji}</span>
                <span className="text-sm font-bold leading-relaxed whitespace-pre-line">{message}</span>
            </div>
        </div>
    );
};

const AdminAlertModal = ({ onClose }) => {
    const [doNotShow, setDoNotShow] = useState(false);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl relative">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-red-500">
                    <Bell className="w-5 h-5"/> 알림
                </h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    📢 <strong>처리되지 않은 포인트 차감 신청</strong>이 있습니다.<br/>
                    설정 메뉴에서 내역을 확인해주세요.
                </p>
                
                <div className="flex items-center gap-2 mb-4 bg-slate-50 p-2 rounded-lg cursor-pointer" onClick={() => setDoNotShow(!doNotShow)}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${doNotShow ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'}`}>
                        {doNotShow && <CheckSquare className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xs text-slate-500 select-none">오늘 하루 더 이상 열지 않기</span>
                </div>

                <button 
                    onClick={() => onClose(doNotShow)} 
                    className="w-full bg-slate-800 text-white p-3 rounded-xl font-bold hover:bg-slate-900 transition-colors"
                >
                    확인
                </button>
            </div>
        </div>
    );
};

const GiftNotificationModal = ({ onClose, gifts }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative text-center">
                <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full"><X className="w-5 h-5" /></button>
                <div className="text-5xl mb-4 animate-bounce">🎁</div>
                <h3 className="text-lg font-black text-slate-800 mb-2">포인트 선물이 도착했어요!</h3>
                <p className="text-sm text-slate-500 mb-6">동료들이 보낸 따뜻한 마음을 확인해보세요.</p>
                
                <div className="space-y-3 mb-6 max-h-40 overflow-y-auto pr-1">
                    {gifts.map((gift, idx) => (
                        <div key={idx} className="bg-pink-50 p-3 rounded-xl border border-pink-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-600">{gift.reason.replace('선물 받음 (', '').replace(')', '')}님</span>
                            <span className="text-sm font-black text-pink-500">+{gift.amount.toLocaleString()} P</span>
                        </div>
                    ))}
                </div>
                
                <button onClick={onClose} className="w-full bg-pink-500 text-white p-4 rounded-2xl font-bold hover:bg-pink-600 shadow-lg transition-all">
                    감사히 받겠습니다!
                </button>
            </div>
        </div>
    );
};

const AuthForm = ({ isSignupMode, setIsSignupMode, handleLogin, handleSignup, loading }) => {
  const [birthdate, setBirthdate] = useState('1999-01-01'); // 초기값 1999년 1월
  const [selectedDept, setSelectedDept] = useState('');
  const [email, setEmail] = useState('');
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleSendVerification = () => {
      // 개인 메일도 허용하기 위해 제한 해제
      // if (!email.endsWith('@axa.co.kr')) { ... } 
      
      alert(`[인증번호 발송]\n${email}로 인증코드가 발송되었습니다.\n(테스트 코드: 1234)`);
      setEmailCodeSent(true);
  };

  const handleVerifyCode = () => {
      if (verificationCode === '1234') {
          setEmailVerified(true);
          alert('이메일 인증이 완료되었습니다.');
      } else {
          alert('인증 코드가 올바르지 않습니다.');
      }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex justify-center items-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 border border-blue-100 animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-400 to-blue-600"></div>
        <div className="text-center mb-10 mt-6 flex flex-col items-center">
          <img src={AXA_LOGO_URL} alt="AXA Logo" className="w-20 h-auto mb-4" />
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">AXA Connect</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">함께 만드는 스마트한 조직문화 🚀</p>
        </div>

        {isSignupMode ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <div><label className="block text-xs font-bold text-slate-500 mb-1 ml-1">이름</label><input name="name" type="text" placeholder="홍길동" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm focus:border-blue-500 transition-colors" required /></div>
            
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">이메일</label>
                <div className="flex gap-2">
                    <input name="email" type="email" placeholder="example@email.com" className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm focus:border-blue-500 transition-colors" value={email} onChange={(e) => setEmail(e.target.value)} readOnly={emailVerified} required />
                    <button type="button" onClick={handleSendVerification} disabled={emailVerified || !email} className="bg-blue-100 text-blue-600 text-xs font-bold px-3 rounded-2xl hover:bg-blue-200 disabled:opacity-50 whitespace-nowrap">{emailVerified ? '인증완료' : '인증요청'}</button>
                </div>
            </div>

            {emailCodeSent && !emailVerified && (
                <div className="animate-fade-in">
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">인증 코드</label>
                    <div className="flex gap-2">
                        <input type="text" placeholder="코드 입력" className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm focus:border-blue-500 transition-colors" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
                        <button type="button" onClick={handleVerifyCode} className="bg-slate-800 text-white text-xs font-bold px-3 rounded-2xl hover:bg-slate-700 whitespace-nowrap">확인</button>
                    </div>
                </div>
            )}
            
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">생년월일 (양력)</label>
                <div className="flex gap-2"><input name="birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm text-slate-600 focus:border-blue-500 transition-colors" required /></div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">비밀번호</label>
                <input name="password" type="password" placeholder="비밀번호 설정 (숫자 6자리 이상)" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm focus:border-blue-500 transition-colors" required minLength="6" />
            </div>
            <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <select name="dept" className="w-full p-2 bg-white border border-slate-200 rounded-xl outline-none text-xs text-slate-700" onChange={(e) => setSelectedDept(e.target.value)} required><option value="">본부/부문</option>{Object.keys(ORGANIZATION).map(dept => <option key={dept} value={dept}>{dept}</option>)}</select>
                <select name="team" className="w-full p-2 bg-white border border-slate-200 rounded-xl outline-none text-xs text-slate-700" disabled={!selectedDept} required><option value="">팀/센터</option>{selectedDept && ORGANIZATION[selectedDept].map(team => <option key={team} value={team}>{team}</option>)}</select>
              </div>
            </div>
            <button type="submit" disabled={loading || !emailVerified} className="w-full bg-blue-600 text-white p-4 rounded-2xl text-sm font-bold hover:bg-blue-700 shadow-lg transition-all mt-2 disabled:bg-slate-300 flex justify-center">{loading ? <Loader2 className="animate-spin w-5 h-5" /> : '가입 완료 (1,000P 지급)'}</button>
            <button type="button" onClick={() => setIsSignupMode(false)} className="w-full text-slate-400 text-xs py-2 hover:text-blue-600">로그인으로 돌아가기</button>
          </form>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div><label className="block text-xs font-bold text-slate-500 mb-1 ml-1">이메일</label><input name="email" type="text" placeholder="이메일 입력" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm focus:border-blue-500 transition-colors" /></div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1 ml-1">비밀번호</label><input name="password" type="password" placeholder="비밀번호 (숫자 6자리 이상)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm focus:border-blue-500 transition-colors" required minLength="6" /></div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-2xl text-sm font-bold hover:bg-blue-700 shadow-lg transition-all active:scale-[0.98] disabled:bg-blue-300 flex justify-center">{loading ? <Loader2 className="animate-spin w-5 h-5" /> : '🚀 로그인'}</button>
            </form>
            <div className="text-center mt-2"><button onClick={() => setIsSignupMode(true)} className="text-slate-500 text-xs font-bold hover:text-blue-600 underline transition-colors">임직원 회원가입</button></div>
          </div>
        )}
      </div>
    </div>
  );
};

const Header = ({ currentUser, onOpenUserInfo, handleLogout, onOpenChangeDept, onOpenChangePwd, onOpenAdminGrant, onOpenRedemptionList, onOpenGift, onOpenAdminManage, boosterActive }) => {
  const todayDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const [showSettings, setShowSettings] = useState(false);
  const displayName = formatName(currentUser?.name);
  
  return (
    <div className="bg-white/80 backdrop-blur-md p-4 sticky top-0 z-30 border-b border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-1">
          <div className="text-[10px] text-blue-400 font-bold pl-1">{todayDate}</div>
          {boosterActive && <div className="text-[10px] text-white bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 rounded-full font-bold animate-pulse flex items-center gap-1"><Zap className="w-3 h-3 fill-yellow-300 text-yellow-300"/>포인트 2배 부스터 ON</div>}
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1 relative">
            <img src={AXA_LOGO_URL} alt="AXA Logo" className="w-8 h-auto mr-1" />
            <div className="relative">
                <h1 className="text-xl font-black text-slate-800 tracking-tight">AXA Connect</h1>
                <Plug className="w-3 h-3 text-blue-600 fill-blue-600 absolute -top-1 -right-2" />
            </div>
        </div>
        
        <div className="flex items-center gap-3 relative">
          <button 
            onClick={onOpenGift} 
            className="p-1 rounded-full hover:bg-slate-100 active:scale-95 transition-all relative"
          >
             <Gift className="w-8 h-8 text-pink-500" />
          </button>

          <div 
            className="flex items-center gap-2 mr-1 cursor-pointer bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-200 shadow-sm" 
            onClick={onOpenUserInfo}
          >
             <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] text-slate-500 font-bold whitespace-nowrap">MY CARE</span>
                <span className="text-[9px] text-slate-500 font-bold whitespace-nowrap">POINT</span>
             </div>
             <div className="flex items-center gap-1">
                 <Coins className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                 <span className="text-lg font-black text-blue-700 animate-pulse">{currentUser?.points?.toLocaleString()}</span>
             </div>
          </div>

          <div className="flex flex-col items-center">
              <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors relative z-40"><Settings className="w-6 h-6 text-slate-400" /></button>
              <span className="text-[8px] text-slate-400 font-bold -mt-0.5">설정</span>
          </div>
          
          {showSettings && (
             <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50 animate-fade-in">
                <button onClick={() => { setShowSettings(false); onOpenChangeDept(); }} className="flex items-center gap-2 w-full p-3 text-xs text-slate-600 hover:bg-slate-50 border-b border-slate-50 transition-colors">
                   <Edit3 className="w-3.5 h-3.5 text-blue-400"/> 소속/팀 변경
                </button>
                <button onClick={() => { setShowSettings(false); onOpenChangePwd(); }} className="flex items-center gap-2 w-full p-3 text-xs text-slate-600 hover:bg-slate-50 border-b border-slate-50 transition-colors">
                   <Key className="w-3.5 h-3.5 text-blue-400"/> 비밀번호 변경
                </button>
                
                {currentUser?.role === 'admin' && (
                    <>
                    <button onClick={() => { setShowSettings(false); onOpenAdminManage(); }} className="flex items-center gap-2 w-full p-3 text-xs text-slate-800 font-bold hover:bg-slate-50 border-b border-slate-50 transition-colors">
                        <Users className="w-3.5 h-3.5 text-slate-600"/> 사용자/이벤트 관리
                    </button>
                    <button onClick={() => { setShowSettings(false); onOpenAdminGrant(); }} className="flex items-center gap-2 w-full p-3 text-xs text-blue-600 font-bold hover:bg-blue-50 border-b border-slate-50 transition-colors">
                        <Gift className="w-3.5 h-3.5 text-blue-500"/> 포인트 지급 (관리자)
                    </button>
                    <button onClick={() => { setShowSettings(false); onOpenRedemptionList(); }} className="flex items-center gap-2 w-full p-3 text-xs text-purple-600 font-bold hover:bg-purple-50 border-b border-slate-50 transition-colors">
                        <ClipboardList className="w-3.5 h-3.5 text-purple-500"/> 포인트 차감 신청 관리
                    </button>
                    </>
                )}

                <button onClick={handleLogout} className="flex items-center gap-2 w-full p-3 text-xs text-red-400 hover:bg-red-50 transition-colors">
                   <LogOut className="w-3.5 h-3.5"/> 로그아웃
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChangeDeptModal = ({ onClose, onSave }) => { const [dept, setDept] = useState(''); const [team, setTeam] = useState(''); return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"><div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl relative"><button onClick={onClose} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5"/></button><h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Building2 className="w-5 h-5"/> 소속 변경</h3><div className="space-y-3"><select className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none" onChange={(e) => setDept(e.target.value)}><option value="">본부/부문 선택</option>{Object.keys(ORGANIZATION).map(d => <option key={d} value={d}>{d}</option>)}</select><select className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none" disabled={!dept} onChange={(e) => setTeam(e.target.value)}><option value="">팀 선택</option>{dept && ORGANIZATION[dept].map(t => <option key={t} value={t}>{t}</option>)}</select><button onClick={() => onSave(dept, team)} disabled={!dept || !team} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-colors">변경 저장</button></div></div></div>); };
const ChangePasswordModal = ({ onClose, onSave }) => { const [password, setPassword] = useState(''); const isValid = password.length >= 6 && /^\d+$/.test(password); return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"><div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl relative"><button onClick={onClose} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5"/></button><h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Key className="w-5 h-5"/> 비밀번호 변경</h3><div className="space-y-3"><input type="password" placeholder="새 비밀번호 (6자리 이상 숫자)" className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none" value={password} onChange={(e) => setPassword(e.target.value)}/><button onClick={() => onSave(password)} disabled={!isValid} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-colors">비밀번호 변경</button></div></div></div>); };
const AdminGrantModal = ({ onClose, onGrant, profiles }) => { const [dept, setDept] = useState(''); const [targetUser, setTargetUser] = useState(''); const [amount, setAmount] = useState(''); const filteredUsers = profiles.filter(p => p.dept === dept); return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"><div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative"><button onClick={onClose} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5"/></button><h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-600"><Gift className="w-5 h-5"/> 특별 포인트 지급</h3><div className="space-y-3"><select className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none" onChange={(e) => { setDept(e.target.value); setTargetUser(''); }}><option value="">소속 선택</option>{Object.keys(ORGANIZATION).map(d => <option key={d} value={d}>{d}</option>)}</select><select className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none" disabled={!dept} onChange={(e) => setTargetUser(e.target.value)}><option value="">직원 선택</option>{filteredUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.team})</option>)}</select><input type="number" placeholder="지급 포인트 (숫자만 입력)" className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none font-bold" value={amount} onChange={(e) => setAmount(e.target.value)}/><button onClick={() => onGrant(targetUser, amount)} disabled={!targetUser || !amount} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition-all">포인트 지급하기</button></div></div></div>); };
const RedemptionListModal = ({ onClose, redemptionList, onComplete }) => (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"><div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl relative max-h-[80vh] flex flex-col"><button onClick={onClose} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5"/></button><h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-600"><ClipboardList className="w-5 h-5"/> 포인트 차감 신청 내역</h3><div className="flex-1 overflow-y-auto">{redemptionList && redemptionList.length > 0 ? (<div className="space-y-2">{redemptionList.map((item, index) => (<div key={index} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl"><div><p className="text-sm font-bold text-slate-700">{item.user_name}</p><p className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleDateString()} 신청</p></div><div className="flex items-center gap-3"><div className="text-red-500 font-bold text-sm">-{item.amount?.toLocaleString()}</div>{item.status !== 'completed' ? (<button onClick={() => onComplete(item.id)} className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded hover:bg-blue-200 transition-colors">완료 처리</button>) : (<span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">처리 완료</span>)}</div></div>))}</div>) : (<p className="text-center text-slate-400 py-10 text-sm">신청 내역이 없습니다.</p>)}</div></div></div>);
const AdminManageModal = ({ onClose, profiles, onUpdateUser, onDeleteUser, boosterActive, setBoosterActive }) => { const [searchTerm, setSearchTerm] = useState(''); const filtered = profiles.filter(p => p.name.includes(searchTerm) || p.email.includes(searchTerm)); return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"><div className="bg-white w-full max-w-4xl rounded-2xl p-6 shadow-2xl relative h-[80vh] flex flex-col"><button onClick={onClose} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5"/></button><h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Users className="w-5 h-5"/> 사용자 및 이벤트 관리</h3><div className="flex gap-4 mb-4"><div className="flex-1 bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-center justify-between"><div><h4 className="font-bold text-purple-700 flex items-center gap-1"><Zap className="w-4 h-4"/> 포인트 부스터 이벤트</h4><p className="text-xs text-slate-500">활성화 시 모든 획득 포인트 2배</p></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={boosterActive} onChange={() => setBoosterActive(!boosterActive)} /><div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div></label></div></div><div className="mb-2 flex gap-2"><input className="flex-1 p-2 border border-slate-200 rounded-lg text-sm" placeholder="이름/이메일 검색" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} /></div><div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl"><table className="w-full text-sm text-left"><thead className="bg-slate-50 text-slate-600 font-bold sticky top-0"><tr><th className="p-3">이름</th><th className="p-3">부서/팀</th><th className="p-3">권한</th><th className="p-3">앰버서더</th><th className="p-3">관리</th></tr></thead><tbody>{filtered.map(user => (<tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50"><td className="p-3">{user.name}</td><td className="p-3 text-xs">{user.dept}<br/>{user.team}</td><td className="p-3"><select value={user.role} onChange={(e) => onUpdateUser(user.id, { role: e.target.value })} className="border rounded p-1 text-xs"><option value="member">일반</option><option value="admin">관리자</option></select></td><td className="p-3"><input type="checkbox" checked={user.is_ambassador || false} onChange={(e) => onUpdateUser(user.id, { is_ambassador: e.target.checked })} /></td><td className="p-3"><button onClick={() => onDeleteUser(user.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 className="w-4 h-4"/></button></td></tr>))}</tbody></table></div></div></div>); };
const UserInfoModal = ({ currentUser, pointHistory, setShowUserInfoModal, handleRedeemPoints }) => (<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"><div className="bg-white w-full max-w-md rounded-[2rem] p-0 shadow-2xl max-h-[90vh] overflow-y-auto relative"><div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 rounded-t-[2rem] flex justify-between items-center sticky top-0 z-10"><div className="flex flex-col text-white"><h3 className="text-lg font-bold flex items-center gap-2"><User className="w-5 h-5"/> {currentUser.name}</h3><p className="text-xs opacity-90 ml-7 mt-0.5 flex items-center gap-1 font-medium"><Building2 className="w-3 h-3"/> {currentUser.dept} / {currentUser.team}{currentUser.is_ambassador && <span className="bg-purple-400 text-white text-[9px] px-2 py-0.5 rounded ml-2 font-bold shadow-sm">앰버서더</span>}</p></div><button onClick={() => setShowUserInfoModal(false)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"><X className="w-5 h-5" /></button></div><div className="p-6 space-y-5">{currentUser.points >= 10000 ? (<div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center"><p className="text-sm text-blue-800 font-bold mb-2">🎉 보유 포인트가 10,000P 이상입니다!</p><button onClick={handleRedeemPoints} className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors shadow-md"><Wallet className="w-4 h-4" /> 10,000P 상품권 교환 신청</button></div>) : (<div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center"><p className="text-xs text-slate-500">10,000P 부터 상품권 교환 신청이 가능해요 🎁</p><div className="mt-2 w-full bg-slate-200 h-2 rounded-full overflow-hidden"><div className="bg-blue-400 h-full transition-all duration-500" style={{ width: `${Math.min((currentUser.points / 10000) * 100, 100)}%` }}></div></div><p className="text-[10px] text-slate-400 mt-1 text-right">{Math.floor((currentUser.points / 10000) * 100)}% 달성</p></div>)}<div><h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400"/> 포인트 히스토리</h4><div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-hide">{pointHistory.length > 0 ? pointHistory.map((history) => (<div key={history.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm"><div className="flex-1 min-w-0"><p className="text-xs font-bold text-slate-700 line-clamp-1">{history.reason}</p><span className="text-[10px] text-slate-400">{new Date(history.created_at).toLocaleDateString()}</span></div><div className="text-sm font-black ml-4 flex items-center gap-1" style={{ color: history.type.includes('use') || history.type === 'gift_sent' ? '#ef4444' : '#10b981' }}>{history.type.includes('use') || history.type === 'gift_sent' ? '-' : '+'}{history.amount.toLocaleString()}</div></div>)) : (<div className="text-center text-xs text-slate-400 py-6">아직 활동 내역이 없습니다.</div>)}</div></div></div></div></div>);
const BirthdayPopup = ({ currentUser, handleBirthdayGrant, setShowBirthdayPopup }) => { const [doNotShow, setDoNotShow] = useState(false); const handleClose = () => { if (doNotShow) { localStorage.setItem('birthday_popup_closed_' + new Date().getFullYear(), 'true'); } setShowBirthdayPopup(false); }; return (<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"><div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative text-center"><button onClick={handleClose} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full"><X className="w-5 h-5" /></button><div className="text-5xl mb-4"><span className="text-6xl animate-pulse">🎂</span></div><h3 className="text-lg font-black text-slate-800 mb-2">생일 축하 드립니다!</h3><p className="text-sm text-slate-500 mb-6">소중한 {currentUser.name} 님의 생일을 맞아<br/>특별한 선물을 준비했어요.</p><div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200 mb-6"><span className="text-2xl font-black text-yellow-600 flex items-center justify-center gap-2"><Coins className="w-6 h-6 fill-yellow-500 text-yellow-600"/> +1,000 P</span></div><button onClick={handleBirthdayGrant} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg transition-all flex justify-center items-center gap-2 mb-3"><Gift className="w-5 h-5"/> 포인트 받기</button><div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => setDoNotShow(!doNotShow)}><div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${doNotShow ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'}`}>{doNotShow && <CheckSquare className="w-3 h-3 text-white" />}</div><span className="text-xs text-slate-400 select-none">더 이상 열지 않기</span></div></div></div>); };
const BirthdayNotifier = ({ weeklyBirthdays }) => { const [view, setView] = useState('current'); const list = view === 'current' ? weeklyBirthdays.current : weeklyBirthdays.next; return (<div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100 h-full flex flex-col"><h3 className="font-bold text-sm mb-3 flex items-center text-slate-800"><span className="mr-2">🎂</span> 생일자</h3><div className="flex bg-blue-50 p-1 rounded-xl mb-3 border border-blue-100"><button onClick={() => setView('current')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${view === 'current' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>이번 주</button><button onClick={() => setView('next')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${view === 'next' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>다음 주</button></div><div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">{list.length > 0 ? (<div className="space-y-2">{list.map((b, index) => (<div key={index} className="flex items-center gap-2 p-2 bg-blue-100/50 border border-blue-100 rounded-xl"><div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs shadow-sm">🎂</div><div><p className="text-xs font-bold text-slate-700">{b.name}</p><p className="text-[10px] text-slate-400">{b.date} <span className="text-blue-500 font-bold">{b.typeLabel}</span></p></div></div>))}</div>) : (<div className="h-full flex flex-col items-center justify-center text-slate-300 text-xs gap-1"><Smile className="w-5 h-5 opacity-50"/><span>생일자가 없어요</span></div>)}</div></div>); };

const GiftModal = ({ onClose, onGift, profiles, currentUser, pointHistory }) => {
    const [tab, setTab] = useState('dept');
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [targetUser, setTargetUser] = useState('');
    const [amount, setAmount] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const currentMonth = new Date().getMonth();
    const usedGiftPoints = pointHistory.filter(h => h.type === 'gift_sent' && new Date(h.created_at).getMonth() === currentMonth).reduce((sum, h) => sum + h.amount, 0);
    const remainingLimit = 1000 - usedGiftPoints;
    
    const filteredUsers = profiles.filter(p => {
        if (p.id === currentUser.id) return false;
        if (tab === 'name') return p.name.includes(searchTerm) || p.team.includes(searchTerm);
        if (tab === 'dept') return selectedDept ? p.dept === selectedDept : false;
        if (tab === 'team') return selectedTeam ? p.team === selectedTeam : false;
        return false;
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5"/></button>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-pink-500"><Gift className="w-5 h-5"/> 마음 선물하기</h3>
                
                <div className="bg-red-50 text-red-500 text-[10px] font-bold p-2 rounded-lg text-center mb-4 border border-red-100">
                    ⚠️ 선물하기 월 최대 1,000포인트 가능
                </div>
                
                <div className="bg-pink-50 p-3 rounded-xl mb-4 border border-pink-100">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">이번 달 남은 한도</span>
                        <span className="font-bold text-pink-600">{remainingLimit.toLocaleString()} P</span>
                    </div>
                    <div className="w-full bg-white h-1.5 rounded-full overflow-hidden">
                        <div className="bg-pink-400 h-full" style={{ width: `${(usedGiftPoints/1000)*100}%` }}></div>
                    </div>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl mb-3">
                    {[{id:'dept', label:'조직'}, {id:'team', label:'팀'}, {id:'name', label:'이름'}].map(t => (
                        <button key={t.id} onClick={() => { setTab(t.id); setTargetUser(''); }} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tab === t.id ? 'bg-white text-pink-500 shadow-sm' : 'text-slate-400'}`}>{t.label}</button>
                    ))}
                </div>

                <div className="space-y-3">
                    {tab === 'dept' && (
                        <select className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none" onChange={(e) => setSelectedDept(e.target.value)}>
                            <option value="">본부/부문 선택</option>
                            {Object.keys(ORGANIZATION).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    )}
                    
                    {tab === 'team' && (
                        <>
                        <select className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none mb-2" onChange={(e) => setSelectedDept(e.target.value)}>
                            <option value="">본부/부문 선택 (먼저 선택)</option>
                            {Object.keys(ORGANIZATION).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none" disabled={!selectedDept} onChange={(e) => setSelectedTeam(e.target.value)}>
                            <option value="">팀 선택</option>
                            {selectedDept && ORGANIZATION[selectedDept].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        </>
                    )}

                    {tab === 'name' && (
                        <div className="relative">
                             <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400"/>
                             <input type="text" placeholder="이름 검색" className="w-full p-3 pl-9 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    )}
                    
                    {(tab === 'name' || selectedDept || selectedTeam) && (
                        <select className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none" onChange={(e) => setTargetUser(e.target.value)} size={5}>
                            {filteredUsers.length > 0 ? filteredUsers.map(u => <option key={u.id} value={u.id} className="p-2 hover:bg-blue-50 rounded-lg">{u.name} ({u.team})</option>) : <option disabled>검색 결과가 없습니다</option>}
                        </select>
                    )}
                    
                    <input type="number" placeholder="선물할 포인트 (숫자만)" className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none font-bold" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    
                    <button onClick={() => onGift(targetUser, amount)} disabled={!targetUser || !amount || parseInt(amount) > remainingLimit || parseInt(amount) > currentUser.points} className="w-full bg-pink-500 text-white p-3 rounded-xl font-bold hover:bg-pink-600 disabled:bg-slate-300 transition-colors">선물 보내기</button>
                </div>
            </div>
        </div>
    );
};

const HomeTab = ({ mood, handleMoodCheck, handleCheckOut, hasCheckedOut, feeds, onWriteClickWithCategory, onNavigateToNews, onNavigateToFeed, weeklyBirthdays, boosterActive }) => {
    const noticeFeeds = feeds.filter(f => f.type === 'news').slice(0, 5); 
    const deptFeeds = feeds.filter(f => f.type === 'dept_news').slice(0, 5);
    const praiseFeeds = feeds.filter(f => f.type === 'praise').slice(0, 5); 
    const knowhowFeeds = feeds.filter(f => f.type === 'knowhow').slice(0, 5);
    const matjibFeeds = feeds.filter(f => f.type === 'matjib').slice(0, 5);

    return (
      <div className="p-5 space-y-5 pb-32 animate-fade-in relative bg-blue-50 min-h-full">
        <div className="flex gap-4 h-48">
            <div className="flex-[2] bg-white rounded-2xl p-4 shadow-sm border border-blue-100 flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <div>
                        <h2 className="text-xs font-bold text-slate-400 mb-0.5 flex items-center gap-1">
                            <span className="text-xl mr-1">⏰</span>출/퇴근 체크
                        </h2>
                        <p className="text-sm font-black text-slate-700">{mood ? (hasCheckedOut ? '오늘 하루 수고하셨어요!' : '업무 중') : '오늘 기분은 어때요?'}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center gap-2 relative z-10">
                     {!mood ? (
                         <div className="grid grid-cols-3 gap-2 h-full">
                             <button onClick={() => handleMoodCheck('good')} className="bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95">
                                 <Smile className="w-6 h-6 text-blue-500"/>
                                 <span className="text-[10px] font-bold text-slate-600">좋음</span>
                             </button>
                             <button onClick={() => handleMoodCheck('normal')} className="bg-green-50 border border-green-100 hover:bg-green-100 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95">
                                 <Meh className="w-6 h-6 text-green-500"/>
                                 <span className="text-[10px] font-bold text-slate-600">보통</span>
                             </button>
                             <button onClick={() => handleMoodCheck('tired')} className="bg-orange-50 border border-orange-100 hover:bg-orange-100 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95">
                                 <Frown className="w-6 h-6 text-orange-500"/>
                                 <span className="text-[10px] font-bold text-slate-600">피곤</span>
                             </button>
                         </div>
                     ) : (
                         <div className="h-full flex flex-col gap-2">
                             <div className="flex-1 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center text-xs font-bold border border-slate-100 cursor-default">
                                 {mood === 'checked' ? '출근완료' : '오늘도 화이팅!'}
                             </div>
                             <button onClick={handleCheckOut} disabled={hasCheckedOut} className={`h-12 ${hasCheckedOut ? 'bg-slate-100 text-slate-400' : 'bg-slate-800 text-white hover:bg-slate-900'} rounded-xl flex items-center justify-center text-xs font-bold transition-all active:scale-95 shadow-md`}>
                                 {hasCheckedOut ? '퇴근완료' : `퇴근하기 (+${boosterActive ? 40 : 20}P)`}
                             </button>
                         </div>
                     )}
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 z-0"></div>
            </div>
            <div className="flex-1 h-full"><BirthdayNotifier weeklyBirthdays={weeklyBirthdays} /></div>
        </div>

        <div>
           <div className="flex justify-between items-center mb-3 px-1"><h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Megaphone className="w-4 h-4 text-red-500"/> 공지사항</h2><button onClick={onNavigateToNews} className="text-xs text-slate-400 font-medium hover:text-blue-600 flex items-center gap-0.5">더보기 <ChevronRight className="w-3 h-3" /></button></div>
           <div className="space-y-2">{noticeFeeds.length > 0 ? noticeFeeds.map(feed => (<div key={feed.id} onClick={onNavigateToNews} className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 transition-transform active:scale-[0.99] hover:border-blue-200 cursor-pointer"><div className="flex-1 min-w-0"><p className="text-xs font-bold text-slate-800 line-clamp-1 mb-0.5">{feed.title || feed.content}{isToday(feed.created_at) && <span className="ml-1 px-1 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded-sm inline-block">NEW</span>}</p><span className="text-[10px] text-slate-400">{feed.formattedTime} • {feed.author}</span></div><ChevronRight className="w-4 h-4 text-slate-300" /></div>)) : <div className="text-center text-xs text-slate-400 py-6 bg-white rounded-2xl border border-slate-100 border-dashed">등록된 공지가 없습니다.</div>}</div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
            {/* 글쓰기 버튼 클릭 시 카테고리 선택 팝업을 띄우기 위해 null 전달 */}
            <button onClick={() => onWriteClickWithCategory(null)} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-full shadow-lg shadow-blue-200 hover:shadow-xl transition-all flex items-center gap-2 active:scale-95 border border-blue-400"><Pencil className="w-4 h-4" /><span className="text-sm font-bold">글쓰기</span></button>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-full shadow-sm border border-slate-100">
                <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner"><Coins className="w-2.5 h-2.5 text-white fill-white"/></div>
                게시글 1개당 +50P (일 최대 +100P 가능)
            </div>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-blue-100 cursor-pointer hover:border-green-200 transition-colors" onClick={() => onWriteClickWithCategory('praise')}>
           <h3 className="text-sm font-bold text-green-600 mb-3 flex items-center gap-1.5 pointer-events-none"><Heart className="w-4 h-4 fill-green-500 text-green-500"/> 칭찬합시다</h3>
           <div className="space-y-2 pointer-events-none">{praiseFeeds.length > 0 ? praiseFeeds.map(feed => (<div key={feed.id} className="p-3 bg-green-50/30 rounded-2xl border border-green-100 transition-colors"><p className="text-[10px] font-bold text-slate-500 mb-1">To. {feed.target_name || '동료'}</p><p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">{feed.content}</p>{isToday(feed.created_at) && <span className="inline-block ml-1">🆕</span>}</div>)) : <p className="text-xs text-slate-400 py-2">아직 게시글이 없습니다.</p>}</div>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-purple-100 cursor-pointer hover:border-purple-300 transition-colors" onClick={() => onWriteClickWithCategory('dept_news')}>
           <h3 className="text-sm font-bold text-purple-600 mb-3 flex items-center gap-1.5 pointer-events-none"><Building2 className="w-4 h-4 text-purple-500"/> 우리들 소식 (보상부)</h3>
           <div className="space-y-2 pointer-events-none">
                {deptFeeds.length > 0 ? deptFeeds.map(feed => (
                    <div key={feed.id} className="p-3 bg-purple-50/30 rounded-2xl border border-purple-100 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                             <span className="text-[9px] text-purple-700 font-bold bg-white px-1.5 rounded border border-purple-200">{feed.region_main}</span>
                             {isToday(feed.created_at) && <span className="text-[9px]">🆕</span>}
                        </div>
                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed inline">{feed.title || feed.content}</p>
                    </div>
                )) : <p className="text-xs text-slate-400 py-2">등록된 소식이 없습니다.</p>}
           </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-blue-100 cursor-pointer hover:border-blue-300 transition-colors" onClick={() => onWriteClickWithCategory('knowhow')}>
               <h3 className="text-sm font-bold text-blue-600 mb-3 flex items-center gap-1.5 pointer-events-none"><Sparkles className="w-4 h-4 fill-blue-500 text-blue-500"/> 꿀팁</h3>
               <div className="space-y-2 pointer-events-none">{knowhowFeeds.length > 0 ? knowhowFeeds.map(feed => (<div key={feed.id} className="p-3 bg-blue-50/30 rounded-2xl border border-blue-100 transition-colors"><p className="text-xs text-slate-700 line-clamp-2 leading-relaxed inline">{feed.title || feed.content}</p>{isToday(feed.created_at) && <span className="inline-block ml-1">🆕</span>}</div>)) : <p className="text-xs text-slate-400 py-2">등록된 글이 없습니다.</p>}</div>
            </div>
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-blue-100 cursor-pointer hover:border-orange-300 transition-colors" onClick={() => onWriteClickWithCategory('matjib')}>
               <h3 className="text-sm font-bold text-orange-600 mb-3 flex items-center gap-1.5 pointer-events-none"><Utensils className="w-4 h-4 fill-orange-500 text-orange-500"/> 맛집 소개</h3>
               <div className="space-y-2 pointer-events-none">{matjibFeeds.length > 0 ? matjibFeeds.map(feed => (<div key={feed.id} className="p-3 bg-orange-50/30 rounded-2xl border border-orange-100 transition-colors"><p className="text-xs text-slate-700 line-clamp-2 leading-relaxed inline">{feed.title || feed.content}</p>{isToday(feed.created_at) && <span className="inline-block ml-1">🆕</span>}</div>)) : <p className="text-xs text-slate-400 py-2">등록된 글이 없습니다.</p>}</div>
            </div>
        </div>
      </div>
    );
};

const FeedTab = ({ feeds, activeFeedFilter, setActiveFeedFilter, onWriteClickWithCategory, currentUser, handleDeletePost, handleLikePost, handleAddComment, handleDeleteComment, boosterActive }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');

  useEffect(() => {
      setSelectedDeptFilter('all');
  }, [activeFeedFilter]);
  
  const averageLikes = useMemo(() => {
      if (feeds.length === 0) return 0;
      const totalLikes = feeds.reduce((acc, curr) => acc + (curr.likes?.length || 0), 0);
      return totalLikes / feeds.length;
  }, [feeds]);

  const filteredFeeds = feeds.filter(f => {
      const matchesFilter = activeFeedFilter === 'all' || f.type === activeFeedFilter || (activeFeedFilter === 'dept_news' && f.type === 'dept_news');
      const matchesSearch = searchTerm === "" || 
          (f.title && f.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
          (f.content && f.content.toLowerCase().includes(searchTerm.toLowerCase())) || 
          (f.author && f.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (f.region_main && f.region_main.includes(searchTerm)) ||
          (f.region_sub && f.region_sub.includes(searchTerm));
      
      const matchesDept = activeFeedFilter !== 'dept_news' || selectedDeptFilter === 'all' || (f.profiles && f.profiles.dept === selectedDeptFilter);

      return matchesFilter && matchesSearch && matchesDept;
  }).slice(0, 5);

  return (
    <div className="p-5 space-y-5 pb-28 animate-fade-in bg-blue-50">
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-blue-100 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input type="text" placeholder="검색 (제목, 내용, 작성자, 지역명)" className="flex-1 bg-transparent text-xs p-2 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
            { id: 'all', label: '전체' }, 
            { id: 'praise', label: '칭찬해요' }, 
            { id: 'dept_news', label: '우리들 소식' },
            { id: 'knowhow', label: '꿀팁' },
            { id: 'matjib', label: '맛집 소개' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveFeedFilter(tab.id)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeFeedFilter === tab.id ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200'}`}>{tab.label}</button>
        ))}
      </div>

      {activeFeedFilter === 'dept_news' && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide animate-fade-in">
              <button onClick={() => setSelectedDeptFilter('all')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border ${selectedDeptFilter === 'all' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-white text-slate-400 border-slate-100'}`}>전체</button>
              {Object.keys(ORGANIZATION).map(dept => (
                  <button key={dept} onClick={() => setSelectedDeptFilter(dept)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border ${selectedDeptFilter === dept ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-white text-slate-400 border-slate-100'}`}>{dept}</button>
              ))}
          </div>
      )}

      <div className="flex flex-col items-end gap-1 mb-1">
          {/* 하단 탭의 글쓰기 버튼도 홈 화면과 동일하게 모든 카테고리 선택 가능하도록 수정 */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onWriteClickWithCategory(null)}>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95 border border-blue-400">
                <Pencil className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">게시글 작성</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-full shadow-sm border border-slate-100">
                <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner"><Coins className="w-2.5 h-2.5 text-white fill-white"/></div>
                게시글 1개당 +50P (일 최대 +100P 가능)
          </div>
      </div>
      
      {filteredFeeds.map(feed => {
        const comments = feed.comments || [];
        const isHot = feed.likes.length > 0 && feed.likes.length >= averageLikes;
        const isNew = isToday(feed.created_at);

        return (
          <div key={feed.id} className="bg-white rounded-3xl p-5 shadow-sm border border-blue-100 relative group transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm bg-gradient-to-br from-blue-500 to-blue-400 shadow-sm`}>{formatInitial(feed.author)}</div>
              <div>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1">
                      {feed.author} 
                      {feed.profiles?.role === 'admin' && <span className="bg-red-50 text-red-500 text-[9px] px-1.5 py-0.5 rounded-md border border-red-100">관리자</span>}
                      {feed.profiles?.is_reporter && <span className="bg-yellow-100 text-yellow-700 text-[9px] px-1.5 py-0.5 rounded-md border border-yellow-200">리포터</span>}
                      {feed.profiles?.is_ambassador && <span className="bg-purple-100 text-purple-700 text-[9px] px-1.5 py-0.5 rounded-md border border-purple-200">앰버서더</span>}
                  </p>
                  <p className="text-[10px] text-slate-400">{feed.formattedTime} • {feed.team}</p>
              </div>
            </div>
            
            <div className="mb-4">
                <div className="flex flex-wrap gap-1 mb-2">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        feed.type === 'praise' ? 'bg-green-50 text-green-600 border-green-100' : 
                        feed.type === 'news' ? 'bg-red-50 text-red-600 border-red-100' : 
                        feed.type === 'dept_news' ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                        feed.type === 'matjib' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                        {feed.type === 'praise' ? '칭찬해요' : feed.type === 'news' ? '📢 공지사항' : feed.type === 'dept_news' ? '🏢 우리들 소식' : feed.type === 'matjib' ? '맛집 소개' : '꿀팁'}
                    </span>
                    {feed.type === 'dept_news' && feed.region_main && <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200">{feed.region_main}</span>}
                    {feed.type === 'matjib' && feed.region_main && <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200"><MapPin className="w-2.5 h-2.5 inline mr-0.5"/>{feed.region_main} {feed.region_sub}</span>}
                </div>
                
                {feed.type === 'praise' && feed.target_name && <p className="text-xs font-bold text-green-600 mb-1">To. {feed.target_name}</p>}
                
                {feed.type !== 'praise' && feed.title && (
                    <h3 className="text-base font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                        {feed.title}
                        {isNew && <span className="text-xs">🆕</span>}
                        {isHot && <span className="text-xs bg-red-100 text-red-600 px-1 rounded font-bold">🔥 HOT</span>}
                    </h3>
                )}

                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{feed.content}</p>
            </div>
            
            {feed.image_url && (
                <div className="mb-4 rounded-2xl overflow-hidden border border-slate-100 shadow-sm"><img src={feed.image_url} alt="Content" className="w-full h-auto object-cover" /></div>
            )}
            
            <div className="flex items-center gap-4 border-t border-slate-50 pt-3">
              <button onClick={() => handleLikePost(feed.id, feed.likes, feed.isLiked)} className={`flex items-center gap-1 text-xs font-bold transition-colors ${feed.isLiked ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}>
                  <Heart className={`w-4 h-4 ${feed.isLiked ? 'fill-red-500' : ''}`} /> {feed.likes?.length || 0}
              </button>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-400"><MessageCircle className="w-4 h-4" /> {comments.length}</div>
              <div className="ml-auto text-[10px] text-slate-300">{feed.formattedTime}</div>
              {(currentUser?.id === feed.author_id || currentUser?.role === 'admin') && (
                  <button onClick={() => handleDeletePost(feed.id)} className="text-[10px] text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 px-2 py-1">삭제</button>
              )}
            </div>
            
            {comments.length > 0 && (<div className="mt-3 pt-3 border-t border-slate-50 space-y-2">{comments.map(comment => (<Comment key={comment.id} comment={comment} currentUser={currentUser} handleDeleteComment={handleDeleteComment} />))}</div>)}
            <form onSubmit={(e) => handleAddComment(e, feed.id, null)} className="flex gap-2 mt-3">
                <input name="commentContent" type="text" placeholder="댓글을 남겨주세요..." className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:border-blue-400 focus:bg-white transition-colors" required />
                <button type="submit" className="bg-white border border-slate-200 text-slate-500 p-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"><Send className="w-3.5 h-3.5"/></button>
            </form>
          </div>
        );
      })}
    </div>
  );
};

const WriteModal = ({ setShowWriteModal, handlePostSubmit, currentUser, activeTab, boosterActive, initialCategory }) => {
  const [writeCategory, setWriteCategory] = useState(initialCategory || 'praise');
  const [imagePreview, setImagePreview] = useState(null);
  const [regionMain, setRegionMain] = useState('');
  const [regionSub, setRegionSub] = useState('');
  const [deptNewsOrg, setDeptNewsOrg] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };
  
  const categories = useMemo(() => {
    const baseCategories = [
        {id: 'praise', label: '칭찬하기'},
        {id: 'matjib', label: '맛집소개'},
        {id: 'knowhow', label: '꿀팁'}
    ];
    if (currentUser?.dept?.includes('보상') || currentUser?.is_reporter || currentUser?.role === 'admin') {
        baseCategories.unshift({id: 'dept_news', label: '우리들 소식'});
    }
    if (activeTab === 'news' && currentUser?.role === 'admin') {
        baseCategories.push({id: 'news', label: '공지사항'});
    }
    return baseCategories;
  }, [activeTab, currentUser]);

  useEffect(() => {
      // 카테고리가 없는 경우 기본값 설정 (초기 카테고리 널일때 첫번째)
      if (!initialCategory && categories.length > 0) {
          setWriteCategory(categories[0].id);
      } else if (initialCategory && categories.some(c => c.id === initialCategory)) {
          setWriteCategory(initialCategory);
      } else if (categories.length > 0) {
          setWriteCategory(categories[0].id);
      }
      
      if (currentUser?.dept && Object.keys(ORGANIZATION).includes(currentUser.dept)) {
          setDeptNewsOrg(currentUser.dept);
      }
  }, [categories, initialCategory, currentUser]);

  const showPointReward = ['praise', 'knowhow', 'matjib', 'dept_news'].includes(writeCategory);
  const rewardAmount = boosterActive ? 100 : 50;
  const pointRewardText = showPointReward ? ` (+${rewardAmount}P)` : '';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-0 shadow-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="bg-slate-800 p-6 rounded-t-[2.5rem] flex justify-between items-center sticky top-0 z-10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Pencil className="w-5 h-5"/> 글쓰기</h3>
            <button onClick={() => setShowWriteModal(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
            <form onSubmit={handlePostSubmit}>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                    <label key={cat.id} className="flex-shrink-0 cursor-pointer">
                        <input 
                            type="radio" 
                            name="category" 
                            value={cat.id} 
                            className="peer hidden" 
                            checked={writeCategory === cat.id} 
                            onChange={() => setWriteCategory(cat.id)} 
                        />
                        <span className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center ${writeCategory === cat.id ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                            {cat.label}
                        </span>
                    </label>
                ))}
            </div>
            
            <div className="space-y-4 mb-8">
                {writeCategory === 'praise' && (
                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100 animate-fade-in">
                        <label className="text-xs font-bold text-green-700 block mb-2 ml-1">누구를 칭찬하나요?</label>
                        <input name="targetName" type="text" placeholder="이름을 입력하세요 (예: 김철수)" className="w-full bg-white p-3 rounded-xl border border-green-200 text-sm outline-none focus:border-green-500" required />
                    </div>
                )}
                
                {writeCategory === 'dept_news' && (
                     <div className="bg-red-50 p-4 rounded-2xl border border-red-100 animate-fade-in">
                         <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-md">작성 권한</span>
                            <p className="text-[10px] text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded">해당 조직의 소속 직원만 작성 가능합니다.</p>
                         </div>
                         <p className="text-xs text-red-800 font-bold mb-2">📢 우리 조직의 즐거운 소식을 전해주세요!</p>
                         
                         <select name="regionMain" className="w-full p-3 bg-white border border-red-200 rounded-xl text-xs outline-none mb-2 text-red-900 font-bold" value={deptNewsOrg} onChange={(e) => setDeptNewsOrg(e.target.value)} required>
                             <option value="">소식 구분 (조직 선택)</option>
                             {Object.keys(ORGANIZATION).map(org => <option key={org} value={org}>{org}</option>)}
                         </select>

                         <input name="title" type="text" placeholder="제목을 입력하세요 (예: 00팀 회식~!)" className="w-full p-3 bg-white border border-red-200 rounded-xl text-sm outline-none focus:border-red-500 font-bold mb-3" required />
                     </div>
                )}

                {writeCategory === 'matjib' && (
                    <div className="space-y-3 animate-fade-in">
                        <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 text-xs text-orange-800 leading-relaxed mb-1">💡 <strong>작성 가이드</strong><br/>(예시) 주 메뉴, 특징, 가격대, 바로가기 링크 등 주요 내용을 입력해주세요.</div>
                        <input name="title" type="text" placeholder="맛집 이름 (제목)" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold" required />
                        <div className="grid grid-cols-2 gap-2">
                             <select name="regionMain" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" onChange={(e) => setRegionMain(e.target.value)} required><option value="">시/도 선택</option>{Object.keys(REGIONS).map(r => <option key={r} value={r}>{r}</option>)}</select>
                             <select name="regionSub" value={regionSub} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" disabled={!regionMain} onChange={(e) => setRegionSub(e.target.value)} required><option value="">시/군/구 선택</option>{regionMain && REGIONS[regionMain].map(r => <option key={r} value={r}>{r}</option>)}</select>
                        </div>
                    </div>
                )}

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <textarea name="content" className="w-full h-32 bg-transparent text-sm outline-none resize-none placeholder-slate-400" placeholder="내용을 자세히 작성해주세요..." required></textarea>
                </div>

                <div className="flex items-center gap-3">
                    <label className="cursor-pointer flex items-center justify-center w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all">
                        <div className="text-center"><ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-1" /><span className="text-[10px] text-slate-400">사진</span></div>
                        <input type="file" name="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    {imagePreview && (
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setImagePreview(null)} className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"><X className="w-5 h-5"/></button>
                        </div>
                    )}
                </div>
            </div>
            
            <button type="submit" className="w-full bg-slate-800 text-white p-4 rounded-2xl text-sm font-bold hover:bg-slate-900 shadow-lg transition-all flex items-center justify-center gap-2">
                등록하기 <span className="text-yellow-400 bg-white/10 px-1.5 py-0.5 rounded text-xs">{pointRewardText}</span>
            </button>
            </form>
        </div>
      </div>
    </div>
  );
};

// ... (RankingTab, BottomNav - 기존 유지)
const RankingTab = ({ feeds, profiles, allPointHistory }) => { const [selectedDate, setSelectedDate] = useState(new Date()); const isSelectedMonth = (dateString) => { if(!dateString) return false; const d = new Date(dateString); return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear(); }; const handlePrevMonth = () => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1))); const handleNextMonth = () => { const nextMonth = new Date(selectedDate); nextMonth.setMonth(selectedDate.getMonth() + 1); if (nextMonth <= new Date()) setSelectedDate(nextMonth); }; const pointRanking = useMemo(() => { const monthlyPoints = {}; allPointHistory.forEach(record => { if (isSelectedMonth(record.created_at) && record.type === 'earn') monthlyPoints[record.user_id] = (monthlyPoints[record.user_id] || 0) + record.amount; }); return Object.entries(monthlyPoints).map(([id, points]) => { const p = profiles.find(profile => profile.id === id) || { name: '알수없음', team: '소속미정' }; return { name: p.name, value: points, unit: 'P', team: p.team }; }).sort((a, b) => b.value - a.value).slice(0, 3); }, [allPointHistory, profiles, selectedDate]); const postCounts = {}; feeds.filter(f => isSelectedMonth(f.created_at)).forEach(f => { postCounts[f.author_id] = (postCounts[f.author_id] || 0) + 1; }); const postRanking = Object.entries(postCounts).map(([id, count]) => { const p = profiles.find(profile => profile.id === id) || { name: '알수없음', team: '소속미정' }; return { name: p.name, value: count, unit: '건', team: p.team }; }).sort((a, b) => b.value - a.value).slice(0, 3); const likeCounts = {}; feeds.filter(f => isSelectedMonth(f.created_at)).forEach(f => { const likes = f.likes ? (Array.isArray(f.likes) ? f.likes.length : 0) : 0; if(likes > 0) likeCounts[f.author_id] = (likeCounts[f.author_id] || 0) + likes; }); const likeRanking = Object.entries(likeCounts).map(([id, count]) => { const p = profiles.find(profile => profile.id === id) || { name: '알수없음', team: '소속미정' }; return { name: p.name, value: count, unit: '개', team: p.team }; }).sort((a, b) => b.value - a.value).slice(0, 3); const RankItem = ({ rank, name, value, unit, team, color }) => (<div className="flex items-center p-3 bg-white border border-slate-100 rounded-2xl shadow-sm relative overflow-hidden">{rank <= 3 && <div className="absolute right-0 top-0 bg-yellow-100 text-yellow-600 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">🎁 1,000P</div>}<div className={`text-xl font-black mr-4 w-8 text-center ${color}`}>{rank}</div><div className="flex-1"><p className="text-sm font-bold text-slate-800">{name || 'Unknown'}</p><p className="text-[10px] text-slate-400">{team}</p></div><div className="text-base font-black text-slate-700 ml-4">{value}<span className="text-[10px] text-slate-400 ml-0.5 font-normal">{unit}</span></div></div>); return (<div className="p-5 space-y-8 pb-28 animate-fade-in bg-blue-50"><div className="bg-white p-5 rounded-[2rem] shadow-sm border border-blue-100 text-center relative"><div className="flex justify-between items-center mb-4 px-2"><button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5 text-slate-400" /></button><h2 className="text-lg font-black text-slate-800">{selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 랭킹</h2><button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-full disabled:opacity-30" disabled={selectedDate >= new Date(new Date().setDate(1))}><ChevronRight className="w-5 h-5 text-slate-400" /></button></div><div className="flex justify-center gap-2 mt-2"><span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded">🏆 소통상/좋아요상: 1~3등 1,000P</span></div></div><div className="space-y-3"><h3 className="text-sm font-bold text-slate-600 flex items-center gap-2 mb-2 ml-1"><Coins className="w-4 h-4 text-yellow-500"/> 월간 획득 포인트 랭킹</h3><div className="space-y-2">{pointRanking.length > 0 ? pointRanking.map((p, i) => <RankItem key={i} rank={i+1} name={p.name} team={p.team} value={p.value.toLocaleString()} unit="P" color="text-yellow-500"/>) : <div className="text-center text-xs text-slate-400 py-4">데이터가 없습니다.</div>}</div></div><div className="space-y-3"><h3 className="text-sm font-bold text-slate-600 flex items-center gap-2 mb-2 ml-1"><Pencil className="w-4 h-4 text-green-500"/> 소통왕 (게시글)</h3><div className="space-y-2">{postRanking.length > 0 ? postRanking.map((p, i) => <RankItem key={i} rank={i+1} {...p} color="text-green-500"/>) : <div className="text-center text-xs text-slate-400 py-4">데이터가 없습니다.</div>}</div></div><div className="space-y-3"><h3 className="text-sm font-bold text-slate-600 flex items-center gap-2 mb-2 ml-1"><Heart className="w-4 h-4 text-red-500"/> 인기왕 (좋아요)</h3><div className="space-y-2">{likeRanking.length > 0 ? likeRanking.map((p, i) => <RankItem key={i} rank={i+1} {...p} color="text-red-500"/>) : <div className="text-center text-xs text-slate-400 py-4">데이터가 없습니다.</div>}</div></div></div>); };

// BottomNav - 높이 축소 및 아이콘/텍스트 가로 배치 (수정됨)
const BottomNav = ({ activeTab, setActiveTab }) => (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[360px] bg-[#00008F] backdrop-blur-md border border-blue-900 shadow-[0_8px_30px_rgb(0,0,0,0.3)] p-1.5 z-30 flex justify-between items-center rounded-full">
        {[{ id: 'home', icon: User, label: '홈' }, { id: 'feed', icon: MessageCircle, label: '소통' }, { id: 'news', icon: Bell, label: '소식' }, { id: 'ranking', icon: Award, label: '랭킹' }].map(item => (
            <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)} 
                className={`flex-1 flex flex-row items-center justify-center gap-1.5 py-2.5 rounded-full transition-all duration-300 ${activeTab === item.id ? 'bg-white/20 text-white shadow-md' : 'text-blue-300 hover:text-white'}`}
            >
                <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'stroke-[2.5px]' : ''}`} />
                <span className="text-[10px] font-bold">{item.label}</span>
            </button>
        ))}
    </div>
);

const Comment = ({ comment, currentUser, handleDeleteComment }) => (<div className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">{comment.parent_id && <CornerDownRight className="w-4 h-4 text-slate-300 mt-1 flex-shrink-0" />}<div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold shadow-sm ${comment.profiles?.role === 'admin' ? 'bg-red-400' : 'bg-blue-400'}`}>{formatInitial(comment.profiles?.name || 'Unknown')}</div><div className="flex-1 min-w-0"><div className="flex justify-between items-start"><p className="text-xs font-bold text-slate-700 flex items-center gap-1">{comment.profiles?.name || '알 수 없음'}{comment.profiles?.role === 'admin' && <span className="px-1 py-0.5 bg-red-50 text-red-500 text-[9px] rounded-md">관리자</span>}</p><span className="text-[9px] text-slate-400">{new Date(comment.created_at).toLocaleDateString()}</span></div><p className="text-xs text-slate-600 leading-relaxed mt-0.5 break-words">{comment.content}</p><div className="flex gap-2 mt-1 justify-end">{(currentUser?.id === comment.author_id || currentUser?.role === 'admin') && (<button onClick={() => handleDeleteComment(comment.id)} className="text-[10px] text-slate-400 hover:text-red-500 transition-colors flex items-center gap-0.5"><Trash2 className="w-3 h-3"/> 삭제</button>)}</div></div></div>);

export default function App() {
  const [supabase, setSupabase] = useState(supabaseClient); // 전역 초기화된 클라이언트 사용
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [pointHistory, setPointHistory] = useState([]);
  const [allPointHistory, setAllPointHistory] = useState([]);
  const [redemptionList, setRedemptionList] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showBirthdayPopup, setShowBirthdayPopup] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showAdminManageModal, setShowAdminManageModal] = useState(false);
  const [writeCategory, setWriteCategory] = useState(null); 
  const [showGiftNotificationModal, setShowGiftNotificationModal] = useState(false);
  const [newGifts, setNewGifts] = useState([]);
  
  const [showChangeDeptModal, setShowChangeDeptModal] = useState(false);
  const [showChangePwdModal, setShowChangePwdModal] = useState(false);
  const [showAdminGrantModal, setShowAdminGrantModal] = useState(false);
  const [showRedemptionListModal, setShowRedemptionListModal] = useState(false); 
  const [showAdminAlertModal, setShowAdminAlertModal] = useState(false); 
  const [toast, setToast] = useState({ visible: false, message: '', emoji: '' });

  const [activeTab, setActiveTab] = useState('home');
  const [activeFeedFilter, setActiveFeedFilter] = useState('all');
  const [mood, setMood] = useState(null);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [boosterActive, setBoosterActive] = useState(false);
  
  // const [isSupabaseReady, setIsSupabaseReady] = useState(false); // Static import로 인해 불필요해짐

  const weeklyBirthdays = React.useMemo(() => getWeeklyBirthdays(profiles), [profiles]);

  // Supabase 초기화 (이미 상단에서 완료됨) & 부스터 상태 로드
  useEffect(() => {
    const savedBooster = localStorage.getItem('axa_booster_active') === 'true';
    setBoosterActive(savedBooster);
  }, []);
  
  useEffect(() => {
      localStorage.setItem('axa_booster_active', boosterActive);
  }, [boosterActive]);

  const checkBirthday = useCallback((user) => {
    if (!user.birthdate || user.birthday_granted) return; 
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const [_, m, d] = user.birthdate.split('-').map(Number);
    if (currentMonth === m) {
        setShowBirthdayPopup(true);
    }
  }, []);
  
  // 포인트 선물 알림 확인
  const checkGiftNotifications = useCallback(async (userId) => {
      if (!supabase) return;
      try {
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          
          const { data } = await supabase.from('point_history')
              .select('*')
              .eq('user_id', userId)
              .eq('type', 'earn')
              .ilike('reason', '%선물 받음%')
              .gte('created_at', threeDaysAgo.toISOString())
              .order('created_at', { ascending: false });

          if (data && data.length > 0) {
              const lastChecked = localStorage.getItem(`last_gift_check_${userId}`);
              const newGiftsList = data.filter(gift => !lastChecked || new Date(gift.created_at) > new Date(lastChecked));
              
              if (newGiftsList.length > 0) {
                  setNewGifts(newGiftsList);
                  setShowGiftNotificationModal(true);
                  localStorage.setItem(`last_gift_check_${userId}`, new Date().toISOString());
              }
          }
      } catch (err) { console.error(err); }
  }, [supabase]);

  const checkAdminNotifications = async (user) => {
      if (user.role !== 'admin' || !supabase) return;
      const todayStr = new Date().toISOString().split('T')[0];
      const hideDate = localStorage.getItem('hide_admin_alert');
      if (hideDate === todayStr) return;
      try {
          const { count, error } = await supabase.from('redemption_requests').select('*', { count: 'exact', head: true }).neq('status', 'completed'); 
          if (!error && count > 0) setShowAdminAlertModal(true); 
      } catch (err) { console.error(err); }
  };
  const handleCloseAdminAlert = (doNotShowToday) => {
      if (doNotShowToday) { const todayStr = new Date().toISOString().split('T')[0]; localStorage.setItem('hide_admin_alert', todayStr); }
      setShowAdminAlertModal(false);
  };

  const fetchUserData = useCallback(async (userId) => {
    if (!supabase) return; 
    try {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (data) {
            setCurrentUser(data);
            const todayStr = new Date().toISOString().split('T')[0];
            if (data.last_attendance === todayStr) setMood('checked');
            
            const lastCheckout = localStorage.getItem(`checkout_${userId}_${todayStr}`);
            if (lastCheckout) setHasCheckedOut(true);
            else setHasCheckedOut(false);
            
            checkBirthday(data);
            checkAdminNotifications(data); 
            checkGiftNotifications(userId);
        }
    } catch (err) { console.error(err); }
  }, [supabase, checkBirthday, checkGiftNotifications]);

  // 개인용 포인트 히스토리
  const fetchPointHistory = useCallback(async (userId) => {
    if (!supabase) return; 
    try {
        const { data } = await supabase.from('point_history').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (data) setPointHistory(data);
    } catch (err) { console.error(err); }
  }, [supabase]);

  // 전체 포인트 히스토리 가져오기 (랭킹용)
  const fetchAllPointHistory = useCallback(async () => {
      if (!supabase) return;
      try {
          const { data } = await supabase.from('point_history').select('user_id, amount, type, created_at');
          if (data) setAllPointHistory(data);
      } catch(err) { console.error(err); }
  }, [supabase]);

  const fetchFeeds = useCallback(async () => {
    if (!supabase) return; 
    try {
        const { data: posts } = await supabase.from('posts').select(`*, profiles:author_id (name, dept, team, role, is_reporter, is_ambassador), comments (*, profiles:author_id (name, role))`).order('created_at', { ascending: false });
        if (posts) {
            const formatted = posts.map(post => {
                const sortedComments = post.comments ? post.comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) : [];
                return { ...post, author: post.profiles?.name || '알 수 없음', team: post.profiles?.team, formattedTime: new Date(post.created_at).toLocaleDateString(), likes: post.likes ? (typeof post.likes === 'string' ? JSON.parse(post.likes) : post.likes) : [], isLiked: false, comments: sortedComments, totalComments: sortedComments.length, profiles: post.profiles };
            });
            if (currentUser) formatted.forEach(p => { p.isLiked = p.likes.includes(currentUser.id); });
            setFeeds(formatted);
        }
    } catch (err) { console.error(err); }
  }, [supabase, currentUser]);

  const fetchProfiles = useCallback(async () => {
    if (!supabase) return; 
    try {
        const { data } = await supabase.from('profiles').select('*');
        if (data) setProfiles(data);
    } catch (err) { console.error(err); }
  }, [supabase]);

  const fetchRedemptionList = useCallback(async () => {
      if (!supabase) return;
      try {
          const { data } = await supabase.from('redemption_requests').select('*').order('created_at', { ascending: false });
          if(data) setRedemptionList(data);
      } catch (err) { console.error(err); }
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return; 
    
    // Realtime 구독 설정
    const channel = supabase.channel('public:comments_posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => { fetchFeeds(); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => { fetchFeeds(); })
        .subscribe();

    try {
        supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session) { fetchUserData(session.user.id); fetchPointHistory(session.user.id); }
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) { fetchUserData(session.user.id); fetchPointHistory(session.user.id); } else setCurrentUser(null);
        });
        
        // 초기 데이터 로딩
        fetchFeeds(); 
        fetchProfiles(); 
        fetchAllPointHistory();

        return () => { subscription.unsubscribe(); supabase.removeChannel(channel); };
    } catch(err) { console.error("Supabase init error:", err); }
  }, [supabase, fetchFeeds, fetchPointHistory, fetchProfiles, fetchUserData, fetchAllPointHistory]);

  const checkSupabaseConfig = () => { if (!supabase) return false; if (SUPABASE_URL.includes('your-project-url')) return false; return true; };
  
  const handleBirthdayGrant = async () => {
    if (!currentUser || !checkSupabaseConfig()) return;
    try {
        const newPoints = (currentUser.points || 0) + 1000;
        await supabase.from('profiles').update({ points: newPoints, birthday_granted: true }).eq('id', currentUser.id);
        await supabase.from('point_history').insert({ user_id: currentUser.id, reason: '생일 축하 포인트', amount: 1000, type: 'earn' });
        setShowBirthdayPopup(false);
        fetchUserData(currentUser.id); fetchPointHistory(currentUser.id); fetchAllPointHistory(); 
    } catch (err) { console.error('오류 발생: ', err.message); }
  };

  const handleLikePost = async (postId, currentLikes, isLiked) => {
      if (!currentUser || !checkSupabaseConfig()) return;
      const userId = currentUser.id;
      let newLikes = [...currentLikes];
      if (isLiked) { newLikes = newLikes.filter(id => id !== userId); } else { newLikes.push(userId); }
      setFeeds(feeds.map(f => f.id === postId ? { ...f, likes: newLikes, isLiked: !isLiked } : f));
      try { await supabase.from('posts').update({ likes: newLikes }).eq('id', postId); } catch (err) { console.error(err); fetchFeeds(); }
  };

  const handleAddComment = async (e, postId, parentId = null) => {
      e.preventDefault(); const content = e.target.commentContent.value; if (!content || !currentUser) return;
      const tempComment = { id: `temp-${Date.now()}`, post_id: postId, author_id: currentUser.id, content: content, parent_id: parentId, created_at: new Date().toISOString(), profiles: { name: currentUser.name, role: currentUser.role } };
      setFeeds(prevFeeds => prevFeeds.map(feed => { if (feed.id === postId) { return { ...feed, comments: [...feed.comments, tempComment], totalComments: feed.totalComments + 1 }; } return feed; }));
      e.target.reset(); 
      try { await supabase.from('comments').insert({ post_id: postId, author_id: currentUser.id, content: content, parent_id: parentId }); } catch (err) { console.error('Comment failed:', err); fetchFeeds(); }
  };
  
  const handleDeleteComment = async (commentId) => {
      if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
      setFeeds(prevFeeds => prevFeeds.map(feed => { const updatedComments = feed.comments.filter(c => c.id !== commentId); if (updatedComments.length !== feed.comments.length) { return { ...feed, comments: updatedComments, totalComments: updatedComments.length }; } return feed; }));
      try { await supabase.from('comments').delete().eq('id', commentId); } catch (err) { console.error('Delete failed:', err); fetchFeeds(); }
  };

  const handleDeletePost = async (postId) => {
    if (!currentUser) return;
    const postToDelete = feeds.find(f => f.id === postId); if (!postToDelete) return;
    if (currentUser.id !== postToDelete.author_id && currentUser.role !== 'admin') { alert('삭제 권한이 없습니다.'); return; }
    if (!window.confirm('게시글을 삭제하시겠습니까? 삭제 시 지급된 포인트가 회수됩니다.')) return;
    try {
        const { error } = await supabase.from('posts').delete().eq('id', postId); if (error) throw error;
        if (['praise', 'knowhow', 'matjib', 'dept_news'].includes(postToDelete.type)) {
            const deductAmount = 50; 
            const newPoints = Math.max(0, currentUser.points - deductAmount); 
            await supabase.from('profiles').update({ points: newPoints }).eq('id', currentUser.id);
            await supabase.from('point_history').insert({ user_id: currentUser.id, reason: '게시글 삭제 (회수)', amount: deductAmount, type: 'use' });
            fetchUserData(currentUser.id); fetchAllPointHistory(); 
        }
    } catch (err) { console.error('삭제 실패: ', err.message); }
  };

  const handleRedeemPoints = async () => {
    if (!currentUser || currentUser.points < 10000) return; if (!window.confirm('10,000P를 사용하여 포인트 차감 신청을 하시겠습니까?')) return;
    try {
        await supabase.from('redemption_requests').insert({ user_id: currentUser.id, user_name: currentUser.name, amount: 10000, status: 'pending' });
        const newPoints = currentUser.points - 10000;
        await supabase.from('profiles').update({ points: newPoints }).eq('id', currentUser.id);
        await supabase.from('point_history').insert({ user_id: currentUser.id, reason: '포인트 차감 신청', amount: 10000, type: 'use' });
        fetchUserData(currentUser.id); fetchPointHistory(currentUser.id); setShowUserInfoModal(false);
    } catch (err) { console.error('신청 실패: ', err.message); }
  };
  
  const handleCompleteRedemption = async (requestId) => {
      if (!supabase) return;
      try {
          await supabase.from('redemption_requests').update({ status: 'completed' }).eq('id', requestId);
          fetchRedemptionList(); // 목록 갱신
      } catch (err) { console.error(err); }
  };

  const handleGiftPoints = async (targetUserId, amount) => {
    if (!currentUser || !supabase) return;
    const giftAmount = parseInt(amount);
    if (isNaN(giftAmount) || giftAmount <= 0) return;

    try {
        const myNewPoints = currentUser.points - giftAmount;
        await supabase.from('profiles').update({ points: myNewPoints }).eq('id', currentUser.id);
        await supabase.from('point_history').insert({ user_id: currentUser.id, reason: '포인트 선물 (보냄)', amount: giftAmount, type: 'gift_sent' });

        const { data: targetUser } = await supabase.from('profiles').select('points, name').eq('id', targetUserId).single();
        const targetNewPoints = (targetUser.points || 0) + giftAmount;
        await supabase.from('profiles').update({ points: targetNewPoints }).eq('id', targetUserId);
        await supabase.from('point_history').insert({ user_id: targetUserId, reason: `선물 받음 (${currentUser.name})`, amount: giftAmount, type: 'earn' });

        setShowGiftModal(false);
        alert(`${targetUser.name}님에게 선물이 완료되었습니다! 🎁`);
        fetchUserData(currentUser.id);
        fetchPointHistory(currentUser.id);
        fetchAllPointHistory();
    } catch (err) { console.error(err); alert('선물하기 중 오류가 발생했습니다.'); }
  };

  const handleAdminUpdateUser = async (userId, updates) => {
      try {
          await supabase.from('profiles').update(updates).eq('id', userId);
          fetchProfiles();
      } catch (err) { console.error(err); }
  };

  const handleAdminDeleteUser = async (userId) => {
      if(!window.confirm('정말 삭제하시겠습니까?')) return;
      try { await supabase.from('profiles').delete().eq('id', userId); fetchProfiles(); } catch(err) { console.error(err); }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); if (!checkSupabaseConfig()) return; setLoading(true);
    const email = e.target.email.value; const password = e.target.password.value;
    try {
        const { data: userCheck } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { if (userCheck === null) alert('가입되지 않은 이메일 계정입니다.'); else alert('비밀번호가 일치하지 않습니다.'); }
    } catch (err) { console.error('로그인 실패: ', err.message); alert('로그인 중 오류가 발생했습니다.'); } finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault(); if (!checkSupabaseConfig()) return; setLoading(true);
    const { name, email, password, dept, team, birthdate } = e.target;
    try {
        const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
        if (existingUser) {
            alert('이미 가입된 이메일입니다.');
            setLoading(false);
            return;
        }

        const initialData = { name: name.value, dept: dept.value, team: team.value, role: 'member', points: INITIAL_POINTS, birthdate: birthdate.value, email: email.value };
        const { data: signUpResult, error } = await supabase.auth.signUp({ email: email.value, password: password.value, options: { data: initialData } });
        if (error) throw error;
        await supabase.from('point_history').insert({ user_id: signUpResult.user.id, reason: '최초 가입 포인트', amount: INITIAL_POINTS, type: 'earn' });
        alert('가입이 완료되었습니다. 로그인해주세요.');
        setIsSignupMode(false);
    } catch (err) { console.error('가입 실패: ', err.message); alert('가입 실패: ' + err.message); } finally { setLoading(false); }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault(); if (!currentUser || !checkSupabaseConfig()) return;
    const category = e.target.category.value;
    const regionMain = e.target.regionMain ? e.target.regionMain.value : null; // 우리들 소식용, 맛집용
    
    const isRewardCategory = ['praise', 'knowhow', 'matjib', 'dept_news'].includes(category);
    const today = new Date().toISOString().split('T')[0];
    const todayPosts = feeds.filter(f => f.author_id === currentUser.id && f.created_at.startsWith(today)).length;
    
    if (todayPosts >= 2) {
        if(!window.confirm('하루 글쓰기 제한(2회)을 초과했습니다. 포인트 지급 없이 작성하시겠습니까?')) return;
    }

    const rewardAmountBase = 50; 
    const rewardPoints = (isRewardCategory && todayPosts < 2) ? (boosterActive ? rewardAmountBase * 2 : rewardAmountBase) : 0; 
    
    const content = e.target.content.value;
    const title = e.target.title ? e.target.title.value : null;
    const targetName = e.target.targetName ? e.target.targetName.value : null;
    const regionSub = e.target.regionSub ? e.target.regionSub.value : null;
    
    const file = e.target.file?.files[0];
    let publicImageUrl = null;

    try {
        if (file) {
           const fileExt = file.name.split('.').pop(); const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
           const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
           if (!uploadError) { const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName); publicImageUrl = publicUrl; }
        }

        const { error: postError } = await supabase.from('posts').insert({
            content: content, type: category, author_id: currentUser.id, image_url: publicImageUrl, 
            target_name: targetName, title: title, region_main: regionMain, region_sub: regionSub, likes: [] 
        });

        if (postError) throw postError;

        if (rewardPoints > 0) {
            const newPoints = (currentUser.points || 0) + rewardPoints;
            await supabase.from('profiles').update({ points: newPoints }).eq('id', currentUser.id);
            let reasonText = `게시글 작성 (${category})`;
            await supabase.from('point_history').insert({ user_id: currentUser.id, reason: reasonText, amount: rewardPoints, type: 'earn' });
        }
        setShowWriteModal(false);
        fetchUserData(currentUser.id); 
        fetchAllPointHistory(); 
        await fetchFeeds(); 

    } catch (err) { console.error('작성 실패: ', err.message); }
  };

  const handleMoodCheck = async (selectedMood) => {
    if (mood || !checkSupabaseConfig()) return;
    setMood('checked');
    const points = boosterActive ? 40 : 20;
    
    const messages = [
        "오늘 하루도 활기차게! 화이팅! 🚀",
        "당신의 열정을 응원합니다! 🔥",
        "좋은 일만 가득한 하루 되세요! 🍀",
        "힘내세요! 당신은 최고입니다! 👍",
        "오늘도 멋진 성과 기대할게요! 🌟"
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    setToast({ visible: true, message: `${randomMsg}\n(+${points}P)`, emoji: "👋" });
    setTimeout(() => setToast({ visible: false, message: '', emoji: '' }), 3000); 

    try {
        const newPoints = (currentUser.points || 0) + points;
        const todayStr = new Date().toISOString().split('T')[0];
        await supabase.from('profiles').update({ points: newPoints, last_attendance: todayStr }).eq('id', currentUser.id);
        await supabase.from('point_history').insert({ user_id: currentUser.id, reason: '출근체크', amount: points, type: 'earn' });
        fetchUserData(currentUser.id); fetchAllPointHistory();
    } catch (err) { console.error(err); }
  };

  const handleCheckOut = async () => {
      if (!mood || hasCheckedOut || !checkSupabaseConfig()) return;
      setHasCheckedOut(true);
      const points = boosterActive ? 40 : 20;
      
      const messages = [
          "오늘 하루 정말 고생 많으셨어요! 🏠",
          "편안한 저녁 보내세요! 🌙",
          "수고하셨습니다! 내일도 화이팅! 💪",
          "푹 쉬고 재충전하세요! 🔋"
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];

      setToast({ visible: true, message: `${randomMsg}\n(+${points}P)`, emoji: "🏃" });
      setTimeout(() => setToast({ visible: false, message: '', emoji: '' }), 3000);
      
      const todayStr = new Date().toISOString().split('T')[0];
      localStorage.setItem(`checkout_${currentUser.id}_${todayStr}`, 'true');

      try {
          const newPoints = (currentUser.points || 0) + points;
          await supabase.from('profiles').update({ points: newPoints }).eq('id', currentUser.id);
          await supabase.from('point_history').insert({ user_id: currentUser.id, reason: '퇴근체크', amount: points, type: 'earn' });
          fetchUserData(currentUser.id); fetchAllPointHistory();
      } catch (err) { console.error(err); }
  };

  const handleLogout = async () => { if (!supabase) return; try { await supabase.auth.signOut(); setCurrentUser(null); setSession(null); setMood(null); setHasCheckedOut(false); setPointHistory([]); } catch (err) { console.error('로그아웃 실패: ', err.message); } };

  const handleChangeDept = async (newDept, newTeam) => { if (!currentUser || !supabase) return; try { await supabase.from('profiles').update({ dept: newDept, team: newTeam }).eq('id', currentUser.id); fetchUserData(currentUser.id); setShowChangeDeptModal(false); alert('소속이 변경되었습니다.'); } catch(err) { console.error(err); } };
  const handleChangePassword = async (newPassword) => { if (!currentUser || !supabase) return; try { const { error } = await supabase.auth.updateUser({ password: newPassword }); if (error) throw error; setShowChangePwdModal(false); alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.'); handleLogout(); } catch(err) { console.error(err); } };
  const handleAdminGrantPoints = async (targetUserId, amount) => { if (!currentUser || !supabase) return; if (currentUser.role !== 'admin') return; try { const { data: targetUser } = await supabase.from('profiles').select('points').eq('id', targetUserId).single(); if (!targetUser) return; const newPoints = (targetUser.points || 0) + parseInt(amount); await supabase.from('profiles').update({ points: newPoints }).eq('id', targetUserId); await supabase.from('point_history').insert({ user_id: targetUserId, reason: '관리자 특별 지급', amount: parseInt(amount), type: 'earn' }); setShowAdminGrantModal(false); alert('포인트 지급이 완료되었습니다.'); fetchProfiles(); fetchAllPointHistory(); } catch(err) { console.error(err); } };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans">
      <div className="w-full max-w-md h-full min-h-screen shadow-2xl relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="relative z-10 h-full flex flex-col">
          {!session ? (
            <AuthForm isSignupMode={isSignupMode} setIsSignupMode={setIsSignupMode} handleLogin={handleLogin} handleSignup={handleSignup} loading={loading} />
          ) : (
            <>
              <Header 
                currentUser={currentUser} 
                onOpenUserInfo={() => setShowUserInfoModal(true)} 
                handleLogout={handleLogout} 
                onOpenChangeDept={() => setShowChangeDeptModal(true)}
                onOpenChangePwd={() => setShowChangePwdModal(true)}
                onOpenAdminGrant={() => setShowAdminGrantModal(true)}
                onOpenRedemptionList={() => { fetchRedemptionList(); setShowRedemptionListModal(true); }}
                onOpenGift={() => setShowGiftModal(true)}
                onOpenAdminManage={() => setShowAdminManageModal(true)}
                boosterActive={boosterActive}
              />
              <main className="flex-1 overflow-y-auto scrollbar-hide">
                {activeTab === 'home' && <HomeTab 
                  mood={mood} 
                  handleMoodCheck={handleMoodCheck} 
                  handleCheckOut={handleCheckOut}
                  hasCheckedOut={hasCheckedOut}
                  feeds={feeds} 
                  weeklyBirthdays={weeklyBirthdays} 
                  onWriteClickWithCategory={(category) => { setWriteCategory(category); setShowWriteModal(true); }}
                  onNavigateToNews={() => setActiveTab('news')} 
                  onNavigateToFeed={(type) => { setActiveTab('feed'); setActiveFeedFilter(type); }}
                  boosterActive={boosterActive}
                />}
                
                {activeTab === 'feed' && <FeedTab 
                    feeds={feeds} 
                    activeFeedFilter={activeFeedFilter} 
                    setActiveFeedFilter={setActiveFeedFilter} 
                    onWriteClickWithCategory={(category) => { setWriteCategory(category); setShowWriteModal(true); }}
                    currentUser={currentUser} 
                    handleDeletePost={handleDeletePost} 
                    handleLikePost={handleLikePost} 
                    handleAddComment={handleAddComment} 
                    handleDeleteComment={handleDeleteComment} 
                    boosterActive={boosterActive}
                />}
                {activeTab === 'ranking' && <RankingTab feeds={feeds} profiles={profiles} allPointHistory={allPointHistory} />}
              </main>
              <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
              
              {/* Modals */}
              {showWriteModal && <WriteModal setShowWriteModal={setShowWriteModal} handlePostSubmit={handlePostSubmit} currentUser={currentUser} activeTab={activeTab} boosterActive={boosterActive} initialCategory={writeCategory} />}
              {showUserInfoModal && currentUser && <UserInfoModal currentUser={currentUser} pointHistory={pointHistory} setShowUserInfoModal={setShowUserInfoModal} handleRedeemPoints={handleRedeemPoints} />}
              {showBirthdayPopup && currentUser && <BirthdayPopup currentUser={currentUser} handleBirthdayGrant={handleBirthdayGrant} setShowBirthdayPopup={setShowBirthdayPopup} />}
              {showGiftModal && <GiftModal onClose={() => setShowGiftModal(false)} onGift={handleGiftPoints} profiles={profiles} currentUser={currentUser} pointHistory={pointHistory} />}
              {showGiftNotificationModal && <GiftNotificationModal onClose={() => setShowGiftNotificationModal(false)} gifts={newGifts} />}
              
              {/* Admin Modals */}
              {showAdminManageModal && <AdminManageModal onClose={() => setShowAdminManageModal(false)} profiles={profiles} onUpdateUser={handleAdminUpdateUser} onDeleteUser={handleAdminDeleteUser} boosterActive={boosterActive} setBoosterActive={setBoosterActive} />}
              {showChangeDeptModal && <ChangeDeptModal onClose={() => setShowChangeDeptModal(false)} onSave={handleChangeDept} />}
              {showChangePwdModal && <ChangePasswordModal onClose={() => setShowChangePwdModal(false)} onSave={handleChangePassword} />}
              {showAdminGrantModal && <AdminGrantModal onClose={() => setShowAdminGrantModal(false)} onGrant={handleAdminGrantPoints} profiles={profiles} />}
              {showRedemptionListModal && <RedemptionListModal onClose={() => setShowRedemptionListModal(false)} redemptionList={redemptionList} onComplete={handleCompleteRedemption} />}
              {showAdminAlertModal && <AdminAlertModal onClose={handleCloseAdminAlert} />}
              
              <MoodToast visible={toast.visible} message={toast.message} emoji={toast.emoji} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}