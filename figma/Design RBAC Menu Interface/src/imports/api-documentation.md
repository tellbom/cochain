# 外协零件分包及供应商推荐系统 — 前端接口文档

> 生成日期：2026-07-24（已对照实际 Controller 代码逐条校验修正）
> 基础路径：`http://{host}:8080`
> 鉴权方式：OAuth2 Bearer Token（请求头 `Authorization: Bearer <token>`）
> 响应格式：统一包装 `Result<T>`，见 §1

---

## 1. 通用说明

### 1.1 响应包装结构

所有接口返回统一格式 `Result<T>`：

```json
{
    "code": 0, // int, 0=成功, 非0=失败
    "msg": "success", // string, 提示信息
    "data": {} // T, 实际数据（类型见各接口）
}
```

### 1.2 分页查询通用参数

| 参数         | 类型   | 必填 | 默认值 | 说明                     |
| ------------ | ------ | ---- | ------ | ------------------------ |
| `pageNo`     | int    | 是   | 1      | 当前页码                 |
| `pageSize`   | int    | 是   | 10     | 每页记录数               |
| `orderField` | String | 否   | —      | 排序字段名               |
| `order`      | String | 否   | —      | 排序方式：`asc` / `desc` |

分页响应结构 `PageData<T>`：

```json
{
    "code": 0,
    "msg": "success",
    "data": {
        "total": 100, // long, 总记录数
        "list": [], // T[], 当前页数据
        "pageNo": 1, // int, 当前页码
        "pageSize": 10 // int, 每页记录数
    }
}
```

### 1.3 ID 类型说明

> ⚠️ 所有 ID 字段（`id`、`batchId`、`packageId`、`categoryId`、`supplierId` 等）均为 **String 类型**（雪花算法生成，如 `"1734567890123456789"`），前端请勿按数字类型处理，避免精度丢失。

### 1.4 权限前缀（以实际代码 `@PreAuthorize` 注解为准）

| 资源           | 权限前缀                          | Base Path                              |
| -------------- | --------------------------------- | -------------------------------------- |
| 分包批次       | `subcontract:batch`               | `/api/subcontract/batch`               |
| 批次零件明细   | `part:batch-part`                 | `/api/part/batch-part`                 |
| 工作包         | `work:package`                    | `/api/work/package`                    |
| 工作包零件关联 | `package:part`                    | `/api/package/part`                    |
| 供应商         | `supplier:supplier`               | `/api/supplier`                        |
| 供应商绩效     | `supplier:performance`            | `/api/supplier/performance`            |
| 供应商品类关联 | `supplier:category`               | `/api/supplier/category`               |
| 品类主数据     | `part:category-master`            | `/api/part/category-master`            |
| 特殊品类配置   | `special:category-config`         | `/api/special/category-config`         |
| 排名快照       | `supplier:ranking-snapshot`       | `/api/supplier/ranking-snapshot`       |
| 轮流游标       | `round:robin-cursor`              | `/api/round/robin-cursor`              |
| 推荐结果       | `package:supplier-recommendation` | `/api/package/supplier-recommendation` |
| 历史供应商     | `part:history-supplier`           | `/api/part/history-supplier`           |
| 左右件规则     | `left:right-rule`                 | `/api/left/right-rule`                 |
| 左右件手动     | `left:right-manual`               | `/api/left/right-manual`               |
| 容量配置       | `part:type-package-config`        | `/api/part/type-package-config`        |
| 业务操作日志   | `operation:log`                   | `/api/operation/log`                   |
| 系统操作日志   | `system:operate-log`              | `/api/system/operate-log`              |

---

## 2. 核心业务 API

### 2.1 分包批次管理

Base: `/api/subcontract/batch`

#### 2.1.1 上传分包 Excel

```
POST /api/subcontract/batch/upload
权限: subcontract:batch:upload
Content-Type: multipart/form-data
```

| 参数            | 类型   | 必填 | 说明                                               |
| --------------- | ------ | ---- | -------------------------------------------------- |
| `file`          | File   | 是   | 分包 Excel 文件（37 列模板）                       |
| `aircraftModel` | String | 否   | 机型（如 `"zz"`），用于补全 Excel 行中缺失的机型列 |
| `operator`      | String | 否   | 操作人姓名                                         |

成功响应 `Result<BatchImportResultVO>`：

