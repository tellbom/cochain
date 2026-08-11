# Cochain 前端改造与 RBAC 开发门禁计划

> 状态：P1 RBAC 门禁与 P2-P6 Mock 前端开发已完成；等待 P7 真实业务 API 环境与契约  
> 规划日期：2026-08-11  
> 当前范围：保持真实 Keycloak/RBAC 链路，完成 18 个业务页面的 Mock 契约、交互与验收；不猜测未提供的真实业务 API

## 1. 目标

将当前由其他项目复制而来的 Vue 3 前端收敛为独立的 `cochain` 项目，完成以下交付：

1. 在任何业务页面开发门禁放行前，完成 `cochain` 项目的 RBAC 初始化、索引刷新与真实 Keycloak 登录验证。
2. 以 `docs/界面设计需求文档.md` 的 18 个业务界面为唯一业务页面范围。
3. 业务数据阶段一使用本地 Mock，但 Keycloak 登录、RBAC project 授权、菜单裁剪和按钮权限必须连接真实服务，不能 Mock。
4. 后端就绪后，仅替换数据适配器，不重写页面、类型、分页、错误态或权限判断。
5. 页面采用左侧菜单、右侧主题内容的后台结构；视觉遵循 `DESIGN.md` 的 Apple 约束和蓝色基调。
6. 现有 RBAC 框架、权限中心页面和鉴权链路保持不动；本项目只初始化 Cochain 业务权限并改造业务界面。

## 2. 已核对事实

-   技术栈：Vue 3.4、Vite 4、TypeScript、Vue Router、Pinia、Element Plus、Axios。
-   现有项目已经具备 Keycloak 初始化、RBAC 独立 Axios 客户端、`X-Project` 请求头、远端菜单树转动态路由和 `v-auth` 按钮鉴权基础设施。
-   迁移源项目的 `flow`、`flow-web`、`/flow`、Process Center 代理、页面、逻辑、素材和备份已于 2026-08-11 完成清理；动态组件白名单已收敛到 Cochain 与权限中心。
-   当前 `.env.development` 已指向：
    -   RBAC：`http://192.168.124.2:5005`
    -   Keycloak realm：`http://192.168.124.2:18085/realms/master`
-   开发、生产环境与代码兜底均固定为 `VITE_RBAC_PROJECT=cochain`。
-   Keycloak client ID 已确认固定为 `cochain-web`，不得继续沿用复制体的 `flow-web`。
-   `auth/*` 权限管理菜单必须保留，并对 Cochain project super 显示。
-   现有 RBAC 框架已经过评估和线上测试，本轮不重构其客户端、动态路由、权限中心页面或后端服务。
-   RBAC/Keycloak 验收账号固定为 `196045`；密码由负责人通过安全渠道提供，不写入项目文件。
-   用户给出的模板路径 `E:\router\router\sq\rbac-bootstrap-dm.sql` 实际不存在；已只读定位到 `E:\router\router\sql\rbac-bootstrap-dm.sql`。
-   通用 RBAC 模板已复制为本项目专用脚本并改造成 Cochain 规则，完成 DM8 初始化、reindex 与真实登录验收。
-   当前目录不是 Git 工作树，后续实施前要先明确版本控制和回滚方式。
-   面向 Process Center Dashboard 的旧计划文件已删除，不作为本项目实施依据。

## 3. 范围边界

### 3.1 本项目范围

-   Cochain 品牌、环境变量、基础路由和应用壳层收敛。
-   18 个业务界面的信息架构、页面、Mock 数据、交互状态和权限控制。
-   Cochain 专用 RBAC DM8 初始化脚本、真实执行、索引刷新和验收证据。
-   Keycloak 登录与 RBAC 菜单/按钮权限联调。
-   后端 API 适配层和后续由 Mock 切换到真实 API 的任务。
-   可访问性、响应式、空态、加载态、错误态、禁用态和权限拒绝态。

### 3.2 P7 前不做

-   不开发 `docs/界面设计需求文档.md` 之外的新业务页；不额外发明 Dashboard。
-   不改后端接口契约，不假设文档中没有给出的字段。
-   不把 RBAC、Keycloak 或权限结果做成 Mock。
-   不把密钥、密码、Token 或数据库连接串提交到仓库。
-   不引入第二套组件系统；继续使用现有 Element Plus，并通过语义 Token 定制。
-   不重构 `src/api/backend/rbac/**`、现有 `auth/*` 页面或 RBAC 服务端；发现缺陷时停止扩展，单独提交证据和变更申请。

