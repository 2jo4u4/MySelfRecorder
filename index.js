// ==UserScript==
// @name         MySelfRecorder
// @namespace    https://github.com/2jo4u4/MySelfRecorder.git
// @version      2.0.0
// @description  紀錄觀看的動畫集數
// @author       Jay.Huang
// @match        https://myself-bbs.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=myself-bbs.com
// @grant        none
// @license      MIT
// ==/UserScript==
const animePath = window.location.pathname; // like: /thread-47934-1-1.html
const animeCode = animePath.split("-")[1];
const storeKeyWord = "recorder";
const storeFavorite = "favorite";
const favoriteIconHref = "https://cdn-icons-png.flaticon.com/512/2107/2107845.png";
const favoriteAddIconHref = "https://cdn-icons-png.flaticon.com/512/2001/2001314.png";
const favoriteRemoveIconHref = "https://cdn-icons-png.flaticon.com/512/2001/2001316.png";
const notFoundCoverImg = "https://cdn-icons-png.flaticon.com/512/7214/7214281.png";
let favoritListFlag = false;
(function () {
    "use strict";
    if (/^\/thread/.test(animePath)) {
        recordAnime(1);
        myfavoriteList(true);
    }
    else {
        myfavoriteList(false);
    }
})();
//
function recordAnime(retryCount) {
    const mainlist = document.getElementsByClassName("main_list")[0];
    if (retryCount < 3 && mainlist === undefined) {
        window.setTimeout(() => {
            recordAnime(retryCount + 1);
        }, 1500);
    }
    else if (mainlist !== undefined) {
        setClearLogBtn();
        const recorder = getRecorder();
        mark(recorder[animeCode] || [], mainlist);
        // setting event send
        const targets = Array.from(mainlist.getElementsByClassName("various"));
        targets.forEach((tagA, number) => {
            tagA.onclick = function () {
                const recorder = getRecorder();
                const newNumberList = Array.from(new Set(recorder[animeCode] ? [number, ...recorder[animeCode]] : [number]));
                setRecorder(Object.assign(Object.assign({}, recorder), { [animeCode]: newNumberList }));
                mark(newNumberList, mainlist);
            };
        });
    }
    else {
        alert("找不到集數選單!!");
    }
}
function mark(numberlist, mainlist = document.getElementsByClassName("main_list")[0]) {
    Array.from(mainlist.children).forEach((li) => {
        li.style.backgroundColor = "unset";
    });
    numberlist.forEach((number, index) => {
        // 將觀看過的集數加註
        let markColor = "#ff000030";
        if (index === 0) {
            // 最後一次觀看的集數
            markColor = "#ff000080";
        }
        mainlist.children[number].style.backgroundColor =
            markColor;
    });
}
function setRecorder(data) {
    window.localStorage.setItem(storeKeyWord, JSON.stringify(data));
}
function getRecorder() {
    const str = window.localStorage.getItem(storeKeyWord) || "{}";
    return JSON.parse(str);
}
function setClearLogBtn() {
    const div = document.getElementsByClassName("vodlist_index")[0];
    if (div) {
        const clearBtn = document.createElement("button");
        clearBtn.innerText = "清除此動畫紀錄";
        clearBtn.style.position = "absolute";
        clearBtn.style.top = "0px";
        clearBtn.style.right = "0px";
        clearBtn.onclick = function () {
            const recorder = getRecorder();
            setRecorder(Object.assign(Object.assign({}, recorder), { [animeCode]: [] }));
            mark([]);
        };
        div.style.position = "relative";
        div.append(clearBtn);
    }
}
//
function myfavoriteList(showBtn) {
    const favorite = getFavorite();
    const block = document.createElement("div");
    block.style.position = "fixed";
    block.style.top = "20px";
    block.style.left = "20px";
    const list = document.createElement("div");
    list.style.maxHeight = "50vh";
    list.style.display = favoritListFlag ? "flex" : "none";
    list.style.flexDirection = "column";
    list.style.marginTop = "12px";
    list.style.padding = "12px";
    list.style.backdropFilter = "blur(20px)";
    list.style.borderRadius = "12px";
    list.style.overflow = "auto";
    const span = document.createElement("span");
    span.innerText = "暫無最愛";
    span.style.color = "darkorange";
    const btn = document.createElement("img");
    btn.src = favoriteIconHref;
    btn.style.width = "24px";
    btn.style.height = "24px";
    btn.style.padding = "12px";
    btn.style.borderRadius = "12px";
    btn.style.backdropFilter = "blur(20px)";
    btn.style.cursor = "pointer";
    btn.onclick = () => {
        favoritListFlag = !favoritListFlag;
        list.style.display = favoritListFlag ? "flex" : "none";
        span.style.display = getFavorite().length === 0 ? "block" : "none";
    };
    list.append(span);
    favorite.forEach((item, index) => {
        const card = favoriteCard(item, index !== 0 ? 12 : 0);
        list.append(card);
    });
    if (showBtn) {
        const coverPictureImg = document.querySelector(".info_con .info_img_box img");
        const info = {
            name: getAnimeName(),
            image: (coverPictureImg === null || coverPictureImg === void 0 ? void 0 : coverPictureImg.src) || notFoundCoverImg,
            href: animePath,
            animecode: animeCode,
        };
        const add_remove = document.createElement("img");
        add_remove.style.marginRight = "4px";
        add_remove.style.width = "24px";
        add_remove.style.height = "24px";
        add_remove.style.padding = "12px";
        add_remove.style.borderRadius = "12px";
        add_remove.style.backdropFilter = "blur(20px)";
        add_remove.style.cursor = "pointer";
        const obj = favorite.find((item) => animeCode === item.animecode);
        let have = Boolean(obj);
        if (have) {
            add_remove.src = favoriteRemoveIconHref;
        }
        else {
            add_remove.src = favoriteAddIconHref;
        }
        add_remove.onclick = function () {
            if (have) {
                // remove
                add_remove.src = favoriteAddIconHref;
                const newfavorite = [];
                for (let index = 0; index < favorite.length; index++) {
                    const { animecode } = favorite[index];
                    if (animeCode !== animecode) {
                        newfavorite.push(Object.assign({}, favorite[index]));
                    }
                }
                setFavorite(newfavorite);
                const card = document.getElementById(animeCode);
                if (card) {
                    card.style.display = "none";
                }
            }
            else {
                // add
                add_remove.src = favoriteRemoveIconHref;
                const newfavorite = getFavorite();
                newfavorite.push(info);
                setFavorite(newfavorite);
                const card = document.getElementById(animeCode);
                if (card) {
                    card.style.display = "block";
                }
                else {
                    const card = favoriteCard(info, 12);
                    list.append(card);
                }
            }
            have = !have;
        };
        block.append(add_remove);
    }
    block.append(btn, list);
    document.body.append(block);
}
function favoriteCard(v, marginTop = 0) {
    const { animecode, image, name, href } = v;
    const card = document.createElement("div");
    card.id = animecode;
    card.style.marginTop = `${marginTop}px`;
    const img = document.createElement("img");
    img.src = image;
    const span = document.createElement("span");
    span.style.marginTop = "4px";
    span.innerText = name;
    span.style.color = "black";
    span.style.position = "absolute";
    span.style.bottom = "0";
    span.style.backgroundColor = "#fafafa";
    const link = document.createElement("a");
    link.href = href;
    link.style.display = "flex";
    link.style.flexDirection = "column";
    link.style.position = "relative";
    link.append(img, span);
    card.append(link);
    return card;
}
function setFavorite(data) {
    window.localStorage.setItem(storeFavorite, JSON.stringify(data));
}
function getFavorite() {
    const str = window.localStorage.getItem(storeFavorite) || "[]";
    return JSON.parse(str);
}
function getAnimeName() {
    var _a;
    const block = (((_a = document.querySelector("#pt .z")) === null || _a === void 0 ? void 0 : _a.lastElementChild) ||
        null);
    if (block) {
        return block.innerText.replace(/【(\S|\s|0-9)*】(\s...)?/, "");
    }
    else {
        return "unknown";
    }
}
