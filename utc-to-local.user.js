// ==UserScript==
// @name         Universal UTC → Local Time Converter
// @namespace    https://github.com/sharifmdathar/utc-to-local
// @version      1.4.0
// @description  Converts UTC/ISO date strings on any page to a chosen timezone and format (12h/24h, seconds, zone name).
// @author       sharifmdathar
// @license      MIT
// @homepageURL  https://github.com/sharifmdathar/utc-to-local
// @supportURL   https://github.com/sharifmdathar/utc-to-local/issues
// @updateURL    https://raw.githubusercontent.com/sharifmdathar/utc-to-local/main/utc-to-local.user.js
// @downloadURL  https://raw.githubusercontent.com/sharifmdathar/utc-to-local/main/utc-to-local.user.js
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // ---------- DEFAULTS ----------
    const DEFAULTS = {
        timeZone: '',
        hour12: true,
        showSeconds: true,
        showZoneName: true,
    };
    const SETTINGS = { ...DEFAULTS };
    for (const k of Object.keys(DEFAULTS)) SETTINGS[k] = GM_getValue(k, DEFAULTS[k]);

    // ---------- FORMATTER ----------
    function formatDate(d) {
        const opts = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: SETTINGS.hour12,
        };
        if (SETTINGS.showSeconds)  opts.second = '2-digit';
        if (SETTINGS.showZoneName) opts.timeZoneName = 'short';
        if (SETTINGS.timeZone)     opts.timeZone = SETTINGS.timeZone;

        try {
            return d.toLocaleString(undefined, opts);
        } catch {
            delete opts.timeZone;
            return d.toLocaleString(undefined, opts);
        }
    }

    // ---------- conversion core ----------
    const dateRegex =
        /\b\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z| UTC|[+-]\d{2}:?\d{2})\b/gi;
    const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'NOSCRIPT', 'CODE', 'PRE']);
    const skip = (node) => {
        const el = node.parentElement;
        return el && (SKIP.has(el.tagName) || el.isContentEditable);
    };

    // Keep ORIGINAL text so we can re-render on settings change
    const originals = new Map();

    function replaceInText(text) {
        return text.replace(dateRegex, (match) => {
            const normalized = match.trim().replace(/ UTC$/i, 'Z').replace(' ', 'T');
            const d = new Date(normalized);
            return isNaN(d) ? match : formatDate(d);
        });
    }

    function convert(root) {
        if (!root) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
        const targets = [];
        let node;
        while ((node = walker.nextNode())) {
            if (skip(node)) continue;
            if (originals.has(node)) continue;
            dateRegex.lastIndex = 0;
            if (dateRegex.test(node.nodeValue)) targets.push(node);
        }
        for (const tn of targets) {
            originals.set(tn, tn.nodeValue);
            const out = replaceInText(tn.nodeValue);
            if (out !== tn.nodeValue) tn.nodeValue = out;
        }
    }

    function refreshAll() {
        for (const [tn, original] of originals) {
            if (!tn.isConnected) { originals.delete(tn); continue; }
            tn.nodeValue = replaceInText(original);
        }
    }

    const queue = new Set();
    let timer;
    function schedule(root) {
        queue.add(root);
        clearTimeout(timer);
        timer = setTimeout(() => {
            for (const r of queue) if (r.isConnected) convert(r);
            queue.clear();
        }, 100);
    }

    if (document.body) convert(document.body);
    new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.type === 'characterData') {
                if (m.target.parentElement) schedule(m.target.parentElement);
            } else {
                for (const n of m.addedNodes) {
                    if (n.nodeType === Node.ELEMENT_NODE) schedule(n);
                    else if (n.nodeType === Node.TEXT_NODE && n.parentElement)
                        schedule(n.parentElement);
                }
            }
        }
    }).observe(document.body || document.documentElement, {
        childList: true, subtree: true, characterData: true,
    });

    // ---------- MENU ----------
    let menuIds = [];
    function save(key, value) {
        SETTINGS[key] = value;
        GM_setValue(key, value);
        refreshAll();
        buildMenu();
    }
    function buildMenu() {
        menuIds.forEach((id) => GM_unregisterMenuCommand(id));
        menuIds = [];
        menuIds.push(GM_registerMenuCommand(
            `Format: ${SETTINGS.hour12 ? '12-hour' : '24-hour'} (click to toggle)`,
            () => save('hour12', !SETTINGS.hour12)));
        menuIds.push(GM_registerMenuCommand(
            `Seconds: ${SETTINGS.showSeconds ? 'on' : 'off'} (click to toggle)`,
            () => save('showSeconds', !SETTINGS.showSeconds)));
        menuIds.push(GM_registerMenuCommand(
            `Zone name: ${SETTINGS.showZoneName ? 'on' : 'off'} (click to toggle)`,
            () => save('showZoneName', !SETTINGS.showZoneName)));
        menuIds.push(GM_registerMenuCommand('Set preferred timezone…', () => {
            const tz = prompt(
                'IANA timezone (blank = local):\ne.g. America/New_York, Asia/Kolkata',
                SETTINGS.timeZone);
            if (tz !== null) save('timeZone', tz.trim());
        }));
    }
    buildMenu();
})();
