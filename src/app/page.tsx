// src/app/page.tsx 전체 코드 (코멘트 필수 항목으로, 문구는 그대로)

'use client';

import React, { useState, FormEvent } from 'react';

const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
);

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    const formData = new FormData(event.currentTarget);
    const immigrationGrade = formData.get('immigrationGrade');
    if (immigrationGrade === "") {
        setError('이민 등급을 선택해주세요. / Please select an immigration grade.');
        setIsLoading(false);
        return;
    }
    try {
      const response = await fetch('/api/submit', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) { throw new Error(result.message || '신청 제출에 실패했습니다.'); }
      setSuccessMessage(result.message || '신청이 성공적으로 제출되었습니다!');
      (event.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg mb-8 border-l-4 border-blue-500">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">20서버 이민 신청 <span className="text-gray-400 font-normal">/</span> Server 20 Immigration</h1>
          <p className="text-gray-600 mt-4 text-base md:text-lg whitespace-pre-line">
            서버 이민을 위한 신청서를 작성해주세요.
            Please fill out the application form for server transfer.
          </p>
        </div>
        <form className="bg-white p-6 md:p-8 rounded-lg shadow-lg space-y-6" onSubmit={handleSubmit}>
          <div><label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">게임 닉네임 <span className="text-gray-400">/</span> Game Nickname <span className="text-red-500">*</span></label><input id="nickname" name="nickname" className="w-full border p-3 rounded-md" placeholder="정확하게 입력 Type exactly / e.g., PENGUIN" required /></div>
          <div><label htmlFor="currentServer" className="block text-sm font-medium text-gray-700 mb-1">현재 서버 및 연맹 <span className="text-gray-400">/</span> Current Server & Alliance <span className="text-red-500">*</span></label><input id="currentServer" name="currentServer" className="w-full border p-3 rounded-md" placeholder="e.g., 20, HBO" required /></div>
          <div><label htmlFor="power" className="block text-sm font-medium text-gray-700 mb-1">총 영웅 전투력 <span className="text-gray-400">/</span> Total Hero Power <span className="text-red-500">*</span></label><input id="power" name="power" className="w-full border p-3 rounded-md" placeholder="e.g., 186,675,261" required /></div>
          <div><label htmlFor="mainSquad" className="block text-sm font-medium text-gray-700 mb-1">주력 군종 및 전투력 <span className="text-gray-400">/</span> Main Squad Type & Power <span className="text-red-500">*</span></label><input id="mainSquad" name="mainSquad" className="w-full border p-3 rounded-md" placeholder="e.g., 탱크 Tank, 55M" required /></div>
          <div><label htmlFor="immigrationGrade" className="block text-sm font-medium text-gray-700 mb-1">이민 등급 (이민 기간이 아닐 시 예상등급 기입) <span className="text-gray-400">/</span> Immigration grade <span className="text-red-500">*</span></label><select id="immigrationGrade" name="immigrationGrade" className="w-full border p-3 rounded-md bg-white" defaultValue="" required><option value="" disabled>-- 등급을 선택해주세요 / Select Grade --</option><option value="Gold">노란색 / Gold</option><option value="Purple">보라색 / Purple</option><option value="Blue">파랑색 / Blue</option><option value="White">흰색 / White</option></select></div>
          <div><label htmlFor="targetAlliance" className="block text-sm font-medium text-gray-700 mb-1">목표 연맹 <span className="text-gray-400">/</span> Target Alliance <span className="text-red-500">*</span></label><input id="targetAlliance" name="targetAlliance" className="w-full border p-3 rounded-md" required /></div>
          
          {/* --- ▼▼▼ 여기가 수정된 부분입니다 ▼▼▼ --- */}
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              이민 코멘트 (추천인 혹은 자기소개 등) <span className="text-gray-400">/</span> Immigration Comment (e.g recommender or self-introduction and so on) <span className="text-red-500">*</span>
            </label>
            <textarea
              id="note"
              name="note"
              className="w-full border p-3 rounded-md h-28"
              required // required 속성 추가
            />
          </div>
          {/* --- ▲▲▲ 여기까지 ▲▲▲ --- */}

          <div><label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">이민 등급 페이지 스크린샷 <span className="text-gray-400">/</span> Immigration Grade Page Screeenshot <span className="text-red-500">*</span></label><input id="file" type="file" name="file" accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required /></div>
          <div><button type="submit" disabled={isLoading} className="w-full flex items-center justify-center bg-blue-600 text-white px-4 py-3 rounded-md font-semibold disabled:bg-gray-400">{isLoading && <LoadingSpinner />}{isLoading ? '제출 중 / Submitting...' : '신청서 제출 / Submit Application'}</button></div>
          {successMessage && (<div className="text-green-700 bg-green-100 p-4 rounded-md text-center font-semibold">{successMessage}</div>)}
          {error && (<div className="text-red-700 bg-red-100 p-4 rounded-md text-center font-semibold">{error}</div>)}
        </form>
      </div>
    </main>
  );
}