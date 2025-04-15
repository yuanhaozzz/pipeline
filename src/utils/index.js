import { useRef } from 'react'
import { debounce } from 'lodash'
import { message } from 'antd'

export function addCookie(name, value, expireHours = 7, secure = false) {
    const date = new Date();
    date.setTime(date.getTime() + expireHours * 60 * 60 * 1000 * 365);

    if (!secure) {
        document.cookie = name + '=' + value + '; expires=' + date.toUTCString() + '; path=/';
    } else {
        document.cookie = name + '=' + value + '; expires=' + date.toUTCString() + '; path=/; Secure';
        document.cookie =
            name + '=' + value + '; expires=' + date.toUTCString() + '; path=/; SameSite=None; Secure';
    }
}

export function addCookieDomain(name, value, expireHours = 7, secure = false, domain) {
    const date = new Date();
    date.setTime(date.getTime() + expireHours * 60 * 60 * 1000 * 365);
    if (!secure) {
        document.cookie = name + '=' + value + '; expires=' + date.toUTCString() + '; path=/;domain=' + domain + ';';
    } else {
        document.cookie = name + '=' + value + '; expires=' + date.toUTCString() + '; path=/; Secure';
        document.cookie =
            name + '=' + value + '; expires=' + date.toUTCString() + '; path=/; SameSite=None; Secure';
    }
}


export function getCookie(name) {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return '';
}

export function deleteCookie(name) {
    addCookie(name, '', -1);
}

export function deleteCookieDomain(name, domain) {
    addCookieDomain(name, '', -1, false, domain);
}

export function trim(e) {
    return e.target.value.replace(/(^\s*)|(\s*$)/g, '');
}

// 随机颜色
export function getRandomColor() {
    var rand = Math.floor(Math.random() * 0xFFFFFF).toString(16);
    if (rand.length == 6) {
        return '#' + rand;
    } else {
        return getRandomColor();
    }
}

// 随机时间
export function randomTime(starTime, endTime) {
    const time = endTime - starTime;
    return starTime + Math.floor(Math.random() * time);
}


export function getUrlParams() {
    const url = window.location.href
    let urlStr = url.split('?')[1]
    const urlSearchParams = new URLSearchParams(urlStr)
    const result = Object.fromEntries(urlSearchParams.entries())
    return result
}

export function filterEmptyParams(params) {
    for (let key in params) {
        if (params.hasOwnProperty(key)) {
            if (params[key] === '' || params[key] === undefined || params[key] === null) {
                delete params[key]
            }
        }

    }
    return params
}

export function exportExcel(api, params = {}) {
    params.size = 100000000
    params.current = 1
    let query = ''
    Object.keys(params).forEach((key, index) => {
        let str = `${key}=${params[key]}`
        if (index > 0) {
            str = '&' + str
        }
        query += str
    })
    window.open(`/${api}?${query}`)
}

// 值的过滤
export function filterVal(filters = {}) {
    let obj = {};
    for (let k in filters) {
        if (filters.hasOwnProperty(k) && !!filters[k]) {
            obj[k] = JSON.stringify(filters[k]);
        }
    }
    return obj;
}

// 截取字符串
export function substrLen(str = '', len = 0) {
    return str.substring(len);
}

export const getLocalStorage = (key) => {
    let value = localStorage.getItem(key)
    if (value !== undefined && value !== null) {
        value = JSON.parse(value)
    }
    return value
}

export function getBrowserInfo() {
    var UserAgent = navigator.userAgent.toLowerCase();
    var browserInfo = {};
    var browserArray = {
        IE: window.ActiveXObject || "ActiveXObject" in window, // IE
        Chrome: UserAgent.indexOf('chrome') > -1 && UserAgent.indexOf('safari') > -1, // Chrome浏览器
        Firefox: UserAgent.indexOf('firefox') > -1, // 火狐浏览器
        Opera: UserAgent.indexOf('opera') > -1, // Opera浏览器
        Safari: UserAgent.indexOf('safari') > -1 && UserAgent.indexOf('chrome') === -1, // safari浏览器
        Edge: UserAgent.indexOf('edge') > -1, // Edge浏览器
        QQBrowser: /qqbrowser/.test(UserAgent), // qq浏览器
        WeixinBrowser: /MicroMessenger/i.test(UserAgent) // 微信浏览器
    };
    // console.log(browserArray)
    for (var i in browserArray) {
        if (browserArray[i]) {
            var versions = '';
            if (i === 'IE') {
                versions = UserAgent.match(/(msie\s|trident.*rv:)([\w.]+)/)[2];
            } else if (i === 'Chrome') {
                for (var mt in navigator.mimeTypes) {
                    //检测是否是360浏览器(测试只有pc端的360才起作用)
                    if (navigator.mimeTypes[mt]['type'] === 'application/360softmgrplugin') {
                        i = '360';
                    }
                }
                versions = UserAgent.match(/chrome\/([\d.]+)/)[1];
            } else if (i === 'Firefox') {
                versions = UserAgent.match(/firefox\/([\d.]+)/)[1];
            } else if (i === 'Opera') {
                versions = UserAgent.match(/opera\/([\d.]+)/)[1];
            } else if (i === 'Safari') {
                versions = UserAgent.match(/version\/([\d.]+)/)[1];
            } else if (i === 'Edge') {
                versions = UserAgent.match(/edge\/([\d.]+)/)[1];
            } else if (i === 'QQBrowser') {
                versions = UserAgent.match(/qqbrowser\/([\d.]+)/)[1];
            }
            browserInfo.type = i;
            browserInfo.versions = parseInt(versions);
        }
    }
    return browserInfo;
}

