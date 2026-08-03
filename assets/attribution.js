/**
 * 유입 경로 기록.
 *
 * 네이버·당근 게시물의 링크에는 이미 ?utm_source=naver 같은 꼬리표가 달려 있는데,
 * 지금까지는 홈페이지에 도착하는 순간 그냥 사라졌다. 상담폼까지 끌고 가서
 * 접수 데이터에 실어야 "어느 게시물이 예약으로 이어졌는지"를 셀 수 있다.
 *
 * 상담폼의 '유입 경로' 선택칸(leadSource)은 고객이 직접 고르는 값이라
 * 안 고르면 비고 기억에 의존한다. 이건 고객이 아무것도 안 해도 남는다.
 * 둘 다 저장해서 서로 검증한다.
 */
(function () {
  'use strict';

  var KEY = 'bg_attribution';
  // 첫 방문 경로를 이 기간 동안 기억한다. 청소 예약은 보고 바로 하는 일이
  // 드물어서, 며칠 뒤에 다시 들어와 신청해도 출처가 남아야 한다.
  var MAX_AGE_DAYS = 30;

  var FIELDS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
  ];

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var saved = JSON.parse(raw);
      var age = Date.now() - (saved.savedAt || 0);
      if (age > MAX_AGE_DAYS * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(KEY);
        return null;
      }
      return saved;
    } catch (e) {
      return null;
    }
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      /* 사파리 프라이빗 모드 등. 기록을 못 해도 상담 접수 자체는 되어야 한다 */
    }
  }

  /** 검색·SNS에서 왔지만 꼬리표가 없을 때의 차선책 */
  function referrerSource(referrer) {
    if (!referrer) return '';
    try {
      var host = new URL(referrer).hostname;
      if (host.indexOf(location.hostname) !== -1) return '';
      if (/blog\.naver|naver\.com|naver\.me/.test(host)) return 'naver';
      if (/daangn|karrot/.test(host)) return 'daangn';
      if (/instagram/.test(host)) return 'instagram';
      if (/youtube|youtu\.be/.test(host)) return 'youtube';
      if (/google\./.test(host)) return 'google';
      if (/daum\.net|kakao/.test(host)) return 'daum';
      return host;
    } catch (e) {
      return '';
    }
  }

  function capture() {
    var params = new URLSearchParams(location.search);
    var incoming = {};
    var hasUtm = false;

    FIELDS.forEach(function (field) {
      var value = params.get(field);
      if (value) {
        incoming[field] = value.slice(0, 120);
        hasUtm = true;
      }
    });

    var existing = read();

    // 꼬리표를 달고 새로 들어왔으면 그걸 최우선으로 기록한다.
    if (hasUtm) {
      incoming.referrer = document.referrer ? document.referrer.slice(0, 300) : '';
      incoming.landingPage = location.pathname;
      incoming.savedAt = Date.now();
      // 처음 어떤 경로로 알게 됐는지는 덮어쓰지 않는다.
      incoming.firstSource =
        (existing && existing.firstSource) || incoming.utm_source || '';
      save(incoming);
      return;
    }

    // 꼬리표가 없고 기록도 없으면, 어디서 넘어왔는지라도 남긴다.
    if (!existing) {
      var guess = referrerSource(document.referrer);
      if (!guess) return;
      save({
        utm_source: guess,
        utm_medium: 'referral',
        referrer: document.referrer.slice(0, 300),
        landingPage: location.pathname,
        savedAt: Date.now(),
        firstSource: guess,
      });
    }
  }

  capture();

  // 상담폼이 제출할 때 읽어 간다.
  window.bgAttribution = function () {
    var saved = read();
    if (!saved) return null;
    return {
      source: saved.utm_source || '',
      medium: saved.utm_medium || '',
      campaign: saved.utm_campaign || '',
      // 어느 게시물이었는지. promoLink가 여기에 사례 slug를 넣는다.
      content: saved.utm_content || '',
      firstSource: saved.firstSource || '',
      landingPage: saved.landingPage || '',
      referrer: saved.referrer || '',
      capturedAt: saved.savedAt || null,
    };
  };
})();
