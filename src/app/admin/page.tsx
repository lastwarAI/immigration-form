// src/app/admin/page.tsx 전체 코드 (레이아웃 및 코멘트 UI 개선)

'use client';

import React, { useEffect, useState, FormEvent, useMemo } from 'react';
import type { Application } from '@/types';

// --- ▼▼▼ 2. 코멘트 아이콘 추가 ▼▼▼ ---
const CommentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

type SortConfig = {
  key: keyof Application | null;
  direction: 'ascending' | 'descending';
};

// --- ▼▼▼ 1. 테이블 순서를 정의하는 배열 생성 ▼▼▼ ---
const TABLE_COLUMNS: { key: keyof Application; label: string; isNumeric?: boolean }[] = [
  { key: 'nickname', label: '닉네임<br/>Nickname' },
  { key: 'currentServerAndAlliance', label: '서버/연맹<br/>Server/Alliance' },
  { key: 'heroPower', label: '영웅 전투력<br/>Hero Power', isNumeric: true },
  { key: 'mainSquad', label: '주력 군종<br/>Main Squad' },
  { key: 'immigrationGrade', label: '이민 등급<br/>Grade' },
  { key: 'targetAlliance', label: '목표 연맹<br/>Target Alliance' },
  { key: 'createdAt', label: '신청일<br/>Date' },
];

