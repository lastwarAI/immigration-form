// src/app/page.tsx 전체 코드 (예시 이미지 경로 수정됨)

'use client';

import React, { useState, FormEvent } from 'react';

const LoadingSpinner = () => ( <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> );
const QuestionMarkIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );

const ExampleImageModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 cursor-pointer">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl w-full max-w-md p-2 cursor-default">
        {/* --- ▼▼▼ 여기가 수정된 부분입니다 ▼▼▼ --- */}
        <img src="/image/immigration_grade_capture_example.jpg" alt="Example Screenshot" className="w-full h-auto rounded-md" />
        {/* --- ▲▲▲ 여기까지 ▲▲▲ --- */}
        <p className="text-center text-sm text-gray-500 mt-2">이 화면을 캡처해주세요 / Capture this screen</p>
      </div>
    </div>
  );
};

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isExampleModalOpen, setIsExampleModalOpen] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setIsLoading(true); setError(null); setSuccessMessage(null);
    const formData = new FormData(event.currentTarget);
    if (formData.get('immigrationGrade') === "") { setError('이민 등급을 선택해주세요.'); setIsLoading(false); return; }
    try {
      const response = await fetch('/api/submit', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) { throw new Error(result.message); }
      setSuccessMessage(result.message);
      (event.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg mb-8 border-l-4 border-blue-500">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">20서버 이민 신청<span className="block text-xl md:text-2xl text-gray-500 font-normal mt-1">Server 20 Immigration</span></h1>
          <p className="text-gray-600 mt-4 text-base md-text-lg whitespace-pre-line">서버 이민을 위한 신청서를 작성해주세요.<br/>Please fill out the application form for server transfer.</p>
        </div>
        <form className="bg-white p-6 md:p-8 rounded-lg shadow-lg space-y-8" onSubmit={handleSubmit}>
          <div><label htmlFor="nickname" className="block text-base font-medium text-gray-800">게임 닉네임 (정확하게 입력해주세요) <span className="text-red-500">*</span><span className="block text-sm text-gray-500 font-normal">Game Nickname (Please type exactly)</span></label><input id="nickname" name="nickname" className="mt-2 w-full border p-3 rounded-md" placeholder="e.g., PENGUIN" required /></div>
          <div><label htmlFor="currentServer" className="block text-base font-medium text-gray-800">현재 서버 및 연맹 <span className="text-red-500">*</span><span className="block text-sm text-gray-500 font-normal">Current Server & Alliance</span></label><input id="currentServer" name="currentServer" className="mt-2 w-full border p-3 rounded-md" placeholder="e.g., 20, HBO" required /></div>
          <div><label htmlFor="power" className="block text-base font-medium text-gray-800">총 영웅 전투력 <span className="text-red-500">*</span><span className="block text-sm text-gray-500 font-normal">Total Hero Power</span></label><input id="power" name="power" className="mt-2 w-full border p-3 rounded-md" placeholder="e.g., 186,675,261" required /></div>
          <div><label htmlFor="mainSquad" className="block text-base font-medium text-gray-800">주력 군종 및 전투력 <span className="text-red-500">*</span><span className="block text-sm text-gray-500 font-normal">Main Squad Type & Power</span></label><input id="mainSquad" name="mainSquad" className="mt-2 w-full border p-3 rounded-md" placeholder="e.g., 탱크, 55M or Tank, 55M" required /></div>
          <div><label htmlFor="immigrationGrade" className="block text-base font-medium text-gray-800">이민 등급 (이민 기간이 아닐 시 예상등급 기입) <span className="text-red-500">*</span><span className="block text-sm text-gray-500 font-normal">Immigration grade (enter expected grade if not during immigration period)</span></label><select id="immigrationGrade" name="immigrationGrade" className="mt-2 w-full border p-3 rounded-md bg-white" defaultValue="" required><option value="" disabled>- 등급 선택 / Select Grade -</option><option value="Gold">노란색 / Gold</option><option value="Purple">보라색 / Purple</option><option value="Blue">파랑색 / Blue</option><option value="White">흰색 / White</option></select></div>
          <div><label htmlFor="targetAlliance" className="block text-base font-medium text-gray-800">목표 연맹 <span className="text-red-500">*</span><span className="block text-sm text-gray-500 font-normal">Target Alliance</span></label><input id="targetAlliance" name="targetAlliance" className="mt-2 w-full border p-3 rounded-md" required /></div>
          <div><label htmlFor="note" className="block text-base font-medium text-gray-800">코멘트 (추천인 혹은 하고싶은말 등) <span className="text-red-500">*</span><span className="block text-sm text-gray-500 font-normal">Comment (e.g recommender or anything you’d like to say)</span></label><textarea id="note" name="note" className="mt-2 w-full border p-3 rounded-md h-28" required /></div>
          <div><div className="flex items-center justify-between"><label htmlFor="file" className="block text-base font-medium text-gray-800">이민 등급 페이지 스크린샷 <span className="text-red-500">*</span><span className="block text-sm text-gray-500 font-normal">Immigration Grade Page Screeenshot</span></label><button type="button" onClick={() => setIsExampleModalOpen(true)} className="p-1"><QuestionMarkIcon /></button></div><input id="file" type="file" name="file" accept="image/*" className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required /></div>
          <div><button type="submit" disabled={isLoading} className="w-full flex items-center justify-center bg-blue-600 text-white px-4 py-3 rounded-md font-semibold disabled:bg-gray-400">{isLoading && <LoadingSpinner />}{isLoading ? '제출 중 / Submitting...' : '신청서 제출 / Submit Application'}</button></div>
          {successMessage && (<div className="text-green-700 bg-green-100 p-4 rounded-md text-center font-semibold">{successMessage}</div>)}
          {error && (<div className="text-red-700 bg-red-100 p-4 rounded-md text-center font-semibold">{error}</div>)}
        </form>
      </div>
      <ExampleImageModal isOpen={isExampleModalOpen} onClose={() => setIsExampleModalOpen(false)} />
    </main>
  );
}