## 4. 设计方向

### 4.1 Design Read

Reading this as: an existing Vue enterprise procurement admin redesign for internal operators, with a calm Apple-like blue language, leaning toward Element Plus plus project-owned semantic tokens.

### 4.2 设计刻度

-   `DESIGN_VARIANCE: 4`：后台任务效率优先，允许有节奏的非对称信息层级，但不使用营销页式实验布局。
-   `MOTION_INTENSITY: 3`：只保留 hover、press、抽屉、状态切换等反馈动效，并支持 `prefers-reduced-motion`。
-   `VISUAL_DENSITY: 7`：表格与筛选密度较高，但保持 44px 最小触控目标和明确留白。

### 4.3 视觉系统

-   唯一交互强调色：Action Blue `#0066cc`；暗色表面链接可使用 `#2997ff`。
-   不采用 `ui-ux-pro-max` 建议中的琥珀色 CTA，因为它与 `DESIGN.md` 的单一强调色规则冲突。
-   画布以 `#ffffff`、`#f5f5f7`、`#fafafc` 为主；正文使用 `#1d1d1f`。
-   字体使用本地系统栈：`SF Pro Text/Display`、`system-ui`、`-apple-system`、`Segoe UI`、`Microsoft YaHei`、`sans-serif`，不依赖公网字体。
-   卡片和按钮不使用装饰性阴影；层级以表面色、细边线和留白表达。
-   圆角规则固定：输入/紧凑控件 8px，内容容器 18px，主操作按钮为 pill；不任意混用。
-   不使用装饰渐变、霓虹光、通用三等分卡片、Emoji 图标、手绘 SVG 或与业务无关的玻璃拟态。
-   图标继续使用项目已有的 Element Plus 图标体系，保持单一图标族。

### 4.4 布局

```text
┌──────────────────────────────────────────────────────────────┐
│ Cochain / 当前项目                          用户 / Project    │
├──────────────┬───────────────────────────────────────────────┤
│ 左侧 RBAC 菜单 │ 页面标题 / 面包屑 / 页面级主要操作             │
│              ├───────────────────────────────────────────────┤
│ 业务分组      │ 筛选区                                         │
│ 菜单项        ├───────────────────────────────────────────────┤
│              │ 表格、流程状态、详情抽屉、表单或日志内容          │
└──────────────┴───────────────────────────────────────────────┘
```

-   桌面端保持固定左侧菜单、右侧内容区。
-   小于 1024px 时菜单折叠，小于 768px 时转抽屉；宽表格保留横向滚动，不压缩关键列到不可读。
-   Apple 顶部导航规范只提取颜色、字体、间距、按压反馈和低阴影原则，不照搬营销站双层顶栏。

## 5. 信息架构

业务菜单仅覆盖需求文档中的 18 个界面，建议分组如下：

| 菜单分组     | 页面                                                                                   |
| ------------ | -------------------------------------------------------------------------------------- |
| 分包中心     | 分包批次管理、批次零件明细、工作包管理、工作包零件关联、供应商推荐结果                 |
| 供应商与绩效 | 供应商管理、供应商绩效管理、排名快照管理、供应商品类关联、轮流选取游标、零件历史供应商 |
| 规则与主数据 | 三级品类主数据、特殊品类配置、左右件识别规则、左右件手动维护、工作包容量配置           |
| 日志审计     | 业务操作日志、系统操作日志                                                             |

默认入口为“分包批次管理”，不新增业务 Dashboard。现有权限中心 `auth/*` 作为独立“权限管理”分组保留，对 Cochain project super 显示；其组件、接口和交互不在业务界面改造范围内。

## 6. RBAC 方案与前置门禁

### 6.1 原则

