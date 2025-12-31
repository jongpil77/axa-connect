import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  User, Heart, MessageCircle, Gift, Bell, Sparkles, Smile, Frown, Meh, 
  Megaphone, X, Send, Settings, ChevronRight, LogOut, Image as ImageIcon, 
  Coins, Pencil, Trash2, Loader2, Lock, Clock, Award, Wallet, Building2, 
  CornerDownRight, Link as LinkIcon, MapPin, Search, Key, Edit3, 
  ClipboardList, CheckSquare, ChevronLeft, Zap, Users, Briefcase, Utensils,
  ThumbsUp, Coffee, Sun, Moon, PlusCircle, CheckCircle, Plug 
} from 'lucide-react';
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
        const birthDate = new Date(currentYear, m - 1, d); 
        let normalizedBirthDate = normalizeDate(birthDate);

        if (normalizedBirthDate.getTime() === normalizedToday.getTime()) return; 
        
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
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-red-500"><Bell className="w-5 h-5"/> 알림</h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">📢 <strong>처리되지 않은 포인트 차감 신청</strong>이 있습니다.<br/>설정 메뉴에서 내역을 확인해주세요.</p>
                <div className="flex items-center gap-2 mb-4 bg-slate-50 p-2 rounded-lg cursor-pointer" onClick={() => setDoNotShow(!doNotShow)}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${doNotShow ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'}`}>{doNotShow && <CheckSquare className="w-3 h-3 text-white" />}</div>
                    <span className="text-xs text-slate-500 select-none">오늘 하루 더 이상 열지 않기</span>
                </div>
                <button onClick={() => onClose(doNotShow)} className="w-full bg-slate-800 text-white p-3 rounded-xl font-bold hover:bg-slate-900 transition-colors">확인</button>
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
                            <span className="text-sm font-black text-pink-500">+{gift.amount.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="w-full bg-pink-500 text-white p-4 rounded-2xl font-bold hover:bg-pink-600 shadow-lg transition-all">감사히 받겠습니다!</button>
            </div>
        </div>
    );
};

