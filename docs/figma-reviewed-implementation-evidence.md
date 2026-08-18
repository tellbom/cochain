# Figma 评审定稿改造与门禁证据

> 核验日期：2026-08-18  
> 设计基准：`figma/Design RBAC Menu Interface` 本地下载工程  
> 验收口径：整体设计语言、布局结构、菜单信息架构与操作流程一致；不采用逐像素硬门禁。

## 已完成范围

- 后台壳层统一为 52px 顶栏、220px 侧栏、浅灰工作区、白色内容卡片与 Element Plus 表单/表格。
- 评审业务信息架构收敛为 6 个业务入口；项目默认“权限中心”继续作为第 7 个一级入口，包含接口权限映射、项目授权、菜单规则、管理员、权限组 5 个子页面。
- 原 18 个分散页面按评审稿合并为 6 个业务页面；工作台、详情、配置分栏与日志页签保留在对应页面内部。
- Mock 数据直接复用本地 Figma 工程的 `src/mock`，避免页面示例数据与定稿漂移。
- 登录恢复路径只接受当前可见菜单；已隐藏的旧权限中心路径不会再成为默认落页。

## 浏览器门禁

执行 `node scripts/figma-reviewed-gate.mjs`，通过真实 Keycloak 交互式登录后得到：

- Figma 基准中的 6 个业务菜单名称、顺序一致；应用额外保留项目默认权限中心及其 5 个子菜单。
- 顶栏 52px、侧栏 220px，整体布局方向一致。
- 6 个评审路由及页面标题全部加载成功。
- 默认落页为 `/cochain/subcontract/batch`。
- 1440px 桌面与 390px 移动端均无页面级横向溢出，移动端菜单按钮可见。
- 控制台错误、失败请求、HTTP 4xx/5xx 均为 0。

门禁截图存放于本地 `.tmp/`，该目录被 Git 忽略，不作为源码交付物。

## RBAC、DM8 与 Elasticsearch

- DM8 中可见菜单节点为 12 条：6 个业务 Menu、1 个权限中心 MenuDir、5 个权限中心子 Menu。
- 其余被合并的旧业务页面改为 `add_rules_only`：保留动态路由与按钮权限能力，但不再显示为独立业务菜单。
- RBAC cache flush 返回业务码 0，刷新项目列表包含 `cochain`。
- 官方 `rbac_rule_index` reindex 返回业务码 0；alias 仅指向一个新物理索引。
- Elasticsearch 中 `project=cochain` 精确为 88 条，RBAC health 为 `healthy`，失败 outbox 为 0。
- 原 `process-es` 容器已恢复，重启策略设为 `unless-stopped`。仅移除了指向 0 文档历史索引的重复 alias，没有删除物理索引。

## 静态质量检查

- `npm run typecheck`：通过。
- `npm run lint -- --quiet`：通过。
- `npm run build`：通过。
- 未修改 `package.json` 的依赖版本；继续使用 Vue 3.4、Element Plus 2.7 与现有 lockfile。

## 未扩大声明

- 当前 `.env` 仍为 `VITE_COCHAIN_USE_MOCK=true`，本次通过的是 Figma 业务交互与真实 Keycloak/RBAC 菜单链路，不声称真实业务 API 已绑定。
- 当前测试账号为 project super；不声称只读、操作员等非 super 角色的细粒度裁剪已经验收。
- 未改造的旧页面不纳入本次 Figma 定稿视觉验收。