-   `X-Project` 固定为 `cochain`，不使用 `flow`、`oversia` 或 `__global__`。
-   Keycloak 负责身份认证，RBAC 服务负责项目准入、菜单树裁剪和按钮授权。
-   即使业务数据使用 Mock，应用启动仍必须完成真实 Keycloak session 与 `POST /api/auth/login`、`GET /api/admin/index`。
-   无项目授权时不得注册任何业务动态路由；直接访问受保护 URL 必须进入无权限流程。
-   页面菜单规则与操作按钮规则全部由 RBAC 返回，不能用前端静态菜单作为兜底。
-   业务接口仍携带同一个 Bearer Token；后端就绪后按文档中的 `@PreAuthorize` 权限前缀执行服务端鉴权。
-   Keycloak client 固定使用 `cochain-web`，验收账号固定使用 `196045`。
-   复用现有 RBAC 登录、菜单树、动态路由和 `v-auth` 实现；本计划不授权任何框架级改写。

### 6.2 Cochain 专用初始化脚本

不得直接把通用模板中的 `oversia` 改掉后覆盖共享文件。实施时以
`E:\router\router\sql\rbac-bootstrap-dm.sql` 为参考，在 Cochain 项目内生成可审计、可重复执行的专用脚本。

专用脚本至少包含：

1. `196045` 的管理员记录和 `cochain` project grant，初始为 project super。
2. bootstrap 管理组与成员关系。
3. 原样保留模板中与当前框架匹配的 `auth/*` 权限管理规则，并新增四个业务菜单目录、18 个页面菜单规则。
4. 每个页面的查看权限；有编辑行为的页面再按接口文档补齐 `query/page/save/update/delete`。
5. 核心特殊动作：`upload`、`fetch`、`package`、`recommend`、`run`、`export-result`、`enabled`、`generate`。
6. 权限码必须与 `docs/api-documentation.md` 的 `@PreAuthorize` 值完全一致。
7. 幂等 `MERGE`、显式状态、稳定的 rule code、校验查询和提交边界。
8. 不在业务项目脚本中创建或授权保留项目 `__global__`。

`rbac_api_permission_map` 是否需要登记 Cochain 业务 API，必须先由 RBAC 服务拓扑确认：若业务请求不经过 RBAC 服务网关，则该表只登记 RBAC 自身管理 API，不能写入无效映射来制造“已保护”的假象。

### 6.3 执行与验收顺序

1. 只读检查 RBAC/DM8/Keycloak 服务健康、DM8 表结构和现有 `cochain` 数据。
2. 导出或查询保存受影响记录，确认重复执行和回滚策略。
3. 使用 `E:\DM\bin\DIsql.exe` 执行专用脚本；凭据只从交互式环境注入。
4. Windows DIsql 执行前生成临时 GB18030 编码副本；不能只看退出码，必须检查输出中的 SQL 错误。
5. 查询 administrator、project grant、group/member、rule 和 permission map 实际行数及关键字段。
6. 调用 RBAC reindex 运维接口刷新 `rbac_rule_index`，再查询索引或规则接口验证。
7. 使用 Keycloak client `cochain-web` 和账号 `196045` 完成浏览器真实登录，确认响应中的 project 为 `cochain`。
8. 验证 18 个页面菜单均来自 `GET /api/admin/index`，刷新和深链接仍可恢复动态路由。
9. 使用未登录请求、缺失/错误 `X-Project` 和无效 Token 验证访问被拒绝；使用 `196045` 验证权限管理菜单、18 个业务菜单和按钮规则完整返回。
10. 以上证据全部通过后才开放页面开发门禁。

当前仅批准一个 project super 测试账号，因此本门禁不声称完成不同业务角色之间的细粒度裁剪验证。后续若要验收只读/操作员角色，需另行提供账号或批准临时授权方案。

## 7. Mock 与真实 API 的切换边界

### 7.1 分层

```text
页面 / 组合式函数
        │
        ▼
业务 Service 接口（稳定契约）
        │
   ┌────┴────┐
   ▼         ▼
Mock Adapter  HTTP Adapter
阶段一启用      后端完成后启用
```

