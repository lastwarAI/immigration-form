import { readFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

// --- 여기가 최종 수정된 경로입니다 ---
const filePath = path.join(process.cwd(), 'src', 'app', 'data', 'applications.json');
// --- 수정 끝 ---

const ADMIN_PASSWORD = "lastwar2025"; 

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');

  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: '인증에 실패했습니다. 유효한 토큰이 필요합니다.' }, { status: 401 });
  }
  
  try {
    const data = await readFile(filePath, 'utf-8');
    const applications = JSON.parse(data);
    return NextResponse.json(applications);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json([]);
    }
    return NextResponse.json({ error: '서버 내부 오류: 데이터를 읽을 수 없습니다.' }, { status: 500 });
  }
}