```json
{
    "code": 0,
    "data": {
        "batchId": "1734567890123456789",
        "batchNo": "BATCH-20260722-001",
        "totalRows": 104,
        "successCount": 102,
        "errorCount": 2,
        "errors": [
            { "rowNo": 103, "message": "供应商需求数必须为正整数" },
            { "rowNo": 104, "message": "零件图号不能为空" }
        ]
    }
}
```

#### 2.1.2 从全流程系统抓取数据

```
POST /api/subcontract/batch/fetch
权限: subcontract:batch:fetch
```

| 参数       | 类型   | 必填 | 说明         |
| ---------- | ------ | ---- | ------------ |
| `flowNo`   | String | 是   | 委外流程编号 |
| `operator` | String | 否   | 操作人姓名   |

响应：`Result<BatchImportResultVO>`（同上）

#### 2.1.3 触发分包引擎

```
POST /api/subcontract/batch/{id}/package
权限: subcontract:batch:package
```

| 参数 | 类型   | 必填 | 说明               |
| ---- | ------ | ---- | ------------------ |
| `id` | String | 是   | 批次ID（路径参数） |

> 调用时机：上传 Excel 或抓取数据后，批次状态为 `DATA_READY` 时调用。幂等，重复调用不会产生重复工作包。

响应 `Result<List<PackageVO>>`：

```json
{
    "code": 0,
    "data": [
        {
            "id": "1734567890123456790",
            "batchId": "1734567890123456789",
            "packageNo": "zz-2607-001",
            "categoryId": "CAT-01",
            "supplierCountNeeded": 2,
            "recommendCount": 6,
            "partCount": 10,
            "partType": "中型",
            "maxPartLimit": 10,
            "hasHistorySupplier": 0,
            "isSpecialCategory": 0,
            "specialType": null,
            "recommendationStatus": null
        }
    ]
}
```

#### 2.1.4 触发供应商推荐引擎

```
POST /api/subcontract/batch/{id}/recommend
权限: subcontract:batch:recommend
```

| 参数 | 类型   | 必填 | 说明   |
| ---- | ------ | ---- | ------ |
| `id` | String | 是   | 批次ID |

> 调用时机：分包完成后调用。幂等，重复调会替换旧推荐结果。依赖排名快照数据（需先上传绩效并生成排名）。

响应 `Result<List<SupplierRecommendationVO>>`：

```json
{
    "code": 0,
    "data": [
        {
            "id": "1734567890123456791",
            "packageId": "1734567890123456790",
            "batchId": "1734567890123456789",
            "supplierId": "SUP-A01",
            "supplierName": "供应商A01",
            "recommendOrder": 1,
            "recommendSource": "HISTORY",
            "qualityLevel": "优质",
            "performanceScore": 88.5
        }
    ]
}
```

`recommendSource` 枚举：`HISTORY`（历史供应商）/ `QUALITY_ROUND`（优质轮流）/ `NORMAL_ROUND`（普通轮流）/ `ALL_CATEGORY`（全品类）

#### 2.1.5 一键编排（分包→推荐→回写）

```
POST /api/subcontract/batch/{id}/run
权限: subcontract:batch:run
```

| 参数 | 类型   | 必填 | 说明   |
| ---- | ------ | ---- | ------ |
| `id` | String | 是   | 批次ID |

> 依次执行分包、推荐、回写，一步完成。

响应 `Result<OrchestrationResultVO>`：

```json
{
    "code": 0,
    "data": {
        "batchId": "1734567890123456789",
        "batchNo": "BATCH-20260722-001",
        "batchStatus": "COMPLETED",
        "packageCount": 15,
        "recommendationCount": 90
    }
}
```

#### 2.1.6 导出推荐结果 Excel

```
GET /api/subcontract/batch/{id}/export
权限: subcontract:batch:export-result
```

| 参数 | 类型   | 必填 | 说明   |
| ---- | ------ | ---- | ------ |
| `id` | String | 是   | 批次ID |

> 响应为 Excel 文件流（`application/octet-stream`），浏览器自动下载。回写推荐供应商 1-7 到 `BATCH_PART` 表后将批次状态置为 `COMPLETED`。

#### 2.1.7 批次标准 CRUD

