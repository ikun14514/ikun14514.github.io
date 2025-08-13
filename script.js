// 全局变量
let words = [];
let currentIndex = 0;
let usedIndices = [];
let funMode = false;
let firstSquish = true;
let settings = {
    book: 'list.json',
    progress: 0,
    funMode: false,
    noRepeat: false,
    fontSize: 40,
    theme: 'default',
    autoPlay: false,
    playInterval: 3000,
    shuffle: false,
    reverse: false
};

// 获取DOM元素的函数
function getElements() {
    return {
        wordInput: document.getElementById('word-input'),
        lineNumbers: document.getElementById('line-numbers'),
        wordDisplay: document.getElementById('word-display'),
        wordCounter: document.getElementById('word-counter'),
        loadWordsBtn: document.getElementById('load-words'),
        prevWordBtn: document.getElementById('prev-word'),
        nextWordBtn: document.getElementById('next-word'),
        randomWordBtn: document.getElementById('random-word'),
        jumpToInput: document.getElementById('jump-to'),
        jumpBtn: document.getElementById('jump-btn'),
        noRepeatCheckbox: document.getElementById('no-repeat'),
        searchWordInput: document.getElementById('search-word'),
        searchBtn: document.getElementById('search-btn'),
        pasteWordsBtn: document.getElementById('paste-words'),
        funModeCheckbox: document.getElementById('fun-mode'),
        dictWordInput: document.getElementById('dict-word'),
        lookupBtn: document.getElementById('lookup-btn'),
        dictResult: document.getElementById('dict-result')
    };
}

// URL参数处理
function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const options = {};
    
    // 解析 options 参数
    const optionsParam = params.get('options');
    if (optionsParam) {
        try {
            const decodedOptions = decodeURIComponent(optionsParam);
            const parsed = JSON.parse(decodedOptions);
            Object.assign(options, parsed);
        } catch (e) {
            console.warn('解析URL参数失败:', e);
        }
    }
    
    // 兼容旧格式参数
    if (params.get('book')) options.book = params.get('book');
    if (params.get('progress')) options.progress = parseInt(params.get('progress')) || 0;
    if (params.get('funMode')) options.funMode = params.get('funMode') === 'true';
    if (params.get('noRepeat')) options.noRepeat = params.get('noRepeat') === 'true';
    if (params.get('fontSize')) options.fontSize = parseInt(params.get('fontSize')) || 40;
    if (params.get('theme')) options.theme = params.get('theme');
    if (params.get('autoPlay')) options.autoPlay = params.get('autoPlay') === 'true';
    if (params.get('playInterval')) options.playInterval = parseInt(params.get('playInterval')) || 3000;
    if (params.get('shuffle')) options.shuffle = params.get('shuffle') === 'true';
    if (params.get('reverse')) options.reverse = params.get('reverse') === 'true';
    
    return options;
}

function updateUrlParams() {
    const params = new URLSearchParams();
    const options = {
        book: settings.book,
        progress: currentIndex,
        funMode: funMode,
        noRepeat: settings.noRepeat,
        fontSize: settings.fontSize,
        theme: settings.theme,
        autoPlay: settings.autoPlay,
        playInterval: settings.playInterval,
        shuffle: settings.shuffle,
        reverse: settings.reverse,
        usedIndices: usedIndices,
        words: words.slice(0, 50) // 限制保存的单词数量
    };
    
    params.set('options', encodeURIComponent(JSON.stringify(options)));
    
    // 更新URL而不刷新页面
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
}

// 应用URL参数
function applyUrlParams() {
    const params = parseUrlParams();
    
    // 合并设置
    Object.assign(settings, params);
    
    // 应用设置
    funMode = settings.funMode;
    currentIndex = Math.max(0, Math.min(settings.progress, words.length - 1));
    
    if (settings.usedIndices && Array.isArray(settings.usedIndices)) {
        usedIndices = settings.usedIndices;
    }
    
    // 恢复单词列表
    if (settings.words && settings.words.length > 0) {
        words = settings.words;
    }
    
    // 更新UI
    const elements = getElements();
    if (elements.funModeCheckbox) elements.funModeCheckbox.checked = funMode;
    if (elements.noRepeatCheckbox) elements.noRepeatCheckbox.checked = settings.noRepeat;
    
    // 自动加载词书
    if (settings.book && settings.book !== 'list.json') {
        loadCustomBook(settings.book);
    } else if (words.length === 0) {
        loadVocabularyBook().then(list => {
            if (list.length > 0) {
                words = list;
                applyProgress();
            }
        });
    } else {
        applyProgress();
    }
}

