// ==UserScript==
// @name         Replace Flatnotes Logo with Home
// @namespace    https://flatnotes.iumix.me/*
// @version      1.0
// @description  Removes mb-2 from the nav and replaces the SVG logo with "Home"
// @include      /^https?:\/\/[^\/]*flatnotes[^\/]*\/.*$/
// @run-at       document-idle
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/MinifyFlatNotes.user.js
// @updateURL    https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/MinifyFlatNotes.user.js
// ==/UserScript==

(function () {
  "use strict";

  function updateNav() {
    const nav = document.querySelector("nav.mb-2");

    if (!nav) return;

    // Remove mb-2 class
    nav.classList.remove("mb-2");
    nav.classList.remove("md:mb-12");

    // Find the home link
    const homeLink = nav.querySelector('a[href="/"]');
    if (!homeLink) return;

    const logoContainer = homeLink.querySelector("div.flex.items-center");
    if (!logoContainer) return;

    // Replace SVG logo area with plain text
    logoContainer.innerHTML = "";

    const homeText = document.createElement("span");
    homeText.textContent = "Home";
    homeText.className = "text-theme-text-muted";

    logoContainer.appendChild(homeText);
  }

  updateNav();

  // Handles apps that re-render the nav dynamically
  const observer = new MutationObserver(updateNav);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();