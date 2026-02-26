import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
 User, Heart, MessageCircle, Gift, Bell, Sparkles, Smile, Frown, Meh, Megaphone, X, Send,
  Settings, ChevronRight, LogOut, Image as ImageIcon, Coins, Pencil, Trash2, Loader2, Lock,
  Clock, Award, Wallet, Building2, CornerDownRight, Link as LinkIcon, MapPin, Search, Key,
  Edit3, ClipboardList, CheckSquare, ChevronLeft, Zap, Users, Briefcase, Utensils, ThumbsUp,
  Coffee, Sun, Moon, PlusCircle, CheckCircle, Plug, MinusCircle, Medal, Plus, Home, ArrowRight,
  Copy, Info
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

const INITIAL_POINTS = 1000;

const MOTTO_365 = [
  '시작이 반이다, 일단 해보자!', 
  '작은 습관이 모여 큰 성공을 만든다.', 
  '꾸준함은 모든 것을 이긴다.', 
  '실패는 성장을 위한 디딤돌일 뿐이다.', 
  '오늘 하루도 당신의 멋진 성장을 응원합니다!', 
  '비교의 대상은 어제의 나 자신이어야 한다.', 
  '할 수 있다고 믿으면 이미 절반은 이룬 것이다.', 
  '긍정적인 생각은 긍정적인 결과를 가져온다.', 
  '모든 성취의 시작은 시도하려는 결심이다.', 
  '작은 변화가 결국 큰 차이를 만들어낸다.', 
  '완벽하지 않아도 괜찮아, 앞으로 나아가는 게 중요해.', 
  '기회는 준비된 자에게 찾아온다.', 
  '노력은 결코 배신하지 않는다.', 
  '오늘의 작은 노력이 내일의 큰 기적을 만든다.', 
  '늦었다고 생각할 때가 가장 빠른 때다.', 
  '스스로를 믿어라, 당신은 충분히 강하다.', 
  '어제보다 한 걸음만 더 나아가자.', 
  '흔들리지 않고 피는 꽃은 없다.', 
  '어려움 속에는 항상 기회가 숨어있다.', 
  '가장 빛나는 별은 아직 발견되지 않았다.', 
  '당신의 열정이 당신의 미래를 결정한다.', 
  '포기하지 않으면 결국 길은 열린다.', 
  '오늘의 웃음이 내일의 에너지가 된다.', 
  '모든 위대한 일은 작은 시작에서 비롯된다.', 
  '당신은 당신이 생각하는 것보다 훨씬 대단한 사람이다.', 
  '매일매일이 새로운 기회이다.', 
  '당신의 오늘을 사랑하라, 그리고 내일을 기대하라.',
  '지금 흘린 땀방울이 미래의 웃음꽃이 된다.',
  '오늘 걷지 않으면 내일은 뛰어야 한다.',
  '스스로 한계를 정하지 마라, 무한한 가능성이 있다.'
];

// --- Custom Logo Component ---
const ConnectHubLogo = ({ size = "md" }) => {
    // 사이즈 분기 세분화 (sm 추가)
    const sizeClasses = size === "lg" ? "w-16 h-16" : size === "md" ? "w-10 h-10" : "w-7 h-7";
    const iconSize = size === "lg" ? "w-16 h-16" : size === "md" ? "w-10 h-10" : "w-7 h-7";
    const subIconSize = size === "lg" ? "w-6 h-6" : size === "md" ? "w-4 h-4" : "w-3 h-3";
    
    return (
        <div className={`relative flex items-center justify-center ${sizeClasses}`}>
            <MessageCircle className={`${iconSize} text-blue-700 fill-blue-100 absolute`} strokeWidth={1.5} />
            <Smile className={`${size === "lg" ? "w-8 h-8" : size === "md" ? "w-5 h-5" : "w-3.5 h-3.5"} text-blue-900 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`} strokeWidth={2} />
            <Heart className={`${subIconSize} text-[#C60C30] fill-[#C60C30] absolute -top-1 -right-1 z-10 animate-pulse`} />
        </div>
    );
};

// --- Helper Functions ---
const formatName = (name) => {
  if (!name) return '';
  if (/[가-힣]{2,}/.test(name)) return name.substring(1); 
  return name; 
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
             normalizedBirthDate = normalizeDate(new Date(currentYear + 1, m - 1, d));
        }
        const typeLabel = '(양력)'; 
        if (normalizedBirthDate.getTime() === normalizedToday.getTime()) {
             todayBirthdays.push({ id: p.id, name: p.name, team: p.team, date: `${m}/${d}`, typeLabel });
        } else if (normalizedBirthDate.getTime() === normalizedTomorrow.getTime()) {
             tomorrowBirthdays.push({ id: p.id, name: p.name, team: p.team, date: `${m}/${d}`, typeLabel });
        }
    });
    return { current: todayBirthdays, next: tomorrowBirthdays };
};

