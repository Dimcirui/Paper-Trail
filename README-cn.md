# PaperTrail – 学术论文管理仪表板

本项目源自课程作业骨架。在课程提交完成后，我对其进行了全栈重构并集成了进阶 AI 能力。详细的开发历程与技术选型请参阅[设计笔记](docs/design-note-cn.md)。

**课程提交后的主要更新：**

- **数据库迁移** — MySQL → PostgreSQL + pgvector 支持
- **AI 集成** — RAG 流水线（语义搜索 + 自然语言问答）
- **Analytics 扩展** — 多维数据分析仪表板
- **DevOps** — 容器化部署与 CI/CD 工作流

---

PaperTrail 是面向教授、研究生及科研团队的学术论文管理平台。它将论文、合作者、发表场所、资助来源以及修订历史统一整合到一个关系型数据库中，并提供 AI 驱动的语义搜索与自然语言问答功能。

## 技术栈

- **前端 / API**：Next.js 16（App Router，API Routes 与 UI 并置）
- **ORM**：Prisma
- **数据库**：PostgreSQL 16 + pgvector（通过 Docker 部署）
- **语义搜索**：OpenAI `text-embedding-3-small`（标题 + 摘要向量化）
- **RAG 问答**：DeepSeek V4 Flash（通过 DeepSeek API 调用）

## 目录结构

```text
.
├── docker-compose.yml         # PostgreSQL 16 + pgvector 容器
├── papertrail-app/            # Next.js 16 应用（前端 + API）
│   ├── prisma/schema.prisma   # PaperTrail 关系数据模型
│   ├── scripts/               # 工具脚本（embedding 批量回填）
│   ├── src/app/api            # health、papers、ask、auth 等路由
│   └── src/app/dashboard/     # 带搜索与 Ask AI 的仪表板 UI
└── README.md                  # 项目概览 + 工作流程
```

## 系统前置要求

- **Docker Desktop / Docker Engine** — 用于运行 PostgreSQL + pgvector 容器。
  下载地址：<https://www.docker.com/products/docker-desktop>
- **Node.js 20.x**（LTS）— 驱动 Next.js 应用及 Prisma CLI。
  下载地址：<https://nodejs.org>，或通过 `nvm install 20` 安装。
- **git** — 用于克隆仓库。

## 完整启动流程

1. **启动数据库容器**

   ```bash
   docker compose up -d
   ```

   PostgreSQL 监听端口 `5432`。Adminer（数据库 GUI）地址：<http://localhost:8080>。

2. **准备环境**

   ```bash
   cd papertrail-app
   cp .env.example .env.local   # Windows CMD: copy .env.example .env.local
   npm install
   ```

   编辑 `.env.local`，填写以下变量：

   | 变量 | 值 |
   | --- | --- |
   | `DATABASE_URL` | `postgresql://papertrail:papertrail@localhost:5432/papertrail` |
   | `API_AUTH_TOKEN` | 任意密钥字符串，例如 `local-dev-token` |
   | `OPENAI_API_KEY` | 你的 OpenAI Key（用于生成 embedding） |
   | `DEEPSEEK_API_KEY` | 你的 DeepSeek API Key（用于 Ask AI 问答） |
   | `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |
   | `NEXT_PUBLIC_USER_ROLE` | `admin`（或 `principal_investigator` / `viewer`） |

3. **生成 Prisma 客户端 + 同步 Schema**

   ```bash
   npm run prisma:generate
   npm run db:push
   ```

4. **导入演示数据**

   ```bash
   npm run db:seed
   ```

5. **生成论文 Embedding**

   ```bash
   npm run db:backfill
   ```

   为所有论文生成 OpenAI embedding（标题 + 摘要），并以 pgvector 向量形式存储。语义搜索与 Ask AI 功能依赖此步骤。

6. **启动 Next.js 应用**

   ```bash
   npm run dev
   ```

   - <http://localhost:3000> — 首页
   - <http://localhost:3000/dashboard> — 主仪表板
   - <http://localhost:3000/api/health> — 环境检查

   **演示账号**（密码：`pass`）：

   | 角色 | 邮箱 |
   | --- | --- |
   | 管理员 | <admin@papertrail.local> |
   | 主要研究者 | <priya.natarajan@yale.edu> |
   | 贡献者 | <lena.becker@tum.de> |
   | 访客 | <viewer@papertrail.local> |

   **Adminer（数据库 GUI）** 地址 <http://localhost:8080>：
   - 数据库类型：PostgreSQL
   - 服务器：`db`
   - 用户名：`papertrail`
   - 密码：`papertrail`
   - 数据库：`papertrail`

7. **运行测试**

   ```bash
   npm run test
   npm run test:coverage
   ```

## 功能特性

### 语义搜索

在仪表板搜索框中输入自然语言查询，系统通过 pgvector 将论文与 OpenAI embedding（输入：`标题 + 摘要`）进行 cosine 相似度排序。若 embedding 不可用或查询带引号，则降级为大小写不敏感的关键词搜索。

### Ask AI（RAG 问答）

仪表板上的可折叠面板，支持自然语言提问（例如：*"哪些论文研究了 Transformer 架构？"*）。系统将：

1. 通过 OpenAI 对问题进行 embedding
2. 使用 pgvector 检索最相关的 5 篇论文
3. 将论文内容发送给 DeepSeek V4 Flash 生成有根据的回答
4. 返回回答及可点击的来源论文链接

基于角色的可见性控制：访客只能看到已发表（Published）的论文；管理员 / 主要研究者可查看全部状态。

## 常用脚本速查

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Next.js 开发服务器 |
| `npm run build` / `npm run start` | 生产构建 + 启动 |
| `npm run lint` | 对整个应用运行 ESLint |
| `npm run prisma:generate` | Schema 修改后重新生成 Prisma 客户端 |
| `npm run db:push` | 将 Prisma Schema 同步到开发数据库 |
| `npm run db:migrate` | 创建 / 应用迁移 |
| `npm run db:seed` | 导入演示数据 |
| `npm run db:backfill` | 为所有论文生成 / 刷新 embedding |
| `npm run db:studio` | 启动 Prisma Studio（数据库 GUI） |
| `npm run test` | 运行 Jest 测试 |
| `npm run test:coverage` | 生成 Jest 覆盖率报告 |
| `npm run test:mutation` | 运行 Stryker 变异测试 |

## 错误处理与安全兜底

- **API 路由**：验证所有输入并返回正确的 HTTP 状态码（400 / 401 / 403 / 404 / 500），每个 try/catch 在响应前均会记录错误日志。
- **基于角色的访问控制**：写操作需要 `admin` 或 `principal_investigator` 角色；硬删除仅限管理员；访客只能访问已发表的论文。
- **软删除**：论文永不物理删除 — `isDeleted` 标志控制可见性，`ActivityLog` 记录每次变更。
- **Embedding 失败兜底**：若论文创建 / 更新时 OpenAI 不可用，embedding 将静默跳过，搜索自动降级为关键词匹配。
- **LLM 失败兜底**：若 DeepSeek 不可用，Ask AI 端点将返回 500 并附带明确的错误信息。