export function browserRedirect() {
    var sUserAgent = navigator.userAgent;
    var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows");
    var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
    if (isMac) return "MacOS";
    var isUnix = (navigator.platform == "X11") && !isWin && !isMac;
    if (isUnix) return "Unix";
    var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
    if (isLinux) return "Linux";
    if (isWin) {
        var isWin2K = sUserAgent.indexOf("Windows NT 5.0") > -1 || sUserAgent.indexOf("Windows 2000") > -1;
        if (isWin2K) return "Win2000";
        var isWinXP = sUserAgent.indexOf("Windows NT 5.1") > -1 || sUserAgent.indexOf("Windows XP") > -1;
        if (isWinXP) return "WinXP";
        var isWin2003 = sUserAgent.indexOf("Windows NT 5.2") > -1 || sUserAgent.indexOf("Windows 2003") > -1;
        if (isWin2003) return "Win2003";
        var isWinVista = sUserAgent.indexOf("Windows NT 6.0") > -1 || sUserAgent.indexOf("Windows Vista") > -1;
        if (isWinVista) return "WinVista";
        var isWin7 = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1;
        if (isWin7) return "Win7";
        var isWin10 = sUserAgent.indexOf("Windows NT 10") > -1 || sUserAgent.indexOf("Windows 10") > -1;
        if (isWin10) return "Win10";
    }
    return "other";
}


/**
 * 压缩图片
 * @param img 被压缩的img对象
 * @param type 压缩后转换的文件类型
 * @param mx 触发压缩的图片最大宽度限制
 * @param mh 触发压缩的图片最大高度限制
 * @param quality 图片质量
 */
export function compressImg(img, type, mx, mh, quality = 1) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        const { width: originWidth, height: originHeight } = img
        // 最大尺寸限制
        const maxWidth = mx
        const maxHeight = mh
        // 目标尺寸
        let targetWidth = originWidth
        let targetHeight = originHeight
        if (originWidth > maxWidth || originHeight > maxHeight) {
            if (originWidth / originHeight > 1) {
                // 宽图片
                targetWidth = maxWidth
                targetHeight = Math.round(maxWidth * (originHeight / originWidth))
            } else {
                // 高图片
                targetHeight = maxHeight
                targetWidth = Math.round(maxHeight * (originWidth / originHeight))
            }
        }
        canvas.width = targetWidth
        canvas.height = targetHeight
        context.clearRect(0, 0, targetWidth, targetHeight)
        // 图片绘制
        context.drawImage(img, 0, 0, targetWidth, targetHeight)
        const data = canvas.toDataURL('image/png', 1)
        resolve(data)
        // canvas.toBlob(function (blob) {
        //     resolve(blob)
        // }, type || 'image/png', quality)
    })
}



// 下载图片
export const downloadImg = (url) => {
    return new Promise((resolve, reject) => {
        // 创建请求
        const xhr = new XMLHttpRequest()
        xhr.open('get', url, true)
        // 响应类型设置为blob
        xhr.responseType = 'blob'
        xhr.onload = function () {
            if (this.status === 200) {
                resolve(this.response)
            }
        }
        xhr.onerror = reject
        xhr.send()
    })
}

// 将Blob对象转为File对象
export const blobToFile = (blob, fileName) => {
    return new window.File([blob], fileName, { type: blob.type })
}

export const transformFile = async (url) => {
    const res = await downloadImg(url)
    // 获取文件名
    const urlArr = url.split('/')
    const fileName = urlArr[urlArr.length - 1]
    const file = blobToFile(res, fileName)
    return file
}

