// src/app/admin/page.tsx 전체 코드 (모달, 레이아웃 순서, 고정 너비 적용)

'use client';

import React, { useEffect, useState, FormEvent, useMemo } from 'react';
import type { Application } from '@/types';

// --- ▼▼▼ 1. 코멘트 아이콘 및 모달 컴포넌트 추가 ▼▼▼ ---
const CommentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto text-gray-500 hover:text-blue-600 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const CommentModal = ({ isOpen, onClose, comment }: { isOpen: boolean; onClose: () => void; comment: string; }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">코멘트 / Comment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>
        <div className="p-6 whitespace-pre-wrap text-gray-700">
          {comment}
        </div>
        <div className="p-4 border-t text-right">
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-300">닫기 / Close</button>
        </div>
      </div>
    </div>
  );
};
// --- ▲▲▲ 여기까지 컴포넌트 추가 ▲▲▲ ---

type SortConfig = {
  key: keyof Application | null;
  direction: 'ascending' | 'descending';
};

// --- ▼▼▼ 2. 테이블 순서 및 너비 정의 ▼▼▼ ---
const TABLE_COLUMNS: { key: keyof Application; label: string; width: string; isNumeric?: boolean }[] = [
  { key: 'nickname', label: '닉네임<br/>Nickname', width: 'w-1/12' },
  { key: 'currentServerAndAlliance', label: '서버/연맹<br/>Server/Alliance', width: 'w-1/12' },
  { key: 'heroPower', label: '영웅 전투력<br/>Hero Power', width: 'w-1/12', isNumeric: true },
  { key: 'mainSquad', label: '주력 군종<br/>Main Squad', width: 'w-1/12' },
  { key: 'immigrationGrade', label: '이민 등급<br/>Grade', width: 'w-1/12' },
  { key: 'targetAlliance', label: '목표 연맹<br/>Target Alliance', width: 'w-1/12' },
  // 코멘트(note)는 별도 처리하므로 여기서 제외
  { key: 'createdAt', label: '신청일<br/>Date', width: 'w-2/12' },
];

