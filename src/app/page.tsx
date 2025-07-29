// src/app/page.tsx 전체 코드 (새로운 디자인 및 기능 적용됨)

'use client';

import React, { useState, FormEvent } from 'react';

// 로딩 아이콘 (SVG) 컴포넌트 추가
const LoadingSpinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
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
    
    // --- 드롭다운 값 가져오기 ---
    const immigrationGrade = formData.get('immigrationGrade');
    if (immigrationGrade === "") {
        setError('이민 등급을 선택해주세요. / Please select an immigration grade.');
        setIsLoading(false);
        return;
    }


    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '신청 제출에 실패했습니다.');
      }

      setSuccessMessage(result.message || '신청이 성공적으로 제출되었습니다!');
      (event.target as HTMLFormElement).reset();

    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    // --- 1. 배경 및 전체 레이아웃 개선 ---
    // min-h-screen: 화면 전체 높이를 차지
    // bg-gray-100: 연한 회색 배경으로 부드러운 느낌
    // p-4 md:p-8: 모바일과 데스크탑에서 여백을 다르게 주어 반응형 대응
    <main className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4 md:p-8">
      {/* 
        추후 배경 이미지를 넣고 싶으시면, 이 main 태그에 
        style={{ backgroundImage: 'url(/path/to/your/image.jpg)' }}
        와 같은 속성을 추가하면 됩니다.
      */}
      <div className="w-full max-w-2xl mx-auto">
        
        {/* --- 2. 공지사항 스타일의 설명 영역 --- */}
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg mb-8 border-l-4 border-blue-500">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            20서버 이민 신청 <span className="text-gray-400 font-normal">/</span> Server 20 Immigration
          </h1>
          <p className="text-gray-600 mt-4 text-base md:text-lg whitespace-pre-line">
            {/* 
              여기에 공지사항을 자유롭게 적으시면 됩니다.
              줄바꿈도 그대로 적용됩니다. (whitespace-pre-line)
            */}
            서버 이민을 위한 신청서를 작성해주세요.
            Please fill out the application form for server transfer.
          </p>
        </div>

        {/* --- 3. 메인 폼 영역 --- */}
        <form 
          className="bg-white p-6 md:p-8 rounded-lg shadow-lg space-y-6" 
          onSubmit={handleSubmit}
        >
          {/* 각 입력 필드를 div로 감싸서 구조화 */}
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
              게임 닉네임 <span className="text-gray-400">/</span> Game Nickname <span className="text-red-500">*</span>
            </label>
            <input
              id="nickname"
              name="nickname"
              className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 transition"
              placeholder="정확하게 입력 Type exactly / e.g., PENGUIN"
              required // 필수 입력 항목
            />
          </div>

          <div>
            <label htmlFor="currentServer" className="block text-sm font-medium text-gray-700 mb-1">
              현재 서버 및 연맹 <span className="text-gray-400">/</span> Current Server & Alliance <span className="text-red-500">*</span>
            </label>
            <input
              id="currentServer"
              name="currentServer"
              className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 transition"
              placeholder="e.g., 20, HBO"
              required
            />
          </div>

          <div>
            <label htmlFor="power" className="block text-sm font-medium text-gray-700 mb-1">
              총 영웅 전투력 <span className="text-gray-400">/</span> Total Hero Power <span className="text-red-500">*</span>
            </label>
            <input
              id="power"
              name="power"
              className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 transition"
              placeholder="e.g., 186,675,261"
              required
            />
          </div>
          
          <div>
            <label htmlFor="mainSquad" className="block text-sm font-medium text-gray-700 mb-1">
              주력 군종 및 전투력 <span className="text-gray-400">/</span> Main Squad Type & Power <span className="text-red-500">*</span>
            </label>
            <input
              id="mainSquad"
              name="mainSquad" // name 속성을 id와 맞추어 추가
              className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 transition"
              placeholder="e.g., 탱크 Tank, 55M"
              required
            />
          </div>

          {/* --- 4. 이민 등급 드롭다운 구현 --- */}
          <div>
            <label htmlFor="immigrationGrade" className="block text-sm font-medium text-gray-700 mb-1">
              이민 등급 (이민 기간이 아닐 시 예상등급 기입) <span className="text-gray-400">/</span> Immigration grade (if it is not the immigration period, enter your expected grade) <span className="text-red-500">*</span>
            </label>
            <select
              id="immigrationGrade"
              name="immigrationGrade"
              className="w-full border p-3 rounded-md bg-white focus:ring-2 focus:ring-blue-500 transition"
              defaultValue="" // 기본값을 비워둬서 사용자가 선택하도록 유도
              required
            >
              <option value="" disabled>-- 등급을 선택해주세요 / Select Grade --</option>
              <option value="Gold">노란색 / Gold</option>
              <option value="Purple">보라색 / Purple</option>
              <option value="Blue">파랑색 / Blue</option>
              <option value="White">흰색 / White</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="targetAlliance" className="block text-sm font-medium text-gray-700 mb-1">
              목표 연맹 <span className="text-gray-400">/</span> Target Alliance <span className="text-red-500">*</span>
            </label>
            <input
              id="targetAlliance"
              name="targetAlliance"
              className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 transition"
              placeholder=""
              required
            />
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              이민 코멘트 (추천인 혹은 자기소개도 가능) <span className="text-gray-400">/</span> Immigration Comment (recommender or self‑introduction optional)
            </label>
            <textarea
              id="note"
              name="note"
              className="w-full border p-3 rounded-md h-28 focus:ring-2 focus:ring-blue-500 transition"
              placeholder=""
            />
          </div>

          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
              이민 등급 페이지 스크린샷 <span className="text-gray-400">/</span> Immigration Grade Page Screeenshot <span className="text-red-500">*</span>
            </label>
            <input
              id="file"
              type="file"
              name="file"
              accept="image/*"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            {/* 
              추후 예시 이미지를 보여주고 싶다면 이 아래에
              <button type="button" onClick={() => alert('예시 이미지 팝업')}>예시 보기</button> 
              같은 버튼을 추가할 수 있습니다.
            */}
          </div>

          {/* --- 5. 제출 버튼 및 상태 메시지 개선 --- */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-blue-600 text-white px-4 py-3 rounded-md font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300 hover:bg-blue-700"
            >
              {isLoading && <LoadingSpinner />}
              {isLoading ? '제출 중 / Submitting...' : '신청서 제출 / Submit Application'}
            </button>
          </div>

          {successMessage && (
            <div className="text-green-700 bg-green-100 p-4 rounded-md text-center font-semibold">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="text-red-700 bg-red-100 p-4 rounded-md text-center font-semibold">
              {error}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}