// ==UserScript==
// @name         Disable Twitch Visability API
// @namespace    http://tampermonkey.net/
// @version      2024-10-29
// @description  Disable Twitch Visability API
// @author       Jacky
// @downloadURL  https://raw.githubusercontent.com/iumix/UserScripts/refs/heads/main/DisableTwitchVisabilityAPI.js
// @updateURL    https://raw.githubusercontent.com/iumix/UserScripts/refs/heads/main/DisableTwitchVisabilityAPI.js
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    document.addEventListener('visibilitychange', function (e) {
        e.stopImmediatePropagation();
    }, true);

    Object.defineProperty(document, 'visibilityState', {
        get: function () {
            return "visible";
        }
    });
})();