// 全局变量
let words = [];
let currentIndex = 0;
let usedIndices = [];
let funMode = false;
let firstSquish = true;
let settings = {
    book: './list.json',
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
        usedIndices: usedIndices
    };
    
    // 只有在没有book参数时才保存words
    if (!settings.book || settings.book === 'list.json') {
        options.words = words.slice(0, 50);
    }
    
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
    if (settings.words && settings.words.length > 0 && !settings.book) {
        words = settings.words;
    }
    
    // 更新UI
    const elements = getElements();
    if (elements.funModeCheckbox) elements.funModeCheckbox.checked = funMode;
    if (elements.noRepeatCheckbox) elements.noRepeatCheckbox.checked = settings.noRepeat;
    
    // 自动加载词书
    if (settings.book && settings.book !== 'list.json') {
        loadCustomBook(settings.book);
    } else if (settings.book === 'list.json' || !settings.book) {
        loadVocabularyBook().then(list => {
            if (list.length > 0) {
                words = list;
                applyProgress();
            }
        });
    } else if (settings.words && settings.words.length > 0) {
        words = settings.words;
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
    dialog.id = 'share-modal';
    dialog.style.cssText = `
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
    
    dialog.innerHTML = `
        <div class="share-modal-content" style="
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 90%;
            position: relative;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #333;">分享学习进度</h3>
                <button onclick="closeShareModal()" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #999;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                ">&times;</button>
            </div>
            <div style="margin-bottom: 20px;">
                <p style="margin-bottom: 10px; color: #666;">您的学习进度已保存到以下链接：</p>
                <textarea readonly style="
                    width: 100%;
                    height: 100px;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 12px;
                    font-family: monospace;
                    resize: vertical;
                ">${shareUrl}</textarea>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="copyShareUrl()" style="
                    padding: 10px 20px;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">复制链接</button>
                <button onclick="addToFavorites()" style="
                    padding: 10px 20px;
                    background: #FF9800;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">添加到收藏夹</button>
                <button onclick="closeShareModal()" style="
                    padding: 10px 20px;
                    background: #f0f0f0;
                    color: #333;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">关闭</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // 自动选中文本
    const textarea = dialog.querySelector('textarea');
    textarea.select();
}

function closeShareModal() {
    const modal = document.getElementById('share-modal');
    if (modal) {
        modal.remove();
    }
}

function copyShareUrl() {
    const textarea = document.querySelector('#share-modal textarea');
    textarea.select();
    document.execCommand('copy');
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '已复制！';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
}

// 添加到收藏夹
function addToFavorites() {
    const url = generateShareLink();
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
        showBookmarkPrompt();
    }
}

// 显示收藏提示
function showBookmarkPrompt() {
    const modal = document.createElement('div');
    modal.id = 'bookmark-modal';
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
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            max-width: 400px;
            width: 90%;
            text-align: center;
        ">
            <h3 style="margin-bottom: 15px; color: #333;">添加到收藏夹</h3>
            <p style="margin-bottom: 20px; color: #666; line-height: 1.6;">
                当前学习进度已保存到URL，请按以下步骤添加到浏览器收藏夹：
            </p>
            <div style="
                background: #f5f5f5;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                font-family: monospace;
                font-size: 12px;
                word-break: break-all;
            ">
                ${window.location.href}
            </div>
            <div style="margin-bottom: 15px; color: #666; font-size: 14px;">
                <strong>快捷键：</strong><br>
                Windows: Ctrl+D<br>
                Mac: Cmd+D
            </div>
            <button onclick="closeBookmarkModal()" style="
                padding: 10px 20px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">知道了</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeBookmarkModal() {
    const modal = document.getElementById('bookmark-modal');
    if (modal) {
        modal.remove();
    }
}

// 退出提醒相关函数
function setupExitDetection() {
    // 页面可见性变化
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden' && words.length > 0) {
            updateUrlParams();
        }
    });

    // beforeunload事件
    window.addEventListener('beforeunload', function(e) {
        if (words.length > 0) {
            updateUrlParams();
        }
    });

    // 鼠标离开顶部区域时显示提醒
    let exitTimer;
    document.addEventListener('mouseleave', function(e) {
        if (e.clientY <= 0 && words.length > 0) {
            exitTimer = setTimeout(() => {
                showExitReminder();
            }, 500);
        }
    });

    document.addEventListener('mouseenter', function() {
        if (exitTimer) {
            clearTimeout(exitTimer);
        }
    });
}

function showExitReminder() {
    const reminder = document.createElement('div');
    reminder.id = 'exit-reminder';
    reminder.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10001;
        max-width: 300px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    reminder.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <span style="font-weight: bold;">⚠️ 即将离开页面</span>
            <button onclick="closeExitReminder()" style="
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: white;
                padding: 0;
                width: 25px;
                height: 25px;
            ">&times;</button>
        </div>
        <div style="margin-bottom: 15px;">
            <p style="margin: 0 0 10px 0;">是否保存当前学习进度？</p>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="saveAndShare()" style="
                padding: 8px 16px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            ">保存并分享</button>
            <button onclick="saveToUrl()" style="
                padding: 8px 16px;
                background: #FF9800;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            ">仅保存</button>
            <button onclick="closeExitReminder()" style="
                padding: 8px 16px;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            ">取消</button>
        </div>
    `;
    
    document.body.appendChild(reminder);
    
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

function saveAndShare() {
    updateUrlParams();
    showShareDialog();
    closeExitReminder();
}

function saveToUrl() {
    updateUrlParams();
    showNotification('进度已保存到URL');
    closeExitReminder();
}

// 自动保存
function startAutoSave() {
    setInterval(() => {
        if (words.length > 0) {
            updateUrlParams();
        }
    }, 5000);
}

// 加载词汇
async function loadVocabularyBook() {
    try {
        const response = await fetch('./list.json');
        if (!response.ok) throw new Error('无法加载词书');
        
        const data = await response.json();
        return data.list || data.words || data || [];
    } catch (error) {
        console.warn('加载词书失败:', error);
        return [];
    }
}

// 显示当前单词
function displayCurrentWord() {
    const elements = getElements();
    if (!elements.wordDisplay || words.length === 0) return;
    
    let displayIndex = currentIndex;
    if (settings.reverse) {
        displayIndex = words.length - 1 - currentIndex;
    }
    
    if (settings.shuffle) {
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

// 调整字体大小
function adjustFontSize(element, text) {
    const baseSize = settings.fontSize;
    const length = text.length;
    let fontSize = baseSize;
    
    if (length > 10) {
        fontSize = Math.max(20, baseSize - (length - 10) * 2);
    }
    
    element.style.fontSize = fontSize + 'px';
}

// 更新单词计数器
function updateWordCounter() {
    const elements = getElements();
    if (elements.wordCounter && words.length > 0) {
        elements.wordCounter.textContent = `${currentIndex + 1} / ${words.length}`;
    }
}

// 更新行号功能，确保同步滚动
function updateLineNumbers() {
    const elements = getElements();
    if (!elements.lineNumbers || !elements.wordInput) return;
    
    const lines = elements.wordInput.value.split('\n');
    const lineNumbersText = lines.map((_, i) => i + 1).join('\n');
    elements.lineNumbers.textContent = lineNumbersText;
    
    // 同步滚动
    elements.lineNumbers.scrollTop = elements.wordInput.scrollTop;
}

// 添加更好的行号同步滚动功能
function syncScroll() {
    const elements = getElements();
    if (!elements.lineNumbers || !elements.wordInput) return;
    
    elements.lineNumbers.scrollTop = elements.wordInput.scrollTop;
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