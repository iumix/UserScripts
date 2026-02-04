// ==UserScript==
// @name         Open Shorts in Full Player
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  Adds a button to open YouTube Shorts in the full video player
// @author       iumix
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @downloadURL  https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/OpenShortsInFullPlayer.user.js
// @updateURL    https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/OpenShortsInFullPlayer.user.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function createButton() {
    const host = document.createElement('button-view-model');
    host.className = 'ytSpecButtonViewModelHost';

    host.innerHTML = `
<label class="yt-spec-button-shape-with-label">
  <button
    class="yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-l yt-spec-button-shape-next--icon-button"
    aria-label="Open"
    type="button">
    <div class="yt-spec-button-shape-next__icon">
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M14 3l7 7-7 7v-4H3v-6h11V3z"></path>
      </svg>
    </div>
    <yt-touch-feedback-shape class="yt-spec-touch-feedback-shape">
      <div class="yt-spec-touch-feedback-shape__stroke"></div>
      <div class="yt-spec-touch-feedback-shape__fill"></div>
    </yt-touch-feedback-shape>
  </button>
  <div class="yt-spec-button-shape-with-label__label">
    <span>Open</span>
  </div>
</label>
        `;

    host.querySelector('button').addEventListener('click', () => {
      const id = location.pathname.split('/').pop();
      window.open(`https://www.youtube.com/watch?v=${id}`, '_blank');
    });

    return host;
  }

  const observer = new MutationObserver(() => {
    if (!location.pathname.startsWith('/shorts/')) return;

    const actionBar = document.querySelector('.ytwReelActionBarViewModelHost');
    if (!actionBar || actionBar.querySelector('.tm-open-btn')) return;

    const btn = createButton();
    btn.classList.add('tm-open-btn');
    actionBar.appendChild(btn);
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
})();