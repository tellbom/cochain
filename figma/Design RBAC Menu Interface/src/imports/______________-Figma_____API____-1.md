# 外协零件分包及供应商推荐系统

## Figma 原型设计输入文档（业务功能 + API）

**版本：2026-08-12**

> *说明：本文件只定义业务功能、操作逻辑、API、请求参数和返回参数，不规定页面布局、组件形态、颜色、视觉风格或具体交互控件。Figma 设计方可自行选择卡片、表格、分栏、抽屉、Tab、拖拽等表达方式。*

# 1. 原型设计边界与业务关系

- 一次 Excel 上传对应一个批次 batchId。batchNo 用于展示，batchId 是业务主键。

- 一个批次下包含多个工作包（Package），每个工作包包含多个零件（Part），每个工作包产生供应商推荐结果（SupplierRecommendation）。

- 人工调包功能必须在前端原型中保留；零件只能在当前 batchId 下的工作包之间移动，不允许跨批次移动。

- 套裁关联零件、左右件关联零件不允许拆分；移动时应作为一个整体处理。

- 人工调包的专用后端 API 尚未提供。原型保留能力和交互位置，但不得绑定通用 PUT /api/part/batch-part 作为正式调包接口。

- 供应商绩效由用户按月上传“供应商名称 + 绩效成绩”；排名由系统计算，不设计“上传排名”功能。

- 当前系统只输出供应商推荐清单并导出 Excel，不设计“最终定商/中标供应商确认”操作。

- 不在前端原型中评判或配置供应商推荐轮询算法；前端只展示后端返回的推荐结果及来源。

## 1.1 核心业务对象关系

| **对象**                           | **关系**                                       | **前端含义**                                     |
|------------------------------------|------------------------------------------------|--------------------------------------------------|
| Batch（批次）                      | 一次 Excel 上传生成一个 batchId                | 整个批次工作台的操作边界                         |
| Package（工作包）                  | 一个 Batch 包含多个 Package                    | 分包引擎生成，用户可查看并在同批次内调整零件归属 |
| BatchPart（零件）                  | 一个零件属于一个 Batch，分包后关联一个 Package | 展示零件明细、所属包、历史供应商、推荐回写等     |
| Supplier（供应商）                 | 供应商可关联多个三级品类                       | 供应商基础资料与推荐资格维护                     |
| Performance（绩效）                | 供应商按年月存在绩效数据                       | 按月上传并查看原始成绩、综合得分等               |
| RankingSnapshot（排名）            | 供应商按品类、年月形成排名                     | 系统自动生成，前端主要用于查看/异常重试          |
| SupplierRecommendation（推荐结果） | 按 packageId + batchId 生成                    | 展示推荐顺序、来源、质量等级、绩效分数           |

# 2. API 通用约定

| **项目** | **约定**                                                                                   |
|----------|--------------------------------------------------------------------------------------------|
| 基础路径 | http://{host}:8080                                                                         |
| 鉴权     | OAuth2 Bearer Token；请求头 Authorization: Bearer \<token\>                                |
| 成功判定 | Result\<T\>.code = 0                                                                       |
| 统一响应 | { code: int, msg: string, data: T }                                                        |
| 分页参数 | pageNo:int（默认1）、pageSize:int（默认10）、orderField:String?、order:String?（asc/desc） |
| 分页返回 | data.total、data.list、data.pageNo、data.pageSize                                          |
| ID 类型  | id、batchId、packageId、categoryId、supplierId 等全部按 String 处理，禁止前端转 Number     |

# 3. 界面一：分包批次列表与数据导入

## 3.1 业务目的

- 作为分包业务的一级入口，查看历史批次及其当前状态。

- 支持上传分包 Excel，或通过委外流程编号从全流程系统抓取数据。

- 上传/抓取成功后得到 batchId，并进入对应批次工作台。

- 上传完成后的批次状态为 DATA_READY；生成工作包由后续批次工作台执行。

## 3.2 操作逻辑

1\. 进入页面后分页加载批次列表，可按批次编号、流程编号、状态、操作人筛选。

2\. 用户选择“上传 Excel”时提交文件，可附带机型和操作人；接口返回导入总行数、成功数、失败数及失败行信息。

3\. 若用户选择“从全流程系统抓取”，输入 flowNo 后创建批次，返回结构与 Excel 上传一致。

4\. 导入成功后允许用户进入对应 batchId 的批次工作台继续生成工作包。

5\. 可保留标准批次查看、编辑、删除能力；具体视觉入口由 Figma 决定。

## 3.3 API 与请求/返回

