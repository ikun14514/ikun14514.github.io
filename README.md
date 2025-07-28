# 随机抽选答题系统

一个纯前端实现的随机抽选答题网页，支持表格上传和抽选动画效果。

## 功能特点
- 支持上传CSV、Excel表格文件
- 随机抽选功能，抽选过程播放动画
- 响应式设计，适配各种屏幕尺寸
- 现代美观的UI设计

## 使用方法
1. 将动画文件命名为`animation.mp4`并放在与HTML文件相同的目录下
2. 打开`index.html`文件
3. 点击"选择表格文件"上传包含抽选名单的表格
4. 点击"开始抽选"按钮进行随机抽选

## 部署到Linux服务器
1. 安装Nginx服务器:
   ```bash
   sudo apt update && sudo apt install nginx -y
   ```
2. 将项目文件上传到服务器:
   ```bash
   scp -r /本地项目路径/* user@server_ip:/var/www/html/
   ```
3. 设置文件权限:
   ```bash
   sudo chown -R www-data:www-data /var/www/html/
   sudo chmod -R 755 /var/www/html/
   ```
4. 启动Nginx服务:
   ```bash
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```
5. 访问服务器IP即可使用系统

## 部署到Node.js服务器
1. 安装Node.js和npm:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install nodejs -y
   ```
2. 安装http-server:
   ```bash
   sudo npm install -g http-server
   ```
3. 启动服务器:
   ```bash
   cd /var/www/html
   http-server -p 80 --cors
   ```
4. (可选) 使用PM2进行进程管理:
   ```bash
   sudo npm install -g pm2
   pm2 start "http-server -p 80 --cors"
   pm2 startup
   ```

## 表格格式要求
表格应包含至少一列姓名信息，可以包含其他列如学号、班级等。

### 表格格式范例

#### CSV格式（.csv）
```csv
姓名,年级,性别
张三,一年级,男
李四,一年级,女
王五,二年级,男
赵六,二年级,女
钱七,三年级,男
孙八,三年级,女
周九,四年级,男
吴十,四年级,女
```

#### Excel格式（.xls/.xlsx）
| 姓名 | 年级 | 性别 |
|------|------|------|
| 张三 | 一年级 | 男 |
| 李四 | 一年级 | 女 |
| 王五 | 二年级 | 男 |
| 赵六 | 二年级 | 女 |
| 钱七 | 三年级 | 男 |
| 孙八 | 三年级 | 女 |
| 周九 | 四年级 | 男 |
| 吴十 | 四年级 | 女 |

**注意**：第一行应为表头，系统会自动识别包含"姓名"或"name"的列作为抽选对象。其他列信息会在抽选结果中一并显示。

支持的表格格式：
- CSV (.csv)
- Excel (.xls, .xlsx)

## 文件结构
- `index.html` - 网页主文件
- `styles.css` - 样式表
- `script.js` - 功能实现脚本
- `animation.mp4` - 抽选动画视频（需用户自行提供）

## 注意事项
- 动画文件必须命名为`animation.mp4`并与网页文件放在同一目录
- 表格文件不宜过大，建议不超过1000行数据
- 请使用现代浏览器（Chrome、Firefox、Edge等）以获得最佳体验