function applyProgress() {
    if (words.length > 0) {
        currentIndex = Math.max(0, Math.min(settings.progress, words.length - 1));
        displayCurrentWord();
        updateWordCounter();
        updateLineNumbers();
    }
}

// 加载自定义词书
async function loadCustomBook(bookUrl) {
    try {
        const response = await fetch(bookUrl);
        if (!response.ok) throw new Error('无法加载词书');
        
        const data = await response.json();
        const newWords = data.list || data.words || data;
        
        if (Array.isArray(newWords)) {
            words = newWords;
            currentIndex = 0;
            usedIndices = [];
            
            const elements = getElements();
            if (elements.wordInput) {
                elements.wordInput.value = words.join('\n');
                updateLineNumbers();
            }
            
            displayCurrentWord();
            updateWordCounter();
            showNotification(`已加载 ${words.length} 个单词`);
            
            // 应用进度
            applyProgress();
        }
    } catch (error) {
        showNotification('加载词书失败: ' + error.message, 'error');
    }
}

// 生成分享链接
function generateShareLink() {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    
    const options = {
        book: settings.book,
        progress: currentIndex,
        funMode: funMode,
        noRepeat: settings.noRepeat,
        fontSize: settings.fontSize,
        theme: settings.theme,
        autoPlay: settings.autoPlay,
        playInterval: settings.playInterval,
        shuffle: settings.shuffle,
        reverse: settings.reverse,
        usedIndices: usedIndices.slice(-20), // 只保存最近20个
        words: words.slice(0, 30) // 限制保存的单词数量
    };
    
    params.set('options', encodeURIComponent(JSON.stringify(options)));
    return `${baseUrl}?${params.toString()}`;
}

// 显示分享对话框
function showShareDialog() {
    const shareUrl = generateShareLink();
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 1001;
        max-width: 500px;
        width: 90%;
    `;
    
    dialog.innerHTML = `
        <h3>分享当前进度</h3>
        <p>复制以下链接分享你的学习进度：</p>
        <textarea style="width: 100%; height: 100px; margin: 10px 0; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">${shareUrl}</textarea>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 15px;">
            <button onclick="this.parentElement.parentElement.parentElement.remove()" style="padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;">关闭</button>
            <button onclick="navigator.clipboard.writeText('${shareUrl}'); this.textContent='已复制'; setTimeout(() => this.textContent='复制', 2000)" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">复制</button>
            <button onclick="addToFavorites('${shareUrl}')" style="padding: 8px 16px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer;">收藏</button>
        </div>
    `;
    
    // 添加遮罩层
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
    `;
    overlay.onclick = () => {
        dialog.remove();
        overlay.remove();
    };
    
    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
    
    // 自动选中文本
    const textarea = dialog.querySelector('textarea');
    textarea.select();
}

// 添加到收藏夹
function addToFavorites(url) {
    if (window.sidebar && window.sidebar.addPanel) {
        // Firefox
        window.sidebar.addPanel(document.title, url, '');
    } else if (window.external && ('AddFavorite' in window.external)) {
        // IE
        window.external.AddFavorite(url, document.title);
    } else if (window.opera && window.print) {
        // Opera
        const elem = document.createElement('a');
        elem.setAttribute('href', url);
        elem.setAttribute('title', document.title);
        elem.setAttribute('rel', 'sidebar');
        elem.click();
    } else {
        // 其他浏览器 - 显示提示
        showBookmarkPrompt(url);
    }
}