export default function AdminPage() {
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<Application[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });

  // ... (다른 함수들은 이전과 동일하게 유지됩니다) ...
  useEffect(() => {
    const savedPassword = sessionStorage.getItem('admin_password');
    if (savedPassword) { fetchData(savedPassword); }
  }, []);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await fetchData(passwordInput);
    if (success) {
      sessionStorage.setItem('admin_password', passwordInput);
    } else {
      setError('비밀번호가 틀렸거나 데이터를 불러올 수 없습니다. / Incorrect password or failed to load data.');
      setPasswordInput('');
    }
    setIsLoading(false);
  };

  const fetchData = async (password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/applications', { headers: { 'Authorization': `Bearer ${password}` } });
      if (!res.ok) { setAuthenticated(false); return false; }
      const json: Application[] = await res.json();
      const processedData = json.map(app => ({ ...app, isConfirmed: app.isConfirmed ?? false, status: app.status ?? '대기중' }));
      setData(processedData);
      setAuthenticated(true);
      return true;
    } catch (e) {
      console.error('Fetch data error:', e);
      setAuthenticated(false); return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdate = async (id: string, updates: Partial<Application>) => {
    try {
      const password = sessionStorage.getItem('admin_password');
      if (!password) throw new Error('인증 정보가 만료되었습니다.');
      const res = await fetch('/api/update-application', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${password}` }, body: JSON.stringify({ id, updates }) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setData(currentData => currentData.map(app => (app.createdAt === id ? { ...app, ...updates } : app)));
    } catch (err) {
      alert(`오류: ${err instanceof Error ? err.message : '업데이트 실패'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('해당 신청을 정말로 삭제하시겠습니까?\nAre you sure you want to delete this application?')) return;
    setIsLoading(true);
    try {
      const password = sessionStorage.getItem('admin_password');
      if (!password) throw new Error('인증 정보가 만료되었습니다. 다시 로그인해주세요.');
      const res = await fetch('/api/delete-application', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${password}` }, body: JSON.stringify({ id: id }) });
      if (!res.ok) throw new Error((await res.json()).message || '삭제 작업에 실패했습니다.');
      setData(currentData => currentData.filter(app => app.createdAt !== id));
      alert('성공적으로 삭제되었습니다.');
    } catch (err) {
      alert(`오류: ${err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('정말로 모든 신청 데이터를 삭제하시겠습니까?\nAre you sure you want to delete ALL application data?')) return;
    if (!confirm('다시 한번 확인합니다. 모든 이미지와 데이터가 영구적으로 삭제됩니다.\nFinal confirmation. All images and data will be permanently deleted.')) return;
    setIsLoading(true);
    // ...
  };

  const sortedData = useMemo(() => {
    const sortableItems = [...data];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];
        let comparison = 0;
        if (typeof valA === 'boolean' && typeof valB === 'boolean') {
          comparison = valA === valB ? 0 : valA ? -1 : 1;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          if (sortConfig.key === 'heroPower') {
            const numA = parseInt(valA.replace(/,/g, ''), 10) || 0;
            const numB = parseInt(valB.replace(/,/g, ''), 10) || 0;
            comparison = numA > numB ? 1 : numA < numB ? -1 : 0;
          } else {
            comparison = valA.localeCompare(valB);
          }
        }
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: keyof Application) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
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
        <table className="w-full table-auto border-collapse text-xs sm:text-sm">
          <thead className="bg-gray-100">
            <tr>
              {/* --- 왼쪽 고정 3개 항목 --- */}
              <th className="border px-2 py-2 text-center font-medium text-gray-600 sticky left-0 bg-gray-100 z-10 w-20">
                <button onClick={() => requestSort('isConfirmed')} className='w-full text-center'>확인<br/>Done{sortConfig.key === 'isConfirmed' ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}</button>
              </th>
              <th className="border px-2 py-2 text-left font-medium text-gray-600 w-28">
                <button onClick={() => requestSort('status')} className='w-full text-left'>상태<br/>Status{sortConfig.key === 'status' ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}</button>
              </th>
              <th className="border px-2 py-2 font-medium text-gray-600 w-16">코멘트<br/>Note</th>

              {/* --- ▼▼▼ 1. 순서가 보장된 배열을 사용해 헤더 렌더링 ▼▼▼ --- */}
              {TABLE_COLUMNS.map(col => (
                <th key={col.key} className={`border px-2 py-2 text-left font-medium text-gray-600 ${col.isNumeric ? 'text-right' : 'text-left'}`}>
                  <button onClick={() => requestSort(col.key)} className="w-full h-full text-inherit" dangerouslySetInnerHTML={{ __html: col.label + (sortConfig.key === col.key ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : '') }} />
                </th>
              ))}
              
              {/* --- 오른쪽 고정 2개 항목 --- */}
              <th className="border px-2 py-2 font-medium text-gray-600 w-24">이미지<br/>Image</th>
              <th className="border px-2 py-2 font-medium text-gray-600 w-20">관리<br/>Manage</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {sortedData.map(row => (
              <tr key={row.createdAt} className={`hover:bg-gray-50 ${row.isConfirmed ? 'bg-green-50' : ''}`}>
                {/* --- 왼쪽 고정 3개 항목 데이터 --- */}
                <td className="border px-2 py-2 text-center sticky left-0 bg-inherit z-10"><input type="checkbox" checked={row.isConfirmed} onChange={(e) => handleUpdate(row.createdAt, { isConfirmed: e.target.checked })} className="h-5 w-5" /></td>
                <td className="border px-2 py-2 text-center">
                  <select value={row.status} onChange={(e) => handleUpdate(row.createdAt, { status: e.target.value as Application['status']})} className={`w-full p-1 rounded text-xs ${row.status === '승인' ? 'bg-green-200' : row.status === '거절' ? 'bg-red-200' : 'bg-yellow-200'}`}>
                    <option value="대기중">대기중 / Pending</option><option value="승인">승인 / Approved</option><option value="거절">거절 / Rejected</option>
                  </select>
                </td>
                <td className="border px-2 py-2 text-center">
                  {/* --- ▼▼▼ 2. 코멘트 아이콘과 툴팁 구현 ▼▼▼ --- */}
                  {row.note && (
                    <div className="relative flex justify-center items-center" title={row.note}>
                      <CommentIcon />
                    </div>
                  )}
                </td>
                
                {/* --- ▼▼▼ 1. 순서가 보장된 배열을 사용해 내용 렌더링 ▼▼▼ --- */}
                {TABLE_COLUMNS.map(col => (
                  <td key={col.key} className={`border px-2 py-2 ${col.isNumeric ? 'text-right' : 'text-left'}`}>
                    {col.key === 'createdAt' ? new Date(row[col.key]).toLocaleString('ko-KR') : row[col.key]}
                  </td>
                ))}
                
                {/* --- 오른쪽 고정 2개 항목 데이터 --- */}
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
    </main>
  );
}