// src/app/admin/page.tsx 전체 코드 (닉네임 틀 고정 가독성 문제 해결)

'use client';

import React, { useEffect, useState, FormEvent, useMemo } from 'react';
import type { Application } from '@/types';

// 컴포넌트, 타입, 상수 정의는 변경 없습니다.
const CommentIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto text-gray-500 hover:text-blue-600 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> </svg> );
const CommentModal = ({ isOpen, onClose, comment }: { isOpen: boolean; onClose: () => void; comment: string; }) => { if (!isOpen) return null; return ( <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"> <div className="bg-white rounded-lg shadow-xl w-full max-w-lg"> <div className="p-4 border-b flex justify-between items-center"><h3 className="text-lg font-semibold">코멘트 / Comment</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">×</button></div> <div className="p-6 whitespace-pre-wrap text-gray-700 max-h-80 overflow-y-auto">{comment}</div> <div className="p-4 border-t text-right"><button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-300">닫기 / Close</button></div> </div> </div> ); };
type SortConfig = { key: keyof Application | null; direction: 'ascending' | 'descending'; };
const TABLE_COLUMNS: { key: keyof Application; label: string; width: string; isNumeric?: boolean }[] = [ { key: 'isConfirmed', label: '확인<br/>Done', width: 'w-16'}, { key: 'status', label: '상태<br/>Status', width: 'w-36'}, { key: 'currentServerAndAlliance', label: '서버/연맹<br/>Server/Alliance', width: 'w-32' }, { key: 'heroPower', label: '영웅 전투력<br/>Hero Power', width: 'w-32', isNumeric: true }, { key: 'mainSquad', label: '주력 군종<br/>Main Squad', width: 'w-40' }, { key: 'immigrationGrade', label: '이민 등급<br/>Grade', width: 'w-24' }, { key: 'targetAlliance', label: '목표 연맹<br/>Target Alliance', width: 'w-32' }, { key: 'createdAt', label: '신청일<br/>Date', width: 'w-48' }, ];

export default function AdminPage() {
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<Application[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState('');

  // 함수 로직들은 모두 정상적으로 포함되어 있습니다.
  useEffect(() => { const pw = sessionStorage.getItem('admin_password'); if (pw) fetchData(pw); }, []);
  const handleLogin = async (event: FormEvent) => { event.preventDefault(); setIsLoading(true); const success = await fetchData(passwordInput); if (success) sessionStorage.setItem('admin_password', passwordInput); else { setError('비밀번호가 틀렸거나 데이터를 불러올 수 없습니다. / Incorrect password or failed to load data.'); setPasswordInput(''); } setIsLoading(false); };
  const fetchData = async (password: string): Promise<boolean> => { setIsLoading(true); try { const res = await fetch('/api/applications', { headers: { 'Authorization': `Bearer ${password}` } }); if (!res.ok) { setAuthenticated(false); return false; } const json: Application[] = await res.json(); const processedData = json.map(app => ({ ...app, isConfirmed: app.isConfirmed ?? false, status: app.status ?? '대기중' })); setData(processedData); setAuthenticated(true); return true; } catch (e) { console.error('Fetch data error:', e); setAuthenticated(false); return false; } finally { setIsLoading(false); } };
  const handleUpdate = async (id: string, updates: Partial<Application>) => { try { const pw = sessionStorage.getItem('admin_password'); if (!pw) throw new Error('인증 정보가 만료되었습니다.'); const res = await fetch('/api/update-application', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pw}` }, body: JSON.stringify({ id, updates }) }); if (!res.ok) throw new Error((await res.json()).message); setData(d => d.map(app => (app.createdAt === id ? { ...app, ...updates } : app))); } catch (err) { alert(`오류: ${err instanceof Error ? err.message : '업데이트 실패'}`); } };
  const handleDelete = async (id:string) => { if(!confirm('해당 신청을 정말로 삭제하시겠습니까?'))return; setIsLoading(true); try{const pw=sessionStorage.getItem('admin_password');if(!pw)throw new Error('인증 만료');const res=await fetch('/api/delete-application',{method:'DELETE',headers:{'Content-Type':'application/json','Authorization':`Bearer ${pw}`},body:JSON.stringify({id})});if(!res.ok)throw new Error((await res.json()).message);setData(d=>d.filter(app=>app.createdAt!==id));alert('삭제 성공')}catch(err){alert(`오류: ${err instanceof Error?err.message:'알 수 없는 오류'}`)}finally{setIsLoading(false)}};
  const handleReset = async () => { if(!confirm('정말로 모든 데이터를 삭제하시겠습니까?'))return; if(!confirm('다시 한번 확인합니다. 모든 데이터가 영구 삭제됩니다.'))return; setIsLoading(true); try{const pw=sessionStorage.getItem('admin_password');if(!pw)throw new Error('인증 만료');const res=await fetch('/api/reset',{method:'DELETE',headers:{'Authorization':`Bearer ${pw}`}});if(!res.ok)throw new Error((await res.json()).message);setData([]);alert('초기화 성공')}catch(err){alert(`오류: ${err instanceof Error?err.message:'알 수 없는 오류'}`)}finally{setIsLoading(false)}};
  const sortedData = useMemo(() => { const items = [...data]; if (sortConfig.key) { items.sort((a, b) => { const valA = a[sortConfig.key!]; const valB = b[sortConfig.key!]; let comp = 0; if (typeof valA === 'boolean' && typeof valB === 'boolean') { comp = valA === valB ? 0 : valA ? -1 : 1; } else if (typeof valA === 'string' && typeof valB === 'string') { if (sortConfig.key === 'heroPower') { comp = (parseInt(valA.replace(/,/g,''))||0) - (parseInt(valB.replace(/,/g,''))||0); } else { comp = valA.localeCompare(valB); } } return sortConfig.direction === 'ascending' ? comp : -comp; }); } return items; }, [data, sortConfig]);
  const requestSort = (key: keyof Application) => { let dir: 'ascending'|'descending' = 'ascending'; if (sortConfig.key === key && sortConfig.direction === 'ascending') { dir = 'descending'; } setSortConfig({ key, direction: dir }); };
  const openCommentModal = (comment: string) => { setSelectedComment(comment); setIsModalOpen(true); };

  if (!authenticated) {
    return ( <main className="max-w-md mx-auto p-6 mt-10 text-center bg-white shadow-lg rounded-lg"><h1 className="text-2xl font-bold mb-4">관리자 로그인 <span className="text-gray-400">/</span> Admin Login</h1><form onSubmit={handleLogin}><input type="password" className="border p-3 w-full mb-4 rounded-md" placeholder="비밀번호 / Password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} disabled={isLoading}/><button type="submit" className="bg-black text-white px-6 py-3 rounded-md w-full font-semibold" disabled={isLoading}>{isLoading ? '확인 중...' : '로그인 / Login'}</button>{error && <p className="text-red-500 mt-4">{error}</p>}</form></main> );
  }

  return (
    <main className="max-w-full mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6"><h1 className="text-xl sm:text-3xl font-bold">이민 신청자 목록 <span className="text-gray-400 font-normal">/</span> Applicants</h1><button onClick={handleReset} disabled={isLoading} className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 disabled:bg-gray-400">전체 초기화 / Reset All</button></div>
      
      <div className="overflow-x-auto shadow-md rounded-lg border">
        <table className="min-w-[1200px] w-full border-collapse text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="border-b px-2 py-2 text-left font-medium text-gray-600 w-32 sticky left-0 bg-gray-100 z-10"><button onClick={() => requestSort('nickname')} className='w-full text-left'>닉네임<br/>Nickname{sortConfig.key === 'nickname' ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}</button></th>
              {TABLE_COLUMNS.map(col => (<th key={col.key} className={`border-b px-2 py-2 font-medium text-gray-600 ${col.width} ${col.isNumeric ? 'text-right' : 'text-left'}`}><button onClick={() => requestSort(col.key)} className="w-full h-full text-inherit" dangerouslySetInnerHTML={{ __html: col.label + (sortConfig.key === col.key ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : '') }} /></th>))}
              <th className="border-b px-2 py-2 font-medium text-gray-600 w-16">코멘트<br/>Note</th>
              <th className="border-b px-2 py-2 font-medium text-gray-600 w-24">이미지<br/>Image</th>
              <th className="border-b px-2 py-2 font-medium text-gray-600 w-20">관리<br/>Manage</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map(row => (
              // --- ▼▼▼ 여기가 수정된 부분입니다 (tr에 배경색 지정) ▼▼▼ ---
              <tr key={row.createdAt} className={`${row.isConfirmed ? 'bg-green-50' : 'bg-white'} hover:bg-gray-50`}>
                {/* --- ▼▼▼ 여기가 수정된 부분입니다 (sticky 셀에 bg-inherit 추가) ▼▼▼ --- */}
                <td className="px-2 py-2 font-medium sticky left-0 z-10 bg-inherit">{row.nickname}</td>
                
                <td className="px-2 py-2 text-center"><input type="checkbox" checked={row.isConfirmed} onChange={(e) => handleUpdate(row.createdAt, { isConfirmed: e.target.checked })} className="h-5 w-5" /></td>
                <td className="px-2 py-2 text-center"><select value={row.status} onChange={(e) => handleUpdate(row.createdAt, { status: e.target.value as Application['status']})} className={`w-full p-1 rounded ${row.status === '승인' ? 'bg-green-200' : row.status === '거절' ? 'bg-red-200' : 'bg-yellow-200'}`}><option value="대기중">대기중 / Pending</option><option value="승인">승인 / Approved</option><option value="거절">거절 / Rejected</option></select></td>
                <td className="px-2 py-2 text-right">{row.currentServerAndAlliance}</td>
                <td className="px-2 py-2 text-right">{row.heroPower}</td>
                <td className="px-2 py-2">{row.mainSquad}</td>
                <td className="px-2 py-2">{row.immigrationGrade}</td>
                <td className="px-2 py-2">{row.targetAlliance}</td>
                <td className="px-2 py-2">{new Date(row.createdAt).toLocaleString('ko-KR')}</td>
                <td className="px-2 py-2 text-center">{row.note && (<button onClick={() => openCommentModal(row.note)} className="w-full"><CommentIcon /></button>)}</td>
                <td className="px-2 py-2 text-center align-middle">{row.image ? <a href={row.image} target="_blank" rel="noopener noreferrer"><img src={row.image} alt="ss" className="h-16 w-auto mx-auto"/></a> : 'None'}</td>
                <td className="px-2 py-2 text-center"><button onClick={() => handleDelete(row.createdAt)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button></td>
              </tr>
            ))}
            {sortedData.length === 0 && (<tr><td colSpan={TABLE_COLUMNS.length + 5} className="text-center py-10 text-gray-500">데이터가 없습니다. / No data found.</td></tr>)}
          </tbody>
        </table>
      </div>
      <CommentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} comment={selectedComment}/>
    </main>
  );
}