# Paper-Trail Design Note

> 记录项目从课程作业到生产可用系统的技术选型与演进历程。

---

## 一、项目背景与起点

**Paper-Trail** 起源于 CS 5200 数据库课程项目（2025-11-14），由 Hans (`hans2001`) 发起、Sheeran 参与协作，2026-03 起由 Sheeran (`Dimcirui`) 主导后续技术升级，迁移至 `Dimcirui/Paper-Trail` 仓库。

**定位**：学术论文管理仪表板（Publication Management Dashboard）。核心需求是为研究团队提供论文全生命周期管理（CRUD）、多维数据分析以及 AI 辅助检索能力。

**初始技术栈（2025-11-14, commit `32cdd89`）**：

| 层 | 技术 |
| --- | --- |
| 前端框架 | Next.js (App Router) + TypeScript |
| CSS | Tailwind CSS + PostCSS |
| ORM | Prisma |
| 数据库 | MySQL（Docker Compose） |
| 数据库直连 | `mysql2` 连接池 + 存储过程 |
| 认证 | 无（后期加入） |
| API 风格 | Next.js API Routes（RESTful） |
| 代码质量 | ESLint、Husky pre-commit/pre-push hooks |
| CI | GitHub Actions（Node.js 20、Jest + Stryker 变异测试） |

Prisma schema 在初始 commit 中已定义完整学术数据模型：`User`、`Paper`、`Author`、`Venue`、`Grant`、`Revision`、`ActivityLog`、`PaperAuthor`、`PaperGrant` 等。

---

## 二、演进时间线

### 阶段 1：课程骨架搭建（2025-11-14 ~ 11-17）

- `32cdd89` — 创建 `papertrail-app/`，引入 Next.js + Prisma + MySQL，定义完整 schema
- `32b771a` — 加入 `docker-compose.yml`、`database/stored_procedures.sql`（290 行存储过程）
- `cec35f5` — 引入 Husky + GitHub Actions CI pipeline
- `8b506a4` — 修复 MySQL 8.0 兼容性（prepared statements）
- `1713591` — 实现软删除功能（存储过程）
- `5486048` — 首个前端页面：DashboardPage 组件

### 阶段 2：认证系统 + 页面体系（2025-11-17 ~ 11-22）

- `a9405d7` — 登录功能 + 认证错误处理
- `d40a109` — JWT 认证（`jose`）+ `UserContext` + `middleware.ts` RBAC
- `41384eb` — 建立四大页面架构：Dashboard / Browser / Analytics / Manage
- `d55c345` — GET papers 端点搜索与过滤
- `99ecec1` — PATCH 端点 + ManagePage 论文编辑
- `12b6c27` — TrashPage 回收站 + RestoreButton + 角色权限完善

### 阶段 3：测试体系 + UI 完善（2025-11-23 ~ 11-24）

- `7c7eebd` — 引入 Jest + Stryker，添加 `route.test.ts`、`auth.test.ts`、`detail.test.ts`，创建 `auth.ts` 模块
- `125c1dc` — 重构认证流程，创建 `real_world_seed.sql`，引入 Chart.js 图表
- `9a50739` — 活动流（Activity Feed）+ 需求追踪文档
- `52a8d17` — Grant 关联/取消关联功能
- `efbaf0c` — Analytics 图表：Grant 数据可视化

### 阶段 4：代码冻结与课程提交（2025-12-02 ~ 12-04）

- `1adcfae` — "code freeze"：清理测试数据文件
- `455d486` — 生成 `final_submission.sql`（721 行完整数据库导出）
- `d6b6a45` — 软删除确认对话框

### 阶段 5：MySQL → PostgreSQL + 语义搜索（2026-03-14）

这是项目最重大的技术转型，在一天内完成全部四个迁移阶段：

