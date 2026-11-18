# 프로젝트 개발 규칙

이 문서는 프로젝트의 코드 작성 및 배포 설정 규칙을 기록합니다. 이후 코드 작업을 시작하기 전에 이 문서를 참고합니다.

## 파일 구성

- HTML, CSS, JavaScript 코드는 각각 분리된 파일로 작성합니다.
- `index.html`은 프로젝트 루트에 둡니다.
- 애플리케이션의 CSS와 JavaScript 파일은 `src/` 폴더에 둡니다.
- `vite.config.js`를 포함한 설정 파일은 프로젝트 루트에 둡니다.

## 모듈과 스타일

- JavaScript는 ES 모듈 방식으로 연결합니다.
- CSS는 JavaScript 진입 파일에서 import하여 Vite 빌드에 포함합니다.
- 외부 JavaScript 라이브러리는 npm으로 설치하고 모듈로 import합니다. CDN은 사용하지 않습니다.

## 기존 파일과 설정

- 작업 전 기존 파일과 설정을 확인합니다.
- 필요한 부분만 수정하고 기존 구성을 불필요하게 바꾸지 않습니다.

## 빌드 및 배포

- `npm run build`로 Vite 빌드를 실행합니다.
- Vite 기본 진입점인 루트 `index.html`과 기본 빌드 출력 폴더인 `dist/`를 사용합니다.
- Netlify의 Build command는 `npm run build`, Publish directory는 `dist`로 설정합니다.
