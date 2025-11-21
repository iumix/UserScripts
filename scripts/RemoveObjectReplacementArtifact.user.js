// ==UserScript==
// @name         Remove Object Replacement Artifact
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Removes the Obj artifact on iPhone voice input
// @author       iumix
// @match        *://*/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/RemoveObjectReplacementArtifact.user.js
// @updateURL    https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/RemoveObjectReplacementArtifact.user.js
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const TARGET_CHAR_REGEX = /\uFFFC/g;

    function cleanNode(rootNode) {
        if (rootNode.nodeType === Node.TEXT_NODE) {
            handleTextNode(rootNode);
            return;
        }

        if (rootNode.nodeType === Node.ELEMENT_NODE) {
            const walker = document.createTreeWalker(
                rootNode,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            let currentNode = walker.nextNode();
            while (currentNode) {
                handleTextNode(currentNode);
                currentNode = walker.nextNode();
            }
        }
    }

    function handleTextNode(textNode) {
        if (textNode.nodeValue && textNode.nodeValue.includes('\uFFFC')) {
            textNode.nodeValue = textNode.nodeValue.replace(TARGET_CHAR_REGEX, '');
        }
    }

    cleanNode(document.body);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    // Only process element and text nodes
                    if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
                        cleanNode(node);
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();