const AuthForm = ({ isSignupMode, setIsSignupMode, handleLogin, handleSignup, loading }) => {
  const [birthdate, setBirthdate] = useState('1999-01-01'); 
  const [selectedDept, setSelectedDept] = useState('');
  const [email, setEmail] = useState('');
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleSendVerification = () => {
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
  
  return (
    <div className="bg-white/80 backdrop-blur-md p-4 sticky top-0 z-30 border-b border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-1">
          <div className="text-[10px] text-blue-400 font-bold pl-1">{todayDate}</div>
          {/* 상단 우측 소속 및 이름 표시 */}
          <div className="text-[10px] bg-[#00008F] text-white px-2 py-0.5 rounded-lg font-bold flex items-center gap-2 shadow-sm">
              {currentUser && <span>{currentUser.team} - {currentUser.name} 님</span>}
              {boosterActive && <div className="text-[9px] bg-yellow-400 text-[#00008F] px-1 rounded font-black animate-pulse flex items-center gap-0.5"><Zap className="w-2.5 h-2.5 fill-[#00008F]"/>UP</div>}
          </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1 relative">
            {/* 로고 크기 확대 */}
            <img src={AXA_LOGO_URL} alt="AXA Logo" className="w-10 h-auto mr-1" />
            <div className="relative flex items-center">
                {/* 텍스트 줄 간격 최소화 */}
                <div className="flex flex-col leading-none -space-y-1 relative">
                    <span className="text-xl font-black text-slate-800 tracking-tighter">AXA</span>
                    <span className="text-xl font-black text-slate-800 tracking-tighter relative">
                        Connect
                        {/* 플러그 위치 수정: Connect의 t 위에 배치 */}
                        <Plug className="w-4 h-4 text-blue-500 fill-blue-500 absolute -right-2 -top-3 rotate-45" />
                    </span>
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-2 relative">
          {/* 선물 상자 아이콘 우측 이동 */}
          <button onClick={onOpenGift} className="p-1.5 rounded-full hover:bg-slate-100 active:scale-95 transition-all relative text-2xl mr-6">🎁</button>
          
          <div className="flex items-center gap-2 mr-1 cursor-pointer" onClick={onOpenUserInfo}>
             <div className="flex flex-col items-end leading-none">
                 <span className="text-[9px] text-slate-500 font-bold whitespace-nowrap">MY CARE</span>
                 <span className="text-[9px] text-slate-500 font-bold whitespace-nowrap">POINT</span>
             </div>
             {/* 포인트 폰트 더 확대 및 P마크 동전(더 키움) 우측 배치 */}
             <div className="bg-yellow-50 px-3 py-1 rounded-xl border border-yellow-200 shadow-sm flex items-center gap-1">
                 <span className="text-2xl font-black text-blue-700 animate-pulse leading-none pt-0.5">{currentUser?.points?.toLocaleString()}</span>
                 <div className="w-7 h-7 rounded-full bg-yellow-400 border-2 border-yellow-500 flex items-center justify-center shadow-sm relative">
                    <span className="text-[14px] font-black text-yellow-600 drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">P</span>
                 </div>
             </div>
          </div>

          <div className="flex flex-col items-center">
              <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors relative z-40"><Settings className="w-6 h-6 text-slate-400" /></button>
              <span className="text-[8px] text-slate-400 font-bold -mt-0.5">설정</span>
          </div>
          
          {showSettings && (
             <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50 animate-fade-in">
                <button onClick={() => { setShowSettings(false); onOpenChangeDept(); }} className="flex items-center gap-2 w-full p-3 text-xs text-slate-600 hover:bg-slate-50 border-b border-slate-50 transition-colors"><Edit3 className="w-3.5 h-3.5 text-blue-400"/> 소속/팀 변경</button>
                <button onClick={() => { setShowSettings(false); onOpenChangePwd(); }} className="flex items-center gap-2 w-full p-3 text-xs text-slate-600 hover:bg-slate-50 border-b border-slate-50 transition-colors"><Key className="w-3.5 h-3.5 text-blue-400"/> 비밀번호 변경</button>
                {currentUser?.role === 'admin' && (
                    <>
                    <button onClick={() => { setShowSettings(false); onOpenAdminManage(); }} className="flex items-center gap-2 w-full p-3 text-xs text-slate-800 font-bold hover:bg-slate-50 border-b border-slate-50 transition-colors"><Users className="w-3.5 h-3.5 text-slate-600"/> 사용자/이벤트 관리</button>
                    <button onClick={() => { setShowSettings(false); onOpenAdminGrant(); }} className="flex items-center gap-2 w-full p-3 text-xs text-blue-600 font-bold hover:bg-blue-50 border-b border-slate-50 transition-colors"><Gift className="w-3.5 h-3.5 text-blue-500"/> 포인트 지급 (관리자)</button>
                    <button onClick={() => { setShowSettings(false); onOpenRedemptionList(); }} className="flex items-center gap-2 w-full p-3 text-xs text-purple-600 font-bold hover:bg-purple-50 border-b border-slate-50 transition-colors"><ClipboardList className="w-3.5 h-3.5 text-purple-500"/> 포인트 차감 신청 관리</button>
                    </>
                )}
                <button onClick={handleLogout} className="flex items-center gap-2 w-full p-3 text-xs text-red-400 hover:bg-red-50 transition-colors"><LogOut className="w-3.5 h-3.5"/> 로그아웃</button>
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
                <div className="bg-red-50 text-red-500 text-[10px] font-bold p-2 rounded-lg text-center mb-4 border border-red-100">⚠️ 선물하기 월 최대 1,000포인트 가능</div>
                <div className="bg-pink-50 p-3 rounded-xl mb-4 border border-pink-100">
                    <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">이번 달 남은 한도</span><span className="font-bold text-pink-600">{remainingLimit.toLocaleString()} P</span></div>
                    <div className="w-full bg-white h-1.5 rounded-full overflow-hidden"><div className="bg-pink-400 h-full" style={{ width: `${(usedGiftPoints/1000)*100}%` }}></div></div>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl mb-3">
                    {[{id:'dept', label:'조직'}, {id:'team', label:'팀'}, {id:'name', label:'이름'}].map(t => (
                        <button key={t.id} onClick={() => { setTab(t.id); setTargetUser(''); }} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tab === t.id ? 'bg-white text-pink-500 shadow-sm' : 'text-slate-400'}`}>{t.label}</button>
                    ))}
                </div>
                <div className="space-y-3">
                    {tab === 'dept' && (
                        <select className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none" onChange={(e) => setSelectedDept(e.target.value)}>
                            <option value="">본부/부문 선택</option>{Object.keys(ORGANIZATION).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    )}
                    {tab === 'team' && (
                        <>
                        <select className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none mb-2" onChange={(e) => setSelectedDept(e.target.value)}><option value="">본부/부문 선택 (먼저 선택)</option>{Object.keys(ORGANIZATION).map(d => <option key={d} value={d}>{d}</option>)}</select>
                        <select className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none" disabled={!selectedDept} onChange={(e) => setSelectedTeam(e.target.value)}><option value="">팀 선택</option>{selectedDept && ORGANIZATION[selectedDept].map(t => <option key={t} value={t}>{t}</option>)}</select>
                        </>
                    )}
                    {tab === 'name' && (
                        <div className="relative"><Search className="absolute left-3 top-3 w-4 h-4 text-slate-400"/><input type="text" placeholder="이름 검색" className="w-full p-3 pl-9 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
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
        {/* 1. 공지사항 (맨 위) */}
        <div>
           <div className="flex justify-between items-center mb-3 px-1"><h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Megaphone className="w-4 h-4 text-red-500"/> 공지사항</h2><button onClick={onNavigateToNews} className="text-xs text-slate-400 font-medium hover:text-blue-600 flex items-center gap-0.5">더보기 <ChevronRight className="w-3 h-3" /></button></div>
           <div className="space-y-2">{noticeFeeds.length > 0 ? noticeFeeds.map(feed => (<div key={feed.id} onClick={onNavigateToNews} className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 transition-transform active:scale-[0.99] hover:border-blue-200 cursor-pointer"><div className="flex-1 min-w-0"><p className="text-xs font-bold text-slate-800 line-clamp-1 mb-0.5">{feed.title || feed.content}{isToday(feed.created_at) && <span className="ml-1 px-1 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded-sm inline-block">NEW</span>}</p><span className="text-[10px] text-slate-400">{feed.formattedTime} • {feed.author}</span></div><ChevronRight className="w-4 h-4 text-slate-300" /></div>)) : <div className="text-center text-xs text-slate-400 py-6 bg-white rounded-2xl border border-slate-100 border-dashed">등록된 공지가 없습니다.</div>}</div>
        </div>

        {/* 2. 출퇴근/생일 (h-44로 높이 축소, 좌우 배치 변경) */}
        <div className="flex gap-4 h-44">
            <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-blue-100 flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <div>
                        <h2 className="text-xs font-bold text-slate-400 mb-0.5 flex items-center gap-1"><span className="text-xl mr-1">⏰</span>출/퇴근 체크</h2>
                    </div>
                  </div>
                  <div className="flex-1 flex gap-2 relative z-10">
                     {/* 좌측: 출근 체크 */}
                     <div className="flex-1 flex flex-col gap-2 justify-center bg-blue-50/50 rounded-xl p-1 border border-blue-100">
                         <span className="text-[10px] font-bold text-center text-slate-500">출근</span>
                         {!mood ? (
                             <div className="grid grid-cols-1 gap-1 h-full">
                                 <button onClick={() => handleMoodCheck('good')} className="bg-white hover:bg-blue-100 rounded-lg flex items-center justify-center transition-all active:scale-95 shadow-sm border border-blue-100 py-1"><Smile className="w-5 h-5 text-blue-500"/></button>
                                 <button onClick={() => handleMoodCheck('normal')} className="bg-white hover:bg-green-100 rounded-lg flex items-center justify-center transition-all active:scale-95 shadow-sm border border-green-100 py-1"><Meh className="w-5 h-5 text-green-500"/></button>
                                 <button onClick={() => handleMoodCheck('tired')} className="bg-white hover:bg-orange-100 rounded-lg flex items-center justify-center transition-all active:scale-95 shadow-sm border border-orange-100 py-1"><Frown className="w-5 h-5 text-orange-500"/></button>
                             </div>
                         ) : (
                             <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-blue-200">
                                 <div className="text-2xl animate-bounce">🏢</div>
                                 <span className="text-xs font-black text-blue-600 mt-1">완료</span>
                             </div>
                         )}
                     </div>
                     {/* 우측: 퇴근 체크 */}
                     <div className="flex-1 flex flex-col gap-2 justify-center bg-orange-50/50 rounded-xl p-1 border border-orange-100">
                         <span className="text-[10px] font-bold text-center text-slate-500">퇴근</span>
                         <button onClick={handleCheckOut} disabled={!mood || hasCheckedOut} className={`flex-1 ${hasCheckedOut ? 'bg-slate-100 text-slate-300' : !mood ? 'bg-slate-100 text-slate-300' : 'bg-slate-800 text-white hover:bg-slate-900 shadow-md'} rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all active:scale-95`}>
                             {hasCheckedOut ? <><span className="text-xl mb-1">🏠</span><span>완료</span></> : <><span className="text-xl mb-1">🏃</span><span>퇴근</span></>}
                         </button>
                     </div>
                  </div>
            </div>
            <div className="flex-[1.5] h-full"><BirthdayNotifier weeklyBirthdays={weeklyBirthdays} /></div>
        </div>
        
        {/* [NEW] 글쓰기 버튼 & 포인트 안내 (우리들 소식 위쪽) */}
        <div className="flex justify-between items-center mb-2 px-1">
             <button onClick={() => onWriteClickWithCategory(null)} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 hover:shadow-xl transition-all active:scale-95">
                <span>➕</span> 글쓰기 ✏️
             </button>
             <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-full shadow-sm border border-slate-100"><div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner"><Coins className="w-2.5 h-2.5 text-white fill-white"/></div>게시글 1개당 +50P (일 최대 +100P 가능)</div>
        </div>

        {/* 3. 우리들 소식 */}
        {/* [수정] 섹션 전체 클릭 이벤트 삭제, 헤더 추가 */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-purple-100">
           <div className="flex justify-between items-center mb-3">
               <h3 className="text-sm font-bold text-purple-600 flex items-center gap-1.5"><Building2 className="w-4 h-4 text-purple-500"/> 우리들 소식</h3>
               <button onClick={() => onNavigateToFeed('dept_news')} className="text-xs text-slate-400 font-medium hover:text-purple-600 flex items-center gap-0.5">더보기 <ChevronRight className="w-3 h-3" /></button>
           </div>
           <div className="space-y-2">
                {deptFeeds.length > 0 ? deptFeeds.map(feed => (
                    // [수정] 개별 아이템 클릭 시 피드로 이동
                    <div key={feed.id} onClick={() => onNavigateToFeed('dept_news')} className="p-3 bg-purple-50/30 rounded-2xl border border-purple-100 transition-transform active:scale-[0.99] cursor-pointer hover:bg-purple-50/50">
                        <div className="flex items-center justify-between mb-1"><span className="text-[9px] text-purple-700 font-bold bg-white px-1.5 rounded border border-purple-200">{feed.region_main}</span>{isToday(feed.created_at) && <span className="text-[9px]">🆕</span>}</div>
                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed inline">{feed.title || feed.content}</p>
                    </div>
                )) : <p className="text-xs text-slate-400 py-2">등록된 소식이 없습니다.</p>}
           </div>
        </div>

        {/* 4. 칭찬합시다 */}
        {/* [수정] 섹션 전체 클릭 이벤트 삭제, 헤더 추가 */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-blue-100">
           <div className="flex justify-between items-center mb-3">
               <h3 className="text-sm font-bold text-green-600 flex items-center gap-1.5"><Heart className="w-4 h-4 fill-green-500 text-green-500"/> 칭찬합시다</h3>
               <button onClick={() => onNavigateToFeed('praise')} className="text-xs text-slate-400 font-medium hover:text-green-600 flex items-center gap-0.5">더보기 <ChevronRight className="w-3 h-3" /></button>
           </div>
           <div className="space-y-2">{praiseFeeds.length > 0 ? praiseFeeds.map(feed => (
               <div key={feed.id} onClick={() => onNavigateToFeed('praise')} className="p-3 bg-green-50/30 rounded-2xl border border-green-100 transition-transform active:scale-[0.99] cursor-pointer hover:bg-green-50/50">
                   <p className="text-[10px] font-bold text-slate-500 mb-1">To. {feed.target_name || '동료'}</p>
                   <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">{feed.content}</p>{isToday(feed.created_at) && <span className="inline-block ml-1">🆕</span>}
               </div>
           )) : <p className="text-xs text-slate-400 py-2">아직 게시글이 없습니다.</p>}</div>
        </div>
        
        {/* 5. 꿀팁 / 맛집소개 */}
        <div className="grid grid-cols-2 gap-4">
            {/* [수정] 꿀팁 섹션 */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-blue-100 flex flex-col">
               <div className="flex justify-between items-center mb-3">
                   <h3 className="text-sm font-bold text-blue-600 flex items-center gap-1.5"><Sparkles className="w-4 h-4 fill-blue-500 text-blue-500"/> 꿀팁</h3>
                   <button onClick={() => onNavigateToFeed('knowhow')} className="text-[10px] text-slate-400 hover:text-blue-600"><ChevronRight className="w-3 h-3" /></button>
               </div>
               <div className="space-y-2 flex-1">{knowhowFeeds.length > 0 ? knowhowFeeds.map(feed => (
                   <div key={feed.id} onClick={() => onNavigateToFeed('knowhow')} className="p-3 bg-blue-50/30 rounded-2xl border border-blue-100 transition-transform active:scale-[0.99] cursor-pointer hover:bg-blue-50/50">
                       <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed inline">{feed.title || feed.content}</p>{isToday(feed.created_at) && <span className="inline-block ml-1">🆕</span>}
                   </div>
               )) : <p className="text-xs text-slate-400 py-2">등록된 글이 없습니다.</p>}</div>
            </div>
            
            {/* [수정] 맛집 섹션 */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-orange-100 flex flex-col">
               <div className="flex justify-between items-center mb-3">
                   <h3 className="text-sm font-bold text-orange-600 flex items-center gap-1.5"><Utensils className="w-4 h-4 fill-orange-500 text-orange-500"/> 맛집</h3>
                   <button onClick={() => onNavigateToFeed('matjib')} className="text-[10px] text-slate-400 hover:text-orange-600"><ChevronRight className="w-3 h-3" /></button>
               </div>
               <div className="space-y-2 flex-1">{matjibFeeds.length > 0 ? matjibFeeds.map(feed => (
                   <div key={feed.id} onClick={() => onNavigateToFeed('matjib')} className="p-3 bg-orange-50/30 rounded-2xl border border-orange-100 transition-transform active:scale-[0.99] cursor-pointer hover:bg-orange-50/50">
                       <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed inline">{feed.title || feed.content}</p>{isToday(feed.created_at) && <span className="inline-block ml-1">🆕</span>}
                   </div>
               )) : <p className="text-xs text-slate-400 py-2">등록된 글이 없습니다.</p>}</div>
            </div>
        </div>
      </div>
    );
};

const FeedTab = ({ feeds, activeFeedFilter, setActiveFeedFilter, onWriteClickWithCategory, currentUser, handleDeletePost, handleLikePost, handleAddComment, handleDeleteComment, boosterActive }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');

  useEffect(() => { setSelectedDeptFilter('all'); }, [activeFeedFilter]);
  
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
          <Search className="w-4 h-4 text-slate-400 ml-2" /><input type="text" placeholder="검색 (제목, 내용, 작성자, 지역명)" className="flex-1 bg-transparent text-xs p-2 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[{ id: 'all', label: '전체' }, { id: 'praise', label: '칭찬해요' }, { id: 'dept_news', label: '우리들 소식' }, { id: 'knowhow', label: '꿀팁' }, { id: 'matjib', label: '맛집 소개' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveFeedFilter(tab.id)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeFeedFilter === tab.id ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200'}`}>{tab.label}</button>
        ))}
      </div>

      {activeFeedFilter === 'dept_news' && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide animate-fade-in">
              <button onClick={() => setSelectedDeptFilter('all')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border ${selectedDeptFilter === 'all' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-white text-slate-400 border-slate-100'}`}>전체</button>
              {Object.keys(ORGANIZATION).map(dept => (<button key={dept} onClick={() => setSelectedDeptFilter(dept)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border ${selectedDeptFilter === dept ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-white text-slate-400 border-slate-100'}`}>{dept}</button>))}
          </div>
      )}

      <div className="flex flex-col items-end gap-1 mb-1">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onWriteClickWithCategory(null)}>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95 border border-blue-400"><Pencil className="w-3.5 h-3.5" /><span className="text-xs font-bold">게시글 작성</span></div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-full shadow-sm border border-slate-100"><div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner"><Coins className="w-2.5 h-2.5 text-white fill-white"/></div>게시글 1개당 +50P (일 최대 +100P 가능)</div>
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
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${feed.type === 'praise' ? 'bg-green-50 text-green-600 border-green-100' : feed.type === 'news' ? 'bg-red-50 text-red-600 border-red-100' : feed.type === 'dept_news' ? 'bg-purple-50 text-purple-600 border-purple-100' : feed.type === 'matjib' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
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
            
            {feed.image_url && (<div className="mb-4 rounded-2xl overflow-hidden border border-slate-100 shadow-sm"><img src={feed.image_url} alt="Content" className="w-full h-auto object-cover" /></div>)}
            
            <div className="flex items-center gap-4 border-t border-slate-50 pt-3">
              <button onClick={() => handleLikePost(feed.id, feed.likes, feed.isLiked)} className={`flex items-center gap-1 text-xs font-bold transition-colors ${feed.isLiked ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}><Heart className={`w-4 h-4 ${feed.isLiked ? 'fill-red-500' : ''}`} /> {feed.likes?.length || 0}</button>
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
  const [writeCategory, setWriteCategory] = useState(initialCategory || ''); // 초기값을 빈 문자열로 설정하여 선택 유도
  const [imagePreview, setImagePreview] = useState(null);
  const [regionMain, setRegionMain] = useState('');
  const [regionSub, setRegionSub] = useState('');
  const [deptNewsOrg, setDeptNewsOrg] = useState('');

  const handleImageChange = (e) => { const file = e.target.files[0]; if (file) setImagePreview(URL.createObjectURL(file)); };
  
  const categories = useMemo(() => {
    const baseCategories = [
        {id: 'dept_news', label: '우리들 소식'}, // 순서 변경: 우리들 소식이 가장 먼저 나오도록
        {id: 'praise', label: '칭찬하기'},
        {id: 'matjib', label: '맛집소개'},
        {id: 'knowhow', label: '꿀팁'}
    ];
    // 관리자만 공지사항 카테고리 선택 가능
    if (currentUser?.role === 'admin') {
        baseCategories.push({id: 'news', label: '공지사항 (관리자)'});
    }
    return baseCategories;
  }, [currentUser]);

  useEffect(() => {
      // initialCategory가 있으면 그걸로 설정, 없으면 빈 값 유지 (선택 유도)
      if (initialCategory && categories.some(c => c.id === initialCategory)) {
          setWriteCategory(initialCategory);
      } 
      if (currentUser?.dept && Object.keys(ORGANIZATION).includes(currentUser.dept)) { setDeptNewsOrg(currentUser.dept); }
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
            
            {/* [수정] 탭(Tab) 형태의 카테고리 선택 */}
            <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => setWriteCategory(cat.id)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                            writeCategory === cat.id 
                            ? 'bg-slate-800 text-white border-slate-800 scale-105' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
            
            <input type="hidden" name="category" value={writeCategory} />

            <div className="space-y-4 mb-8">
                {!writeCategory && (
                    <div className="text-center py-10 text-slate-400 text-sm">
                        👆 위에서 게시글 유형을 선택해주세요.
                    </div>
                )}

                {writeCategory === 'praise' && (
                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100 animate-fade-in">
                        <label className="text-xs font-bold text-green-700 block mb-2 ml-1">누구를 칭찬하나요?</label>
                        <input name="targetName" type="text" placeholder="이름을 입력하세요 (예: 김철수)" className="w-full bg-white p-3 rounded-xl border border-green-200 text-sm outline-none focus:border-green-500" required />
                    </div>
                )}
                {writeCategory === 'dept_news' && (
                     <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 animate-fade-in">
                         <p className="text-xs text-purple-800 font-bold mb-2">📢 우리 조직의 즐거운 소식을 전해주세요!</p>
                         <select name="regionMain" className="w-full p-3 bg-white border border-purple-200 rounded-xl text-xs outline-none mb-2 text-purple-900 font-bold" value={deptNewsOrg} onChange={(e) => setDeptNewsOrg(e.target.value)} required><option value="">소식 구분 (조직 선택)</option>{Object.keys(ORGANIZATION).map(org => <option key={org} value={org}>{org}</option>)}</select>
                         <input name="title" type="text" placeholder="제목을 입력하세요 (예: 00팀 회식~!)" className="w-full p-3 bg-white border border-purple-200 rounded-xl text-sm outline-none focus:border-purple-500 font-bold mb-3" required />
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
                {writeCategory === 'news' && (
                     <div className="bg-red-50 p-4 rounded-2xl border border-red-100 animate-fade-in">
                         <p className="text-xs text-red-800 font-bold mb-2">📢 공지사항은 모든 임직원에게 알림됩니다.</p>
                         <input name="title" type="text" placeholder="공지 제목" className="w-full p-3 bg-white border border-red-200 rounded-xl text-sm outline-none focus:border-red-500 font-bold mb-3" required />
                     </div>
                )}
                
                {/* 공통 입력 폼 (내용, 사진) */}
                {writeCategory && (
                    <div className="animate-fade-in space-y-4">
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
                )}
            </div>
            
            <button type="submit" disabled={!writeCategory} className="w-full bg-slate-800 text-white p-4 rounded-2xl text-sm font-bold hover:bg-slate-900 shadow-lg transition-all flex items-center justify-center gap-2 disabled:bg-slate-300">
                등록하기 <span className="text-yellow-400 bg-white/10 px-1.5 py-0.5 rounded text-xs">{pointRewardText}</span>
            </button>
            </form>
        </div>
      </div>
    </div>
  );
}