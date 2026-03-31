# Thunderbird Korean Attachment NFC Normalizer for macOS

macOS에서 Thunderbird로 메일을 작성할 때 첨부 파일명이 NFD(자소 분리형)로 들어오면, 원본 파일은 건드리지 않고 compose 창의 첨부 표시 이름만 Unicode NFC로 보정하는 Thunderbird MailExtension입니다.

## 현재 범위

- macOS + Thunderbird compose 흐름 전용
- 원본 파일 rename 없음
- macOS 전역 파일명 정책 변경 없음
- compose attachment 이름만 NFC로 보정
- 첨부 직후 1차 보정
- 전송 직전 2차 재검사

## 기능 요약

- macOS Thunderbird compose 창에서 첨부 파일명을 NFC로 자동 보정
- 전송 직전 전체 첨부를 다시 검사
- 설정 화면에서 동작 옵션 조정
- 문제 재현 후 JSON 로그 파일 저장 가능

## 구현 상태

현재 버전에는 아래 기능이 포함되어 있습니다.

- `compose.onAttachmentAdded`에서 첨부 추가 감지
- `attachment.name.normalize("NFC")` 비교
- 필요 시 `compose.updateAttachment()`로 표시 이름 변경
- `compose.onBeforeSend`에서 누락 재검사
- 간단한 in-memory cache로 중복 처리 완화
- `browser.storage.local` 기반 설정 저장
- options page 기반 설정 UI
- 최근 로그 메모리 버퍼 유지
- 설정 화면에서 로그 JSON 내보내기

현재 코드는 아래 구성으로 정리되어 있습니다.

- [`background.js`](./background.js): 이벤트 등록과 메시지 브리지
- [`icons/`](./icons): add-on 아이콘
- [`src/attachment-handler.js`](./src/attachment-handler.js): 첨부 normalize/update 로직
- [`src/normalize.js`](./src/normalize.js): NFC 판단과 code point 설명
- [`src/settings.js`](./src/settings.js): 설정 기본값과 storage 로딩
- [`src/logger.js`](./src/logger.js): console 출력과 최근 로그 버퍼
- [`options/`](./options): 설정 화면과 로그 파일 저장 버튼
- [`docs/`](./docs): 배포 제출용 문안 초안

## Thunderbird API 사용 포인트

- `browser.compose.onAttachmentAdded`
  첨부가 추가되는 시점을 감지합니다.
- `browser.compose.updateAttachment(tabId, attachmentId, { name })`
  첨부 표시 이름을 업데이트합니다.
- `browser.compose.onBeforeSend`
  전송 직전 다시 전체 첨부를 검사합니다.
- `browser.compose.listAttachments(tabId)`
  compose 창의 현재 첨부 목록을 조회합니다.

이 프로젝트는 Thunderbird compose API가 제공하는 attachment rename/update 기능을 활용합니다.

## 중요한 제약

1. 이 확장은 원본 파일명을 변경하지 않습니다.
2. 이 확장은 Thunderbird 작성창의 첨부명만 NFC로 보정합니다.
3. Thunderbird API 문서상 첨부 rename/update는 가능하지만, 실제 수신 클라이언트가 표시하는 최종 파일명은 메일 전송 인코딩 및 수신 클라이언트 구현에 따라 달라질 수 있으므로 실제 수신 테스트가 필요합니다.
4. 이 확장은 특히 macOS에서 작성하고 Windows에서 수신할 때 발생하는 한글 자소분리 문제 완화를 목표로 합니다.

## 참고 프로젝트

이 프로젝트는 아래 작업들을 참고하지만, 범위는 명확히 다릅니다.

