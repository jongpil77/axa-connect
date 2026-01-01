const Header = ({ currentUser, onOpenUserInfo, handleLogout, onOpenChangeDept, onOpenChangePwd, onOpenAdminGrant, onOpenRedemptionList, onOpenGift, onOpenAdminManage, onOpenAdminClawback, boosterActive }) => {
  const todayDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const [showSettings, setShowSettings] = useState(false);
  
  return (
    <div className="bg-white/80 backdrop-blur-md p-4 sticky top-0 z-30 border-b border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-1">
          <div className="text-[10px] text-blue-400 font-bold pl-1">{todayDate}</div>
          <div className="text-[10px] bg-[#00008F] text-white px-2 py-0.5 rounded-lg font-bold flex items-center gap-2 shadow-sm">
              {currentUser && <span>{currentUser.team} - {currentUser.name} 님</span>}
          </div>
      </div>
      
      {/* [수정] justify-between으로 좌/우측 끝으로 배치 */}
      <div className="flex justify-between items-end">
        
        {/* 좌측 로고 영역 */}
        <div className="flex items-center gap-1 relative mt-1">
            <img src={AXA_LOGO_URL} alt="AXA Logo" className="w-10 h-auto mr-1" />
            
            {/* [수정] AXA와 Plug 정렬 로직 변경 */}
            <div className="flex flex-col relative leading-none">
                {/* 1행: AXA + 플러그 (양끝 정렬하여 Plug를 Connect 우측 끝과 맞춤) */}
                <div className="flex justify-between items-center w-full">
                    <span className="text-xl font-black text-slate-800 tracking-tighter">AXA</span>
                    <Plug className="w-4 h-4 text-blue-500 fill-blue-500 mb-0.5" />
                </div>
                {/* 2행: Connect */}
                <span className="text-xl font-black text-slate-800 tracking-tighter -mt-1.5">Connect</span>
            </div>
        </div>
        
        {/* 우측 포인트/선물/설정 영역 (전체 우측 이동됨) */}
        <div className="flex items-center gap-2 relative">
          <div className="flex items-center gap-2 mr-1 cursor-pointer" onClick={onOpenUserInfo}>
             <div className="flex flex-col items-end leading-none relative">
                 {/* 포인트 부스터 */}
                 {boosterActive && (
                     <div className="absolute -top-3 right-0 text-[8px] bg-white text-red-500 px-1.5 py-0.5 rounded-full font-black animate-pulse whitespace-nowrap flex items-center gap-0.5 shadow-sm border border-red-200">
                         <Zap className="w-2 h-2 fill-red-500" /> 
                         <span>포인트 2배</span>
                     </div>
                 )}
                 <span className="text-[11px] text-slate-500 font-black whitespace-nowrap">MY CARE</span>
                 <span className="text-[11px] text-slate-500 font-black whitespace-nowrap">POINT</span>
             </div>
             
             <div className="bg-yellow-50 px-3 py-1 rounded-xl border border-yellow-200 shadow-sm flex items-center gap-1">
                 <span className="text-2xl font-black text-blue-700 animate-pulse leading-none pt-0.5">{currentUser?.points?.toLocaleString()}</span>
                 <div className="w-6 h-6 rounded-full bg-yellow-400 border border-yellow-500 flex items-center justify-center shadow-sm relative">
                    <span className="text-[10px] font-black text-yellow-600 drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">P</span>
                 </div>
             </div>
          </div>
          
          {/* 선물하기 버튼 */}
          <button onClick={onOpenGift} className="p-1.5 rounded-full hover:bg-slate-100 active:scale-95 transition-all relative text-2xl">🎁</button>

          {/* 설정 버튼 */}
          <div className="flex flex-col items-center">
              <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors relative z-40"><Settings className="w-6 h-6 text-slate-400" /></button>
              <span className="text-[8px] text-slate-400 font-bold -mt-0.5">설정</span>
          </div>
          
          {/* 설정 메뉴 드롭다운 (기존 코드 유지) */}
          {showSettings && (
             <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50 animate-fade-in">
                <button onClick={() => { setShowSettings(false); onOpenChangeDept(); }} className="flex items-center gap-2 w-full p-3 text-xs text-slate-600 hover:bg-slate-50 border-b border-slate-50 transition-colors"><Edit3 className="w-3.5 h-3.5 text-blue-400"/> 소속/팀 변경</button>
                <button onClick={() => { setShowSettings(false); onOpenChangePwd(); }} className="flex items-center gap-2 w-full p-3 text-xs text-slate-600 hover:bg-slate-50 border-b border-slate-50 transition-colors"><Key className="w-3.5 h-3.5 text-blue-400"/> 비밀번호 변경</button>
                {currentUser?.role === 'admin' && (
                    <>
                    <button onClick={() => { setShowSettings(false); onOpenAdminManage(); }} className="flex items-center gap-2 w-full p-3 text-xs text-slate-800 font-bold hover:bg-slate-50 border-b border-slate-50 transition-colors"><Users className="w-3.5 h-3.5 text-slate-600"/> 사용자/이벤트 관리</button>
                    <button onClick={() => { setShowSettings(false); onOpenAdminGrant(); }} className="flex items-center gap-2 w-full p-3 text-xs text-blue-600 font-bold hover:bg-blue-50 border-b border-slate-50 transition-colors"><Gift className="w-3.5 h-3.5 text-blue-500"/> 포인트 지급 (관리자)</button>
                    <button onClick={() => { setShowSettings(false); onOpenAdminClawback(); }} className="flex items-center gap-2 w-full p-3 text-xs text-red-600 font-bold hover:bg-red-50 border-b border-slate-50 transition-colors"><MinusCircle className="w-3.5 h-3.5 text-red-500"/> 포인트 환수 (관리자)</button>
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