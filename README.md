# English Word Reader  
请注意！本项目内png图片需要手动替换为实际图片，本项目内的png图片仅作为示例，侵权删除！
一个简单但实用的英语单词阅读器，帮助你学习和记忆英语单词。通过输入单词列表，你可以按顺序浏览或随机抽选单词进行学习。

## 功能特点
- 左侧文本输入框，支持一行一个英语单词输入
- 文本框带有行号显示功能，方便查看输入的单词行数
- 右侧大字体显示当前单词，字体大小可自适应屏幕
- 提供"上一个"和"下一个"按钮用于顺序导航
- 添加了"随机抽选"功能，增强学习效果
- 随机抽选支持"不重复"选项，确保每个单词只被抽选一次
- 单词计数器，显示当前进度（当前单词/总单词数）
- 支持通过输入行号跳转到对应的单词
- 响应式设计，适配不同屏幕尺寸（桌面、平板、手机）
- 美观的UI设计，带有平滑过渡动画和悬停效果
- 简洁的界面，专注于单词学习
- 支持粘贴单词并自动格式化
- 趣味模式功能，增强学习趣味性
- 查词功能，帮助快速了解单词含义

## 本地运行指南
1. 确保你已经安装了Node.js和npm
2. 克隆这个仓库到本地
   ```bash
   git clone https://github.com/ikun14514/ikun14514.github.io.git
   ```
3. 进入项目目录
   ```bash
   cd ikun14514.github.io
   ```
4. 使用npx vite启动本地服务器
   ```bash
   npx vite --port 3000
   ```
5. 在浏览器中访问 `http://localhost:3000`

## 部署到GitHub Pages
1. 确保你的代码已经提交到GitHub仓库
2. 在仓库的根目录下创建一个`.github/workflows`目录
3. 在该目录下创建一个`deploy.yml`文件，内容如下：
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: .
   ```
4. 提交这个文件到GitHub
5. 在GitHub仓库的设置中，找到"Pages"选项
6. 在"Source"部分，选择"Deploy from a branch"，然后选择"gh-pages"分支和"/ (root)"目录，点击"Save"
7. 等待几分钟，你的网站将部署在 `https://ikun14514.github.io/`

### 注意事项
- 仓库名称为`ikun14514.github.io`，部署后URL为 `https://ikun14514.github.io/`
- 首次部署可能需要等待1-2分钟才能访问
- 如果页面无法访问，检查GitHub Actions的运行状态是否有错误

## GitLab CI/CD 配置
本项目已配置GitLab CI/CD，用于自动化测试、构建和部署流程。以下是配置说明：

### .gitlab-ci.yml 文件说明
项目根目录下的`.gitlab-ci.yml`文件定义了以下阶段：
1. **test**: 运行测试（当前未配置具体测试）
2. **build**: 构建项目
3. **deploy**: 部署到GitLab Pages
4. **deploy_to_github**: （可选）部署到GitHub Pages

### 配置详情
```yaml
# GitLab CI/CD 配置文件
# 此文件定义了项目的持续集成和持续部署流程

stages:
  - test
  - build
  - deploy

# 缓存依赖，提高构建速度
cache:
  paths:
    - node_modules/
    - .npm/

# 测试阶段
test:
  stage: test
  image: node:18
  script:
    - npm ci --cache .npm --prefer-offline
    - echo "没有测试配置，跳过测试"
  only:
    - main
    - merge_requests

# 构建阶段
build:
  stage: build
  image: node:18
  script:
    - npm ci --cache .npm --prefer-offline
    - npm run build
  artifacts:
    paths:
      - dist/
  only:
    - main
    - merge_requests

# 部署阶段 (部署到GitLab Pages)
deploy:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache rsync
    - mkdir -p public
    - rsync -av --delete dist/ public/
  artifacts:
    paths:
      - public
  only:
    - main

# 部署到GitHub Pages (可选)
deploy_to_github:
  stage: deploy
  image: node:18
  script:
    - npm ci --cache .npm --prefer-offline
    - npm run build
    - git config --global user.email "$GITLAB_USER_EMAIL"
    - git config --global user.name "$GITLAB_USER_NAME"
    - npx gh-pages -d dist -r https://github.com/ikun14514/ikun14514.github.io.git -b gh-pages
  only:
    - main
```

### 使用方法
1. 将代码推送到GitLab仓库
2. GitLab会自动检测并运行CI/CD流水线
3. 完成后，可在GitLab Pages或GitHub Pages查看部署结果

