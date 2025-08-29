// ==UserScript==
// @name         Disable Twitch Visability API
// @namespace    http://tampermonkey.net/
// @description  Disable Twitch Visability API
// @author       iumix
// @version      1.0.2
// @downloadURL  https://raw.githubusercontent.com/iumix/UserScripts/refs/heads/main/DisableTwitchVisabilityAPI.user.js
// @updateURL    https://raw.githubusercontent.com/iumix/UserScripts/refs/heads/main/DisableTwitchVisabilityAPI.user.js
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