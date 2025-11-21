// ==UserScript==
// @name         Copy to use Fixup X Links
// @namespace    http://tampermonkey.net/
// @version      1.3.0
// @description  Copy to use Fixup X Links
// @author       iumix
// @match        https://x.com/*
// @match        https://twitter.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x.com
// @downloadURL  https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/CopyToFixupX.user.js
// @updateURL    https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/CopyToFixupX.user.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

(() => {
    'use strict';

    const logPrefix = "[Copy to Fixup X]";
    const replaceHost = "https://fixupx.com/";
    const allowedHosts = ['x.com', 'twitter.com'];
    const hostsPattern = allowedHosts.map(h => h.replace(/\./g, '\\.')).join('|');
    const wholeMatch = new RegExp(`^(?:https?:\\/\\/)?(?:${hostsPattern})\\/.*`, 'i');

    function rewriteToFixup(text) {
        const input = String(text || '').trim();
        if (!input) return null;
        if (input.includes('fixupx.com')) return null;
        if (!wholeMatch.test(input)) return null;

        try {
            const src = new URL(input.startsWith('http') ? input : `https://${input}`);
            if (!allowedHosts.includes(src.hostname)) return null;

            const dst = new URL(replaceHost);
            dst.pathname = src.pathname;

            console.log(`${logPrefix} ${dst.href}`);
            return dst.href;
        } catch {
            return null;
        }
    }

    const orig = document.execCommand?.bind(document);
    if (!orig) {
        console.warn(`${logPrefix} document.execCommand not available`);
        return;
    }

    let installed = false;
    document.execCommand = function (commandId, showUI, value) {
        if (!installed) {
            installed = true;
            console.log(`${logPrefix} Hook installed`);
        }

        try {
            if (String(commandId).toLowerCase() === 'copy') {
                const selectedText = (window.getSelection && window.getSelection().toString()) || '';
                const rewritten = rewriteToFixup(selectedText);
                if (rewritten) {
                    const handler = (e) => {
                        try {
                            if (e && e.clipboardData) {
                                e.clipboardData.setData('text/plain', rewritten);
                                e.preventDefault();
                            }
                        } catch { /* ignore */ }
                    };
                    document.addEventListener('copy', handler, true);
                    try {
                        return orig('copy');
                    } finally {
                        document.removeEventListener('copy', handler, true);
                    }
                }
            }
        } catch { /* ignore */ }

        return orig(commandId, showUI, value);
    };

    console.log(`${logPrefix} Script loaded`);
})();
