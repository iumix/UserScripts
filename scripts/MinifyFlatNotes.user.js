// ==UserScript==
// @name         Minify FlatNotes
// @namespace    https://flatnotes.iumix.me/*
// @version      1.2.0
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

    // Add logout button to the existing right-side nav container
    const buttonsContainer = nav.querySelector("div.flex.grow.items-start.justify-end");
    if (buttonsContainer && !buttonsContainer.querySelector('a[href="/cdn-cgi/access/logout"]')) {
      const logoutHtml = `<a href="/cdn-cgi/access/logout" class=""><button class="text-nowrap rounded px-2 py-1 bg-theme-background text-theme-text-muted hover:bg-theme-background-elevated ml-1"><div class="flex items-center"><svg data-v-e89afe9b="" width="1.25em" height="1.25em" viewBox="0 0 24 24" class="mr-1" style="--sx: 1; --sy: 1; --r: 0deg;"><path data-v-e89afe9b="" d="M16,17V14H9V10H16V7L21,12L16,17M4,3H12A1,1 0 0,1 13,4V8H11V5H5V19H11V16H13V20A1,1 0 0,1 12,21H4A1,1 0 0,1 3,20V4A1,1 0 0,1 4,3Z"></path></svg><span>Logout</span></div></button></a>`;
      const template = document.createElement("template");
      template.innerHTML = logoutHtml.trim();
      buttonsContainer.appendChild(template.content.firstChild);
    }

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
