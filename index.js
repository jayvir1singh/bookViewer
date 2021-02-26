var chaptersPicker = document.querySelector("#chaptersPicker");
var pagesPickerContainer = document.querySelector("#pagesPickerContainer");
var pagesPicker = document.querySelector("#pagesPicker");
var typePicker = document.querySelector("#typePicker");
var pageContent = document.querySelector("#pageContent");
var pagesPrev = document.querySelectorAll("#pagesPrev");
var pagesNext = document.querySelectorAll("#pagesNext");

var title = document.querySelector("#title");
var cover = document.querySelector("#cover");
var description = document.querySelector("#description");

[...pagesPrev].forEach((el) => el.addEventListener("click", pagesPrevClick));
[...pagesNext].forEach((el) => el.addEventListener("click", pagesNextClick));

chaptersPicker.addEventListener("change", chaptersPickerChange);
pagesPicker.addEventListener("change", pagesPickerChange);
typePicker.addEventListener("change", typePickerChange);

window.addEventListener("scroll", () => lazyLoad.check(true));
window.addEventListener("resize", () => lazyLoad.check(true));
window.addEventListener("orientationchange", () => lazyLoad.check(false));
window.addEventListener("mousemove", () => lazyLoad.check(true));

function setFullScreen(el) {
    if(el.requestFullscreen) {
        el.requestFullscreen();
    }
    else if(el.msRequestFullscreen) {
        el.msRequestFullscreen();
    }
    else if(el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
    }
    else if(el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
    }
}

function exitFullScreen() {
    if(document.exitFullscreen) {
        document.exitFullscreen();
    } 
    else if(document.msExitFullscreen) {
        document.msExitFullscreen();
    }
    else if(document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    }
    else if(document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    }
}

function toggleFullScreen() {
    if(
        !document.fullscreenElement 
        && !document.msFullscreenElement 
        && !document.mozFullScreenElement 
        && !document.webkitFullscreenElement
    ) {
        setFullScreen(document.documentElement);
    }
    else {
        exitFullScreen();
    }
}

function elementInViewport(el, space = {XA:0, YA:0, XB:0, YB:0}) {
    var top = el.offsetTop;
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    var height = el.offsetHeight;
    while(el.offsetParent) {
        el = el.offsetParent;
        top += el.offsetTop;
        left += el.offsetLeft;
    }
    
    var top = top - space.YA;
    var left = left - space.XA;
    var height = height + (space.YA + space.YB);
    var width = width + (space.XA + space.XB);
    
    return (
        top < (window.pageYOffset + window.innerHeight) &&
        left < (window.pageXOffset + window.innerWidth) &&
        (top + height) > window.pageYOffset &&
        (left + width) > window.pageXOffset
    );
}

function isFile(file) {
    return typeof file === "object"
}

function blobToSrc(src) {
    if(isFile(src)) {
        return URL.createObjectURL(src);
    }
    else {
        return src;
    }
}

function unloadBlob(src) {
    if(isFile(src)) URL.revokeObjectURL(src);
}

var lazyLoad = {
    _timeout:1000,
    timeoutId:-1,
    waiting:false,
    space:{XA:0, YA:0, XB:0, YB:0},
    imagesArr:[],
    set timeout(n) {
        n = parseInt(n);
        if(n === NaN) n = 0;
        this._timeout = n;
        if(this.waiting) {
            clearTimeout(this._timeoutId);
            this.waiting = false;
        }
    },
    get timeout() {
        return this._timeout;
    },
    check(wait) {
        if(wait === true) {
            if(this.waiting) return;
            this.waiting = true;
            this.timeoutId = setTimeout(() => this.waiting = false, this._timeout);
        }
        this.imagesArr = this.imagesArr.filter((el) => {
            if(elementInViewport(el, this.space)) {
                el.style.width = "initial";
                el.style.height = "initial";
                el.src = blobToSrc(el.waitSrc);
                return false;
            }
            else if(!document.documentElement.contains(el)) {
                return false;
            }
            else {
                return true;
            }
        }); 
    }
}

