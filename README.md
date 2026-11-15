# DeepSeek 手机版

一个为手机屏幕重新设计的 DeepSeek 聊天应用（可安装的 PWA，另附 Android APK）。纯静态、无后端、无第三方依赖，使用**你自己的 DeepSeek API Key**，数据只保存在本机浏览器。

灵感与功能对标 DeepSeek 官方开源的 [chat-demo](https://github.com/deepseek-ai/chat-demo)，但界面、交互与代码均为手机端重新实现。

> **非官方项目**，与 DeepSeek 官方无隶属关系。API 费用由你的 DeepSeek 账户承担。

| 对话 | 深度思考 | 联网搜索 |
| --- | --- | --- |
| ![欢迎页](screenshots/02-welcome.png) | ![思考中](screenshots/03-thinking.png) | ![搜索结果](screenshots/07-search.png) |
| ![设置](screenshots/05-settings.png) | ![深色模式](screenshots/08-dark.png) | ![模型选择](screenshots/09-model-picker.png) |

---

## 直接安装 Android APK（已生成）

不想部署、不想折腾浏览器，可以直接装 APK：

- **[DeepSeek-Mobile-1.0.3.apk](DeepSeek-Mobile-1.0.3.apk)** · 1.15 MB · Android 7.0（API 24）及以上
- SHA-256：`C3F45FE751A7C07032D514A6F35E710243395BD116F2FA3B817A98A80E863059`
- 已签名（v2 + v3），已 zipalign，已包含完整离线页面与图标
- 1.0.3：应用图标替换为提供的图片（`assets/icon-source.webp`），并保留 1.0.2 的资源路径修复。
- 1.0.2 修复：aapt2 在 Windows 上用 `-A` 打包 assets 时会写成 `assets/www\...`（混合分隔符），Android 的 AssetManager / ZipFile 都找不到 `assets/www/index.html`，于是启动只显示 `Not Found`。现在改为构建脚本自己用正斜杠 `/` 将网页资源写入 APK，并在 `res/raw` 里内置单文件页面作为兜底。

安装：

1. 把 APK 发到手机（微信文件传输 / 数据线 / 网盘）。
2. 在文件管理器中点开，允许「安装未知应用」，安装即可。
3. 或在电脑上（手机已开 USB 调试并授权）执行：

```bash
adb install -r DeepSeek-Mobile-1.0.3.apk
```

> 如果你已经装过旧版，直接覆盖安装 1.0.3 即可，不需要卸载（签名相同、versionCode 4）。新版 APK 已推送到手机的 `/sdcard/DeepSeek-Mobile-1.0.3.apk` 与 `/sdcard/Download/DeepSeek-Mobile-1.0.3.apk`。

签名信息：

- 密钥文件：`android/keystore/deepseek-release.jks`
- alias：`deepseek`；store/key password：`deepseek123`
- **一定要保留这个 jks 和密码**：以后重新打包时用同一把钥匙签名，才能覆盖安装升级；丢了只能卸载重装。
- 这是个人自签名，不是 Google Play 签名。上架 Play 需要 AAB + Play App Signing，并妥善保管私钥。

APK 是一个极小的 WebView 壳：内置同一套 PWA 文件，由壳内 `127.0.0.1` 本地服务器提供，因此 localStorage、IndexedDB、麦克风、文件选择器等能力与浏览器一致。与 PWA 相比，系统分享、Blob 下载等少量浏览器能力可能受限；应用更新也需要重新安装 APK，不会像 PWA 那样刷新即更新。

> 说明：1.0.0 在真机首次启动暴露了 APK 资源路径问题；1.0.2 已用正斜杠重新打包 assets，并在设备上用 `java.util.zip.ZipFile` 探针确认 `assets/www/index.html` 可以命中。由于这台手机的 adb 安装器拒绝执行（返回 `session -1`），需要手动点一下 APK 完成覆盖安装；安装后可让助手通过 `adb forward` 直接验证页面与本地服务器。

---

## PWA 的三种用法，按需要选一种

### 方式一：手机直接打开（最快，零安装）

把 **`deepseek-mobile.html`** 这一个文件传到手机（微信文件传输、数据线、网盘都可以），用手机浏览器打开：

- **Android**：文件管理器里点开，选择 Chrome；或 Chrome 地址栏输入 `file:///sdcard/Download/deepseek-mobile.html`
- **iPhone**：用「文件」App 长按 → 共享 → 在 Safari 中打开（部分系统版本限制本地网页）

打开后填入 API Key 即可使用。所有代码、样式、图标都在这一个 HTML 里，不依赖网络加载界面。

> 这种方式的限制：无法注册 Service Worker（不能离线启动 / 不能真正“安装”），部分浏览器会限制 `file://` 下的麦克风与本地存储。想要完整体验请用方式二或三。

### 方式二：部署到 HTTPS，安装成桌面 App（推荐，真正当 App 用）

任意静态托管都可以，部署后手机浏览器打开网址 →「添加到主屏幕」，就会以独立 App 窗口运行，并支持离线打开界面。

**GitHub Pages（仓库里已带自动部署配置）**

1. 新建一个 GitHub 仓库，把本文件夹的全部内容上传（`.github/` 也要上传）。
2. 仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。
3. 推送到 `main` 分支，等待 Actions 完成，得到 `https://你的用户名.github.io/仓库名/`。
4. 手机打开这个网址，按下面的「安装到手机」操作。

**Vercel / Netlify / Cloudflare Pages**

把整个文件夹拖进控制台即可，默认打开 `index.html`，自动获得 HTTPS。无需构建命令。

### 方式三：电脑局域网预览（开发、临时使用）

需要电脑装有 [Node.js](https://nodejs.org/) 18+：

```bash
# Windows 直接双击「启动服务器.bat」，或：
node server.mjs --port 8080 --open
```

终端会打印：

```
电脑访问   http://localhost:8080
手机访问   http://192.168.x.x:8080   （手机需与电脑连同一 Wi-Fi）
```

手机浏览器打开「手机访问」的地址即可。首次运行 Windows 会弹防火墙提示，请允许 Node.js 通过专用网络。

> 局域网是 HTTP，Chrome/Edge 不会把普通 HTTP 页面当作可安装 PWA（Service Worker 需要 HTTPS 或 localhost）。这种方式适合快速试用；要安装到桌面请用方式二。

---

## 安装到手机

| 系统 | 操作 |
| --- | --- |
| Android Chrome / Edge | 打开网址 → 右上角菜单 → **安装应用** 或 **添加到主屏幕** |
| iPhone / iPad Safari | 底部 **分享** → **添加到主屏幕** → 添加 |
| 桌面 Chrome / Edge | 地址栏右侧安装图标，或菜单 → 安装 |

安装后从桌面图标打开，全屏无地址栏，界面资源可离线加载（聊天仍需联网）。

---

## 功能

- **流式对话**：SSE 逐字输出，可随时停止；停止后保留已生成内容。
- **深度思考**：`deepseek-flash` / `deepseek-v4-pro` 的思考过程实时展示，结束后折叠为「已深度思考（用时 x 秒）」；支持快速 / 标准 / 极致三档思考强度。
- **联网搜索**：声明 `deepseek_web_search` + `deepseek_read_url` 服务端工具，展示搜索词、来源卡片与引用链接。
- **图片理解**：拍照或从相册选图，自动压缩后以 base64 发送（仅 `deepseek-flash` 支持）。
- **文件解析**：PDF / Word / PPT / Excel / TXT / Markdown / 代码等上传到 Files API，自动选择解析方式，按 `file_id` 引用。
- **语音输入**：浏览器录音 → 16 kHz 单声道 WAV → `/v1/tools/asr` 转文字（≤ 120 秒）。
- **朗读**：`/v1/tools/tts` 官方语音（stella / tide），失败时回退系统语音。
- **本地历史**：IndexedDB 保存全部对话，支持搜索、置顶、重命名、删除、导出 / 导入 JSON。
- **Markdown**：标题、列表、任务清单、表格、引用、代码块（语法高亮 + 一键复制）、链接、行内 / 块级公式（上标、下标、分数、根号）。
- **手机细节**：安全区适配、软键盘自适应、触感反馈、下拉到底按钮、深浅色、字号调节、中英文切换。
- **PWA**：离线应用外壳、桌面图标、快捷方式「新对话」。

### 使用的 API

当前实现基于 DeepSeek 官方 **OpenAI 兼容协议**（截至 2026-11 的文档）：

| 功能 | 端点 |
| --- | --- |
| 对话 | `POST /chat/completions`（`stream: true`） |
| 模型 | `GET /models` |
| 文件 | `POST /files` → `{ file_id }` |
| 语音识别 | `POST /v1/tools/asr` |
| 语音合成 | `POST /v1/tools/tts` |

- 默认 API 地址：`https://api.deepseek.com`
- 默认模型：`deepseek-flash`（支持思考、图片、联网工具）；`deepseek-v4-pro` 文本推理更强但不支持图片
- 联网工具通过 `tools: [{"type":"deepseek_web_search"},{"type":"deepseek_read_url"}]` 声明，由服务端执行，客户端不需要执行工具调用
- 官方 chat-demo 使用的是 Anthropic Messages 协议；本应用使用等价的 OpenAI 兼容协议，请求参数按官方文档实现

API 文档：<https://api-docs.deepseek.com> · 获取 Key：<https://platform.deepseek.com/api_keys>

---

## 使用前须知

1. **API Key 保存在浏览器 localStorage 中**（明文）。这是纯前端应用的必然取舍：Key 不会上传到任何第三方，但同一台设备上能打开此页面的人或扩展可能读到它。请勿在公共设备上保存 Key，用完可在「设置 → 数据 → 清空全部对话」并清除站点数据。
2. **对话默认不带 `safety_check: high`**，使用 API 默认的内容安全级别；如需更严格审核可在请求中自行添加（当前界面未暴露该开关）。
3. **费用**：对话按 token 计费；联网搜索、网页抓取、文件解析、ASR、TTS 另按官方价格计费。可在 DeepSeek 开放平台查看余额与用量。
4. **搜索是否发生由模型决定**：打开「联网搜索」只代表允许模型联网，简单问题可能不触发搜索，因此不会显示来源。
5. **文件与语音限制**（官方）：图片 ≤ 32 MB；文档 ≤ 100 MB / 1000 页；单次语音 ≤ 120 秒 / 8 MB；单次朗读 ≤ 10,000 字符。

---

## 常见问题

**401 / API Key 无效**
Key 错误、被删除或复制时多了空格。到「设置 → API」重新保存并用「测试连接」验证。

**402 余额不足**
到 DeepSeek 开放平台充值。

**429 请求过于频繁 / 并发超限**
稍后重试。免费或低额度账户的并发限制较低。

**网络错误 / 一直转圈**
检查手机网络；如果修改过 API 地址，确认地址可访问且支持跨域（DeepSeek 官方 API 已支持浏览器直接请求）。公司网络或代理可能拦截 `Authorization` 预检请求。

**「安装到主屏幕」没有出现**
PWA 安装要求 HTTPS（或 localhost）。局域网 HTTP 只能添加普通快捷方式。iOS 必须用 Safari 的分享菜单；Chrome iOS 不支持安装。

**语音按钮点击没反应 / 无法录音**
麦克风需要安全上下文（HTTPS 或 localhost）和浏览器权限；`file://` 下部分浏览器会直接拒绝。检查系统与浏览器的麦克风权限。

**朗读没有声音**
iOS 对自动播放有限制；如果官方 TTS 播放被拦截，会自动改用系统语音。仍无声时检查静音开关与媒体音量。

**图片发不出去**
图片只支持 `deepseek-flash`，应用会自动切换模型；`deepseek-v4-pro` 不接受图片。

**本地打开的 HTML 每次都是新对话 / Key 丢失**
部分浏览器对 `file://` 页面的存储相互隔离或禁止持久化。请改用 HTTPS 部署或局域网服务器方式。

**换手机怎么迁移**
「设置 → 数据 → 导出全部数据」，在新手机导入 JSON 即可（不含 API Key，Key 需重新填写）。

---

## 目录结构

```
.
├── index.html                  # 应用入口
├── src/
│   ├── app.css                 # 全部样式（含深色模式、安全区）
│   ├── core.js                 # Markdown、代码高亮、公式、SSE、i18n（无 DOM，可单测）
│   ├── icons.js                # 内联 SVG 图标
│   ├── app.js                  # 应用外壳、设置、IndexedDB、API 客户端、UI 组件
│   ├── chat.js                 # 消息渲染、流式对话、搜索来源、附件
│   ├── voice.js                # 录音转 WAV + ASR、TTS 播放
│   ├── settings.js             # 设置面板
│   └── history.js              # 历史记录抽屉、导入导出
├── sw.js                       # Service Worker（离线外壳）
├── manifest.webmanifest        # PWA 清单
├── assets/                     # PNG 图标
├── deepseek-mobile.html        # 单文件构建（方式一）
├── DeepSeek-Mobile-1.0.3.apk   # 已签名的 Android 安装包
├── android/                    # 极简 WebView 壳（Java，无 Gradle 依赖）
│   ├── java/com/deepseek/mobile/MainActivity.java
│   ├── java/com/deepseek/mobile/LocalServer.java
│   ├── AndroidManifest.xml
│   ├── res/                    # 应用名与图标
│   └── keystore/               # 发布签名密钥（含说明）
├── server.mjs                  # 零依赖静态服务器（方式三）
├── 启动服务器.bat               # Windows 一键启动
├── tools/
│   ├── build-single.mjs        # 生成单文件 HTML
│   ├── build-apk.ps1           # 构建 APK（aapt2/javac/d8/apksigner）
│   ├── fetch-file.mjs          # 带进度的下载小工具
│   ├── make-icons.py           # 用 Pillow 重新生成图标
│   ├── mock-server.mjs         # 本地模拟 API（开发/测试）
│   └── e2e.mjs                 # 无头浏览器端到端截图测试
├── tests/core.test.mjs         # 核心逻辑单元测试
└── .github/workflows/pages.yml # GitHub Pages 自动部署
```

## 开发与测试

```bash
npm test                 # 24 项核心逻辑测试（Markdown / SSE / i18n / 格式化）
npm run build            # 重新生成 deepseek-mobile.html
npm start                # 本地服务器并打开浏览器
npm run mock             # 启动模拟 API：http://127.0.0.1:8787
```

模拟 API 模式下，把「设置 → API 地址」改成 `http://127.0.0.1:8787`，Key 随便填，即可在不消耗额度的情况下检查界面、流式输出、搜索来源与朗读。

端到端测试需要本机 Chrome/Edge 与远程调试端口：

```bash
# 1. 启动 npm start 与 npm run mock
# 2. 启动 Edge（示例）
msedge --headless=new --remote-debugging-port=9222 --user-data-dir=%TEMP%\dsm-edge about:blank
# 3. 运行
node tools/e2e.mjs
```

截图会输出到 `screenshots/`。

## 自己构建 APK：需要什么、怎么签名

不需要 PWABuilder，也不需要 Capacitor 或 Android Studio。本项目用的是 Android SDK 命令行工具（aapt2 / javac / d8 / zipalign / apksigner）加一个无第三方依赖的 WebView 壳。

### 1. JDK 17

只要有 `javac`、`keytool`、`jar` 即可：

- [Eclipse Temurin JDK 17](https://adoptium.net/temurin/releases/?version=17)（zip 解压即用）
- 或 Android Studio 自带的 JBR
- 或 Microsoft OpenJDK

### 2. Android SDK（两个包）

| 包 | 提供 |
| --- | --- |
| `build-tools;34.0.0` | `aapt2.exe`、`d8.bat`、`zipalign.exe`、`apksigner.bat`、`dexdump.exe` |
| `platforms;android-34` | `android.jar` |

获取方式：

- **方式 A（推荐给普通用户）**：安装 Android Studio → SDK Manager → 勾选 Android 14 (API 34) 与 Build-Tools 34。
- **方式 B（命令行工具）**：下载 [command-line tools](https://developer.android.com/studio#command-tools)，然后：

```bash
sdkmanager "platforms;android-34" "build-tools;34.0.0"
```

- **方式 C（直接下载 zip，不依赖 sdkmanager）**：本机就是这种方式，因为这里的 Java 访问 Google 仓库失败：

```
https://dl.google.com/android/repository/build-tools_r34-windows.zip
https://dl.google.com/android/repository/platform-34-ext7_r03.zip
```

全部解压后约 1.2 GB。不需要 Gradle、npm 或管理员权限。

### 3. 构建

把三个目录放到 `.android-build/`（build 脚本默认在这里找）：

```
.android-build/
├── jdk/jdk-17.x/
├── bt/android-14/            # build-tools 解压后的目录（34.0.0）
└── plat/android-34/android.jar
```

然后：

```powershell
powershell -ExecutionPolicy Bypass -File tools/build-apk.ps1
```

也可以显式传路径（或用 `DSM_JDK` / `DSM_BUILD_TOOLS` / `DSM_ANDROID_JAR` 环境变量）：

```powershell
powershell -ExecutionPolicy Bypass -File tools/build-apk.ps1 `
  -JdkPath "C:\path\to\jdk-17" `
  -BuildToolsPath "C:\path\to\build-tools\34.0.0" `
  -AndroidJarPath "C:\path\to\platforms\android-34\android.jar"
```

脚本会：编译资源 → 链接 APK → 编译 Java → d8 转 dex → 加入 APK → 以 `/` 分隔符加入 assets → zipalign → 签名 → 校验，产物是根目录下的 `DeepSeek-Mobile-1.0.3.apk`。

### 4. 签名：debug 与 release 的区别

- **Debug 签名**：Android Studio / Gradle 第一次构建会自动生成 `~/.android/debug.keystore`，密码 `android`。它是自动的、能直接安装，但只适合自己临时用，不要用于发布。
- **Release 签名**（本项目用的就是这种）：用 JDK 自带的 `keytool` 生成自己的密钥库：

```bash
keytool -genkeypair -v \
  -keystore android/keystore/deepseek-release.jks \
  -alias deepseek -keyalg RSA -keysize 2048 -validity 10000
```

再用 SDK 的 `apksigner` 签名（必须在 zipalign 之后）：

```bash
apksigner sign \
  --ks android/keystore/deepseek-release.jks \
  --out DeepSeek-Mobile-1.0.3.apk \
  android/build/aligned.apk

apksigner verify --print-certs DeepSeek-Mobile-1.0.3.apk
```

- **密钥就是身份**：以后用同一把钥匙签名，Android 才允许覆盖安装升级；丢了只能卸载重装。
- **不要泄露 release keystore**：本仓库里这份是个人自用示例（密码写在 `android/README.md`）。真正发布请生成新的密钥并离线保存；Google Play 还需要 AAB + Play App Signing。

### 5. 为什么不用 PWABuilder / Capacitor

- **PWABuilder** 是网页服务，不需要本地“安装”。它最适合已经部署到 HTTPS 的 PWA：输入网址 → Android → 生成 TWA APK/AAB，签名密钥可以在页面上生成并下载。TWA 还需要把 `assetlinks.json` 放到网站根目录，否则顶部会露出浏览器地址栏。
- **Capacitor** 是 npm 包 + JDK + Android SDK + Gradle，适合需要原生插件（相机、推送、文件系统等）的项目；构建命令是 `npx cap add android`、`npx cap sync`、`./gradlew assembleDebug`。
- 本项目选择了更轻的 WebView + 本地 loopback HTTP 服务器：APK 只有 0.16 MB，不需要 Gradle/Maven 依赖，功能与 PWA 一致。代价是原生能力有限（没有系统分享、推送等）。



## 许可与致谢

- 代码：[MIT](LICENSE)
- 灵感与部分交互参考：[deepseek-ai/chat-demo](https://github.com/deepseek-ai/chat-demo)（MIT）
- API 文档：[api-docs.deepseek.com](https://api-docs.deepseek.com)
- DeepSeek 名称与商标归其所有者所有；本项目为非官方客户端。

如果这个应用帮到了你，欢迎在 GitHub 上给项目点一个 Star。