| **操作**         | **Method / Path**                  | **请求参数**                                                                             | **返回**                      |
|------------------|------------------------------------|------------------------------------------------------------------------------------------|-------------------------------|
| 分页查询批次     | GET /api/subcontract/batch/page    | Query：pageNo、pageSize、orderField?、order?、batchNo?、flowNo?、batchStatus?、operator? | Result\<PageData\<BatchVO\>\> |
| 查询批次详情     | GET /api/subcontract/batch/{id}    | Path：id:String（batchId）                                                               | Result\<BatchVO\>             |
| 上传分包 Excel   | POST /api/subcontract/batch/upload | multipart/form-data：file:File 必填；aircraftModel:String?；operator:String?             | Result\<BatchImportResultVO\> |
| 从全流程系统抓取 | POST /api/subcontract/batch/fetch  | Query/Form：flowNo:String 必填；operator:String?                                         | Result\<BatchImportResultVO\> |
| 新增批次         | POST /api/subcontract/batch        | Body：BatchVO                                                                            | Result\<String\>（新ID）      |
| 修改批次         | PUT /api/subcontract/batch         | Body：BatchVO                                                                            | Result\<Boolean\>             |
| 删除批次         | DELETE /api/subcontract/batch/{id} | Path：id:String                                                                          | Result\<Boolean\>             |
| 批量删除         | DELETE /api/subcontract/batch      | Body：String\[\] ids                                                                     | Result\<Boolean\>             |

## 3.4 返回对象

| **BatchVO 字段**  | **类型** | **说明**                                                |
|-------------------|----------|---------------------------------------------------------|
| id                | String   | 批次ID                                                  |
| batchNo           | String   | 批次编号                                                |
| flowNo            | String   | 委外流程编号                                            |
| batchStatus       | String   | DRAFT / DATA_READY / PACKAGED / RECOMMENDED / COMPLETED |
| uploadFileName    | String   | 上传文件名                                              |
| totalPartCount    | Integer  | 零件总数                                                |
| totalPackageCount | Integer  | 工作包总数                                              |
| operator          | String   | 操作人                                                  |

| **BatchImportResultVO 字段** | **类型** | **说明**                                |
|------------------------------|----------|-----------------------------------------|
| batchId                      | String   | 新创建的批次ID                          |
| batchNo                      | String   | 新创建的批次编号                        |
| totalRows                    | Integer  | Excel/抓取数据总行数                    |
| successCount                 | Integer  | 成功导入行数                            |
| errorCount                   | Integer  | 失败行数                                |
| errors                       | Array    | 失败行明细；每条至少包含 rowNo、message |

# 4. 界面二：批次工作台（核心页面）

## 4.1 业务目的

- 围绕单个 batchId 完成“查看批次 → 生成工作包 → 查看包与零件 → 人工调包 → 生成/重新生成供应商推荐 → 查看推荐结果 → 导出 Excel”。

- 工作包、零件明细、工作包零件关系、供应商推荐结果不再作为多个独立一级页面；在同一批次上下文中聚合呈现。

- 批次状态用于决定业务动作是否可用：DRAFT → DATA_READY → PACKAGED → RECOMMENDED → COMPLETED。

## 4.2 操作逻辑

1\. 进入工作台时加载 BatchVO，展示批次编号、状态、零件数、工作包数、操作人等。

2\. 当状态为 DATA_READY 时，用户可执行“生成工作包”；成功后读取 PackageVO 列表。

3\. 用户可选择某工作包查看包属性、包内零件和该包供应商推荐结果。

4\. 零件详情需展示图号、名称、材料、尺寸、套裁信息、历史供应商、三级品类、零件类型、供应商需求数、所属包等。

5\. 人工调包：仅允许在当前 batchId 下的工作包之间移动。套裁关联零件及左右件关联零件不得拆分。专用接口待后端提供，原型必须保留此能力。

6\. 分包完成后可执行供应商推荐。前端只展示后端推荐结果，不提供轮询算法配置。

7\. 推荐结果按工作包展示推荐顺序、供应商、推荐来源、质量等级、绩效分数。

8\. 用户复核推荐结果后导出 Excel。当前系统终点是“导出推荐清单”，不增加最终供应商确认流程。

9\. 可保留“一键编排”入口，用于后端一次执行分包→推荐→回写；是否作为主操作由设计方根据体验处理。

## 4.3 API 与请求/返回

