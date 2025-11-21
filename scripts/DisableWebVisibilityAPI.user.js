// ==UserScript==
// @name         Disable Web Visibility API
// @namespace    http://tampermonkey.net/
// @description  Disable Web Visibility API
// @author       iumix
// @version      1.1.0
// @downloadURL  https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/DisableWebVisibilityAPI.user.js
// @updateURL    https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/DisableWebVisibilityAPI.user.js
// @match        https://www.twitch.tv/*
// @run-at       document-start
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

    Object.defineProperty(document, 'hidden', {
        get: function () {
            return false;
        }
    });

    document.hasFocus = function () {
        return true;
    };
    window.hasFocus = function () {
        return true;
    };

    window.addEventListener('blur', function (e) {
        e.stopImmediatePropagation();
    }, true);

    window.addEventListener('focus', function (e) {
        e.stopImmediatePropagation();
    }, true);

})();
