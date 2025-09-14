// ==UserScript==
// @name         Copy to use Fixup X Links
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @description  Copy to use Fixup X Links
// @author       iumix
// @match        https://x.com/*
// @match        https://twitter.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x.com
// @downloadURL  https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/CopyToFixupX.user.js
// @updateURL    https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/CopyToFixupX.user.js
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';

    const replaceHost = "https://fixupx.com/";
    const allowedHosts = ['x.com', 'twitter.com'];
    const logPrefix = "[Copy to Fixup X]";

    let prevClipText = '';

    const _hostsPattern = allowedHosts.map(h => h.replace(/\./g, '\\.')).join('|');
    const _writeTextMatch = new RegExp(`^(?:https?:\\/\\/)?(?:${_hostsPattern})\\/.*`, 'i');

    // Actual rewrite function
    function rewriteToFixup(text) {
        const input = String(text || '').trim();
        if (!input) return null;
        if (input.includes('fixupx.com')) return null;
        if (!_writeTextMatch.test(input)) return null;
        const src = new URL(input.startsWith('http') ? input : `https://${input}`);
        const dst = new URL(replaceHost);
        dst.pathname = src.pathname;
        dst.search = src.search;
        dst.hash = src.hash;
        return dst.href;
    }

    // Checking function
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
            return false;
        }

        if (!allowedHosts.includes(location.hostname)) {
            console.error(`${logPrefix} Hostname is not allowed`);
            return false;
        }

        if (!navigator.clipboard.writeText) {
            console.error(`${logPrefix} Clipboard write text not available`);
            return false;
        }

        if (navigator.permissions) {
            try {
                const { state } = await navigator.permissions.query({ name: 'clipboard-write' });
                if (state === 'denied') {
                    console.error(`${logPrefix} Clipboard write permission denied`);
                    return false;
                }
            } catch (_) {
                /* Permission API not supported – continue without explicit permission check */
            }
        }

        return true;
    }

    // Main logic
    const logic = (event) => {
        const clipText = (window.getSelection && window.getSelection().toString()) || '';
        const rewritten = rewriteToFixup(clipText);
        if (clipText !== prevClipText) {
            prevClipText = clipText;
            if (rewritten) {
                if (event && event.clipboardData) {
                    try {
                        event.clipboardData.setData('text/plain', rewritten);
                        event.preventDefault();
                        console.log(`${logPrefix} Copied to clipboard: ${rewritten}`);
                    } catch (_) { /* ignore */ }
                } else if (navigator.clipboard && navigator.clipboard.writeText) {
                    try {
                        navigator.clipboard.writeText(rewritten).then(() => {
                            console.log(`${logPrefix} Copied to clipboard: ${rewritten}`);
                        });
                    } catch (_) { /* ignore */ }
                }
            }
        }
    }

    // Check if the script can run
    if (!(await checkRunnable())) {
        console.log(`${logPrefix} Unable to activate script`);
        return;
    } else {
        console.log(`${logPrefix} Script loaded`);
    }


    // Rewrite the clipboard text to fixupx.com
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        const originalWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);
        navigator.clipboard.writeText = async function (text) {
            try {
                const rewritten = rewriteToFixup(text);
                return await originalWriteText(rewritten ?? text);
            } catch (_) {
                return originalWriteText(text);
            }
        };
    }

    // Override execCommand('copy') to rewrite the clipboard text
    if (typeof document.execCommand === 'function') {
        const originalExecCommand = document.execCommand.bind(document);
        document.execCommand = function (commandId, showUI, value) {
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
                            } catch (_) { /* ignore */ }
                        };
                        document.addEventListener('copy', handler, true);
                        try {
                            return originalExecCommand('copy');
                        } finally {
                            document.removeEventListener('copy', handler, true);
                        }
                    }
                }
            } catch (_) { /* ignore */ }
            return originalExecCommand(commandId, showUI, value);
        };
    }

    document.addEventListener('DOMContentLoaded', event => logic(event));
    document.addEventListener('copy', event => logic(event));
    document.addEventListener('focus', event => logic(event));
})();
