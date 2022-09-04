// ==UserScript==
// @name         MySelfRecorder
// @namespace    https://github.com/2jo4u4/MySelfRecorder.git
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://myself-bbs.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=myself-bbs.com
// @grant        none
// ==/UserScript==

const animePath = window.location.pathname; // like: /thread-47934-1-1.html
const animeCode = animePath.split("-")[1];
const storeKeyWord = "recorder";

(function () {
  "use strict";
  if (/^\/thread/.test(animePath)) {
    injectCustomCode(1);
  }
})();

function injectCustomCode(retryCount) {
  const mainlist = document.getElementsByClassName("main_list")[0];

  if (retryCount < 3 && mainlist === undefined) {
    window.setTimeout(() => {
      injectCustomCode(retryCount + 1);
    }, 1500);
  } else if (mainlist !== undefined) {
    setClearLogBtn();
    const recorder = getRecorder();
    mark(recorder[animeCode] || [], mainlist);
    // setting event send
    const targets = Array.from(mainlist.getElementsByClassName("various"));
    targets.forEach((tagA, number) => {
      tagA.onclick = function () {
        const recorder = getRecorder();
        const newNumberList = Array.from(
          new Set(
            recorder[animeCode] ? [number, ...recorder[animeCode]] : [number]
          )
        );
        setRecorder({ ...recorder, [animeCode]: newNumberList });
        mark(newNumberList, mainlist);
      };
    });
  } else {
    alert("找不到集數選單!!");
  }
}
function mark(
  numberlist,
  mainlist = document.getElementsByClassName("main_list")[0]
) {
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
    mainlist.children[number].style.backgroundColor = markColor;
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
      setRecorder({ ...recorder, [animeCode]: [] });
      mark([]);
    };

    div.style.position = "relative";
    div.append(clearBtn);
  }
}