| **操作**            | **Method / Path**                                      | **请求参数**                                                                                              | **返回**                                                                                     |
|---------------------|--------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| 批次详情            | GET /api/subcontract/batch/{id}                        | Path：id:String（batchId）                                                                                | Result\<BatchVO\>                                                                            |
| 生成工作包          | POST /api/subcontract/batch/{id}/package               | Path：id:String（batchId）                                                                                | Result\<List\<PackageVO\>\>                                                                  |
| 工作包列表/分页     | GET /api/work/package/list 或 /page                    | 分页接口带通用分页参数；业务上需按 batchId 过滤。现有接口文档未展开具体 Query DTO，联调时确认过滤字段名。 | Result\<List\<PackageVO\>\> 或 Result\<PageData\<PackageVO\>\>                               |
| 工作包详情          | GET /api/work/package/{id}                             | Path：id:String（packageId）                                                                              | Result\<PackageVO\>                                                                          |
| 批次零件分页        | GET /api/part/batch-part/page                          | 通用分页参数；业务上按 batchId、零件图号、三级品类等筛选。具体 Query DTO 字段以联调为准。                 | Result\<PageData\<BatchPartVO\>\>                                                            |
| 零件详情            | GET /api/part/batch-part/{id}                          | Path：id:String（零件明细ID）                                                                             | Result\<BatchPartVO\>                                                                        |
| 工作包零件关系      | GET /api/package/part/list 或 /page                    | 业务上按 packageId 过滤；分页时带通用分页参数。具体 Query DTO 字段以联调为准。                            | Result\<List\<PartVO\>\> 或 Result\<PageData\<PartVO\>\>                                     |
| 人工移动零件/关联组 | 待后端提供专用接口                                     | 约束已锁定：只能同 batchId 工作包间移动；套裁/左右件整体移动。请求结构待后端补充。                        | 返回结构待后端补充；原型需设计成功/失败反馈                                                  |
| 生成供应商推荐      | POST /api/subcontract/batch/{id}/recommend             | Path：id:String（batchId）                                                                                | Result\<List\<SupplierRecommendationVO\>\>                                                   |
| 查询推荐结果        | GET /api/package/supplier-recommendation/list 或 /page | 业务上按 packageId / batchId 筛选；具体 Query DTO 字段以联调为准。                                        | Result\<List\<SupplierRecommendationVO\>\> 或 Result\<PageData\<SupplierRecommendationVO\>\> |
| 一键编排            | POST /api/subcontract/batch/{id}/run                   | Path：id:String（batchId）                                                                                | Result\<OrchestrationResultVO\>                                                              |
| 导出推荐结果        | GET /api/subcontract/batch/{id}/export                 | Path：id:String（batchId）                                                                                | Excel 文件流 application/octet-stream                                                        |

## 4.4 工作包返回字段 PackageVO

| **字段**             | **类型** | **说明**                             |
|----------------------|----------|--------------------------------------|
| id                   | String   | 工作包ID                             |
| batchId              | String   | 所属批次ID                           |
| packageNo            | String   | 工作包编号                           |
| categoryId           | String   | 品类ID                               |
| supplierCountNeeded  | Integer  | 供应商需求数                         |
| recommendCount       | Integer  | 应推荐供应商数（当前后端为需求数+4） |
| partCount            | Integer  | 包内零件数                           |
| partType             | String   | 零件类型                             |
| maxPartLimit         | Integer  | 容量上限                             |
| hasHistorySupplier   | Integer  | 是否有历史供应商（0/1）              |
| isSpecialCategory    | Integer  | 是否特殊品类（0/1）                  |
| specialType          | String   | 特殊类型                             |
| recommendationStatus | String   | 推荐状态                             |

## 4.5 零件返回字段 BatchPartVO

| **字段**             | **类型**   | **说明**                                         |
|----------------------|------------|--------------------------------------------------|
| id                   | String     | 零件明细ID                                       |
| batchId              | String     | 所属批次ID                                       |
| seqNo                | Integer    | 序号                                             |
| partDrawingNo        | String     | 零件图号                                         |
| aircraftModel        | String     | 外协转码机型                                     |
| partName             | String     | 零件名称                                         |
| materialType         | String     | 材料类型                                         |
| lengthValue          | BigDecimal | 长度                                             |
| widthValue           | BigDecimal | 宽度                                             |
| nestingInfo          | String     | 套裁信息；关联组识别关键字段                     |
| historySupplier1~3   | String     | 历史供应商                                       |
| supplierCountNeeded  | Integer    | 供应商需求数                                     |
| thirdCategory        | String     | 上传的三级品类名称                               |
| thirdCategoryId      | String     | 系统推导的三级品类ID                             |
| partType             | String     | 小型/中型/大型/超大型/其他                       |
| packageId            | String     | 当前所属工作包ID                                 |
| packageNo            | String     | 分包号（设计文档中存在；接口字段以实际联调为准） |
| recommendSupplier1~7 | String     | 导出回写的推荐供应商                             |

