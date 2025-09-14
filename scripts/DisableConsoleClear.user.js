// ==UserScript==
// @name         Disable Console Clear
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  Disable Console Clear
// @author       iumix
// @match        *://*/*
// @downloadURL  https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/DisableConsoleClear.user.js
// @updateURL    https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/DisableConsoleClear.user.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const originalClear = console.clear;
    console.clear = () => {
        console.log('[Disable Console Clear] Clearing console is disabled, call `restoreConsoleClear()` to restore');
    }

    window.restoreConsoleClear = () => {
        console.clear = originalClear;
    }
})();