// 显示收藏提示
function showBookmarkPrompt() {
    const modal = document.createElement('div');
    modal.id = 'bookmark-modal';
    modal.innerHTML = `
        <div class="bookmark-modal-content">
            <div class="bookmark-modal-header">
                <h3>添加到收藏夹</h3>
                <button class="close-btn" onclick="closeBookmarkModal()">&times;</button>
            </div>
            <div class="bookmark-modal-body">
                <p>当前学习进度已保存到URL，是否添加到浏览器收藏夹？</p>
                <div class="bookmark-url">${window.location.href}</div>
                <div class="bookmark-buttons">
                    <button onclick="addToFavorites()" class="bookmark-btn primary">添加到收藏夹</button>
                    <button onclick="closeBookmarkModal()" class="bookmark-btn secondary">稍后手动收藏</button>
                </div>
            </div>
        </div>
    `;
    
    // 确保遮罩层也被正确移除
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBookmarkModal();
        }
    });
    
    document.body.appendChild(modal);
    
    // 添加遮罩层样式
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
            align-items: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
}

function closeBookmarkModal() {
    const modal = document.getElementById('bookmark-modal');
    if (modal) {
        modal.remove();
    }
}

function showExitReminder() {
    const reminder = document.createElement('div');
    reminder.id = 'exit-reminder';
    reminder.innerHTML = `
        <div class="exit-reminder-content">
            <div class="exit-reminder-header">
                <span>⚠️ 即将离开页面</span>
                <button class="close-btn" onclick="closeExitReminder()">&times;</button>
            </div>
            <div class="exit-reminder-body">
                <p>是否保存当前学习进度？</p>
                <div class="exit-reminder-buttons">
                    <button onclick="saveAndShare()" class="exit-btn primary">保存并分享</button>
                    <button onclick="saveToUrl()" class="exit-btn secondary">仅保存到URL</button>
                    <button onclick="closeExitReminder()" class="exit-btn tertiary">不保存</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(reminder);
    
    // 设置样式
    reminder.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 0;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10001;
        max-width: 300px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    // 5秒后自动关闭
    setTimeout(() => {
        closeExitReminder();
    }, 5000);
}

function closeExitReminder() {
    const reminder = document.getElementById('exit-reminder');
    if (reminder) {
        reminder.remove();
    }
}

// 修复URL参数处理逻辑
function parseUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const optionsParam = urlParams.get('options');
    
    if (optionsParam) {
        try {
            const options = JSON.parse(decodeURIComponent(optionsParam));
            
            // 优先处理book参数，如果存在book则不使用words
            if (options.book) {
                settings.book = options.book;
                settings.progress = options.progress || 0;
                settings.funMode = options.funMode || false;
                settings.noRepeat = options.noRepeat || false;
                settings.fontSize = options.fontSize || 40;
                settings.theme = options.theme || 'default';
                settings.autoPlay = options.autoPlay || false;
                settings.playInterval = options.playInterval || 3000;
                settings.shuffle = options.shuffle || false;
                settings.reverse = options.reverse || false;
                // 不加载words参数，直接加载词书文件
                return true;
            } else if (options.words && Array.isArray(options.words)) {
                // 只有没有book参数时才使用words
                words = options.words.slice(0, 50); // 限制最多50个单词
                currentIndex = Math.min(options.progress || 0, words.length - 1);
                settings.funMode = options.funMode || false;
                settings.noRepeat = options.noRepeat || false;
                settings.fontSize = options.fontSize || 40;
                settings.theme = options.theme || 'default';
                settings.autoPlay = options.autoPlay || false;
                settings.playInterval = options.playInterval || 3000;
                settings.shuffle = options.shuffle || false;
                settings.reverse = options.reverse || false;
                return true;
            }
        } catch (e) {
            console.error('解析URL参数失败:', e);
        }
    }
    return false;
}

// 确保applyUrlParams正确处理book参数
function applyUrlParams() {
    if (parseUrlParams()) {
        if (settings.book) {
            // 有book参数时，加载词书文件
            loadCustomBook(settings.book).then(() => {
                if (words.length > 0) {
                    currentIndex = Math.min(settings.progress || 0, words.length - 1);
                    updateDisplay();
                }
            });
        } else {
            // 没有book参数时，使用words参数
            updateDisplay();
        }
    }
}

// 更新updateUrlParams确保正确处理book参数
function updateUrlParams() {
    const options = {
        book: settings.book || undefined, // 如果设置了book，优先使用book
        progress: currentIndex,
        funMode: settings.funMode,
        noRepeat: settings.noRepeat,
        fontSize: settings.fontSize,
        theme: settings.theme,
        autoPlay: settings.autoPlay,
        playInterval: settings.playInterval,
        shuffle: settings.shuffle,
        reverse: settings.reverse
    };
    
    // 如果当前使用的是自定义words而不是book，才添加words参数
    if (!settings.book && words.length > 0) {
        options.words = words.slice(0, 50);
    }
    
    // 移除undefined的字段
    Object.keys(options).forEach(key => {
        if (options[key] === undefined) {
            delete options[key];
        }
    });
    
    const url = new URL(window.location);
    url.searchParams.set('options', encodeURIComponent(JSON.stringify(options)));
    window.history.replaceState({}, '', url);
}

// 修复分享对话框的关闭功能
function showShareDialog() {
    const shareUrl = window.location.href;
    
    const modal = document.createElement('div');
    modal.id = 'share-modal';
    modal.innerHTML = `
        <div class="share-modal-content">
            <div class="share-modal-header">
                <h3>分享学习进度</h3>
                <button class="close-btn" onclick="closeShareModal()">&times;</button>
            </div>
            <div class="share-modal-body">
                <p>您的学习进度已保存到以下链接：</p>
                <textarea readonly class="share-url">${shareUrl}</textarea>
                <div class="share-buttons">
                    <button onclick="copyShareUrl()" class="share-btn primary">复制链接</button>
                    <button onclick="addToFavorites()" class="share-btn secondary">添加到收藏夹</button>
                    <button onclick="closeShareModal()" class="share-btn tertiary">关闭</button>
                </div>
            </div>
        </div>
    `;
    
    // 添加遮罩层关闭功能
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeShareModal();
        }
    });
    
    document.body.appendChild(modal);
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
}

function closeShareModal() {
    const modal = document.getElementById('share-modal');
    if (modal) {
        modal.remove();
    }
}

function copyShareUrl() {
    const textarea = document.querySelector('.share-url');
    textarea.select();
    document.execCommand('copy');
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '已复制！';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
}

// 确保所有关闭函数都正确移除遮罩层
window.closeBookmarkModal = closeBookmarkModal;
window.closeExitReminder = closeExitReminder;
window.closeShareModal = closeShareModal;

function displayCurrentWord() {
    const elements = getElements();
    if (!elements.wordDisplay || words.length === 0) return;
    
    let displayIndex = currentIndex;
    if (settings.reverse) {
        displayIndex = words.length - 1 - currentIndex;
    }
    
    if (settings.shuffle) {
        // 随机模式下使用不同逻辑
        displayIndex = Math.floor(Math.random() * words.length);
    }
    
    const wordToDisplay = words[displayIndex] || words[currentIndex];
    
    if (funMode) {
        playFunModeAnimation(() => {
            elements.wordDisplay.textContent = wordToDisplay;
            adjustFontSize(elements.wordDisplay, wordToDisplay);
        });
    } else {
        elements.wordDisplay.textContent = wordToDisplay;
        adjustFontSize(elements.wordDisplay, wordToDisplay);
    }
    
    // 自动播放
    if (settings.autoPlay) {
        setTimeout(() => {
            if (currentIndex < words.length - 1) {
                currentIndex++;
                displayCurrentWord();
                updateWordCounter();
                updateUrlParams();
            }
        }, settings.playInterval);
    }
}

// 显示通知
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 加载单词
function loadWords() {
    const elements = getElements();
    if (!elements.wordInput) return;
    
    const input = elements.wordInput.value.trim();
    if (input === '') {
        alert('请输入单词！');
        return;
    }

    let allWords = input.split('\n')
        .map(word => word.trim())
        .filter(word => word !== '');

    if (allWords.length === 0) {
        alert('没有找到有效的单词！');
        return;
    }

    words = allWords;
    currentIndex = 0;
    usedIndices = [];
    displayCurrentWord();
    updateWordCounter();
    updateUrlParams();
}

// 趣味模式相关函数
function getLocalAudioList() {
    return [
        '/audio/cn/gululu.mp3',
        '/audio/cn/gururu.mp3',
        '/audio/cn/要坏掉了.mp3',
        '/audio/cn/转圈圈.mp3',
        '/audio/cn/转圈圈咯.mp3'
    ];
}

function getRandomAudioUrl() {
    const audioList = getLocalAudioList();
    const randomIndex = Math.floor(Math.random() * audioList.length);
    return audioList[randomIndex];
}

function playKuru() {
    let audioUrl;
    if (firstSquish) {
        firstSquish = false;
        audioUrl = getLocalAudioList()[0];
    } else {
        audioUrl = getRandomAudioUrl();
    }
    
    let audio = new Audio();
    audio.src = audioUrl;
    audio.play().catch(error => {
        // 音频播放失败处理
    });
    audio.addEventListener('ended', function() {
        this.remove();
    });
}

function playFunModeAnimation(callback) {
    const elements = getElements();
    if (!elements.wordDisplay || !funMode) {
        callback();
        return;
    }
    
    const animationElement = document.createElement('img');
    animationElement.src = '/黑塔转圈圈.gif';
    animationElement.style.cssText = `
        position: absolute;
        height: 100%;
        width: 100%;
        object-fit: contain;
        opacity: 0;
        transform: translateX(100%) scale(0.8);
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    elements.wordDisplay.style.position = 'relative';
    elements.wordDisplay.innerHTML = '';
    elements.wordDisplay.appendChild(animationElement);

    animationElement.onload = function() {
        void animationElement.offsetWidth;
        animationElement.style.opacity = '1';
        animationElement.style.transform = 'translateX(0) scale(1)';
        playKuru();

        setTimeout(() => {
            animationElement.style.transition = 'all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)';
            animationElement.style.opacity = '0';
            animationElement.style.transform = 'translateX(-100%) scale(0.8)';

            setTimeout(() => {
                elements.wordDisplay.innerHTML = '';
                callback();
            }, 800);
        }, 1000);
    };

    animationElement.onerror = function() {
        elements.wordDisplay.innerHTML = '';
        callback();
    };
}