## 4.6 工作包零件关系 PartVO

| **字段**      | **类型** | **说明**           |
|---------------|----------|--------------------|
| id            | String   | 关联ID             |
| packageId     | String   | 工作包ID           |
| partId        | String   | 指向 BATCH_PART.ID |
| partDrawingNo | String   | 零件图号           |

## 4.7 推荐结果 SupplierRecommendationVO

| **字段**         | **类型**   | **说明**                                                                  |
|------------------|------------|---------------------------------------------------------------------------|
| id               | String     | 推荐结果ID                                                                |
| packageId        | String     | 工作包ID                                                                  |
| batchId          | String     | 批次ID                                                                    |
| supplierId       | String     | 供应商ID                                                                  |
| supplierName     | String     | 供应商名称                                                                |
| recommendOrder   | Integer    | 推荐序号（1起）                                                           |
| recommendSource  | String     | HISTORY / QUALITY_ROUND / NORMAL_ROUND / ALL_CATEGORY（前端按返回值展示） |
| qualityLevel     | String     | 优质 / 普通                                                               |
| performanceScore | BigDecimal | 绩效得分                                                                  |

## 4.8 一键编排返回 OrchestrationResultVO

| **字段**            | **类型** | **说明**         |
|---------------------|----------|------------------|
| batchId             | String   | 批次ID           |
| batchNo             | String   | 批次编号         |
| batchStatus         | String   | 执行后的批次状态 |
| packageCount        | Integer  | 工作包数量       |
| recommendationCount | Integer  | 推荐记录数量     |

# 5. 界面三：供应商中心

## 5.1 业务目的

- 以供应商为中心维护基础资料、启停状态和可承制三级品类。

- 供应商列表是一级入口；供应商详情可以聚合基础信息、承制品类，并跳转/关联查看绩效与排名。

- 禁用供应商不参与推荐流程。

## 5.2 操作逻辑

1\. 分页加载供应商列表并支持搜索。

2\. 新增供应商时填写供应商名称、备注；编辑时修改相同字段。

3\. 支持启用/停用切换，停用后不参与推荐。

4\. 供应商详情中维护其与三级品类的多对多关联，即“该供应商可以承制哪些三级品类”。

5\. 绩效及排名可在供应商详情内作为关联信息展示，也可进入“供应商绩效与排名”界面集中管理。

## 5.3 API 与请求/返回

| **操作**         | **Method / Path**                        | **请求参数**                                                | **返回**                                                         |
|------------------|------------------------------------------|-------------------------------------------------------------|------------------------------------------------------------------|
| 供应商分页       | GET /api/supplier/page                   | 通用分页参数；搜索字段以实际 Query DTO 为准                 | Result\<PageData\<SupplierVO\>\>                                 |
| 供应商列表       | GET /api/supplier/list                   | 查询条件以接口 Query DTO 为准                               | Result\<List\<SupplierVO\>\>                                     |
| 供应商详情       | GET /api/supplier/{id}                   | Path：id:String                                             | Result\<SupplierVO\>                                             |
| 新增供应商       | POST /api/supplier                       | Body：SupplierVO                                            | Result\<String\>（新ID）                                         |
| 编辑供应商       | PUT /api/supplier                        | Body：SupplierVO                                            | Result\<Boolean\>                                                |
| 删除供应商       | DELETE /api/supplier/{id}                | Path：id:String                                             | Result\<Boolean\>                                                |
| 批量删除         | DELETE /api/supplier                     | Body：String\[\] ids                                        | Result\<Boolean\>                                                |
| 启用/停用        | PUT /api/supplier/{id}/enabled           | Path：id:String；Query：enabled:Integer（1启用/0停用）      | Result\<Boolean\>                                                |
| 承制品类列表     | GET /api/supplier/category/list 或 /page | 业务上按 supplierId / categoryId 筛选；分页时带通用分页参数 | Result\<List\<CategoryVO\>\> 或 Result\<PageData\<CategoryVO\>\> |
| 新增承制品类关联 | POST /api/supplier/category              | Body：CategoryVO（supplierId + categoryId）                 | Result\<String\>                                                 |
| 修改关联         | PUT /api/supplier/category               | Body：CategoryVO                                            | Result\<Boolean\>                                                |
| 删除关联         | DELETE /api/supplier/category/{id}       | Path：id:String（关联ID）                                   | Result\<Boolean\>                                                |

