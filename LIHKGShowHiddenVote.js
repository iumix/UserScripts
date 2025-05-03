// ==UserScript==
// @name         LIHKG Show Hidden Vote
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Intercept API response and process data
// @author       Jacky
// @match        https://lihkg.com/*
// @match        https://*.lihkg.com/*
// @downloadURL  https://raw.githubusercontent.com/iumix/UserScripts/refs/heads/main/LIHKGShowHiddenVote.js
// @updateURL    https://raw.githubusercontent.com/iumix/UserScripts/refs/heads/main/LIHKGShowHiddenVote.js
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

    XMLHttpRequest.prototype.send = function (data) {
        const url = this._url;

        const isThreadApi = /\/api_v2\/thread\/\d+(\/?$|\/page\/\d+)/.test(url);
        const isCategoryApi = /\/api_v2\/thread\/category\?cat_id=\d+/.test(url);
        const isQuotesApi = /\/api_v2\/thread\/\d+\/[a-f0-9]+\/quotes\/page\/\d+/.test(url);

        if (!isThreadApi && !isCategoryApi && !isQuotesApi) {
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

    function processResponseData(data) {

        if (!data || typeof data !== 'object') {
            return;
        }

        if (Array.isArray(data)) {
            data.forEach(item => processResponseData(item));
            return;
        }

        if ('display_vote' in data) {
            data.display_vote = true;
            console.log('[LIHKG Show Hidden Vote] Modified display_vote to true');
        }

        for (const key in data) {
            if (data.hasOwnProperty(key) && typeof data[key] === 'object' && data[key] !== null) {
                processResponseData(data[key]);
            }
        }
    }
})();