// 查词功能
function lookupWord(word) {
    const elements = getElements();
    if (!elements.dictResult) return;
    
    elements.dictResult.innerHTML = '<div class="loading">正在查询...</div>';
    const apiUrl = `https://cdn.jsdelivr.net/gh/lyc8503/baicizhan-word-meaning-API/data/words/${word}.json`;
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应错误');
            }
            return response.json();
        })
        .then(data => {
            displayWordInfo(data);
        })
        .catch(error => {
            elements.dictResult.innerHTML = `<div class="error">查询失败: ${error.message}</div>`;
        });
}

function displayWordInfo(data) {
    const elements = getElements();
    if (!elements.dictResult || !data || !data.word) {
        elements.dictResult.innerHTML = '<div class="error">未找到该单词的信息</div>';
        return;
    }

    let html = `
        <div class="word-info">
            <span class="word">${data.word}</span>
            ${data.accent ? `<span class="accent">${data.accent}</span>` : ''}
        </div>
    `;

    // 中文意思
    if (data.mean_cn) {
        html += `<div class="mean_cn"><strong>中文释义：</strong>${data.mean_cn}</div>`;
    }

    // 英文解释
    if (data.mean_en) {
        html += `<div class="mean_en"><strong>英文释义：</strong>${data.mean_en}</div>`;
    }

    // 英文例句和翻译
    if (data.sentence) {
        html += `
            <div class="sentence-section">
                <div class="sentence"><strong>例句：</strong>${data.sentence}</div>
                ${data.sentence_trans ? `<div class="sentence_trans"><strong>翻译：</strong>${data.sentence_trans}</div>` : ''}
                ${data.sentence_phrase ? `<div class="sentence_phrase"><strong>短语：</strong>${data.sentence_phrase}</div>` : ''}
            </div>
        `;
    }

    // 单词词源
    if (data.word_etyma) {
        html += `<div class="word_etyma"><strong>词源：</strong>${data.word_etyma}</div>`;
    }

    // 拼写练习数据
    if (data.cloze_data && data.cloze_data.syllable) {
        const cloze = data.cloze_data;
        html += `
            <div class="cloze-section">
                <div class="syllable"><strong>音节划分：</strong>${cloze.syllable}</div>
                <div class="cloze"><strong>拼写练习：</strong>${cloze.cloze}</div>
                ${cloze.options ? `<div class="options"><strong>选项：</strong>${cloze.options.join(' / ')}</div>` : ''}
                ${cloze.tips && cloze.tips.length > 0 ? `
                    <div class="tips">
                        <strong>提示：</strong>
                        ${cloze.tips.map(tip => `<div class="tip">${tip[0]} - ${tip[1]}</div>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    elements.dictResult.innerHTML = html;
}

// 初始化
    document.addEventListener('DOMContentLoaded', function() {
        const elements = getElements();
        
        // 设置背景
        document.body.style.backgroundImage = 'url(https://tc.z.wiki/autoupload/f/7sC8pZ0XsyqK72FYJjIW3jK4ecaMZdOc36Uq6NWA8WKyl5f0KlZfm6UsKj-HyTuv/20250803/tL5S/1200X656/background1.png)';
        
        // 初始化事件监听
        if (elements.dictWordInput && elements.lookupBtn) {
            elements.lookupBtn.addEventListener('click', () => {
                const word = elements.dictWordInput.value.trim();
                if (word) lookupWord(word);
            });
            elements.dictWordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') elements.lookupBtn.click();
            });
        }

        // 添加加载词书按钮
        const loadVocabularyBtn = document.createElement('button');
        loadVocabularyBtn.id = 'load-vocabulary';
        loadVocabularyBtn.textContent = '加载词书';
        loadVocabularyBtn.title = '从list.json加载词书';
        
        const loadWordsBtn = document.getElementById('load-words');
        if (loadWordsBtn) {
            loadWordsBtn.parentNode.insertBefore(loadVocabularyBtn, loadWordsBtn.nextSibling);
        }

        // 添加分享按钮
        const shareBtn = document.createElement('button');
        shareBtn.id = 'share-progress';
        shareBtn.textContent = '分享进度';
        shareBtn.title = '生成分享链接';
        shareBtn.style.cssText = `
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-left: 10px;
        `;
        
        if (loadVocabularyBtn) {
            loadVocabularyBtn.parentNode.insertBefore(shareBtn, loadVocabularyBtn.nextSibling);
        }

        // 分享按钮事件
        shareBtn.addEventListener('click', showShareDialog);

        // 加载词书事件
        loadVocabularyBtn.addEventListener('click', async function() {
            loadVocabularyBtn.textContent = '加载中...';
            loadVocabularyBtn.disabled = true;
            
            try {
                const vocabularyList = await loadVocabularyBook();
                if (vocabularyList.length > 0) {
                    words = vocabularyList;
                    currentIndex = 0;
                    usedIndices = [];
                    
                    if (elements.wordInput) {
                        elements.wordInput.value = words.join('\n');
                        updateLineNumbers();
                    }
                    displayCurrentWord();
                    updateWordCounter();
                    
                    showNotification(`成功加载 ${words.length} 个单词`);
                } else {
                    showNotification('词书为空或加载失败', 'error');
                }
            } catch (error) {
                showNotification('加载词书失败: ' + error.message, 'error');
            } finally {
                loadVocabularyBtn.textContent = '加载词书';
                loadVocabularyBtn.disabled = false;
            }
        });

        // 其他事件监听
        if (elements.loadWordsBtn) elements.loadWordsBtn.addEventListener('click', loadWords);
        if (elements.prevWordBtn) elements.prevWordBtn.addEventListener('click', () => {
            if (words.length === 0) return;
            currentIndex = (currentIndex - 1 + words.length) % words.length;
            displayCurrentWord();
            updateWordCounter();
            updateUrlParams();
        });
        
        if (elements.nextWordBtn) elements.nextWordBtn.addEventListener('click', () => {
            if (words.length === 0) return;
            currentIndex = (currentIndex + 1) % words.length;
            displayCurrentWord();
            updateWordCounter();
            updateUrlParams();
        });
        
        if (elements.randomWordBtn) elements.randomWordBtn.addEventListener('click', () => {
            if (words.length === 0) return;
            
            if (elements.noRepeatCheckbox && elements.noRepeatCheckbox.checked) {
                if (usedIndices.length >= words.length) {
                    alert('所有单词都已抽选过！');
                    return;
                }
                let randomIndex;
                do {
                    randomIndex = Math.floor(Math.random() * words.length);
                } while (usedIndices.includes(randomIndex));
                usedIndices.push(randomIndex);
                currentIndex = randomIndex;
            } else {
                const randomIndex = Math.floor(Math.random() * words.length);
                currentIndex = randomIndex;
            }
            
            displayCurrentWord();
            updateWordCounter();
            updateUrlParams();
        });

        if (elements.funModeCheckbox) {
            elements.funModeCheckbox.addEventListener('change', function() {
                funMode = this.checked;
                updateUrlParams();
            });
        }

        if (elements.noRepeatCheckbox) {
            elements.noRepeatCheckbox.addEventListener('change', function() {
                settings.noRepeat = this.checked;
                updateUrlParams();
            });
        }

        if (elements.pasteWordsBtn) {
            elements.pasteWordsBtn.addEventListener('click', async function() {
                try {
                    const text = await navigator.clipboard.readText();
                    if (!text) {
                        alert('剪贴板为空！');
                        return;
                    }
                    
                    let formattedText = text.replace(/[^a-zA-Z0-9\s.,!?'-]/g, ' ');
                    formattedText = formattedText.replace(/\s+/g, '\n');
                    formattedText = formattedText.trim();
                    
                    if (elements.wordInput) {
                        elements.wordInput.value = formattedText;
                        updateLineNumbers();
                    }
                    loadWords();
                } catch (err) {
                    alert('粘贴失败: ' + err.message);
                }
            });
        }

        // 初始化
        updateLineNumbers();
        if (elements.wordInput) {
            elements.wordInput.addEventListener('input', updateLineNumbers);
            elements.wordInput.addEventListener('scroll', () => {
                const elements = getElements();
                if (elements.lineNumbers) {
                    elements.lineNumbers.scrollTop = elements.wordInput.scrollTop;
                }
            });
        }

        // 设置退出侦测
        setupExitDetection();

        // 应用URL参数
        applyUrlParams();

        // 启动自动保存
        startAutoSave();

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            #load-vocabulary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-left: 10px;
            }
            #load-vocabulary:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            #load-vocabulary:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            #share-progress {
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-left: 10px;
            }
            #share-progress:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            /* 查词结果样式 */
            .word-info {
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            .word {
                font-size: 24px;
                font-weight: bold;
                color: #333;
                margin-right: 10px;
            }
            .accent {
                font-size: 18px;
                color: #666;
                font-family: 'Courier New', monospace;
            }
            .mean_cn, .mean_en {
                margin: 10px 0;
                line-height: 1.6;
            }
            .mean_cn {
                color: #d9534f;
                font-size: 16px;
            }
            .mean_en {
                color: #5cb85c;
                font-size: 15px;
            }
            .sentence-section {
                margin: 15px 0;
                padding: 10px;
                background-color: #f9f9f9;
                border-left: 4px solid #5bc0de;
                border-radius: 4px;
            }
            .sentence {
                color: #333;
                font-style: italic;
                margin-bottom: 5px;
            }
            .sentence_trans {
                color: #666;
                font-size: 14px;
            }
            .sentence_phrase {
                color: #8a6d3b;
                font-size: 14px;
                margin-top: 5px;
            }
            .word_etyma {
                margin: 10px 0;
                color: #8a6d3b;
                font-size: 14px;
            }
            .cloze-section {
                margin: 15px 0;
                padding: 10px;
                background-color: #f0f8ff;
                border: 1px solid #bce8f1;
                border-radius: 4px;
            }
            .syllable {
                color: #31708f;
                margin-bottom: 5px;
            }
            .cloze {
                color: #333;
                font-family: 'Courier New', monospace;
                margin-bottom: 5px;
            }
            .options {
                color: #31708f;
                margin-bottom: 5px;
            }
            .tips {
                margin-top: 10px;
            }
            .tip {
                color: #8a6d3b;
                font-size: 13px;
                margin: 2px 0;
            }
            .loading {
                text-align: center;
                color: #666;
                padding: 20px;
            }
            .error {
                color: #d9534f;
                padding: 10px;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    });