## 5.4 返回/提交对象

| **SupplierVO 字段** | **类型** | **说明**      |
|---------------------|----------|---------------|
| id                  | String   | 供应商ID      |
| supplierName        | String   | 供应商名称    |
| enabled             | Integer  | 1启用 / 0停用 |
| remark              | String   | 备注          |

| **CategoryVO 字段** | **类型** | **说明**          |
|---------------------|----------|-------------------|
| id                  | String   | 供应商-品类关联ID |
| supplierId          | String   | 供应商ID          |
| categoryId          | String   | 三级品类主数据ID  |

# 6. 界面四：供应商绩效与排名

## 6.1 业务目的

- 每月上传供应商绩效 Excel，上传内容是“供应商名称 + 绩效成绩”，不是排名。

- 查看供应商各月绩效数据、综合得分及品类内排名。

- 当前后端上传成功后会自动触发当月排名生成；普通流程不需要用户再手工点击“生成排名”。

- 保留排名快照生成接口作为异常重试/管理员修复动作即可。

## 6.2 操作逻辑

1\. 用户选择绩效年份、月份并上传两列 Excel。

2\. 上传后显示成功数量、失败数量和失败行信息（具体 PerformanceUploadResultVO 字段在现有 API 文档中未展开，原型按“汇总 + 错误明细”设计即可）。

3\. 上传成功后刷新绩效列表和排名列表。

4\. 绩效列表支持按年份、月份、供应商筛选；排名列表支持按年月、品类查看。

5\. 综合得分公式在后端文档与代码核对中存在口径差异，原型不要写死公式说明，只展示接口返回的 halfYearAvg、lastMonthScore、comprehensiveScore。

6\. 若自动排名生成失败，可提供管理员“重新生成排名”动作。

## 6.3 API 与请求/返回

| **操作**                 | **Method / Path**                            | **请求参数**                                                                       | **返回**                                |
|--------------------------|----------------------------------------------|------------------------------------------------------------------------------------|-----------------------------------------|
| 上传月度绩效             | POST /api/supplier/performance/upload        | multipart/form-data：file:File 必填；year:Integer 必填；month:Integer 必填（1-12） | Result\<PerformanceUploadResultVO\>     |
| 绩效分页                 | GET /api/supplier/performance/page           | 通用分页参数；业务上按年份/月/供应商筛选，具体 Query DTO 字段以联调为准            | Result\<PageData\<PerformanceVO\>\>     |
| 绩效列表                 | GET /api/supplier/performance/list           | 筛选条件以实际 Query DTO 为准                                                      | Result\<List\<PerformanceVO\>\>         |
| 绩效详情                 | GET /api/supplier/performance/{id}           | Path：id:String                                                                    | Result\<PerformanceVO\>                 |
| 新增绩效                 | POST /api/supplier/performance               | Body：PerformanceVO                                                                | Result\<String\>                        |
| 修改绩效                 | PUT /api/supplier/performance                | Body：PerformanceVO                                                                | Result\<Boolean\>                       |
| 删除绩效                 | DELETE /api/supplier/performance/{id}        | Path：id:String                                                                    | Result\<Boolean\>                       |
| 排名分页                 | GET /api/supplier/ranking-snapshot/page      | 通用分页参数；业务上按 year/month/categoryId 等筛选，具体 Query DTO 字段以联调为准 | Result\<PageData\<RankingSnapshotVO\>\> |
| 排名列表                 | GET /api/supplier/ranking-snapshot/list      | 筛选条件以实际 Query DTO 为准                                                      | Result\<List\<RankingSnapshotVO\>\>     |
| 重新生成排名（异常重试） | POST /api/supplier/ranking-snapshot/generate | Query：year:Integer 必填；month:Integer 必填                                       | Result\<Boolean\>                       |

## 6.4 PerformanceVO

| **字段**           | **类型**   | **说明**                                 |
|--------------------|------------|------------------------------------------|
| id                 | String     | 绩效记录ID                               |
| supplierId         | String     | 供应商ID                                 |
| performanceYear    | Integer    | 年份                                     |
| performanceMonth   | Integer    | 月份                                     |
| score              | BigDecimal | 原始成绩                                 |
| halfYearAvg        | BigDecimal | 半年平均                                 |
| lastMonthScore     | BigDecimal | 上月得分字段                             |
| comprehensiveScore | BigDecimal | 综合得分；前端展示返回值，不写死计算公式 |

## 6.5 RankingSnapshotVO