-   页面禁止直接导入 Mock 文件或直接调用 Axios。
-   Service 类型以 `api-documentation.md` 为准：`Result<T>`、`PageData<T>`、字符串 ID 和枚举值不可漂移。
-   使用显式环境开关选择 `mock` 或 `api`，默认开发环境为 `mock`；RBAC 客户端不受此开关影响。
-   Mock 要模拟分页、筛选、CRUD、失败、空数据、上传结果、状态迁移和延迟，不能只有静态成功数组。
-   Mock 的分包状态机必须遵循 `DRAFT -> DATA_READY -> PACKAGED -> RECOMMENDED -> COMPLETED`。
-   后端地址在绑定阶段通过独立环境变量提供，不能复用 RBAC base URL。

### 7.2 API 绑定门禁

-   逐资源切换，不允许一次性把 18 个页面全部改为真实 API 后再排错。
-   每个资源先做契约对照，再做成功、空、校验失败、401、403、500 和文件流验证。
-   未提供的“通用导入/导出”接口不能凭 UI 文档自行拼接；保持禁用或标记待后端，直到接口合同确认。
-   Mock 与 API 两种模式都必须通过相同页面测试，不允许真实 API 模式出现专用页面分支。

## 8. 页面实现批次

### 批次 A：应用壳层与核心流程

-   Cochain 品牌壳层、左侧菜单、顶部用户区、面包屑、通用页面容器。
-   分包批次管理。
-   批次零件明细、工作包管理、工作包零件关联、推荐结果。

### 批次 B：供应商与绩效

-   供应商管理。
-   供应商绩效上传与查询。
-   排名快照生成与查询。
-   供应商品类关联、轮流游标、历史供应商。

### 批次 C：规则、主数据与审计

-   三级品类主数据、特殊品类、左右件规则、左右件手动、容量配置。
-   业务操作日志、系统操作日志。

每个页面都必须同时交付：路由规则、菜单规则、按钮规则、Mock 契约、加载/空/错误/无权限态、响应式行为和验收用例。

## 9. 质量门禁

### 9.1 自动检查

-   `npm run lint`
-   `npm run typecheck`
-   `npm run build`
-   按后续引入的测试框架执行 Service、状态机、权限和关键交互测试。
-   将复制体既有失败与本次变更导致的失败分开记录，不能把局部通过描述为全量通过。

### 9.2 视觉与交互检查

-   375、768、1024、1440px 四个宽度检查。
-   4.5:1 正文对比度、可见键盘 focus、语义化 button/nav/main、44px 触控目标。
-   `prefers-reduced-motion` 下无非必要动画。
-   所有可点击项有 hover/active/disabled/loading 反馈，且 hover 不引发布局位移。
-   表单必须有真实 label、帮助文本和就地错误，不使用 placeholder 代替 label。
-   全局只有一个蓝色强调色体系，不出现第二个营销 CTA 色。

### 9.3 RBAC 验收证据

-   DIsql 实际执行输出和执行后查询结果。
-   RBAC reindex 成功及索引后规则查询结果。
-   真实 Keycloak 登录、`X-Project: cochain`、`/api/auth/login`、`/api/admin/index` 网络证据。
-   `196045` 全量菜单/按钮证据，以及未登录、错误 project、无效 Token 的拒绝证据。
-   现有 `auth/*` 权限管理菜单无回归，18 个业务菜单、深链接和按钮规则全部可用。
-   只有全部证据齐全才将“RBAC 开发门禁”标记通过。

## 10. 已锁定决策与剩余前置条件

### 10.1 已锁定，后续 agent 不得自行修改

1. Keycloak client ID：`cochain-web`。
2. RBAC project：`cochain`。
3. RBAC/Keycloak 验收账号：`196045`，凭据不得写入仓库。
4. 保留并显示现有 `auth/*` 权限管理菜单。
5. RBAC 框架保持不动，只补充 Cochain 业务规则、执行初始化和线上回归。
6. 业务范围固定为需求文档中的 18 个页面，不新增业务 Dashboard。

### 10.2 剩余前置条件

1. **真实业务 API base URL 未提供**：不阻塞 Mock 阶段，但阻塞后续绑定。
2. **当前目录无 Git 元数据**：实施前必须确定版本库来源、分支和回滚基线。
3. **通用导入/导出描述与 API 文档不完全对齐**：没有明确接口的操作不能在真实绑定阶段自行发明。
4. **角色级裁剪暂不验收**：只有 project super 账号，当前只能验证框架拒绝链路和全量规则；不得把它表述为只读/操作员角色门禁已经通过。
