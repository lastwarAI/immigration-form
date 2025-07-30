// src/app/api/submit/route.ts 전체 코드 (버전 관리 로직 적용)

import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { kv } from '@vercel/kv';
import type { Application } from '@/types';
import { randomUUID } from 'crypto'; // 고유 ID 생성을 위해 내장 모듈 사용

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const nickname = formData.get('nickname') as string;
    const currentServerAndAlliance = formData.get('currentServer') as string;
    const heroPower = formData.get('power') as string;
    const mainSquad = formData.get('mainSquad') as string;
    const immigrationGrade = formData.get('immigrationGrade') as string;
    const targetAlliance = formData.get('targetAlliance') as string;
    const note = formData.get('note') as string;
    const file = formData.get('file') as File | null;

    if (!nickname || !currentServerAndAlliance || !heroPower || !mainSquad || !immigrationGrade || !targetAlliance || !note || !file || file.size === 0) {
      return NextResponse.json({ message: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    let imageUrl: string | null = null;
    if (file && file.size > 0) {
      const filename = `${Date.now()}_${nickname.replace(/\s+/g, '_')}_${file.name.replace(/\s+/g, '_')}`;
      const blob = await put(filename, file, { access: 'public' });
      imageUrl = blob.url;
    }

    const applications = await kv.get<Application[]>('applications') || [];

    // 닉네임으로 기존 신청 이력이 있는지 검색 (최신순으로 정렬 후 찾기)
    const existingApplications = applications
      .filter(app => app.nickname.toLowerCase() === nickname.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    let applicantId: string;
    let successMessage = '';

    if (existingApplications.length > 0) {
      // 기존 신청자: 최신 버전에서 applicantId를 물려받음
      applicantId = existingApplications[0].applicantId;
      successMessage = '신청서가 성공적으로 업데이트되었습니다! (새 버전 생성) / Application updated successfully! (New version created)';
    } else {
      // 신규 신청자: 새로운 applicantId 발급
      applicantId = randomUUID();
      successMessage = '신청이 성공적으로 제출되었습니다! Thank you! Your application was submitted successfully!';
    }
    
    // 항상 새로운 신청 '버전'을 생성
    const newVersionEntry: Application = {
      applicantId,
      nickname,
      currentServerAndAlliance,
      heroPower,
      mainSquad,
      immigrationGrade,
      targetAlliance,
      note,
      image: imageUrl,
      createdAt: new Date().toISOString(),
      isConfirmed: false,
      status: '대기중',
    };

    // 데이터베이스에 새 버전 추가
    applications.push(newVersionEntry);
    await kv.set('applications', applications);

    return NextResponse.json({ success: true, message: successMessage });

  } catch (err) {
    console.error('버전 생성 처리 오류:', err);
    const errorMessage = err instanceof Error ? err.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}