| **字段**           | **类型**   | **说明**         |
|--------------------|------------|------------------|
| id                 | String     | 排名快照ID       |
| supplierId         | String     | 供应商ID         |
| categoryId         | String     | 三级品类ID       |
| rankingYear        | Integer    | 排名年份         |
| rankingMonth       | Integer    | 排名月份         |
| comprehensiveScore | BigDecimal | 综合得分         |
| rankInCategory     | Integer    | 品类内排名       |
| qualityLevel       | String     | 优质 / 普通      |
| totalSupplierCount | Integer    | 该品类供应商总数 |

# 7. 界面五：规则配置

## 7.1 业务目的

- 将低频主数据/规则维护聚合在一个管理模块中，可由 Figma 自行设计成 Tab、分组导航或子页面。

- 包含：三级品类主数据、特殊品类配置、左右件自动识别规则、左右件人工关系、工作包容量配置。

- 零件历史供应商属于推荐参考数据，可作为规则配置中的“历史数据维护”子区域，或由设计方放入供应商中心的辅助数据区。

- 轮流游标属于后端内部状态，本次前端原型不作为业务配置项设计。

## 7.2 三级品类主数据

- 维护三级品类名称、材料类型、长宽区间、尺寸逻辑和对应零件类型；支持查询、新增、编辑、删除。

| **操作** | **Method / Path**                     | **请求参数**                            | **返回**                               |
|----------|---------------------------------------|-----------------------------------------|----------------------------------------|
| 分页     | GET /api/part/category-master/page    | 通用分页参数；搜索字段以 Query DTO 为准 | Result\<PageData\<CategoryMasterVO\>\> |
| 列表     | GET /api/part/category-master/list    | 查询条件以 Query DTO 为准               | Result\<List\<CategoryMasterVO\>\>     |
| 详情     | GET /api/part/category-master/{id}    | Path：id:String                         | Result\<CategoryMasterVO\>             |
| 新增     | POST /api/part/category-master        | Body：CategoryMasterVO                  | Result\<String\>                       |
| 修改     | PUT /api/part/category-master         | Body：CategoryMasterVO                  | Result\<Boolean\>                      |
| 删除     | DELETE /api/part/category-master/{id} | Path：id:String                         | Result\<Boolean\>                      |

| **CategoryMasterVO 字段** | **类型**   | **说明**                   |
|---------------------------|------------|----------------------------|
| id                        | String     | 品类ID                     |
| categoryName              | String     | 三级品类名称               |
| materialType              | String     | 材料类型                   |
| lengthMin / lengthMax     | BigDecimal | 长度区间                   |
| widthMin / widthMax       | BigDecimal | 宽度区间                   |
| sizeLogic                 | String     | AND / OR                   |
| partType                  | String     | 小型/中型/大型/超大型/其他 |

## 7.3 特殊品类配置

- 配置特殊品类类型及其推荐规则；前端仅维护后端已有字段，不设计推荐算法细节。

| **操作**  | **Method / Path**                              | **请求参数**                                    | **返回**                                                                    |
|-----------|------------------------------------------------|-------------------------------------------------|-----------------------------------------------------------------------------|
| 分页/列表 | GET /api/special/category-config/page 或 /list | 分页时带通用分页参数；查询条件以 Query DTO 为准 | Result\<PageData\<CategoryConfigVO\>\> / Result\<List\<CategoryConfigVO\>\> |
| 详情      | GET /api/special/category-config/{id}          | Path：id:String                                 | Result\<CategoryConfigVO\>                                                  |
| 新增      | POST /api/special/category-config              | Body：CategoryConfigVO                          | Result\<String\>                                                            |
| 修改      | PUT /api/special/category-config               | Body：CategoryConfigVO                          | Result\<Boolean\>                                                           |
| 删除      | DELETE /api/special/category-config/{id}       | Path：id:String                                 | Result\<Boolean\>                                                           |

| **CategoryConfigVO 字段** | **类型** | **说明**                    |
|---------------------------|----------|-----------------------------|
| id                        | String   | 配置ID                      |
| categoryId                | String   | 品类ID                      |
| specialType               | String   | COMPOSITE / REINFORCEMENT   |
| recommendRule             | String   | ALL_SUPPLIERS / ROUND_ROBIN |
| ignoreQuality             | Integer  | 1忽略优质/普通；0正常区分   |

## 7.4 左右件自动识别规则

- 按机型配置左右件图号后缀对，用于自动识别左右件。

