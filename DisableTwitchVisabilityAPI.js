// ==UserScript==
// @name         Disable Twitch Visability API
// @namespace    http://tampermonkey.net/
// @description  Disable Twitch Visability API
// @author       Jacky
// @version      1.0.1
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