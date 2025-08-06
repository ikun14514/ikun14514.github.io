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

### 注意事项
- 确保服务器的防火墙已打开80端口
- 如果你没有域名，可以使用服务器的IP地址访问
- 为了安全性，建议配置SSL证书启用HTTPS
- 定期更新服务器上的代码以获取最新版本

## 技术栈
- HTML5
- CSS3
- JavaScript
- Nginx（用于Linux服务器部署）

## 贡献
欢迎提交issue和pull request来改进这个项目。

## 许可证
这个项目使用MIT许可证 - 详情请见LICENSE文件。