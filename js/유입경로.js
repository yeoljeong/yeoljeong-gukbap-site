// 유입경로(UTM/리퍼러) 최초 1회 저장 — 가맹문의 제출 시 문의폼.js에서 함께 전송
(function () {
  var KEY = "열정국밥_유입경로";

  function 저장된값() {
    try {
      var raw = sessionStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function 수집() {
    var params = new URLSearchParams(location.search);
    var 정보 = {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      referrer: document.referrer || "",
      landing_page: location.href,
      첫방문시각: new Date().toISOString()
    };
    try {
      sessionStorage.setItem(KEY, JSON.stringify(정보));
    } catch (e) { /* 저장 실패 시 무시 */ }
    return 정보;
  }

  window.유입경로가져오기 = function () {
    return 저장된값() || 수집();
  };

  // 최초 진입 시 바로 1회 기록
  if (!저장된값()) 수집();
})();
