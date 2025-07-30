// src/app/admin/page.tsx 전체 코드 (app -> row 변수명 오류 수정)

'use client';

import React, { useEffect, useState, FormEvent, useMemo } from 'react';
import type { Application } from '@/types';

const HistoryModal = ({ isOpen, onClose, history, nickname }: { isOpen: boolean; onClose: () => void; history: Application[]; nickname: string; }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
        <div className="p-4 border-b flex justify-between items-center"><h3 className="text-lg font-semibold">{`${nickname} 님의 수정 이력 / History`}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">×</button></div>
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50 sticky top-0"><tr><th className="p-2 text-left font-semibold">신청일 (Version)</th><th className="p-2 text-left font-semibold">서버/연맹</th><th className="p-2 text-left font-semibold">전투력</th><th className="p-2 text-left font-semibold">주력군종</th><th className="p-2 text-left font-semibold">등급</th><th className="p-2 text-left font-semibold">목표연맹</th><th className="p-2 text-center font-semibold">이미지</th></tr></thead>
            <tbody className="divide-y">
              {history.map(app => (
                <tr key={app.createdAt}><td className="p-2">{new Date(app.createdAt).toLocaleString('ko-KR')}</td><td className="p-2">{app.currentServerAndAlliance}</td><td className="p-2">{app.heroPower}</td><td className="p-2">{app.mainSquad}</td><td className="p-2">{app.immigrationGrade}</td><td className="p-2">{app.targetAlliance}</td><td className="p-2 text-center">{app.image ? <a href={app.image} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">보기</a> : '없음'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t text-right"><button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-300">닫기</button></div>
      </div>
    </div>
  );
};
const CommentIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto text-gray-500 hover:text-blue-600 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg> );
const CommentModal = ({ isOpen, onClose, comment }: { isOpen: boolean; onClose: () => void; comment: string; }) => { if (!isOpen) return null; return ( <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}><div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}><div className="p-4 border-b flex justify-between items-center"><h3 className="text-lg font-semibold">코멘트</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">×</button></div><div className="p-6 whitespace-pre-wrap text-gray-700 max-h-80 overflow-y-auto">{comment}</div><div className="p-4 border-t text-right"><button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-300">닫기</button></div></div></div> ); };
type SortConfig = { key: keyof Application | null; direction: 'ascending' | 'descending'; };
const TABLE_COLUMNS: { key: keyof Application; label: string; width: string; isNumeric?: boolean }[] = [ { key: 'isConfirmed', label: '확인<br/>Done', width: 'w-16'}, { key: 'status', label: '상태<br/>Status', width: 'w-36'}, { key: 'currentServerAndAlliance', label: '서버/연맹', width: 'w-32' }, { key: 'heroPower', label: '영웅 전투력', width: 'w-32', isNumeric: true }, { key: 'mainSquad', label: '주력 군종', width: 'w-40' }, { key: 'immigrationGrade', label: '이민 등급', width: 'w-24' }, { key: 'targetAlliance', label: '목표 연맹', width: 'w-32' }, { key: 'createdAt', label: '최신 업데이트', width: 'w-48' }, ];

