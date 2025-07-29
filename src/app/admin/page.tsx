// src/app/admin/page.tsx 전체 코드 (정렬 로직 수정됨)

'use client';

import React, { useEffect, useState, FormEvent, useMemo } from 'react';
import type { Application } from '@/types';

type SortConfig = {
  key: keyof Application | null;
  direction: 'ascending' | 'descending';
};

export default function AdminPage() {
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<Application[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });

  useEffect(() => {
    const savedPassword = sessionStorage.getItem('admin_password');
    if (savedPassword) {
      fetchData(savedPassword);
    }
  }, []);

  // ... (handleLogin, fetchData 등 다른 함수들은 이전과 동일) ...
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
      const res = await fetch('/api/applications', {
        headers: { 'Authorization': `Bearer ${password}` },
      });
      if (!res.ok) {
        setAuthenticated(false); return false;
      }
      const json: Application[] = await res.json();
      const processedData = json.map(app => ({
        ...app,
        isConfirmed: app.isConfirmed ?? false,
        status: app.status ?? '대기중',
      }));
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

      const res = await fetch('/api/update-application', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${password}` },
        body: JSON.stringify({ id, updates }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      
      setData(currentData =>
        currentData.map(app => (app.createdAt === id ? { ...app, ...updates } : app))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : '업데이트 실패';
      alert(`오류: ${message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('해당 신청을 정말로 삭제하시겠습니까?\nAre you sure you want to delete this application?')) return;
    // ... (이하 삭제 로직은 이전과 동일)
    setIsLoading(true);
    setError('');
    try {
      const password = sessionStorage.getItem('admin_password');
      if (!password) {
        throw new Error('인증 정보가 만료되었습니다. 다시 로그인해주세요.');
      }
      const res = await fetch('/api/delete-application', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
        },
        body: JSON.stringify({ id: id }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || '삭제 작업에 실패했습니다.');
      }
      setData(currentData => currentData.filter(app => app.createdAt !== id));
      alert('성공적으로 삭제되었습니다.');
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(message);
      alert(`오류: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('정말로 모든 신청 데이터를 삭제하시겠습니까?\nAre you sure you want to delete ALL application data?')) return;
    if (!confirm('다시 한번 확인합니다. 모든 이미지와 데이터가 영구적으로 삭제됩니다.\nFinal confirmation. All images and data will be permanently deleted.')) return;
    // ... (리셋 로직은 이전과 동일)
    setIsLoading(true);
    try {
      const password = sessionStorage.getItem('admin_password');
      if (!password) {
        throw new Error('인증 정보가 없습니다. 다시 로그인해주세요.');
      }
      const res = await fetch('/api/reset', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${password}` },
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || '초기화에 실패했습니다.');
      }
      alert('모든 데이터가 성공적으로 초기화되었습니다.');
      setData([]);
    } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
        setError(message);
        alert(`오류 / Error: ${message}`);
    } finally {
        setIsLoading(false);
    }
  };


  // --- ▼▼▼ 여기가 수정된 부분입니다 (정렬 로직) ▼▼▼ ---
  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];

        let comparison = 0;
        // 타입에 따라 안전하게 비교
        if (typeof valA === 'boolean' && typeof valB === 'boolean') {
          comparison = valA === valB ? 0 : valA ? -1 : 1;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          // 전투력(heroPower)은 숫자로 변환하여 비교
          if (sortConfig.key === 'heroPower') {
            const numA = parseInt(valA.replace(/,/g, ''), 10) || 0;
            const numB = parseInt(valB.replace(/,/g, ''), 10) || 0;
            comparison = numA > numB ? 1 : numA < numB ? -1 : 0;
          } else {
            // 나머지 문자열은 localeCompare로 비교
            comparison = valA.localeCompare(valB);
          }
        }
        
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);
  // --- ▲▲▲ 여기까지 ▲▲▲ ---

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
      {error && <p className="text-red-500 bg-red-50 p-3 rounded-md mb-4">{error}</p>}
      
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full table-auto border-collapse text-xs sm:text-sm">
          <thead className="bg-gray-100">
            <tr>
              {/* UI 부분은 변경 없음 */}
              <th className="border px-2 py-2 text-center font-medium text-gray-600">
                <button onClick={() => requestSort('isConfirmed')} className='w-full text-center'>확인<br/>Done{sortConfig.key === 'isConfirmed' ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}</button>
              </th>
              <th className="border px-2 py-2 text-left font-medium text-gray-600">
                <button onClick={() => requestSort('status')} className='w-full text-left'>상태<br/>Status{sortConfig.key === 'status' ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}</button>
              </th>
              {Object.entries({
                  nickname: "닉네임<br/>Nickname", heroPower: "영웅 전투력<br/>Hero Power", mainSquad: "주력 군종<br/>Main Squad", immigrationGrade: "이민 등급<br/>Grade",
                  currentServerAndAlliance: "서버/연맹<br/>Server/Alliance", targetAlliance: "목표 연맹<br/>Target Alliance", createdAt: "신청일<br/>Date",
              }).map(([key, value]) => (
                <th key={key} className="border px-2 py-2 text-left font-medium text-gray-600">
                  <button onClick={() => requestSort(key as keyof Application)} className="w-full text-left" dangerouslySetInnerHTML={{ __html: value + (sortConfig.key === key ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : '') }} />
                </th>
              ))}
              <th className="border px-2 py-2 font-medium text-gray-600">이미지<br/>Image</th>
              <th className="border px-2 py-2 font-medium text-gray-600">관리<br/>Manage</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {sortedData.length === 0 ? (
              <tr><td colSpan={11} className="text-center py-10">데이터가 없습니다.</td></tr>
            ) : (
              sortedData.map(row => (
                <tr key={row.createdAt} className={`hover:bg-gray-50 ${row.isConfirmed ? 'bg-green-50' : ''}`}>
                  <td className="border px-2 py-2 text-center"><input type="checkbox" checked={row.isConfirmed} onChange={(e) => handleUpdate(row.createdAt, { isConfirmed: e.target.checked })} className="h-5 w-5" /></td>
                  <td className="border px-2 py-2 text-center">
                    <select value={row.status} onChange={(e) => handleUpdate(row.createdAt, { status: e.target.value as Application['status']})} className={`p-1 rounded text-xs ${row.status === '승인' ? 'bg-green-200' : row.status === '거절' ? 'bg-red-200' : 'bg-yellow-200'}`}>
                      <option value="대기중">대기중 / Pending</option><option value="승인">승인 / Approved</option><option value="거절">거절 / Rejected</option>
                    </select>
                  </td>
                  <td className="border px-2 py-2 font-medium">{row.nickname}</td><td className="border px-2 py-2 text-right">{row.heroPower}</td>
                  <td className="border px-2 py-2">{row.mainSquad}</td><td className="border px-2 py-2">{row.immigrationGrade}</td>
                  <td className="border px-2 py-2">{row.currentServerAndAlliance}</td><td className="border px-2 py-2">{row.targetAlliance}</td>
                  <td className="border px-2 py-2">{new Date(row.createdAt).toLocaleString('ko-KR')}</td>
                  <td className="border px-2 py-2 text-center align-middle">{row.image ? <a href={row.image} target="_blank" rel="noopener noreferrer"><img src={row.image} alt="ss" className="h-16 w-auto mx-auto"/></a> : 'None'}</td>
                  <td className="border px-2 py-2 text-center"><button onClick={() => handleDelete(row.createdAt)} className="bg-red-500 text-white px-2 py-1 text-xs rounded">Delete</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}