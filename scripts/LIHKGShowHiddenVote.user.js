// ==UserScript==
// @name         LIHKG Show Hidden Vote
// @namespace    http://tampermonkey.net/
// @version      2.1.0
// @description  Intercept API response and process data
// @author       iumix
// @match        https://lihkg.com/*
// @match        https://*.lihkg.com/*
// @downloadURL  https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/LIHKGShowHiddenVote.user.js
// @updateURL    https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/LIHKGShowHiddenVote.user.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    console.log('[LIHKG Show Hidden Vote] Script loaded');

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        this._url = url;
        return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
        if (!this._headers) {
            this._headers = {};
        }

        this._headers[header] = value;

        return originalSetRequestHeader.apply(this, arguments);
    };

    const matchTargetApi = (url) => {
        const rules = [
            /\/api_v2\/thread\/\d+(\/?$|\/page\/\d+)/,
            /\/api_v2\/thread\/category\?cat_id=\d+/,
            /\/api_v2\/thread\/latest\?cat_id=\d+/,
            /\/api_v2\/thread\/\d+\/[a-fA-F0-9]+\/quotes\/page\/\d+/
        ]

        return rules.some(rule => rule.test(url));
    }

    XMLHttpRequest.prototype.send = function (data) {
        const url = this._url;

        if (!matchTargetApi(url)) {
            return originalSend.apply(this, arguments);
        }

        console.log('[LIHKG Show Hidden Vote] Intercepting API call:', url);

        const originalOnReadyStateChange = this.onreadystatechange;

        this.onreadystatechange = function () {
            if (this.readyState === 4) {
                try {
                    if (this.status >= 200 && this.status < 300) {
                        const data = JSON.parse(this.responseText);

                        processResponseData(data);

                        const modifiedResponseText = JSON.stringify(data);

                        Object.defineProperty(this, 'responseText', {
                            get: function () {
                                return modifiedResponseText;
                            }
                        });

                        Object.defineProperty(this, 'response', {
                            get: function () {
                                return modifiedResponseText;
                            }
                        });
                    }
                } catch (error) {
                    console.error('[LIHKG Show Hidden Vote] Error processing response:', error);
                }
            }

            if (originalOnReadyStateChange) {
                originalOnReadyStateChange.apply(this, arguments);
            }
        };

        return originalSend.apply(this, arguments);
    };

    function processResponseData(root, keyName = 'display_vote') {
        const stack = [root];

        while (stack.length > 0) {
            const node = stack.pop();
            if (!node || typeof node !== 'object') continue;

            if (Array.isArray(node)) {
                for (let i = 0; i < node.length; i++) {
                    if (node[i] && typeof node[i] === 'object') {
                        stack.push(node[i]);
                    }
                }
            } else {
                for (const key in node) {
                    if (key === keyName && node[key] === false) {
                        node[key] = true;
                        console.log('[LIHKG Show Hidden Vote] Modified', keyName, 'to true');
                    }

                    if (node[key] !== null && typeof node[key] === 'object') {
                        stack.push(node[key]);
                    }
                }
            }
        }

        return root;
    }
})();