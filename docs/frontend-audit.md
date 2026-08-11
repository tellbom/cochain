# Cochain 前端改造审计基线

> 审计日期：2026-08-11  
> 范围：T020；改造前复制体与 `E:\Web\flow\web` 的 `src`、`public`、`types`、依赖锁和主配置逐文件差异为 0。

## 保留

-   Keycloak 登录、PKCE、刷新与登出链路：`src/utils/keycloak.ts`、现有登录页与错误页。
-   RBAC 动态菜单、动态路由、按钮权限与权限中心：`src/api/backend/rbac/**`、`src/utils/router.ts`、`src/views/backend/auth/**`。
-   Vue 3、Vite、Pinia、Vue Router、Element Plus 及现有表格/表单基础能力；不引入第二套 UI 组件库。
-   远端 RBAC 菜单树作为唯一业务导航来源，不增加静态业务路由或静态菜单兜底。

## 替换

| 复制体内容                                              | 处理                                              | 理由                                   |
| ------------------------------------------------------- | ------------------------------------------------- | -------------------------------------- |
| 包名 `build-admin`、`/flow`、`flow-web`、project `flow` | 替换为 Cochain 标识                               | 防止身份与鉴权项目串用                 |
| 默认 Streamline 横向菜单、流程中心背景图、渐变顶栏      | 替换为固定左侧 RBAC 菜单 + 右侧内容壳             | 与批准的信息架构和设计系统一致         |
| Process Center 开发代理                                 | 从 Vite 配置移除                                  | Cochain Mock/HTTP 适配器不依赖流程中心 |
| 分散的颜色、圆角、阴影                                  | 收敛到 `cochain-tokens.scss` 与 Element Plus 覆盖 | 建立单一语义设计 Token 来源            |
| 通用缓存键                                              | 加 Cochain 命名空间                               | 避免复制体本地缓存污染布局和登录状态   |

## 已完成删除（2026-08-11）

-   删除 `workflow/todo/bpmn/frontend`、旧 Dashboard、旧 CRUD/module/routine/security/user 业务代码与静态路由入口。
-   删除旧编辑器、图表、OnlyOffice、流程组件、二维码、轮播等未被 Cochain 使用的依赖与组件。
-   删除 27 个旧二进制素材（含 3 MB 源项目 favicon）和 7 个旧项目 zip 备份；当前 `src/assets` 文件数为 0，favicon 已替换为 271 B 的 Cochain SVG。
-   动态组件白名单只允许 `views/backend/cochain/**` 与 `views/backend/auth/**`，避免残留文件被远端菜单重新激活。
-   权限中心表格的 107 处 `--wf-*` 样式引用已迁移到 `--co-*` 语义 Token；旧工作流 Token 不再存在。
-   保留通用 RBAC `tab/link/iframe` 菜单能力；删除未引用的工作流 `postMessage` bridge，不把框架能力误判为旧业务。

删除后源码静态扫描未命中 `flow`、`flow-web`、`oversia`、`BuildAdmin`、Process Center、旧 Dashboard、旧作者路径或工作流 Token。二进制素材和 zip 已从当前目录物理删除；当前目录没有 Git 元数据，只能从已登记的源复制基线恢复。

## 构建基线

-   初始复制体无 `node_modules`；按现有 `package-lock.json` 安装后可进入真实检查。
-   初始 `typecheck` 存在既有错误：RBAC 类型导出、旧 ContactSelector、旧 auth 页面 Element Plus 类型、navTabs 与旧前后台菜单等。
-   初始生产构建在 `v-code-diff@1.12.1` 停止：该包依赖 postinstall 生成根 `dist` 入口，而首次审计安装禁用了 scripts。
-   上述结果作为改造前基线；后续验收分别报告聚焦检查、完整 typecheck 与生产构建，不能把基线错误描述为本轮成功。

## 清理后结果

-   `npm run lint`：通过，0 error、0 warning。
-   `npm run typecheck`：通过，原复制体 RBAC/导航类型错误已清零。
-   `npm run build`：通过，1699 modules transformed；旧 qrcode/onnx/巨型编辑器 chunk 提醒已消失。
-   真实浏览器门禁：18/18 动态页面、深链刷新与 390px 移动端通过，控制台错误 0、失败请求 0。

## 设计与可访问性约束

-   单一交互强调色 `#0066cc`，系统字体栈，不加载公网字体。
-   页面画布只使用白色、`#f5f5f7`、`#fafafc`；无装饰渐变，无卡片阴影滥用。
-   主操作使用 pill；输入和紧凑控件 8px；内容容器 18px；边界使用 1px hairline。
-   恢复键盘 `:focus-visible`，交互目标最小 44px；1024px 折叠菜单，768px 使用抽屉式侧栏。
