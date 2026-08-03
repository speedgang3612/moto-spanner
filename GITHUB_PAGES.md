# GitHub Pages 배포 안내

GitHub 사용자명: `speedgang3612`

추천 저장소 이름: `moto-spanner`

배포 후 예상 주소:

```text
https://speedgang3612.github.io/moto-spanner/
```

## 업로드할 파일

아래 파일과 폴더를 GitHub 저장소 루트에 올리면 됩니다.

- `index.html`
- `styles.css`
- `app.js`
- `motorcycle-data.js`
- `assets/`
- `.nojekyll`
- `.gitignore`
- `scripts/`
- `README.md`
- `BRAND_OPTIONS.md`
- `MODEL_AUDIT.md`

`dist/`와 `.openai/`는 Codex Sites용 파일이라 GitHub Pages에는 필요 없습니다.

## GitHub Pages 켜기

1. GitHub에서 `speedgang3612/moto-spanner` 저장소를 만듭니다.
2. 위 파일들을 저장소 루트에 업로드합니다.
3. 저장소의 `Settings`로 이동합니다.
4. 왼쪽 메뉴에서 `Pages`를 엽니다.
5. `Build and deployment`에서 `Deploy from a branch`를 선택합니다.
6. Branch는 `main`, folder는 `/root`로 선택하고 저장합니다.
7. 잠시 후 `https://speedgang3612.github.io/moto-spanner/` 주소로 접속합니다.

## 참고

GitHub Pages는 정적 파일을 배포합니다. 이 MVP의 데이터는 각 사용자의 브라우저 로컬 저장소에 저장됩니다.

## 이후 자동 푸시

파일을 수정한 뒤 아래 PowerShell 스크립트를 실행하면 필요한 파일만 자동으로 커밋하고 GitHub에 푸시합니다.

```powershell
.\scripts\push-to-github.ps1
```

처음 실행할 때 GitHub 로그인이 필요하면 Git Credential Manager가 브라우저 인증을 띄울 수 있습니다.
