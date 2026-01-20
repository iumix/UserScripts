// ==UserScript==
// @name         Force Twitter Image High Quality
// @namespace    http://tampermonkey.net/
// @description  Force Twitter to load images in the highest quality available
// @author       iumix
// @version      1.0.0
// @downloadURL  https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/ForceTwitterImageHighQuality.user.js
// @updateURL    https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/ForceTwitterImageHighQuality.user.js
// @match        https://pbs.twimg.com/media/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    const url = new URL(window.location.href);

    if (url.searchParams.get("name") !== "4096x4096") {
        url.searchParams.set("name", "4096x4096");
        window.location.replace(url.toString());
    }
})();
