'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HelpRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/analysis');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center p-20 gap-3 text-zinc-500 animate-pulse">
      <p className="text-xs font-bold">분석 및 해결책 센터로 이동 중...</p>
    </div>
  );
}
