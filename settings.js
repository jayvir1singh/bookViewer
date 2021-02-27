var settingsToggleButton = document.querySelector("#settingsToggleButton");
var settingsIdInput = document.querySelector("#settingsIdInput");
var settingsLoadButton = document.querySelector("#settingsLoadButton");
var settingsSaveButton = document.querySelector("#settingsSaveButton");
var settingsClearButton = document.querySelector("#settingsClearButton");
var urlInput = document.querySelector("#urlInput");
var urlSubmit = document.querySelector("#urlSubmit");
var lazyLoadSpaceInput = document.querySelector("#lazyLoadSpaceInput");
var lazyLoadTimeoutInput = document.querySelector("#lazyLoadTimeoutInput");
var themePicker = document.querySelector("#themePicker");
var infoEnabledInput = document.querySelector("#infoEnabledInput");
var filesButton = document.querySelector("#filesButton");
var toggleFullscreenButton = document.querySelector("#toggleFullscreenButton");

var info = document.querySelector("#info");
var settingsContainer = document.querySelector("#settingsContainer");
var settingsHidden = false;
var scrollHistoryValue = 0;
var files;

function lazyLoadSpaceParse(val) {
    var space = {};
    try {
        var cords = val.trim().slice(1).slice(0, -1).split("),(");
        var a = cords[0].split(",");
        var b = cords[1].split(",");
        if(parseInt(a[0]) === NaN) a[0] = 0;
        if(parseInt(a[1]) === NaN) a[1] = 0;
        if(parseInt(b[0]) === NaN) b[0] = 0;
        if(parseInt(b[1]) === NaN) b[1] = 0;
        space.XA = parseInt(a[0]);
        space.YA = parseInt(a[1]);
        space.XB = parseInt(b[0]);
        space.YB = parseInt(b[1]);
    }
    catch(e) {
        console.error(e);
        space = {XA:0,YA:0,XB:0,YB:0}
    }
    return space;
}

function ExtractBaseURL(val) {
    return val.substr(0, (val.lastIndexOf("/") + 1));
}

if(localStorage === null) location.href = "about:blank";
var settingsId = localStorage.getItem("settingsCurrentId");
if(settingsId === null || settingsId === undefined) {
    settingsIdInput.value = "default";
    var settingsId = localStorage.setItem("settingsCurrentId", settingsIdInput.value);
    settingsSave();
}
else {
    settingsIdInput.value = settingsId;
}
settingsLoad();

settingsToggleButton.addEventListener("click", settingsToggle);
settingsLoadButton.addEventListener("click", settingsLoad);
settingsSaveButton.addEventListener("click", settingsSave);
settingsClearButton.addEventListener("click", settingsClear);
urlSubmit.addEventListener("click", urlFunc);
filesButton.addEventListener("click", () => filesInput.click());
directoryButton.addEventListener("click", () => directoryInput.click());
directoriesButton.addEventListener("click", () => directoriesInput.click());
toggleFullscreenButton.addEventListener("click", toggleFullScreen);


lazyLoadSpaceInput.addEventListener("change", settingslazyLoadSpace);
lazyLoadTimeoutInput.addEventListener("change", settingslazyLoadTimeout);
themePicker.addEventListener("change", themePickerChange);
infoEnabledInput.addEventListener("change", infoEnabledChange);
filesInput.addEventListener("change", filesOrDirectoryInputChange);
directoryInput.addEventListener("change", filesOrDirectoryInputChange);
directoriesInput.addEventListener("change", filesOrDirectoryInputChange);

settingsIdInput.addEventListener("keyup", (e) => {
    if(e.code === "Enter") {
        e.preventDefault();
        settingsLoadButton.click();
    }
});
urlInput.addEventListener("keyup", (e) => {
    if(e.code === "Enter") {
        e.preventDefault();
        urlSubmit.click();
    }
});

