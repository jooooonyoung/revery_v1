// vite.config.mjs
export default {
  root: '.',         // 프로젝트 루트
  base: '/',         // Netlify 루트 도메인에 배포라면 '/' 유지
  build: {
    outDir: 'dist',  // 빌드 결과물 폴더
    emptyOutDir: true
  }
}