export function compareVersion(version1, version2) {
    const arr1 = version1.split('.')
    const arr2 = version2.split('.')
    const length1 = arr1.length
    const length2 = arr2.length
    const minlength = Math.min(length1, length2)
    let i = 0
    for (i; i < minlength; i++) {
        let a = parseInt(arr1[i])
        let b = parseInt(arr2[i])
        if (a > b) {
            return 1
        } else if (a < b) {
            return -1
        }
    }
    if (length1 > length2) {
        for (let j = i; j < length1; j++) {
            if (parseInt(arr1[j]) != 0) {
                return 1
            }
        }
        return 0
    } else if (length1 < length2) {
        for (let j = i; j < length2; j++) {
            if (parseInt(arr2[j]) != 0) {
                return -1
            }
        }
        return 0
    }
    return 0
}


export function deepCopy(source, hash = new WeakMap()) {
    if (typeof source !== 'object' || source === null || source.$$typeof) {
        return source;
    }
    if (hash.has(source)) {
        return hash.get(source);
    }
    const target = Array.isArray(source) ? [] : {};
    Reflect.ownKeys(source).forEach(key => {
        const val = source[key];
        if (typeof val === 'object' && val != null) {
            target[key] = deepCopy(val, hash);
        } else {
            target[key] = val;
        }
    })
    return target;
}

export const previewImageOpen = (url) => {
    const contianer = document.querySelector('.common-preview-image-container')
    const img = document.querySelector('.common-preview-image-container img')
    contianer.classList.add('common-preview-image-container-show')
    img.src = url
}

export const previewImage = (e) => {
    let { target } = e
    // 确定点的是图片
    const tagName = target.tagName.toLowerCase()
    if (tagName === 'img' && findParentElement(target, 'report-rich-text-container')) {
        e.stopPropagation()
        previewImageOpen(target.src || target.currentSrc)
    }
}

export const findParentElement = (origin, target) => {
    while (origin) {
        const { className } = origin
        if (className.includes(target)) {
            return true
        }
        origin = origin.parentElement
    }
    return false
}

export const copyText = (value) => {
    // 创建输入框
    var textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    // 隐藏此输入框
    textarea.style.position = 'absolute';
    textarea.style.clip = 'rect(0 0 0 0)';
    // 赋值
    textarea.value = value;
    // 选中
    textarea.select();
    // 复制
    document.execCommand('copy', true);
    textarea.remove()
    message.success('复制成功')
}


export const formatHour = (seconds) => {
    // 计算小时、分钟和秒数
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    // 根据小时数判断格式化输出
    let formatted;
    if (hours > 0) {
        formatted = `${hours}:${minutes.toFixed(0).padStart(2, '0')}:${remainingSeconds.toFixed(0).padStart(2, '0')}`;
    } else {
        formatted = `${minutes}:${remainingSeconds.toFixed(0).padStart(2, '0')}`;
    }
    if (seconds < 0) {
        return '00:00'
    }
    return formatted
}


export const codeElementWidth = {
    // 小写
    "a": 6, "b": 7, "c": 6, "d": 7, "e": 6, "f": 4, "g": 7, "h": 7, "i": 3, "j": 3, "k": 6, "l": 3, "m": 10, "n": 7, "o": 7, "p": 7, "q": 7, "r": 4, "s": 5, "t": 4, "u": 7, "v": 6, "w": 9, "x": 6, "y": 6, "z": 5,
    // 大写
    "A": 8, "B": 7, "C": 7, "D": 8, "E": 6, "F": 6, "G": 8, "H": 9, "I": 3, "J": 4, "K": 7, "L": 6, "M": 11, "N": 9, "O": 9, "P": 7, "Q": 9, "R": 7, "S": 6, "T": 6, "U": 8, "V": 7, "W": 11, "X": 7, "Y": 7, "Z": 7,
    " ": 3,
    // 字符
    ".": 3, "@": 11, "（": 12, "）": 12, "(": 4, ")": 4, "：": 12, ":": 3, "_": 5, "-": 5, "/": 5, "$": 6, "%": 10, ",": 3, "|": 3, "~": 8, ";": 3, "'": 3, "\\": 5, "+": 8, "=": 8, ">": 8, '"': 5, "[": 4, "]": 4, "<": 8, "‘": 3, "’": 3, "“": 5, "”": 5, "*": 5, "&": 10, "{": 4, "}": 4, "^": 8,
    // 数字
    "0": 6, "1": 6, "2": 6, "3": 6, "4": 6, "5": 6, "6": 6, "7": 6, "8": 6, "9": 6
}

export const computeCodeElementWidth = (str) => {
    let width = 0
    for (var i = 0; i < str.length; i++) {
        const item = str[i]
        width += codeElementWidth[item] || 2
    }
    return width
}