| 方法     | 路径                          | 权限                       | 说明                                               |
| -------- | ----------------------------- | -------------------------- | -------------------------------------------------- |
| `GET`    | `/api/subcontract/batch/{id}` | `subcontract:batch:query`  | 按 ID 查询批次                                     |
| `GET`    | `/api/subcontract/batch/list` | `subcontract:batch:query`  | 查询批次列表（不分页）                             |
| `GET`    | `/api/subcontract/batch/page` | `subcontract:batch:page`   | 分页查询批次                                       |
| `POST`   | `/api/subcontract/batch`      | `subcontract:batch:save`   | 新增批次 → 返回 `Result<String>` (新ID)            |
| `PUT`    | `/api/subcontract/batch`      | `subcontract:batch:update` | 修改批次 → `Result<Boolean>`                       |
| `DELETE` | `/api/subcontract/batch/{id}` | `subcontract:batch:delete` | 按 ID 删除 → `Result<Boolean>`                     |
| `DELETE` | `/api/subcontract/batch`      | `subcontract:batch:delete` | 批量删除（Body 为 `String[]`） → `Result<Boolean>` |

**BatchVO 字段：**

| 字段                | 类型    | 说明                                                              |
| ------------------- | ------- | ----------------------------------------------------------------- |
| `id`                | String  | 批次ID                                                            |
| `batchNo`           | String  | 批次编号                                                          |
| `flowNo`            | String  | 委外流程编号                                                      |
| `batchStatus`       | String  | `DRAFT` / `DATA_READY` / `PACKAGED` / `RECOMMENDED` / `COMPLETED` |
| `uploadFileName`    | String  | 上传文件名                                                        |
| `totalPartCount`    | Integer | 零件总数                                                          |
| `totalPackageCount` | Integer | 工作包总数                                                        |
| `operator`          | String  | 操作人                                                            |

**BatchQuery 查询参数（`/list` `/page` 用）：**

| 参数          | 类型   | 说明             |
| ------------- | ------ | ---------------- |
| `batchNo`     | String | 批次编号（模糊） |
| `flowNo`      | String | 流程编号         |
| `batchStatus` | String | 状态             |
| `operator`    | String | 操作人           |

---

### 2.2 批次零件明细

Base: `/api/part/batch-part`

标准 CRUD（同 §2.1.7 模式），权限前缀 `part:batch-part`。

**BatchPartVO 主要字段：**

| 字段                   | 类型       | 说明                                           |
| ---------------------- | ---------- | ---------------------------------------------- |
| `id`                   | String     | 明细ID                                         |
| `batchId`              | String     | 所属批次ID                                     |
| `seqNo`                | Integer    | 序号                                           |
| `partDrawingNo`        | String     | 零件图号                                       |
| `aircraftModel`        | String     | 外协转码机型                                   |
| `partName`             | String     | 零件名称                                       |
| `materialType`         | String     | 材料类型                                       |
| `lengthValue`          | BigDecimal | 长度                                           |
| `widthValue`           | BigDecimal | 宽度                                           |
| `nestingInfo`          | String     | 套裁信息                                       |
| `historySupplier1~3`   | String     | 历史供应商                                     |
| `supplierCountNeeded`  | Integer    | 供应商需求数                                   |
| `thirdCategory`        | String     | 三级品类名称                                   |
| `thirdCategoryId`      | String     | 三级品类ID（品类判定引擎推导）                 |
| `partType`             | String     | 零件类型：`小型`/`中型`/`大型`/`超大型`/`其他` |
| `packageId`            | String     | 所属工作包ID（分包后回填）                     |
| `recommendSupplier1~7` | String     | 推荐供应商（导出回写）                         |

---

### 2.3 工作包

Base: `/api/work/package`

标准 CRUD（同 §2.1.7），权限前缀 `work:package`。

**PackageVO 主要字段：**

| 字段                   | 类型    | 说明                                |
| ---------------------- | ------- | ----------------------------------- |
| `id`                   | String  | 工作包ID                            |
| `batchId`              | String  | 所属批次ID                          |
| `packageNo`            | String  | 工作包编号（格式：`机型-yyMM-NNN`） |
| `categoryId`           | String  | 品类ID                              |
| `supplierCountNeeded`  | Integer | 供应商需求数                        |
| `recommendCount`       | Integer | 应推荐供应商数（= 需求数 + 4）      |
| `partCount`            | Integer | 包内零件数                          |
| `partType`             | String  | 零件类型                            |
| `maxPartLimit`         | Integer | 该类型容量上限                      |
| `hasHistorySupplier`   | Integer | 是否有历史供应商                    |
| `isSpecialCategory`    | Integer | 是否特殊品类                        |
| `specialType`          | String  | 特殊类型枚举                        |
| `recommendationStatus` | String  | 推荐状态                            |

