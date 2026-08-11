# Cochain P1 RBAC 门禁证据

> 核查日期：2026-08-11  
> 范围：T004、T010-T016  
> 凭据：未写入本文档、仓库文件或命令参数

## 1. 版本与回滚基线

-   当前 `E:\Web\cochain` 自身没有 `.git`。
-   复制体的 `src`、`public`、`types`、依赖锁文件和主要配置与 `E:\Web\flow\web` 完全一致，差异数为 0。
-   可恢复来源：`https://github.com/tellbom/flow.git`，分支 `master`，提交 `469ed1cf8a3db24f85d7efdc786924ff3c860b77`。
-   该来源仅作为复制前基线，不代表 Cochain 应继续提交到 `flow.git`。新的 Cochain 远端仍需项目负责人确认。

## 2. 应用层连通性

| 目标                                                 | 证据                                      | 结论                   |
| ---------------------------------------------------- | ----------------------------------------- | ---------------------- |
| SSH `192.168.124.2:2223`                             | `SSH-2.0-OpenSSH_7.4`                     | 应用层可达             |
| DM8 `192.168.124.2:5236`                             | DIsql `SELECT 1 FROM DUAL` 返回 1         | 数据库会话可用         |
| Keycloak `192.168.124.2:18085/realms/master`         | HTTP 200 JSON                             | Realm 可达             |
| RBAC `192.168.124.2:5005/rbacServer/ops/health`      | HTTP 200，服务 healthy，失败 outbox 为 0  | 运维端点可用           |
| RBAC `192.168.124.2:5005/rbacServer/api/auth/login`  | 有效令牌 HTTP 200；缺失/无效令牌 HTTP 401 | 登录桥接与拒绝链路有效 |
| RBAC `192.168.124.2:5005/rbacServer/api/admin/index` | 有效令牌及 `X-Project: cochain` HTTP 200  | 菜单端点可用           |

RBAC 在 5005 端口使用 `/rbacServer` 应用前缀。此前直接访问端口根路径得到的 404 不是服务缺失，而是遗漏了该部署前缀。

## 3. DM8 执行前核查

-   已读取六张实际表的全部列：`rbac_administrator`、`rbac_project_grant`、`rbac_group`、`rbac_group_member`、`rbac_rule`、`rbac_api_permission_map`。
-   已核对唯一约束：userid、userid+project、group_code+project、userid+group_code+project、rule_code+project、project+http_method+route_pattern。
-   首次执行前 `cochain` 在 grant/group/member/rule/api-map 中均为 0 行。
-   账号 `196045` 的 administrator 已存在，专用脚本不会覆盖现有 username。

## 4. T014 执行证据

-   源文件：`sql/cochain-rbac-bootstrap-dm.sql`。
-   执行方式：生成 GB18030 临时副本；DIsql 以 `/NOLOG` 启动；凭据经重定向标准输入注入。
-   首次执行：exit code 0，完整输出 62,919 字符，stderr 为空，未出现错误、失败、异常、语法错误、无效对象或唯一约束冲突。
-   幂等重跑：exit code 0，完整输出 32,223 字符，同样无失败标志。
-   两次执行后均由脚本删除临时配置表；临时转码文件已清空并移出交付文件集合。

独立执行后查询结果：

| 检查项                        | 实际值 | 期望值 |
| ----------------------------- | -----: | -----: |
| administrator `196045`        |      1 |      1 |
| `cochain` project super grant |      1 |      1 |
| bootstrap group               |      1 |      1 |
| bootstrap member              |      1 |      1 |
| Active rules                  |     88 |     88 |
| 业务页面                      |     18 |     18 |
| 业务按钮                      |     47 |     47 |
| RBAC API mappings             |     33 |     33 |
| 业务 API 误映射               |      0 |      0 |
| 孤儿 parent rule              |      0 |      0 |
| `flow`/Dashboard 旧标识       |      0 |      0 |

回滚脚本：`sql/cochain-rbac-rollback-dm.sql`。它只删除 `project='cochain'` 的项目级数据，保留共享 administrator 记录。

## 5. Enforcement 拓扑结论

-   RBAC `RbacAuthorizationFilter` 是 `Rbac.Api` 进程内的全局 MVC filter。
-   `RoutePatternApiPermissionMapper` 只匹配进入该进程的请求路径。
-   Cochain 业务 API 合同使用独立的 8080 服务，现有前端配置也将 RBAC 与业务代理分开。
-   因此只登记 RBAC 自身管理 API；业务接口依赖业务服务 `@PreAuthorize`，前端菜单和 `v-auth` 只做界面裁剪。

## 6. T015 索引与缓存刷新证据

-   首次调用官方 reindex 接口发现 `rbac_rule_index` alias 同时指向两个物理索引；其中 `rbac_rule_index_v20260722_000` 为 0 文档，另一索引为 177 文档。
-   仅移除 0 文档索引的 alias 绑定，未删除任何物理索引或业务文档。
-   重新调用 `POST /rbacServer/ops/reindex` 返回 HTTP 200、业务码 0，新索引为 `rbac_rule_index_v20260811_031724_fdc3`，总文档数 265。
-   调用 `POST /rbacServer/ops/cache-flush` 返回业务码 0，刷新项目包含 `cochain`。
-   刷新后 alias 只指向一个物理索引，Elasticsearch 中 `project=cochain` 精确为 88 条。

## 7. T016 Keycloak 与授权证据

-   在 master realm 创建独立 public client `cochain-web`，启用 Authorization Code 标准流程与 PKCE S256。
-   redirect URI 与 web origin 仅允许本地开发端口 1919 的 `localhost`/`127.0.0.1`；用于无浏览器门禁验证的 Direct Access Grant 已在验证后关闭。
-   access token 包含 `userid=196045` 与 `rbac-api` audience；未将密码或 token 写入仓库和本文档。
-   `POST /api/auth/login` 返回 HTTP 200、业务码 0；`GET /api/admin/index` 返回 HTTP 200、业务码 0，管理员项目为 `cochain`、project super 为 true。
-   菜单树返回 5 个根节点，其中业务部分精确为 4 个目录、18 个页面、47 个按钮；现有 `auth/*` 权限中心菜单仍在。
-   缺失令牌与无效令牌访问 login 均返回 HTTP 401；缺失或错误 `X-Project` 访问 index 均返回 HTTP 403，reason 为 `ProjectNotAuthorized`。
-   本轮只验证 project super 身份的完整可见性与拒绝链路，不声称只读/操作员之间的细粒度角色裁剪已验收。

## 8. 剩余基线项

-   T004 部分未关闭：复制前回滚基线已确认，但新的 Cochain Git 远端和目标分支未定义。

## 9. 门禁结论

P1 的 DM8、RBAC health、reindex、cache flush、Elasticsearch 投影、Keycloak token、login/index 正向链路和主要拒绝链路均已通过，可以进入 P2 及后续代码开发。T004 尚缺新的 Cochain Git 远端，但已有逐文件一致的可恢复复制前基线；该项继续登记为交付治理待办，不再阻塞可逆的本地开发。
