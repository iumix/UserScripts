// ==UserScript==
// @name         Disable Threads Spoiler
// @namespace    http://tampermonkey.net/
// @description  Automatically removes common spoiler blur/overlay effects as the page updates.
// @author       iumix
// @version      1.0.1
// @downloadURL  https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/DisableThreadsSpoiler.user.js
// @updateURL    https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/DisableThreadsSpoiler.user.js
// @match        https://www.threads.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
    "use strict";

    function unblurSpoilers(root = document) {
        try {
            root.querySelectorAll?.("span").forEach((s) => {
                const p = s.parentElement;
                if (p && p.tagName === "DIV") p.style.opacity = "1";
            });

            root.querySelectorAll?.("img").forEach((img) => {
                const hasFilter =
                    img.style.filter ||
                    img.style.webkitFilter ||
                    getComputedStyle(img).filter !== "none";

                if (hasFilter) {
                    img.style.webkitFilter = "none";
                    img.style.filter = "none";
                    img.style.transform = "none";
                    img.style.border = "3px solid #FFFF00";
                }
            });

            root.querySelectorAll?.("div > picture").forEach((pic) => {
                const div = pic.parentElement;
                const span = div?.querySelector("span");
                if (span) span.remove();
            });
        } catch (e) { }
    }

    let scheduled = false;
    function scheduleRun(targetNode) {
        if (scheduled) return;
        scheduled = true;

        requestAnimationFrame(() => {
            scheduled = false;
            unblurSpoilers(document);
        });
    }

    unblurSpoilers(document);
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            () => unblurSpoilers(document),
            { once: true },
        );
    }

    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (
                m.type === "childList" &&
                (m.addedNodes?.length || m.removedNodes?.length)
            ) {
                scheduleRun(m.target);
                break;
            }
            if (m.type === "attributes") {
                scheduleRun(m.target);
                break;
            }
        }
    });

    observer.observe(document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["class", "style"],
    });
})();