---

### 2.4 工作包零件关联

Base: `/api/package/part`

标准 CRUD，权限前缀 `package:part`。

**PartVO 主要字段（对应 PACKAGE_PART 表）：**

| 字段            | 类型   | 说明                             |
| --------------- | ------ | -------------------------------- |
| `id`            | String | 关联ID                           |
| `packageId`     | String | 工作包ID                         |
| `partId`        | String | 零件明细ID（指向 BATCH_PART.ID） |
| `partDrawingNo` | String | 零件图号                         |

---

### 2.5 供应商管理

Base: `/api/supplier`

标准 CRUD，权限前缀 `supplier:supplier`。

#### 2.5.1 启用/停用供应商（特殊接口）

```
PUT /api/supplier/{id}/enabled
权限: supplier:supplier:update
```

| 参数      | 类型    | 必填 | 说明                 |
| --------- | ------- | ---- | -------------------- |
| `id`      | String  | 是   | 供应商ID（路径参数） |
| `enabled` | Integer | 是   | `1`=启用 / `0`=停用  |

响应：`Result<Boolean>`

#### 2.5.2 供应商字段

| 字段           | 类型    | 说明                                        |
| -------------- | ------- | ------------------------------------------- |
| `id`           | String  | 供应商ID                                    |
| `supplierName` | String  | 供应商名称                                  |
| `enabled`      | Integer | `1`=启用 / `0`=停用（停用后不参与任何推荐） |
| `remark`       | String  | 备注                                        |

---

### 2.6 供应商绩效

Base: `/api/supplier/performance`

标准 CRUD，权限前缀 `supplier:performance`。

#### 2.6.1 上传绩效 Excel

```
POST /api/supplier/performance/upload
权限: supplier:performance:upload
Content-Type: multipart/form-data
```

| 参数    | 类型    | 必填 | 说明                                      |
| ------- | ------- | ---- | ----------------------------------------- |
| `file`  | File    | 是   | 绩效 Excel（2 列：供应商名称 / 绩效成绩） |
| `year`  | Integer | 是   | 绩效年份                                  |
| `month` | Integer | 是   | 绩效月份（1-12）                          |

响应：`Result<PerformanceUploadResultVO>`（包含导入成功/失败行统计等汇总信息）

#### 2.6.2 绩效字段

| 字段                 | 类型       | 说明                                   |
| -------------------- | ---------- | -------------------------------------- |
| `id`                 | String     | ID                                     |
| `supplierId`         | String     | 供应商ID                               |
| `performanceYear`    | Integer    | 年份                                   |
| `performanceMonth`   | Integer    | 月份                                   |
| `score`              | BigDecimal | 原始成绩                               |
| `halfYearAvg`        | BigDecimal | 半年平均                               |
| `lastMonthScore`     | BigDecimal | 上月得分                               |
| `comprehensiveScore` | BigDecimal | 综合得分 = 半年平均 × 0.6 + 上月 × 0.4 |

---

### 2.7 排名快照

Base: `/api/supplier/ranking-snapshot`

标准 CRUD，权限前缀 `supplier:ranking-snapshot`。

#### 2.7.1 生成排名快照

```
POST /api/supplier/ranking-snapshot/generate
权限: supplier:ranking-snapshot:generate
```

| 参数    | 类型    | 必填 | 说明 |
| ------- | ------- | ---- | ---- |
| `year`  | Integer | 是   | 年份 |
| `month` | Integer | 是   | 月份 |

> 按品类分别排名，前 30% 标记为"优质"，其余"普通"。同时重置该年月的轮流选取游标。

响应：`Result<Boolean>`

#### 2.7.2 排名快照字段

| 字段                 | 类型       | 说明                |
| -------------------- | ---------- | ------------------- |
| `id`                 | String     | ID                  |
| `supplierId`         | String     | 供应商ID            |
| `categoryId`         | String     | 品类ID              |
| `rankingYear`        | Integer    | 年份                |
| `rankingMonth`       | Integer    | 月份                |
| `comprehensiveScore` | BigDecimal | 综合得分            |
| `rankInCategory`     | Integer    | 品类内排名          |
| `qualityLevel`       | String     | `"优质"` / `"普通"` |
| `totalSupplierCount` | Integer    | 品类供应商总数      |

