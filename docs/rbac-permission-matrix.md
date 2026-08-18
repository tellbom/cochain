# Cochain RBAC 权限矩阵

> 任务：T011、T013  
> Project：`cochain`  
> 身份源：Keycloak  
> 菜单与按钮源：RBAC `GET /api/admin/index`  
> 业务接口鉴权源：业务服务 `@PreAuthorize`

## 1. 边界结论

-   `rbac_rule` 负责四个业务目录、18 个页面菜单和页面按钮裁剪。
-   页面菜单的 `permission_code` 使用该资源真实分页权限，例如 `subcontract:batch:page`。
-   页面按钮的 `permission_code` 与 `docs/api-documentation.md` 中的 `@PreAuthorize` 值完全一致。
-   `rbac_api_permission_map` 只保护 RBAC 服务自身的 `/api/admin`、`/api/group`、`/api/rule`、`/api/api-map`、`/api/project-grant` 和 `/api/search` 路由。
-   Cochain 业务 API 的合同地址为独立业务服务 `http://{host}:8080`，现有 Vite 配置也将 RBAC 与业务代理分开。RBAC 的全局 `RbacAuthorizationFilter` 只运行在 RBAC API 进程内，因此不登记 `/api/subcontract/**` 等业务路由，避免制造“已由 RBAC 网关保护”的假象。
-   业务服务就绪后仍必须以 Bearer Token 和服务端 `@PreAuthorize` 做最终鉴权；前端 `v-auth` 只负责可见性，不能替代服务端拒绝。

## 2. 菜单矩阵

| 分组         | 页面 rule_code / name / path      | 页面 permission_code                   | 组件（规划路径）                                                       | 页面行为                                       |
| ------------ | --------------------------------- | -------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------- |
| 分包中心     | `subcontract/batch`               | `subcontract:batch:page`               | `/src/views/backend/cochain/subcontract/batch/index.vue`               | 查询、CRUD、上传、抓取、分包、推荐、编排、导出 |
| 分包中心     | `part/batch-part`                 | `part:batch-part:page`                 | `/src/views/backend/cochain/part/batch-part/index.vue`                 | 分页、详情；未提供的导入/导出端点不授权        |
| 分包中心     | `work/package`                    | `work:package:page`                    | `/src/views/backend/cochain/work/package/index.vue`                    | 分页、详情                                     |
| 分包中心     | `package/part`                    | `package:part:page`                    | `/src/views/backend/cochain/package/part/index.vue`                    | 分页、详情                                     |
| 分包中心     | `package/supplier-recommendation` | `package:supplier-recommendation:page` | `/src/views/backend/cochain/package/supplier-recommendation/index.vue` | 分页、详情                                     |
| 供应商与绩效 | `supplier/supplier`               | `supplier:supplier:page`               | `/src/views/backend/cochain/supplier/supplier/index.vue`               | 查询、CRUD、启停                               |
| 供应商与绩效 | `supplier/performance`            | `supplier:performance:page`            | `/src/views/backend/cochain/supplier/performance/index.vue`            | 分页、详情、上传绩效                           |
| 供应商与绩效 | `supplier/ranking-snapshot`       | `supplier:ranking-snapshot:page`       | `/src/views/backend/cochain/supplier/ranking-snapshot/index.vue`       | 分页、详情、生成快照                           |
| 供应商与绩效 | `supplier/category`               | `supplier:category:page`               | `/src/views/backend/cochain/supplier/category/index.vue`               | 查询、新建关联、解除关联                       |
| 供应商与绩效 | `round/robin-cursor`              | `round:robin-cursor:page`              | `/src/views/backend/cochain/round/robin-cursor/index.vue`              | 默认只读                                       |
| 供应商与绩效 | `part/history-supplier`           | `part:history-supplier:page`           | `/src/views/backend/cochain/part/history-supplier/index.vue`           | 默认只读；导入/导出待合同确认                  |
| 规则与主数据 | `part/category-master`            | `part:category-master:page`            | `/src/views/backend/cochain/part/category-master/index.vue`            | 查询、CRUD                                     |
| 规则与主数据 | `special/category-config`         | `special:category-config:page`         | `/src/views/backend/cochain/special/category-config/index.vue`         | 查询、CRUD                                     |
| 规则与主数据 | `left/right-rule`                 | `left:right-rule:page`                 | `/src/views/backend/cochain/left/right-rule/index.vue`                 | 查询、CRUD                                     |
| 规则与主数据 | `left/right-manual`               | `left:right-manual:page`               | `/src/views/backend/cochain/left/right-manual/index.vue`               | 查询、CRUD；导入/导出待合同确认                |
| 规则与主数据 | `part/type-package-config`        | `part:type-package-config:page`        | `/src/views/backend/cochain/part/type-package-config/index.vue`        | 查询、受控修改                                 |
| 日志审计     | `operation/log`                   | `operation:log:page`                   | `/src/views/backend/cochain/operation/log/index.vue`                   | 只读查询；导出待合同确认                       |
| 日志审计     | `system/operate-log`              | `system:operate-log:page`              | `/src/views/backend/cochain/system/operate-log/index.vue`              | 只读查询；导出待合同确认                       |

## 3. 按钮与 API 追溯矩阵

`rule_code` 等于 `<页面 rule_code>/<action>`。前端在页面内使用 `v-auth="'<action>'"`，现有路由工具会将其还原为完整 rule code。

