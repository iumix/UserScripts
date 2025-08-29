// ==UserScript==
// @name         Copy to use Fixup X Links
// @namespace    http://tampermonkey.net/
// @version      1.1.2
// @description  Copy to use Fixup X Links
// @author       iumix
// @match        https://x.com/*
// @match        https://twitter.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x.com
// @downloadURL  https://raw.githubusercontent.com/iumix/UserScripts/refs/heads/main/CopyToFixupX.user.js
// @updateURL    https://raw.githubusercontent.com/iumix/UserScripts/refs/heads/main/CopyToFixupX.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const replaceHost = "https://fixupx.com/";
    const allowedHosts = ['x.com', 'twitter.com'];
    const regex = new RegExp(`https://(${allowedHosts.join('|')})/.*`);
    const logPrefix = "[Copy to Fixup X]";

    let prevClipText = '';

    async function checkRunnable() {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
            console.error(`${logPrefix} Active element is an input or textarea`);
            return false;
        }

        if (document.activeElement.isContentEditable) {
            console.error(`${logPrefix} Active element is content editable`);
            return false;
        }

        if (!document.hasFocus()) {
            console.error(`${logPrefix} Document is not focused`);
            return false;
        }

        if (!navigator.clipboard) {
            console.error(`${logPrefix} Clipboard API not available`);
            return false;
        }

        if (window.top !== window) {
            console.error(`${logPrefix} Window is not the top window`);
            return false;
        }

        if (document.visibilityState !== 'visible') {
            console.error(`${logPrefix} Document is not visible`);
            return false
        };

        if (!allowedHosts.includes(location.hostname)) {
            console.error(`${logPrefix} Hostname is not allowed`);
            return false
        };

        if (!navigator.clipboard.writeText) {
            console.error(`${logPrefix} Clipboard write text not available`);
            return false;
        };

        if (navigator.permissions) {
            try {
                const { state } = await navigator.permissions.query({ name: 'clipboard-write' });
                if (state === 'denied') {
                    console.error(`${logPrefix} Clipboard write permission denied`);
                    return false;
                }
            } catch (_) {
                /* permission API not supported – ignore */
                console.error(`${logPrefix} Permission API not supported`);
                return false;
            }
        }

        return true;
    }

    if (!checkRunnable()) {
        console.log(`${logPrefix} Unable to activate script`);
        return;
    } else {
        console.log(`${logPrefix} Script loaded`);
    }

    document.addEventListener('copy', () => {
        const clipText = window.getSelection().toString();
        if (clipText !== prevClipText) {
            prevClipText = clipText;
            if (regex.test(clipText) && !clipText.includes('fixupx.com')) {
                event.preventDefault();
                let url = new URL(clipText);
                let newUrl = new URL(replaceHost);
                newUrl.pathname = url.pathname;
                newUrl.search = url.search;
                newUrl.hash = url.hash;
                navigator.clipboard.writeText(newUrl.href).then(() => {
                    console.log(`${logPrefix} Copied to clipboard: ${newUrl.href}`);
                });
            }
        }
    });
})();
