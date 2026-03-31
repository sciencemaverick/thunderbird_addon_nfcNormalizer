# Thunderbird Korean Attachment NFC Normalizer for macOS

macOS에서 Thunderbird로 메일을 보낼 때 한글 첨부 파일명이 `ㅎㅏㄴㄱㅡㄹ`처럼 깨져 보이는 문제는 국내 Mac 사용자들이 오래 겪어 온 불편입니다. 이 add-on은 그 문제를 Thunderbird compose 단계에서 최대한 자연스럽게 줄이기 위해 만들었습니다.

원본 파일은 건드리지 않고, 메일 작성창에 추가된 첨부 이름만 Unicode `NFC`로 보정합니다.

## Status

현재는 `beta` 단계입니다.

실사용 기준으로 동작 검증은 마쳤지만, 정식 배포 전 단계이므로 더 많은 환경에서의 확인이 필요합니다.

개발 기준 버전은 `Thunderbird 140`이며, 개발자 환경에서는 `Thunderbird 149.0.1 (aarch64)` on macOS에서 테스트를 마쳤습니다.

## Purpose

- macOS Thunderbird에서 첨부 파일명이 `NFD`로 들어오는 경우를 줄입니다.
- Windows나 웹메일에서 한글 첨부명이 자소 분리로 보이는 문제를 완화합니다.
- 사용자는 평소처럼 파일을 첨부하면 됩니다.

## Features

- 첨부 직후 파일명을 자동으로 `NFC`로 보정
- 메일 전송 직전에 첨부 이름을 한 번 더 검사
- 설정 화면에서 주요 동작 on/off 제어
- 문제 재현 후 진단 로그를 JSON 파일로 저장 가능

## How It Works

1. 사용자가 Thunderbird compose 창에서 파일을 첨부합니다.
2. add-on이 `compose.onAttachmentAdded` 이벤트를 감지합니다.
3. 첨부 이름이 `NFC`가 아니면 `normalize("NFC")` 결과로 이름을 갱신합니다.
4. 전송 직전 `compose.onBeforeSend`에서 전체 첨부를 다시 확인합니다.

핵심은 파일 시스템 전체를 바꾸는 것이 아니라, Thunderbird 메일 작성 흐름 안에서만 첨부 이름을 정리하는 데 있습니다.

## Scope

- `macOS`용 Thunderbird add-on
- 개발 기준: `Thunderbird 140+`
- 원본 파일 이름 변경 없음
- macOS 전역 파일명 정책 변경 없음
- compose 흐름의 첨부 이름만 보정

## Why Thunderbird

같은 문제를 `Apple Mail`이나 `Outlook for Mac`에서도 해결하고 싶었지만, 현재 공개된 확장/API 제약상 Thunderbird처럼 compose 단계의 첨부 이름을 직접 감지하고 갱신하는 방식으로 구현하기가 어렵습니다.

이 add-on은 Thunderbird가 제공하는 compose attachment API를 활용하는 방식으로 만들어졌습니다.

## Settings

설정 화면에서 아래 항목을 바꿀 수 있습니다.

- 첨부 즉시 자동 보정
- 전송 직전 다시 검사
- 보정 실패 시 전송 차단
- 상세 로그 기록
- 진단 로그 저장

## Support

사용 중 문제가 생기면 GitHub Issues로 알려주세요.

- Issues: https://github.com/sciencemaverick/thunderbird_addon_nfcNormalizer/issues

가능하면 설정 화면의 `진단 로그 저장`으로 만든 JSON 로그 파일을 함께 첨부해 주세요. 재현 상황을 확인하는 데 큰 도움이 됩니다.

## Install

배포 파일은 GitHub Releases에서 받을 수 있습니다.

- Releases: https://github.com/sciencemaverick/thunderbird_addon_nfcNormalizer/releases

직접 패키징하려면 아래 명령을 실행하면 됩니다.

```sh
sh scripts/package.sh
```

## License

이 프로젝트는 [MIT License](./LICENSE)를 따릅니다.