const isToday = (timestamp) => {
    if (!timestamp) return false;
    const date = new Date(timestamp);
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

const getPrevMonthRankers = (feeds, profiles) => {
    const now = new Date();
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const pm = prevMonthDate.getMonth();
    const py = prevMonthDate.getFullYear();

    const isPrevMonth = (dateStr) => {
        const d = new Date(dateStr);
        return d.getMonth() === pm && d.getFullYear() === py;
    };

    const postCounts = {};
    const likeCounts = {};
    feeds.filter(f => isPrevMonth(f.created_at)).forEach(f => {
        postCounts[f.author_id] = (postCounts[f.author_id] || 0) + 1;
        const count = Array.isArray(f.likes) ? f.likes.length : 0;
        likeCounts[f.author_id] = (likeCounts[f.author_id] || 0) + count;
    });
    const topPosts = Object.entries(postCounts).sort((a,b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);
    const topLikes = Object.entries(likeCounts).sort((a,b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);
    return { topPosts, topLikes };
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

const NewBadge = () => (<div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-sm ring-2 ring-white">N</div>);

const AdminGrantPopup = ({ grants, onClose }) => {
    const total = grants.reduce((acc, curr) => acc + curr.amount, 0);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative text-center">
                <button onClick={onClose} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100"><X className="w-5 h-5" /></button>
                <div className="text-5xl mb-4 animate-bounce">🎉</div>
                <h3 className="text-xl font-black text-slate-800 mb-2">관리자 포인트 지급</h3>
                <p className="text-base text-slate-500 mb-8">관리자로부터 특별 포인트가 도착했습니다!</p>
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 mb-8">
                    <span className="text-3xl font-black text-blue-600 flex items-center justify-center gap-2">
                        <Coins className="w-8 h-8 fill-blue-500 text-blue-600"/> +{total.toLocaleString()} P
                    </span>
                </div>
                <button onClick={onClose} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg transition-all text-base">감사합니다!</button>
            </div>
        </div>
    );
};

const AdminAlertModal = ({ onClose }) => {
    const [doNotShow, setDoNotShow] = useState(false);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl relative border border-slate-100">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-red-500"><Bell className="w-5 h-5"/> 알림</h3>
                <p className="text-base text-slate-600 mb-6 leading-relaxed">📢 <strong>처리되지 않은 포인트 차감 신청</strong>이 있습니다.<br/>설정 메뉴에서 확인해주세요.</p>
                <div className="flex items-center gap-2 mb-4 bg-slate-50 p-3 rounded-xl cursor-pointer hover:bg-slate-100" onClick={() => setDoNotShow(!doNotShow)}>
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${doNotShow ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'}`}>{doNotShow && <CheckSquare className="w-3.5 h-3.5 text-white" />}</div>
                    <span className="text-sm text-slate-500 select-none font-medium">오늘 하루 그만 보기</span>
                </div>
                <button onClick={() => onClose(doNotShow)} className="w-full bg-slate-800 text-white p-4 rounded-2xl font-bold hover:bg-slate-900 transition-colors shadow-lg">확인</button>
            </div>
        </div>
    );
};

const GiftNotificationModal = ({ onClose, gifts }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative text-center">
                <button onClick={onClose} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100"><X className="w-5 h-5" /></button>
                <div className="text-5xl mb-4 animate-bounce">🎁</div>
                <h3 className="text-xl font-black text-slate-800 mb-2">포인트 선물이 도착했어요!</h3>
                <p className="text-base text-slate-500 mb-6">동료들이 보낸 따뜻한 마음을 확인해보세요.</p>
                <div className="space-y-3 mb-8 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {gifts.map((gift, idx) => (
                        <div key={idx} className="bg-pink-50 p-4 rounded-2xl border border-pink-100 flex justify-between items-center shadow-sm">
                            <span className="text-sm font-bold text-slate-700">{gift.reason.replace('선물 받음 (', '').replace(')', '')}님</span>
                            <span className="text-base font-black text-pink-500">+{gift.amount.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="w-full bg-pink-500 text-white p-4 rounded-2xl font-bold hover:bg-pink-600 shadow-lg transition-all text-base">감사히 받겠습니다!</button>
            </div>
        </div>
    );
};

const MyActivityModal = ({ onClose, type, feeds, currentUser }) => {
    const filteredItems = useMemo(() => {
        if (!currentUser) return [];
        switch(type) {
            case 'posts':
                return feeds.filter(f => f.author_id === currentUser.id);
            case 'comments':
                return feeds.flatMap(f => (f.comments || []).map(c => ({...c, post_title: f.title || f.content, post_id: f.id}))).filter(c => c.author_id === currentUser.id);
            case 'praises':
                return feeds.filter(f => f.type === 'praise' && f.content.includes(currentUser.name));
            case 'receivedLikes':
                return feeds.filter(f => f.author_id === currentUser.id && f.likes && f.likes.length > 0);
            case 'likedPosts':
                return feeds.filter(f => Array.isArray(f.likes) && f.likes.includes(currentUser.id));
            default: return [];
        }
    }, [type, feeds, currentUser]);

    const titleMap = { 
        'posts': '내 글', 
        'comments': '작성한 댓글', 
        'praises': '받은 칭찬', 
        'receivedLikes': '받은 좋아요',
        'likedPosts': '내가 좋아요 한 글'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl relative h-[70vh] flex flex-col">
                <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">{titleMap[type]} <span className="text-blue-500">{filteredItems.length}</span></h3>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {filteredItems.length > 0 ? filteredItems.map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm">
                            {type === 'posts' && <p className="font-bold text-slate-700 line-clamp-2">{item.title || item.content}</p>}
                            {type === 'comments' && (
                                <>
                                <p className="font-medium text-slate-600 mb-1">"{item.content}"</p>
                                <p className="text-xs text-slate-400">원문: {item.post_title}</p>
                                </>
                            )}
                            {type === 'praises' && <p className="font-medium text-slate-600 line-clamp-2">{item.content}</p>}
                            {type === 'receivedLikes' && (
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-slate-700 truncate w-2/3">{item.title || item.content}</p>
                                    <div className="flex items-center gap-1 text-red-500 font-bold"><Heart className="w-4 h-4 fill-red-500"/> {item.likes.length}</div>
                                </div>
                            )}
                            {type === 'likedPosts' && (
                                <div>
                                    <p className="text-xs text-slate-400 mb-0.5">{item.author}님의 글</p>
                                    <p className="font-bold text-slate-700 line-clamp-2">{item.title || item.content}</p>
                                </div>
                            )}
                            <p className="text-xs text-slate-400 mt-2 text-right">{new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                    )) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">내역이 없습니다.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AuthForm = ({ isSignupMode, setIsSignupMode, handleLogin, handleSignup, loading }) => {
  const [birthdate, setBirthdate] = useState('1980-01-01');
  const [selectedDept, setSelectedDept] = useState('');
  const [email, setEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 to-indigo-50 flex justify-center items-center p-1 sm:p-2">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-3 border border-white/50 animate-fade-in relative backdrop-blur-xl flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl"></div>
        
               {isSignupMode ? (
          <form onSubmit={handleSignup} className="space-y-0.5 flex flex-col">
            <div>
                <label className="block text-[9px] font-bold text-slate-600 mb-0 ml-1">이름</label>
                <input name="name" type="text" placeholder="홍길동" className="w-full px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md outline-none text-[10px] focus:border-blue-500 focus:bg-white transition-all shadow-sm" required />
            </div>
            <div>
                <label className="block text-[9px] font-bold text-slate-600 mb-0 ml-1">이메일</label>
                <input name="email" type="email" placeholder="개인 메일로 입력" className="w-full px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md outline-none text-[10px] focus:border-blue-500 focus:bg-white transition-all shadow-sm" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <p className="text-[8px] text-red-500 mt-0 ml-1 font-bold leading-none">* @axa.co.kr 등 사내 메일은 가입 불가</p>
            </div>
            <div>
                <label className="block text-[9px] font-bold text-slate-600 mb-0 ml-1">생년월일 (양력)</label>
                <input name="birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="w-full px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md outline-none text-[10px] text-slate-600 focus:border-blue-500 focus:bg-white transition-all shadow-sm" required />
            </div>
            <div>
                <label className="block text-[9px] font-bold text-slate-600 mb-0 ml-1">비밀번호</label>
                <input name="password" type="password" placeholder="숫자 6자리 이상" className="w-full px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md outline-none text-[10px] focus:border-blue-500 focus:bg-white transition-all shadow-sm" required minLength="6" />
            </div>
            
            {/* 소속 선택 영역: 패딩/마진 축소 */}
            <div className="bg-slate-50 p-0.5 rounded-md border border-slate-100 shadow-inner mt-0.5">
              <div className="grid grid-cols-2 gap-1">
                <select name="dept" className="w-full px-1 py-0.5 bg-white border border-slate-200 rounded-sm outline-none text-[9px] text-slate-700 shadow-sm" onChange={(e) => setSelectedDept(e.target.value)} required><option value="">본부/부문</option>{Object.keys(ORGANIZATION).map(dept => <option key={dept} value={dept}>{dept}</option>)}</select>
                <select name="team" className="w-full px-1 py-0.5 bg-white border border-slate-200 rounded-sm outline-none text-[9px] text-slate-700 shadow-sm" disabled={!selectedDept} required><option value="">팀/센터</option>{selectedDept && ORGANIZATION[selectedDept].map(team => <option key={team} value={team}>{team}</option>)}</select>
              </div>
            </div>

            {/* 안내 및 동의 영역: 패딩/마진 축소 */}
            <div className="bg-slate-100 p-1 rounded-md border border-slate-200 mt-0.5">
                <div className="flex items-start gap-1 mb-0.5">
                    <Info className="w-2.5 h-2.5 text-slate-500 flex-shrink-0" />
                    <p className="text-[8px] text-slate-600 leading-none">
                        <strong>개인정보(주민번호, 번호 등) 및 대외비</strong> 절대 공유 금지
                    </p>
                </div>
                <label className="flex items-center gap-1 cursor-pointer mt-0.5 bg-white p-0.5 rounded-sm border border-slate-200 hover:bg-blue-50 transition-colors">
                    <input type="checkbox" className="w-2.5 h-2.5 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                    <span className="text-[8px] font-bold text-slate-700 leading-none">위 내용을 확인하였으며 동의합니다.</span>
                </label>
            </div>

            <div className="pt-0.5 flex flex-col gap-0.5">
              <button 
                  type="submit" 
                  disabled={loading || !agreedToTerms} 
                  className="w-full bg-blue-600 text-white py-1 rounded-md text-[10px] font-black hover:bg-blue-700 shadow-md transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none flex justify-center items-center gap-1"
              >
                  {loading ? <Loader2 className="animate-spin w-3 h-3" /> : '가입 완료 (1,000P 지급)'}
              </button>
              <button 
                  type="button" 
                  onClick={() => setIsSignupMode(false)} 
                  className="w-full text-slate-400 text-[9px] py-0.5 hover:text-blue-600 transition-colors font-medium"
              >
                  로그인으로 돌아가기
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2 flex flex-col mt-1">
            <form onSubmit={handleLogin} className="space-y-1.5">
              <div>
                  <label className="block text-[9px] font-bold text-slate-600 mb-0 ml-1">이메일</label>
                  <input name="email" type="text" placeholder="이메일 입력" className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md outline-none text-[10px] focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
              </div>
              <div>
                  <label className="block text-[9px] font-bold text-slate-600 mb-0 ml-1">비밀번호</label>
                  <input name="password" type="password" placeholder="비밀번호 (숫자 6자리 이상)" className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md outline-none text-[10px] focus:border-blue-500 focus:bg-white transition-all shadow-sm" required minLength="6" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-1.5 rounded-md text-[10px] font-bold hover:bg-blue-700 shadow-md transition-all active:scale-[0.98] disabled:bg-blue-300 flex justify-center mt-1">
                  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : '🚀 로그인'}
              </button>
            </form>
            <div className="text-center pt-0.5">
                <button onClick={() => setIsSignupMode(true)} className="text-slate-500 text-[10px] font-bold hover:text-blue-600 underline transition-colors">
                    회원 가입
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Header = ({ currentUser, memberCount, onOpenUserInfo, handleLogout, onOpenChangeDept, onOpenChangePwd, onOpenAdminGrant, onOpenRedemptionList, onOpenGift, onOpenAdminManage, onOpenAdminClawback, boosterActive }) => {
  const todayDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const [showSettings, setShowSettings] = useState(false);
  
  const handleInvite = () => {
      const url = "15661566.up.railway.app";
      navigator.clipboard.writeText(url).then(() => {
          alert("초대 주소가 복사되었습니다!\n동료들에게 공유해주세요 🚀\n" + url);
      }).catch(err => {
          console.error('복사 실패', err);
      });
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl px-2 pt-6 pb-5 sticky top-0 z-40 border-b border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2 pl-1">
              <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg">
                  <Users className="w-3 h-3" /> 멤버 {memberCount}명
              </div>
              <button onClick={handleInvite} className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg flex items-center gap-1 hover:bg-blue-100 transition-colors">
                  <Copy className="w-3 h-3" /> 초대하기
              </button>
          </div>
          
          <div className="flex items-center gap-2">
            {boosterActive && (
                <div className="bg-red-50 text-[#C60C30] px-2.5 py-1 rounded-full font-black whitespace-nowrap flex items-center gap-1 shadow-sm border border-red-200">
                <span className="text-sm leading-none">⚡</span><span className="text-[10px] leading-none">X2배</span>
                </div>
            )}
            <div className="text-[10px] bg-[#C60C30] text-white px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-md">
                <User className="w-3 h-3" />
                {currentUser && <span>{currentUser.team} - {currentUser.name} 님</span>}
            </div>
          </div>
      </div>
      
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2 relative mt-1">
            <ConnectHubLogo size="md" />
            <div className="flex flex-col relative leading-none">
                <div className="flex justify-between items-center w-full">
                    <span className="text-xl font-black text-slate-800 tracking-tighter">Connect</span>
                </div>
                <span className="text-xl font-black text-slate-800 tracking-tighter -mt-2">HUB</span>
            </div>
        </div>
        
        <div className="flex items-center gap-2 relative">
          <div className="flex items-center gap-2 mr-1 cursor-pointer group" onClick={onOpenUserInfo}>
             <div className="flex flex-col items-center leading-none relative">
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center leading-none">
                  <span className="text-[11px] text-slate-600 font-black whitespace-nowrap mb-1">My CARE Point</span>
                  <div className="flex items-center gap-1.5 bg-amber-200 px-3 py-1.5 rounded-xl shadow-md border border-amber-300 ring-2 ring-amber-400/40 motion-safe:animate-pulse">
                    <Coins className="w-4 h-4 text-amber-900 fill-amber-900"/>
                    <span className="text-2xl font-black text-amber-950 tracking-tight">{currentUser?.points?.toLocaleString()}</span>
                    <span className="text-[11px] font-black text-amber-800">P</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button onClick={onOpenGift} className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 border-2 border-red-400 transition-all shadow-sm active:scale-95 flex items-center justify-center">
            <span className="text-xl leading-none">🎁</span>
          </button>

          <div className="flex flex-col items-center">
              <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors relative z-40 border border-slate-100 shadow-sm active:scale-95"><Settings className="w-5 h-5 text-slate-600" /></button>
          </div>
          
          {showSettings && (
             <div className="absolute right-0 top-full mt-3 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in-up origin-top-right">
                <div className="p-2">
                    <button onClick={() => { setShowSettings(false); onOpenChangeDept(); }} className="flex items-center gap-3 w-full p-3 text-xs text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"><Edit3 className="w-4 h-4 text-blue-500"/> 소속/팀 변경</button>
                    <button onClick={() => { setShowSettings(false); onOpenChangePwd(); }} className="flex items-center gap-3 w-full p-3 text-xs text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"><Key className="w-4 h-4 text-blue-500"/> 비밀번호 변경</button>
                </div>
                {currentUser?.role === 'admin' && (
                    <div className="border-t border-slate-100 p-2 bg-slate-50/50">
                    <button onClick={() => { setShowSettings(false); onOpenAdminManage(); }} className="flex items-center gap-3 w-full p-3 text-xs text-slate-800 font-bold hover:bg-white rounded-xl transition-colors"><Users className="w-4 h-4 text-slate-600"/> 사용자/이벤트 관리</button>
                    <button onClick={() => { setShowSettings(false); onOpenAdminGrant(); }} className="flex items-center gap-3 w-full p-3 text-xs text-blue-600 font-bold hover:bg-blue-50 rounded-xl transition-colors"><Gift className="w-4 h-4 text-blue-500"/> 포인트 지급 (관리자)</button>
                    <button onClick={() => { setShowSettings(false); onOpenAdminClawback(); }} className="flex items-center gap-3 w-full p-3 text-xs text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors"><MinusCircle className="w-4 h-4 text-red-500"/> 포인트 환수 (관리자)</button>
                    <button onClick={() => { setShowSettings(false); onOpenRedemptionList(); }} className="flex items-center gap-3 w-full p-3 text-xs text-purple-600 font-bold hover:bg-purple-50 rounded-xl transition-colors"><ClipboardList className="w-4 h-4 text-purple-500"/> 포인트 차감 신청 관리</button>
                    </div>
                )}
                <div className="border-t border-slate-100 p-2">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-xs text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold"><LogOut className="w-4 h-4"/> 로그아웃</button>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChangeDeptModal = ({ onClose, onSave }) => { 
    const [dept, setDept] = useState(''); 
    const [team, setTeam] = useState(''); 
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Building2 className="w-5 h-5 text-slate-800"/> 소속 변경</h3>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 ml-1">대분류: 본부/부서</label>
                        <select className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none focus:border-blue-500 transition-colors" onChange={(e) => setDept(e.target.value)}>
                            <option value="">본부/부서 선택</option>
                            {Object.keys(ORGANIZATION).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 ml-1">소분류: 팀/센터</label>
                        <select className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none focus:border-blue-500 transition-colors" disabled={!dept} onChange={(e) => setTeam(e.target.value)}>
                            <option value="">팀/센터 선택</option>
                            {dept && ORGANIZATION[dept].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <button onClick={() => onSave(dept, team)} disabled={!dept || !team} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-colors shadow-lg mt-2">변경 저장</button>
                </div>
            </div>
        </div>
    ); 
};

const ChangePasswordModal = ({ onClose, onSave }) => { 
    const [password, setPassword] = useState(''); 
    const isValid = password.length >= 6 && /^\d+$/.test(password); 
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Key className="w-5 h-5 text-slate-800"/> 비밀번호 변경</h3>
                <div className="space-y-4">
                    <input type="password" placeholder="새 비밀번호 (6자리 이상 숫자)" className="w-full p-4 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none focus:border-blue-500 transition-colors" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    <button onClick={() => onSave(password)} disabled={!isValid} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-colors shadow-lg">비밀번호 변경</button>
                </div>
            </div>
        </div>
    ); 
};

const AdminGrantModal = ({ onClose, onGrant, profiles, feeds, allPointHistory }) => { 
    const [tab, setTab] = useState('award');
    const [dept, setDept] = useState(''); 
    const [targetUser, setTargetUser] = useState(''); 
    const [amount, setAmount] = useState(''); 
    
    const currentMonth = new Date().getMonth() + 1;
    const { topPosts, topLikes } = useMemo(() => getPrevMonthRankers(feeds, profiles), [feeds, profiles]);

    const isPaid = (userId, reasonPart) => {
        const searchKey = `${currentMonth}월 ${reasonPart}`;
        return allPointHistory.some(h => h.user_id === userId && h.reason.includes(searchKey));
    };

    const awardList = useMemo(() => {
        const list = [];
        profiles.forEach(p => {
            if (p.is_ambassador) list.push({ ...p, type: '앰버서더 활동비', amount: 1000 });
            if (topPosts.includes(p.id)) list.push({ ...p, type: '전월 소통왕', amount: 1000 });
            if (topLikes.includes(p.id)) list.push({ ...p, type: '전월 인기왕', amount: 1000 });
        });
        return list;
    }, [profiles, topPosts, topLikes]);

    const filteredUsers = profiles.filter(p => p.dept === dept); 
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
                <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-600"><Gift className="w-6 h-6"/> 특별 포인트 지급</h3>
                
                <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 text-sm font-bold shrink-0">
                    <button onClick={() => setTab('award')} className={`flex-1 py-2.5 rounded-xl transition-all ${tab === 'award' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>시상 대상자</button>
                    <button onClick={() => setTab('manual')} className={`flex-1 py-2.5 rounded-xl transition-all ${tab === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>직접 지급</button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {tab === 'award' ? (
                        awardList.length > 0 ? (
                            awardList.map((u, idx) => {
                                const paidStatus = isPaid(u.id, u.type);
                                return (
                                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                                        <div>
                                            <p className="text-sm font-bold text-slate-700">{u.name} ({u.team})</p>
                                            <p className="text-xs text-blue-500 font-bold mt-0.5">{u.type}</p>
                                        </div>
                                        {paidStatus ? (
                                            <span className="text-xs font-bold text-slate-400 bg-slate-200 px-3 py-1.5 rounded-lg">지급 완료</span>
                                        ) : (
                                            <button 
                                                onClick={() => onGrant(u.id, 1000, `${currentMonth}월 ${u.type}`)} 
                                                className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-md"
                                            >
                                                지급
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center text-sm text-slate-400 py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">시상 대상자가 없습니다.</div>
                        )
                    ) : (
                        <div className="space-y-4">
                            <select className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:border-blue-500" onChange={(e) => { setDept(e.target.value); setTargetUser(''); }}><option value="">소속 선택</option>{Object.keys(ORGANIZATION).map(d => <option key={d} value={d}>{d}</option>)}</select>
                            <select className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:border-blue-500" disabled={!dept} onChange={(e) => setTargetUser(e.target.value)}><option value="">직원 선택</option>{filteredUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.team})</option>)}</select>
                            <input type="number" placeholder="지급 포인트 (숫자만 입력)" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none font-bold focus:border-blue-500" value={amount} onChange={(e) => setAmount(e.target.value)}/>
                            <button onClick={() => onGrant(targetUser, amount, '관리자 특별 지급')} disabled={!targetUser || !amount} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-2xl font-bold hover:shadow-lg disabled:opacity-50 transition-all text-base mt-2">포인트 지급하기</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    ); 
};

const AdminClawbackModal = ({ onClose, onClawback, profiles }) => { 
    const [dept, setDept] = useState(''); 
    const [targetUser, setTargetUser] = useState(''); 
    const [amount, setAmount] = useState(''); 
    const filteredUsers = profiles.filter(p => p.dept === dept); 
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-red-600"><MinusCircle className="w-5 h-5"/> 포인트 환수 (관리자)</h3>
                <div className="space-y-4">
                    <select className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:border-red-500" onChange={(e) => { setDept(e.target.value); setTargetUser(''); }}>
                        <option value="">소속 선택</option>{Object.keys(ORGANIZATION).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:border-red-500" disabled={!dept} onChange={(e) => setTargetUser(e.target.value)}>
                        <option value="">직원 선택</option>{filteredUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.team})</option>)}
                    </select>
                    <input type="number" placeholder="회수할 포인트 (숫자만)" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none font-bold focus:border-red-500" value={amount} onChange={(e) => setAmount(e.target.value)}/>
                    <button onClick={() => onClawback(targetUser, amount)} disabled={!targetUser || !amount} className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-2xl font-bold hover:shadow-lg disabled:opacity-50 transition-all text-base mt-2">포인트 회수하기</button>
                </div>
            </div>
        </div>
    ); 
};

const RedemptionListModal = ({ onClose, redemptionList, onComplete }) => (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"><div className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative max-h-[80vh] flex flex-col"><button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button><h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-purple-600"><ClipboardList className="w-6 h-6"/> 포인트 차감 신청 내역</h3><div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">{redemptionList && redemptionList.length > 0 ? (<div className="space-y-3">{redemptionList.map((item, index) => (<div key={index} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm hover:bg-white transition-colors"><div><p className="text-base font-bold text-slate-800 mb-0.5">{item.user_name}</p><p className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString()} 신청</p></div><div className="flex items-center gap-4"><div className="text-red-500 font-bold text-base">-{item.amount?.toLocaleString()}</div>{item.status !== 'completed' ? (<button onClick={() => onComplete(item.id)} className="bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-blue-200 transition-colors">완료 처리</button>) : (<span className="text-green-600 text-xs font-bold bg-green-100 px-3 py-1.5 rounded-xl">처리 완료</span>)}</div></div>))}</div>) : (<div className="text-center text-slate-400 py-12 text-sm bg-slate-50 rounded-3xl border border-dashed border-slate-200">신청 내역이 없습니다.</div>)}</div></div></div>);

const AdminManageModal = ({ onClose, profiles, onUpdateUser, onDeleteUser, boosterActive, setBoosterActive }) => { 
    const [searchTerm, setSearchTerm] = useState(''); 
    const filtered = profiles.filter(p => p.name.includes(searchTerm) || p.email.includes(searchTerm)); 
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] p-8 shadow-2xl relative h-[85vh] flex flex-col">
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
                <div className="flex justify-between items-center mb-6 mr-10">
                    <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-800"><Users className="w-6 h-6 text-slate-600"/> 사용자 및 이벤트 관리</h3>
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 shadow-sm">총 가입자: {profiles.length}명</span>
                </div>
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 bg-gradient-to-br from-purple-50 to-white p-6 rounded-3xl border border-purple-100 flex items-center justify-between shadow-sm">
                        <div><h4 className="font-bold text-purple-700 flex items-center gap-2 text-base mb-1"><Zap className="w-5 h-5 fill-purple-500 text-purple-600"/> 포인트 부스터 이벤트</h4><p className="text-sm text-slate-500">활성화 시 모든 획득 포인트 2배</p></div>
                        <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={boosterActive} onChange={() => setBoosterActive(!boosterActive)} /><div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600 shadow-inner"></div></label>
                    </div>
                </div>
                <div className="mb-4 flex gap-2"><input className="flex-1 p-4 border border-slate-200 rounded-2xl text-sm focus:border-blue-500 outline-none shadow-sm" placeholder="이름/이메일 검색" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} /></div>
                <div className="flex-1 overflow-y-auto border border-slate-100 rounded-3xl custom-scrollbar shadow-inner bg-slate-50">
                    <table className="w-full text-sm text-left"><thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 z-10"><tr><th className="p-4 rounded-tl-3xl">이름</th><th className="p-4">부서/팀</th><th className="p-4">권한</th><th className="p-4">앰버서더</th><th className="p-4 rounded-tr-3xl">관리</th></tr></thead><tbody className="bg-white divide-y divide-slate-50">{filtered.map(user => (<tr key={user.id} className="hover:bg-blue-50/50 transition-colors"><td className="p-4 font-bold text-slate-700">{user.name}</td><td className="p-4 text-xs text-slate-500">{user.dept}<br/><span className="text-slate-400">{user.team}</span></td><td className="p-4"><select value={user.role} onChange={(e) => onUpdateUser(user.id, { role: e.target.value })} className="border border-slate-200 rounded-xl p-2 text-xs outline-none focus:border-blue-500 bg-slate-50"><option value="member">일반</option><option value="admin">관리자</option></select></td><td className="p-4"><input type="checkbox" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300" checked={user.is_ambassador || false} onChange={(e) => onUpdateUser(user.id, { is_ambassador: e.target.checked })} /></td><td className="p-4"><button onClick={() => onDeleteUser(user.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"><Trash2 className="w-4 h-4"/></button></td></tr>))}</tbody></table>
                </div>
            </div>
        </div>
    ); 
};
const UserInfoModal = ({ currentUser, pointHistory, setShowUserInfoModal, handleRedeemPoints }) => (<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fade-in"><div className="bg-white w-full max-w-md rounded-[2.5rem] p-0 shadow-2xl max-h-[90vh] overflow-y-auto relative"><div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-t-[2.5rem] flex justify-between items-center sticky top-0 z-10"><div className="flex flex-col text-white"><h3 className="text-xl font-bold flex items-center gap-2"><User className="w-5 h-5"/> {currentUser.name}</h3><p className="text-sm opacity-90 ml-7 mt-1 flex items-center gap-1 font-medium"><Building2 className="w-3.5 h-3.5"/> {currentUser.dept} / {currentUser.team}{currentUser.is_ambassador && <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full ml-2 font-bold border border-white/30">앰버서더</span>}</p></div><button onClick={() => setShowUserInfoModal(false)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"><X className="w-6 h-6" /></button></div><div className="p-6 space-y-6">{currentUser.points >= 10000 ? (<div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-center shadow-sm"><p className="text-base text-blue-800 font-bold mb-3">🎉 보유 포인트가 10,000P 이상입니다!</p><button onClick={handleRedeemPoints} className="w-full bg-blue-600 text-white py-4 rounded-2xl text-base font-bold hover:bg-blue-700 flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"><Wallet className="w-5 h-5" /> 10,000P 상품권 교환 신청</button></div>) : (<div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center shadow-inner"><p className="text-sm text-slate-500 font-bold mb-3">10,000P 부터 상품권 교환 신청이 가능해요 🎁</p><div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner"><div className="bg-gradient-to-r from-blue-400 to-blue-500 h-full transition-all duration-1000 ease-out" style={{ width: `${Math.min((currentUser.points / 10000) * 100, 100)}%` }}></div></div><p className="text-xs text-slate-400 mt-2 text-right font-bold">{Math.floor((currentUser.points / 10000) * 100)}% 달성</p></div>)}<div><h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2 ml-1"><Clock className="w-5 h-5 text-slate-400"/> 포인트 히스토리</h4><div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">{pointHistory.length > 0 ? pointHistory.map((history) => (<div key={history.id} className="flex justify-between items-center p-4 bg-white border border-slate-50 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow"><div className="flex-1 min-w-0"><p className="text-sm font-bold text-slate-700 line-clamp-1">{history.reason}</p><span className="text-xs text-slate-400 mt-0.5 block">{new Date(history.created_at).toLocaleDateString()}</span></div><div className="text-base font-black ml-4 flex items-center gap-1" style={{ color: history.type.includes('use') || history.type === 'gift_sent' ? '#ef4444' : '#10b981' }}>{history.type.includes('use') || history.type === 'gift_sent' ? '-' : '+'}{history.amount.toLocaleString()}</div></div>)) : (<div className="text-center text-sm text-slate-400 py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">아직 활동 내역이 없습니다.</div>)}</div></div></div></div></div>);
const BirthdayPopup = ({ currentUser, handleBirthdayGrant, setShowBirthdayPopup }) => { const [doNotShow, setDoNotShow] = useState(false); const handleClose = () => { if (doNotShow) { localStorage.setItem('birthday_popup_closed_' + new Date().getFullYear(), 'true'); } setShowBirthdayPopup(false); }; return (<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"><div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative text-center"><button onClick={handleClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50"><X className="w-5 h-5" /></button><div className="text-6xl mb-6"><span className="animate-bounce inline-block">🎂</span></div><h3 className="text-2xl font-black text-slate-800 mb-3">생일 축하 드립니다!</h3><p className="text-base text-slate-500 mb-8 leading-relaxed">소중한 {currentUser.name} 님의 생일을 맞아<br/>특별한 선물을 준비했어요.</p><div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-200 mb-8 shadow-sm"><span className="text-3xl font-black text-yellow-600 flex items-center justify-center gap-2"><Coins className="w-8 h-8 fill-yellow-500 text-yellow-600"/> +1,000 P</span></div><button onClick={handleBirthdayGrant} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2 mb-4 text-base"><Gift className="w-5 h-5"/> 포인트 받기</button><div className="flex items-center justify-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-xl" onClick={() => setDoNotShow(!doNotShow)}><div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${doNotShow ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'}`}>{doNotShow && <CheckSquare className="w-3.5 h-3.5 text-white" />}</div><span className="text-sm text-slate-400 select-none font-medium">더 이상 열지 않기</span></div></div></div>); };

const BirthdayNotifier = ({ weeklyBirthdays, onOpenGiftForUser }) => { 
    const [view, setView] = useState('current'); 
    const list = view === 'current' ? weeklyBirthdays.current : weeklyBirthdays.next; 
    
    return (
        <div className="bg-white rounded-3xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50 h-full flex flex-col">
            <h3 className="font-bold text-[13px] mb-4 flex items-center text-slate-800"><span className="mr-2">🎂</span> 생일자</h3>
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-4 border border-slate-200">
                <button onClick={() => setView('current')} className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all ${view === 'current' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>오늘</button>
                <button onClick={() => setView('next')} className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all ${view === 'next' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>내일</button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {list.length > 0 ? (
                    <div className="space-y-2">
                        {list.map((b, index) => (
                            <div key={index} className="flex items-center justify-between gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-2xl hover:bg-blue-50 transition-colors">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm shadow-sm border border-slate-50">🎂</div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-700">{b.name}</p>
                                        <p className="text-[9px] text-slate-400 font-medium">{b.date} <span className="text-blue-500 font-bold">{b.typeLabel}</span></p>
                                    </div>
                                </div>
                                <button onClick={() => onOpenGiftForUser(b.id)} className="text-[10px] bg-white text-pink-500 border border-pink-100 px-2 py-1 rounded-lg font-bold shadow-sm hover:bg-pink-50">선물</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 text-[13px] gap-2"><Smile className="w-6 h-6 opacity-50"/><span>생일자가 없어요</span></div>
                )}
            </div>
        </div>
    ); 
};

const GiftModal = ({ onClose, onGift, profiles, currentUser, pointHistory, preSelectedUserId }) => {
    const [tab, setTab] = useState('dept');
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [targetUser, setTargetUser] = useState(preSelectedUserId || '');
    const [amount, setAmount] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        if (preSelectedUserId) {
            setTab('name'); 
        }
    }, [preSelectedUserId]);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const usedGiftPoints = pointHistory.filter(h => h.type === 'gift_sent' && new Date(h.created_at).getMonth() === currentMonth && new Date(h.created_at).getFullYear() === currentYear).reduce((sum, h) => sum + h.amount, 0);
    const remainingLimit = 1000 - usedGiftPoints;
    
    const filteredUsers = profiles.filter(p => {
        if (p.id === currentUser.id) return false;
        if (tab === 'name') return p.name.includes(searchTerm) || p.team.includes(searchTerm) || (preSelectedUserId && p.id === preSelectedUserId);
        if (tab === 'dept') return selectedDept ? p.dept === selectedDept : false;
        if (tab === 'team') return selectedTeam ? p.team === selectedTeam : false;
        return false;
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-pink-500"><Gift className="w-6 h-6"/> 마음 선물하기</h3>
                <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-xl text-center mb-5 border border-red-100 flex items-center justify-center gap-1"><Bell className="w-3 h-3"/> 선물하기 월 최대 1,000포인트 가능</div>
                <div className="bg-pink-50 p-4 rounded-2xl mb-5 border border-pink-100 shadow-sm">
                    <div className="flex justify-between text-sm mb-2"><span className="text-slate-500 font-medium">이번 달 남은 한도</span><span className="font-bold text-pink-600">{remainingLimit.toLocaleString()} P</span></div>
                    <div className="w-full bg-white h-2 rounded-full overflow-hidden shadow-inner"><div className="bg-pink-400 h-full transition-all" style={{ width: `${(usedGiftPoints/1000)*100}%` }}></div></div>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-4 text-xs font-bold">
                    {[{id:'dept', label:'조직'}, {id:'team', label:'팀'}, {id:'name', label:'이름'}].map(t => (
                        <button key={t.id} onClick={() => { setTab(t.id); setTargetUser(''); }} className={`flex-1 py-2.5 rounded-xl transition-all ${tab === t.id ? 'bg-white text-pink-500 shadow-sm' : 'text-slate-400'}`}>{t.label}</button>
                    ))}
                </div>
                <div className="space-y-3">
                    {tab === 'dept' && (
                        <select className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:border-pink-500 transition-colors" onChange={(e) => setSelectedDept(e.target.value)}>
                            <option value="">본부/부문 선택</option>{Object.keys(ORGANIZATION).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    )}
                    {tab === 'team' && (
                        <>
                        <select className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:border-pink-500 mb-1" onChange={(e) => setSelectedDept(e.target.value)}><option value="">본부/부문 선택 (먼저 선택)</option>{Object.keys(ORGANIZATION).map(d => <option key={d} value={d}>{d}</option>)}</select>
                        <select className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:border-pink-500" disabled={!selectedDept} onChange={(e) => setSelectedTeam(e.target.value)}><option value="">팀 선택</option>{selectedDept && ORGANIZATION[selectedDept].map(t => <option key={t} value={t}>{t}</option>)}</select>
                        </>
                    )}
                    {tab === 'name' && (
                        <div className="relative"><Search className="absolute left-4 top-4 w-4 h-4 text-slate-400"/><input type="text" placeholder="이름 검색" className="w-full p-4 pl-10 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:border-pink-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                    )}
                    {(tab === 'name' || selectedDept || selectedTeam) && (
                        <select className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:border-pink-500" value={targetUser} onChange={(e) => setTargetUser(e.target.value)} size={5}>
                            {filteredUsers.length > 0 ? filteredUsers.map(u => <option key={u.id} value={u.id} className="p-2.5 hover:bg-pink-50 rounded-xl transition-colors font-medium">{u.name} ({u.team})</option>) : <option disabled className="p-2 text-slate-400">검색 결과가 없습니다</option>}
                        </select>
                    )}
                    <input type="number" placeholder="선물할 포인트 (숫자만)" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none font-bold focus:border-pink-500" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    <button onClick={() => onGift(targetUser, amount)} disabled={!targetUser || !amount || parseInt(amount) > remainingLimit || parseInt(amount) > currentUser.points} className="w-full bg-pink-500 text-white p-4 rounded-2xl font-bold hover:bg-pink-600 disabled:bg-slate-300 transition-colors shadow-lg mt-2 text-base">선물 보내기</button>
                </div>
            </div>
        </div>
    );
};

const HomeTab = ({ mood, handleMoodCheck, handleCheckOut, hasCheckedOut, feeds, onWriteClickWithCategory, onNavigateToNews, onNavigateToFeed, weeklyBirthdays, boosterActive, currentUser, attendanceEnabled, onOpenActivityModal, onOpenGiftForUser }) => {
    const averageLikes = useMemo(() => {
        if (feeds.length === 0) return 0;
        const totalLikes = feeds.reduce((acc, curr) => acc + (curr.likes?.length || 0), 0);
        return totalLikes / feeds.length;
    }, [feeds]);

    const latestNotice = feeds.find(f => f.type === 'news');
    
    const ledIndex = useMemo(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        const oneDay = 1000 * 60 * 60 * 24;
        const day = Math.floor(diff / oneDay);
        return day % MOTTO_365.length; 
    }, []);
    
    const ledMessage = useMemo(() => `💡 오늘의 한마디: ${MOTTO_365[ledIndex]}`, [ledIndex]);

    const myActivity = useMemo(() => {
      const myId = currentUser?.id;
      if (!myId) return { posts: 0, comments: 0, praises: 0, receivedLikes: 0, likedPosts: 0 };
      
      const myPosts = feeds.filter(f => f.author_id === myId);
      const posts = myPosts.length;
      const praises = myPosts.filter(f => f.type === 'praise').length;
      const comments = feeds.reduce((sum, f) => {
        const cs = f.comments || [];
        return sum + cs.filter(c => c.author_id === myId).length;
      }, 0);
      
      const receivedLikes = myPosts.reduce((sum, f) => sum + (Array.isArray(f.likes) ? f.likes.length : 0), 0);
      const likedPosts = feeds.filter(f => Array.isArray(f.likes) && f.likes.includes(myId)).length;
      
      return { posts, comments, praises, receivedLikes, likedPosts };
    }, [feeds, currentUser]);


    const renderFeedList = (listType, listData) => {
        return (
            <div className="space-y-3">
                {listData.length > 0 ? listData.map((feed) => { 
                    const isNew = isToday(feed.created_at);
                    const isHot = listType !== 'news' && feed.likes.length >= averageLikes && feed.likes.length > 0;
                    
                    return (
                        <div key={feed.id} onClick={() => onNavigateToFeed(feed.type, feed.id)} className="bg-white px-5 py-3.5 rounded-3xl shadow-sm border border-slate-100 cursor-pointer relative overflow-hidden active:scale-[0.99] transition-transform group hover:shadow-md hover:border-slate-200">
                            <div className="absolute top-4 right-5 flex gap-2 items-center z-10">
                                {isHot && <span className="px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-[9px] font-black animate-pulse">HOT</span>}
                                {isNew && <NewBadge />}
                            </div>
                            
                            <div className="flex flex-col gap-1 pr-14">
                                <div className="flex justify-between items-start">
                                    <div className="text-[13px] font-bold text-slate-800 line-clamp-1 pr-2 group-hover:text-blue-600 transition-colors">
                                        {feed.type === 'dept_news' && feed.region_main && (
                                            <span className="inline-block px-2 py-0.5 rounded-lg bg-purple-50 text-purple-600 text-[9px] font-black mr-1.5 align-middle border border-purple-100">
                                                {feed.region_main}
                                            </span>
                                        )}
                                        {feed.type === 'praise' && feed.target_name ? `To. ${feed.target_name} - ` : ''}
                                        {feed.title || feed.content}
                                    </div>
                                </div>
                                <div className="text-right mt-0.5">
                                    {(listType === 'dept_news' || listType === 'praise') && (
                                        <>
                                        <span className="text-[11px] text-slate-400 font-medium">
                                            {feed.author ? <>{feed.author} ({feed.team})</> : null}
                                        </span>
                                        <span className="text-[10px] text-slate-300 ml-2">{feed.formattedTime}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="text-center text-xs text-slate-400 py-6 bg-white rounded-3xl border border-dashed border-slate-200">게시글이 없습니다.</div>
                )}
            </div>
        );
    };

    const deptFeeds = feeds.filter(f => f.type === 'dept_news').slice(0, 5);
    const praiseFeeds = feeds.filter(f => f.type === 'praise').slice(0, 5); 
    const knowhowFeeds = feeds.filter(f => f.type === 'knowhow').slice(0, 5);
    const matjibFeeds = feeds.filter(f => f.type === 'matjib').slice(0, 5);

    const SectionHeader = ({ title, icon: Icon, colorClass, type }) => (
        <div className="flex justify-between items-center mb-3">
             <div onClick={() => onNavigateToFeed(type)} className={`text-sm font-bold text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-md cursor-pointer active:scale-95 transition-transform ${colorClass}`}>
                 <Icon className="w-4 h-4 text-white fill-white"/> {title}
             </div>
             <button onClick={() => onNavigateToFeed(type)} className="text-[10px] text-slate-400 font-bold flex items-center hover:text-blue-600 bg-white px-2 py-1 rounded-lg shadow-sm">더보기 <ChevronRight className="w-3 h-3"/></button>
        </div>
    );

    return (
      <div className="px-2 py-4 space-y-5 pb-40 animate-fade-in relative bg-[#F8F9FA] min-h-full">
        
        <div className="flex gap-4 h-44">
             <div className="flex-[1.2] bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <div>
                        <h2 className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                            <span className="text-lg mr-1">⏰</span>출/퇴근 체크
                            <span className="text-[8px] text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">각 +20P</span>
                        </h2>
                    </div>
                  </div>
                  <div className="flex-1 flex gap-2 relative z-10">
                     <div className="flex-1 flex flex-col gap-2 justify-center bg-blue-50/30 rounded-2xl p-2 border border-blue-50">
                         {!mood ? (
                             <div className="flex flex-col gap-1.5 h-full justify-center">
                                 <button onClick={() => handleMoodCheck('good')} disabled={!attendanceEnabled} className="bg-white hover:bg-blue-100 rounded-xl w-full flex items-center justify-start px-2 py-1.5 transition-all active:scale-95 shadow-sm border border-blue-100 gap-1.5"><Smile className="w-4 h-4 text-blue-500"/><span className="text-[9px] font-bold text-slate-600">좋음</span></button>
                                 <button onClick={() => handleMoodCheck('normal')} disabled={!attendanceEnabled} className="bg-white hover:bg-green-100 rounded-xl w-full flex items-center justify-start px-2 py-1.5 transition-all active:scale-95 shadow-sm border border-green-100 gap-1.5"><Meh className="w-4 h-4 text-green-500"/><span className="text-[9px] font-bold text-slate-600">보통</span></button>
                                 <button onClick={() => handleMoodCheck('tired')} disabled={!attendanceEnabled} className="bg-white hover:bg-orange-100 rounded-xl w-full flex items-center justify-start px-2 py-1.5 transition-all active:scale-95 shadow-sm border border-orange-100 gap-1.5"><Frown className="w-4 h-4 text-orange-500"/><span className="text-[9px] font-bold text-slate-600">피곤</span></button>
                             </div>
                         ) : (
                             <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-blue-100 shadow-sm">
                                 <div className="text-2xl animate-bounce mb-1">🏢</div>
                                 <span className="text-[11px] font-black text-blue-600">출근 완료</span>
                             </div>
                         )}
                     </div>
                     <div className="flex-1 flex flex-col gap-2 justify-center bg-orange-50/30 rounded-2xl p-2 border border-orange-50">
                         <button onClick={handleCheckOut} disabled={!attendanceEnabled || !mood || hasCheckedOut} className={`flex-1 ${hasCheckedOut ? 'bg-slate-100 text-slate-300' : (!attendanceEnabled || !mood) ? 'bg-slate-100 text-slate-300' : 'bg-slate-800 text-white hover:bg-slate-900 shadow-lg'} rounded-2xl flex flex-col items-center justify-center text-[11px] font-bold transition-all active:scale-95`}>
                             {hasCheckedOut ? <><span className="text-2xl mb-1 grayscale opacity-50">🏠</span><span>퇴근 완료</span></> : <><span className="text-2xl mb-1">🏃</span><span>퇴근하기</span></>}
                         </button>
                     </div>
                  </div>
            </div>
            <div className="flex-1 h-full"><BirthdayNotifier weeklyBirthdays={weeklyBirthdays} onOpenGiftForUser={onOpenGiftForUser} /></div>
        </div>

        <div className="bg-slate-900 rounded-2xl px-4 py-3 shadow-sm border border-slate-800 overflow-hidden">
          <style>{`
            @keyframes ledMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            .ledTrack { display: inline-flex; white-space: nowrap; gap: 3rem; will-change: transform; animation: ledMarquee 18s linear infinite; }
          `}</style>
          <div className="text-[11px] font-black text-emerald-300 tracking-wide drop-shadow-[0_0_10px_rgba(16,185,129,0.35)]">
            <div className="ledTrack">
              <span>{ledMessage}</span>
              <span>{ledMessage}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <button onClick={() => onNavigateToFeed('all')} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors active:scale-95">
                    <Search className="w-4 h-4 text-slate-600" />
                </button>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 whitespace-nowrap">
                  <span>📌</span> 나의 활동
                </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">최근 기준</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div onClick={() => onOpenActivityModal('posts')} className="bg-slate-50 rounded-2xl p-3 border border-slate-100 shadow-inner flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-base">📝</span>
                <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">내 글</span>
              </div>
              <span className="text-lg font-black text-slate-800 whitespace-nowrap">{myActivity.posts}</span>
            </div>

            <div onClick={() => onOpenActivityModal('comments')} className="bg-slate-50 rounded-2xl p-3 border border-slate-100 shadow-inner flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-base">💬</span>
                <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">댓글</span>
              </div>
              <span className="text-lg font-black text-slate-800 whitespace-nowrap">{myActivity.comments}</span>
            </div>

            <div onClick={() => onOpenActivityModal('praises')} className="bg-slate-50 rounded-2xl p-3 border border-slate-100 shadow-inner flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-amber-500" />
                <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">받은 칭찬</span>
              </div>
              <span className="text-lg font-black text-slate-800 whitespace-nowrap">{myActivity.praises}</span>
            </div>

            <div onClick={() => onOpenActivityModal('receivedLikes')} className="bg-slate-50 rounded-2xl p-3 border border-slate-100 shadow-inner flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">받은 좋아요</span>
              </div>
              <span className="text-lg font-black text-slate-800 whitespace-nowrap">{myActivity.receivedLikes}</span>
            </div>

            <div onClick={() => onOpenActivityModal('likedPosts')} className="col-span-2 bg-pink-50/50 rounded-2xl p-3 border border-pink-100 shadow-inner flex items-center justify-between cursor-pointer hover:bg-pink-50 transition-colors">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                <span className="text-[11px] font-bold text-pink-600 whitespace-nowrap">내가 좋아요 한 글</span>
              </div>
              <span className="text-lg font-black text-pink-600 whitespace-nowrap">{myActivity.likedPosts}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center px-1">
             <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
                 <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner">
                     <Coins className="w-2.5 h-2.5 text-white fill-white"/>
                 </div>
                 게시글당 +50P (최대 +100P)
             </div>
        </div>

        <div className="bg-purple-50/60 p-5 rounded-[2rem] shadow-sm border border-purple-100 transition-colors relative">
           <SectionHeader title="우리팀 톡톡🏢" icon={Building2} colorClass="bg-purple-600" type="dept_news"/>
           {renderFeedList('dept_news', deptFeeds)}
        </div>

        <div className="bg-green-50/60 p-5 rounded-[2rem] shadow-sm border border-green-100 transition-colors relative">
           <SectionHeader title="칭찬뿜뿜💚" icon={Heart} colorClass="bg-green-600" type="praise"/>
           {renderFeedList('praise', praiseFeeds)}
        </div>
        
        <div className="bg-blue-50/60 p-5 rounded-[2rem] shadow-sm border border-blue-100 transition-colors relative">
           <SectionHeader title="꿀팁.zip🧠" icon={Sparkles} colorClass="bg-blue-600" type="knowhow"/>
           {renderFeedList('knowhow', knowhowFeeds)}
        </div>

        <div className="bg-orange-50/60 p-5 rounded-[2rem] shadow-sm border border-orange-100 transition-colors relative">
           <SectionHeader title="맛집레이더🍜" icon={Utensils} colorClass="bg-orange-600" type="matjib"/>
           {renderFeedList('matjib', matjibFeeds)}
        </div>

        <div className="mt-6 mb-2">
            <div onClick={onNavigateToNews} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="bg-red-50 p-2 rounded-full"><Megaphone className="w-4 h-4 text-red-500"/></div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-400 mb-0.5">공지사항</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{latestNotice ? latestNotice.title : '등록된 공지사항이 없습니다.'}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300"/>
            </div>
        </div>
      </div>
    );
}; 

const FeedTab = ({ feeds, activeFeedFilter, setActiveFeedFilter, onWriteClickWithCategory, currentUser, handleDeletePost, handleLikePost, handleAddComment, handleDeleteComment, boosterActive, selectedPostId, onClearSelection, handleLikeComment }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');

  useEffect(() => { setSelectedDeptFilter('all'); }, [activeFeedFilter]);
  
  const averageLikes = useMemo(() => {
      if (feeds.length === 0) return 0;
      const totalLikes = feeds.reduce((acc, curr) => acc + (curr.likes?.length || 0), 0);
      return totalLikes / feeds.length;
  }, [feeds]);

  const filteredFeeds = feeds.filter(f => {
      if (selectedPostId) return f.id === selectedPostId; 

      const matchesFilter = activeFeedFilter === 'all' || f.type === activeFeedFilter || (activeFeedFilter === 'dept_news' && f.type === 'dept_news');
      
      let matchesSearch = false;
      if (searchTerm === "") {
          matchesSearch = true;
      } else {
          const lowerTerm = searchTerm.toLowerCase();
          switch (searchCategory) {
              case 'title': matchesSearch = f.title && f.title.toLowerCase().includes(lowerTerm); break;
              case 'content': matchesSearch = f.content && f.content.toLowerCase().includes(lowerTerm); break;
              case 'author': matchesSearch = f.author && f.author.toLowerCase().includes(lowerTerm); break;
              case 'region': matchesSearch = (f.region_main && f.region_main.includes(searchTerm)) || (f.region_sub && f.region_sub.includes(searchTerm)); break;
              case 'all': default: matchesSearch = (f.title && f.title.toLowerCase().includes(lowerTerm)) || (f.content && f.content.toLowerCase().includes(lowerTerm)) || (f.author && f.author.toLowerCase().includes(lowerTerm)) || (f.region_main && f.region_main.includes(searchTerm)) || (f.region_sub && f.region_sub.includes(searchTerm)); break;
          }
      }

      const matchesDept = activeFeedFilter !== 'dept_news' || selectedDeptFilter === 'all' || (f.profiles && f.profiles.dept === selectedDeptFilter);
      return matchesFilter && matchesSearch && matchesDept;
  });

  return (
    <div className="px-2 py-4 space-y-6 pb-40 animate-fade-in bg-slate-50 min-h-full">
      {selectedPostId && (
          <button onClick={onClearSelection} className="w-full bg-slate-800 text-white p-4 rounded-2xl font-bold mb-2 flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors shadow-lg">
              <ChevronLeft className="w-5 h-5"/> 목록으로 돌아가기
          </button>
      )}

      {!selectedPostId && (
      <>
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
          <select 
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 outline-none font-bold text-slate-600 focus:border-blue-500 transition-colors"
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
          >
              <option value="all">전체</option>
              <option value="title">제목</option>
              <option value="content">내용</option>
              <option value="author">작성자</option>
              <option value="region">지역</option>
          </select>
          <div className="h-6 w-[1px] bg-slate-200"></div>
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="검색어를 입력하세요" 
            className="flex-1 bg-transparent text-sm p-1 outline-none placeholder-slate-400 font-medium" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {[{ id: 'all', label: '전체' }, { id: 'praise', label: '칭찬하기' }, { id: 'dept_news', label: '우리팀 톡톡🏢' }, { id: 'knowhow', label: '꿀팁.zip🧠' }, { id: 'matjib', label: '맛집레이더🍜' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveFeedFilter(tab.id)} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeFeedFilter === tab.id ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>{tab.label}</button>
        ))}
      </div>

      {activeFeedFilter === 'dept_news' && (
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar animate-fade-in">
              <button onClick={() => setSelectedDeptFilter('all')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${selectedDeptFilter === 'all' ? 'bg-purple-100 text-purple-700 border-purple-200 shadow-sm' : 'bg-white text-slate-400 border-slate-100'}`}>전체</button>
              {Object.keys(ORGANIZATION).map(dept => (<button key={dept} onClick={() => setSelectedDeptFilter(dept)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${selectedDeptFilter === dept ? 'bg-purple-100 text-purple-700 border-purple-200 shadow-sm' : 'bg-white text-slate-400 border-slate-100'}`}>{dept}</button>))}
          </div>
      )}

      <div className="flex flex-col items-end gap-2 mb-2">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onWriteClickWithCategory(null)}>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95 border border-blue-400 hover:-translate-y-0.5"><Pencil className="w-4 h-4" /><span className="text-sm font-bold">게시글 작성</span></div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100"><div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner"><Coins className="w-2.5 h-2.5 text-white fill-white"/></div>게시글당 +50P (최대 +100P)</div>
      </div>
      </>
      )}
      
      {filteredFeeds.map(feed => {
        const comments = feed.comments || [];
        const isHot = feed.likes.length > 0 && feed.likes.length >= averageLikes;
        const isNew = isToday(feed.created_at);

        return (
          <div key={feed.id} className="bg-white rounded-[2rem] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50 relative group transition-all hover:shadow-md">
            <div className="absolute top-6 right-6 flex gap-2 items-center z-10">
                {isHot && <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-600 border border-red-200 text-[10px] font-black animate-pulse shadow-sm tracking-wide">HOT</span>}
                {isNew && <NewBadge />}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                  <p className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                      {feed.author ? <>{feed.author} <span className="text-slate-400 text-sm font-medium">({feed.team})</span></> : null}
                      {feed.profiles?.role === 'admin' && <span className="bg-red-50 text-red-500 text-[10px] px-2 py-0.5 rounded-full border border-red-100 font-bold">관리자</span>}
                      {feed.profiles?.is_reporter && <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full border border-yellow-200 font-bold">리포터</span>}
                      {feed.profiles?.is_ambassador && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full border border-purple-200 font-bold">앰버서더</span>}
                  </p>
              </div>
            </div>
            
            <div className="mb-5">
                <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border shadow-sm ${feed.type === 'praise' ? 'bg-green-50 text-green-600 border-green-100' : feed.type === 'news' ? 'bg-red-50 text-red-600 border-red-100' : feed.type === 'dept_news' ? 'bg-purple-50 text-purple-600 border-purple-100' : feed.type === 'matjib' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {feed.type === 'praise' ? '칭찬뿜뿜💚' : feed.type === 'news' ? '📢 공지사항' : feed.type === 'dept_news' ? '🏢 우리팀 톡톡' : feed.type === 'matjib' ? '맛집레이더🍜' : '꿀팁'}
                    </span>
                    {feed.type === 'dept_news' && feed.region_main && (
                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200 shadow-sm">
                            {feed.region_main}
                        </span>
                    )}
                    {feed.type === 'matjib' && feed.region_main && <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-slate-50 text-slate-500 border border-slate-200"><MapPin className="w-3 h-3 inline mr-1"/>{feed.region_main} {feed.region_sub}</span>}
                </div>
                
                {feed.type === 'praise' && feed.target_name && <p className="text-sm font-bold text-green-600 mb-2">To. {feed.target_name}</p>}
                
                {feed.type !== 'praise' && feed.title && (
                    <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                        {feed.title}
                    </h3>
                )}
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{feed.content}</p>
            </div>
            
            {feed.image_url && (<div className="mb-5 rounded-3xl overflow-hidden border border-slate-100 shadow-sm"><img src={feed.image_url} alt="Content" className="w-full h-auto object-cover" /></div>)}
            
            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
              <div className="flex items-center gap-5">
                  <button onClick={() => handleLikePost(feed.id, feed.likes, feed.isLiked)} className={`flex items-center gap-1.5 text-sm font-bold transition-all ${feed.isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}><Heart className={`w-5 h-5 transition-transform active:scale-75 ${feed.isLiked ? 'fill-red-500' : ''}`} /> {feed.likes?.length || 0}</button>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-400"><MessageCircle className="w-5 h-5" /> {comments.length}</div>
                  {(currentUser?.id === feed.author_id || currentUser?.role === 'admin') && (
                      <button onClick={() => handleDeletePost(feed.id)} className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">삭제</button>
                  )}
              </div>
              <div className="text-xs text-slate-300 font-medium">{feed.formattedTime}</div>
            </div>
            {comments.length > 0 && (<div className="mt-4 pt-4 border-t border-slate-50 space-y-3">{comments.map(comment => (<Comment key={comment.id} comment={comment} currentUser={currentUser} handleDeleteComment={handleDeleteComment} handleLikeComment={handleLikeComment} />))}</div>)}
            <form onSubmit={(e) => handleAddComment(e, feed.id, null)} className="flex gap-2 mt-4">
                <input name="commentContent" type="text" placeholder="댓글을 남겨주세요..." className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors" required />
                <button type="submit" className="bg-white border border-slate-200 text-slate-500 p-3 rounded-2xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"><Send className="w-4 h-4"/></button>
            </form>
          </div>
        );
      })}
    </div>
  );
};

const WriteModal = ({ setShowWriteModal, handlePostSubmit, currentUser, activeTab, boosterActive, initialCategory, profiles }) => {
  const [writeCategory, setWriteCategory] = useState(initialCategory || ''); 
  const [imagePreview, setImagePreview] = useState(null);
  const [regionMain, setRegionMain] = useState('');
  const [regionSub, setRegionSub] = useState('');
  const [deptNewsOrg, setDeptNewsOrg] = useState('');
  
  const [praiseDept, setPraiseDept] = useState('');
  const [praiseTargetId, setPraiseTargetId] = useState('');

  const handleImageChange = (e) => { const file = e.target.files[0]; if (file) setImagePreview(URL.createObjectURL(file)); };
  
  const categories = useMemo(() => {
    const baseCategories = [
        {id: 'dept_news', label: '우리팀 톡톡🏢'}, 
        {id: 'praise', label: '칭찬하기'},
        {id: 'matjib', label: '맛집소개'},
        {id: 'knowhow', label: '꿀팁.zip🧠'}
    ];
    if (currentUser?.role === 'admin' || currentUser?.is_ambassador) {
        baseCategories.push({id: 'news', label: '공지사항 (관리자/앰버서더)'});
    }
    return baseCategories;
  }, [currentUser]);

  useEffect(() => {
      if (initialCategory && categories.some(c => c.id === initialCategory)) {
          setWriteCategory(initialCategory);
      } 
      if (currentUser?.dept && Object.keys(ORGANIZATION).includes(currentUser.dept)) { setDeptNewsOrg(currentUser.dept); }
  }, [categories, initialCategory, currentUser]);

  const showPointReward = ['praise', 'knowhow', 'matjib', 'dept_news'].includes(writeCategory);
  const rewardAmount = boosterActive ? 100 : 50;
  const pointRewardText = showPointReward ? ` (+${rewardAmount}P)` : '';

  const praiseTargetUsers = useMemo(() => {
      if (!praiseDept) return [];
      return profiles.filter(p => p.dept === praiseDept && p.id !== currentUser.id);
  }, [praiseDept, profiles, currentUser]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-0 shadow-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="bg-slate-800 p-8 rounded-t-[2.5rem] flex justify-between items-center sticky top-0 z-10 shadow-lg">
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Pencil className="w-6 h-6"/> 게시글 작성</h3>
            <button onClick={() => setShowWriteModal(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-8">
            <form onSubmit={handlePostSubmit}>
            <div className="mb-8">
                <label className="block text-sm font-bold text-slate-500 mb-3 ml-1">게시글 유형을 선택해 주세요</label>
                <input type="hidden" name="category" value={writeCategory} /> 
                <div className="grid grid-cols-2 gap-3">
                    {categories.map((cat) => (
                        <button key={cat.id} type="button" onClick={() => setWriteCategory(cat.id)} className={`p-4 rounded-2xl text-sm font-bold border transition-all ${writeCategory === cat.id ? 'bg-slate-800 text-white border-slate-800 shadow-lg transform scale-[1.02]' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:border-slate-300'}`}>{cat.label}</button>
                    ))}
                </div>
            </div>
            <div className="space-y-5 mb-8">
                {writeCategory === 'praise' && (
                    <div className="bg-green-50 p-6 rounded-3xl border border-green-100 animate-fade-in">
                        <label className="text-sm font-bold text-green-700 block mb-3 ml-1">누구를 칭찬하나요?</label>
                        <p className="text-xs text-green-600 mb-3">칭찬받는 분에게 <span className="font-bold">100P</span>가 지급됩니다! (월 3회 한도)</p>
                        <div className="space-y-3">
                            <select className="w-full p-4 bg-white border border-green-200 rounded-2xl text-sm outline-none focus:border-green-500" value={praiseDept} onChange={(e) => { setPraiseDept(e.target.value); setPraiseTargetId(''); }} required>
                                <option value="">소속 선택</option>{Object.keys(ORGANIZATION).map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select name="targetUserId" className="w-full p-4 bg-white border border-green-200 rounded-2xl text-sm outline-none focus:border-green-500" disabled={!praiseDept} value={praiseTargetId} onChange={(e) => setPraiseTargetId(e.target.value)} required>
                                <option value="">직원 선택</option>{praiseTargetUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.team})</option>)}
                            </select>
                        </div>
                    </div>
                )}
                {writeCategory === 'dept_news' && (
                     <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100 animate-fade-in">
                         <p className="text-sm text-purple-800 font-bold mb-3">📢 우리 조직의 즐거운 소식을 전해주세요!</p>
                         <select name="regionMain" className="w-full p-4 bg-white border border-purple-200 rounded-2xl text-sm outline-none mb-3 text-purple-900 font-bold" value={deptNewsOrg} onChange={(e) => setDeptNewsOrg(e.target.value)} required><option value="">소식 구분 (조직 선택)</option>{Object.keys(ORGANIZATION).map(org => <option key={org} value={org}>{org}</option>)}</select>
                         <input name="title" type="text" placeholder="제목을 입력하세요 (예: 00팀 회식~!)" className="w-full p-4 bg-white border border-purple-200 rounded-2xl text-sm outline-none focus:border-purple-500 font-bold" required />
                     </div>
                )}
                {writeCategory === 'matjib' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-sm text-orange-800 leading-relaxed mb-1 shadow-sm">💡 <strong>작성 가이드</strong><br/>(예시) 주 메뉴, 특징, 가격대, 바로가기 링크 등 주요 내용을 입력해주세요.</div>
                        <input name="title" type="text" placeholder="맛집 이름 (제목)" className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:border-blue-500 font-bold shadow-sm" required />
                        <div className="grid grid-cols-2 gap-3">
                             <select name="regionMain" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-blue-500" onChange={(e) => setRegionMain(e.target.value)} required><option value="">시/도 선택</option>{Object.keys(REGIONS).map(r => <option key={r} value={r}>{r}</option>)}</select>
                             <select name="regionSub" value={regionSub} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-blue-500" disabled={!regionMain} onChange={(e) => setRegionSub(e.target.value)} required><option value="">시/군/구 선택</option>{regionMain && REGIONS[regionMain].map(r => <option key={r} value={r}>{r}</option>)}</select>
                        </div>
                    </div>
                )}
                {writeCategory === 'news' && (
                     <div className="bg-red-50 p-6 rounded-3xl border border-red-100 animate-fade-in">
                         <p className="text-sm text-red-800 font-bold mb-3">📢 공지사항은 모든 임직원에게 알림됩니다.</p>
                         <input name="title" type="text" placeholder="공지 제목" className="w-full p-4 bg-white border border-red-200 rounded-2xl text-sm outline-none focus:border-red-500 font-bold" required />
                     </div>
                )}
                
                {writeCategory && (
                    <div className="animate-fade-in space-y-5">
                        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-inner">
                            <textarea name="content" className="w-full h-40 bg-transparent text-base outline-none resize-none placeholder-slate-400 p-1" placeholder="내용을 자세히 작성해주세요..." required></textarea>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer flex items-center justify-center w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl hover:border-blue-400 hover:bg-blue-50 transition-all group">
                                <div className="text-center group-hover:scale-105 transition-transform"><ImageIcon className="w-7 h-7 text-slate-400 mx-auto mb-1 group-hover:text-blue-500" /><span className="text-xs text-slate-400 group-hover:text-blue-500 font-bold">사진 추가</span></div>
                                <input type="file" name="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                            {imagePreview && (
                                <div className="w-24 h-24 rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative group">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => setImagePreview(null)} className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"><X className="w-6 h-6"/></button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <button type="submit" disabled={!writeCategory} className="w-full bg-slate-800 text-white p-5 rounded-3xl text-base font-bold hover:bg-slate-900 shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 transform active:scale-[0.98]">등록하기 <span className="text-yellow-400 bg-white/10 px-2 py-0.5 rounded-lg text-xs border border-white/20">{pointRewardText}</span></button>
            </form>
        </div>
      </div>
    </div>
  );
};

const RankingTab = ({ feeds, profiles, allPointHistory, currentUser }) => { 
    const [selectedDate, setSelectedDate] = useState(new Date()); 
    const isSelectedMonth = (dateString) => { if(!dateString) return false; const d = new Date(dateString); return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear(); }; 
    const handlePrevMonth = () => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1))); 
    const handleNextMonth = () => { const nextMonth = new Date(selectedDate); nextMonth.setMonth(selectedDate.getMonth() + 1); if (nextMonth <= new Date()) setSelectedDate(nextMonth); }; 
    
    const pointRankingAll = useMemo(() => {
    const monthlyPoints = {};
    allPointHistory.forEach((record) => {
      if (isSelectedMonth(record.created_at) && record.type === 'earn') {
        monthlyPoints[record.user_id] = (monthlyPoints[record.user_id] || 0) + record.amount;
      }
    });
    return Object.entries(monthlyPoints)
      .map(([id, points]) => {
        const p = profiles.find((profile) => profile.id === id) || { name: '알수없음', team: '소속미정' };
        return { id, name: p.name, value: points, unit: 'P', team: p.team };
      })
      .sort((a, b) => b.value - a.value);
  }, [allPointHistory, profiles, selectedDate]);

  const pointRankingTop10 = useMemo(() => pointRankingAll.slice(0, 10), [pointRankingAll]);

  const myPointRank = useMemo(() => {
    if (!currentUser?.id) return null;
    const idx = pointRankingAll.findIndex((x) => x.id === currentUser.id);
    if (idx === -1) return { rank: null, name: currentUser.name, team: currentUser.team, value: 0, unit: 'P' };
    const me = pointRankingAll[idx];
    return { rank: idx + 1, ...me };
  }, [pointRankingAll, currentUser]); 
    const postCounts = {}; feeds.filter(f => isSelectedMonth(f.created_at)).forEach(f => { postCounts[f.author_id] = (postCounts[f.author_id] || 0) + 1; }); 
    const postRanking = Object.entries(postCounts).map(([id, count]) => { const p = profiles.find(profile => profile.id === id) || { name: '알수없음', team: '소속미정' }; return { name: p.name, value: count, unit: '건', team: p.team }; }).sort((a, b) => b.value - a.value).slice(0, 3); 
    const likeCounts = {}; feeds.filter(f => isSelectedMonth(f.created_at)).forEach(f => { const likes = f.likes ? (Array.isArray(f.likes) ? f.likes.length : 0) : 0; if(likes > 0) likeCounts[f.author_id] = (likeCounts[f.author_id] || 0) + likes; }); 
    const likeRanking = Object.entries(likeCounts).map(([id, count]) => { const p = profiles.find(profile => profile.id === id) || { name: '알수없음', team: '소속미정' }; return { name: p.name, value: count, unit: '개', team: p.team }; }).sort((a, b) => b.value - a.value).slice(0, 3); 
    
    const RankItem = ({ rank, name, value, unit, team, color, showReward }) => (<div className="flex items-center p-4 bg-white border border-slate-100 rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] relative overflow-hidden transition-transform hover:scale-[1.01]">{showReward && rank <= 3 && <div className="absolute right-0 top-0 bg-yellow-100 text-yellow-600 text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm">🎁 1,000P</div>}<div className={`text-2xl font-black mr-5 w-8 text-center ${color} drop-shadow-sm`}>{rank}</div><div className="flex-1"><p className="text-base font-bold text-slate-800">{name || 'Unknown'}</p><p className="text-xs text-slate-400 font-medium">{team}</p></div><div className="text-lg font-black text-slate-700 ml-4">{value}<span className="text-xs text-slate-400 ml-0.5 font-normal">{unit}</span></div></div>); 
    
    return (<div className="px-2 py-4 space-y-8 pb-40 animate-fade-in bg-slate-50"><div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 text-center relative"><div className="flex justify-between items-center mb-4 px-2"><button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft className="w-6 h-6 text-slate-400" /></button><h2 className="text-xl font-black text-slate-800">{selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 랭킹</h2><button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-full disabled:opacity-30 transition-colors" disabled={selectedDate >= new Date(new Date().setDate(1))}><ChevronRight className="w-6 h-6 text-slate-400" /></button></div><div className="flex justify-center gap-2 mt-3"><span className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-full font-bold border border-green-100">🏆 소통상/좋아요상: 1~3등 1,000P</span></div></div>
      {myPointRank && (
        <div className="sticky top-2 z-20">
          <div className="bg-blue-50 border border-blue-100 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-600">내 월간 포인트 순위</p>
                <p className="text-sm font-black text-slate-800">{myPointRank.name} <span className="text-slate-400 font-medium">({myPointRank.team})</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500">순위</p>
                <p className="text-2xl font-black text-blue-700">{myPointRank.rank ? myPointRank.rank : '-'} </p>
                <p className="text-xs font-bold text-slate-500 mt-1">{myPointRank.value.toLocaleString()}P</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4"><h3 className="text-base font-bold text-slate-600 flex items-center gap-2 mb-3 ml-2"><Coins className="w-5 h-5 text-yellow-500"/> 월간 획득 포인트 랭킹 TOP 10</h3><div className="space-y-3">{pointRankingTop10.length > 0 ? pointRankingTop10.map((p, i) => <RankItem key={i} rank={i+1} name={p.name} team={p.team} value={p.value.toLocaleString()} unit="P" color="text-yellow-500" showReward={false}/>) : <div className="text-center text-sm text-slate-400 py-6 bg-white rounded-3xl border border-dashed border-slate-200">데이터가 없습니다.</div>}</div></div><div className="space-y-4"><h3 className="text-base font-bold text-slate-600 flex items-center gap-2 mb-3 ml-2"><Pencil className="w-5 h-5 text-green-500"/> 소통왕 (게시글)</h3><div className="space-y-3">{postRanking.length > 0 ? postRanking.map((p, i) => <RankItem key={i} rank={i+1} {...p} color="text-green-500" showReward={true}/>) : <div className="text-center text-sm text-slate-400 py-6 bg-white rounded-3xl border border-dashed border-slate-200">데이터가 없습니다.</div>}</div></div><div className="space-y-4"><h3 className="text-base font-bold text-slate-600 flex items-center gap-2 mb-3 ml-2"><Heart className="w-5 h-5 text-red-500"/> 인기왕 (좋아요)</h3><div className="space-y-3">{likeRanking.length > 0 ? likeRanking.map((p, i) => <RankItem key={i} rank={i+1} {...p} color="text-red-500" showReward={true}/>) : <div className="text-center text-sm text-slate-400 py-6 bg-white rounded-3xl border border-dashed border-slate-200">데이터가 없습니다.</div>}</div></div></div>); };

const BottomNav = ({ activeTab, onTabChange, onFabClick }) => {
  const getTabColor = (id, isActive) => {
    if (!isActive) return 'text-slate-400 hover:text-slate-600';
    switch (id) {
      case 'home': return 'text-white bg-blue-600 shadow-lg shadow-blue-500/30';
      case 'feed': return 'text-white bg-green-500 shadow-lg shadow-green-500/30';
      case 'news': return 'text-white bg-red-500 shadow-lg shadow-red-500/30';
      case 'ranking': return 'text-white bg-yellow-500 shadow-lg shadow-yellow-500/30';
      default: return 'text-slate-600';
    }
  };

  const NavBtn = ({ item }) => (
    <button
      onClick={() => {
          if (item.id === 'feed') {
              onTabChange(item.id, 'all');
          } else {
              onTabChange(item.id);
          }
      }}
      className={`flex flex-col items-center justify-center gap-1 h-full rounded-[2rem] transition-all duration-300 ease-out ${getTabColor(item.id, activeTab === item.id)}`}
    >
      <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'stroke-[2.5px]' : ''}`} />
      <span className="text-[9px] font-bold whitespace-nowrap">{item.label}</span>
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-6px_24px_rgba(0,0,0,0.10)] p-0 z-30">
      <div className="w-full relative">
        <div className="grid grid-cols-5 items-center rounded-[2rem] h-16 bg-white/90 border border-white/60 shadow-sm overflow-hidden mx-2">
          <NavBtn item={{ id: 'home', icon: Home, label: '홈' }} />
          <NavBtn item={{ id: 'feed', icon: MessageCircle, label: '게시판' }} />
          <div className="h-full" />
          <NavBtn item={{ id: 'news', icon: Bell, label: '공지' }} />
          <NavBtn item={{ id: 'ranking', icon: Award, label: '랭킹' }} />
        </div>

        <button
          type="button"
          onClick={onFabClick}
          aria-label="새 게시글 작성"
          className="absolute left-1/2 -translate-x-1/2 -top-6 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white w-16 h-16 rounded-full shadow-xl shadow-blue-500/35 border-4 border-white flex items-center justify-center transition-all"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

const Comment = ({ comment, currentUser, handleDeleteComment, handleLikeComment }) => {
    const likes = comment.likes || [];
    const isLiked = likes.includes(currentUser?.id);

    return (
        <div className="flex gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 hover:bg-slate-100/80 transition-colors">
            <CornerDownRight className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                        {comment.profiles?.name || '알 수 없음'} <span className="text-slate-400 text-xs font-normal">({comment.profiles?.team || '소속미정'})</span>
                        {comment.profiles?.role === 'admin' && <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[10px] rounded-md font-bold">관리자</span>}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">{new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed break-words">{comment.content}</p>
                <div className="flex gap-4 mt-2 justify-end items-center">
                    <button onClick={() => handleLikeComment(comment.id, comment.post_id, likes, isLiked, comment.author_id)} className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded transition-colors ${isLiked ? 'text-pink-500 bg-pink-50' : 'text-slate-400 hover:bg-slate-200'}`}>
                        <Heart className={`w-3 h-3 ${isLiked ? 'fill-pink-500' : ''}`}/> {likes.length > 0 ? likes.length : '좋아요'}
                    </button>
                    {(currentUser?.id === comment.author_id || currentUser?.role === 'admin') && (
                        <button onClick={() => handleDeleteComment(comment.id)} className="text-[10px] text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50"><Trash2 className="w-3 h-3"/> 삭제</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function App() {
  const [supabase, setSupabase] = useState(null);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);
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
  const [showAdminGrantPopup, setShowAdminGrantPopup] = useState(false); 
  const [newAdminGrants, setNewAdminGrants] = useState([]); 
  const [showAdminClawbackModal, setShowAdminClawbackModal] = useState(false);
  const [showMyActivityModal, setShowMyActivityModal] = useState(false);
  const [activityModalType, setActivityModalType] = useState('posts');
  const [preSelectedGiftUser, setPreSelectedGiftUser] = useState(null);

  const [showChangeDeptModal, setShowChangeDeptModal] = useState(false);
  const [showChangePwdModal, setShowChangePwdModal] = useState(false);
  const [showAdminGrantModal, setShowAdminGrantModal] = useState(false);
  const [showRedemptionListModal, setShowRedemptionListModal] = useState(false); 
  const [showAdminAlertModal, setShowAdminAlertModal] = useState(false); 
  const [toast, setToast] = useState({ visible: false, message: '', emoji: '' });

  const [activeTab, setActiveTab] = useState('home');
  const TAB_ORDER = ['home', 'feed', 'news', 'ranking'];
  const [displayTab, setDisplayTab] = useState('home');
  const [nextTab, setNextTab] = useState(null);
  const [slideDir, setSlideDir] = useState(1);
  const [isSliding, setIsSliding] = useState(false);
  const [activeFeedFilter, setActiveFeedFilter] = useState('all');
  const [mood, setMood] = useState(null);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [attendanceEnabled, setAttendanceEnabled] = useState(false);
  const [boosterActive, setBoosterActive] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const weeklyBirthdays = React.useMemo(() => getWeeklyBirthdays(profiles), [profiles]);

  useEffect(() => {
    if (window.supabase) {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        setSupabase(client);
        setIsSupabaseReady(true);
        return;
    }
    const script = document.createElement('script');
    script.src = "https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js";
    script.async = true;
    script.onload = () => {
        if (window.supabase) {
            const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            setSupabase(client);
            setIsSupabaseReady(true);
        }
    };
    document.body.appendChild(script);
    return () => {};
  }, []);

  useEffect(() => {
    const savedBooster = localStorage.getItem('axa_booster_active') === 'true';
    setBoosterActive(savedBooster);
  }, []);
  
  useEffect(() => { localStorage.setItem('axa_booster_active', boosterActive); }, [boosterActive]);

  useEffect(() => {
    if (session) {
        setAttendanceEnabled(true);
    } else {
        setAttendanceEnabled(false);
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const tryFullscreen = () => {
      const el = document.documentElement;
      if (el?.requestFullscreen && !document.fullscreenElement) {
        el.requestFullscreen().catch(() => {});
      }
    };
    setTimeout(tryFullscreen, 300);

    const beforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);

    const onPopState = () => {
      const ok = window.confirm('앱을 종료하시겠습니까?');
      if (!ok) {
        history.pushState(null, '', window.location.href);
      }
    };
    history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      window.removeEventListener('popstate', onPopState);
    };
  }, [session]);

  const checkBirthday = useCallback((user) => {
    if (!user.birthdate || user.birthday_granted) return; 
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const [_, m, d] = user.birthdate.split('-').map(Number);
    if (currentMonth === m) setShowBirthdayPopup(true);
  }, []);
  
  const checkGiftNotifications = useCallback(async (userId) => {
      if (!supabase) return;
      try {
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          const { data } = await supabase.from('point_history').select('*').eq('user_id', userId).eq('type', 'earn').ilike('reason', '%선물 받음%').gte('created_at', threeDaysAgo.toISOString()).order('created_at', { ascending: false });
          if (data && data.length > 0) {
              const lastChecked = localStorage.getItem(`last_gift_check_${userId}`);
              const newGiftsList = data.filter(gift => !lastChecked || new Date(gift.created_at) > new Date(lastChecked));
              if (newGiftsList.length > 0) { setNewGifts(newGiftsList); setShowGiftNotificationModal(true); localStorage.setItem(`last_gift_check_${userId}`, new Date().toISOString()); }
          }
      } catch (err) { console.error(err); }
  }, [supabase]);

  const checkAdminGrants = useCallback(async (userId) => {
      if (!supabase) return;
      try {
          const lastChecked = localStorage.getItem(`last_admin_grant_check_${userId}`) || new Date(0).toISOString();
          const { data } = await supabase.from('point_history')
              .select('*')
              .eq('user_id', userId)
              .eq('reason', '관리자 특별 지급') 
              .gt('created_at', lastChecked)
              .order('created_at', { ascending: false });

          if (data && data.length > 0) {
              setNewAdminGrants(data);
              setShowAdminGrantPopup(true);
              localStorage.setItem(`last_admin_grant_check_${userId}`, new Date().toISOString());
          }
      } catch (err) { console.error(err); }
  }, [supabase]);

  const checkAdminNotifications = async (user) => {
      if (user.role !== 'admin' || !supabase) return;
      const todayStr = new Date().toISOString().split('T')[0];
      const hideDate = localStorage.getItem('hide_admin_alert');
      if (hideDate === todayStr) return;
      try { const { count, error } = await supabase.from('redemption_requests').select('*', { count: 'exact', head: true }).neq('status', 'completed'); if (!error && count > 0) setShowAdminAlertModal(true); } catch (err) { console.error(err); }
  };
  
  const handleCloseAdminAlert = (doNotShowToday) => { if (doNotShowToday) { const todayStr = new Date().toISOString().split('T')[0]; localStorage.setItem('hide_admin_alert', todayStr); } setShowAdminAlertModal(false); };

  const fetchUserData = useCallback(async (userId) => {
    if (!supabase) return; 
    try {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (data) {
            setCurrentUser(data);
            const todayStr = new Date().toISOString().split('T')[0];
            if (data.last_attendance === todayStr) setMood('checked');
            const lastCheckout = localStorage.getItem(`checkout_${userId}_${todayStr}`);
            if (lastCheckout) setHasCheckedOut(true); else setHasCheckedOut(false);
            checkBirthday(data); 
            checkAdminNotifications(data); 
            checkGiftNotifications(userId); 
            checkAdminGrants(userId);
        }
    } catch (err) { console.error(err); }
  }, [supabase, checkBirthday, checkGiftNotifications, checkAdminGrants]);

  const fetchPointHistory = useCallback(async (userId) => {
    if (!supabase) return; 
    try { const { data } = await supabase.from('point_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (data) setPointHistory(data); } catch (err) { console.error(err); }
  }, [supabase]);

  const fetchAllPointHistory = useCallback(async () => {
      if (!supabase) return;
      try { const { data } = await supabase.from('point_history').select('user_id, amount, type, created_at, reason'); if (data) setAllPointHistory(data); } catch(err) { console.error(err); }
  }, [supabase]);

  const fetchFeeds = useCallback(async () => {
    if (!supabase) return; 
    try {
        const { data: posts, error } = await supabase
            .from('posts')
            .select(`
                *,
                profiles (*),
                comments (
                    *,
                    profiles (*)
                )
            `)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) { return; }

        if (posts) {
            const formatted = posts.map(post => {
                const authorData = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
                let authorName = authorData?.name || authorData?.email?.split('@')[0] || '알 수 없음';
                let authorTeam = authorData?.team || '소속 미정';
                if (post.type === 'praise') { authorName = ''; authorTeam = ''; }
                let parsedLikes = [];
                try { parsedLikes = post.likes ? (typeof post.likes === 'string' ? JSON.parse(post.likes) : post.likes) : []; } catch (e) { parsedLikes = []; }
                const sortedComments = post.comments ? post.comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) : [];
                return { ...post, author: authorName, team: authorTeam, formattedTime: new Date(post.created_at).toLocaleDateString(), likes: parsedLikes, isLiked: false, comments: sortedComments, totalComments: sortedComments.length, profiles: authorData };
            });
            if (currentUser) { formatted.forEach(p => { p.isLiked = Array.isArray(p.likes) && p.likes.includes(currentUser.id); }); }
            setFeeds(formatted);
        }
    } catch (err) { console.error(err); }
  }, [supabase, currentUser]);

  const fetchProfiles = useCallback(async () => { if (!supabase) return; try { const { data } = await supabase.from('profiles').select('*'); if (data) setProfiles(data); } catch (err) { console.error(err); } }, [supabase]);
  const fetchRedemptionList = useCallback(async () => { if (!supabase) return; try { const { data } = await supabase.from('redemption_requests').select('*').order('created_at', { ascending: false }); if(data) setRedemptionList(data); } catch (err) { console.error(err); } }, [supabase]);

  useEffect(() => {
    if (!supabase) return; 
    const channel = supabase.channel('public:comments_posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => { fetchFeeds(); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => { fetchFeeds(); })
        .subscribe();
    try {
        supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); if (session) { fetchUserData(session.user.id); fetchPointHistory(session.user.id); } });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); if (session) { fetchUserData(session.user.id); fetchPointHistory(session.user.id); } else setCurrentUser(null); });
        fetchFeeds(); fetchProfiles(); fetchAllPointHistory();
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
        setShowBirthdayPopup(false); fetchUserData(currentUser.id); fetchPointHistory(currentUser.id); fetchAllPointHistory(); 
    } catch (err) { console.error('오류 발생: ', err.message); }
  };

  const handleLikePost = async (postId, currentLikes, isLiked) => {
      if (!currentUser || !checkSupabaseConfig()) return;
      const userId = currentUser.id;
      let newLikes = [...currentLikes];
      
      const post = feeds.find(f => f.id === postId);
      const authorId = post?.author_id;

      try {
          if (isLiked) { 
              newLikes = newLikes.filter(id => id !== userId);
              await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);

              if (authorId && authorId !== userId) {
                  const { data: author } = await supabase.from('profiles').select('points').eq('id', authorId).single();
                  if (author) {
                      const newPoints = Math.max(0, (author.points || 0) - 5);
                      await supabase.from('profiles').update({ points: newPoints }).eq('id', authorId);
                      await supabase.from('point_history').insert({ user_id: authorId, reason: '게시글 좋아요 취소', amount: 5, type: 'use' });
                  }
              }

          } else { 
              newLikes.push(userId);
              await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);

              if (authorId && authorId !== userId) {
                  const { data: author } = await supabase.from('profiles').select('points').eq('id', authorId).single();
                  if (author) {
                      const newPoints = (author.points || 0) + 5;
                      await supabase.from('profiles').update({ points: newPoints }).eq('id', authorId);
                      await supabase.from('point_history').insert({ user_id: authorId, reason: '게시글 좋아요 획득', amount: 5, type: 'earn' });
                  }
              }
          }
          setFeeds(feeds.map(f => f.id === postId ? { ...f, likes: newLikes, isLiked: !isLiked } : f));

      } catch (err) { console.error(err); fetchFeeds(); }
  };

  const handleLikeComment = async (commentId, postId, currentLikes, isLiked, authorId) => {
      if (!currentUser || !checkSupabaseConfig()) return;
      const userId = currentUser.id;
      let newLikes = [...currentLikes];

      try {
          if (isLiked) {
              newLikes = newLikes.filter(id => id !== userId);
              await supabase.from('comments').update({ likes: newLikes }).eq('id', commentId);
              if (authorId && authorId !== userId) {
                  const { data: author } = await supabase.from('profiles').select('points').eq('id', authorId).single();
                  if (author) {
                      const newPoints = Math.max(0, (author.points || 0) - 2);
                      await supabase.from('profiles').update({ points: newPoints }).eq('id', authorId);
                      await supabase.from('point_history').insert({ user_id: authorId, reason: '댓글 좋아요 취소', amount: 2, type: 'use' });
                  }
              }
          } else {
              newLikes.push(userId);
              await supabase.from('comments').update({ likes: newLikes }).eq('id', commentId);
              if (authorId && authorId !== userId) {
                  const { data: author } = await supabase.from('profiles').select('points').eq('id', authorId).single();
                  if (author) {
                      const newPoints = (author.points || 0) + 2;
                      await supabase.from('profiles').update({ points: newPoints }).eq('id', authorId);
                      await supabase.from('point_history').insert({ user_id: authorId, reason: '댓글 좋아요 획득', amount: 2, type: 'earn' });
                  }
              }
          }
          setFeeds(prevFeeds => prevFeeds.map(feed => {
              if (feed.id === postId) {
                  const updatedComments = feed.comments.map(c => c.id === commentId ? { ...c, likes: newLikes } : c);
                  return { ...feed, comments: updatedComments };
              }
              return feed;
          }));
      } catch (err) { console.error(err); fetchFeeds(); }
  };

  const handleAddComment = async (e, postId, parentId = null) => {
      e.preventDefault(); 
      const content = e.target.elements.commentContent?.value; 
      if (!content || !currentUser) return;
      
      const post = feeds.find(f => f.id === postId);
      const authorId = post?.author_id;
      
      const tempComment = { id: `temp-${Date.now()}`, post_id: postId, author_id: currentUser.id, content: content, parent_id: parentId, created_at: new Date().toISOString(), profiles: { name: currentUser.name, role: currentUser.role }, likes: [] };
      
      setFeeds(prevFeeds => prevFeeds.map(feed => { 
          if (feed.id === postId) { 
              const currentComments = feed.comments || [];
              return { ...feed, comments: [...currentComments, tempComment], totalComments: (feed.totalComments || 0) + 1 }; 
          } 
          return feed; 
      }));
      e.target.reset(); 
      
      try { 
          await supabase.from('comments').insert({ post_id: postId, author_id: currentUser.id, content: content, parent_id: parentId, likes: [] });
      } catch (err) { console.error('Comment failed:', err); fetchFeeds(); }
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
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        const ageMs = Date.now() - new Date(postToDelete.created_at).getTime();
        if (ageMs < ONE_DAY_MS) {
          const deductAmount = 50;
          const newPoints = Math.max(0, currentUser.points - deductAmount);
          await supabase.from('profiles').update({ points: newPoints }).eq('id', currentUser.id);
          await supabase.from('point_history').insert({ user_id: currentUser.id, reason: '게시글 삭제 (회수)', amount: deductAmount, type: 'use' });
          fetchUserData(currentUser.id); fetchAllPointHistory();
        }
      }
        await fetchFeeds();
    } catch (err) { console.error('삭제 실패: ', err.message); alert('삭제 실패'); }
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
  
  const handleCompleteRedemption = async (requestId) => { if (!supabase) return; try { await supabase.from('redemption_requests').update({ status: 'completed' }).eq('id', requestId); fetchRedemptionList(); } catch (err) { console.error(err); } };

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
        setShowGiftModal(false); setPreSelectedGiftUser(null); alert(`${targetUser.name}님에게 선물이 완료되었습니다! 🎁`); fetchUserData(currentUser.id); fetchPointHistory(currentUser.id); fetchAllPointHistory();
    } catch (err) { console.error(err); alert('선물하기 중 오류가 발생했습니다.'); }
  };

  const handleAdminGrantPoints = async (targetUserId, amount, reason = '관리자 특별 지급') => { 
      if (!currentUser || !supabase) return; 
      if (currentUser.role !== 'admin') return; 
      try { 
          const { data: targetUser } = await supabase.from('profiles').select('points').eq('id', targetUserId).single(); 
          if (!targetUser) return; 
          const newPoints = (targetUser.points || 0) + parseInt(amount); 
          await supabase.from('profiles').update({ points: newPoints }).eq('id', targetUserId); 
          await supabase.from('point_history').insert({ user_id: targetUserId, reason: reason, amount: parseInt(amount), type: 'earn' }); 
          alert('포인트 지급이 완료되었습니다.'); 
          fetchProfiles(); 
          fetchAllPointHistory(); 
      } catch(err) { console.error(err); } 
  };

  const handleAdminClawbackPoints = async (targetUserId, amount) => {
      if (!currentUser || !supabase) return;
      if (currentUser.role !== 'admin') return;
      try {
          const { data: targetUser } = await supabase.from('profiles').select('points').eq('id', targetUserId).single();
          if (!targetUser) return;
          const clawbackAmount = parseInt(amount);
          const newPoints = Math.max(0, (targetUser.points || 0) - clawbackAmount); 
          await supabase.from('profiles').update({ points: newPoints }).eq('id', targetUserId);
          await supabase.from('point_history').insert({ user_id: targetUserId, reason: '관리자 포인트 환수', amount: clawbackAmount, type: 'use' });
          setShowAdminClawbackModal(false);
          alert('포인트 환수가 완료되었습니다.');
          fetchProfiles(); 
          fetchAllPointHistory();
      } catch(err) { console.error(err); }
  };

  const handleAdminUpdateUser = async (userId, updates) => { try { await supabase.from('profiles').update(updates).eq('id', userId); fetchProfiles(); } catch (err) { console.error(err); } };
  const handleAdminDeleteUser = async (userId) => { if(!window.confirm('정말 삭제하시겠습니까?')) return; try { await supabase.from('profiles').delete().eq('id', userId); fetchProfiles(); } catch(err) { console.error(err); } };

  const handleLogin = async (e) => {
    e.preventDefault(); if (!checkSupabaseConfig()) return; setLoading(true);
    const email = e.target.elements.email?.value; const password = e.target.elements.password?.value;
    try {
        const { data: userCheck } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { if (userCheck === null) alert('가입되지 않은 이메일 계정입니다.'); else alert('비밀번호가 일치하지 않습니다.'); }
    } catch (err) { console.error('로그인 실패: ', err.message); alert('로그인 중 오류가 발생했습니다.'); } finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault(); if (!checkSupabaseConfig()) return; setLoading(true);
    const elements = e.target.elements;
    const name = elements.name?.value;
    const email = elements.email?.value;
    const password = elements.password?.value;
    const dept = elements.dept?.value;
    const team = elements.team?.value;
    const birthdate = elements.birthdate?.value;
    
    const emailValue = email.toLowerCase();
    if (emailValue !== 'jrussi@axa.co.kr') {
        if (emailValue.includes('@axa.co.kr') || emailValue.includes('@directasia.com')) {
            alert('⛔ @axa.co.kr 및 @directasia.com 도메인은 가입이 차단되었습니다.\n(관리자 제외)');
            setLoading(false);
            return;
        }
    }
    
    try {
        const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
        if (existingUser) { alert('이미 가입된 이메일입니다.'); setLoading(false); return; }
        const initialData = { name: name, dept: dept, team: team, role: 'member', points: INITIAL_POINTS, birthdate: birthdate, email: email };
        const { data: signUpResult, error } = await supabase.auth.signUp({ email: email, password: password, options: { data: initialData } });
        if (error) throw error;
        await supabase.from('point_history').insert({ user_id: signUpResult.user.id, reason: '최초 가입 포인트', amount: INITIAL_POINTS, type: 'earn' });
        alert('가입이 완료되었습니다. 로그인해주세요.'); setIsSignupMode(false);
    } catch (err) { console.error('가입 실패: ', err.message); alert('가입 실패: ' + err.message); } finally { setLoading(false); }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault(); 
    if (!currentUser || !checkSupabaseConfig()) return;

    const formElements = e.target.elements;
    const category = formElements.category?.value;

    if (category === 'news' && currentUser.role !== 'admin' && !currentUser.is_ambassador) {
        alert('⛔ 권한이 없습니다.\n공지사항은 관리자와 앰버서더만 작성할 수 있습니다.'); return; 
    }

    const regionMain = formElements.regionMain?.value || null; 
    const isRewardCategory = ['praise', 'knowhow', 'matjib', 'dept_news'].includes(category);
    const today = new Date().toISOString().split('T')[0];
    const todayPosts = feeds.filter(f => f.author_id === currentUser.id && f.created_at.startsWith(today)).length;
    
    if (isRewardCategory && todayPosts >= 2) {
        if(!window.confirm('하루 글쓰기 제한(2회)을 초과했습니다. 포인트 지급 없이 작성하시겠습니까?')) return;
    }

    const rewardAmountBase = 50; 
    const rewardPoints = (isRewardCategory && todayPosts < 2) ? (boosterActive ? rewardAmountBase * 2 : rewardAmountBase) : 0; 
    
    const content = formElements.content?.value;
    const title = formElements.title?.value || null;
    let targetName = formElements.targetName?.value || null;
    const regionSub = formElements.regionSub?.value || null;
    
    const praiseTargetId = formElements.targetUserId?.value || null;
    if (category === 'praise' && praiseTargetId) {
        const targetUser = profiles.find(p => p.id === praiseTargetId);
        targetName = targetUser ? targetUser.name : null;
    }

    const file = formElements.file?.files[0];
    let publicImageUrl = null;

    try {
        if (file) {
           const fileExt = file.name.split('.').pop(); 
           const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
           const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
           if (!uploadError) { 
               const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName); 
               publicImageUrl = publicUrl; 
           }
        }

        const { error: postError } = await supabase.from('posts').insert({
            content: content, type: category, author_id: currentUser.id, image_url: publicImageUrl, 
            target_name: targetName, title: title, region_main: regionMain, region_sub: regionSub, likes: [] 
        });

        if (postError) throw postError;

        if (rewardPoints > 0) {
            const newPoints = (currentUser.points || 0) + rewardPoints;
            await supabase.from('profiles').update({ points: newPoints }).eq('id', currentUser.id);
            let categoryLabel = category === 'praise' ? '칭찬하기' : category === 'matjib' ? '맛집소개' : category === 'knowhow' ? '꿀팁' : '우리팀 톡톡🏢';
            await supabase.from('point_history').insert({ user_id: currentUser.id, reason: `게시글 작성 (${categoryLabel})`, amount: rewardPoints, type: 'earn' });
        }
        
        if (category === 'praise' && praiseTargetId) {
             const currentMonthStr = new Date().toISOString().slice(0, 7); 
             const praiseHistory = allPointHistory.filter(h => 
                 h.user_id === praiseTargetId && 
                 h.reason.includes('칭찬 받음') && 
                 h.created_at.startsWith(currentMonthStr)
             );

             if (praiseHistory.length < 3) {
                 const { data: tUser } = await supabase.from('profiles').select('points').eq('id', praiseTargetId).single();
                 const tNewPoints = (tUser.points || 0) + 100;
                 await supabase.from('profiles').update({ points: tNewPoints }).eq('id', praiseTargetId);
                 await supabase.from('point_history').insert({ 
                     user_id: praiseTargetId, 
                     reason: '칭찬 받음', 
                     amount: 100, 
                     type: 'earn' 
                 });
             }
        }
        
        setShowWriteModal(false);
        fetchUserData(currentUser.id); fetchAllPointHistory(); await fetchFeeds(); 
        alert('게시글이 등록되었습니다!');

    } catch (err) { console.error('작성 실패: ', err.message); alert('게시글 등록에 실패했습니다.\n' + err.message); }
  };

  const handleMoodCheck = async (selectedMood) => {
    if (mood || !checkSupabaseConfig()) return;
    setMood('checked');
    const points = boosterActive ? 40 : 20;
    const messages = ["오늘 하루도 활기차게! 화이팅! 🚀", "당신의 열정을 응원합니다! 🔥", "좋은 일만 가득한 하루 되세요! 🍀", "힘내세요! 당신은 최고입니다! 👍", "오늘도 멋진 성과 기대할게요! 🌟"];
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
      const messages = ["오늘 하루 정말 고생 많으셨어요! 🏠", "편안한 저녁 보내세요! 🌙", "수고하셨습니다! 내일도 화이팅! 💪", "푹 쉬고 재충전하세요! 🔋"];
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
  
  // [수정] 탭 전환 시 필터 초기화 로직 분리 (HomeTab에서 넘어올 때는 필터 유지)
  const handleTabChange = (tabId, resetFilter = null) => {
      if (tabId === activeTab && !resetFilter) return;

      setActiveTab(tabId);
      if (resetFilter) {
          setActiveFeedFilter(resetFilter);
      }

      if (isSliding) return;
      const fromIdx = TAB_ORDER.indexOf(displayTab);
      const toIdx = TAB_ORDER.indexOf(tabId);
      const dir = toIdx >= fromIdx ? 1 : -1;
      setSlideDir(dir);
      setNextTab(tabId);
      setIsSliding(true);

      setTimeout(() => {
          setDisplayTab(tabId);
          setNextTab(null);
          setIsSliding(false);

          if (tabId !== 'feed') {
              setSelectedPostId(null);
          }
      }, 280);
  };

  if (!isSupabaseReady) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-blue-50 flex-col gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <p className="text-sm font-bold text-slate-500">앱을 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 font-sans">
      <div className="w-full h-[100dvh] shadow-2xl relative overflow-hidden bg-slate-50">
        <div className="relative z-10 h-full flex flex-col">
          {!session ? (
            <AuthForm isSignupMode={isSignupMode} setIsSignupMode={setIsSignupMode} handleLogin={handleLogin} handleSignup={handleSignup} loading={loading} />
          ) : (
            <>
              <Header 
                currentUser={currentUser} 
                memberCount={profiles.length} 
                onOpenUserInfo={() => setShowUserInfoModal(true)} 
                handleLogout={handleLogout} 
                onOpenChangeDept={() => setShowChangeDeptModal(true)} 
                onOpenChangePwd={() => setShowChangePwdModal(true)} 
                onOpenAdminGrant={() => setShowAdminGrantModal(true)} 
                onOpenRedemptionList={() => { fetchRedemptionList(); setShowRedemptionListModal(true); }} 
                onOpenGift={() => setShowGiftModal(true)} 
                onOpenAdminManage={() => setShowAdminManageModal(true)} 
                onOpenAdminClawback={() => setShowAdminClawbackModal(true)}
                boosterActive={boosterActive} 
              />
              <main className="flex-1 overflow-hidden">
                <div className="relative h-full overflow-hidden">
                  <div
                    className={`absolute inset-0 h-full w-full transition-transform duration-300 ease-out ${
                      isSliding ? (slideDir === 1 ? '-translate-x-full' : 'translate-x-full') : 'translate-x-0'
                    }`}
                  >
                    <div className="h-full overflow-y-auto custom-scrollbar">
                      {displayTab === 'home' && (
                        <HomeTab
                          mood={mood}
                          handleMoodCheck={handleMoodCheck}
                          handleCheckOut={handleCheckOut}
                          hasCheckedOut={hasCheckedOut}
                          feeds={feeds}
                          weeklyBirthdays={weeklyBirthdays}
                          onWriteClickWithCategory={(category) => { setWriteCategory(category); setShowWriteModal(true); }}
                          onNavigateToNews={() => { handleTabChange('news'); }}
                          // [수정] 타입 파라미터 전달 시 해당 필터를 그대로 유지하면서 이동
                          onNavigateToFeed={(type, id) => {
                            if(type) setActiveFeedFilter(type);
                            if(id) setSelectedPostId(id);
                            handleTabChange('feed');
                          }}
                          boosterActive={boosterActive}
                          currentUser={currentUser}
                          attendanceEnabled={attendanceEnabled}
                          onOpenActivityModal={(type) => { setActivityModalType(type); setShowMyActivityModal(true); }}
                          onOpenGiftForUser={(userId) => { setPreSelectedGiftUser(userId); setShowGiftModal(true); }}
                        />
                      )}

                      {(displayTab === 'feed' || displayTab === 'news') && (
                        <FeedTab
                          feeds={feeds}
                          activeFeedFilter={displayTab === 'news' ? 'news' : activeFeedFilter}
                          setActiveFeedFilter={setActiveFeedFilter}
                          onWriteClickWithCategory={(category) => { setWriteCategory(category); setShowWriteModal(true); }}
                          currentUser={currentUser}
                          handleDeletePost={handleDeletePost}
                          handleLikePost={handleLikePost}
                          handleAddComment={handleAddComment}
                          handleDeleteComment={handleDeleteComment}
                          boosterActive={boosterActive}
                          selectedPostId={selectedPostId}
                          onClearSelection={() => setSelectedPostId(null)}
                          handleLikeComment={handleLikeComment}
                        />
                      )}

                      {displayTab === 'ranking' && (
                        <RankingTab feeds={feeds} profiles={profiles} allPointHistory={allPointHistory} currentUser={currentUser} />
                      )}
                    </div>
                  </div>

                  {nextTab && (
                    <div
                      className={`absolute inset-0 h-full w-full transition-transform duration-300 ease-out ${
                        isSliding ? 'translate-x-0' : (slideDir === 1 ? 'translate-x-full' : '-translate-x-full')
                      }`}
                      style={{ transform: isSliding ? 'translateX(0)' : `translateX(${slideDir === 1 ? 100 : -100}%)` }}
                    >
                      <div className="h-full overflow-y-auto custom-scrollbar">
                        {nextTab === 'home' && (
                          <HomeTab
                            mood={mood}
                            handleMoodCheck={handleMoodCheck}
                            handleCheckOut={handleCheckOut}
                            hasCheckedOut={hasCheckedOut}
                            feeds={feeds}
                            weeklyBirthdays={weeklyBirthdays}
                            onWriteClickWithCategory={(category) => { setWriteCategory(category); setShowWriteModal(true); }}
                            onNavigateToNews={() => { handleTabChange('news'); }}
                            onNavigateToFeed={(type, id) => {
                              if(type) setActiveFeedFilter(type);
                              if(id) setSelectedPostId(id);
                              handleTabChange('feed');
                            }}
                            boosterActive={boosterActive}
                            currentUser={currentUser}
                            attendanceEnabled={attendanceEnabled}
                            onOpenActivityModal={(type) => { setActivityModalType(type); setShowMyActivityModal(true); }}
                            onOpenGiftForUser={(userId) => { setPreSelectedGiftUser(userId); setShowGiftModal(true); }}
                          />
                        )}

                        {(nextTab === 'feed' || nextTab === 'news') && (
                          <FeedTab
                            feeds={feeds}
                            activeFeedFilter={nextTab === 'news' ? 'news' : activeFeedFilter}
                            setActiveFeedFilter={setActiveFeedFilter}
                            onWriteClickWithCategory={(category) => { setWriteCategory(category); setShowWriteModal(true); }}
                            currentUser={currentUser}
                            handleDeletePost={handleDeletePost}
                            handleLikePost={handleLikePost}
                            handleAddComment={handleAddComment}
                            handleDeleteComment={handleDeleteComment}
                            boosterActive={boosterActive}
                            selectedPostId={selectedPostId}
                            onClearSelection={() => setSelectedPostId(null)}
                            handleLikeComment={handleLikeComment}
                          />
                        )}

                        {nextTab === 'ranking' && (
                          <RankingTab feeds={feeds} profiles={profiles} allPointHistory={allPointHistory} currentUser={currentUser} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </main>
              <BottomNav activeTab={activeTab} onTabChange={handleTabChange}  onFabClick={() => { setWriteCategory(null); setShowWriteModal(true); }} />
              
              {showWriteModal && <WriteModal setShowWriteModal={setShowWriteModal} handlePostSubmit={handlePostSubmit} currentUser={currentUser} activeTab={activeTab} boosterActive={boosterActive} initialCategory={writeCategory} profiles={profiles} />}
              {showUserInfoModal && currentUser && <UserInfoModal currentUser={currentUser} pointHistory={pointHistory} setShowUserInfoModal={setShowUserInfoModal} handleRedeemPoints={handleRedeemPoints} />}
              {showBirthdayPopup && currentUser && <BirthdayPopup currentUser={currentUser} handleBirthdayGrant={handleBirthdayGrant} setShowBirthdayPopup={setShowBirthdayPopup} />}
              {showGiftModal && <GiftModal onClose={() => setShowGiftModal(false)} onGift={handleGiftPoints} profiles={profiles} currentUser={currentUser} pointHistory={pointHistory} preSelectedUserId={preSelectedGiftUser} />}
              {showGiftNotificationModal && <GiftNotificationModal onClose={() => setShowGiftNotificationModal(false)} gifts={newGifts} />}
              {showAdminGrantPopup && newAdminGrants.length > 0 && <AdminGrantPopup grants={newAdminGrants} onClose={() => setShowAdminGrantPopup(false)} />}
              
              {showAdminManageModal && <AdminManageModal onClose={() => setShowAdminManageModal(false)} profiles={profiles} onUpdateUser={handleAdminUpdateUser} onDeleteUser={handleAdminDeleteUser} boosterActive={boosterActive} setBoosterActive={setBoosterActive} />}
              {showChangeDeptModal && <ChangeDeptModal onClose={() => setShowChangeDeptModal(false)} onSave={handleChangeDept} />}
              {showChangePwdModal && <ChangePasswordModal onClose={() => setShowChangePwdModal(false)} onSave={handleChangePassword} />}
              {showMyActivityModal && <MyActivityModal onClose={() => setShowMyActivityModal(false)} type={activityModalType} feeds={feeds} currentUser={currentUser} />}

              {showAdminGrantModal && (
                  <AdminGrantModal 
                      onClose={() => setShowAdminGrantModal(false)} 
                      onGrant={handleAdminGrantPoints} 
                      profiles={profiles} 
                      feeds={feeds}
                      allPointHistory={allPointHistory}
                  />
              )}
              {showAdminClawbackModal && <AdminClawbackModal onClose={() => setShowAdminClawbackModal(false)} onClawback={handleAdminClawbackPoints} profiles={profiles} />}
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