---

### 2.8 供应商品类关联

Base: `/api/supplier/category`

标准 CRUD，权限前缀 `supplier:category`。

| 字段         | 类型   | 说明         |
| ------------ | ------ | ------------ |
| `id`         | String | 关联ID       |
| `supplierId` | String | 供应商ID     |
| `categoryId` | String | 品类主数据ID |

---

### 2.9 品类主数据

Base: `/api/part/category-master`

标准 CRUD，权限前缀 `part:category-master`。

| 字段                      | 类型       | 说明                                                   |
| ------------------------- | ---------- | ------------------------------------------------------ |
| `id`                      | String     | 品类ID                                                 |
| `categoryName`            | String     | 品类名称                                               |
| `materialType`            | String     | 材料类型                                               |
| `lengthMin` / `lengthMax` | BigDecimal | 长度区间                                               |
| `widthMin` / `widthMax`   | BigDecimal | 宽度区间                                               |
| `sizeLogic`               | String     | `AND`（长宽均需满足）/ `OR`（任一满足）                |
| `partType`                | String     | 零件类型：`小型` / `中型` / `大型` / `超大型` / `其他` |

---

### 2.10 特殊品类配置

Base: `/api/special/category-config`

标准 CRUD，权限前缀 `special:category-config`。

| 字段            | 类型    | 说明                                                                 |
| --------------- | ------- | -------------------------------------------------------------------- |
| `id`            | String  | 配置ID                                                               |
| `categoryId`    | String  | 品类ID                                                               |
| `specialType`   | String  | `COMPOSITE`（复合材料/泡沫/蜂窝）/ `REINFORCEMENT`（零组件补充加工） |
| `recommendRule` | String  | `ALL_SUPPLIERS`（推荐全部供应商）/ `ROUND_ROBIN`（轮流推荐）         |
| `ignoreQuality` | Integer | `1`=忽略优质/普通区分 / `0`=正常区分                                 |

---

### 2.11 推荐结果

Base: `/api/package/supplier-recommendation`

标准 CRUD（只读为主），权限前缀 `package:supplier-recommendation`。

| 字段               | 类型       | 说明                                                          |
| ------------------ | ---------- | ------------------------------------------------------------- |
| `id`               | String     | 推荐结果ID                                                    |
| `packageId`        | String     | 工作包ID                                                      |
| `batchId`          | String     | 批次ID                                                        |
| `supplierId`       | String     | 供应商ID                                                      |
| `supplierName`     | String     | 供应商名称                                                    |
| `recommendOrder`   | Integer    | 推荐序号（1 起）                                              |
| `recommendSource`  | String     | `HISTORY` / `QUALITY_ROUND` / `NORMAL_ROUND` / `ALL_CATEGORY` |
| `qualityLevel`     | String     | 优质/普通                                                     |
| `performanceScore` | BigDecimal | 绩效得分                                                      |

---

### 2.12 其他标准 CRUD 资源

以下资源均提供标准 CRUD 接口（`GET /{id}` / `GET /list` / `GET /page` / `POST` / `PUT` / `DELETE /{id}` / `DELETE`），不再展开：

| 资源         | Base Path                       | 权限前缀                   | 说明                         |
| ------------ | ------------------------------- | -------------------------- | ---------------------------- |
| 轮流选取游标 | `/api/round/robin-cursor`       | `round:robin-cursor`       | 游标状态，一般不直接操作     |
| 历史供应商   | `/api/part/history-supplier`    | `part:history-supplier`    | 零件历史供应商记录           |
| 左右件规则   | `/api/left/right-rule`          | `left:right-rule`          | 按机型图号后缀识别左右件     |
| 左右件手动   | `/api/left/right-manual`        | `left:right-manual`        | 不易自动识别的左右件手工登记 |
| 容量配置     | `/api/part/type-package-config` | `part:type-package-config` | 各零件类型的工作包容量上限   |
| 业务操作日志 | `/api/operation/log`            | `operation:log`            | 业务操作日志                 |
| 系统操作日志 | `/api/system/operate-log`       | `system:operate-log`       | 平台级操作日志               |

---

## 3. 业务操作流程

### 3.1 方式一：分步执行（推荐）