| 页面                              | action                     | permission_code                         | API / 说明                                     |
| --------------------------------- | -------------------------- | --------------------------------------- | ---------------------------------------------- |
| `subcontract/batch`               | `query`                    | `subcontract:batch:query`               | `GET /api/subcontract/batch/{id}`、`/list`     |
|                                   | `save`                     | `subcontract:batch:save`                | `POST /api/subcontract/batch`                  |
|                                   | `update`                   | `subcontract:batch:update`              | `PUT /api/subcontract/batch`                   |
|                                   | `delete`                   | `subcontract:batch:delete`              | `DELETE /api/subcontract/batch[/{id}]`         |
|                                   | `upload`                   | `subcontract:batch:upload`              | `POST /api/subcontract/batch/upload`           |
|                                   | `fetch`                    | `subcontract:batch:fetch`               | `POST /api/subcontract/batch/fetch`            |
|                                   | `package`                  | `subcontract:batch:package`             | `POST /api/subcontract/batch/{id}/package`     |
|                                   | `recommend`                | `subcontract:batch:recommend`           | `POST /api/subcontract/batch/{id}/recommend`   |
|                                   | `run`                      | `subcontract:batch:run`                 | `POST /api/subcontract/batch/{id}/run`         |
|                                   | `export-result`            | `subcontract:batch:export-result`       | `GET /api/subcontract/batch/{id}/export`       |
| `part/batch-part`                 | `query`                    | `part:batch-part:query`                 | 详情与非分页列表                               |
| `work/package`                    | `query`                    | `work:package:query`                    | 详情与非分页列表                               |
| `package/part`                    | `query`                    | `package:part:query`                    | 详情与非分页列表                               |
| `package/supplier-recommendation` | `query`                    | `package:supplier-recommendation:query` | 详情与非分页列表                               |
| `supplier/supplier`               | `query`                    | `supplier:supplier:query`               | 详情与非分页列表                               |
|                                   | `save`                     | `supplier:supplier:save`                | 新增供应商                                     |
|                                   | `update`                   | `supplier:supplier:update`              | 编辑及 `PUT /api/supplier/{id}/enabled`        |
|                                   | `delete`                   | `supplier:supplier:delete`              | 单个/批量删除                                  |
| `supplier/performance`            | `query`                    | `supplier:performance:query`            | 详情与非分页列表                               |
|                                   | `upload`                   | `supplier:performance:upload`           | `POST /api/supplier/performance/upload`        |
| `supplier/ranking-snapshot`       | `query`                    | `supplier:ranking-snapshot:query`       | 详情与非分页列表                               |
|                                   | `generate`                 | `supplier:ranking-snapshot:generate`    | `POST /api/supplier/ranking-snapshot/generate` |
| `supplier/category`               | `query`                    | `supplier:category:query`               | 详情与非分页列表                               |
|                                   | `save`                     | `supplier:category:save`                | 建立关联                                       |
|                                   | `delete`                   | `supplier:category:delete`              | 解除关联                                       |
| `round/robin-cursor`              | `query`                    | `round:robin-cursor:query`              | 只读详情与列表                                 |
| `part/history-supplier`           | `query`                    | `part:history-supplier:query`           | 只读详情与列表                                 |
| `part/category-master`            | `query/save/update/delete` | `part:category-master:<action>`         | 标准 CRUD 对应端点                             |
| `special/category-config`         | `query/save/update/delete` | `special:category-config:<action>`      | 标准 CRUD 对应端点                             |
| `left/right-rule`                 | `query/save/update/delete` | `left:right-rule:<action>`              | 标准 CRUD 对应端点                             |
| `left/right-manual`               | `query/save/update/delete` | `left:right-manual:<action>`            | 标准 CRUD 对应端点                             |
| `part/type-package-config`        | `query`                    | `part:type-package-config:query`        | 详情与非分页列表                               |
|                                   | `update`                   | `part:type-package-config:update`       | 修改容量上限                                   |
| `operation/log`                   | `query`                    | `operation:log:query`                   | 只读详情与列表                                 |
| `system/operate-log`              | `query`                    | `system:operate-log:query`              | 只读详情与列表                                 |

页面本身的分页权限由菜单 rule 承载，不再创建重复的 `page` 按钮。文档中没有真实端点的通用导入、导出、模板下载和游标手动编辑不创建按钮规则。

## 4. 现有权限中心保留范围

以下 `auth/*` 菜单、路由和按钮继续保留并显示在“权限中心”目录中：

-   API Permission Map、Project Grants、Menu Rules、Administrators、Permission Groups。
-   Administrators 的 `add/del/edit/index`。
-   Permission Groups 的 `add/del/edit/index`。
-   Menu Rules 的 `add/del/edit/index/sortable`。

不保留复制体 Dashboard，也不新增 Cochain Dashboard。

## 5. 当前真实门禁状态（2026-08-18 复核）

-   Keycloak `master` realm：HTTP 200。
-   SSH `192.168.124.2:2223`：已取得 `SSH-2.0-OpenSSH_7.4` banner。
-   DM8 `192.168.124.2:5236`：`cochain` 保留 88 条活动规则；可见菜单节点为 12 条（6 个业务 Menu、权限中心 MenuDir、5 个权限子 Menu），其余被合并的旧业务页面为 `add_rules_only`。
-   RBAC `192.168.124.2:5005/rbacServer`：health 为 `healthy`，cache flush 与 `rbac_rule_index` 官方 reindex 均返回业务码 0。
-   Elasticsearch：`rbac_rule_index` alias 仅指向一个新物理索引，`project=cochain` 为 88 条。
-   Keycloak：真实交互登录成功，浏览器显示 6 个评审业务菜单以及权限中心和 5 个权限子菜单，默认落页为分包中心。

本轮只验证 project super 的完整可见性与链路，不扩展声称非 super 角色裁剪已经完成。
