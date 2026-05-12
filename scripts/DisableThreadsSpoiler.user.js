// ==UserScript==
// @name         Disable Threads Spoiler
// @namespace    http://tampermonkey.net/
// @description  Automatically removes common spoiler blur/overlay effects as the page updates.
// @author       iumix
// @version      1.2.0
// @downloadURL  https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/DisableThreadsSpoiler.user.js
// @updateURL    https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/DisableThreadsSpoiler.user.js
// @match        https://www.threads.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
    "use strict";

    function isSpoilerLabel(span) {
        return span.textContent?.trim().toLowerCase() === "spoiler";
    }

    function unblurTextSpoilers(root = document) {
        root.querySelectorAll?.("span").forEach((span) => {
            const parent = span.parentElement;
            if (parent && parent.tagName === "DIV") parent.style.opacity = "1";
        });
    }

    function findMediaRevealTrigger(labelSpan) {
        let current = labelSpan;
        for (let depth = 0; current && depth < 12; depth += 1) {
            if (
                current instanceof HTMLElement &&
                (current.tagName === "BUTTON" ||
                    current.getAttribute("role") === "button") &&
                current.querySelector("img, video, picture")
            ) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }

    function revealMediaSpoilersByClick(root = document) {
        const now = Date.now();
        root.querySelectorAll?.("span").forEach((span) => {
            if (!isSpoilerLabel(span)) return;

            const trigger = findMediaRevealTrigger(span);
            if (!trigger) return;

            const lastClickTs = Number(trigger.dataset.threadsUnspoilerLastClickTs || 0);
            if (now - lastClickTs < 1000) return;

            trigger.dataset.threadsUnspoilerLastClickTs = String(now);
            trigger.click();
        });
    }

    function processSpoilers(root = document) {
        try {
            unblurTextSpoilers(root);
            revealMediaSpoilersByClick(root);
        } catch (e) { }
    }

    let scheduled = false;
    function scheduleRun() {
        if (scheduled) return;
        scheduled = true;

        requestAnimationFrame(() => {
            scheduled = false;
            processSpoilers(document);
        });
    }

    processSpoilers(document);
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            () => processSpoilers(document),
            { once: true },
        );
    }

    if (document.readyState === "complete") {
        setTimeout(() => processSpoilers(document), 200);
    } else {
        window.addEventListener(
            "load",
            () => processSpoilers(document),
            { once: true },
        );
    }

    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (
                m.type === "childList" &&
                (m.addedNodes?.length || m.removedNodes?.length)
            ) {
                scheduleRun();
                break;
            }
            if (m.type === "attributes") {
                scheduleRun();
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