export default function AdminPage() {
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState('');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<Application[]>([]);

  useEffect(() => { const pw = sessionStorage.getItem('admin_password'); if (pw) fetchData(pw); }, []);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault(); setIsLoading(true);
    if (await fetchData(passwordInput)) { sessionStorage.setItem('admin_password', passwordInput); } 
    else { setError('비밀번호가 틀렸거나 데이터를 불러올 수 없습니다.'); setPasswordInput(''); }
    setIsLoading(false);
  };

  const fetchData = async (password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/applications', { headers: { 'Authorization': `Bearer ${password}` } });
      if (!res.ok) { setAuthenticated(false); return false; }
      const json: Application[] = await res.json();
      const processedData = json.map(app => ({
        ...app,
        applicantId: app.applicantId ?? app.nickname,
        isConfirmed: app.isConfirmed ?? false,
        status: app.status ?? '대기중',
      }));
      setAllApplications(processedData);
      setAuthenticated(true);
      return true;
    } catch (e) { console.error('Fetch data error:', e); setAuthenticated(false); return false; } finally { setIsLoading(false); }
  };
  
  const handleUpdate = async (applicantId: string, updates: Partial<Application>) => {
    try {
      const pw = sessionStorage.getItem('admin_password'); if (!pw) throw new Error('인증 만료');
      const latestVersion = allApplications.filter(app => app.applicantId === applicantId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      const res = await fetch('/api/update-application', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pw}` }, body: JSON.stringify({ id: latestVersion.createdAt, updates }) });
      if (!res.ok) throw new Error((await res.json()).message);
      setAllApplications(d => d.map(app => (app.createdAt === latestVersion.createdAt ? { ...app, ...updates } : app)));
    } catch (err) { alert(`오류: ${err instanceof Error ? err.message : '업데이트 실패'}`); }
  };

  const handleDelete = async (applicantId: string) => {
    if(!confirm('해당 신청자의 모든 이력을 삭제하시겠습니까?')) return;
    setIsLoading(true);
    try {
      const pw = sessionStorage.getItem('admin_password'); if(!pw) throw new Error('인증 만료');
      const res = await fetch('/api/delete-application', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pw}` }, body: JSON.stringify({ applicantId }) });
      if (!res.ok) throw new Error((await res.json()).message);
      setAllApplications(d => d.filter(app => app.applicantId !== applicantId));
      alert('삭제 성공');
    } catch (err) { alert(`오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`); } finally { setIsLoading(false); }
  };

  const handleReset = async () => {
    if(!confirm('정말로 모든 데이터를 삭제하시겠습니까?')) return;
    if(!confirm('다시 한번 확인합니다. 모든 데이터가 영구 삭제됩니다.')) return;
    setIsLoading(true);
    try {
      const pw = sessionStorage.getItem('admin_password'); if(!pw) throw new Error('인증 만료');
      const res = await fetch('/api/reset', { method: 'DELETE', headers: { 'Authorization': `Bearer ${pw}` } });
      if (!res.ok) throw new Error((await res.json()).message);
      setAllApplications([]);
      alert('초기화 성공');
    } catch (err) { alert(`오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`); } finally { setIsLoading(false); }
  };

  const { displayData, historyCounts } = useMemo(() => {
    const grouped = allApplications.reduce((acc, app) => { acc[app.applicantId] = acc[app.applicantId] || []; acc[app.applicantId].push(app); return acc; }, {} as Record<string, Application[]>);
    const display: Application[] = [];
    const counts: Record<string, number> = {};
    for (const id in grouped) { const history = grouped[id].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); display.push(history[0]); counts[id] = history.length; }
    return { displayData: display, historyCounts: counts };
  }, [allApplications]);

  const sortedData = useMemo(() => {
    const items = [...displayData];
    if (sortConfig.key) {
      items.sort((a, b) => {
        const valA = a[sortConfig.key!]; const valB = b[sortConfig.key!];
        let comp = 0;
        if (typeof valA === 'boolean' && typeof valB === 'boolean') { comp = valA === valB ? 0 : valA ? -1 : 1; }
        else if (typeof valA === 'number' && typeof valB === 'number') { comp = valA - valB; }
        else if (typeof valA === 'string' && typeof valB === 'string') {
          if (sortConfig.key === 'heroPower') { comp = (parseInt(valA.replace(/,/g,''))||0) - (parseInt(valB.replace(/,/g,''))||0); }
          else { comp = valA.localeCompare(valB); }
        }
        return sortConfig.direction === 'ascending' ? comp : -comp;
      });
    }
    return items;
  }, [displayData, sortConfig]);

  const requestSort = (key: keyof Application) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; }
    setSortConfig({ key, direction });
  };
  
  const openHistoryModal = (applicantId: string) => {
    const history = allApplications.filter(app => app.applicantId === applicantId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setSelectedHistory(history);
    setIsHistoryModalOpen(true);
  };
  
  const openCommentModal = (comment: string) => { setSelectedComment(comment); setIsModalOpen(true); };

  if (!authenticated) { return ( <main className="max-w-md mx-auto p-6 mt-10 text-center"><h1 className="text-2xl font-bold mb-4">관리자 로그인</h1><form onSubmit={handleLogin}><input type="password" className="border p-3 w-full mb-4" placeholder="비밀번호" value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} /><button type="submit" className="bg-black text-white px-6 py-3 rounded-md w-full" disabled={isLoading}>{isLoading?'확인 중...':'로그인'}</button>{error&&<p className="text-red-500 mt-4">{error}</p>}</form></main> ); }

  return (
    <main className="max-w-full mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6"><h1>신청자 목록</h1><button onClick={handleReset}>초기화</button></div>
      <div className="overflow-x-auto shadow-md rounded-lg border">
        <table className="min-w-[1200px] w-full border-collapse text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="border-b p-2 text-left w-32 sticky left-0 bg-gray-100 z-10"><button onClick={()=>requestSort('nickname')}>닉네임</button></th>
              <th className="border-b p-2 text-center w-16"><button>횟수</button></th>
              {TABLE_COLUMNS.map(col=>(<th key={col.key} className={`border-b p-2 font-medium text-gray-600 ${col.width}`}><button onClick={()=>requestSort(col.key)} className="w-full h-full" dangerouslySetInnerHTML={{__html:col.label+(sortConfig.key===col.key?(sortConfig.direction==='ascending'?' ▲':' ▼'):'')}}/></th>))}
              <th className="border-b p-2 font-medium w-16">코멘트</th>
              <th className="border-b p-2 font-medium w-24">이미지</th>
              <th className="border-b p-2 font-medium w-20">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y">
            {sortedData.map(row => {
              const historyCount = historyCounts[row.applicantId] || 1;
              return (
                <tr key={row.applicantId} className={`${row.isConfirmed ? 'bg-green-50' : 'bg-white'} hover:bg-gray-50`}>
                  <td className="p-2 font-medium sticky left-0 z-10 bg-inherit">{row.nickname}</td>
                  <td className="p-2 text-center">{historyCount > 1 ? (<button onClick={() => openHistoryModal(row.applicantId)} className="font-bold text-blue-600 hover:underline">{historyCount}</button>) : ( <span>{historyCount}</span> )}</td>
                  <td className="p-2 text-center"><input type="checkbox" checked={row.isConfirmed} onChange={e=>handleUpdate(row.applicantId,{isConfirmed:e.target.checked})} className="h-5 w-5"/></td>
                  <td className="p-2 text-center"><select value={row.status} onChange={e=>handleUpdate(row.applicantId,{status:e.target.value as Application['status']})} className={`w-full p-1 rounded ${row.status==='승인'?'bg-green-200':row.status==='거절'?'bg-red-200':'bg-yellow-200'}`}><option value="대기중">대기중</option><option value="승인">승인</option><option value="거절">거절</option></select></td>
                  <td className="p-2">{row.currentServerAndAlliance}</td>
                  <td className="p-2 text-right">{row.heroPower}</td>
                  <td className="p-2">{row.mainSquad}</td>
                  <td className="p-2">{row.immigrationGrade}</td>
                  <td className="p-2">{row.targetAlliance}</td>
                  <td className="p-2">{new Date(row.createdAt).toLocaleString('ko-KR')}</td>
                  <td className="p-2 text-center">{row.note && (<button onClick={()=>openCommentModal(row.note)}><CommentIcon/></button>)}</td>
                  {/* --- ▼▼▼ 여기가 수정된 부분입니다 (app -> row) ▼▼▼ --- */}
                  <td className="p-2 text-center align-middle">{row.image ? <a href={row.image} target="_blank" rel="noopener noreferrer"><img src={row.image} alt="ss" className="h-16 w-auto mx-auto"/></a> : 'None'}</td>
                  <td className="p-2 text-center"><button onClick={()=>handleDelete(row.applicantId)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <HistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} history={selectedHistory} nickname={selectedHistory[0]?.nickname || ''} />
      <CommentModal isOpen={isHistoryModalOpen} onClose={() => setIsModalOpen(false)} comment={selectedComment} />
    </main>
  );
}