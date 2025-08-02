document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const wordInput = document.getElementById('word-input');
    const loadWordsBtn = document.getElementById('load-words');
    const wordDisplay = document.getElementById('word-display');
    const prevWordBtn = document.getElementById('prev-word');
    const nextWordBtn = document.getElementById('next-word');
    const randomWordBtn = document.getElementById('random-word');
    const wordCounter = document.getElementById('word-counter');

    // 初始化变量
    let words = [];
    let currentIndex = 0;

    // 加载单词
    loadWordsBtn.addEventListener('click', function() {
        const input = wordInput.value.trim();
        if (input === '') {
            alert('请输入单词！');
            return;
        }

        // 按行分割单词
        words = input.split('\n')
            .map(word => word.trim())
            .filter(word => word !== '');

        if (words.length === 0) {
            alert('没有找到有效的单词！');
            return;
        }

        // 重置当前索引并显示第一个单词
        currentIndex = 0;
        displayCurrentWord();
        updateWordCounter();
    });

    // 显示当前单词
    function displayCurrentWord() {
        if (words.length === 0) return;
        wordDisplay.textContent = words[currentIndex];
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
        const randomIndex = Math.floor(Math.random() * words.length);
        currentIndex = randomIndex;
        displayCurrentWord();
        updateWordCounter();
    });
});