### 环境变量配置
部署到GitHub Pages需要在GitLab项目设置中配置以下环境变量：
- `GITHUB_TOKEN`: GitHub个人访问令牌，用于推送代码到GitHub仓库

## 部署到Linux服务器
1. 准备一台运行Linux的服务器（如Ubuntu、CentOS等）
2. 通过SSH连接到服务器
   ```bash
   ssh username@server_ip
   ```
3. 安装必要的软件（以Ubuntu为例）
   ```bash
   sudo apt update
   sudo apt install nginx git
   ```
4. 克隆你的代码仓库到服务器
   ```bash
   git clone https://github.com/yourusername/En_words_reader.git /var/www/en_words_reader
   ```
5. 配置Nginx
   ```bash
   sudo nano /etc/nginx/sites-available/en_words_reader
   ```
6. 粘贴以下内容（根据你的域名修改）：
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       root /var/www/en_words_reader;
       index index.html;

       location / {
           try_files $uri $uri/ =404;
       }
   }
   ```
7. 保存并退出编辑器（按`Ctrl+X`，然后按`Y`，最后按`Enter`）
8. 启用这个配置
   ```bash
   sudo ln -s /etc/nginx/sites-available/en_words_reader /etc/nginx/sites-enabled/
   ```
9. 测试Nginx配置是否正确
   ```bash
   sudo nginx -t
   ```
10. 重启Nginx服务
    ```bash
    sudo systemctl restart nginx
    ```
11. 现在，你可以通过你的域名访问这个应用了
  - 如果你没有域名，可以使用服务器的IP地址访问
  - 为了安全性，建议配置SSL证书启用HTTPS

### 注意事项
- 确保服务器的防火墙已打开80端口
- 定期备份你的代码和数据
- 考虑使用HTTPS加密你的网站（可通过Let's Encrypt获取免费SSL证书）

## 部署到阿里云OSS
通过阿里云对象存储OSS托管静态网站，可以实现高可用性、低成本的网站托管服务。以下是详细步骤：

### 步骤1：注册域名
1. 访问阿里云域名服务，注册一个域名（如example.com）
2. 若域名需绑定在中国内地的OSS Bucket，需完成工信部备案

### 步骤2：创建OSS Bucket
1. 登录阿里云OSS控制台
2. 点击"创建Bucket"按钮
3. 配置Bucket参数：
   - **Bucket名称**：设置一个唯一名称（如examplebucket）
   - **地域**：选择靠近目标用户的地域（如华东1（杭州））
   - **存储类型**：选择标准存储
   - **读写权限**：选择公共读
4. 点击"完成创建"按钮

### 步骤3：上传网站文件
1. 在OSS控制台，进入创建的Bucket
2. 点击"上传文件"按钮
3. 选择本地项目中的所有文件（index.html、style.css、script.js、audio文件夹等）
4. 点击"上传文件"按钮完成上传

### 步骤4：配置静态网站托管
1. 在Bucket左侧导航栏，选择"基础设置" > "静态页面"
2. 点击"设置"按钮
3. 配置静态页面参数：
   - **默认首页**：输入index.html
   - **默认404页**：输入error.html（可选）
4. 点击"保存"按钮

### 步骤5：绑定自定义域名
1. 在Bucket左侧导航栏，选择"权限管理" > "域名管理"
2. 点击"绑定域名"按钮
3. 输入已注册的域名（如example.com）
4. 开启"自动添加CNAME记录"开关
5. 等待域名状态显示"已生效"

### 步骤6：（可选）使用阿里云CDN加速网站
1. 在域名管理页面，点击已绑定域名右侧的"未配置"，跳转至CDN控制台
2. 在添加域名页面，保持默认配置，点击"下一步"
3. 记录生成的CNAME值（如example.com.w.kunlunsl.com）
4. 进入DNS控制台，修改CNAME记录的记录值为生成的CNAME值

### 步骤7：测试网站
1. 在浏览器中访问你的域名（如http://example.com）
2. 若配置正确，将显示网站首页
3. 访问不存在的文件（如http://example.com/test.txt），将显示404错误页面（若已配置）

### 注意事项
- 确保所有网站文件已正确上传至OSS Bucket
- 域名绑定后可能需要一段时间（通常几分钟）才能生效
- 若使用CDN加速，需等待CDN配置生效（通常需要10-30分钟）
- 定期清理不需要的OSS资源，以避免产生不必要的费用
- 定期更新服务器上的代码以获取最新版本

## 技术栈
- HTML5
- CSS3
- JavaScript
- Nginx（用于Linux服务器部署）

## 贡献
欢迎提交issue和pull request来改进这个项目。