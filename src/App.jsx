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
    '인천': ['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'],
    '강원': ['강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'],
    '충북': ['괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '증평군', '진천군', '청주시', '충주시'],
    '충남': ['계룡시', '공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시', '서천군', '아산시', '연기군', '예산군', '천안시', '청양군', '태안군', '홍성군'],
    '대전': ['대덕구', '동구', '서구', '유성구', '중구'],
    '경북': ['경산시', '경주시', '고령군', '구미시', '군위군', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'],
    '경남': ['거제시', '거창군', '고성군', '김해시', '남해군', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군'],
    '대구': ['군위군', '남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
    '울산': ['남구', '동구', '북구', '울주군', '중구'],
    '부산': ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
    '전북': ['고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시', '정읍시', '진안군'],
    '전남': ['강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
    '광주': ['광산구', '남구', '동구', '북구', '서구'],
    '제주': ['서귀포시', '제주시'],
    '세종': ['세종시']
};

const MOTTO_365 = [
  '루틴을 시작해. 이것이 성공의 출발점이다.', '작은 습관을 지켜. 결국 큰 변화를 만든다.', '오늘을 기록해. 나를 단단하게 만든다.',
  '목표를 믿어. 너는 이미 반은 이겼다.', '실수를 정리해. 이것은 성장의 증거다.', '꾸준함을 유지해. 가장 빠른 지름길이다.',
  '준비를 철저히 해. 기회는 준비된 자에게 온다.', '태도를 점검해. 내일의 나를 만든다.', '반복을 즐겨. 이것이 진정한 실력이다.',
  '지금 나아가. 멈추지 않으면 닿는다.', '용기를 선택해. 두려움은 환상이다.', '계획을 단순화해. 실행이 답이다.',
  '하루를 사랑해. 이 시간이 쌓여 미래가 된다.', '변화를 받아들여. 성장의 기회다.', '약속을 지켜. 신뢰가 가장 큰 자산이다.',
  '집중을 연습해. 몰입이 결과를 만든다.', '결과를 기다려. 인내는 쓰고 열매는 달다.', '과정을 기록해. 역사가 된다.',
  '실행을 서둘러. 고민할 시간에 시작하라.', '확신을 가져. 너는 할 수 있다.', '침묵을 배워. 때론 말이 적을수록 강하다.',
  '비판을 수용해. 더 나은 나를 만든다.', '감사를 표현해. 긍정이 긍정을 부른다.', '휴식을 허락해. 멈춤도 전진의 일부다.',
  '배움을 지속해. 뇌는 늙지 않는다.', '거절을 연습해. 나를 지키는 힘이다.', '관점을 바꿔. 세상이 다르게 보인다.',
  '독서를 시작해. 거인의 어깨에 올라타라.', '운동을 습관화해. 체력을 곧 정신력이다.', '청소를 해. 주변이 맑아야 머리가 맑다.',
  '메모를 해. 천재보다 낫다.'
];

const INITIAL_POINTS = 1000;

// --- [수정] 신규 N 배지 컴포넌트 ---
const NewBadge = () => (
  <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center shadow-sm">
    <span className="text-[10px] text-white font-black leading-none">N</span>
  </div>
);

// --- [수정] 커뮤니티 로고 컴포넌트 ---
const CommunityLogo = ({ className = "w-12 h-12" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="absolute inset-0 bg-blue-500/10 rounded-2xl rotate-6 animate-pulse"></div>
    <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg border border-white/20">
      <Users className="text-white w-full h-full" />
      <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 fill-yellow-300 animate-bounce" />
    </div>
  </div>
);

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
    const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedToday = normalizeDate(today);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const normalizedTomorrow = normalizeDate(tomorrow);
    const todayBirthdays = []; 
    const tomorrowBirthdays = [];
    profiles.forEach(p => {
        if (!p.birthdate) return;
        const [_, m, d] = p.birthdate.split('-').map(Number);
        const birthDate = new Date(currentYear, m - 1, d); 
        let normalizedBirthDate = normalizeDate(birthDate);
        if (normalizedBirthDate < normalizedToday) {
             const nextYearBirthDate = new Date(currentYear + 1, m - 1, d);
             normalizedBirthDate = normalizeDate(nextYearBirthDate);
        }
        if (normalizedBirthDate.getTime() === normalizedToday.getTime()) todayBirthdays.push({ name: p.name, date: `${m}/${d}`, typeLabel: '(양력)' });
        else if (normalizedBirthDate.getTime() === normalizedTomorrow.getTime()) tomorrowBirthdays.push({ name: p.name, date: `${m}/${d}`, typeLabel: '(양력)' });
    });
    return { current: todayBirthdays, next: tomorrowBirthdays };
};

// --- [추가] 활동 상세 모달 ---
const ActivityDetailModal = ({ title, list, onClose, type }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
    <div className="bg-white w-full max-w-md rounded-[2.5rem] h-[75vh] flex flex-col shadow-2xl overflow-hidden">
      <div className="p-7 bg-slate-800 flex justify-between items-center text-white">
        <h3 className="text-lg font-bold flex items-center gap-2">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6"/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50">
        {list.length > 0 ? list.map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 transition-transform active:scale-[0.98]">
            <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 uppercase">{item.type || 'Activity'}</span>
                <span className="text-[11px] text-slate-400 font-medium">{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-base font-bold text-slate-800 leading-snug line-clamp-2">{item.title || item.content}</p>
          </div>
        )) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
             <div className="bg-slate-200/50 p-5 rounded-full"><Search className="w-10 h-10 opacity-30"/></div>
             <p className="text-base font-bold">활동 내역이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// --- Sub Components ---
const MoodToast = ({ message, emoji, visible }) => {
    if (!visible) return null;
    return (
        <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up w-[92%] max-w-sm pointer-events-none">
            <div className="bg-slate-900/95 backdrop-blur-md text-white px-7 py-5 rounded-[2rem] shadow-2xl flex items-center gap-5 border border-slate-700">
                <span className="text-4xl">{emoji}</span>
                <span className="text-base font-black leading-tight whitespace-pre-line">{message}</span>
            </div>
        </div>
    );
};

const AuthForm = ({ isSignupMode, setIsSignupMode, handleLogin, handleSignup, loading }) => {
  const [selectedDept, setSelectedDept] = useState('');
  const [securityAgreed, setSecurityAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 border border-white/50 animate-fade-in relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="text-center mb-10 mt-6 flex flex-col items-center">
          <CommunityLogo className="w-20 h-20 mb-6" />
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">Connect Hub</h1>
          <p className="text-slate-500 text-base font-bold">함께 만드는 우리들의 소통 공간 🚀</p>
        </div>

        {isSignupMode ? (
          <form onSubmit={handleSignup} className="space-y-6">
            <div><label className="block text-sm font-black text-slate-600 mb-1.5 ml-1">이름</label><input name="name" type="text" placeholder="이름 입력" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-base focus:border-blue-500 transition-all shadow-sm" required /></div>
            <div>
                <label className="block text-sm font-black text-slate-600 mb-1.5 ml-1">이메일</label>
                <input name="email" type="email" placeholder="개인 이메일 (네이버, 구글 등)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-base focus:border-blue-500 transition-all shadow-sm" required />
                <p className="text-[11px] text-red-500 mt-1.5 ml-1 font-bold">⚠️ @axa.co.kr 메일은 보안상 가입이 제한됩니다.</p>
            </div>
            <div><label className="block text-sm font-black text-slate-600 mb-1.5 ml-1">비밀번호</label><input name="password" type="password" placeholder="비밀번호 (숫자 6자리 이상)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-base focus:border-blue-500 transition-all shadow-sm" required minLength="6" /></div>
            <div className="grid grid-cols-2 gap-3">
                <select name="dept" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700" onChange={(e) => setSelectedDept(e.target.value)} required><option value="">본부/부문</option>{Object.keys(ORGANIZATION).map(dept => <option key={dept} value={dept}>{dept}</option>)}</select>
                <select name="team" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700" disabled={!selectedDept} required><option value="">팀/센터</option>{selectedDept && ORGANIZATION[selectedDept].map(team => <option key={team} value={team}>{team}</option>)}</select>
            </div>
            <div><label className="block text-sm font-black text-slate-600 mb-1.5 ml-1">생년월일 (양력)</label><input name="birthdate" type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-base text-slate-600" required /></div>
            
            <div className={`p-5 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start ${securityAgreed ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-100'}`} onClick={() => setSecurityAgreed(!securityAgreed)}>
              <div className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${securityAgreed ? 'bg-blue-600 border-blue-600 shadow-sm' : 'bg-white border-slate-300'}`}>{securityAgreed && <CheckCircle className="w-4 h-4 text-white" />}</div>
              <div className="flex-1">
                <p className={`text-sm font-black ${securityAgreed ? 'text-blue-700' : 'text-red-700'}`}>[필수] 정보보안 준수 동의</p>
                <p className="text-[11px] text-slate-500 mt-1 font-medium leading-tight">개인정보 및 회사 영업비밀 등록을 금하며, 위반 시 모든 책임은 본인에게 있음에 동의합니다.</p>
              </div>
            </div>

            <button type="submit" disabled={loading || !securityAgreed} className="w-full bg-blue-600 text-white p-5 rounded-3xl text-lg font-black hover:bg-blue-700 shadow-xl transition-all disabled:bg-slate-300">{loading ? <Loader2 className="animate-spin w-6 h-6 mx-auto" /> : '가입 완료 (+1,000P)'}</button>
            <button type="button" onClick={() => setIsSignupMode(false)} className="w-full text-slate-400 text-sm font-bold hover:text-blue-600 transition-colors">이미 계정이 있나요? 로그인</button>
          </form>
        ) : (
          <div className="space-y-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div><label className="block text-sm font-black text-slate-600 mb-1.5 ml-1">이메일</label><input name="email" type="text" placeholder="이메일 입력" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-base shadow-sm focus:border-blue-500" /></div>
              <div><label className="block text-sm font-black text-slate-600 mb-1.5 ml-1">비밀번호</label><input name="password" type="password" placeholder="비밀번호 입력" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-base shadow-sm focus:border-blue-500" /></div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-5 rounded-3xl text-lg font-black shadow-xl hover:bg-blue-700 transition-all">{loading ? <Loader2 className="animate-spin w-6 h-6 mx-auto" /> : '🚀 로그인'}</button>
            </form>
            <div className="text-center"><button onClick={() => setIsSignupMode(true)} className="text-slate-500 text-sm font-black hover:text-blue-600 underline">처음 오셨나요? 회원가입</button></div>
          </div>
        )}
      </div>
    </div>
  );
};

const Header = ({ currentUser, onOpenUserInfo, handleLogout, onOpenChangeDept, onOpenChangePwd, onOpenAdminGrant, onOpenRedemptionList, onOpenGift, onOpenAdminManage, onOpenAdminClawback, boosterActive }) => {
  const todayDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const [showSettings, setShowSettings] = useState(false);
  
  return (
    <div className="bg-white/95 backdrop-blur-xl px-4 pt-7 pb-6 sticky top-0 z-40 border-b border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-2">
          <div className="text-[12px] text-blue-500 font-black pl-1">{todayDate}</div>
          <div className="flex items-center gap-2">
            {boosterActive && <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full font-black text-[11px] border border-red-200 shadow-sm flex items-center gap-1">⚡ 2배 적용</div>}
            <div className="text-[11px] bg-slate-800 text-white px-4 py-1.5 rounded-full font-bold flex items-center gap-2 shadow-md"><User className="w-3.5 h-3.5" />{currentUser?.team} - {currentUser?.name}님</div>
          </div>
      </div>
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2 relative mt-1 pl-1">
            <CommunityLogo className="w-11 h-11" />
            <div className="flex flex-col relative leading-none">
                <span className="text-2xl font-black text-slate-800 tracking-tighter">Connect</span>
                <span className="text-[12px] font-black text-blue-500 tracking-wider">HUB</span>
            </div>
        </div>
        <div className="flex items-center gap-2 relative">
          <div className="flex items-center gap-2 mr-1 cursor-pointer group" onClick={onOpenUserInfo}>
             <div className="flex flex-col items-center leading-none">
                <span className="text-[11px] text-slate-400 font-black mb-1.5">My Points</span>
                <div className="flex items-center gap-2 bg-amber-200 px-4 py-2 rounded-2xl shadow-md border border-amber-300 ring-2 ring-amber-400/20">
                    <Coins className="w-5 h-5 text-amber-900 fill-amber-900"/>
                    <span className="text-2xl font-black text-amber-950 tracking-tight">{currentUser?.points?.toLocaleString()}</span>
                </div>
             </div>
          </div>
          <button onClick={onOpenGift} className="p-3 rounded-full bg-yellow-100 hover:bg-yellow-200 border-2 border-red-400 transition-all shadow-sm flex items-center justify-center active:scale-95"><span className="text-2xl">🎁</span></button>
          <button onClick={() => setShowSettings(!showSettings)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors border border-slate-100 shadow-sm"><Settings className="w-6 h-6 text-slate-600" /></button>
          
          {showSettings && (
             <div className="absolute right-0 top-full mt-4 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fade-in-up origin-top-right p-3">
                <div className="space-y-1">
                    <button onClick={() => { setShowSettings(false); onOpenChangeDept(); }} className="flex items-center gap-3 w-full p-4 text-sm text-slate-700 hover:bg-slate-50 rounded-2xl transition-colors font-bold"><Edit3 className="w-5 h-5 text-blue-500"/> 소속/팀 변경</button>
                    <button onClick={() => { setShowSettings(false); onOpenChangePwd(); }} className="flex items-center gap-3 w-full p-4 text-sm text-slate-700 hover:bg-slate-50 rounded-2xl transition-colors font-bold"><Key className="w-5 h-5 text-blue-500"/> 비밀번호 변경</button>
                </div>
                {currentUser?.role === 'admin' && (
                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                        <button onClick={() => { setShowSettings(false); onOpenAdminManage(); }} className="flex items-center gap-3 w-full p-4 text-sm text-slate-800 font-black hover:bg-slate-50 rounded-2xl"><Users className="w-5 h-5 text-slate-600"/> 시스템 관리</button>
                        <button onClick={() => { setShowSettings(false); onOpenAdminGrant(); }} className="flex items-center gap-3 w-full p-4 text-sm text-blue-600 font-black hover:bg-blue-50 rounded-2xl"><Gift className="w-5 h-5"/> 포인트 지급</button>
                        <button onClick={() => { setShowSettings(false); onOpenRedemptionList(); }} className="flex items-center gap-3 w-full p-4 text-sm text-purple-600 font-black hover:bg-purple-50 rounded-2xl"><ClipboardList className="w-5 h-5"/> 차감 신청 관리</button>
                    </div>
                )}
                <div className="mt-2 pt-2 border-t border-slate-100">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full p-4 text-sm text-red-500 hover:bg-red-50 rounded-2xl font-black"><LogOut className="w-5 h-5"/> 로그아웃</button>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HomeTab = ({ mood, handleMoodCheck, handleCheckOut, hasCheckedOut, feeds, onWriteClickWithCategory, onNavigateToNews, onNavigateToFeed, weeklyBirthdays, boosterActive, currentUser, attendanceEnabled, openActivityDetail, myActivity, handleTabChange, setActiveFeedFilter }) => {
    const averageLikes = useMemo(() => {
        if (feeds.length === 0) return 0;
        const totalLikes = feeds.reduce((acc, curr) => acc + (curr.likes?.length || 0), 0);
        return totalLikes / feeds.length;
    }, [feeds]);

    const ledIndex = useMemo(() => {
      const now = new Date();
      const diff = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / 86400000);
      return diff % MOTTO_365.length;
    }, []);
    const ledMessage = useMemo(() => `💡 오늘의 한마디: ${MOTTO_365[ledIndex]}`, [ledIndex]);

    const renderFeedSection = (type, title, color, icon) => {
        const filtered = feeds.filter(f => f.type === type).slice(0, 3);
        const bgColors = { purple: 'bg-purple-50/60 border-purple-100', green: 'bg-green-50/60 border-green-100', blue: 'bg-blue-50/60 border-blue-100', orange: 'bg-orange-50/60 border-orange-100' };
        const btnColors = { purple: 'bg-purple-600', green: 'bg-green-600', blue: 'bg-blue-600', orange: 'bg-orange-600' };

        return (
            <div className={`${bgColors[color]} p-6 rounded-[2.5rem] shadow-sm border transition-all`}>
               <div className="flex justify-between items-center mb-5">
                   <h3 className={`${btnColors[color]} text-sm font-black text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-md`}>{icon}{title}</h3>
                   <button onClick={() => { setActiveFeedFilter(type); handleTabChange('feed'); }} className="text-[11px] text-slate-400 font-black flex items-center gap-1 hover:text-slate-600 bg-white px-3 py-1.5 rounded-xl shadow-sm">더보기 <ChevronRight className="w-3.5 h-3.5"/></button>
               </div>
               <div className="space-y-3">
                   {filtered.length > 0 ? filtered.map(feed => (
                       <div key={feed.id} onClick={() => onNavigateToFeed(feed.type, feed.id)} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 relative group active:scale-[0.98] transition-all">
                           {isToday(feed.created_at) && <div className="absolute top-5 right-5"><NewBadge/></div>}
                           <div className="pr-10">
                               <p className="text-base font-bold text-slate-800 line-clamp-1 mb-2">{feed.title || feed.content}</p>
                               <div className="flex justify-between items-center">
                                   <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                       <span className="text-slate-700">{feed.author}님</span>
                                       <span className="text-slate-300">|</span>
                                       <span>{new Date(feed.created_at).toLocaleDateString()}</span>
                                   </div>
                                   <div className="flex items-center gap-3">
                                       <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400"><MessageCircle className="w-3.5 h-3.5"/>{feed.comments?.length || 0}</div>
                                       <div className="flex items-center gap-1 text-[11px] font-bold text-red-400"><Heart className="w-3.5 h-3.5 fill-red-400"/>{feed.likes?.length || 0}</div>
                                   </div>
                               </div>
                           </div>
                       </div>
                   )) : <div className="text-center py-6 text-sm text-slate-400 font-bold bg-white/50 rounded-3xl border border-dashed border-slate-200">등록된 글이 없습니다.</div>}
               </div>
            </div>
        );
    };

    return (
      <div className="px-3 py-6 space-y-7 pb-44 animate-fade-in bg-slate-50 min-h-full overflow-x-hidden">
        {/* 출퇴근 및 생일 섹션 */}
        <div className="flex gap-4 h-48">
             <div className="flex-[1.2] bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
                  <div className="mb-4">
                        <h2 className="text-sm font-black text-slate-800 mb-1 flex items-center gap-2">
                            <span className="text-2xl">⏰</span>출퇴근 체크
                            <span className="text-[10px] text-blue-600 font-black bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">각 +20P</span>
                        </h2>
                  </div>
                  <div className="flex-1 flex gap-3">
                     <div className="flex-1 bg-blue-50/50 rounded-3xl p-2.5 border border-blue-50 flex flex-col justify-center gap-2">
                         {mood !== 'checked' ? (
                             <div className="flex flex-col gap-2">
                                 <button onClick={() => handleMoodCheck('good')} className="bg-white hover:bg-blue-100 rounded-2xl w-full flex items-center justify-center py-2 shadow-sm border border-blue-100 gap-2 transition-all active:scale-95"><Smile className="w-5 h-5 text-blue-500"/><span className="text-[12px] font-black text-slate-700">좋음</span></button>
                                 <button onClick={() => handleMoodCheck('normal')} className="bg-white hover:bg-green-100 rounded-2xl w-full flex items-center justify-center py-2 shadow-sm border border-green-100 gap-2 transition-all active:scale-95"><Meh className="w-5 h-5 text-green-500"/><span className="text-[12px] font-black text-slate-700">보통</span></button>
                             </div>
                         ) : (
                             <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-blue-100 shadow-sm animate-pulse">
                                 <span className="text-3xl mb-1">🏢</span>
                                 <span className="text-[12px] font-black text-blue-600">출근 완료</span>
                             </div>
                         )}
                     </div>
                     <button onClick={handleCheckOut} disabled={mood !== 'checked' || hasCheckedOut} className={`flex-1 rounded-3xl flex flex-col items-center justify-center text-[12px] font-black transition-all active:scale-95 ${hasCheckedOut ? 'bg-slate-100 text-slate-300' : (mood !== 'checked' ? 'bg-slate-50 text-slate-200' : 'bg-slate-800 text-white shadow-lg shadow-slate-200')}`}>
                         <span className={`text-3xl mb-1 ${hasCheckedOut ? 'grayscale opacity-30' : ''}`}>{hasCheckedOut ? '🏠' : '🏃'}</span>
                         <span>{hasCheckedOut ? '퇴근 완료' : '퇴근하기'}</span>
                     </button>
                  </div>
            </div>
            <div className="flex-1 h-full"><BirthdayNotifier weeklyBirthdays={weeklyBirthdays} /></div>
        </div>
        
        {/* LED 전광판 */}
        <div className="bg-slate-900 rounded-[2rem] px-5 py-4 shadow-xl border border-slate-800 overflow-hidden relative">
          <style>{`@keyframes ledMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .ledTrack { display: inline-flex; white-space: nowrap; gap: 4rem; animation: ledMarquee 25s linear infinite; }`}</style>
          <div className="text-[13px] font-black text-emerald-400 tracking-wider drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
            <div className="ledTrack"><span>{ledMessage}</span><span>{ledMessage}</span></div>
          </div>
        </div>

        {/* [수정] 나의 활동 섹션 (클릭 시 상세 모달) */}
        <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2"><span>📌</span> 나의 활동</h3>
            <span className="text-[11px] font-bold text-slate-400">항목 클릭 시 상세보기</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'posts', label: '내 게시글', icon: '📝', val: myActivity.posts },
              { key: 'comments', label: '작성 댓글', icon: '💬', val: myActivity.comments },
              { key: 'praises', label: '받은 칭찬', icon: '🥇', val: myActivity.praises },
              { key: 'likes', label: '받은 좋아요', icon: '❤️', val: myActivity.likesGiven }
            ].map(item => (
              <div key={item.key} onClick={() => openActivityDetail(item.key)} className="bg-slate-50 rounded-[1.5rem] p-4 border border-slate-100 flex items-center justify-between cursor-pointer active:scale-95 transition-all hover:bg-slate-100/50">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[13px] font-black text-slate-600">{item.label}</span>
                </div>
                <span className="text-xl font-black text-slate-800">{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 게시판 더보기 연동 섹션 */}
        {renderFeedSection('dept_news', '우리팀 톡톡🏢', 'purple', <Building2 className="w-4 h-4"/>)}
        {renderFeedSection('praise', '칭찬뿜뿜💚', 'green', <Heart className="w-4 h-4 fill-white"/>)}
        {renderFeedSection('knowhow', '꿀팁.zip🧠', 'blue', <Sparkles className="w-4 h-4 fill-white"/>)}
        {renderFeedSection('matjib', '맛집레이더🍜', 'orange', <Utensils className="w-4 h-4 fill-white"/>)}

        <div className="mt-4">
            <div onClick={onNavigateToNews} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="bg-red-50 p-3 rounded-full"><Megaphone className="w-5 h-5 text-red-500"/></div>
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-slate-400 mb-0.5">공지사항</p>
                    <p className="text-base font-bold text-slate-800 truncate">{feeds.find(f => f.type === 'news')?.title || '등록된 공지사항이 없습니다.'}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300"/>
            </div>
        </div>
      </div>
    );
}; 

const FeedTab = ({ feeds, activeFeedFilter, setActiveFeedFilter, onWriteClickWithCategory, currentUser, handleDeletePost, handleLikePost, handleAddComment, handleDeleteComment, boosterActive, selectedPostId, onClearSelection, handleLikeComment }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');

  const filteredFeeds = feeds.filter(f => {
      if (selectedPostId) return f.id === selectedPostId; 
      const matchesFilter = activeFeedFilter === 'all' || f.type === activeFeedFilter;
      const matchesSearch = searchTerm === "" || (f.title?.toLowerCase().includes(searchTerm.toLowerCase()) || f.content?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDept = activeFeedFilter !== 'dept_news' || selectedDeptFilter === 'all' || f.profiles?.dept === selectedDeptFilter;
      return matchesFilter && matchesSearch && matchesDept;
  });

  return (
    <div className="px-3 py-6 space-y-7 pb-44 animate-fade-in bg-slate-50 min-h-full">
      {selectedPostId && (
          <button onClick={onClearSelection} className="w-full bg-slate-800 text-white p-5 rounded-3xl font-black mb-2 flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6"/> 전체 목록으로 돌아가기
          </button>
      )}

      {!selectedPostId && (
      <>
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <Search className="w-6 h-6 text-slate-400" />
          <input type="text" placeholder="검색어를 입력하세요..." className="flex-1 bg-transparent text-base p-1 outline-none font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
        {[{ id: 'all', label: '전체' }, { id: 'praise', label: '칭찬뿜뿜💚' }, { id: 'dept_news', label: '우리팀 톡톡🏢' }, { id: 'knowhow', label: '꿀팁.zip🧠' }, { id: 'matjib', label: '맛집레이더🍜' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveFeedFilter(tab.id)} className={`px-6 py-3 rounded-full text-sm font-black whitespace-nowrap transition-all border shadow-sm ${activeFeedFilter === tab.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'}`}>{tab.label}</button>
        ))}
      </div>

      <div className="flex flex-col items-end gap-2">
          <button onClick={() => onWriteClickWithCategory(null)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-7 py-3 rounded-full shadow-lg font-black text-base flex items-center gap-2 active:scale-95 transform transition-all"><Pencil className="w-5 h-5" />게시글 작성</button>
          <div className="text-[11px] font-black text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">게시글 작성 시 +50P 지급</div>
      </div>
      </>
      )}
      
      <div className="space-y-6">
      {filteredFeeds.map(feed => (
          <div key={feed.id} className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-50 relative">
            {isToday(feed.created_at) && <div className="absolute top-7 right-7"><NewBadge/></div>}
            
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-50">
              <div className="bg-slate-100 p-2.5 rounded-full"><User className="w-6 h-6 text-slate-400"/></div>
              <div>
                  <p className="text-base font-black text-slate-800 flex items-center gap-2">
                      {feed.author}님 <span className="text-sm font-bold text-slate-400">({feed.team})</span>
                  </p>
                  <p className="text-[11px] font-bold text-slate-300">{new Date(feed.created_at).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mb-6">
                <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-[11px] font-black text-slate-500 border border-slate-200 uppercase">{feed.type}</span>
                    {feed.region_main && <span className="px-3 py-1 rounded-lg bg-blue-50 text-[11px] font-black text-blue-500 border border-blue-100">{feed.region_main}</span>}
                </div>
                {feed.title && <h3 className="text-lg font-black text-slate-800 mb-3">{feed.title}</h3>}
                <p className="text-base text-slate-600 leading-relaxed whitespace-pre-wrap">{feed.content}</p>
            </div>
            
            {feed.image_url && <div className="mb-6 rounded-[2rem] overflow-hidden shadow-md border border-slate-100"><img src={feed.image_url} alt="Feed content" className="w-full h-auto" /></div>}
            
            <div className="flex items-center justify-between pt-5 border-t border-slate-50">
              <div className="flex items-center gap-6">
                  <button onClick={() => handleLikePost(feed.id, feed.likes, feed.isLiked)} className={`flex items-center gap-2 text-base font-black transition-all ${feed.isLiked ? 'text-red-500' : 'text-slate-400'}`}><Heart className={`w-6 h-6 ${feed.isLiked ? 'fill-red-500' : ''}`} /> {feed.likes?.length || 0}</button>
                  <div className="flex items-center gap-2 text-base font-black text-slate-400"><MessageCircle className="w-6 h-6" /> {feed.comments?.length || 0}</div>
                  {(currentUser?.id === feed.author_id || currentUser?.role === 'admin') && (
                      <button onClick={() => handleDeletePost(feed.id)} className="text-[12px] text-slate-300 hover:text-red-500 font-bold">글 삭제</button>
                  )}
              </div>
            </div>

            {feed.comments?.length > 0 && (
                <div className="mt-6 space-y-4 pt-6 border-t border-slate-50">
                    {feed.comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 bg-slate-50/50 p-4 rounded-3xl border border-slate-100 group">
                            <CornerDownRight className="w-4 h-4 text-slate-300 mt-1"/>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between mb-1.5">
                                    <p className="text-sm font-black text-slate-700">{comment.profiles?.name} <span className="text-[11px] text-slate-400 font-bold">({comment.profiles?.team})</span></p>
                                    <span className="text-[10px] text-slate-300 font-bold">{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-slate-600 leading-snug mb-3">{comment.content}</p>
                                <div className="flex justify-between items-center">
                                    <button onClick={() => handleLikeComment(comment.id, comment.likes || [], comment.author_id)} className={`flex items-center gap-1.5 text-[11px] font-black transition-all ${comment.likes?.includes(currentUser?.id) ? 'text-red-500' : 'text-slate-400'}`}>
                                        <Heart className={`w-3.5 h-3.5 ${comment.likes?.includes(currentUser?.id) ? 'fill-red-500' : ''}`}/> 좋아요 {comment.likes?.length || 0}
                                    </button>
                                    {(currentUser?.id === comment.author_id || currentUser?.role === 'admin') && (
                                        <button onClick={() => handleDeleteComment(comment.id)} className="text-[10px] text-slate-300 hover:text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">삭제</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <form onSubmit={(e) => handleAddComment(e, feed.id)} className="flex gap-3 mt-6">
                <input name="commentContent" type="text" placeholder="댓글을 남겨주세요..." className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-base font-bold outline-none focus:bg-white focus:border-blue-400 transition-all" required />
                <button type="submit" className="bg-slate-800 text-white px-5 rounded-2xl active:scale-95 transition-all shadow-md"><Send className="w-5 h-5"/></button>
            </form>
          </div>
      ))}
      </div>
    </div>
  );
};

const WriteModal = ({ setShowWriteModal, handlePostSubmit, currentUser, boosterActive, initialCategory, profiles }) => {
  const [writeCategory, setWriteCategory] = useState(initialCategory || ''); 
  const [imagePreview, setImagePreview] = useState(null);
  const [regionMain, setRegionMain] = useState('');
  const [selectedPraiseTarget, setSelectedPraiseTarget] = useState('');

  const categories = [ {id: 'dept_news', label: '우리팀 톡톡🏢'}, {id: 'praise', label: '칭찬하기💚'}, {id: 'matjib', label: '맛집소개🍜'}, {id: 'knowhow', label: '꿀팁.zip🧠'} ];
  if (currentUser?.role === 'admin') categories.push({id: 'news', label: '공지사항 (Admin)'});

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-0 shadow-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="bg-slate-800 p-8 flex justify-between items-center sticky top-0 z-10 text-white">
            <h3 className="text-xl font-black flex items-center gap-2"><Pencil className="w-6 h-6"/> 게시글 작성</h3>
            <button onClick={() => setShowWriteModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-7 h-7" /></button>
        </div>
        <div className="p-8 pb-12">
            <form onSubmit={handlePostSubmit}>
            <div className="mb-8">
                <label className="block text-sm font-black text-slate-500 mb-4 ml-1">게시글 유형 선택</label>
                <input type="hidden" name="category" value={writeCategory} /> 
                <div className="grid grid-cols-2 gap-3">
                    {categories.map((cat) => (
                        <button key={cat.id} type="button" onClick={() => setWriteCategory(cat.id)} className={`p-4 rounded-[1.5rem] text-sm font-black border transition-all ${writeCategory === cat.id ? 'bg-slate-800 text-white border-slate-800 shadow-lg scale-[1.03]' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}>{cat.label}</button>
                    ))}
                </div>
            </div>
            
            <div className="space-y-6 mb-8">
                {writeCategory === 'praise' && (
                    <div className="bg-green-50 p-6 rounded-[2rem] border border-green-100">
                        <label className="text-sm font-black text-green-700 block mb-3">누구를 칭찬할까요?</label>
                        <select name="targetUserId" className="w-full p-4 bg-white border border-green-200 rounded-2xl text-base font-bold outline-none" required>
                            <option value="">직원 선택 (성함/팀)</option>
                            {profiles.filter(p => p.id !== currentUser.id).map(u => <option key={u.id} value={u.id}>{u.name} ({u.team})</option>)}
                        </select>
                    </div>
                )}
                {writeCategory === 'matjib' && (
                    <div className="grid grid-cols-2 gap-3">
                        <select name="regionMain" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold" onChange={(e) => setRegionMain(e.target.value)} required><option value="">시/도</option>{Object.keys(REGIONS).map(r => <option key={r} value={r}>{r}</option>)}</select>
                        <select name="regionSub" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold" disabled={!regionMain} required><option value="">시/군/구</option>{regionMain && REGIONS[regionMain].map(r => <option key={r} value={r}>{r}</option>)}</select>
                    </div>
                )}
                <input name="title" type="text" placeholder="제목을 입력하세요" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-base font-black outline-none focus:bg-white focus:border-blue-400 transition-all shadow-sm" required />
                <textarea name="content" className="w-full h-44 p-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-base font-bold outline-none focus:bg-white focus:border-blue-400 transition-all resize-none shadow-sm" placeholder="내용을 정성껏 작성해주세요..." required></textarea>
                
                <div className="flex items-center gap-4">
                    <label className="cursor-pointer flex items-center justify-center w-28 h-28 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-blue-400 transition-all group">
                        <div className="text-center group-hover:scale-105 transition-transform"><ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-1" /><span className="text-[11px] text-slate-400 font-black">사진 추가</span></div>
                        <input type="file" name="file" accept="image/*" onChange={(e) => setImagePreview(URL.createObjectURL(e.target.files[0]))} className="hidden" />
                    </label>
                    {imagePreview && (
                        <div className="w-28 h-28 rounded-[2rem] overflow-hidden border border-slate-200 relative group"><img src={imagePreview} className="w-full h-full object-cover" /><button type="button" onClick={() => setImagePreview(null)} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-8 h-8"/></button></div>
                    )}
                </div>
            </div>
            <button type="submit" disabled={!writeCategory} className="w-full bg-slate-800 text-white p-6 rounded-[2rem] text-lg font-black hover:bg-slate-900 shadow-2xl transition-all active:scale-95 disabled:bg-slate-200">글 등록하고 포인트 받기 (+50P)</button>
            </form>
        </div>
      </div>
    </div>
  );
};

// --- [수정] 메인 App 컴포넌트 ---
export default function App() {
  const [supabase, setSupabase] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [pointHistory, setPointHistory] = useState([]);
  const [allPointHistory, setAllPointHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [activeFeedFilter, setActiveFeedFilter] = useState('all');
  const [mood, setMood] = useState(null);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [writeCategory, setWriteCategory] = useState(null);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', emoji: '' });
  const [activityModal, setActivityModal] = useState({ show: false, title: '', list: [], type: '' });
  const [boosterActive, setBoosterActive] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    setSupabase(client);
    client.auth.getSession().then(({ data: { session } }) => { if (session) fetchUserData(session.user.id); });
    client.auth.onAuthStateChange((_event, session) => { if (session) fetchUserData(session.user.id); else setCurrentUser(null); });
    fetchFeeds(client); fetchProfiles(client); fetchAllPointHistory(client);
  }, []);

  const fetchUserData = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
        setCurrentUser(data);
        const todayStr = new Date().toISOString().split('T')[0];
        if (data.last_attendance === todayStr) setMood('checked');
        if (localStorage.getItem(`checkout_${userId}_${todayStr}`)) setHasCheckedOut(true);
        fetchPointHistory(userId);
    }
  };

  const fetchPointHistory = async (userId) => { const { data } = await supabase.from('point_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (data) setPointHistory(data); };
  const fetchAllPointHistory = async (client = supabase) => { const { data } = await client.from('point_history').select('*'); if (data) setAllPointHistory(data); };
  const fetchProfiles = async (client = supabase) => { const { data } = await client.from('profiles').select('*'); if (data) setProfiles(data); };
  
  const fetchFeeds = async (client = supabase) => {
    const { data: posts } = await client.from('posts').select(`*, profiles (*), comments (*, profiles (*))`).order('created_at', { ascending: false });
    if (posts) {
        const formatted = posts.map(p => ({
            ...p,
            author: p.profiles?.name || '익명',
            team: p.profiles?.team || '소속미정',
            isLiked: p.likes?.includes(currentUser?.id),
            comments: p.comments?.sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
        }));
        setFeeds(formatted);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: e.target.email.value, password: e.target.password.value });
    if (error) alert('로그인 정보를 확인해주세요.');
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault(); setLoading(true);
    const { name, email, password, dept, team, birthdate } = e.target;
    const emailVal = email.value.toLowerCase();
    
    // [수정] 가입 제한 정책 반영
    if (emailVal.endsWith('@axa.co.kr') && emailVal !== 'jongpil.kim@axa.co.kr') {
        alert("⚠️ 회사 이메일(@axa.co.kr)은 보안 정책상 가입이 제한됩니다.\n개인 이메일(네이버, 지메일 등)로 가입해주세요.");
        setLoading(false); return;
    }
    
    const initialData = { name: name.value, dept: dept.value, team: team.value, role: 'member', points: INITIAL_POINTS, birthdate: birthdate.value, email: emailVal };
    const { data: auth, error } = await supabase.auth.signUp({ email: emailVal, password: password.value, options: { data: initialData } });
    if (error) alert(error.message);
    else {
        await supabase.from('point_history').insert({ user_id: auth.user.id, reason: '최초 가입 포인트', amount: INITIAL_POINTS, type: 'earn' });
        alert('가입 완료! 로그인해주세요.'); setIsSignupMode(false);
    }
    setLoading(false);
  };

  // [수정] 출근 기분 선택 로직
  const handleMoodCheck = async (selectedMood) => {
    if (mood === 'checked') return;
    setMood('checked'); // UI 즉시 반영
    const pts = 20;
    setToast({ visible: true, message: `기분 좋게 출근하셨네요!\n(+${pts}P 지급 완료)`, emoji: "🚀" });
    setTimeout(() => setToast({ visible: false }), 3000);
    
    const todayStr = new Date().toISOString().split('T')[0];
    await supabase.from('profiles').update({ points: currentUser.points + pts, last_attendance: todayStr }).eq('id', currentUser.id);
    await supabase.from('point_history').insert({ user_id: currentUser.id, reason: '출근체크', amount: pts, type: 'earn' });
    fetchUserData(currentUser.id);
  };

  const handleCheckOut = async () => {
      setHasCheckedOut(true);
      const pts = 20;
      setToast({ visible: true, message: `오늘도 수고 많으셨습니다!\n(+${pts}P 지급 완료)`, emoji: "🏠" });
      setTimeout(() => setToast({ visible: false }), 3000);
      const todayStr = new Date().toISOString().split('T')[0];
      localStorage.setItem(`checkout_${currentUser.id}_${todayStr}`, 'true');
      await supabase.from('profiles').update({ points: currentUser.points + pts }).eq('id', currentUser.id);
      await supabase.from('point_history').insert({ user_id: currentUser.id, reason: '퇴근체크', amount: pts, type: 'earn' });
      fetchUserData(currentUser.id);
  };

  // [수정] 나의 활동 클릭 시 상세 리스트 팝업
  const openActivityDetail = (type) => {
      let list = [];
      let title = "";
      switch(type) {
          case 'posts': title = "내가 쓴 게시글"; list = feeds.filter(f => f.author_id === currentUser.id); break;
          case 'comments': title = "작성한 댓글 목록"; list = feeds.flatMap(f => f.comments.filter(c => c.author_id === currentUser.id)); break;
          case 'praises': title = "내가 받은 칭찬"; list = feeds.filter(f => f.type === 'praise' && f.target_name === currentUser.name); break;
          case 'likes': title = "좋아요 받은 게시글"; list = feeds.filter(f => f.author_id === currentUser.id && f.likes?.length > 0); break;
      }
      setActivityModal({ show: true, title, list, type });
  };

  // [수정] 댓글 좋아요 시스템
  const handleLikeComment = async (commentId, currentLikes, authorId) => {
      const isLiked = currentLikes.includes(currentUser.id);
      const newLikes = isLiked ? currentLikes.filter(id => id !== currentUser.id) : [...currentLikes, currentUser.id];
      await supabase.from('comments').update({ likes: newLikes }).eq('id', commentId);
      if (!isLiked && authorId !== currentUser.id) {
          const { data: author } = await supabase.from('profiles').select('points').eq('id', authorId).single();
          await supabase.from('profiles').update({ points: author.points + 2 }).eq('id', authorId);
          await supabase.from('point_history').insert({ user_id: authorId, reason: '댓글 좋아요 보너스', amount: 2, type: 'earn' });
      }
      fetchFeeds();
  };

  const handlePostSubmit = async (e) => {
      e.preventDefault();
      const cat = e.target.category.value;
      const { data: post } = await supabase.from('posts').insert({
          title: e.target.title.value, content: e.target.content.value, type: cat, author_id: currentUser.id,
          region_main: e.target.regionMain?.value, target_name: e.target.targetUserId ? profiles.find(p => p.id === e.target.targetUserId.value).name : null, likes: []
      }).select().single();
      
      await supabase.from('profiles').update({ points: currentUser.points + 50 }).eq('id', currentUser.id);
      await supabase.from('point_history').insert({ user_id: currentUser.id, reason: '게시글 작성', amount: 50, type: 'earn' });
      setShowWriteModal(false); fetchFeeds(); fetchUserData(currentUser.id);
  };

  const handleLikePost = async (postId, currentLikes, isLiked) => {
      const newLikes = isLiked ? currentLikes.filter(id => id !== currentUser.id) : [...currentLikes, currentUser.id];
      await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);
      fetchFeeds();
  };

  const handleAddComment = async (e, postId) => {
      e.preventDefault();
      await supabase.from('comments').insert({ post_id: postId, author_id: currentUser.id, content: e.target.commentContent.value, likes: [] });
      e.target.reset(); fetchFeeds();
  };

  const handleDeletePost = async (id) => { if(window.confirm('삭제하시겠습니까?')) { await supabase.from('posts').delete().eq('id', id); fetchFeeds(); } };
  const handleDeleteComment = async (id) => { if(window.confirm('삭제하시겠습니까?')) { await supabase.from('comments').delete().eq('id', id); fetchFeeds(); } };

  const myActivity = useMemo(() => {
      const myId = currentUser?.id;
      return {
          posts: feeds.filter(f => f.author_id === myId).length,
          comments: feeds.flatMap(f => f.comments?.filter(c => c.author_id === myId)).length,
          praises: feeds.filter(f => f.type === 'praise' && f.target_name === currentUser?.name).length,
          likesGiven: feeds.filter(f => f.author_id === myId && f.likes?.length > 0).length
      };
  }, [feeds, currentUser]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans tracking-tight">
      {!currentUser ? (
        <AuthForm isSignupMode={isSignupMode} setIsSignupMode={setIsSignupMode} handleLogin={handleLogin} handleSignup={handleSignup} loading={loading} />
      ) : (
        <div className="max-w-md mx-auto h-screen flex flex-col bg-white shadow-2xl relative overflow-hidden">
          <Header currentUser={currentUser} onOpenUserInfo={() => setShowUserInfoModal(true)} handleLogout={() => supabase.auth.signOut()} boosterActive={boosterActive} />
          
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'home' && (
                <HomeTab 
                  mood={mood} handleMoodCheck={handleMoodCheck} handleCheckOut={handleCheckOut} hasCheckedOut={hasCheckedOut}
                  feeds={feeds} onNavigateToFeed={(t, id) => { setActiveTab('feed'); setActiveFeedFilter(t); setSelectedPostId(id); }}
                  weeklyBirthdays={getWeeklyBirthdays(profiles)} boosterActive={boosterActive} currentUser={currentUser} 
                  openActivityDetail={openActivityDetail} myActivity={myActivity} handleTabChange={setActiveTab} setActiveFeedFilter={setActiveFeedFilter}
                />
            )}
            {activeTab === 'feed' && (
                <FeedTab 
                  feeds={feeds} activeFeedFilter={activeFeedFilter} setActiveFeedFilter={setActiveFeedFilter}
                  onWriteClickWithCategory={() => setShowWriteModal(true)} currentUser={currentUser} 
                  handleDeletePost={handleDeletePost} handleLikePost={handleLikePost} handleAddComment={handleAddComment}
                  handleDeleteComment={handleDeleteComment} selectedPostId={selectedPostId} onClearSelection={() => setSelectedPostId(null)}
                  handleLikeComment={handleLikeComment}
                />
            )}
          </main>

          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} onFabClick={() => setShowWriteModal(true)} />
          
          {showWriteModal && <WriteModal setShowWriteModal={setShowWriteModal} handlePostSubmit={handlePostSubmit} currentUser={currentUser} profiles={profiles} />}
          {activityModal.show && <ActivityDetailModal title={activityModal.title} list={activityModal.list} type={activityModal.type} onClose={() => setActivityModal({ ...activityModal, show: false })} />}
          <MoodToast visible={toast.visible} message={toast.message} emoji={toast.emoji} />
        </div>
      )}
    </div>
  );
}

// --- 하단 네비게이션 ---
const BottomNav = ({ activeTab, onTabChange, onFabClick }) => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 p-0 z-30 shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-20 relative">
          <button onClick={() => onTabChange('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400'}`}><Home/><span className="text-[10px] font-black">홈</span></button>
          <button onClick={() => onTabChange('feed')} className={`flex flex-col items-center gap-1 ${activeTab === 'feed' ? 'text-blue-600' : 'text-slate-400'}`}><MessageCircle/><span className="text-[10px] font-black">게시판</span></button>
          <div className="h-full flex items-center justify-center">
              <button onClick={onFabClick} className="absolute -top-6 bg-blue-600 text-white w-16 h-16 rounded-full shadow-xl flex items-center justify-center border-4 border-white active:scale-95 transition-all"><Plus className="w-8 h-8"/></button>
          </div>
          <button onClick={() => onTabChange('ranking')} className={`flex flex-col items-center gap-1 ${activeTab === 'ranking' ? 'text-blue-600' : 'text-slate-400'}`}><Award/><span className="text-[10px] font-black">랭킹</span></button>
          <button onClick={() => onTabChange('news')} className={`flex flex-col items-center gap-1 ${activeTab === 'news' ? 'text-blue-600' : 'text-slate-400'}`}><Bell/><span className="text-[10px] font-black">알림</span></button>
      </div>
    </div>
);

// --- 생일 알림 ---
const BirthdayNotifier = ({ weeklyBirthdays }) => (
    <div className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-slate-100 h-full flex flex-col">
        <h3 className="font-black text-[13px] mb-4 text-slate-800 flex items-center gap-2">🎂 생일자</h3>
        <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
            {weeklyBirthdays.current.length > 0 ? weeklyBirthdays.current.map((b, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-pink-50 rounded-2xl border border-pink-100"><div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm">🍰</div><div><p className="text-[12px] font-black text-slate-700">{b.name}님</p><p className="text-[10px] text-pink-500 font-bold">오늘 생일!</p></div></div>
            )) : <div className="h-full flex items-center justify-center text-slate-300 text-[11px] font-bold">생일자 없음</div>}
        </div>
    </div>
);