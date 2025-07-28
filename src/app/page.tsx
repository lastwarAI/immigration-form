'use client';

import React, { useState, FormEvent } from 'react';

export default function Home() {
  // 폼 제출 상태 관리를 위한 state (로딩, 에러, 성공 메시지)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 폼 제출 시 실행될 함수
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // 기본 폼 제출(새로고침) 방지

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData, // FormData 객체를 직접 body에 전달
      });

      const result = await response.json();

      if (!response.ok) {
        // 서버에서 에러 응답이 온 경우
        throw new Error(result.message || '신청 제출에 실패했습니다.');
      }

      // 성공 시
      setSuccessMessage(result.message || '신청이 성공적으로 제출되었습니다!');
      // 성공 후 폼 초기화 (선택 사항)
      (event.target as HTMLFormElement).reset();

    } catch (err) {
      // 네트워크 오류 또는 서버 에러 발생 시
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg my-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">20서버 이민 신청 Server 20 immigration application</h1>
        <p className="text-gray-600 mt-2">서버 이전을 위한 신청서를 작성해주세요. Please fill out the application form for server transfer.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
            닉네임 Nickname
          </label>
          <input
            id="nickname"
            name="nickname"
            className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="게임 내 닉네임"
            required
          />
        </div>

        <div>
          <label htmlFor="currentServer" className="block text-sm font-medium text-gray-700 mb-1">
            현재 서버 Current server
          </label>
          <input
            id="currentServer"
            name="currentServer"
            className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="예: 45"
            required
          />
        </div>

        <div>
          <label htmlFor="targetServer" className="block text-sm font-medium text-gray-700 mb-1">
            희망 서버 Target server
          </label>
          <input
            id="targetServer"
            name="targetServer"
            className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="예: 20"
            required
          />
        </div>

        <div>
          <label htmlFor="power" className="block text-sm font-medium text-gray-700 mb-1">
            전투력 Power
          </label>
          <input
            id="power"
            name="power"
            className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="예: 250,000,000"
            required
          />
        </div>

        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
            이민 사유 또는 메모 Reason and comment
          </label>
          <textarea
            id="note"
            name="note"
            className="w-full border p-2 rounded-md h-24 focus:ring-2 focus:ring-blue-500"
            placeholder="간단한 자기소개나 이민 사유를 적어주세요."
          />
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
            전투력 스크린샷 Image
          </label>
          <input
            id="file"
            type="file"
            name="file"
            accept="image/*"
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* 제출 버튼 및 상태 메시지 */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-black text-white px-4 py-3 rounded-md w-full font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300 hover:bg-gray-800"
          >
            {isLoading ? '제출 중...' : '신청 제출'}
          </button>
        </div>

        {/* 성공 메시지 */}
        {successMessage && (
          <div className="text-green-600 bg-green-50 p-3 rounded-md text-center">
            {successMessage}
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="text-red-600 bg-red-50 p-3 rounded-md text-center">
            {error}
          </div>
        )}
      </form>
    </main>
  );
}