export function formatTime(timeInSeconds) {
    const secondsInMinute = 60;
    const secondsInHour = secondsInMinute * 60;
    const secondsInDay = secondsInHour * 24;

    let days = Math.floor(timeInSeconds / secondsInDay);
    let hours = Math.floor((timeInSeconds % secondsInDay) / secondsInHour);
    let minutes = Math.floor((timeInSeconds % secondsInHour) / secondsInMinute);
    let seconds = timeInSeconds % secondsInMinute;

    let formattedTime = '';
    if (timeInSeconds < secondsInMinute) {
        formattedTime = `${timeInSeconds}秒`;
    } else if (timeInSeconds < secondsInHour) {
        formattedTime = `${minutes}分${seconds}秒`;
    } else if (timeInSeconds < secondsInDay) {
        formattedTime = `${hours}小时${minutes}分${seconds}秒`;
    } else {
        formattedTime = `${days}天${hours}小时${minutes}分${seconds}秒`;
    }

    return formattedTime;
}

export const useDebounce = (fun, wait, options) => {
    const myRef = useRef();
    if (!myRef.current) {
        myRef.current = debounce(fun, wait, options);
    }
    return myRef.current;
};

export const downloadImage = (canvas, type, name) => {
    const downloadLink = document.createElement('a');
    downloadLink.href = canvas.toDataURL(type);
    downloadLink.download = `${name}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}


export const removeUrlSearchField = (removeList) => {
    const query = Object.fromEntries(new URLSearchParams(window.location.search).entries());

    // 删除c字段
    removeList.forEach(key => {
        delete query[key]
    })

    const newSearch = new URLSearchParams(query).toString();
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${newSearch}${window.location.hash}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
}

export const replaceURL = (params, newPath) => {
    // const params = { name: 'John', age: 30, gender: 'male' };
    const url = new URL(window.location.href);

    // 将对象的值拼接到URL的search参数中
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }
    const newUrl = url.toString();
    window.history.replaceState({ path: newPath || newUrl }, '', newPath || newUrl);
}

export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export const formatHourText = (seconds) => {
    // 计算小时、分钟和秒数
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    // 根据小时数判断格式化输出
    let formatted;
    if (hours > 0) {
        formatted = `${hours}小时${minutes.toFixed(0).padStart(2, '0')}分${remainingSeconds.toFixed(0).padStart(2, '0')}秒`;
    } else {
        formatted = `${minutes}分${remainingSeconds.toFixed(0).padStart(2, '0')}秒`;
    }
    return formatted
}

export async function batchDownloadFiles(urls, callback) {
    urls.forEach((item, index) => {
        setTimeout(() => {
            downloadFile(item.url, item.name, callback);
        }, 500 * index)
    })
}


async function downloadFile(url, name, callback) {
    const a = document.createElement('a');
    a.href = url;
    a.download = name || url.substring(url.lastIndexOf('/') + 1);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    callback && callback()
    // await new Promise((resolve) => setTimeout(resolve, 1000)); // 等待1秒钟，确保下载完成
    document.body.removeChild(a);
}

export const isUserAuth = (currentUser, userId) => {
    return currentUser.is_superuser || currentUser.username === userId
}


// 驼峰转下划线
export function camelToSnake(str = '') {
    return str.replace(/[A-Z]/g, match => '_' + match.toLowerCase());
}

// 中划线转驼峰
export function snakeToCamel(str = '') {
    return str.replace(/-([a-z])/g, (match, group1) => group1.toUpperCase());
}

// 是否是链接地址
export function judgeLink(v) {
    const regx = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
    return regx.test(v)
}

export function scrollToHorizontalPosition(element, targetPosition, duration, type) {
    var start = null;
    var currentPosition = element.scrollLeft;
    var change = targetPosition - currentPosition;
    var increment = 20; // 20ms 时间间隔  

    function animateScroll() {
        // 获取当前时间  
        var now = new Date().getTime();
        start = start || now;

        // 计算经过的时间  
        var time = now - start;

        // 计算当前应该滚动的位置  
        var percent = Math.min(time / duration, 1);
        var position = currentPosition + change * percent;

        // 设置滚动位置
        if (type === 'x') {
            element.scrollLeft = position;
        } else {
            element.scrollTop = position;
        }


        // 如果动画未完成，则继续请求下一帧  
        if (time < duration) {
            requestAnimationFrame(animateScroll);
        }
    }

    // 开始动画  
    animateScroll();
}


export function scrollToPosition(element, x, y, duration = 500) {
    const startX = element.scrollLeft;
    const startY = element.scrollTop;
    const distanceX = x - startX;
    const distanceY = y - startY;
    const startTime = performance.now();

    function step() {
        const elapsed = performance.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
            element.scrollLeft = startX + distanceX * Math.easeInOutQuad(progress);
            element.scrollTop = startY + distanceY * Math.easeInOutQuad(progress);
            requestAnimationFrame(step);
        } else {
            element.scrollLeft = x;
            element.scrollTop = y;
        }
    }

    // 添加一个缓动函数
    Math.easeInOutQuad = function (t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    step();
}