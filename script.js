document.addEventListener('DOMContentLoaded', () => {
    // DOM元素引用
const fileUpload = document.getElementById('file-upload');
const fileInfo = document.getElementById('file-info');
const startBtn = document.getElementById('start-btn');
const candidateInfo = document.getElementById('candidate-info');
const animationModal = document.getElementById('animation-modal');
const selectionAnimation = document.getElementById('selection-animation');
const gradeFilter = document.getElementById('grade-filter');
const genderFilter = document.getElementById('gender-filter');
const filterCount = document.createElement('div');
filterCount.className = 'filter-count';
// 将筛选计数添加到页面
const filterSection = document.querySelector('.filter-section');
filterSection.appendChild(filterCount);

    // 存储抽选数据
let candidateData = []; // 原始数据
let filteredData = []; // 筛选后的数据
let isSelecting = false;
let grades = new Set(); // 所有年级集合

    // 文件上传处理
fileUpload.addEventListener('change', handleFileUpload);
startBtn.addEventListener('click', startSelection);
selectionAnimation.addEventListener('ended', handleAnimationEnd);
gradeFilter.addEventListener('change', applyFilters);
genderFilter.addEventListener('change', applyFilters);

    // 处理文件上传
    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // 验证文件类型
        const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (!validTypes.includes(file.type)) {
            alert('请上传CSV或Excel表格文件');
            return;
        }

        // 显示文件信息
        fileInfo.textContent = `已上传: ${file.name} (${formatFileSize(file.size)})`;
        fileInfo.classList.add('visible');

        // 解析文件
const reader = new FileReader();
reader.onload = function(e) {
    try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // 存储解析后的数据
        candidateData = jsonData;
        filteredData = [...candidateData];

        // 提取所有年级
        grades.clear();
        candidateData.forEach(item => {
            if (item['年级']) grades.add(item['年级']);
        });

        // 填充年级筛选下拉框
        gradeFilter.innerHTML = '<option value="">全部年级</option>';
        grades.forEach(grade => {
            const option = document.createElement('option');
            option.value = grade;
            option.textContent = grade;
            gradeFilter.appendChild(option);
        });

        startBtn.disabled = false;
        updateFilterCount();
        candidateInfo.innerHTML = `<div class="success-message">已加载 ${candidateData.length} 条数据，点击开始抽选</div>`;
    } catch (error) {
        console.error('文件解析错误:', error);
        alert('文件解析失败，请确保上传的是有效的表格文件');
    }
};
reader.readAsArrayBuffer(file);
    }

    // 应用筛选条件
function applyFilters() {
    const selectedGrade = gradeFilter.value;
    const selectedGender = genderFilter.value;

    filteredData = candidateData.filter(item => {
        const gradeMatch = !selectedGrade || item['年级'] === selectedGrade;
        const genderMatch = !selectedGender || item['性别'] === selectedGender;
        return gradeMatch && genderMatch;
    });

    updateFilterCount();
    startBtn.disabled = filteredData.length === 0;

    // 如果没有符合条件的数据，显示提示
    if (filteredData.length === 0) {
        candidateInfo.innerHTML = '<div class="placeholder">没有符合筛选条件的候选人</div>';
    } else if (candidateInfo.querySelector('.placeholder')) {
        candidateInfo.innerHTML = '<div class="placeholder">请点击开始抽选</div>';
    }
}

// 更新筛选计数显示
function updateFilterCount() {
    filterCount.textContent = `当前筛选结果: ${filteredData.length} 人 (共 ${candidateData.length} 人)`;
}

// 开始抽选过程
function startSelection() {
    if (isSelecting || filteredData.length === 0) return;

    isSelecting = true;
    startBtn.disabled = true;
    startBtn.textContent = '抽选进行中...';

    // 显示动画
    animationModal.classList.add('active');
    selectionAnimation.play();
}

    // 动画结束后处理
    function handleAnimationEnd() {
        // 随机选择候选人
        const randomIndex = Math.floor(Math.random() * filteredData.length);
        const selectedCandidate = filteredData[randomIndex];

        // 隐藏动画
        animationModal.classList.remove('active');
        selectionAnimation.pause();

        // 显示结果
        displayCandidateInfo(selectedCandidate);

        // 重置状态
        isSelecting = false;
        startBtn.disabled = false;
        startBtn.textContent = '开始抽选';
    }

    // 显示候选人信息
    function displayCandidateInfo(candidate) {
        // 清空现有内容
        candidateInfo.innerHTML = '';

        // 检查候选人数据是否存在
        if (!candidate) {
            candidateInfo.innerHTML = '<div class="placeholder">未找到候选人数据</div>';
            return;
        }

        // 创建信息元素
        const nameElement = document.createElement('div');
        nameElement.className = 'candidate-name';
        nameElement.textContent = candidate['姓名'] || candidate['name'] || '未知姓名';

        const infoList = document.createElement('div');
        infoList.className = 'candidate-details';

        // 显示除姓名外的其他信息
        let detailsHtml = '';
        for (const [key, value] of Object.entries(candidate)) {
            if (key !== '姓名' && key !== 'name') {
                detailsHtml += `<p><strong>${key}:</strong> ${value}</p>`;
            }
        }

        infoList.innerHTML = detailsHtml || '<p>无其他信息</p>';

        // 添加到容器
        candidateInfo.appendChild(nameElement);
        candidateInfo.appendChild(infoList);

        // 添加动画效果
        candidateInfo.classList.add('fade-in');
    }

    // 工具函数：格式化文件大小
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }

    // 检查动画文件是否存在
    function checkAnimationFile() {
        const video = document.createElement('video');
        video.src = 'animation.mp4';
        video.onerror = function() {
            alert('抽选动画文件未找到，请确保animation.mp4与网页文件在同一目录下');
        };
    }

    // 初始化检查
    checkAnimationFile();
});