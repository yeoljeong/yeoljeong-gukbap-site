# 가맹문의 폼 → 구글 시트 연동 설정 (5분)

가맹문의 폼(`js/문의폼.js`)이 제출되면 아래 Apps Script 웹앱으로 데이터를 전송해 구글 시트에 자동으로 쌓입니다.

## 1. 구글 시트 만들기
1. https://sheets.google.com 에서 새 스프레드시트 생성 (이름 예: `열정국밥 가맹문의`)
2. 첫 번째 시트 탭 이름을 `문의`로 변경

## 2. Apps Script 붙여넣기
1. 시트 메뉴에서 **확장 프로그램 → Apps Script** 클릭
2. 기본 코드를 모두 지우고 아래 코드를 붙여넣기

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('문의');
  var data = JSON.parse(e.postData.contents);
  var 유입 = data.유입경로 || {};

  sheet.appendRow([
    new Date(),
    data.성함 || '',
    data.연락처 || '',
    data.나이 || '',
    data.희망지역 || '',
    유입.utm_source || '',
    유입.utm_medium || '',
    유입.utm_campaign || '',
    유입.referrer || '',
    유입.landing_page || ''
  ]);

  return ContentService.createTextOutput(JSON.stringify({ result: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. 저장 (Ctrl+S), 프로젝트 이름은 아무거나 지정

## 3. 웹앱으로 배포
1. 우측 상단 **배포 → 새 배포**
2. 유형 선택에서 톱니바퀴 클릭 → **웹앱** 선택
3. 설정:
   - 실행 대상 계정: **나**
   - 액세스 권한이 있는 사용자: **모든 사용자**
4. **배포** 클릭 → 처음이면 권한 승인 진행 (본인 계정이므로 "고급" → "이동" 눌러 승인)
5. 발급된 **웹앱 URL**(`https://script.google.com/macros/s/.../exec`)을 복사

## 4. 사이트에 연결
`js/문의폼.js` 상단의 아래 줄을 방금 복사한 URL로 교체:

```javascript
var WEBHOOK_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

교체 후 저장 → GitHub에 커밋/푸시하면 실제 가맹문의가 시트에 쌓이기 시작합니다.

## 5. 시트 코드를 수정한 경우
Apps Script 코드를 나중에 수정하면 **배포 → 배포 관리 → 수정(연필 아이콘) → 새 버전으로 배포**를 눌러야 반영됩니다.
