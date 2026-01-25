// --- [추가] 개인 활동 통계 컴포넌트 ---
const UserActivityStats = ({ feeds, currentUser }) => {
  const stats = useMemo(() => {
    if (!currentUser) return { posts: 0, myComments: 0, receivedComments: 0, receivedLikes: 0 };
    
    const myPosts = feeds.filter(f => f.author_id === currentUser.id);
    const myCommentsCount = feeds.reduce((acc, f) => 
      acc + (f.comments?.filter(c => c.author_id === currentUser.id).length || 0), 0);
    const receivedCommentsCount = myPosts.reduce((acc, f) => acc + (f.comments?.length || 0), 0);
    const receivedLikesCount = myPosts.reduce((acc, f) => acc + (f.likes?.length || 0), 0);

    return {
      posts: myPosts.length,
      myComments: myCommentsCount,
      receivedComments: receivedCommentsCount,
      receivedLikes: receivedLikesCount
    };
  }, [feeds, currentUser]);

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-4 grid grid-cols-4 gap-2">
      <div className="text-center">
        <p className="text-[9px] text-slate-400 font-bold mb-1">작성글</p>
        <p className="text-sm font-black text-slate-800">{stats.posts}</p>
      </div>
      <div className="text-center border-l border-slate-50">
        <p className="text-[9px] text-slate-400 font-bold mb-1">내 댓글</p>
        <p className="text-sm font-black text-slate-800">{stats.myComments}</p>
      </div>
      <div className="text-center border-l border-slate-50">
        <p className="text-[9px] text-slate-400 font-bold mb-1">받은댓글</p>
        <p className="text-sm font-black text-blue-600">{stats.receivedComments}</p>
      </div>
      <div className="text-center border-l border-slate-50">
        <p className="text-[9px] text-slate-400 font-bold mb-1">받은좋아요</p>
        <p className="text-sm font-black text-red-500">{stats.receivedLikes}</p>
      </div>
    </div>
  );
};

// --- [수정] Header 컴포넌트 (포인트 영역 정렬) ---
const Header = ({ currentUser, onOpenUserInfo, boosterActive, ...props }) => {
  return (
    <div className="bg-white/95 backdrop-blur-xl p-4 sticky top-0 z-40 border-b border-slate-100 shadow-sm">
      {/* ... 상단 로고 생략 ... */}
      <div className="flex items-center gap-2 mr-1 cursor-pointer" onClick={onOpenUserInfo}>
        <div className="flex flex-col items-center leading-none relative"> {/* items-center로 변경 */}
          {boosterActive && (
            <div className="absolute -top-5 right-0 text-[9px] bg-red-50 text-[#C60C30] px-2 py-0.5 rounded-full font-black animate-pulse border border-red-100">
              <Zap className="w-3 h-3 inline mr-0.5 fill-[#C60C30]" /> 2배
            </div>
          )}
          <span className="text-[10px] text-slate-500 font-black mb-1">My CARE Point</span>
          <div className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-yellow-100 px-3 py-1.5 rounded-lg shadow-sm border border-yellow-200">
            <span className="text-xl font-black text-amber-900">{currentUser?.points?.toLocaleString()}</span>
            <span className="text-[11px] font-bold text-amber-700">P</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- [수정] HomeTab 내 포인트 보너스 문구 동적 처리 ---
// const rewardAmount = boosterActive ? 100 : 50; 로직 적용

// --- [수정] BottomNav (모바일 최하단 배치) ---
const BottomNav = ({ activeTab, onTabChange }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-2 z-30 flex justify-around items-center h-20 pb-6">
            {/* pb-6를 통해 시스템 네비게이션 바 영역 확보 및 버튼 가독성 증대 */}
            {/* 버튼 렌더링 로직... */}
        </div>
    );
};