| **操作**  | **Method / Path**                      | **请求参数**       | **返回**                                                          |
|-----------|----------------------------------------|--------------------|-------------------------------------------------------------------|
| 分页/列表 | GET /api/left/right-rule/page 或 /list | 分页时通用分页参数 | Result\<PageData\<RightRuleVO\>\> / Result\<List\<RightRuleVO\>\> |
| 详情      | GET /api/left/right-rule/{id}          | Path：id:String    | Result\<RightRuleVO\>                                             |
| 新增      | POST /api/left/right-rule              | Body：RightRuleVO  | Result\<String\>                                                  |
| 修改      | PUT /api/left/right-rule               | Body：RightRuleVO  | Result\<Boolean\>                                                 |
| 删除      | DELETE /api/left/right-rule/{id}       | Path：id:String    | Result\<Boolean\>                                                 |

| **RightRuleVO 字段** | **类型** | **说明** |
|----------------------|----------|----------|
| id                   | String   | 规则ID   |
| aircraftModel        | String   | 机型     |
| leftSuffix           | String   | 左件后缀 |
| rightSuffix          | String   | 右件后缀 |

## 7.5 左右件人工关系

- 对不能通过后缀规则识别的左右件，人工维护左件图号与右件图号对应关系。该关系与批次工作台中的“移动零件”不是同一功能。

| **操作**  | **Method / Path**                        | **请求参数**        | **返回**                                                              |
|-----------|------------------------------------------|---------------------|-----------------------------------------------------------------------|
| 分页/列表 | GET /api/left/right-manual/page 或 /list | 分页时通用分页参数  | Result\<PageData\<RightManualVO\>\> / Result\<List\<RightManualVO\>\> |
| 详情      | GET /api/left/right-manual/{id}          | Path：id:String     | Result\<RightManualVO\>                                               |
| 新增      | POST /api/left/right-manual              | Body：RightManualVO | Result\<String\>                                                      |
| 修改      | PUT /api/left/right-manual               | Body：RightManualVO | Result\<Boolean\>                                                     |
| 删除      | DELETE /api/left/right-manual/{id}       | Path：id:String     | Result\<Boolean\>                                                     |

| **RightManualVO 字段** | **类型** | **说明**     |
|------------------------|----------|--------------|
| id                     | String   | 记录ID       |
| leftPartDrawingNo      | String   | 左件零件图号 |
| rightPartDrawingNo     | String   | 右件零件图号 |

## 7.6 工作包容量配置

- 维护不同零件类型的工作包最大零件数。属于低频系统规则。

| **操作**  | **Method / Path**                               | **请求参数**              | **返回**                                                                          |
|-----------|-------------------------------------------------|---------------------------|-----------------------------------------------------------------------------------|
| 分页/列表 | GET /api/part/type-package-config/page 或 /list | 分页时通用分页参数        | Result\<PageData\<TypePackageConfigVO\>\> / Result\<List\<TypePackageConfigVO\>\> |
| 详情      | GET /api/part/type-package-config/{id}          | Path：id:String           | Result\<TypePackageConfigVO\>                                                     |
| 新增      | POST /api/part/type-package-config              | Body：TypePackageConfigVO | Result\<String\>                                                                  |
| 修改      | PUT /api/part/type-package-config               | Body：TypePackageConfigVO | Result\<Boolean\>                                                                 |
| 删除      | DELETE /api/part/type-package-config/{id}       | Path：id:String           | Result\<Boolean\>                                                                 |

| **TypePackageConfigVO 字段** | **类型** | **说明**   |
|------------------------------|----------|------------|
| id                           | String   | 配置ID     |
| partType                     | String   | 零件类型   |
| typeLabel                    | String   | 类型标签   |
| maxPartCount                 | Integer  | 最大零件数 |

## 7.7 零件历史供应商数据

- 记录零件与历史承制供应商关系，作为推荐引擎参考数据。现有接口文档未展开 HistorySupplierVO 字段，因此原型只需设计查询/维护能力，具体字段以接口联调为准。

| **操作**  | **Method / Path**                            | **请求参数**                                  | **返回**                                                                      |
|-----------|----------------------------------------------|-----------------------------------------------|-------------------------------------------------------------------------------|
| 分页/列表 | GET /api/part/history-supplier/page 或 /list | 分页时通用分页参数；业务上按零件/供应商筛选   | Result\<PageData\<HistorySupplierVO\>\> / Result\<List\<HistorySupplierVO\>\> |
| 详情      | GET /api/part/history-supplier/{id}          | Path：id:String                               | Result\<HistorySupplierVO\>                                                   |
| 新增      | POST /api/part/history-supplier              | Body：HistorySupplierVO（字段待接口联调确认） | Result\<String\>                                                              |
| 修改      | PUT /api/part/history-supplier               | Body：HistorySupplierVO                       | Result\<Boolean\>                                                             |
| 删除      | DELETE /api/part/history-supplier/{id}       | Path：id:String                               | Result\<Boolean\>                                                             |

