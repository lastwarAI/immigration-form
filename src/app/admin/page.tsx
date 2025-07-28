// src/app/admin/page.tsx 전체 코드

'use client';

import { useEffect, useState, FormEvent } from 'react';
import type { Application } from '@/types';

export default function AdminPage() {
  // ... (기존의 useState 선언들은 그대로 둡니다)
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<Application[]>([]);
  const [authenticated, setAuthenticated] = useState(false);


  // ... (useEffect, handleLogin, fetchData 함수는 이전과 동일하게 둡니다) ...
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


  // --- 여기가 추가/수정된 부분입니다 ---

  const handleReset = async () => {
    // 1. 첫 번째 확인: 정말로 삭제할 것인지 묻습니다.
    if (!confirm('정말로 모든 신청 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    // 2. 두 번째 확인: 한 번 더 경고합니다.
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
        method: 'DELETE', // DELETE 메서드로 요청
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || '초기화에 실패했습니다.');
      }
      
      alert('모든 데이터가 성공적으로 초기화되었습니다.');
      setData([]); // 화면의 데이터 목록을 즉시 비웁니다.

    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(message);
      alert(`오류: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 추가 끝 ---

  // ... (로그인 폼 렌더링 부분은 이전과 동일) ...
  if (!authenticated) {
    return (
      <main className="max-w-md mx-auto p-6 mt-10 text-center bg-white shadow-lg rounded-lg">
        {/* ... */}
      </main>
    );
  }

  // 관리자 페이지 목록 렌더링 부분
  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">20서버 이민 신청자 목록</h1>
        {/* --- 리셋 버튼 UI 추가 --- */}
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 disabled:bg-gray-400"
        >
          전체 초기화
        </button>
        {/* --- 추가 끝 --- */}
      </div>

      {/* --- 에러 메시지 표시 영역 추가 --- */}
      {error && <p className="text-red-500 bg-red-50 p-3 rounded-md mb-4">{error}</p>}
      {/* --- 추가 끝 --- */}

      <div className="overflow-x-auto shadow-md rounded-lg">
        {/* ... (테이블 렌더링 부분은 이전과 동일) ... */}
      </div>
    </main>
  );
}