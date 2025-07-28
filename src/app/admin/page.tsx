'use client';

import { useEffect, useState, FormEvent } from 'react';

// Application 타입 정의
type Application = {
  nickname: string;
  currentServer: string;
  targetServer: string;
  power: string;
  note: string;
  image?: string | null; // 이제 URL이므로 string | null 타입
  createdAt: string;
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<Application[]>([]);

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
      <h1 className="text-3xl font-bold mb-6">20서버 이민 신청자 목록</h1>
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">번호</th>
              <th className="border px-4 py-2 text-left">닉네임</th>
              <th className="border px-4 py-2 text-left">현재 서버</th>
              <th className="border px-4 py-2 text-left">희망 서버</th>
              <th className="border px-4 py-2 text-left">전투력</th>
              <th className="border px-4 py-2 text-left">메모</th>
              <th className="border px-4 py-2">이미지</th>
              <th className="border px-4 py-2 text-left">신청일</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.map((row, i) => (
              <tr key={row.createdAt} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{data.length - i}</td>
                <td className="border px-4 py-2 font-medium">{row.nickname}</td>
                <td className="border px-4 py-2 text-center">{row.currentServer}</td>
                <td className="border px-4 py-2 text-center">{row.targetServer}</td>
                <td className="border px-4 py-2 text-right">{row.power}</td>
                <td className="border px-4 py-2">{row.note}</td>
                <td className="border px-4 py-2 text-center align-middle">
                  {/* row.image는 이제 완전한 URL이므로 그대로 src에 사용 */}
                  {row.image ? (
                    <a href={row.image} target="_blank" rel="noopener noreferrer">
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
                <td className="border px-4 py-2 text-sm">
                  {new Date(row.createdAt).toLocaleString('ko-KR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}