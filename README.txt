
# Revery v10 Merge Kit (Menu Overlay only)

이 키트는 기존 v10 파일들을 **교체하지 않고** 메뉴 오버레이만 추가/통합하기 위한 드롭인 세트입니다.

## 1) 파일 추가
아래 3개 파일을 프로젝트 루트에 업로드하세요.
- `menufix.css`
- `menufix.js`
- `overlay.html` (복붙용 스니펫)

## 2) `<head>`에 CSS 한 줄 추가
`styles.css` 바로 아래에 다음을 추가:
```html
<link rel="stylesheet" href="/menufix.css">
```

## 3) 헤더에 햄버거 버튼 확인/추가
기존 헤더(로고 영역) 안에 햄버거 버튼이 없다면 아래 버튼 하나를 추가:
```html
<button class="burger" aria-expanded="false" aria-controls="nav-overlay" aria-label="menu">
  <span></span><span></span><span></span>
</button>
```
- 로고 링크 요소에는 `class="brand"` 가 있어야 합니다. (없다면 추가)

## 4) `</body>` 바로 위에 오버레이 마크업 붙여넣기
`overlay.html` 파일 내용을 **그대로 복사**해서 `</body>` 태그 직전에 붙여넣으세요.
(한 페이지마다 한 번만 넣으면 됩니다.)

## 5) 바디 끝에 JS 한 줄 추가
`app.js` 다음 줄에 아래 스크립트를 추가:
```html
<script src="/menufix.js" defer></script>
```

## 6) 끝!
- 홈/어바웃/서비스 등 기존 섹션은 손대지 않습니다.
- 메뉴 열기 시 로고가 사라지고, X는 흰색으로 변하며, 배경은 #000 90% 투명, 하위메뉴는 중앙 상시노출 + 호버시 함께 강조됩니다.
