// ==UserScript==
// @name         Copy to use Fixup X Links
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to take over the world!
// @author       Jacky
// @match        https://x.com/*
// @match        https://twitter.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x.com
// @downloadURL  https://raw.githubusercontent.com/iumix/UserScripts/refs/heads/main/CopyToFixupX.js
// @updateURL    https://raw.githubusercontent.com/iumix/UserScripts/refs/heads/main/CopyToFixupX.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    console.log('[Copy to Fixup X] Script loaded');

    const allowedHosts = ['x.com', 'twitter.com'];
    const regex = new RegExp(`https://(${allowedHosts.join('|')})/.*`);

    let prevClipText = '';

    function checkRunnable() {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
            return false;
        }

        if (document.activeElement.isContentEditable) {
            return false;
        }

        if (!document.hasFocus()) {
            return false;
        }

        if (!navigator.clipboard) {
            console.error('Clipboard API not available');
            return false;
        }

        return true;
    }

    if (!checkRunnable()) {
        return;
    }

    document.addEventListener('copy', () => {
        const clipText = window.getSelection().toString();
        if (clipText !== prevClipText) {
            prevClipText = clipText;
            if (regex.test(clipText) && !clipText.includes('fixupx.com')) {
                let url = new URL(clipText);
                let newUrl = new URL('https://fixupx.com/');
                newUrl.pathname = url.pathname;
                newUrl.search = url.search;
                newUrl.hash = url.hash;
                navigator.clipboard.writeText(newUrl.href).then(() => {
                    console.log('[Copy to Fixup X] Copied to clipboard:', newUrl.href);
                });
            }
        }
    });
})();