// ==UserScript==
// @name         Download Files as ZIP from Directory Listing
// @author       iumix
// @namespace    http://tampermonkey.net/
// @version      1.1.3
// @description  Download all files from a directory listing as a ZIP archive, recursively or just the visible files (no subfolders).
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @connect      *
// @require      https://cdn.jsdelivr.net/npm/@zip.js/zip.js/dist/zip.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// @downloadURL  https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/DownloadDirectoryListing.user.js
// @updateURL    https://raw.githubusercontent.com/iumix/UserScripts/main/scripts/DownloadDirectoryListing.user.js
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';
    const blacklist = ["thumbs.db", ".ds_store", "http-server"];
    const downloadTimeLabel = 'Time taken to download';

    // Sleep time in seconds
    const sleepTime = 2;
    // Sleep interval in number of files
    const sleepInterval = 20;

    function isBlacklisted(fileUrl) {
        return (blacklist.some(b => fileUrl.toLowerCase().includes(b)));
    }

    function isValidLink(href) {
        if (!href) return false;
        if (href.startsWith('?')) return false;
        if (href.startsWith('#')) return false;
        if (href.startsWith('javascript:')) return false;
        if (href.startsWith('mailto:')) return false;
        return !href.startsWith('tel:');
    }

    function isDirectoryLink(href) {
        return href.endsWith('/');
    }

    async function isDirectoryIndex(url) {
        try {
            const response = await fetch(url, { method: 'GET' });

            if (!response.ok) {
                console.error(`HTTP error: ${response.status}`);
                return false;
            }

            const html = await response.text();

            const isApacheIndex = html.includes("Index of /");
            const hasFileLinks = /<a href="[^"]+">[^<]+<\/a>/g.test(html);
            const hasDirectoryStructure = /Name<\/th>.*Last modified<\/th>.*Size<\/th>/s.test(html); // Apache table

            return isApacheIndex || (hasFileLinks && hasDirectoryStructure);
        } catch (error) {
            console.error("Error while checking for directory index:", error);
            return false;
        }
    }

    async function getAllFileLinksRecursively(currentUrl, basePath, visited = new Set()) {
        const results = [];

        if (visited.has(currentUrl)) {
            return results;
        }
        visited.add(currentUrl);

        try {
            const resp = await new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: currentUrl,
                    onload: resolve,
                    onerror: reject
                });
            });

            if (resp.status !== 200) {
                console.error(`Failed to fetch ${currentUrl}, status: ${resp.status}`);
                return results;
            }

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = resp.responseText;
            const linkElements = tempDiv.querySelectorAll('a[href]');

            for (const linkEl of linkElements) {
                const href = linkEl.getAttribute('href');
                if (!isValidLink(href)) continue;

                const absoluteUrl = new URL(href, currentUrl).href;
                const absoluteUrlObj = new URL(absoluteUrl);

                if (!absoluteUrlObj.pathname.startsWith(basePath)) {
                    continue;
                }

                if (isDirectoryLink(href)) {

                    const subResults = await getAllFileLinksRecursively(absoluteUrl, basePath, visited);
                    results.push(...subResults);
                } else {

                    const fullPath = absoluteUrlObj.pathname;
                    const decodedFullPath = decodeURIComponent(fullPath);
                    const decodedBasePath = decodeURIComponent(basePath);
                    let relativePath = decodedFullPath.slice(decodedBasePath.length);
                    relativePath = relativePath.replace(/\s+/g, '_');

                    console.log('Found file:', absoluteUrl, '=>', relativePath);
                    results.push({
                        url: absoluteUrl,
                        relativePath
                    });
                }
            }
        } catch (err) {
            console.error(`Error scanning ${currentUrl}:`, err);
        }
        return results;
    }

    function fetchFileAsBlob(fileUrl) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: fileUrl,
                responseType: 'blob',
                onload: (res) => {
                    if (res.status === 200) {
                        resolve(res.response);
                    } else {
                        reject(new Error(`Failed to fetch ${fileUrl} (status: ${res.status})`));
                    }
                },
                onerror: (err) => reject(err)
            });
        });
    }

    async function downloadFilesAsZip(fileEntries) {
        if (!fileEntries || fileEntries.length === 0) {
            alert('No files found to download!');
            return;
        }

        console.log('Preparing to zip files with structure:', fileEntries);
        console.log('Current Settings:', { blacklist: blacklist, sleep: { time: sleepTime, interval: sleepInterval } });

        try {
            const writer = new zip.ZipWriter(new zip.BlobWriter("application/zip"));
            console.log('Creating ZIP...');

            let successCount = 0;
            let failCount = 0;
            let skipList = [];

            for (const entry of fileEntries) {
                if (successCount % sleepInterval === 0 && successCount > 0) {
                    console.log(`Sleeping for ${sleepTime} seconds to avoid rate limiting...`);
                    await new Promise(resolve => setTimeout(resolve, sleepTime * 1000));
                }

                try {
                    if (isBlacklisted(entry.url)) {
                        console.warn(`Skipping blacklisted file: ${entry.url} matched with ${entry.url.split('/').pop().toLowerCase()} in blacklist`);
                        skipList.push(entry.url.split('/').pop());
                        continue;
                    }

                    console.log(`Fetching: ${new URL(entry.url).pathname}`);
                    const blob = await fetchFileAsBlob(entry.url);

                    await writer.add(entry.relativePath, new zip.BlobReader(blob));
                    successCount++;
                    // console.log(`Added to ZIP: ${entry.relativePath}`);
                } catch (e) {
                    if (e.message.includes('blacklisted')) {
                        skipList.push(entry.url.split('/').pop());
                        continue;
                    }
                    console.error(`Failed to process ${entry.url}:`, e);
                    failCount++;
                }
            }

            console.log('Closing ZIP...');
            const zipBlob = await writer.close();

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const zipFileName = `downloads-${timestamp}.zip`;

            console.log(`Downloading ZIP as: ${zipFileName}`);
            saveAs(zipBlob, zipFileName);

            const msg = `Download finished!\nSuccess: ${successCount}\nSkipped: ${skipList.length} ${skipList.length > 0 ? `[${skipList.join(', ')}]` : ""}\nFailed: ${failCount}`;
            console.timeEnd(downloadTimeLabel);
            console.log(msg);
        } catch (err) {
            console.error('Error while creating ZIP:', err);
            alert(`Error creating ZIP: ${err.message}`);
        }
    }

    GM_registerMenuCommand('Download All Visible Files as ZIP', async () => {
        const isIndex = await isDirectoryIndex(window.location.href);
        if (!isIndex) {
            alert('This page does not seem to be a directory index!');
            return;
        }

        console.time(downloadTimeLabel);

        const currentLinks = [];
        document.querySelectorAll('a[href]').forEach(linkEl => {
            const href = linkEl.getAttribute('href');
            if (!isValidLink(href)) return;
            if (isDirectoryLink(href)) return;

            const absoluteUrl = new URL(href, window.location.href).href;

            let fileName = decodeURIComponent(absoluteUrl.split('/').pop());
            fileName = fileName.replace(/\s+/g, '_');

            currentLinks.push({
                url: absoluteUrl,
                relativePath: fileName
            });
        });

        if (currentLinks.length === 0) {
            alert('No files found in the current directory listing!');
            return;
        }

        await downloadFilesAsZip(currentLinks);
    });

    GM_registerMenuCommand('Download All Files Recursively as ZIP', async () => {
        const isIndex = await isDirectoryIndex(window.location.href);
        if (!isIndex) {
            alert('This page does not seem to be a directory index!');
            return;
        }

        console.time(downloadTimeLabel);

        let baseUrl = window.location.href;
        if (!baseUrl.endsWith('/')) {
            baseUrl += '/';
        }
        const urlObj = new URL(baseUrl);
        const basePath = urlObj.pathname;

        const allFileEntries = await getAllFileLinksRecursively(baseUrl, basePath);

        const immediateFiles = [];
        document.querySelectorAll('a[href]').forEach(linkEl => {
            const href = linkEl.getAttribute('href');
            if (!isValidLink(href)) return;
            if (href.endsWith('/')) return;

            const absoluteUrl = new URL(href, baseUrl).href;
            const absPath = new URL(absoluteUrl).pathname;

            if (absPath.startsWith(basePath)) {
                const decodedAbsPath = decodeURIComponent(absPath);
                const decodedBasePath = decodeURIComponent(basePath);
                let relPath = decodedAbsPath.slice(decodedBasePath.length);
                relPath = relPath.replace(/\s+/g, '_');

                if (!allFileEntries.some(e => e.url === absoluteUrl)) {
                    immediateFiles.push({ url: absoluteUrl, relativePath: relPath });
                }
            }
        });

        const allUnique = [...allFileEntries, ...immediateFiles];

        if (allUnique.length === 0) {
            alert('No files found to download (recursively)!');
            return;
        }

        await downloadFilesAsZip(allUnique);
    });

})();