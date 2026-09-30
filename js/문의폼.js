// 가맹 상담 신청 폼 (4단계): 정보입력 -> 본인인증(데모) -> 신용정보 조회 동의 -> 완료
// 완료 시 구글 시트(Apps Script 웹앱)로 실제 데이터를 전송합니다.
(function () {
  // ▼▼▼ 구글 시트 연동: Apps Script 배포 후 발급받은 웹앱 URL로 교체하세요 ▼▼▼
  var WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbz8LBtq3goQuJAx62GRMdL6tRebpgJbVb1fs_MOphA8DnfBr1F9UUGekypNFfG5W-Yu/exec";
  // ▲▲▲ 배포 방법은 GOOGLE_SHEETS_연동방법.md 참고 ▲▲▲

  var 카드 = document.querySelector(".apply-card");
  if (!카드) return;

  var 진행바스팬 = 카드.querySelectorAll(".진행바 span");
  var 단계요소 = {};
  카드.querySelectorAll(".단계[data-step]").forEach(function (el) {
    단계요소[el.getAttribute("data-step")] = el;
  });

  var 상태 = {
    현재단계: 1,
    성함: "", 연락처: "", 나이: "", 희망지역: "",
    인증코드: null,
    제출완료: false
  };

  function 봇인가() {
    var bot = document.getElementById("bot-field");
    return !!(bot && bot.value);
  }

  function 단계이동(n) {
    상태.현재단계 = n;
    Object.keys(단계요소).forEach(function (key) {
      단계요소[key].classList.toggle("보임", Number(key) === n);
    });
    진행바스팬.forEach(function (span) {
      var s = Number(span.getAttribute("data-step"));
      span.classList.toggle("진행중", s <= n);
    });
  }

  function 오류표시(id, 보일지) {
    var el = document.getElementById(id);
    if (el) el.classList.toggle("보임", !!보일지);
  }

  // ---------- 자세히 토글 (개인정보 / 신용정보 동의 상세) ----------
  function 자세히토글(버튼id, 상세id) {
    var 버튼 = document.getElementById(버튼id);
    var 상세 = document.getElementById(상세id);
    if (!버튼 || !상세) return;
    버튼.addEventListener("click", function () {
      var 열림 = 상세.classList.toggle("보임");
      버튼.textContent = 열림 ? "접기" : "자세히";
    });
  }
  자세히토글("개인정보자세히버튼", "개인정보상세");
  자세히토글("신용동의자세히버튼", "신용동의상세");

  // ---------- 1단계: 정보 입력 ----------
  var 전화정규식 = /^01[0-9]-?\d{3,4}-?\d{4}$/;

  document.getElementById("1단계다음").addEventListener("click", function () {
    if (봇인가()) return;

    var 성함 = (document.getElementById("성함입력").value || "").trim();
    var 연락처 = (document.getElementById("연락처입력").value || "").trim();
    var 나이 = Number(document.getElementById("나이입력").value);
    var 희망지역 = document.getElementById("희망지역선택").value;
    var 동의 = document.getElementById("개인정보동의").checked;

    var 유효 = 성함.length >= 2 &&
      전화정규식.test(연락처) &&
      나이 >= 19 && 나이 <= 99 &&
      !!희망지역 &&
      동의;

    오류표시("1단계오류", !유효);
    if (!유효) return;

    상태.성함 = 성함;
    상태.연락처 = 연락처;
    상태.나이 = 나이;
    상태.희망지역 = 희망지역;

    var 인증대상 = document.getElementById("인증대상번호");
    if (인증대상) 인증대상.textContent = 연락처;

    단계이동(2);
  });

  // ---------- 2단계: 본인 확인 (데모) ----------
  var 인증번호입력 = document.getElementById("인증번호입력");
  var 인증발송버튼 = document.getElementById("인증발송버튼");
  var 다음버튼2 = document.getElementById("2단계다음");
  var 인증도움말 = document.getElementById("인증도움말");

  인증발송버튼.addEventListener("click", function () {
    if (봇인가()) return;
    상태.인증코드 = String(Math.floor(100000 + Math.random() * 900000));

    인증번호입력.disabled = false;
    인증번호입력.value = "";
    인증번호입력.focus();
    오류표시("2단계오류", false);

    if (인증도움말) {
      인증도움말.innerHTML = "인증번호를 발송했습니다. (데모 환경: 인증번호 <strong>" +
        상태.인증코드 + "</strong>)";
    }

    var 원래문구 = "인증번호 발송";
    var 남은초 = 30;
    인증발송버튼.disabled = true;
    인증발송버튼.textContent = "재발송(" + 남은초 + "초)";
    var 타이머 = setInterval(function () {
      남은초 -= 1;
      if (남은초 <= 0) {
        clearInterval(타이머);
        인증발송버튼.disabled = false;
        인증발송버튼.textContent = 원래문구;
      } else {
        인증발송버튼.textContent = "재발송(" + 남은초 + "초)";
      }
    }, 1000);
  });

  인증번호입력.addEventListener("input", function () {
    var 일치 = 상태.인증코드 && 인증번호입력.value === 상태.인증코드;
    다음버튼2.disabled = !일치;
    다음버튼2.style.opacity = 일치 ? "1" : "0.5";
    다음버튼2.textContent = 일치 ? "다음" : "본인인증 필요";
    오류표시("2단계오류", false);
  });

  다음버튼2.addEventListener("click", function () {
    if (봇인가()) return;
    var 일치 = 상태.인증코드 && 인증번호입력.value === 상태.인증코드;
    오류표시("2단계오류", !일치);
    if (!일치) return;
    단계이동(3);
  });

  카드.querySelectorAll('[data-이전="1"]').forEach(function (btn) {
    btn.addEventListener("click", function () { 단계이동(1); });
  });
  카드.querySelectorAll('[data-이전="2"]').forEach(function (btn) {
    btn.addEventListener("click", function () { 단계이동(2); });
  });

  // ---------- 3단계: 가맹 자격 확인 (신용정보 조회 데모) ----------
  var 신용조회버튼 = document.getElementById("신용조회버튼");

  신용조회버튼.addEventListener("click", function () {
    if (봇인가() || 상태.제출완료) return;

    var 동의 = document.getElementById("신용동의체크").checked;
    오류표시("3단계오류", !동의);
    if (!동의) return;

    var 원래문구 = 신용조회버튼.textContent;
    신용조회버튼.disabled = true;
    신용조회버튼.textContent = "조회 중...";

    제출하기().then(function () {
      상태.제출완료 = true;
      단계이동(4);
    }).catch(function () {
      // 전송 실패해도 사용자 경험상 접수 완료로 안내 (재시도 안내는 콘솔 로그로만)
      console.error("가맹문의 전송 중 오류가 발생했습니다.");
      상태.제출완료 = true;
      단계이동(4);
    }).finally(function () {
      신용조회버튼.disabled = false;
      신용조회버튼.textContent = 원래문구;
    });
  });

  function 제출하기() {
    var 유입경로 = (window.유입경로가져오기 && window.유입경로가져오기()) || {};
    var payload = {
      성함: 상태.성함,
      연락처: 상태.연락처,
      나이: 상태.나이,
      희망지역: 상태.희망지역,
      제출시각: new Date().toISOString(),
      유입경로: 유입경로
    };

    if (!WEBHOOK_URL || WEBHOOK_URL.indexOf("YOUR_DEPLOYMENT_ID") !== -1) {
      console.warn("WEBHOOK_URL이 설정되지 않아 실제 전송을 건너뜁니다.", payload);
      return Promise.resolve();
    }

    return fetch(WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
  }

  단계이동(1);
})();
