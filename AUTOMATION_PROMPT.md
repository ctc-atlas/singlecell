# “单细胞大模型文献简报”自动化追加说明

在完成每日检索与中文简报后，将结构化结果同步到 GitHub 远端仓库 `git@github-ctc-atlas:ctc-atlas/singlecell.git`，使 GitHub Pages `https://ctc-atlas.github.io/singlecell/` 自动更新。

## 仓库更新流程

1. 读取自动化记忆文件，确认上次检索窗口和已收录 DOI/链接。
2. 不要直接在用户日常使用的主工作树里写入。先在仓库根目录执行 `scripts/prepare_sync_worktree.sh`，它会校验 `origin` 是否为 `git@github-ctc-atlas:ctc-atlas/singlecell.git`，`git fetch origin main`，并返回一个基于 `origin/main` 的临时干净 worktree 路径。
3. 后续所有读写、校验、提交和推送都在该临时 worktree 中完成；这样即使主工作树存在与本任务无关的未提交改动，也不会阻塞每日同步。
4. 进入临时 worktree 后，读取其中的 `data/briefs.json` 最新内容。
5. 以 DOI 为第一去重键；无 DOI 时使用规范化原文链接，再无链接时使用标准化标题。
6. 新条目按既有 JSON 字段补全；不得删除历史条目。论文修订或正式发表时更新原条目，并在 `updateType` 中准确标注。
7. `categories` 可多选，但只能使用下列固定分类：
   - 单细胞基础模型
   - 虚拟细胞与扰动
   - 空间与时空组学
   - 多组学与调控
   - 细胞图谱与数据底座
   - 测序与方法学
8. `evidence` 只能是：`同行评审`、`预印本`、`观点与解读`。
9. `priority` 从 1 开始按当前重要性排序；历史条目可顺延，但不得因“今日无新增”而删除。
10. 更新 `updatedAt` 和 `statusMessage`，并在 `data/briefs.json` 顶层写入 `sync` 对象：`state` 只能是 `success` 或 `failed`，同时补全 `updatedAt`、`commit`、`url`、`message`。
11. 创建或更新 `reports/YYYY-MM-DD.md`，保存当日简报、检索来源、关键词和“无高相关更新”结论（如适用），并固定增加“GitHub 同步状态”小节，明确写出成功/失败、提交哈希、网页地址；失败时写具体原因。
12. 在临时 worktree 中校验 `data/briefs.json` 可解析，并运行 `node --check app.js`。
13. 只暂存 `data/briefs.json` 和本次 `reports/YYYY-MM-DD.md`；有实际变化时提交，提交信息使用 `Update literature brief YYYY-MM-DD`，然后执行 `git push origin HEAD:main`。不得 force push。
14. 推送成功后，在临时 worktree 中回填 `sync.success` 元数据；若需要第二个提交刷新 `sync` 字段，继续推送到 `main`。
15. 结束前执行 `git -C <主仓库路径> worktree remove --force <临时 worktree 路径>` 清理临时目录；若清理失败，在输出中说明残留路径，但不要影响同步结果判断。
16. 完成远程写入后，在 Codex 输出中明确列出：新增数、修订数、累计数、更新过的仓库文件、提交哈希、GitHub 同步状态和网页地址。

## 写作与事实要求

- 优先使用 DOI、PubMed、期刊页或预印本原始页面。
- 明确区分同行评审、预印本、评论/观点与代码数据发布。
- `summary` 使用 2–4 句说明研究问题、技术路线与核心结论；每条必须补全 `details.methods`、`details.findings`、`details.limitations`，分别写方法与数据、主要结果、局限与证据边界。
- `relevance` 说明与单细胞大模型/虚拟细胞/测序方向的关联；`followUp` 给出具体后续观察点。
- 不夸大结论；无法从原始来源确认的细节不写入 JSON。
