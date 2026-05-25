# Bookmarks

북마크를 저장하고, 태그로 분류하고, 컬렉션으로 팀과 공유하는 웹 앱입니다.

## 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **데이터베이스**: Supabase (PostgreSQL + Row Level Security)
- **인증**: Supabase Auth (Google OAuth)
- **스타일링**: Tailwind CSS v4
- **배포**: Vercel

## 주요 기능

- Google 계정으로 로그인
- URL 입력 시 제목 자동 가져오기 (og:title, `<title>` 파싱)
- 태그 추가 및 태그별 필터링
- 컬렉션 생성 및 북마크 묶기
- 컬렉션 공개/비공개 전환 및 공유 링크 생성
- 공유 링크는 로그인 없이 열람 가능 (`/share/[slug]`)

## 로컬 개발

```bash
npm install
npm run dev
```

앱은 `http://localhost:3000` 에서 실행됩니다.

### 환경 변수

`.env.local` 파일을 프로젝트 루트에 생성하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### 데이터베이스 스키마

`supabase/schema.sql` 을 Supabase 대시보드의 SQL Editor에서 실행하세요.

테이블 구성:

| 테이블 | 설명 |
|---|---|
| `bookmarks` | 사용자별 북마크 (RLS 적용) |
| `collections` | 북마크 묶음, 공개/비공개 설정 가능 |
| `collection_bookmarks` | 북마크 ↔ 컬렉션 다대다 연결 |

## 배포

Vercel에 연결하면 `main` 브랜치 푸시 시 자동 배포됩니다.

```bash
npm run build   # 빌드 확인
```
