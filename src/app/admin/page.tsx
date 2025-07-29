// src/app/admin/page.tsx 전체 코드 (영문 표기 추가됨)

'use client';

import { useEffect, useState, FormEvent } from 'react';
import type { Application } from '@/types';

export default function AdminPage() {
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<Application[]>([]);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const savedPassword = sessionStorage.getItem('admin_password');
    if (savedPassword) {
      fetchData(savedPassword);
    }
  }, []);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await fetchData(passwordInput);
    if (success) {
      sessionStorage.setItem('admin_password', passwordInput);
    } else {
      // --- 로그인 에러 메시지 번역 ---
      setError('비밀번호가 틀렸거나 데이터를 불러올 수 없습니다. / Incorrect password or failed to load data.');
      setPasswordInput('');
    }
    setIsLoading(false);
  };

  const fetchData = async (password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/applications', {
        headers: { 'Authorization': `Bearer ${password}` },
      });
      if (!res.ok) {
        setAuthenticated(false);
        return false;
      }
      const json = await res.json();
      setData(json.sort((a: Application, b: Application) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setAuthenticated(true);
      return true;
    } catch (e) {
      console.error('Fetch data error:', e);
      setAuthenticated(false);
      return false;
    }
  };
  
  const handleDelete = async (id: string) => {
    // --- 삭제 확인창 번역 ---
    if (!confirm('해당 신청을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.\nAre you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const password = sessionStorage.getItem('admin_password');
      if (!password) {
        throw new Error('인증 정보가 만료되었습니다. 다시 로그인해주세요. / Authentication has expired. Please log in again.');
      }
      const res = await fetch('/api/delete-application', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${password}` },
        body: JSON.stringify({ id: id }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || '삭제 작업에 실패했습니다. / Failed to delete.');
      }
      setData(currentData => currentData.filter(app => app.createdAt !== id));
      // --- 삭제 성공 알림 번역 ---
      alert('성공적으로 삭제되었습니다. / Deleted successfully.');
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다. / An unknown error occurred.';
      setError(message);
      alert(`오류 / Error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    // --- 전체 초기화 확인창 번역 ---
    if (!confirm('정말로 모든 신청 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.\nAre you sure you want to delete ALL application data? This action cannot be undone.')) {
      return;
    }
    if (!confirm('다시 한번 확인합니다. 모든 이미지와 데이터가 영구적으로 삭제됩니다. 계속하시겠습니까?\nFinal confirmation. All images and data will be permanently deleted. Do you want to continue?')) {
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const password = sessionStorage.getItem('admin_password');
      if (!password) {
        throw new Error('인증 정보가 없습니다. 다시 로그인해주세요. / Not authenticated. Please log in again.');
      }
      const res = await fetch('/api/reset', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${password}` },
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || '초기화에 실패했습니다. / Failed to reset.');
      }
      // --- 초기화 성공 알림 번역 ---
      alert('모든 데이터가 성공적으로 초기화되었습니다. / All data has been successfully reset.');
      setData([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다. / An unknown error occurred.';
      setError(message);
      alert(`오류 / Error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 로그인 폼 번역 ---
  if (!authenticated) {
    return (
      <main className="max-w-md mx-auto p-6 mt-10 text-center bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4">관리자 로그인 <span className="text-gray-400">/</span> Admin Login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            className="border p-3 w-full mb-4 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="비밀번호 / Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit"
            className="bg-black text-white px-6 py-3 rounded-md w-full font-semibold disabled:bg-gray-400 disabled:cursor-wait" 
            disabled={isLoading}
          >
            {isLoading ? '확인 중... / Checking...' : '로그인 / Login'}
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </form>
      </main>
    );
  }
  
  // --- 관리자 페이지 본문 번역 ---
  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">20서버 이민 신청자 목록 <span className="text-gray-400 font-normal text-2xl">/</span> Applicants</h1>
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 disabled:bg-gray-400"
        >
          전체 초기화 <span className="font-normal">/</span> Reset All
        </button>
      </div>
      {error && <p className="text-red-500 bg-red-50 p-3 rounded-md mb-4">{error}</p>}
      
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full table-auto border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              {/* --- 테이블 헤더 번역 (가독성을 위해 <br/> 사용) --- */}
              <th className="border px-3 py-2 text-left font-medium text-gray-600">번호<br/>No.</th>
              <th className="border px-3 py-2 text-left font-medium text-gray-600">닉네임<br/>Nickname</th>
              <th className="border px-3 py-2 text-left font-medium text-gray-600">서버/연맹<br/>Server/Alliance</th>
              <th className="border px-3 py-2 text-left font-medium text-gray-600">영웅 전투력<br/>Hero Power</th>
              <th className="border px-3 py-2 text-left font-medium text-gray-600">주력 군종<br/>Main Squad</th>
              <th className="border px-3 py-2 text-left font-medium text-gray-600">이민 등급<br/>Grade</th>
              <th className="border px-3 py-2 text-left font-medium text-gray-600">목표 연맹<br/>Target Alliance</th>
              <th className="border px-3 py-2 text-left font-medium text-gray-600">코멘트<br/>Comment</th>
              <th className="border px-3 py-2 font-medium text-gray-600">이미지<br/>Image</th>
              <th className="border px-3 py-2 text-left font-medium text-gray-600">신청일<br/>Date</th>
              <th className="border px-3 py-2 font-medium text-gray-600">관리<br/>Manage</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-10 text-gray-500">
                  아직 접수된 신청서가 없습니다. <br/> No applications received yet.
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={row.createdAt} className="hover:bg-gray-50">
                  <td className="border px-3 py-2 text-center">{data.length - i}</td>
                  <td className="border px-3 py-2 font-medium text-gray-800">{row.nickname}</td>
                  <td className="border px-3 py-2">{row.currentServerAndAlliance}</td>
                  <td className="border px-3 py-2 text-right">{row.heroPower}</td>
                  <td className="border px-3 py-2">{row.mainSquad}</td>
                  <td className="border px-3 py-2">{row.immigrationGrade}</td>
                  <td className="border px-3 py-2">{row.targetAlliance}</td>
                  <td className="border px-3 py-2 text-gray-700">{row.note}</td>
                  <td className="border px-3 py-2 text-center align-middle">
                    {row.image ? (
                      <a href={row.image} target="_blank" rel="noopener noreferrer" title="클릭해서 크게 보기 / Click to enlarge">
                        <img
                          src={row.image}
                          alt={`${row.nickname}의 스크린샷`}
                          className="h-20 w-auto mx-auto object-contain p-1 border rounded-md transition-transform duration-200 hover:scale-110"
                        />
                      </a>
                    ) : (
                      <span className="text-gray-400">없음<br/>None</span>
                    )}
                  </td>
                  <td className="border px-3 py-2 text-gray-600">
                    {new Date(row.createdAt).toLocaleString('ko-KR', {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    <button
                      onClick={() => handleDelete(row.createdAt)}
                      disabled={isLoading}
                      className="bg-red-500 text-white px-3 py-1 text-xs rounded-md font-semibold hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-wait"
                      title="삭제 / Delete"
                    >
                      삭제<span className="hidden sm:inline"> / Delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}