function imageLoaded(e) {
    unloadBlob(e.target.waitSrc);
    e.target.style.minHeight = "10px";
    e.target.style.minWidth = "10px";
    e.target.style.backgroundImage = "none";
}

function imageError(e) {
    if(e.target.src.endsWith("not_available.jpeg")) return;
    e.target.style.minHeight = "300px";
    e.target.style.minWidth = "300px";
    e.target.src = "not_available.jpeg";
    e.target.style.backgroundImage = "url('not_available.jpeg')";
}

function createImage(src, alt, scrollInto) {
    var image = document.createElement("img");
    image.waitSrc = src;
    if(scrollInto) {
        image.src = blobToSrc(src);
        image.addEventListener("load", (e) => e.target.scrollIntoView());
    }
    else {
        image.style.width = 0;
        image.style.height = 0;
        lazyLoad.imagesArr.push(image);
    }
    image.addEventListener("load", imageLoaded);
    image.addEventListener("error", imageError);
    image.alt = alt;
    return image;
}

function triggerFakeChange(el) {
    el.dispatchEvent(new CustomEvent("change", {detail: "fake"}));
}

var book = {
    _data:{},
    _pageIndex:0,
    _chapterIndex:0,
    _type:"one",

    get data() {
        return this._data;
    },
    get pageIndex() {
        return this._pageIndex;
    },
    get chapterIndex() {
        return this._chapterIndex;
    },
    get type() {
        return this._type;
    },

    set data(val) {
        this._data = val;
        this.chapterIndex = 0;

        this.dataChange();
    },
    set pageIndex(val) {
        val = parseInt(val);
        if((val + 1) > this.currentChapter.pages.length) {
            this.chapterIndex++;
        }
        else if((val + 1) <= 0) {
            this.chapterIndex--;
            this.pageIndex = this.currentChapter.pages.length - 1;
        }
        else {
            this._pageIndex = val;
            this.pageChange();
        }

    },
    set chapterIndex(val) {
        val = parseInt(val);
        if((val + 1) > this.chapters.length) return;
        else if((val + 1) <= 0) return;
        else {
            this._chapterIndex = val;
            this.chapterChange();
            this.pageIndex = 0;
        }
    },
    set type(val) {
        if(["one", "all"].includes(val)) this._type = val;
        this.chapterIndex = this.chapterIndex;
        this.typeChange();
    },

    get chapters() {
        return this.data.chapters;
    },
    get currentChapter() {
        return this.chapters[this.chapterIndex];
    },
    get pages() {
        if(this.type === "one") {
            return [this.currentChapter.pages[this.pageIndex]];
        }
        else if(this.type === "all") {
            return this.currentChapter.pages;
        }
    },

    dataChange() {
        document.title = `${this.data.title} - Book Viewer`;
        title.innerText = this.data.title;
        description.innerText = this.data.description;
        cover.innerHTML = "";
        cover.appendChild(createImage(this.data.cover, "cover", true));
        chaptersPickerPopulate();
        triggerFakeChange(chaptersPicker);
    },
    chapterChange() {
        pagesPickerPopulate();
        if(chaptersPicker.selectedIndex !== this.chapterIndex) {
            chaptersPicker.selectedIndex = this.chapterIndex;
            triggerFakeChange(chaptersPicker);
        }
        pageContent.innerHTML = "";
    },
    pageChange() {
        if(pagesPicker.selectedIndex !== this.pageIndex) {
            pagesPicker.selectedIndex = this.pageIndex;
            triggerFakeChange(pagesPicker);
        }
        pageContent.innerHTML = "";
        //console.log(this.pages);
        this.pages.forEach((page, i) => pageContent.appendChild(createImage(page, `page ${i}`, i === 0)));
    },
    typeChange() {
        if(typePicker.value !== this.type && (typePicker.value !== "allNSP")) typePicker.value = this.type;
        if(this.type === "all") {
            if(typePicker.value === "allNSP") pageContent.classList.add("pagesNSP");
            else pageContent.classList.remove("pagesNSP");
            pagesPickerContainer.style.display = "none";
        }
        else {
            pageContent.classList.remove("pagesNSP");
            pagesPickerContainer.style.display = "";
        }
        triggerFakeChange(chaptersPicker)
    },
};

