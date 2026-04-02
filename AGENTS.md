# AGENTS.md - Agent Consensus

AI 代理在本仓库的**唯一指南**。

## 项目概述

多模型议会系统：让多个 LLM 对同一议题进行结构化讨论，产出经过多模型校验的结果。

**开源项目**，与协作者共同开发。初版由主开发者提供。

## 架构

pnpm + Turborepo monorepo：

- `packages/core` — `@consensus/core`：类型定义、讨论模式、Provider 抽象
- `packages/web` — `@consensus/web`：Vue 3 + Vite + Tailwind + Pinia 前端
- `apps/api` — `@consensus/api`：Hono 后端，端口 8888

## 本地配置

- `config/local.json` — API Key 等敏感配置（**不进 git**）
- `data/consensus.db` — SQLite 数据库（**不进 git**）

首次使用时从 `config/local.json.example` 复制并填入你的 OpenRouter API Key。

## 硬性规则

- **CRITICAL**：`pnpm turbo run test`、`lint`、`build` 全通过。
- **CRITICAL**：含逻辑处（API / store / provider）须有单元测试。
- **NEVER**：`echo 'no tests yet'`、跳过 warning、TS `any`。
- **SHOULD**：动生产数据或难逆操作时，先备份或可逆说明。

## 命令

```bash
pnpm install                    # 安装依赖
pnpm turbo run dev              # 启动所有 dev server
pnpm turbo run test             # 运行测试
pnpm turbo run lint             # lint
pnpm turbo run typecheck        # 类型检查
pnpm turbo run build            # 构建
pnpm turbo run clean            # 清理
```

单独启动某个包：

```bash
pnpm --filter @consensus/api dev    # 只启动后端
pnpm --filter @consensus/web dev    # 只启动前端
```

## 工作流

1. **Explore**：读相关代码与测试。
2. **Plan**：大需求先写方案（对话内或 docs/ 下），与 User 确认后再动手。
3. **Code**：实现；复杂步骤用 todo 跟踪进度。
4. **Verify**：`pnpm turbo run test`、`typecheck`、`build` 全通过。
5. **Commit**：`type(scope): description`。改完即 commit。

## 代码约定

- Vue 3 `<script setup>` + Pinia
- Tailwind CSS
- 图标用 Lucide
- 组件 PascalCase · 函数 camelCase · 常量 `UPPER_SNAKE_CASE`
- 导出用 `export`，不要 `export default`（barrel 文件除外）
- 类型优先：先定义 interface/type，再写实现

## 讨论模式

### 模式 1：提案-评审（Proposal-Review）
Proposer 生成方案 → 多个 Reviewer 评分 → 平均分 >= 阈值则完成，否则修改后继续。

### 模式 2：圆桌讨论（Roundtable）
多个 Participant 同时发言 → Summarizer 汇总 → 最终输出。

## 端口

- API：`8888`（寓意发发发发）
- Web：`5173`（Vite 默认）
- Web 通过 Vite proxy 转发 `/api` 到后端

## 给协作者

1. Fork & Clone
2. `pnpm install`
3. 复制 `config/local.json.example` → `config/local.json`，填入你的 OpenRouter API Key
4. `pnpm turbo run dev` 启动开发
5. 改完跑 `pnpm turbo run test && pnpm turbo run typecheck` 再提 PR
