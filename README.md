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




## 许可与致谢

- 代码：[MIT](LICENSE)
- 灵感与部分交互参考：[deepseek-ai/chat-demo](https://github.com/deepseek-ai/chat-demo)（MIT）
- API 文档：[api-docs.deepseek.com](https://api-docs.deepseek.com)
- DeepSeek 名称与商标归其所有者所有；本项目为非官方客户端。

如果这个应用帮到了你，欢迎在 GitHub 上给项目点一个 Star。