- `b5f3769` — **数据库迁移**：Prisma provider 从 `mysql` → `postgresql`，删除 `mysql2`，Docker Compose 改用 `pgvector/pgvector:pg17`，所有 raw SQL 从 MySQL 语法改为 PostgreSQL 语法
- `a8b4865` — **Embedding 流水线**：创建 `src/lib/embeddings.ts`（OpenAI `text-embedding-3-small`）+ `scripts/backfill-embeddings.ts`（批量回填）
- `346dc37` — **语义搜索**：cosine 距离查询（`<->` 运算符），短查询/引号查询降级为 `ILIKE` 关键词搜索
- `be59ee0` — **Docker 部署**：Next.js standalone 多阶段 Dockerfile，docker-compose 增加 `app` 和 `adminer` 服务

### 阶段 6：RAG Q&A + DeepSeek V3（2026-03-18）

- `315e6e5` — **RAG 问答**：`/api/papers/ask` 端点，创建 `src/lib/llm.ts`（DeepSeek V3 集成），前端可折叠问答面板
- `ab4d446` — 确定使用火山引擎 Ark 端点（`deepseek-v3-2-251201`）；后升级至 `deepseek-v4-flash` 并迁移至 DeepSeek API（`api.deepseek.com`）

### 阶段 7：UI 统一化 + Analytics 扩展（2026-03-27 ~ 03-31）

- `db05417` — 清理残留 MySQL 语法，统一为 PostgreSQL 兼容写法
- 12 个连续 style commits — UI 设计统一：slate 色系、rounded-2xl 圆角、重设计 landing page、SVG 图标、aria-hidden 无障碍属性
- `cd792fa` — **Analytics 大扩展**：新增 `GET /api/analytics`（210 行，8 个数据查询），涵盖 Topic 分布、Venue 分层、周期分析、Top 贡献者、机构分布、投稿漏斗
- `a684b23` — `GET /api/analytics` 覆盖率测试

---

## 三、技术选型全景

### 前端

| 维度 | 技术 | 版本 |
| --- | --- | --- |
| 框架 | Next.js App Router | 16.0.3 |
| 语言 | TypeScript | ^5 |
| UI 渲染 | React | 19.2.0 |
| CSS | Tailwind CSS | ^4（v4 新架构） |
| 图表 | Chart.js + react-chartjs-2 | ^4.5.1 / ^5.3.1 |
| 表单验证 | Zod | ^4.1.12 |
| Toast 通知 | react-hot-toast | ^2.6.0 |
| JWT 处理 | jose | ^6.1.2 |
| 状态管理 | React Context（`UserContext`） | 无外部库 |
| 数据获取 | 原生 fetch（Server + Client Components） | 无 SWR/React Query |

### 后端

| 维度 | 技术 | 版本 |
| --- | --- | --- |
| 运行时 | Node.js | 20.x LTS |
| 框架 | Next.js API Routes（App Router `route.ts`） | 16.0.3 |
| ORM | Prisma | ^6.19.0 |
| 数据库 | PostgreSQL + pgvector | PG 17 |
| API 风格 | RESTful（GET / POST / PATCH / DELETE） | — |
| 认证 | Cookie-based JWT（jose）+ RBAC | — |
| 输入验证 | Zod（部分端点）+ 手动校验 | — |

### AI / 向量搜索

| 维度 | 技术 | 详情 |
| --- | --- | --- |
| Embedding 模型 | OpenAI `text-embedding-3-small` | 1536 维 |
| 向量数据库 | pgvector（PostgreSQL 扩展） | cosine 距离 `<->` |
| 向量字段 | `Unsupported("vector(1536)")` | 通过 `$queryRaw` 查询 |
| LLM | DeepSeek V4 Flash（`deepseek-v4-flash`） | DeepSeek API |
| LLM SDK | OpenAI SDK（兼容接口） | ^6.29.0 |
| RAG 流程 | 问题 embedding → pgvector top-5 → DeepSeek V3 生成 | `/api/papers/ask` |

### 基础设施