export default function AdminPage() {
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<Application[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });

  // --- ▼▼▼ 1. 모달 상태 관리 State 추가 ▼▼▼ ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState('');

  // ... (다른 함수들은 이전과 동일하게 유지됩니다) ...
  useEffect(() => { if (sessionStorage.getItem('admin_password')) fetchData(sessionStorage.getItem('admin_password')!); }, []);
  const handleLogin = async (e: FormEvent) => { e.preventDefault(); setIsLoading(true); if(await fetchData(passwordInput)) sessionStorage.setItem('admin_password', passwordInput); else setError('비밀번호가 틀렸습니다.'); setIsLoading(false); };
  const fetchData = async (pw: string) => { /* ... */ return true; };
  const handleUpdate = async (id: string, updates: Partial<Application>) => { /* ... */ };
  const handleDelete = async (id: string) => { /* ... */ };
  const handleReset = async () => { /* ... */ };

  const sortedData = useMemo(() => {
    const sortableItems = [...data];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => { /* ... */ return 0; });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: keyof Application) => { /* ... */ };
  
  // --- ▼▼▼ 1. 모달 여닫기 함수 추가 ▼▼▼ ---
  const openCommentModal = (comment: string) => {
    setSelectedComment(comment);
    setIsModalOpen(true);
  };
  
  if (!authenticated) {
    return (
      <main className="max-w-md mx-auto p-6 mt-10 text-center bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4">관리자 로그인 <span className="text-gray-400">/</span> Admin Login</h1>
        <form onSubmit={handleLogin}>
          <input type="password" className="border p-3 w-full mb-4 rounded-md" placeholder="비밀번호 / Password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} disabled={isLoading}/>
          <button type="submit" className="bg-black text-white px-6 py-3 rounded-md w-full font-semibold" disabled={isLoading}>{isLoading ? '확인 중...' : '로그인 / Login'}</button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="max-w-full mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-3xl font-bold">이민 신청자 목록 <span className="text-gray-400 font-normal">/</span> Applicants</h1>
        <button onClick={handleReset} disabled={isLoading} className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 disabled:bg-gray-400">전체 초기화 / Reset All</button>
      </div>
      
      <div className="overflow-x-auto shadow-md rounded-lg">
        {/* --- ▼▼▼ 2. table-fixed 적용 ▼▼▼ --- */}
        <table className="w-full table-fixed border-collapse text-xs sm:text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-2 text-center font-medium text-gray-600 w-16">
                <button onClick={() => requestSort('isConfirmed')} className='w-full text-center'>확인<br/>Done{sortConfig.key === 'isConfirmed' ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}</button>
              </th>
              <th className="border px-2 py-2 text-left font-medium text-gray-600 w-28">
                <button onClick={() => requestSort('status')} className='w-full text-left'>상태<br/>Status{sortConfig.key === 'status' ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}</button>
              </th>

              {TABLE_COLUMNS.map(col => (
                <th key={col.key} className={`border px-2 py-2 font-medium text-gray-600 ${col.width} ${col.isNumeric ? 'text-right' : 'text-left'}`}>
                  <button onClick={() => requestSort(col.key)} className="w-full h-full text-inherit" dangerouslySetInnerHTML={{ __html: col.label + (sortConfig.key === col.key ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : '') }} />
                </th>
              ))}
              
              <th className="border px-2 py-2 font-medium text-gray-600 w-16">코멘트<br/>Note</th>
              <th className="border px-2 py-2 font-medium text-gray-600 w-24">이미지<br/>Image</th>
              <th className="border px-2 py-2 font-medium text-gray-600 w-20">관리<br/>Manage</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {sortedData.map(row => (
              <tr key={row.createdAt} className={`hover:bg-gray-50 ${row.isConfirmed ? 'bg-green-50' : ''}`}>
                <td className="border px-2 py-2 text-center"><input type="checkbox" checked={row.isConfirmed} onChange={(e) => handleUpdate(row.createdAt, { isConfirmed: e.target.checked })} className="h-5 w-5" /></td>
                <td className="border px-2 py-2 text-center">
                  <select value={row.status} onChange={(e) => handleUpdate(row.createdAt, { status: e.target.value as Application['status']})} className={`w-full p-1 rounded text-xs ${row.status === '승인' ? 'bg-green-200' : row.status === '거절' ? 'bg-red-200' : 'bg-yellow-200'}`}>
                    <option value="대기중">대기중 / Pending</option><option value="승인">승인 / Approved</option><option value="거절">거절 / Rejected</option>
                  </select>
                </td>
                
                {TABLE_COLUMNS.map(col => (
                  <td key={col.key} className={`border px-2 py-2 truncate ${col.isNumeric ? 'text-right' : 'text-left'}`}>
                    {col.key === 'createdAt' ? new Date(row[col.key]).toLocaleString('ko-KR') : row[col.key]}
                  </td>
                ))}
                
                <td className="border px-2 py-2 text-center">
                  {/* --- ▼▼▼ 1. 아이콘 클릭 시 모달 열기 ▼▼▼ --- */}
                  {row.note && (
                    <button onClick={() => openCommentModal(row.note)} className="w-full">
                      <CommentIcon />
                    </button>
                  )}
                </td>
                <td className="border px-2 py-2 text-center align-middle">{row.image ? <a href={row.image} target="_blank" rel="noopener noreferrer"><img src={row.image} alt="ss" className="h-16 w-auto mx-auto"/></a> : 'None'}</td>
                <td className="border px-2 py-2 text-center"><button onClick={() => handleDelete(row.createdAt)} className="bg-red-500 text-white px-2 py-1 text-xs rounded">Delete</button></td>
              </tr>
            ))}
            {sortedData.length === 0 && (
              <tr><td colSpan={TABLE_COLUMNS.length + 5} className="text-center py-10 text-gray-500">데이터가 없습니다. / No data found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- ▼▼▼ 1. 모달 컴포넌트 렌더링 ▼▼▼ --- */}
      <CommentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        comment={selectedComment}
      />
    </main>
  );
}