// ==UserScript==
// @name         LIHKG Show Hidden Vote
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Intercept API response and process data
// @author       tsuna
// @match        https://lihkg.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const modifyFetchResponse = async (response) => {
        const clonedResponse = response.clone();
        const json = await clonedResponse.json();

        const traverseAndModify = (obj) => {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (key === 'display_vote') {
                        obj[key] = true;
                    } else if (typeof obj[key] === 'object') {
                        traverseAndModify(obj[key]);
                    }
                }
            }
        };

        traverseAndModify(json);

        const modifiedResponse = new Response(JSON.stringify(json), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });

        return modifiedResponse;
    };

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        const url = args[0];
        if (url.includes('/api_v2/thread/category')) {
            return modifyFetchResponse(response);
        }
        return response;
    };

    const traverseAndModify = (obj) => {
        for (const key in obj) {
            if (!obj.hasOwnProperty(key)) {
                break;
            }

            if (key === 'display_vote') {
                obj[key] = true;
            } else if (typeof obj[key] === 'object') {
                traverseAndModify(obj[key]);
            }

        }
    };

    const quoteRegex = /\/api_v2\/thread\/\d+\/[\w\d]+\/quotes\//;
    const originalXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
        this.addEventListener('readystatechange', function () {
            if (this.readyState !== 4) return;
            if (this.responseURL.includes('/api_v2/thread/category') || this.responseURL.includes('/api_v2/thread/latest') || quoteRegex.test(this.responseURL)) {
                const response = JSON.parse(this.responseText);
                traverseAndModify(response);
                Object.defineProperty(this, 'responseText', {
                    value: JSON.stringify(response)
                });
            }
        });

        this.addEventListener('load', function () {
            if (this.responseURL.includes('/api_v2/thread')) {
                const response = JSON.parse(this.responseText).response;
                if (response && response.item_data) {
                    response.item_data.forEach(item => {
                        const likeLabel = document.querySelector(`label[for='${item.post_id}-like-like']`);
                        const dislikeLabel = document.querySelector(`label[for='${item.post_id}-dislike-like']`);

                        if (likeLabel && dislikeLabel) {
                            if (likeLabel.style.display === "inline-block" && dislikeLabel.style.display === "inline-block") {
                                return;
                            }

                            likeLabel.style.display = "inline-block";
                            //likeLabel.style.color = "green";
                            dislikeLabel.style.display = "inline-block";
                            //dislikeLabel.style.color = "red";
                        }
                    });
                }
            }
        });
        originalXHR.apply(this, arguments);
    };
})();