function chaptersPickerPopulate() {
    chaptersPicker.innerHTML = "";
    book.chapters.forEach((chapter, i) => {
        let option = document.createElement("option");
        option.text = chapter.title;
        option.value = i;
        chaptersPicker.add(option);
    });
}

function pagesPickerPopulate() {
    pagesPicker.innerHTML = "";
    book.currentChapter.pages.forEach((page, i) => {
        let option = document.createElement("option");
        option.text = i;
        option.value = i;
        pagesPicker.add(option);
    });
}



function chaptersPickerChange(e) {
    if(e.detail !== "fake") book.chapterIndex = chaptersPicker.selectedIndex;
}

function pagesPickerChange(e) {
    if(e.detail !== "fake") book.pageIndex = pagesPicker.selectedIndex;
}

function typePickerChange() {
    if(typePicker.value === "one") book.type = "one";
    else if(typePicker.value === "all" || typePicker.value === "allNSP") book.type = "all";
}

function pagesNextClick() {
    if(book.type === "one") {
        book.pageIndex++;
    }
    else if(book.type === "all") {
        book.chapterIndex++;
    }
}

function pagesPrevClick() {
    if(book.type === "one") {
        book.pageIndex--;
    }
    else if(book.type === "all") {
        book.chapterIndex--;
    }
}

function typePickerPopulate() {
    typePicker.innerHTML = "";
    [{
        name:"One Page",
        value:"one",
    }, {
        name:"All Pages",
        value:"all",
    }, {
        name:"All Pages (No Spaces)",
        value:"allNSP",
    }].forEach((type) => {
        let option = document.createElement("option");
        option.text = type.name;
        option.value = type.value;
        typePicker.add(option);
    });
}


async function createDB() {
    var request = indexedDB.open("bookDatabase", 1);
    return new Promise((resolve, reject) => {
        request.onerror = (e) => reject(e.target.error);
        request.onsuccess = (e) => resolve(e.target.result);
        request.onupgradeneeded = (e) => {
            e.target.result.createObjectStore("files", {autoIncrement:true});
        };
    });
}

async function readDB() {
    var db = await createDB();
    return new Promise((resolve) => {
        var tx = db.transaction(db.objectStoreNames, "readwrite");
        tx.objectStore("files").getAll().onsuccess = (e) => {
            resolve(e.target.result);
            db.close();
        };
    });
}

async function writeDB(files) {
    var db = await createDB();
    return new Promise((resolve) => {
        var tx = db.transaction(db.objectStoreNames, "readwrite");
        var objectStore = tx.objectStore("files");
        (objectStore.clear()).onsuccess = () => {
            Array.from(files).forEach((file) => objectStore.add(file));
            db.close();
            resolve();
        };
    });
}

typePickerPopulate();

if(navigator.userAgent.includes("Android")) {
    filesInput.webkitdirectory = false;
    filesInput.multiple = true;
}

navigator.serviceWorker.register("sw.js");
window.addEventListener("beforeinstallprompt", (e) => {
    async function pwaInstallClick() {
        var choice = await e.prompt();
        if(choice.outcome === "accepted") pwaInstallInput.style.display = "";
        pwaInstallInput.removeEventListener("click", pwaInstallClick);
    }
    pwaInstallInput.style.display = "block";
    pwaInstallInput.addEventListener("click", pwaInstallClick);
});


const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test( userAgent );
}

const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);
  
if(isIos() && !isInStandaloneMode()) this.setState({ showInstallMessage: true });