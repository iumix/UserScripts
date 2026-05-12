// ==UserScript==
// @name         Replace Flatnotes Logo with Home
// @namespace    https://flatnotes.iumix.me/*
// @version      1.1.0
// @description  Removes unecessary logo and margins
// @include      *flatnotes*
// @run-at       document-idle
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/MinifyFlatNotes.user.js
// @updateURL    https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/MinifyFlatNotes.user.js
// ==/UserScript==

(function () {
  "use strict";

  let updateQueued = false;

  function updateNav() {
    updateQueued = false;

    const nav = document.querySelector("nav");

    if (!nav) return;

    // Remove mb-2 class
    nav.classList.remove("mb-2");
    nav.classList.remove("md:mb-12");

    // Find the home link
    const homeLink = nav.querySelector('a[href="/"]');
    if (!homeLink) return;

    const logoContainer = homeLink.querySelector("div.flex.items-center");
    if (!logoContainer) return;

    if (logoContainer.textContent.trim() === "Home" && !logoContainer.querySelector("svg")) {
      return;
    }

    // Replace SVG logo area with plain text
    logoContainer.innerHTML = "";

    const homeText = document.createElement("span");
    homeText.textContent = "Home";
    homeText.className = "text-theme-text-muted";

    logoContainer.appendChild(homeText);
  }

  function queueUpdateNav() {
    if (updateQueued) return;

    updateQueued = true;
    requestAnimationFrame(updateNav);
  }

  updateNav();

  // Handles apps that re-render the nav dynamically
  const observer = new MutationObserver(queueUpdateNav);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    const result = originalPushState.apply(this, args);
    queueUpdateNav();
    return result;
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args);
    queueUpdateNav();
    return result;
  };

  window.addEventListener("popstate", queueUpdateNav);
  window.addEventListener("pageshow", queueUpdateNav);
})();
