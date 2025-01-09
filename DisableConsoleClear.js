// ==UserScript==
// @name         Disable Console Clear
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Jacky
// @author       You
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=lihkg.com
// @downloadURL  https://raw.githubusercontent.com/iumix/UserScripts/refs/heads/main/DisableConsoleClear.js
// @updateURL    https://raw.githubusercontent.com/iumix/UserScripts/refs/heads/main/DisableConsoleClear.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const orgClear = console.clear;
    console.clear = () => {
        console.log('[Disable Console Clear] Clearing console is disabled, call `restoreConsoleClear()` to restore');
    }

    window.restoreConsoleClear = () => {
        console.clear = orgClear;
    }
})();