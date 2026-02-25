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
    '인천': ['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구']
};

const INITIAL_POINTS = 1000;

// 365일 명언 (간소화)
const MOTTO_365 = Array(365).fill('오늘의 노력이 내일의 당신을 만듭니다. 힘내세요!');

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
        if (isToday(birthDate)) todayBirthdays.push({ ...p, date: `${m}/${d}` });
    });
    return { current: todayBirthdays, next: tomorrowBirthdays };
};

// --- Sub Components ---

const CommunityLogo = ({ className = "w-12 h-12" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="absolute inset-0 bg-blue-500/10 rounded-2xl rotate-6 animate-pulse"></div>
    <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg border border-white/20">
      <Users className="text-white w-full h-full" />
      <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 fill-yellow-300 animate-bounce" />
    </div>
  </div>
);

const MoodToast = ({ message, emoji, visible }) => {
    if (!visible) return null;
    return (
        <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in-up w-[90%] max-w-sm pointer-events-none">
            <div className="bg-slate-900/95 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700">
                <span className="text-3xl">{emoji}</span>
                <span className="text-base font-bold leading-relaxed whitespace-pre-line">{message}</span>
            </div>
        </div>
    );
};

// [신규] 나의 활동 상세 모달
const ActivityDetailModal = ({ type, data, onClose, onNavigateToFeed }) => {
    const titles = {
        posts: "내가 작성한 글",
        comments: "내가 작성한 댓글",
        praises: "나를 칭찬한 글",
        likes: "내가 좋아요 한 글"
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-800">{titles[type]}</h3>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {data.length > 0 ? data.map((item, idx) => (
                        <div key={idx} onClick={() => item.post_id ? onNavigateToFeed(item.type, item.post_id) : onNavigateToFeed(item.type, item.id)} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-blue-50 transition-colors">
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
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 border border-white/50 animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="text-center mb-10 mt-6 flex flex-col items-center">
          <CommunityLogo className="w-16 h-16 mb-6" />
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Connect Hub</h1>
          <p className="text-slate-500 text-sm font-medium">함께 만드는 우리들의 커뮤니티 공간🚀</p>
        </div>

        {isSignupMode ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <input name="name" type="text" placeholder="이름" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" required />
            <div>
                <input name="email" type="email" placeholder="이메일 입력" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" required />
                <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold">* 관리자(jrussi) 외 회사 메일(@axa.co.kr) 가입 불가</p>
            </div>
            <input name="birthdate" type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-slate-500" required />
            <input name="password" type="password" placeholder="비밀번호 (숫자 6자리 이상)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" required minLength="6" />
            
            <div className="grid grid-cols-2 gap-2">
                <select name="dept" className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" onChange={(e) => setSelectedDept(e.target.value)} required>
                    <option value="">본부 선택</option>
                    {Object.keys(ORGANIZATION).map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
                <select name="team" className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" disabled={!selectedDept} required>
                    <option value="">팀 선택</option>
                    {selectedDept && ORGANIZATION[selectedDept].map(team => <option key={team} value={team}>{team}</option>)}
                </select>
            </div>

            <div className="p-3 bg-red-50 rounded-2xl border border-red-100 flex gap-2 items-start cursor-pointer" onClick={() => setSecurityAgreed(!securityAgreed)}>
              <div className={`mt-1 w-4 h-4 rounded border flex items-center justify-center ${securityAgreed ? 'bg-blue-600 border-blue-600' : 'bg-white'}`}>
                {securityAgreed && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <p className="text-[10px] text-slate-600 leading-tight">개인정보 및 회사 영업비밀 등록 금지 사항에 동의합니다. (필수)</p>
            </div>

            <button type="submit" disabled={loading || !securityAgreed} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-all flex justify-center">
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : '가입 완료 (1,000P 지급)'}
            </button>
            <button type="button" onClick={() => setIsSignupMode(false)} className="w-full text-slate-400 text-xs py-2">로그인으로 돌아가기</button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input name="email" type="email" placeholder="이메일" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" required />
            <input name="password" type="password" placeholder="비밀번호" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" required />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex justify-center">
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

// --- Main Components ---

const Header = ({ currentUser, onOpenUserInfo, handleLogout, onOpenGift, onOpenAdminManage, boosterActive }) => {
  const [showSettings, setShowSettings] = useState(false);
  
  return (
    <div className="bg-white/95 backdrop-blur-xl px-4 pt-6 pb-4 sticky top-0 z-40 border-b border-slate-100 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <CommunityLogo className="w-10 h-10" />
            <div className="flex flex-col leading-none">
                <span className="text-xl font-black text-slate-800">Connect</span>
                <span className="text-[10px] font-black text-blue-500 tracking-widest uppercase">Hub</span>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end" onClick={onOpenUserInfo}>
            <span className="text-[10px] font-bold text-slate-400">My Point</span>
            <div className="flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                <Coins className="w-3.5 h-3.5 text-amber-600 fill-amber-600"/>
                <span className="text-sm font-black text-amber-900">{currentUser?.points?.toLocaleString()}</span>
            </div>
          </div>
          
          <button onClick={onOpenGift} className="p-2 bg-yellow-400 text-white rounded-full shadow-lg active:scale-90 transition-transform">
             <Gift className="w-5 h-5" />
          </button>

          <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-slate-100 rounded-full">
            <Settings className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>
      
      {showSettings && (
          <div className="absolute right-4 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-up">
              {currentUser?.role === 'admin' && (
                  <button onClick={() => { setShowSettings(false); onOpenAdminManage(); }} className="w-full p-4 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                      <Users className="w-4 h-4" /> 관리자 메뉴
                  </button>
              )}
              <button onClick={handleLogout} className="w-full p-4 text-left text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> 로그아웃
              </button>
          </div>
      )}
    </div>
  );
};

const HomeTab = ({ mood, handleMoodCheck, handleCheckOut, hasCheckedOut, feeds, weeklyBirthdays, currentUser, onNavigateToFeed, onActivityClick }) => {
    const myActivity = useMemo(() => {
      const myId = currentUser?.id;
      if (!myId) return { posts: [], comments: [], praises: [], likes: [] };
      const posts = feeds.filter(f => f.author_id === myId);
      const praises = feeds.filter(f => f.type === 'praise' && f.target_name === currentUser.name);
      const comments = feeds.flatMap(f => (f.comments || []).filter(c => c.author_id === myId).map(c => ({ ...c, type: f.type, post_id: f.id })));
      const likes = feeds.filter(f => Array.isArray(f.likes) && f.likes.includes(myId));
      return { posts, comments, praises, likes };
    }, [feeds, currentUser]);

    return (
      <div className="px-4 py-6 space-y-6 pb-32 animate-fade-in">
        {/* 출퇴근 섹션 */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" /> 출퇴근 체크 (각 +20P)
            </h3>
            <div className="grid grid-cols-2 gap-3">
                {!mood ? (
                    <div className="col-span-1 grid grid-cols-3 gap-1">
                        <button onClick={() => handleMoodCheck('good')} className="p-2 bg-blue-50 rounded-xl flex flex-col items-center"><Smile className="text-blue-500"/><span className="text-[10px] mt-1 font-bold">좋음</span></button>
                        <button onClick={() => handleMoodCheck('normal')} className="p-2 bg-green-50 rounded-xl flex flex-col items-center"><Meh className="text-green-500"/><span className="text-[10px] mt-1 font-bold">보통</span></button>
                        <button onClick={() => handleMoodCheck('tired')} className="p-2 bg-orange-50 rounded-xl flex flex-col items-center"><Frown className="text-orange-500"/><span className="text-[10px] mt-1 font-bold">피곤</span></button>
                    </div>
                ) : (
                    <div className="bg-blue-600 text-white rounded-2xl flex flex-col items-center justify-center p-3">
                        <CheckCircle className="w-6 h-6 mb-1"/>
                        <span className="text-xs font-bold">출근 완료</span>
                    </div>
                )}
                <button onClick={handleCheckOut} disabled={!mood || hasCheckedOut} className={`rounded-2xl flex flex-col items-center justify-center p-3 transition-all ${hasCheckedOut ? 'bg-slate-100 text-slate-400' : 'bg-slate-800 text-white shadow-lg active:scale-95'}`}>
                    <LogOut className="w-6 h-6 mb-1"/>
                    <span className="text-xs font-bold">{hasCheckedOut ? '퇴근 완료' : '퇴근하기'}</span>
                </button>
            </div>
        </div>

        {/* 나의 활동 섹션 */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-800 mb-4">📊 나의 활동 현황</h3>
            <div className="grid grid-cols-2 gap-4">
                {[
                    { label: '작성 글', key: 'posts', icon: <Pencil className="w-4 h-4 text-blue-500"/>, count: myActivity.posts.length },
                    { label: '작성 댓글', key: 'comments', icon: <MessageCircle className="w-4 h-4 text-green-500"/>, count: myActivity.comments.length },
                    { label: '받은 칭찬', key: 'praises', icon: <Medal className="w-4 h-4 text-amber-500"/>, count: myActivity.praises.length },
                    { label: '좋아요 한 글', key: 'likes', icon: <Heart className="w-4 h-4 text-red-500 fill-red-500"/>, count: myActivity.likes.length },
                ].map(item => (
                    <div key={item.key} onClick={() => onActivityClick(item.key, myActivity[item.key])} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center cursor-pointer hover:bg-white transition-all shadow-sm">
                        <div className="flex items-center gap-2">
                            {item.icon}
                            <span className="text-xs font-bold text-slate-600">{item.label}</span>
                        </div>
                        <span className="text-lg font-black text-slate-800">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* [수정] 피드 리스트 내 신규 게시글 마크 적용 로직은 FeedTab 및 여기서 호출하는 리스트 아이템에 반영됨 */}
        <div className="bg-blue-50/50 p-6 rounded-[2.5rem] border border-blue-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800">🏢 우리팀 톡톡</h3>
                <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-3">
                {feeds.filter(f => f.type === 'dept_news').slice(0, 3).map(feed => (
                    <div key={feed.id} onClick={() => onNavigateToFeed(feed.type, feed.id)} className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center relative overflow-hidden">
                        <span className="text-sm font-bold text-slate-700 truncate pr-8">{feed.title}</span>
                        {isToday(feed.created_at) && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                <span className="text-[10px] text-white font-black">N</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
};

const FeedTab = ({ feeds, activeFeedFilter, setActiveFeedFilter, currentUser, handleLikePost, handleAddComment, handleLikeComment }) => {
    const filtered = feeds.filter(f => activeFeedFilter === 'all' || f.type === activeFeedFilter);

    return (
        <div className="px-4 py-6 space-y-6 pb-32 animate-fade-in">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {[{id:'all', label:'전체'}, {id:'praise', label:'칭찬'}, {id:'dept_news', label:'팀소식'}, {id:'knowhow', label:'꿀팁'}].map(tab => (
                    <button key={tab.id} onClick={() => setActiveFeedFilter(tab.id)} className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${activeFeedFilter === tab.id ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200'}`}>{tab.label}</button>
                ))}
            </div>

            {filtered.map(feed => (
                <div key={feed.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative">
                    {isToday(feed.created_at) && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-md z-10">
                            <span className="text-[11px] text-white font-black">N</span>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">{feed.author?.substring(0,1)}</div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">{feed.author} <span className="text-[10px] text-slate-400">({feed.team})</span></p>
                            <p className="text-[10px] text-slate-300">{new Date(feed.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <h4 className="text-base font-bold text-slate-800 mb-2">{feed.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap">{feed.content}</p>

                    <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                        <button onClick={() => handleLikePost(feed.id, feed.likes)} className={`flex items-center gap-1.5 text-xs font-bold ${feed.isLiked ? 'text-red-500' : 'text-slate-400'}`}>
                            <Heart className={`w-4 h-4 ${feed.isLiked ? 'fill-red-500' : ''}`} /> {feed.likes?.length || 0}
                        </button>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <MessageCircle className="w-4 h-4" /> {feed.comments?.length || 0}
                        </div>
                    </div>

                    {/* 댓글 섹션 */}
                    <div className="mt-4 space-y-3">
                        {feed.comments?.map(comment => (
                            <div key={comment.id} className="bg-slate-50 p-3 rounded-2xl text-sm border border-slate-100">
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-slate-700 text-xs">{comment.profiles?.name}</span>
                                    <button onClick={() => handleLikeComment(feed.id, comment.id, comment.likes)} className={`flex items-center gap-1 text-[10px] font-bold ${comment.isLiked ? 'text-red-500' : 'text-slate-400'}`}>
                                        좋아요 {comment.likes?.length || 0}
                                    </button>
                                </div>
                                <p className="text-slate-600 text-xs">{comment.content}</p>
                            </div>
                        ))}
                        <form onSubmit={(e) => { e.preventDefault(); handleAddComment(feed.id, e.target.comment.value); e.target.reset(); }} className="flex gap-2 mt-2">
                            <input name="comment" placeholder="댓글 입력..." className="flex-1 bg-slate-100 border-none rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 ring-blue-500" />
                            <button type="submit" className="p-2 text-blue-600"><Send className="w-4 h-4"/></button>
                        </form>
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- App Main ---

export default function App() {
  const [supabase, setSupabase] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [feeds, setFeeds] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [activeFeedFilter, setActiveFeedFilter] = useState('all');
  const [toast, setToast] = useState({ visible: false, message: '', emoji: '' });
  
  const [mood, setMood] = useState(null);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [showBirthdayPopup, setShowBirthdayPopup] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [activityModal, setActivityModal] = useState({ visible: false, type: '', data: [] });

  // 1. Supabase 초기화
  useEffect(() => {
    const initSupabase = async () => {
        if (window.supabase) {
            const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            setSupabase(client);
            const { data: { session } } = await client.auth.getSession();
            setSession(session);
            if (session) fetchUserData(client, session.user.id);
        }
    };
    initSupabase();
  }, []);

  const fetchUserData = async (client, userId) => {
      const { data } = await client.from('profiles').select('*').eq('id', userId).single();
      if (data) {
          setCurrentUser(data);
          const today = new Date().toISOString().split('T')[0];
          if (data.last_attendance === today) setMood('checked');
          if (localStorage.getItem(`checkout_${userId}_${today}`)) setHasCheckedOut(true);
          if (data.birthdate && data.birthdate.includes(`${new Date().getMonth()+1}-${new Date().getDate()}`) && !data.birthday_granted) {
              setShowBirthdayPopup(true);
          }
      }
      const { data: ps } = await client.from('profiles').select('*');
      setProfiles(ps || []);
      fetchFeeds(client, userId);
  };

  const fetchFeeds = async (client, userId) => {
      const { data } = await client.from('posts').select(`*, profiles(*), comments(*, profiles(*))`).order('created_at', { ascending: false });
      if (data) {
          const formatted = data.map(f => ({
              ...f,
              author: f.profiles?.name,
              team: f.profiles?.team,
              likes: f.likes || [],
              isLiked: (f.likes || []).includes(userId),
              comments: (f.comments || []).map(c => ({
                  ...c,
                  likes: c.likes || [],
                  isLiked: (c.likes || []).includes(userId)
              }))
          }));
          setFeeds(formatted);
      }
  };

  // 2. 가입 로직 (이메일 필터 적용)
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { name, email, password, dept, team, birthdate } = e.target;
    const emailVal = email.value.toLowerCase();

    // 이메일 정책 체크
    const isAxaEmail = emailVal.endsWith('@axa.co.kr') || emailVal.endsWith('@directasia.com');
    const isAdminEmail = emailVal === 'jrussi@axa.co.kr';

    if (isAxaEmail && !isAdminEmail) {
        alert("⛔ 보안 정책상 회사 메일(@axa.co.kr)로는 가입할 수 없습니다.\n개인 메일(Gmail, Naver 등)을 이용해 주세요.");
        setLoading(false);
        return;
    }

    try {
        const { data: res, error } = await supabase.auth.signUp({
            email: emailVal,
            password: password.value,
            options: { data: { name: name.value, dept: dept.value, team: team.value, points: INITIAL_POINTS, birthdate: birthdate.value, role: isAdminEmail ? 'admin' : 'member' } }
        });
        if (error) throw error;
        await supabase.from('point_history').insert({ user_id: res.user.id, reason: '최초 가입 포인트', amount: INITIAL_POINTS, type: 'earn' });
        alert("가입 성공! 로그인해 주세요.");
        setIsSignupMode(false);
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: e.target.email.value, password: e.target.password.value });
        if (error) throw error;
        setSession(data.session);
        fetchUserData(supabase, data.session.user.id);
    } catch (err) { alert("로그인 실패: 이메일 또는 비밀번호를 확인하세요."); } finally { setLoading(false); }
  };

  // 3. 출근/퇴근 (오류 수정)
  const handleMoodCheck = async (m) => {
    if (!currentUser) return;
    const today = new Date().toISOString().split('T')[0];
    const points = 20;
    try {
        await supabase.from('profiles').update({ points: currentUser.points + points, last_attendance: today }).eq('id', currentUser.id);
        await supabase.from('point_history').insert({ user_id: currentUser.id, reason: '출근 체크', amount: points, type: 'earn' });
        setMood('checked');
        setToast({ visible: true, message: `출근 완료! 즐거운 하루 되세요.\n(+${points}P)`, emoji: '☀️' });
        fetchUserData(supabase, currentUser.id);
        setTimeout(() => setToast({ visible: false }), 3000);
    } catch (err) { console.error(err); }
  };

  const handleCheckOut = async () => {
    if (!currentUser || hasCheckedOut) return;
    const today = new Date().toISOString().split('T')[0];
    const points = 20;
    try {
        await supabase.from('profiles').update({ points: currentUser.points + points }).eq('id', currentUser.id);
        await supabase.from('point_history').insert({ user_id: currentUser.id, reason: '퇴근 체크', amount: points, type: 'earn' });
        localStorage.setItem(`checkout_${currentUser.id}_${today}`, 'true');
        setHasCheckedOut(true);
        setToast({ visible: true, message: `오늘 하루 고생 많으셨습니다!\n(+${points}P)`, emoji: '🌙' });
        fetchUserData(supabase, currentUser.id);
        setTimeout(() => setToast({ visible: false }), 3000);
    } catch (err) { console.error(err); }
  };

  // 4. 댓글 좋아요 및 포인트 지급
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
    try {
        await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);
        fetchFeeds(supabase, currentUser.id);
    } catch (err) { console.error(err); }
  };

  const handleAddComment = async (postId, content) => {
      try {
          await supabase.from('comments').insert({ post_id: postId, author_id: currentUser.id, content });
          // 댓글 작성 시 본인에게 5P 지급 (선택 사항)
          await supabase.from('profiles').update({ points: currentUser.points + 5 }).eq('id', currentUser.id);
          await supabase.from('point_history').insert({ user_id: currentUser.id, reason: '댓글 작성 포인트', amount: 5, type: 'earn' });
          fetchFeeds(supabase, currentUser.id);
          fetchUserData(supabase, currentUser.id);
      } catch (err) { console.error(err); }
  };

  // 5. 생일자 추가 선물 (선물 모달 연결)
  const openGiftForBirthday = (targetId) => {
      setShowBirthdayPopup(false);
      setShowGiftModal(true);
      // 선물 모달에서 해당 유저가 자동 선택되도록 로직 추가 가능
  };

  const handleBirthdayGrant = async () => {
      await supabase.from('profiles').update({ points: currentUser.points + 1000, birthday_granted: true }).eq('id', currentUser.id);
      await supabase.from('point_history').insert({ user_id: currentUser.id, reason: '생일 축하 포인트', amount: 1000, type: 'earn' });
      setShowBirthdayPopup(false);
      fetchUserData(supabase, currentUser.id);
      alert("🎂 생일 축하 포인트 1,000P가 지급되었습니다!");
  };

  if (!supabase) return <div className="h-screen flex items-center justify-center font-bold">로딩 중...</div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 shadow-2xl relative overflow-x-hidden">
      {!session ? (
          <AuthForm isSignupMode={isSignupMode} setIsSignupMode={setIsSignupMode} handleLogin={handleLogin} handleSignup={handleSignup} loading={loading} />
      ) : (
          <>
            <Header currentUser={currentUser} onOpenUserInfo={() => setShowUserInfoModal(true)} onOpenGift={() => setShowGiftModal(true)} handleLogout={() => supabase.auth.signOut().then(()=>setSession(null))} />
            
            <main className="h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
                {activeTab === 'home' && (
                    <HomeTab 
                        mood={mood} handleMoodCheck={handleMoodCheck} handleCheckOut={handleCheckOut} hasCheckedOut={hasCheckedOut} 
                        feeds={feeds} currentUser={currentUser} 
                        onNavigateToFeed={(type, id) => { setActiveTab('feed'); setActiveFeedFilter(type); }}
                        onActivityClick={(type, data) => setActivityModal({ visible: true, type, data })}
                    />
                )}
                {activeTab === 'feed' && (
                    <FeedTab 
                        feeds={feeds} activeFeedFilter={activeFeedFilter} setActiveFeedFilter={setActiveFeedFilter} 
                        currentUser={currentUser} handleLikePost={handleLikePost} handleAddComment={handleAddComment} 
                        handleLikeComment={handleLikeComment}
                    />
                )}
            </main>

            {/* 바텀 네비게이션 */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t flex justify-around p-4 z-50">
                <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <Home /> <span className="text-[10px] font-bold">홈</span>
                </button>
                <button onClick={() => { setActiveTab('feed'); setActiveFeedFilter('all'); }} className={`flex flex-col items-center ${activeTab === 'feed' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <MessageCircle /> <span className="text-[10px] font-bold">피드</span>
                </button>
                <button onClick={() => setShowWriteModal(true)} className="bg-blue-600 text-white p-3 rounded-full -mt-8 shadow-xl">
                    <Plus />
                </button>
                <button onClick={() => setActiveTab('ranking')} className="text-slate-400 flex flex-col items-center">
                    <Award /> <span className="text-[10px] font-bold">랭킹</span>
                </button>
                <button onClick={() => setShowUserInfoModal(true)} className="text-slate-400 flex flex-col items-center">
                    <User /> <span className="text-[10px] font-bold">내정보</span>
                </button>
            </div>

            {/* 모달들 */}
            {activityModal.visible && <ActivityDetailModal {...activityModal} onClose={() => setActivityModal({ ...activityModal, visible: false })} onNavigateToFeed={(type, id) => { setActivityModal({ ...activityModal, visible: false }); setActiveTab('feed'); setActiveFeedFilter(type); }} />}
            {showBirthdayPopup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-[2.5rem] p-8 text-center shadow-2xl animate-bounce-in">
                        <span className="text-6xl">🎂</span>
                        <h2 className="text-2xl font-black mt-4">Happy Birthday!</h2>
                        <p className="text-slate-500 mt-2">오늘 생일이시군요! 축하드립니다.</p>
                        <div className="mt-6 flex flex-col gap-2">
                            <button onClick={handleBirthdayGrant} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold">1,000P 받기</button>
                        </div>
                    </div>
                </div>
            )}
            <MoodToast visible={toast.visible} message={toast.message} emoji={toast.emoji} />
          </>
      )}
    </div>
  );
}