function settingsLoad() {
    if(localStorage.getItem("settings_" + settingsIdInput.value) === undefined) settingsSave()
    var {
        settingsHidden,
        url,
        lazyLoadSpace,
        lazyLoadTimeout,
        theme,
        infoEnabled,
        filesCache,
        chapter,
        page,
        type,
        scrollHistory,
        scrollHistoryIndex
    } = JSON.parse(localStorage.getItem("settings_" + settingsIdInput.value));
    if(settingsHidden) settingsToggle();
    urlInput.value = url;
    lazyLoadSpaceInput.value = lazyLoadSpace;
    lazyLoadTimeoutInput.value = lazyLoadTimeout;
    scrollHistoryInput.checked = scrollHistory;
    themePicker.value = theme;
    infoEnabledInput.checked = infoEnabled;
    filesCacheInput.checked = filesCache;
    scrollHistoryValue = scrollHistoryIndex;
    settingslazyLoadSpace();
    settingslazyLoadTimeout();
    themePickerChange();
    infoEnabledChange();
    
    urlFunc().then(() => {
        chaptersPicker.selectedIndex = chapter;
        chaptersPicker.dispatchEvent(new CustomEvent("change"));
        typePicker.value = type;
        typePicker.dispatchEvent(new CustomEvent("change"));
        pagesPicker.selectedIndex = page;
        pagesPicker.dispatchEvent(new CustomEvent("change"));
    });
}

function settingsSave() {
    localStorage.setItem("settingsCurrentId", settingsIdInput.value);
    localStorage.setItem("settings_" + settingsIdInput.value, JSON.stringify({
        settingsHidden:settingsHidden,
        url:urlInput.value,
        lazyLoadSpace:lazyLoadSpaceInput.value,
        lazyLoadTimeout:lazyLoadTimeoutInput.value,
        scrollHistory:scrollHistoryInput.checked,
        theme:themePicker.value,
        infoEnabled:infoEnabledInput.checked,
        filesCache:filesCacheInput.checked,
        chapter:chaptersPicker.selectedIndex,
        page:pagesPicker.selectedIndex,
        type:typePicker.value,
        scrollHistoryIndex:scrollHistoryValue
    }));
}

function settingsClear() {
    var isAccept = confirm("Are you sure you want to clear all saved settings?");
    if(isAccept) {
        localStorage.clear();
        location.reload();
    }
}

function settingsToggle() {
    settingsHidden = !settingsHidden;
    if(settingsHidden) {
        settingsContainer.style.display = "none";
    }
    else {
        settingsContainer.style.display = "";
    }
}

async function urlFunc() {
    if((urlInput.value === "db:bookDatabase" && filesCacheInput.checked) || urlInput.value === "files:internal") {
        if(urlInput.value === "db:bookDatabase") files = await readDB();

        var jsonFile = Array.from(files).find(val => val.name.endsWith(".js"));
        return LoadExternalScirpt(jsonFile);
    }
    else {
        return LoadExternalScirpt(urlInput.value);
    }
}

function settingslazyLoadSpace() {
    lazyLoad.space = lazyLoadSpaceParse(lazyLoadSpaceInput.value);
}

function settingslazyLoadTimeout() {
    lazyLoad.timeout = parseInt(lazyLoadTimeoutInput.value);
}

function themePickerChange() {
    if(themePicker.value === "dark") {
        darkStyleSheet.disabled = false;
        setTimeout(() => oledStyleSheet.disabled = true, 500);
    }
    else if(themePicker.value === "oled") {
        oledStyleSheet.disabled = false;
        setTimeout(() => darkStyleSheet.disabled = true, 500);
    }
    else {
        darkStyleSheet.disabled = true;
        oledStyleSheet.disabled = true;
    }
}

function infoEnabledChange() {
    if(infoEnabledInput.checked) {
        info.style.display = "none";
    }
    else {
        info.style.display = "";
    }
}

settingsToggleButton.addEventListener("click", settingsSave);
urlSubmit.addEventListener("click", settingsSave);
toggleFullscreenButton.addEventListener("click", settingsSave);
lazyLoadSpaceInput.addEventListener("change", settingsSave);
lazyLoadTimeoutInput.addEventListener("change", settingsSave);
themePicker.addEventListener("change", settingsSave);
infoEnabledInput.addEventListener("change", settingsSave);
scrollHistoryInput.addEventListener("change", settingsSave);
filesCacheInput.addEventListener("change", settingsSave);
chaptersPicker.addEventListener("change", settingsSave);
pagesPicker.addEventListener("change", settingsSave);
typePicker.addEventListener("change", settingsSave);
[...pagesPrev].forEach((el) => el.addEventListener("click", settingsSave));
[...pagesNext].forEach((el) => el.addEventListener("click", settingsSave));