# 8. 界面六：日志记录

## 8.1 业务目的

- 聚合业务操作日志与系统操作日志，用于追溯、审计和问题定位。

- 建议作为一个一级模块，内部使用“业务日志 / 系统日志”两个视图。

- 虽然后端资源提供标准 CRUD，本次原型按查询、筛选、查看详情、导出/审计为主，不突出新增/修改/删除日志。

## 8.2 业务操作日志

1\. 按时间倒序查看业务操作记录。

2\. 支持按操作人、操作类型、时间范围等条件筛选；具体 Query DTO 字段未在现有接口文档中展开，以联调为准。

3\. 支持查看单条日志详情。

| **操作** | **Method / Path**           | **请求参数**                                         | **返回**                             |
|----------|-----------------------------|------------------------------------------------------|--------------------------------------|
| 分页     | GET /api/operation/log/page | 通用分页参数 + 业务筛选条件（字段以 Query DTO 为准） | Result\<PageData\<OperationLogVO\>\> |
| 列表     | GET /api/operation/log/list | 查询条件以 Query DTO 为准                            | Result\<List\<OperationLogVO\>\>     |
| 详情     | GET /api/operation/log/{id} | Path：id:String                                      | Result\<OperationLogVO\>             |

> *说明：现有文档未列出 OperationLogVO 字段，因此 Figma 原型可采用常规日志信息结构（时间、操作人、操作类型、对象、结果等）作为占位，但字段名称必须在接口联调后替换，不能视为最终接口契约。*

## 8.3 系统操作日志

1\. 用于平台级操作记录查询。

2\. 支持筛选和详情查看；具体 Query DTO 与 VO 字段未在现有接口文档中展开，以联调为准。

| **操作** | **Method / Path**                | **请求参数**                                             | **返回**                                 |
|----------|----------------------------------|----------------------------------------------------------|------------------------------------------|
| 分页     | GET /api/system/operate-log/page | 通用分页参数 + 系统日志筛选条件（字段以 Query DTO 为准） | Result\<PageData\<SystemOperateLogVO\>\> |
| 列表     | GET /api/system/operate-log/list | 查询条件以 Query DTO 为准                                | Result\<List\<SystemOperateLogVO\>\>     |
| 详情     | GET /api/system/operate-log/{id} | Path：id:String                                          | Result\<SystemOperateLogVO\>             |

# 9. Figma 设计时必须保留的状态与异常反馈

| **场景**     | **必须表达的信息**                                             |
|--------------|----------------------------------------------------------------|
| Excel 导入   | 上传中、导入成功、部分失败、失败行号与失败原因                 |
| 批次状态     | DRAFT / DATA_READY / PACKAGED / RECOMMENDED / COMPLETED        |
| 生成工作包   | 执行中、成功后工作包数量、失败信息                             |
| 人工调包     | 仅当前 batchId 内可选目标包；关联组整体移动；专用 API 尚未完成 |
| 供应商推荐   | 执行中、成功后按包查看结果、推荐来源/质量等级/绩效分数         |
| 绩效上传     | 成功数、失败数、失败明细；排名自动更新或异常重试               |
| 导出         | 导出中、下载成功/失败；导出后当前后端会将批次置为 COMPLETED    |
| 通用接口错误 | Result.code 非0时展示 msg，不假设 data 一定存在                |

# 10. 本次原型明确不设计的内容

- 最终供应商确认、定商、中标审批。

- 供应商推荐轮询算法配置、游标计算可视化或算法正确性判断。

- 跨 batchId / 跨 Excel 的零件移动。

- 拆分套裁关联组或左右件关联组。

- 用通用 PUT /api/part/batch-part 直接实现正式人工调包。

- 要求用户每月手工“生成排名”作为固定流程；排名生成主要由绩效上传自动触发。

# 11. 数据来源说明

- 《外协零件分包及供应商推荐系统 — 前端接口文档》（api-documentation.md，2026-07-24）。

- 《外协零件分包及供应商推荐系统 — 界面设计需求文档》（2026-07-24）。

- 《ChatGPT 15 个业务问题——后端源码核对答复》（2026-08-12）。

- 用户在 2026-08-12 对人工调包边界、关联零件不可拆、绩效上传语义和前端职责范围的最终确认。
