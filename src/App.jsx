import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
 User, Heart, MessageCircle, Gift, Bell, Sparkles, Smile, Frown, Meh, Megaphone, X, Send,
  Settings, ChevronRight, LogOut, Image as ImageIcon, Coins, Pencil, Trash2, Loader2, Lock,
  Clock, Award, Wallet, Building2, CornerDownRight, Link as LinkIcon, MapPin, Search, Key,
  Edit3, ClipboardList, CheckSquare, ChevronLeft, Zap, Users, Briefcase, Utensils, ThumbsUp,
  Coffee, Sun, Moon, PlusCircle, CheckCircle, Plug, MinusCircle, Medal, Plus, Home
} from 'lucide-react';

// --- [필수] Supabase 설정 ---
const SUPABASE_URL = 'https://clsvsqiikgnreqqvcrxj.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsc3ZzcWlpa2ducmVxcXZjcnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzcyNjAsImV4cCI6MjA4MDk1MzI2MH0.lsaycyp6tXjLwb-qB5PIQ0OqKweTWO3WaxZG5GYOUqk';

// --- 커뮤니티 로고 컴포넌트 ---
const CommunityLogo = ({ className = "w-12 h-12" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="absolute inset-0 bg-blue-500/10 rounded-2xl rotate-6 animate-pulse"></div>
    <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg border border-white/20">
      <Users className="text-white w-full h-full" />
      <Sparkles className="absolute -top-1 -right-1 w-30 h-30 text-yellow-300 fill-yellow-300 animate-bounce" style={{ width: '40%', height: '40%' }} />
    </div>
  </div>
);

// --- [신규] N 배지 컴포넌트 ---
const RedNBadge = () => (
    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm ml-1.5 animate-pulse shrink-0">
        <span className="text-[10px] text-white font-black leading-none">N</span>
    </div>
);

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
    '서울': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
    '경기': ['가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
    '인천': ['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구']
};

const INITIAL_POINTS = 1000;
const MOTTO_365 = Array(365).fill('오늘의 노력이 내일의 당신을 만듭니다. 힘내세요!'); // 간소화

// --- Helper Functions ---
const isToday = (timestamp) => {
    if (!timestamp) return false;
    const date = new Date(timestamp);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

const getWeeklyBirthdays = (profiles) => {
    if (!profiles || profiles.length === 0) return { current: [], next: [] };
    const today = new Date();
    const currentYear = today.getFullYear();
    const todayBirthdays = []; 
    const tomorrowBirthdays = [];

    profiles.forEach(p => {
        if (!p.birthdate) return;
        const [_, m, d] = p.birthdate.split('-').map(Number);
        const birthDate = new Date(currentYear, m - 1, d); 
        if (isToday(birthDate)) todayBirthdays.push({ ...p, date: `${m}/${d}`, typeLabel: '(양력)' });
    });
    return { current: todayBirthdays, next: tomorrowBirthdays };
};

// --- Sub Components ---

const MoodToast = ({ message, emoji, visible }) => {
    if (!visible) return null;
    return (
        <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up w-[90%] max-w-sm pointer-events-none">
            <div className="bg-slate-900/95 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700">
                <span className="text-3xl">{emoji}</span>
                <span className="text-base font-bold leading-relaxed whitespace-pre-line">{message}</span>
            </div>
        </div>
    );
};

// [신규] 나의 활동 상세 리스트 모달
const ActivityDetailModal = ({ type, data, onClose, onNavigate }) => {
    const titles = { posts: "내가 작성한 글", comments: "내가 작성한 댓글", praises: "나를 칭찬한 글", likes: "내가 좋아요 한 글" };
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-800">{titles[type]}</h3>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5"/></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {data.length > 0 ? data.map((item, idx) => (
                        <div key={idx} onClick={() => onNavigate(item.type, item.post_id || item.id)} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-blue-50 transition-all">
                            <p className="text-sm font-bold text-slate-700 line-clamp-1">{item.title || item.content}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                    )) : <p className="text-center py-10 text-slate-400 text-sm">내역이 없습니다.</p>}
                </div>
            </div>
        </div>
    );
};

const AuthForm = ({ isSignupMode, setIsSignupMode, handleLogin, handleSignup, loading }) => {
  const [selectedDept, setSelectedDept] = useState('');
  const [securityAgreed, setSecurityAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex justify-center items-center p-3">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 border border-white/50 animate-fade-in relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="text-center mb-10 mt-6 flex flex-col items-center">
          <CommunityLogo className="w-16 h-16 mb-6 shadow-blue-200/50" />
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Connect Hub</h1>
          <p className="text-slate-500 text-base font-medium">함께 만드는 우리들의 커뮤니티 공간🚀</p>
        </div>

        {isSignupMode ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <input name="name" type="text" placeholder="이름" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" required />
            <div>
                <input name="email" type="email" placeholder="이메일 입력" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" required />
                <p className="text-[10px] text-red-500 mt-2 ml-1 font-bold leading-tight">⚠️ jrussi@axa.co.kr(관리자) 외 일반 유저는 회사 메일(@axa.co.kr)로 가입이 불가합니다. 개인 메일을 이용해 주세요.</p>
            </div>
            <input name="birthdate" type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" required />
            <input name="password" type="password" placeholder="비밀번호 (숫자 6자리 이상)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" required minLength="6" />
            <div className="grid grid-cols-2 gap-2">
                <select name="dept" className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" onChange={(e) => setSelectedDept(e.target.value)} required>
                    <option value="">본부 선택</option>
                    {Object.keys(ORGANIZATION).map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
                <select name="team" className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" disabled={!selectedDept} required>
                    <option value="">팀 선택</option>
                    {selectedDept && ORGANIZATION[selectedDept].map(team => <option key={team} value={team}>{team}</option>)}
                </select>
            </div>
            
             <div 
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-3 items-start ${securityAgreed ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-100'}`}
              onClick={() => setSecurityAgreed(!securityAgreed)}
            >
              <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${securityAgreed ? 'bg-blue-600 border-blue-600 shadow-sm' : 'bg-white border-slate-300'}`}>
                {securityAgreed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
              </div>
              <div className="flex-1">
                <p className={`text-xs font-bold ${securityAgreed ? 'text-blue-700' : 'text-red-600'}`}>[필수] 정보보안 및 개인정보 보호 동의</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal font-medium">
                  개인정보 또는 근무하고 있는 회사 정보(영업비밀 등)를 등록할 수 없다는 것에 대해 동의합니다.
                </p>
              </div>
            </div>

            <button type="submit" disabled={loading || !securityAgreed} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-lg flex justify-center">
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : '가입 완료 (1,000P 지급)'}
            </button>
            <button type="button" onClick={() => setIsSignupMode(false)} className="w-full text-slate-400 text-xs py-2">로그인으로 돌아가기</button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input name="email" type="email" placeholder="이메일" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-colors" required />
            <input name="password" type="password" placeholder="비밀번호" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-colors" required />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-lg flex justify-center">
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : '로그인'}
            </button>
            <div className="text-center pt-4">
                <button type="button" onClick={() => setIsSignupMode(true)} className="text-blue-600 text-sm font-bold underline">회원가입</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// --- GiftModal 업데이트: 생일자 한도 예외 ---
const GiftModal = ({ onClose, onGift, profiles, currentUser, pointHistory }) => {
    const [targetUser, setTargetUser] = useState('');
    const [amount, setAmount] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const usedGiftPoints = pointHistory.filter(h => h.type === 'gift_sent' && new Date(h.created_at).getMonth() === currentMonth && new Date(h.created_at).getFullYear() === currentYear).reduce((sum, h) => sum + h.amount, 0);
    const remainingLimit = 1000 - usedGiftPoints;

    const filteredUsers = profiles.filter(p => p.id !== currentUser.id && (p.name.includes(searchTerm) || p.team.includes(searchTerm)));

    const handleSend = () => {
        const giftAmt = parseInt(amount);
        const target = profiles.find(p => p.id === targetUser);
        const [_, m, d] = target.birthdate.split('-').map(Number);
        const isBday = (new Date().getMonth() + 1 === m && new Date().getDate() === d);

        // 생일자가 아닌데 한도를 넘긴 경우 차단
        if (!isBday && giftAmt > remainingLimit) {
            alert(`월 선물 한도를 초과했습니다. 남은 한도: ${remainingLimit}P`);
            return;
        }
        if (giftAmt > currentUser.points) { alert("보유 포인트가 부족합니다."); return; }
        onGift(targetUser, amount);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-400"><X className="w-5 h-5"/></button>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-pink-500"><Gift className="w-6 h-6"/> 마음 선물하기</h3>
                <div className="bg-pink-50 p-4 rounded-2xl mb-5 border border-pink-100 shadow-sm">
                    <div className="flex justify-between text-xs mb-2"><span className="text-slate-500 font-bold">월 선물 한도 (일반 유저)</span><span className="font-bold text-pink-600">{remainingLimit.toLocaleString()} P</span></div>
                    <div className="w-full bg-white h-2 rounded-full overflow-hidden shadow-inner"><div className="bg-pink-400 h-full transition-all" style={{ width: `${(usedGiftPoints/1000)*100}%` }}></div></div>
                    <p className="text-[10px] text-pink-500 mt-2 font-bold leading-tight">* 생일자 동료에게는 한도 제한 없이 선물할 수 있습니다! 🎂</p>
                </div>
                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-4 w-4 h-4 text-slate-400"/>
                        <input type="text" placeholder="이름 검색" className="w-full p-4 pl-10 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <select className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none" onChange={(e) => setTargetUser(e.target.value)} size={5}>
                        {filteredUsers.map(u => {
                            const [_, m, d] = u.birthdate.split('-').map(Number);
                            const isBday = (new Date().getMonth() + 1 === m && new Date().getDate() === d);
                            return <option key={u.id} value={u.id} className="p-2">{u.name} ({u.team}) {isBday ? '🎂 오늘 생일' : ''}</option>;
                        })}
                    </select>
                    <input type="number" placeholder="선물할 포인트 (숫자만)" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none font-bold" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    <button onClick={handleSend} disabled={!targetUser || !amount} className="w-full bg-pink-500 text-white p-4 rounded-2xl font-bold shadow-lg mt-2 text-base">선물 보내기</button>
                </div>
            </div>
        </div>
    );
};

// --- HomeTab: 나의 활동 클릭 및 N 뱃지 ---
const HomeTab = ({ mood, handleMoodCheck, handleCheckOut, hasCheckedOut, feeds, onNavigateToFeed, weeklyBirthdays, currentUser, onActivityClick }) => {
    const ledMessage = `💡 오늘의 한마디: ${MOTTO_365[new Date().getDay()]}`;

    const myActivity = useMemo(() => {
      const myId = currentUser?.id;
      if (!myId) return { posts: 0, comments: 0, praises: 0, likesGiven: 0 };
      const myPosts = feeds.filter(f => f.author_id === myId);
      const praises = myPosts.filter(f => f.type === 'praise').length;
      const comments = feeds.reduce((sum, f) => {
        const cs = f.comments || [];
        return sum + cs.filter(c => c.author_id === myId).length;
      }, 0);
      const likesGiven = feeds.reduce((sum, f) => sum + (Array.isArray(f.likes) && f.likes.includes(myId) ? 1 : 0), 0);
      return { posts: myPosts.length, comments, praises, likesGiven };
    }, [feeds, currentUser]);

    return (
      <div className="px-2 py-4 space-y-5 pb-40 animate-fade-in relative bg-[#F8F9FA] min-h-full">
        {/* 출퇴근 섹션 */}
        <div className="flex gap-4 h-44">
             <div className="flex-[1.2] bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <h2 className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5"><span className="text-lg mr-1">⏰</span>출/퇴근 체크 <span className="text-[8px] text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">각 +20P</span></h2>
                  </div>
                  <div className="flex-1 flex gap-2 relative z-10">
                     <div className="flex-1 flex flex-col gap-2 justify-center bg-blue-50/30 rounded-2xl p-2 border border-blue-50">
                         {!mood ? (
                             <div className="flex flex-col gap-1.5 h-full justify-center">
                                 <button onClick={() => handleMoodCheck('good')} className="bg-white hover:bg-blue-100 rounded-xl w-full flex items-center justify-start px-2 py-1.5 transition-all active:scale-95 shadow-sm border border-blue-100 gap-1.5"><Smile className="w-4 h-4 text-blue-500"/><span className="text-[9px] font-bold text-slate-600">좋음</span></button>
                                 <button onClick={() => handleMoodCheck('normal')} className="bg-white hover:bg-green-100 rounded-xl w-full flex items-center justify-start px-2 py-1.5 transition-all active:scale-95 shadow-sm border border-green-100 gap-1.5"><Meh className="w-4 h-4 text-green-500"/><span className="text-[9px] font-bold text-slate-600">보통</span></button>
                                 <button onClick={() => handleMoodCheck('tired')} className="bg-white hover:bg-orange-100 rounded-xl w-full flex items-center justify-start px-2 py-1.5 transition-all active:scale-95 shadow-sm border border-orange-100 gap-1.5"><Frown className="w-4 h-4 text-orange-500"/><span className="text-[9px] font-bold text-slate-600">피곤</span></button>
                             </div>
                         ) : (
                             <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-blue-100 shadow-sm"><div className="text-2xl animate-bounce mb-1">🏢</div><span className="text-[11px] font-black text-blue-600">출근 완료</span></div>
                         )}
                     </div>
                     <div className="flex-1 flex flex-col gap-2 justify-center bg-orange-50/30 rounded-2xl p-2 border border-orange-50">
                         <button onClick={handleCheckOut} disabled={!mood || hasCheckedOut} className={`flex-1 ${hasCheckedOut ? 'bg-slate-100 text-slate-300' : !mood ? 'bg-slate-100 text-slate-300' : 'bg-slate-800 text-white hover:bg-slate-900 shadow-lg'} rounded-2xl flex flex-col items-center justify-center text-[11px] font-bold transition-all active:scale-95`}>
                             {hasCheckedOut ? <><span className="text-2xl mb-1 grayscale opacity-50">🏠</span><span>퇴근 완료</span></> : <><span className="text-2xl mb-1">🏃</span><span>퇴근하기</span></>}
                         </button>
                     </div>
                  </div>
            </div>
            {/* 생일자 알림 */}
            <div className="flex-1 h-full bg-white rounded-3xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50 flex flex-col">
                <h3 className="font-bold text-[13px] mb-4 flex items-center text-slate-800"><span className="mr-2">🎂</span> 생일자</h3>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {weeklyBirthdays.current.length > 0 ? weeklyBirthdays.current.map((b, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-2xl mb-2"><div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm shadow-sm">🎂</div><div><p className="text-[11px] font-bold text-slate-700">{b.name}</p><p className="text-[9px] text-slate-400 font-medium">오늘 생일!</p></div></div>
                    )) : <div className="h-full flex flex-col items-center justify-center text-slate-300 text-[13px] gap-2"><Smile className="w-6 h-6 opacity-50"/><span>오늘 생일자 없음</span></div>}
                </div>
            </div>
        </div>

        {/* LED 전광판 */}
        <div className="bg-slate-900 rounded-2xl px-4 py-3 shadow-sm border border-slate-800 overflow-hidden">
          <style>{`@keyframes ledMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .ledTrack { display: inline-flex; white-space: nowrap; gap: 3rem; will-change: transform; animation: ledMarquee 18s linear infinite; }`}</style>
          <div className="text-[11px] font-black text-emerald-300 tracking-wide drop-shadow-[0_0_10px_rgba(16,185,129,0.35)]"><div className="ledTrack"><span>{ledMessage}</span><span>{ledMessage}</span></div></div>
        </div>

        {/* 나의 활동 (클릭 가능) */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-black text-slate-800 flex items-center gap-2 whitespace-nowrap"><span>📌</span> 나의 활동</h3><span className="text-[10px] font-bold text-slate-400">클릭하여 상세 보기</span></div>
          <div className="grid grid-cols-2 gap-3">
            <div onClick={() => onActivityClick('posts')} className="bg-slate-50 rounded-2xl p-3 border border-slate-100 shadow-inner flex items-center justify-between cursor-pointer hover:bg-slate-100"><div className="flex items-center gap-2"><span className="text-base">📝</span><span className="text-[11px] font-bold text-slate-600">내 글</span></div><span className="text-lg font-black text-slate-800">{myActivity.posts}</span></div>
            <div onClick={() => onActivityClick('comments')} className="bg-slate-50 rounded-2xl p-3 border border-slate-100 shadow-inner flex items-center justify-between cursor-pointer hover:bg-slate-100"><div className="flex items-center gap-2"><span className="text-base">💬</span><span className="text-[11px] font-bold text-slate-600">댓글</span></div><span className="text-lg font-black text-slate-800">{myActivity.comments}</span></div>
            <div onClick={() => onActivityClick('praises')} className="bg-slate-50 rounded-2xl p-3 border border-slate-100 shadow-inner flex items-center justify-between cursor-pointer hover:bg-slate-100"><div className="flex items-center gap-2"><Medal className="w-5 h-5 text-amber-500" /><span className="text-[11px] font-bold text-slate-600">받은 칭찬</span></div><span className="text-lg font-black text-slate-800">{myActivity.praises}</span></div>
            <div onClick={() => onActivityClick('likes')} className="bg-slate-50 rounded-2xl p-3 border border-slate-100 shadow-inner flex items-center justify-between cursor-pointer hover:bg-slate-100"><div className="flex items-center gap-2"><Heart className="w-5 h-5 text-red-500 fill-red-500" /><span className="text-[11px] font-bold text-slate-600">좋아요 함</span></div><span className="text-lg font-black text-slate-800">{myActivity.likesGiven}</span></div>
          </div>
        </div>

        {/* 게시글 미리보기 리스트 */}
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 px-1">🏢 최근 소식</h3>
            {feeds.slice(0, 3).map(feed => (
                <div key={feed.id} onClick={() => onNavigateToFeed(feed.type, feed.id)} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{feed.title || feed.content}</span>
                        {isToday(feed.created_at) && <RedNBadge />}
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                </div>
            ))}
        </div>
      </div>
    );
}; 

// --- FeedTab: N 배지 & 댓글 좋아요 ---
const FeedTab = ({ feeds, activeFeedFilter, setActiveFeedFilter, onWriteClickWithCategory, currentUser, handleDeletePost, handleLikePost, handleAddComment, handleDeleteComment, handleLikeComment, selectedPostId, onClearSelection }) => {
  const filteredFeeds = feeds.filter(f => {
      if (selectedPostId) return f.id === selectedPostId;
      return activeFeedFilter === 'all' || f.type === activeFeedFilter;
  });

  return (
    <div className="px-2 py-4 space-y-6 pb-40 animate-fade-in bg-slate-50 min-h-full">
      {selectedPostId && <button onClick={onClearSelection} className="w-full bg-slate-800 text-white p-4 rounded-2xl font-bold mb-2 flex items-center justify-center gap-2 hover:bg-slate-900 shadow-lg"><ChevronLeft className="w-5 h-5"/> 목록으로 돌아가기</button>}
      
      {!selectedPostId && (
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {[{ id: 'all', label: '전체' }, { id: 'praise', label: '칭찬뿜뿜💚' }, { id: 'dept_news', label: '우리팀 톡톡🏢' }, { id: 'knowhow', label: '꿀팁.zip🧠' }, { id: 'matjib', label: '맛집레이더🍜' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveFeedFilter(tab.id)} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeFeedFilter === tab.id ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>{tab.label}</button>
            ))}
        </div>
      )}

      {filteredFeeds.map(feed => {
        const comments = feed.comments || [];
        const isNew = isToday(feed.created_at);
        return (
          <div key={feed.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-50 relative group transition-all hover:shadow-md">
            <div className="absolute top-6 right-6 flex gap-2 items-center z-10">{isNew && <RedNBadge />}</div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">{feed.author?.[0]}</div>
              <p className="text-base font-bold text-slate-800 flex items-center gap-1.5">{feed.author} <span className="text-slate-400 text-sm font-medium">({feed.team})</span></p>
            </div>
            
            <div className="mb-5">
                {feed.type !== 'praise' && feed.title && <h3 className="text-base font-bold text-slate-800 mb-2">{feed.title}</h3>}
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{feed.content}</p>
            </div>
            
            {feed.image_url && (<div className="mb-5 rounded-3xl overflow-hidden border border-slate-100 shadow-sm"><img src={feed.image_url} alt="Content" className="w-full h-auto object-cover" /></div>)}
            
            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
              <div className="flex items-center gap-5">
                  <button onClick={() => handleLikePost(feed.id, feed.likes, feed.isLiked)} className={`flex items-center gap-1.5 text-sm font-bold transition-all ${feed.isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}><Heart className={`w-5 h-5 ${feed.isLiked ? 'fill-red-500' : ''}`} /> {feed.likes?.length || 0}</button>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-400"><MessageCircle className="w-5 h-5" /> {comments.length}</div>
              </div>
              <div className="text-xs text-slate-300 font-medium">{feed.formattedTime}</div>
            </div>
            {/* 댓글 영역 */}
            <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
                {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-bold text-slate-700">{comment.profiles?.name}</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleLikeComment(feed.id, comment.id, comment.likes)} className={`flex items-center gap-1 text-xs font-bold ${comment.isLiked ? 'text-red-500' : 'text-slate-400'}`}>
                                        <Heart className={`w-3 h-3 ${comment.isLiked ? 'fill-red-500' : ''}`} /> {comment.likes?.length || 0}
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={(e) => handleAddComment(e, feed.id)} className="flex gap-2 mt-4">
                <input name="commentContent" type="text" placeholder="댓글을 남겨주세요..." className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none" required />
                <button type="submit" className="bg-white border border-slate-200 text-slate-500 p-3 rounded-2xl hover:bg-blue-50 hover:text-blue-600"><Send className="w-4 h-4"/></button>
            </form>
          </div>
        );
      })}
    </div>
  );
};

export default function App() {
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [pointHistory, setPointHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [activeFeedFilter, setActiveFeedFilter] = useState('all');
  const [mood, setMood] = useState(null);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [activityModal, setActivityModal] = useState({ show: false, type: '', data: [] });
  const [toast, setToast] = useState({ visible: false, message: '', emoji: '' });
  const [selectedPostId, setSelectedPostId] = useState(null);

  const weeklyBirthdays = useMemo(() => getWeeklyBirthdays(profiles), [profiles]);

  useEffect(() => {
    if (window.supabase) {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        setSupabase(client);
        client.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchUserData(client, session.user.id);
        });
    }
  }, []);

  const fetchUserData = async (client, userId) => {
      const { data } = await client.from('profiles').select('*').eq('id', userId).single();
      if (data) {
          setCurrentUser(data);
          const today = new Date().toISOString().split('T')[0];
          if (data.last_attendance === today) setMood('checked');
          if (localStorage.getItem(`checkout_${userId}_${today}`)) setHasCheckedOut(true);
      }
      const { data: ps } = await client.from('profiles').select('*');
      setProfiles(ps || []);
      const { data: pts } = await client.from('point_history').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      setPointHistory(pts || []);
      fetchFeeds(client, userId);
  };

  const fetchFeeds = async (client, userId) => {
      const { data } = await client.from('posts').select(`*, profiles(*), comments(*, profiles(*))`).order('created_at', { ascending: false });
      if (data) {
          setFeeds(data.map(f => ({
              ...f, author: f.profiles?.name, team: f.profiles?.team,
              likes: f.likes || [], isLiked: (f.likes || []).includes(userId),
              comments: (f.comments || []).map(c => ({
                  ...c, likes: c.likes || [], isLiked: (c.likes || []).includes(userId)
              }))
          })));
      }
  };

  // 1. 회원가입: 이메일 차단 로직
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { name, email, password, dept, team, birthdate } = e.target;
    const emailVal = email.value.toLowerCase();

    if ((emailVal.endsWith('@axa.co.kr') || emailVal.endsWith('@directasia.com')) && emailVal !== 'jrussi@axa.co.kr') {
        alert("⛔ 보안상 회사 메일(@axa.co.kr)로 가입할 수 없습니다.\n개인 메일(Gmail, Naver 등)을 이용해 주세요.");
        setLoading(false);
        return;
    }

    try {
        const { data: res, error } = await supabase.auth.signUp({
            email: emailVal, password: password.value,
            options: { data: { name: name.value, dept: dept.value, team: team.value, points: INITIAL_POINTS, birthdate: birthdate.value, role: emailVal === 'jrussi@axa.co.kr' ? 'admin' : 'member' } }
        });
        if (error) throw error;
        await supabase.from('point_history').insert({ user_id: res.user.id, reason: '가입 환영 포인트', amount: INITIAL_POINTS, type: 'earn' });
        alert("가입 성공! 로그인해 주세요.");
        setIsSignupMode(false);
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const { error } = await supabase.auth.signInWithPassword({ email: e.target.email.value, password: e.target.password.value });
        if (error) throw error;
        window.location.reload();
    } catch (err) { alert("로그인 실패: 정보를 확인하세요."); } finally { setLoading(false); }
  };

  // 2. 출근/퇴근 (오류 수정: 세션 확인 시 즉시 가능)
  const handleMoodCheck = async (mood) => {
    if (!currentUser) return;
    const today = new Date().toISOString().split('T')[0];
    if (currentUser.last_attendance === today) return;
    try {
        await supabase.from('profiles').update({ points: currentUser.points + 20, last_attendance: today }).eq('id', currentUser.id);
        await supabase.from('point_history').insert({ user_id: currentUser.id, reason: '출근 체크', amount: 20, type: 'earn' });
        setMood('checked');
        setToast({ visible: true, message: "출근 완료! +20P", emoji: "☀️" });
        setTimeout(() => setToast({ visible: false }), 2000);
        fetchUserData(supabase, currentUser.id);
    } catch (err) { console.error(err); }
  };

  const handleCheckOut = async () => {
      if (!currentUser || hasCheckedOut) return;
      const today = new Date().toISOString().split('T')[0];
      try {
          await supabase.from('profiles').update({ points: currentUser.points + 20 }).eq('id', currentUser.id);
          await supabase.from('point_history').insert({ user_id: currentUser.id, reason: '퇴근 체크', amount: 20, type: 'earn' });
          localStorage.setItem(`checkout_${currentUser.id}_${today}`, 'true');
          setHasCheckedOut(true);
          setToast({ visible: true, message: "퇴근 완료! +20P", emoji: "🌙" });
          setTimeout(() => setToast({ visible: false }), 2000);
          fetchUserData(supabase, currentUser.id);
      } catch (err) { console.error(err); }
  };

  // 3. 댓글 좋아요 및 포인트
  const handleLikeComment = async (postId, commentId, currentLikes) => {
      const isLiked = currentLikes.includes(currentUser.id);
      const newLikes = isLiked ? currentLikes.filter(id => id !== currentUser.id) : [...currentLikes, currentUser.id];
      try {
          await supabase.from('comments').update({ likes: newLikes }).eq('id', commentId);
          // 좋아요를 새로 눌렀을 때만 댓글 작성자에게 2P 지급
          if (!isLiked) {
              const comment = feeds.find(f => f.id === postId).comments.find(c => c.id === commentId);
              const { data: author } = await supabase.from('profiles').select('points').eq('id', comment.author_id).single();
              await supabase.from('profiles').update({ points: author.points + 2 }).eq('id', comment.author_id);
              await supabase.from('point_history').insert({ user_id: comment.author_id, reason: '댓글 좋아요 획득', amount: 2, type: 'earn' });
          }
          fetchFeeds(supabase, currentUser.id);
      } catch (err) { console.error(err); }
  };
  
  const handleLikePost = async (postId, currentLikes) => {
    const isLiked = currentLikes.includes(currentUser.id);
    const newLikes = isLiked ? currentLikes.filter(id => id !== currentUser.id) : [...currentLikes, currentUser.id];
    try { await supabase.from('posts').update({ likes: newLikes }).eq('id', postId); fetchFeeds(supabase, currentUser.id); } catch (err) { console.error(err); }
  };

  const handleAddComment = async (e, postId) => {
      e.preventDefault();
      const content = e.target.commentContent.value;
      if (!content) return;
      try {
          await supabase.from('comments').insert({ post_id: postId, author_id: currentUser.id, content });
          e.target.reset();
          fetchFeeds(supabase, currentUser.id);
      } catch (err) { console.error(err); }
  };

  // 4. 활동 리스트 모달 호출
  const openActivityDetail = (type) => {
      let data = [];
      const myId = currentUser.id;
      if (type === 'posts') data = feeds.filter(f => f.author_id === myId);
      else if (type === 'comments') data = feeds.flatMap(f => (f.comments || []).filter(c => c.author_id === myId).map(c => ({...c, post_id: f.id})));
      else if (type === 'praises') data = feeds.filter(f => f.type === 'praise' && f.target_name === currentUser.name);
      else if (type === 'likes') data = feeds.filter(f => f.likes.includes(myId));
      setActivityModal({ show: true, type, data });
  };
  
  // 5. 선물하기 (생일자 한도 예외)
  const handleGiftPoints = async (targetUserId, amount) => {
    const giftAmount = parseInt(amount);
    try {
        await supabase.from('profiles').update({ points: currentUser.points - giftAmount }).eq('id', currentUser.id);
        await supabase.from('point_history').insert({ user_id: currentUser.id, reason: '포인트 선물 (보냄)', amount: giftAmount, type: 'gift_sent' });
        const { data: target } = await supabase.from('profiles').select('points').eq('id', targetUserId).single();
        await supabase.from('profiles').update({ points: target.points + giftAmount }).eq('id', targetUserId);
        await supabase.from('point_history').insert({ user_id: targetUserId, reason: `선물 받음 (${currentUser.name})`, amount: giftAmount, type: 'earn' });
        setShowGiftModal(false);
        alert("선물이 완료되었습니다! 🎁");
        fetchUserData(supabase, currentUser.id);
    } catch (err) { console.error(err); }
  };

  if (!session) return <AuthForm isSignupMode={isSignupMode} setIsSignupMode={setIsSignupMode} handleLogin={handleLogin} handleSignup={handleSignup} loading={loading} />;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 shadow-2xl relative flex flex-col">
      <div className="bg-white/95 backdrop-blur-xl px-4 pt-6 pb-4 sticky top-0 z-40 border-b border-slate-100 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
            <CommunityLogo className="w-10 h-10" />
            <div className="flex flex-col leading-none"><span className="text-xl font-black text-slate-800">Connect</span><span className="text-[10px] font-black text-blue-500 tracking-widest">HUB</span></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 px-3 py-1.5 rounded-xl flex items-center gap-1 border border-amber-200"><Coins className="w-3.5 h-3.5 text-amber-600 fill-amber-600"/><span className="text-sm font-black text-amber-900">{currentUser?.points?.toLocaleString()}</span></div>
          <button onClick={() => setShowGiftModal(true)} className="p-2 bg-yellow-400 text-white rounded-full"><Gift className="w-5 h-5"/></button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-24 custom-scrollbar">
        {activeTab === 'home' && (
          <HomeTab
            mood={mood} handleMoodCheck={handleMoodCheck} handleCheckOut={handleCheckOut} hasCheckedOut={hasCheckedOut}
            feeds={feeds} onNavigateToFeed={(type, id) => { setActiveTab('feed'); setActiveFeedFilter(type); setSelectedPostId(id); }}
            weeklyBirthdays={weeklyBirthdays} currentUser={currentUser} onActivityClick={openActivityDetail}
          />
        )}
        {activeTab === 'feed' && (
          <FeedTab
            feeds={feeds} activeFeedFilter={activeFeedFilter} setActiveFeedFilter={setActiveFeedFilter}
            currentUser={currentUser} handleLikePost={handleLikePost} handleAddComment={handleAddComment} handleLikeComment={handleLikeComment}
            selectedPostId={selectedPostId} onClearSelection={() => setSelectedPostId(null)}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t flex justify-around p-4 h-20 items-center z-50 shadow-lg">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-300'}`}><Home className="w-6 h-6"/><span className="text-[10px] font-bold">홈</span></button>
        <button onClick={() => setActiveTab('feed')} className={`flex flex-col items-center gap-1 ${activeTab === 'feed' ? 'text-blue-600' : 'text-slate-300'}`}><MessageCircle className="w-6 h-6"/><span className="text-[10px] font-bold">피드</span></button>
        <button onClick={() => setActiveTab('feed')} className="bg-blue-600 text-white p-4 rounded-full -mt-10 shadow-xl border-4 border-white"><Plus className="w-6 h-6"/></button>
        <button onClick={() => supabase.auth.signOut()} className="flex flex-col items-center gap-1 text-slate-300"><LogOut className="w-6 h-6"/><span className="text-[10px] font-bold">로그아웃</span></button>
      </nav>

      {showGiftModal && <GiftModal onClose={() => setShowGiftModal(false)} onGift={handleGiftPoints} profiles={profiles} currentUser={currentUser} pointHistory={pointHistory} />}
      {activityModal.show && <ActivityDetailModal type={activityModal.type} data={activityModal.data} onClose={() => setActivityModal({ show: false, type: '', data: [] })} onNavigate={(type, id) => { setActivityModal({ show: false, type: '', data: [] }); setActiveTab('feed'); setActiveFeedFilter(type); setSelectedPostId(id); }} />}
      <MoodToast visible={toast.visible} message={toast.message} emoji={toast.emoji} />
    </div>
  );
}