```
1. POST /api/subcontract/batch/upload                  → 上传 Excel，获得 batchId
2. POST /api/supplier/performance/upload               → 上传绩效（如尚未上传）
3. POST /api/supplier/ranking-snapshot/generate        → 生成排名快照
4. POST /api/subcontract/batch/{id}/package            → 执行分包
5. POST /api/subcontract/batch/{id}/recommend          → 执行推荐
6. GET  /api/subcontract/batch/{id}/export             → 导出 Excel
```

### 3.2 方式二：一键编排

```
1. POST /api/subcontract/batch/upload                  → 上传 Excel，获得 batchId
2. POST /api/supplier/performance/upload               → 上传绩效
3. POST /api/supplier/ranking-snapshot/generate        → 生成排名快照
4. POST /api/subcontract/batch/{id}/run                → 一键编排（包→推荐→回写）
5. GET  /api/subcontract/batch/{id}/export             → 导出 Excel
```

### 3.3 批次状态流转

```
DRAFT → DATA_READY → PACKAGED → RECOMMENDED → COMPLETED
         (上传完成)   (分包完成)  (推荐完成)   (导出完成)
```

---

## 4. 上传模板

### 4.1 分包 Excel（37 列）

| 列号  | 列名          | 必填   | 说明                 |
| ----- | ------------- | ------ | -------------------- |
| 0     | 序号          | 否     | 行序号               |
| 1     | 分包号        | 否     | 预留                 |
| 2     | 零件图号      | **是** | 唯一标识             |
| 3     | 外协转码机型  | 否     | 为空时用上传参数兜底 |
| 4     | 外协转码图号  | 否     |                      |
| 5     | 零件名称      | 否     |                      |
| 6     | 分工路线      | 否     |                      |
| 7     | 四级品类      | 否     |                      |
| 8     | 建议必选方式  | 否     |                      |
| 9     | 单机件数      | 否     |                      |
| 10    | 外协份额      | 否     |                      |
| 11    | 订货数        | 否     |                      |
| 12    | 加工主要内容  | 否     |                      |
| 13    | 提出单位      | 否     |                      |
| 14    | 是否提供工装  | 否     |                      |
| 15    | 是否供料      | 否     |                      |
| 16    | 关重信息      | 否     |                      |
| 17    | 能力等级      | 否     |                      |
| 18    | 材料类型      | 否     | 品类判定关键字段     |
| 19    | 零件材料      | 否     |                      |
| 20    | 材料规格      | 否     |                      |
| 21    | 套裁信息      | 否     | 同编号强制同包       |
| 22    | 历史供应商1   | 否     | 推荐优先             |
| 23    | 历史供应商2   | 否     |                      |
| 24    | 历史供应商3   | 否     |                      |
| 25    | 供应商需求数  | **是** | 必须为正整数         |
| 26    | 三级品类      | 否     | 尺寸缺失时回退匹配   |
| 27-33 | 推荐供应商1-7 | —      | 留空，导出时回写     |
| 34    | 备注          | 否     |                      |
| 35    | 长度          | 否     | 品类判定关键字段     |
| 36    | 宽度          | 否     | 品类判定关键字段     |

### 4.2 绩效 Excel（2 列）

| 列号 | 列名       | 必填   | 说明                       |
| ---- | ---------- | ------ | -------------------------- |
| 0    | 供应商名称 | **是** | 必须与系统内供应商名称一致 |
| 1    | 绩效成绩   | **是** | 数值                       |

---

## 5. 常见业务状态枚举

| 枚举     | 值                                                                   |
| -------- | -------------------------------------------------------------------- |
| 批次状态 | `DRAFT` / `DATA_READY` / `PACKAGED` / `RECOMMENDED` / `COMPLETED`    |
| 零件类型 | `小型` / `中型` / `大型` / `超大型` / `其他`                         |
| 推荐来源 | `HISTORY` / `QUALITY_ROUND` / `NORMAL_ROUND` / `ALL_CATEGORY`        |
| 质量等级 | `优质` / `普通`                                                      |
| 特殊品类 | `COMPOSITE`（复合材料/泡沫/蜂窝）/ `REINFORCEMENT`（零组件补充加工） |
| 推荐规则 | `ROUND_ROBIN`（轮流）/ `ALL_SUPPLIERS`（全部供应商）                 |
| 尺寸逻辑 | `AND`（长宽均需满足）/ `OR`（任一满足）                              |
