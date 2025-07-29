// src/app/admin/page.tsx 전체 코드 (삭제 기능 추가됨)

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
      setError('비밀번호가 틀렸거나 데이터를 불러올 수 없습니다.');
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
  
  // --- ▼▼▼ 1. 개별 삭제를 위한 함수 추가 ▼▼▼ ---
  const handleDelete = async (id: string) => {
    // 실수로 삭제하는 것을 방지하기 위한 확인창
    if (!confirm('해당 신청을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const password = sessionStorage.getItem('admin_password');
      if (!password) {
        throw new Error('인증 정보가 만료되었습니다. 다시 로그인해주세요.');
      }

      const res = await fetch('/api/delete-application', { // 우리가 만든 삭제 API 호출
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
        },
        body: JSON.stringify({ id: id }), // 삭제할 신청서의 고유 ID(createdAt)를 전송
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || '삭제 작업에 실패했습니다.');
      }

      // 삭제 성공 시, 화면에서도 해당 데이터를 즉시 제거 (새로고침 없이)
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
  // --- ▲▲▲ 여기까지 함수 추가 ▲▲▲ ---


  const handleReset = async () => {
    if (!confirm('정말로 모든 신청 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    if (!confirm('다시 한번 확인합니다. 모든 이미지와 데이터가 영구적으로 삭제됩니다. 계속하시겠습니까?')) {
      return;
    }
    setIsLoading(true);
    setError('');
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
      alert(`오류: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <main className="max-w-md mx-auto p-6 mt-10 text-center bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4">관리자 로그인</h1>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            className="border p-3 w-full mb-4 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="비밀번호"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit"
            className="bg-black text-white px-6 py-3 rounded-md w-full font-semibold disabled:bg-gray-400 disabled:cursor-wait" 
            disabled={isLoading}
          >
            {isLoading ? '확인 중...' : '로그인'}
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">20서버 이민 신청자 목록</h1>
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 disabled:bg-gray-400"
        >
          전체 초기화
        </button>
      </div>
      {error && <p className="text-red-500 bg-red-50 p-3 rounded-md mb-4">{error}</p>}
      
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">번호</th>
              <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">닉네임</th>
              <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">현재 서버</th>
              <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">희망 서버</th>
              <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">전투력</th>
              <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">메모</th>
              <th className="border px-4 py-2 text-sm font-medium text-gray-600">이미지</th>
              <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">신청일</th>
              {/* --- ▼▼▼ 2. 테이블 헤더에 '관리' 열 추가 ▼▼▼ --- */}
              <th className="border px-4 py-2 text-sm font-medium text-gray-600">관리</th>
              {/* --- ▲▲▲ 여기까지 헤더 추가 ▲▲▲ --- */}
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-10 text-gray-500">
                  아직 접수된 신청서가 없습니다.
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={row.createdAt} className="hover:bg-gray-50">
                  <td className="border px-4 py-2 text-center">{data.length - i}</td>
                  <td className="border px-4 py-2 font-medium text-gray-800">{row.nickname}</td>
                  <td className="border px-4 py-2 text-center">{row.currentServer}</td>
                  <td className="border px-4 py-2 text-center">{row.targetServer}</td>
                  <td className="border px-4 py-2 text-right">{row.power}</td>
                  <td className="border px-4 py-2 text-sm text-gray-700">{row.note}</td>
                  <td className="border px-4 py-2 text-center align-middle">
                    {row.image ? (
                      <a href={row.image} target="_blank" rel="noopener noreferrer" title="클릭해서 크게 보기">
                        <img
                          src={row.image}
                          alt={`${row.nickname}의 스크린샷`}
                          className="h-20 w-auto mx-auto object-contain p-1 border rounded-md transition-transform duration-200 hover:scale-110"
                        />
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">없음</span>
                    )}
                  </td>
                  <td className="border px-4 py-2 text-sm text-gray-600">
                    {new Date(row.createdAt).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  {/* --- ▼▼▼ 3. 각 행에 '삭제' 버튼 추가 ▼▼▼ --- */}
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(row.createdAt)}
                      disabled={isLoading}
                      className="bg-red-500 text-white px-3 py-1 text-sm rounded-md font-semibold hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-wait"
                    >
                      삭제
                    </button>
                  </td>
                  {/* --- ▲▲▲ 여기까지 버튼 추가 ▲▲▲ --- */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}