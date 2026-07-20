/* 전 페이지 공통: 오른쪽 아래 카카오톡·전화 플로팅 버튼 */
(function () {
  if (document.getElementById('bg-fab')) return;
  var KAKAO = 'https://pf.kakao.com/_xhrfgb';
  var PHONE = '010-9942-9367';
  var wrap = document.createElement('div');
  wrap.id = 'bg-fab';
  wrap.innerHTML =
    '<a href="' + KAKAO + '" target="_blank" rel="noopener" class="bg-fab-btn bg-fab-kakao" aria-label="카카오톡 상담">' +
      '<span class="bg-fab-label">카카오톡 상담</span>' +
      '<img src="images/kakao.png" alt="" class="bg-fab-img" aria-hidden="true">' +
    '</a>' +
    '<a href="tel:' + PHONE + '" class="bg-fab-btn bg-fab-call" aria-label="전화 상담 ' + PHONE + '">' +
      '<span class="bg-fab-label">전화 상담</span>' +
      '<span class="material-symbols-outlined" aria-hidden="true">call</span>' +
    '</a>';
  document.body.appendChild(wrap);
})();
