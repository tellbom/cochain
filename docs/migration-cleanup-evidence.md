# Cochain 迁移源项目清理证据

> 日期：2026-08-11  
> 任务：T025

## 保留边界

-   Keycloak 登录、PKCE、刷新与登出。
-   RBAC 独立客户端、真实 `X-Project: cochain`、动态菜单/路由、按钮权限与权限中心。
-   Cochain 18 个业务页面、Mock/HTTP 适配层和单一 Element Plus 设计系统。
-   RBAC 通用 `tab/link/iframe` 菜单类型。

## 删除边界

-   旧 `workflow/todo/bpmn/frontend`、Dashboard、CRUD/module/routine/security/user 页面及 API。
-   旧多布局、会员中心、终端、编辑器、图表、Office、流程表单、二维码与相关依赖。
-   27 个旧二进制素材（含源项目 favicon）、7 个旧项目 zip 备份、旧 dashboard 计划文件。
-   未引用的工作流 iframe bridge、登录气泡动画、随机/校验工具和终端任务常量。

## 防复活措施

-   静态路由只注册 Cochain 后台基础路由和登录/错误页。
-   动态组件只扫描 `src/views/backend/cochain/**/*.vue` 与 `src/views/backend/auth/**/*.vue`。
-   RBAC project 在 `.env`、development、production 与客户端兜底中均为 `cochain`。
-   权限中心共享表格从 107 处 `--wf-*` 迁移到 `--co-*` Token。

## 验证

| 门禁                     | 结果                                                         |
| ------------------------ | ------------------------------------------------------------ |
| 旧项目源码标识扫描       | 0 命中                                                       |
| `npm run lint`           | 通过，0 error、0 warning                                     |
| `npm run typecheck`      | 通过，0 error                                                |
| `npm run build`          | 通过，1699 modules                                          |
| Keycloak/RBAC 浏览器门禁 | 18/18 页面、深链与移动端通过；console/request failure 均为 0 |

当前目录没有 Git 元数据。被物理删除的素材和 zip 无法从当前目录恢复，但可从 `frontend-audit.md` 登记的源复制基线重新取得；正式交付前仍需完成 T004 的 Cochain 仓库与回滚基线。
