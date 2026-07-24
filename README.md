# 单细胞大模型文献简报

静态 GitHub Pages 网站，用于持续汇总单细胞基础模型、虚拟细胞、空间组学、细胞图谱、测序技术与相关 AI 生物模型文献。

## 文件结构

- `index.html`：页面结构
- `styles.css`：响应式视觉样式
- `app.js`：分类统计、全文检索、年份/方向/状态/来源筛选与排序
- `data/briefs.json`：累计结构化文献数据；每条含方法、结果与局限的详细解读
- `data/briefs.json` 顶层 `sync`：最近一次 GitHub Pages 同步状态、提交哈希与网页地址
- `reports/`：每日中文简报归档
- `scripts/rebuild_history.mjs`：经来源核对的历史记录重建脚本
- `scripts/prepare_sync_worktree.sh`：创建基于 `origin/main` 的临时干净 worktree，供自动化安全提交每日简报
- `AUTOMATION_PROMPT.md`：Codex 每日任务的远程同步规范

当前已回填 45 条历史记录。网页按论文首次发布或最近修订日期分组展示；每篇文献均可展开阅读“方法与数据、主要结果、局限与证据边界”，并支持按年份筛选。

## GitHub Pages

仓库发布后，在 **Settings → Pages** 中选择 **Deploy from a branch**，分支选择 `main`，目录选择 `/ (root)`。目标地址为：

<https://ctc-atlas.github.io/singlecell/>

页面不依赖构建工具，提交到 `main` 后可直接由 GitHub Pages 发布。

从 `2026-07-21` 起，每日日报会固定写出 “GitHub 同步状态”，站点头图也会直接显示最近一次同步成功或失败。
从 `2026-07-24` 起，自动化建议固定通过临时 worktree 同步，这样主工作树里的本地改动不会阻塞 GitHub Pages 更新。
