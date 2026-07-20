# 单细胞大模型文献简报

静态 GitHub Pages 网站，用于持续汇总单细胞基础模型、虚拟细胞、空间组学、细胞图谱、测序技术与相关 AI 生物模型文献。

## 文件结构

- `index.html`：页面结构
- `styles.css`：响应式视觉样式
- `app.js`：分类统计、检索、筛选与排序
- `data/briefs.json`：累计结构化文献数据
- `reports/`：每日中文简报归档
- `AUTOMATION_PROMPT.md`：Codex 每日任务的远程同步规范

## GitHub Pages

仓库发布后，在 **Settings → Pages** 中选择 **Deploy from a branch**，分支选择 `main`，目录选择 `/ (root)`。目标地址为：

<https://jianqing666.github.io/singlecell/>

页面不依赖构建工具，提交到 `main` 后可直接由 GitHub Pages 发布。
