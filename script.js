document.addEventListener('DOMContentLoaded', function() {
    // 查词功能相关DOM元素
    const dictWordInput = document.getElementById('dict-word');
    const lookupBtn = document.getElementById('lookup-btn');
    const dictResult = document.getElementById('dict-result');

    // 查词功能
    lookupBtn.addEventListener('click', function() {
        const word = dictWordInput.value.trim();
        if (!word) {
            showDictError('请输入要查询的单词');
            return;
        }

        lookupWord(word);
    });

    // 回车查询
    dictWordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            lookupBtn.click();
        }
    });

    // 查询单词函数
    function lookupWord(word) {
        // 显示加载状态
        dictResult.innerHTML = '<div class="loading">正在查询...</div>';

        // 构建API URL
        const apiUrl = `https://cdn.jsdelivr.net/gh/lyc8503/baicizhan-word-meaning-API/data/words/${word}.json`;

        // 发送请求
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
                showDictError(`查询失败: ${error.message}`);
            });
    }

    // 显示单词信息
    function displayWordInfo(data) {
        if (!data || !data.word) {
            showDictError('未找到该单词的信息');
            return;
        }

        const html = `
            <div class="word-info">
                <span class="word">${data.word}</span>
                ${data.accent ? `<span class="accent">${data.accent}</span>` : ''}
            </div>
            ${data.mean_cn ? `<div class="mean_cn">${data.mean_cn}</div>` : ''}
            ${data.mean_en ? `<div class="mean_en">${data.mean_en}</div>` : ''}
            ${data.sentence ? `
            <div class="sentence">${data.sentence}</div>
            ${data.sentence_trans ? `<div class="sentence_trans">${data.sentence_trans}</div>` : ''}
            ` : ''}
        `;

        dictResult.innerHTML = html;
    }

    // 显示错误信息
    function showDictError(message) {
        dictResult.innerHTML = `<div class="error">${message}</div>`;
    }

    document.body.style.backgroundImage = 'url(https://tc.z.wiki/autoupload/f/7sC8pZ0XsyqK72FYJjIW3jK4ecaMZdOc36Uq6NWA8WKyl5f0KlZfm6UsKj-HyTuv/20250803/tL5S/1200X656/background1.png)';
    // 获取DOM元素
    const wordInput = document.getElementById('word-input');
    const lineNumbers = document.getElementById('line-numbers');
    const loadWordsBtn = document.getElementById('load-words');
    const wordDisplay = document.getElementById('word-display');
    const prevWordBtn = document.getElementById('prev-word');
    const nextWordBtn = document.getElementById('next-word');
    const randomWordBtn = document.getElementById('random-word');
    const wordCounter = document.getElementById('word-counter');
    const jumpToInput = document.getElementById('jump-to');
    const jumpBtn = document.getElementById('jump-btn');
    const noRepeatCheckbox = document.getElementById('no-repeat');
    const searchWordInput = document.getElementById('search-word');
    const searchBtn = document.getElementById('search-btn');
    const pasteWordsBtn = document.getElementById('paste-words');
    
    // 初始化变量
    let words = [];
    let currentIndex = 0;
    let usedIndices = [];
    let funMode = false;
    let firstSquish = true;  // 用于标识是否是第一次播放
    const funModeCheckbox = document.getElementById('fun-mode');

    // 定义所有音频文件路径
    function getLocalAudioList() {
        return [
            // 中文音频
            '/audio/cn/gululu.mp3',
            '/audio/cn/gururu.mp3',
            '/audio/cn/要坏掉了.mp3',
            '/audio/cn/转圈圈.mp3',
            '/audio/cn/转圈圈咯.mp3'
        ];
    }

    // 获取随机音频URL
    function getRandomAudioUrl() {
        const audioList = getLocalAudioList();
        const randomIndex = Math.floor(Math.random() * audioList.length);
        return audioList[randomIndex];
    }

    // 播放音频函数
    function playKuru() {
        let audioUrl;
        if (firstSquish) {
            firstSquish = false;
            audioUrl = getLocalAudioList()[0];  // 第一次播放第一个音频
        } else {
            audioUrl = getRandomAudioUrl();  // 随机播放
        }
        
        let audio = new Audio();
        audio.src = audioUrl;
        
        // 添加错误处理
        audio.onerror = function() {
            console.error('音频加载失败:', audioUrl);
        };
        
        audio.play().catch(error => {
            console.error('音频播放失败:', error);
        });
        
        audio.addEventListener('ended', function() {
            this.remove();
        });
    }

    // 趣味模式开关事件
    funModeCheckbox.addEventListener('change', function() {
        funMode = this.checked;
        console.log('Fun mode changed to:', funMode);
        // 测试GIF加载
        if (funMode) {
            console.log('趣味模式已开启，测试GIF加载...');
            playFunModeAnimation(function() {
                console.log('GIF动画测试完成');
            });
        }
    });

    // 趣味模式动画函数
    function playFunModeAnimation(callback) {
        if (!funMode) {
            callback();
            return;
        }
        
        // 创建GIF动画元素
        const animationElement = document.createElement('img');
        animationElement.src = '/黑塔转圈圈.gif';
        animationElement.style.position = 'absolute';
        animationElement.style.height = '100%';
        animationElement.style.width = '100%';
        animationElement.style.objectFit = 'contain';
        animationElement.style.opacity = '0';
        animationElement.style.transform = 'translateX(100%) scale(0.8)';
        animationElement.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        wordDisplay.style.position = 'relative';
        wordDisplay.innerHTML = '';
        wordDisplay.appendChild(animationElement);

        // 添加GIF加载状态处理
        animationElement.onload = function() {
            console.log('GIF加载成功:', this.src);
            
            // 确保GIF加载完成后再开始动画和播放音频
            // 触发重排以确保过渡效果生效
            void animationElement.offsetWidth;

            // 显示并移动动画元素
            animationElement.style.opacity = '1';
            animationElement.style.transform = 'translateX(0) scale(1)';

            // 播放音频 - 在GIF加载完成后
            playKuru();

            // 设置GIF显示时间 (1000ms)，然后再淡出
            setTimeout(() => {
                animationElement.style.transition = 'all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)';
                animationElement.style.opacity = '0';
                animationElement.style.transform = 'translateX(-100%) scale(0.8)';

                // 动画结束后执行回调
                setTimeout(() => {
                    wordDisplay.innerHTML = '';
                    callback();
                }, 800);
            }, 1000);
        };

        animationElement.onerror = function() {
            console.error('GIF加载失败:', this.src);
            alert('GIF动画加载失败，请检查文件是否存在');
            wordDisplay.innerHTML = '';
            callback();
        };

        // 详细调试GIF加载
        console.log('当前时间:', new Date().toLocaleTimeString());
        console.log('尝试加载GIF:', animationElement.src);
        console.log('GIF元素创建完成，等待加载...');

        // 模拟直接加载GIF以测试
        const testImg = new Image();
        testImg.src = animationElement.src;
        testImg.onload = function() {
            console.log('测试GIF加载成功:', this.src);
            console.log('GIF尺寸:', this.width, 'x', this.height);
        };
        testImg.onerror = function() {
            console.error('测试GIF加载失败:', this.src);
        };
    }

    // 更新行号显示
    function updateLineNumbers() {
        // 获取文本框中的文本
        const text = wordInput.value;
        // 按换行符分割获取行数
        const lines = text.split('\n');
        // 生成行号HTML
        let lineNumbersHTML = '';
        for (let i = 0; i < lines.length; i++) {
            lineNumbersHTML += '<div>' + (i + 1) + '</div>';
        }
        // 更新行号显示
        lineNumbers.innerHTML = lineNumbersHTML;
        // 同步滚动
        lineNumbers.scrollTop = wordInput.scrollTop;
    }

    // 监听文本框输入事件，更新行号
    wordInput.addEventListener('input', updateLineNumbers);

    // 监听文本框滚动事件，同步行号滚动
    wordInput.addEventListener('scroll', function() {
        lineNumbers.scrollTop = wordInput.scrollTop;
    });

    // 搜索单词
    searchBtn.addEventListener('click', function() {
        const searchText = searchWordInput.value.trim().toLowerCase();
        if (searchText === '') {
            alert('请输入要搜索的单词！');
            return;
        }

        if (words.length === 0) {
            alert('请先加载单词！');
            return;
        }

        // 查找匹配的单词
        const searchIndex = words.findIndex(word => word.toLowerCase().includes(searchText));

        if (searchIndex !== -1) {
            // 找到了匹配的单词
            currentIndex = searchIndex;
            displayCurrentWord();
            updateWordCounter();

            // 高亮显示单词输入框中的匹配单词
            highlightSearchTerm(searchText);
        } else {
            alert('未找到匹配的单词！');
        }
    });

    // 高亮显示搜索词
    function highlightSearchTerm(term) {
        const text = wordInput.value;
        const lowerText = text.toLowerCase();
        const startIndex = lowerText.indexOf(term);

        if (startIndex !== -1) {
            const endIndex = startIndex + term.length;
            // 保存当前的滚动位置
            const scrollTop = wordInput.scrollTop;
            // 选择匹配的文本
            wordInput.setSelectionRange(startIndex, endIndex);
            // 滚动到选中的文本
            wordInput.scrollTop = scrollTop;
            // 聚焦到文本框
            wordInput.focus();
        }
    }


    // 初始化行号显示
    updateLineNumbers();

    // 粘贴单词功能
    pasteWordsBtn.addEventListener('click', async function() {
        try {
            // 从剪贴板获取文本
            const text = await navigator.clipboard.readText();
            if (!text) {
                alert('剪贴板为空！');
                return;
            }

            // 格式化文本为一行一个单词
            // 首先用正则表达式将所有非单词字符替换为换行符
            let formattedText = text.replace(/[^a-zA-Z0-9\s.,!?'-]/g, ' ');
            // 然后将连续的空白字符替换为单个换行符
            formattedText = formattedText.replace(/\s+/g, '\n');
            // 去除首尾空白
            formattedText = formattedText.trim();

            // 设置到文本框
            wordInput.value = formattedText;
            // 更新行号
            updateLineNumbers();
            // 自动加载单词
            loadWords();
        } catch (err) {
            alert('粘贴失败: ' + err.message);
        }
    });

    // 加载单词
    function loadWords() {
        const input = wordInput.value.trim();
        if (input === '') {
            alert('请输入单词！');
            return;
        }

        // 按行分割单词
        let allWords = input.split('\n')
            .map(word => word.trim())
            .filter(word => word !== '');

        if (allWords.length === 0) {
            alert('没有找到有效的单词！');
            return;
        }

        // 更新单词列表
        words = allWords;

        // 重置当前索引、已用索引并显示第一个单词
        currentIndex = 0;
        usedIndices = [];
        displayCurrentWord();
        updateWordCounter();
    }

    // 加载单词按钮事件
    loadWordsBtn.addEventListener('click', loadWords);



    // 显示当前单词
    function displayCurrentWord() {
        console.log('displayCurrentWord called, words.length:', words.length);
        if (words.length === 0) return;
        
        console.log('Current funMode:', funMode);
        if (funMode) {
            // 在趣味模式下，先播放动画再显示单词
            console.log('Playing fun mode animation');
            playFunModeAnimation(() => {
                wordDisplay.textContent = words[currentIndex];
            });
        } else {
            // 正常模式
            wordDisplay.textContent = words[currentIndex];
        }
    }

    // 更新单词计数器
    function updateWordCounter() {
        wordCounter.textContent = `当前: ${currentIndex + 1}/${words.length}`;
    }

    // 上一个单词
    prevWordBtn.addEventListener('click', function() {
        if (words.length === 0) return;
        currentIndex = (currentIndex - 1 + words.length) % words.length;
        displayCurrentWord();
        updateWordCounter();
    });

    // 下一个单词
    nextWordBtn.addEventListener('click', function() {
        if (words.length === 0) return;
        currentIndex = (currentIndex + 1) % words.length;
        displayCurrentWord();
        updateWordCounter();
    });

    // 随机抽选单词
    randomWordBtn.addEventListener('click', function() {
        if (words.length === 0) return;

        if (noRepeatCheckbox.checked) {
            // 不重复随机抽选
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
            // 普通随机抽选
            const randomIndex = Math.floor(Math.random() * words.length);
            currentIndex = randomIndex;
        }

        displayCurrentWord();
        updateWordCounter();
    });

    // 跳转到指定行
    jumpBtn.addEventListener('click', function() {
        const jumpTo = parseInt(jumpToInput.value);
        const inputLines = wordInput.value.split('\n');
        // 检查最后一行是否为空，如果是，则不计算
        let validLines = inputLines;
        if (validLines.length > 0 && validLines[validLines.length - 1] === '') {
            validLines = validLines.slice(0, -1);
        }

        if (isNaN(jumpTo) || jumpTo < 1 || jumpTo > validLines.length) {
            alert(`请输入1到${validLines.length}之间的数字！`);
            return;
        }

        // 更新单词列表为当前输入的所有有效行
        let newWords = validLines.map(word => word.trim()).filter(word => word !== '');



        words = newWords;

        // 查找对应行的单词在words数组中的索引
        const lineContent = validLines[jumpTo - 1].trim();
        if (lineContent === '') {
            alert('该行没有有效的单词！');
            return;
        }

        const wordIndex = words.indexOf(lineContent);
        if (wordIndex !== -1) {
            currentIndex = wordIndex;
        } else {
            // 如果没找到，可能是因为有重复单词，取第一个匹配的
            currentIndex = 0;
        }

        displayCurrentWord();
        updateWordCounter();
    });
});