- [`nfd2nfc`](https://github.com/elgar328/nfd2nfc)
  macOS 파일시스템의 NFD/NFC 차이를 다루는 watcher/rename 도구입니다. 이 프로젝트에서는 문제 정의, normalization 사고방식, limitation 서술을 참고합니다. 실제 파일 rename, watcher, LaunchAgent 구조는 가져오지 않습니다.
- [`jaso`](https://github.com/hsol/jaso)
  macOS 사용자의 한글 자소분리 pain point를 다루는 앱입니다. 이 프로젝트에서는 사용자 문제 설명과 UX 톤을 참고합니다. 시스템 전역 앱 구조는 가져오지 않습니다.

## 테스트 파일명 케이스

테스트 케이스는 [`test/normalization-cases.json`](./test/normalization-cases.json)에 정리했습니다.

대표 예시:

- `한글.txt`
- `한글.txt`
- `보고서_최종본.pdf`
- `보고서_최종본.pdf`
- `Résumé_한글.pdf`

실제 수동 검증에 사용한 파일은 [`test-fixtures`](./test-fixtures) 에 보관합니다. 현재는 실제 파일 기반 테스트만 유지하고, 혼동을 줄 수 있는 `0 byte` 더미 파일은 더 이상 사용하지 않습니다.

## 로컬 테스트 방법

1. Thunderbird에서 Add-on 임시 설치 기능으로 이 폴더를 로드합니다.
2. [`test-fixtures`](./test-fixtures) 안의 실제 파일 중 NFD 이름 파일을 compose 창에 첨부합니다.
3. 첨부 직후 이름이 NFC로 보정되는지 확인합니다.
4. background DevTools Console에서 normalization 로그를 확인합니다.
5. 자기 자신에게 테스트 메일을 보내 `Downloads` 폴더에 저장한 실제 수신 첨부명을 확인합니다.
6. 설정 화면의 `로그 파일 저장` 버튼으로 문제 재현 시점의 로그 JSON을 내려받을 수 있습니다.
7. 가능하면 Windows Thunderbird, Outlook, Gmail Web에서도 비교 확인합니다.

## 설정 화면

설정 화면에서는 아래 항목을 조정할 수 있습니다.

- 첨부 즉시 자동 보정
- 전송 직전 다시 검사
- 보정 실패 시 전송 차단
- Debug logging
- 로그 파일 저장
- 로그 버퍼 비우기

## 검증 결과

현재 버전은 add-on이 로드된 상태에서 실제 NFD 파일 3개와 NFC 파일 1개를 첨부해 자기 자신에게 보낸 뒤 `Downloads`에 저장한 결과가 모두 기대대로 확인되었습니다.

입력 파일:

- NFD: `스크루테이프_영어.docx`
- NFC: `0322 주일 광고 영상(수정).txt`
- NFD: `가족관계등록부 열람_발급 _ 전자가족관계등록시스템.pdf`
- NFD: `힘의평형 (결과보고서 양식).pdf`

다운로드 결과:

- `스크루테이프_영어.docx` -> NFC
- `0322 주일 광고 영상(수정).txt` -> NFC 유지
- `가족관계등록부 열람_발급 _ 전자가족관계등록시스템.pdf` -> NFC
- `힘의평형 (결과보고서 양식).pdf` -> NFC

background 로그에서도 다음 흐름이 확인되었습니다.

- `attachment-added` 시점에 NFD 첨부 3개에 대해 `Normalizing attachment name` 실행
- `before-send` 시점에는 4개 첨부 모두 `already-normalized-cache-hit`
- 즉 compose 단계에서 이미 NFC 이름으로 정규화된 상태로 전송 흐름에 들어감

따라서 현재 버전은 최소한 `Thunderbird compose -> self-send -> macOS Downloads 저장` 경로에서 목적을 달성하는 것으로 확인되었습니다.

추가 검증:

- Outlook 수신 테스트에서 baseline 비교용 파일은 원본과 동일한 NFD 상태로 확인되었습니다.
- Gmail Web에서 받은 ZIP 내부 파일명은 NFC로 확인되었습니다.

주의할 점:

- 이전에 add-on이 로드되지 않았던 상태에서 얻은 결과는 판정에서 제외합니다.
- 이전 `0 byte` 더미 파일 테스트는 실제 파일 첨부 동작과 다르게 보일 수 있어 현재 판단 근거에서 제외합니다.
- 다른 수신 클라이언트, 특히 Outlook/웹메일 쪽은 별도 실수신 테스트가 필요합니다.

## 다음 단계

- Outlook 실수신 테스트 범위 확대
- 로그 파일 내보내기 UX 다듬기
- XPI 패키징 가이드 추가

## 패키징

개발용 파일을 제외한 배포용 XPI는 아래 스크립트로 생성합니다.

```sh
sh scripts/package.sh
```

생성 위치:

- `dist/korean-attachment-nfc-normalizer-0.1.0.xpi`

이 스크립트는 runtime에 필요한 파일만 포함합니다.

- `manifest.json`
- `background.js`
- `src/`
- `options/`

## GitHub 업로드 메모

GitHub에 올릴 때는 아래 파일들이 핵심입니다.

- 소스 코드: `background.js`, `src/`, `options/`
- 문서: `README.md`, `CHANGELOG.md`, `docs/`
- 아이콘: `icons/`
- 테스트 자료: `test/`, `test-fixtures/`

`dist/`는 생성 산출물이므로 git 추적 대상에서 제외합니다.

프로젝트 저장소:

- https://github.com/sciencemaverick/thunderbird_addon_nfcNormalizer

이슈 제보:

- https://github.com/sciencemaverick/thunderbird_addon_nfcNormalizer/issues

## License

이 프로젝트는 [MIT License](./LICENSE)를 따릅니다.