function fixSrcPath(src) {
    if(document.currentScript === null) {
        var scriptSrc = "";
    }
    else {
        var scriptSrc = document.currentScript.waitSrc;
    }

    if(isFile(scriptSrc)) {
        return Array.from(files).find((val) => val.name === src);
    }
    else {
        return ExtractBaseURL(scriptSrc) + src;
    }
}

function bookJSONPFunc(data) {
    data.cover = fixSrcPath(data.cover);
    for(let chapter of data.chapters) {
        for (let i = 0; i < chapter.pages.length; i++) {
            let page = chapter.pages[i];
            chapter.pages[i] = fixSrcPath(page);
        }
    }
    book.data = data;
}

function LoadExternalScirpt(src) {
    var script = document.createElement("script");
    script.waitSrc = src;
    script.src = blobToSrc(src);
    var prom = new Promise(function(resolve, reject) {
        script.addEventListener("load", (e) => {
            e.target.parentElement.removeChild(e.target);
            resolve(e);
        });
        script.addEventListener("error", (e) => {
            e.target.parentElement.removeChild(e.target);
            bookJSONPFunc({
                title:"not available",
                cover:"not_available.jpeg",
                description:"not available",
                chapters:[{
                    title:"not available",
                    pages:["not_available.jpeg"],
                }]
            });
            resolve();
        });
    });
    document.head.appendChild(script);
    return prom;
}

async function filesOrDirectoryInputChange(e) {
    if(filesCacheInput.checked) {
        urlInput.value = "db:bookDatabase";
        await writeDB(e.target.files);
    }
    else {
        urlInput.value = "files:internal";
        files = e.target.files;
    }
    await urlFunc();
}

if(scrollHistoryInput.checked) scrollLock();

function updateScrollHistory() {
    var found = Array.from(document.images).findIndex((el) => elementInViewport(el));
    if(found === -1) found = 1;
    if(scrollHistoryValue !== found) {
        scrollHistoryValue = found;
        settingsSave();
    }
}

function scrollLock() {
    var intervalId = setInterval(() => {
        if(document.images.length >= (scrollHistoryValue + 1)) {
            clearInterval(intervalId);
            window.addEventListener("click", scrollToImage);
            window.addEventListener("scroll", scrollToImage);
            window.addEventListener("mousemove", scrollToImage);
        }
    });
}

function resetScrollLock() {
    if(elementInViewport(document.images[scrollHistoryValue])) {
        window.removeEventListener("click", scrollToImage);
        window.removeEventListener("scroll", scrollToImage);
        window.removeEventListener("mousemove", scrollToImage);
        window.addEventListener("scroll", updateScrollHistory);
    }
}
function scrollToImage() {
    document.images[scrollHistoryValue].scrollIntoView(true);
    if(document.images[scrollHistoryValue].src !== "" && document.images[scrollHistoryValue].complete) {
        resetScrollLock();
    }
    else {
        document.images[scrollHistoryValue].addEventListener("load", resetScrollLock);
    }
}

async function updateSW() {
    try {
        var sw = await navigator.serviceWorker.ready;
        await sw.update();
        window.close();
        location.reload();
    }
    catch(e) {
        console.error(e);
    }
}

async function resetSW() {
    var isAccept = confirm("Offline mode will be disabled until next network connection. Are you sure you want to reset app?");
    if(isAccept) {
        var sw = await navigator.serviceWorker.ready;
        await sw.unregister();
        var cachesKeys = (await caches.keys().catch(() => {
            return [];
        }));
        for(let cacheName of cachesKeys) {
            await caches.delete(cacheName);
        }
        window.close();
        location.reload();
    }
}

async function lastestSWVersion() {
    settingsVersion.innerText = "Version: x";
    try {
        await navigator.serviceWorker.ready;
        var cachesKeys = (await caches.keys().catch(() => {
            return [];
        }));
        if(cachesKeys.length !== 0) settingsVersion.innerText = "Version: " + cachesKeys[cachesKeys.length -1];
    }
    catch(e) {
        console.error(e);
    }
}

lastestSWVersion();

settingsUpdateSW.addEventListener("click", updateSW);
settingsResetSW.addEventListener("click", resetSW);