| 维度 | 技术 |
| --- | --- |
| 容器化 | Docker Compose（db + app + adminer，3 服务） |
| 数据库镜像 | `pgvector/pgvector:pg17` |
| 应用构建 | Next.js standalone 多阶段 Dockerfile |
| DB GUI | Adminer 4（端口 8080） |
| CI/CD | GitHub Actions（Node 20、Jest coverage + Stryker 变异测试） |
| 代码质量 | Husky pre-commit（lint-staged + ESLint）+ pre-push |
| 测试框架 | Jest ^30.2.0 + ts-jest ^29.4.5 |
| 变异测试 | Stryker Mutator ^9.4.0 |

---

## 四、选型动机

### MySQL → PostgreSQL + pgvector

核心痛点（记录于 `upgrade_plan.md`）：

> 搜索 "neural network" 无法找到 "deep learning" 相关论文；搜索 "climate" 无法匹配 "global warming" 相关工作。

关键词 `LIKE %query%` 无法捕捉语义相关性。pgvector 是 PostgreSQL-only 扩展，选择迁移到 PostgreSQL 意味着复用同一数据库实例，无需额外部署独立向量数据库（如 Pinecone、Milvus）。

### `text-embedding-3-small`

低成本，无需自建推理服务，1536 维向量质量满足需求。

### DeepSeek V4 Flash via DeepSeek API

通过 DeepSeek 自有 API（`api.deepseek.com`）调用，使用 OpenAI SDK 兼容接口。高性价比，切换供应商只需修改 `baseURL` 和 `model` 两个参数。

### 全栈 Next.js（无独立后端服务）

前后端共享同一 Next.js 应用（API Routes 与 UI 页面并置），简化部署（单容器）、共享 TypeScript 类型定义，适合当前项目规模。

### Prisma `$queryRaw` 处理向量查询

Prisma 不原生支持 pgvector 类型和运算符，向量字段声明为 `Unsupported("vector(1536)")`，所有相似度查询通过 `$queryRaw` 完成。

### 异步 Embedding 生成

论文保存时异步生成 embedding，失败时静默降级为关键词搜索。务实的最小可行方案，后续可升级为 BullMQ 队列。

---

## 五、当前状态与待办

### 已完成

- 论文 CRUD 全生命周期（创建、编辑、详情、软删除、回收站恢复）
- 认证与权限（JWT 登录/登出，4 种角色 RBAC：admin / principal_investigator / contributor / viewer）
- 语义搜索（OpenAI embedding + pgvector cosine 排序，短查询降级为 ILIKE）
- RAG Q&A（embedding 检索 top-5 → DeepSeek V3 生成答案 + 来源引用）
- Analytics 仪表板（Phase 1 + 2.1/2.2 + 3.1 全部完成）：
  - Topic 分布横向 Bar
  - Venue 分层分析（Doughnut + ranking Bar）
  - 提交到发表周期分析（KPI 卡片 + Line chart）
  - Top 10 贡献者 + Top 10 机构分布
  - 投稿漏斗（Draft → Submitted → ... → Published 转化率）
- Docker 部署（PG + App + Adminer 完整 compose）
- CI/CD（GitHub Actions：Jest coverage + Stryker 变异测试）
- UI 统一化（slate 色系、rounded-2xl 圆角、SVG 图标、aria-hidden 无障碍）

### 待做

| 优先级 | 项目 | 类别 |
| --- | --- | --- |
| 中 | Analytics 2.3：每篇论文平均作者数（按年） | Analytics Phase 2 |
| 中 | Analytics 3.2：各阶段平均停留时间（利用 ActivityLog 相邻 status 时间差） | Analytics Phase 3 |
| 低 | Analytics 3.3：Stale Draft 监控面板 | Analytics Phase 3 |
| 低 | Analytics 4.1：研究方向聚类（k-means on embeddings） | Analytics Phase 4 - AI |
| 低 | Analytics 4.2：Topic 相关性热力图 | Analytics Phase 4 - AI |
| 低 | Analytics 4.3：搜索 + analytics 联动 | Analytics Phase 4 - AI |
| 中 | Grant 独立管理 UI（目前仅在 manage 视图中关联，缺少独立增删改查界面） | CRUD 完善 |
| 中 | 全量 Zod 验证（当前仅部分端点使用 Zod，其余手动校验） | 健壮性 |
