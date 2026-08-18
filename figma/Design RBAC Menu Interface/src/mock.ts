// ─── API VO Types ─────────────────────────────────────────────────────────────

export type BatchStatus = "DRAFT" | "DATA_READY" | "PACKAGED" | "RECOMMENDED" | "COMPLETED"

export interface BatchVO {
  id: string
  batchNo: string
  flowNo: string
  batchStatus: BatchStatus
  uploadFileName: string
  totalPartCount: number
  totalPackageCount: number
  operator: string
}

export interface PackageVO {
  id: string
  batchId: string
  packageNo: string
  categoryId: string
  categoryName: string
  supplierCountNeeded: number
  recommendCount: number
  partCount: number
  partType: string
  maxPartLimit: number
  hasHistorySupplier: number
  isSpecialCategory: number
  specialType: string
  recommendationStatus: string
}

export interface BatchPartVO {
  id: string
  batchId: string
  seqNo: number
  partDrawingNo: string
  aircraftModel: string
  partName: string
  materialType: string
  lengthValue: number
  widthValue: number
  nestingInfo: string
  historySupplier1: string
  historySupplier2: string
  historySupplier3: string
  supplierCountNeeded: number
  thirdCategory: string
  thirdCategoryId: string
  partType: string
  packageId: string
  packageNo: string
}

export type RecommendSource = "HISTORY" | "QUALITY_ROUND" | "NORMAL_ROUND" | "ALL_CATEGORY"

export interface SupplierRecommendationVO {
  id: string
  packageId: string
  batchId: string
  supplierId: string
  supplierName: string
  recommendOrder: number
  recommendSource: RecommendSource
  qualityLevel: string
  performanceScore: number
}

export interface SupplierVO {
  id: string
  supplierName: string
  enabled: number
  remark: string
}

export interface SupplierCategoryVO {
  id: string
  supplierId: string
  categoryId: string
  categoryName: string
}

export interface PerformanceVO {
  id: string
  supplierId: string
  supplierName: string
  performanceYear: number
  performanceMonth: number
  score: number
  halfYearAvg: number
  lastMonthScore: number
  comprehensiveScore: number
}

export interface RankingSnapshotVO {
  id: string
  supplierId: string
  supplierName: string
  categoryId: string
  categoryName: string
  rankingYear: number
  rankingMonth: number
  comprehensiveScore: number
  rankInCategory: number
  qualityLevel: string
  totalSupplierCount: number
}

export interface CategoryMasterVO {
  id: string
  categoryName: string
  materialType: string
  lengthMin: number
  lengthMax: number
  widthMin: number
  widthMax: number
  sizeLogic: string
  partType: string
}

export interface CategoryConfigVO {
  id: string
  categoryId: string
  categoryName: string
  specialType: string
  recommendRule: string
  ignoreQuality: number
}

export interface RightRuleVO {
  id: string
  aircraftModel: string
  leftSuffix: string
  rightSuffix: string
}

export interface RightManualVO {
  id: string
  leftPartDrawingNo: string
  rightPartDrawingNo: string
}

export interface TypePackageConfigVO {
  id: string
  partType: string
  typeLabel: string
  maxPartCount: number
}

export interface OperationLogVO {
  id: string
  operator: string
  operatorIp: string
  operationType: string
  targetModule: string
  targetObject: string
  result: string
  operateTime: string
  remark: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const BATCHES: BatchVO[] = [
  { id: "b001", batchNo: "SUB-20260814-001", flowNo: "FLOW-10293", batchStatus: "DATA_READY", uploadFileName: "外协分包清单_20260814.xlsx", totalPartCount: 145, totalPackageCount: 0, operator: "张三" },
  { id: "b002", batchNo: "SUB-20260812-004", flowNo: "", batchStatus: "COMPLETED", uploadFileName: "外协分包清单_20260812.xlsx", totalPartCount: 89, totalPackageCount: 8, operator: "李四" },
  { id: "b003", batchNo: "SUB-20260810-002", flowNo: "FLOW-10288", batchStatus: "RECOMMENDED", uploadFileName: "外协分包清单_20260810.xlsx", totalPartCount: 67, totalPackageCount: 5, operator: "张三" },
  { id: "b004", batchNo: "SUB-20260805-001", flowNo: "", batchStatus: "PACKAGED", uploadFileName: "外协分包清单_20260805.xlsx", totalPartCount: 38, totalPackageCount: 4, operator: "王五" },
  { id: "b005", batchNo: "SUB-20260801-003", flowNo: "FLOW-10201", batchStatus: "DRAFT", uploadFileName: "外协分包清单_20260801.xlsx", totalPartCount: 42, totalPackageCount: 0, operator: "李四" },
  { id: "b006", batchNo: "SUB-20260728-002", flowNo: "FLOW-10185", batchStatus: "COMPLETED", uploadFileName: "外协分包清单_20260728.xlsx", totalPartCount: 178, totalPackageCount: 14, operator: "赵六" },
]

export const PACKAGES: PackageVO[] = [
  { id: "p001", batchId: "b003", packageNo: "PKG-20260810-001", categoryId: "cat001", categoryName: "铝合金钣金件", supplierCountNeeded: 2, recommendCount: 6, partCount: 15, partType: "小型", maxPartLimit: 20, hasHistorySupplier: 1, isSpecialCategory: 0, specialType: "", recommendationStatus: "DONE" },
  { id: "p002", batchId: "b003", packageNo: "PKG-20260810-002", categoryId: "cat002", categoryName: "钛合金机加工件", supplierCountNeeded: 3, recommendCount: 7, partCount: 8, partType: "中型", maxPartLimit: 10, hasHistorySupplier: 1, isSpecialCategory: 0, specialType: "", recommendationStatus: "DONE" },
  { id: "p003", batchId: "b003", packageNo: "PKG-20260810-003", categoryId: "cat003", categoryName: "复合材料蒙皮", supplierCountNeeded: 2, recommendCount: 6, partCount: 20, partType: "大型", maxPartLimit: 5, hasHistorySupplier: 0, isSpecialCategory: 1, specialType: "COMPOSITE", recommendationStatus: "DONE" },
  { id: "p004", batchId: "b003", packageNo: "PKG-20260810-004", categoryId: "cat001", categoryName: "铝合金钣金件", supplierCountNeeded: 2, recommendCount: 6, partCount: 18, partType: "小型", maxPartLimit: 20, hasHistorySupplier: 0, isSpecialCategory: 0, specialType: "", recommendationStatus: "DONE" },
  { id: "p005", batchId: "b003", packageNo: "PKG-20260810-005", categoryId: "cat004", categoryName: "标准紧固件", supplierCountNeeded: 1, recommendCount: 5, partCount: 6, partType: "其他", maxPartLimit: 8, hasHistorySupplier: 1, isSpecialCategory: 0, specialType: "", recommendationStatus: "DONE" },
  { id: "p006", batchId: "b004", packageNo: "PKG-20260805-001", categoryId: "cat001", categoryName: "铝合金钣金件", supplierCountNeeded: 2, recommendCount: 6, partCount: 10, partType: "小型", maxPartLimit: 20, hasHistorySupplier: 1, isSpecialCategory: 0, specialType: "", recommendationStatus: "" },
  { id: "p007", batchId: "b004", packageNo: "PKG-20260805-002", categoryId: "cat002", categoryName: "钛合金机加工件", supplierCountNeeded: 2, recommendCount: 6, partCount: 8, partType: "中型", maxPartLimit: 10, hasHistorySupplier: 0, isSpecialCategory: 0, specialType: "", recommendationStatus: "" },
  { id: "p008", batchId: "b004", packageNo: "PKG-20260805-003", categoryId: "cat003", categoryName: "复合材料蒙皮", supplierCountNeeded: 2, recommendCount: 6, partCount: 12, partType: "大型", maxPartLimit: 5, hasHistorySupplier: 1, isSpecialCategory: 1, specialType: "COMPOSITE", recommendationStatus: "" },
  { id: "p009", batchId: "b004", packageNo: "PKG-20260805-004", categoryId: "cat005", categoryName: "橡胶密封件", supplierCountNeeded: 1, recommendCount: 5, partCount: 8, partType: "其他", maxPartLimit: 8, hasHistorySupplier: 0, isSpecialCategory: 0, specialType: "", recommendationStatus: "" },
]

export const BATCH_PARTS: BatchPartVO[] = [
  { id: "bp001", batchId: "b003", seqNo: 1, partDrawingNo: "ARJ21-SKIN-001L", aircraftModel: "ARJ21", partName: "前机身蒙皮左", materialType: "铝合金", lengthValue: 450, widthValue: 220, nestingInfo: "NEST-G01", historySupplier1: "航空精密机械", historySupplier2: "", historySupplier3: "", supplierCountNeeded: 2, thirdCategory: "铝合金钣金件", thirdCategoryId: "cat001", partType: "小型", packageId: "p001", packageNo: "PKG-20260810-001" },
  { id: "bp002", batchId: "b003", seqNo: 2, partDrawingNo: "ARJ21-SKIN-001R", aircraftModel: "ARJ21", partName: "前机身蒙皮右", materialType: "铝合金", lengthValue: 450, widthValue: 220, nestingInfo: "NEST-G01", historySupplier1: "航空精密机械", historySupplier2: "", historySupplier3: "", supplierCountNeeded: 2, thirdCategory: "铝合金钣金件", thirdCategoryId: "cat001", partType: "小型", packageId: "p001", packageNo: "PKG-20260810-001" },
  { id: "bp003", batchId: "b003", seqNo: 3, partDrawingNo: "ARJ21-RIB-002", aircraftModel: "ARJ21", partName: "机翼肋板", materialType: "铝合金", lengthValue: 380, widthValue: 180, nestingInfo: "", historySupplier1: "成飞制造", historySupplier2: "西飞机械", historySupplier3: "", supplierCountNeeded: 2, thirdCategory: "铝合金钣金件", thirdCategoryId: "cat001", partType: "小型", packageId: "p001", packageNo: "PKG-20260810-001" },
  { id: "bp004", batchId: "b003", seqNo: 4, partDrawingNo: "ARJ21-FRAME-003L", aircraftModel: "ARJ21", partName: "机身框架左", materialType: "铝合金", lengthValue: 420, widthValue: 200, nestingInfo: "NEST-G02", historySupplier1: "", historySupplier2: "", historySupplier3: "", supplierCountNeeded: 2, thirdCategory: "铝合金钣金件", thirdCategoryId: "cat001", partType: "小型", packageId: "p001", packageNo: "PKG-20260810-001" },
  { id: "bp005", batchId: "b003", seqNo: 5, partDrawingNo: "ARJ21-FRAME-003R", aircraftModel: "ARJ21", partName: "机身框架右", materialType: "铝合金", lengthValue: 420, widthValue: 200, nestingInfo: "NEST-G02", historySupplier1: "", historySupplier2: "", historySupplier3: "", supplierCountNeeded: 2, thirdCategory: "铝合金钣金件", thirdCategoryId: "cat001", partType: "小型", packageId: "p001", packageNo: "PKG-20260810-001" },
  { id: "bp006", batchId: "b003", seqNo: 6, partDrawingNo: "ARJ21-BRACKET-004", aircraftModel: "ARJ21", partName: "支撑托架", materialType: "铝合金", lengthValue: 290, widthValue: 150, nestingInfo: "", historySupplier1: "航空精密机械", historySupplier2: "", historySupplier3: "", supplierCountNeeded: 2, thirdCategory: "铝合金钣金件", thirdCategoryId: "cat001", partType: "小型", packageId: "p002", packageNo: "PKG-20260810-002" },
  { id: "bp007", batchId: "b003", seqNo: 7, partDrawingNo: "ARJ21-SPAR-005", aircraftModel: "ARJ21", partName: "翼梁机加件", materialType: "钛合金", lengthValue: 350, widthValue: 120, nestingInfo: "", historySupplier1: "沈飞零件", historySupplier2: "", historySupplier3: "", supplierCountNeeded: 3, thirdCategory: "钛合金机加工件", thirdCategoryId: "cat002", partType: "中型", packageId: "p002", packageNo: "PKG-20260810-002" },
  { id: "bp008", batchId: "b003", seqNo: 8, partDrawingNo: "ARJ21-FITTING-006", aircraftModel: "ARJ21", partName: "连接接头", materialType: "钛合金", lengthValue: 280, widthValue: 90, nestingInfo: "", historySupplier1: "哈飞制造", historySupplier2: "昌飞航空", historySupplier3: "", supplierCountNeeded: 3, thirdCategory: "钛合金机加工件", thirdCategoryId: "cat002", partType: "中型", packageId: "p002", packageNo: "PKG-20260810-002" },
]

export const RECOMMENDATIONS: SupplierRecommendationVO[] = [
  { id: "r001", packageId: "p001", batchId: "b003", supplierId: "s001", supplierName: "航空精密机械有限公司", recommendOrder: 1, recommendSource: "HISTORY", qualityLevel: "优质", performanceScore: 92.5 },
  { id: "r002", packageId: "p001", batchId: "b003", supplierId: "s002", supplierName: "成飞制造技术中心", recommendOrder: 2, recommendSource: "QUALITY_ROUND", qualityLevel: "优质", performanceScore: 88.3 },
  { id: "r003", packageId: "p001", batchId: "b003", supplierId: "s003", supplierName: "西飞机械加工公司", recommendOrder: 3, recommendSource: "NORMAL_ROUND", qualityLevel: "普通", performanceScore: 75.2 },
  { id: "r004", packageId: "p001", batchId: "b003", supplierId: "s004", supplierName: "沈飞零件制造厂", recommendOrder: 4, recommendSource: "NORMAL_ROUND", qualityLevel: "普通", performanceScore: 68.9 },
  { id: "r005", packageId: "p001", batchId: "b003", supplierId: "s005", supplierName: "哈飞制造有限公司", recommendOrder: 5, recommendSource: "ALL_CATEGORY", qualityLevel: "普通", performanceScore: 62.0 },
  { id: "r006", packageId: "p001", batchId: "b003", supplierId: "s006", supplierName: "昌飞航空工业集团", recommendOrder: 6, recommendSource: "ALL_CATEGORY", qualityLevel: "普通", performanceScore: 55.8 },
  { id: "r007", packageId: "p002", batchId: "b003", supplierId: "s004", supplierName: "沈飞零件制造厂", recommendOrder: 1, recommendSource: "HISTORY", qualityLevel: "优质", performanceScore: 91.0 },
  { id: "r008", packageId: "p002", batchId: "b003", supplierId: "s001", supplierName: "航空精密机械有限公司", recommendOrder: 2, recommendSource: "QUALITY_ROUND", qualityLevel: "优质", performanceScore: 87.5 },
  { id: "r009", packageId: "p002", batchId: "b003", supplierId: "s005", supplierName: "哈飞制造有限公司", recommendOrder: 3, recommendSource: "NORMAL_ROUND", qualityLevel: "普通", performanceScore: 72.3 },
  { id: "r010", packageId: "p003", batchId: "b003", supplierId: "s007", supplierName: "天津航空复材公司", recommendOrder: 1, recommendSource: "QUALITY_ROUND", qualityLevel: "优质", performanceScore: 95.2 },
  { id: "r011", packageId: "p003", batchId: "b003", supplierId: "s008", supplierName: "北京复合材料研究院", recommendOrder: 2, recommendSource: "QUALITY_ROUND", qualityLevel: "优质", performanceScore: 90.1 },
  { id: "r012", packageId: "p004", batchId: "b003", supplierId: "s002", supplierName: "成飞制造技术中心", recommendOrder: 1, recommendSource: "NORMAL_ROUND", qualityLevel: "普通", performanceScore: 79.8 },
  { id: "r013", packageId: "p005", batchId: "b003", supplierId: "s009", supplierName: "广州标准件厂", recommendOrder: 1, recommendSource: "HISTORY", qualityLevel: "优质", performanceScore: 88.6 },
]

export const SUPPLIERS: SupplierVO[] = [
  { id: "s001", supplierName: "航空精密机械有限公司", enabled: 1, remark: "长期战略合作供应商，专注铝合金钣金件" },
  { id: "s002", supplierName: "成飞制造技术中心", enabled: 1, remark: "优质认证供应商" },
  { id: "s003", supplierName: "西飞机械加工公司", enabled: 1, remark: "" },
  { id: "s004", supplierName: "沈飞零件制造厂", enabled: 1, remark: "专注钛合金机加工件" },
  { id: "s005", supplierName: "哈飞制造有限公司", enabled: 1, remark: "" },
  { id: "s006", supplierName: "昌飞航空工业集团", enabled: 0, remark: "暂停合作，绩效不达标" },
  { id: "s007", supplierName: "天津航空复材公司", enabled: 1, remark: "复合材料专业供应商" },
  { id: "s008", supplierName: "北京复合材料研究院", enabled: 1, remark: "科研院所，质量稳定" },
  { id: "s009", supplierName: "广州标准件厂", enabled: 1, remark: "标准紧固件专供" },
]

export const SUPPLIER_CATEGORIES: SupplierCategoryVO[] = [
  { id: "sc001", supplierId: "s001", categoryId: "cat001", categoryName: "铝合金钣金件" },
  { id: "sc002", supplierId: "s001", categoryId: "cat005", categoryName: "橡胶密封件" },
  { id: "sc003", supplierId: "s002", categoryId: "cat001", categoryName: "铝合金钣金件" },
  { id: "sc004", supplierId: "s002", categoryId: "cat002", categoryName: "钛合金机加工件" },
  { id: "sc005", supplierId: "s003", categoryId: "cat001", categoryName: "铝合金钣金件" },
  { id: "sc006", supplierId: "s004", categoryId: "cat002", categoryName: "钛合金机加工件" },
  { id: "sc007", supplierId: "s005", categoryId: "cat001", categoryName: "铝合金钣金件" },
  { id: "sc008", supplierId: "s005", categoryId: "cat002", categoryName: "钛合金机加工件" },
  { id: "sc009", supplierId: "s007", categoryId: "cat003", categoryName: "复合材料蒙皮" },
  { id: "sc010", supplierId: "s008", categoryId: "cat003", categoryName: "复合材料蒙皮" },
  { id: "sc011", supplierId: "s009", categoryId: "cat004", categoryName: "标准紧固件" },
]

export const PERFORMANCES: PerformanceVO[] = [
  { id: "pf001", supplierId: "s001", supplierName: "航空精密机械有限公司", performanceYear: 2026, performanceMonth: 7, score: 92.5, halfYearAvg: 89.3, lastMonthScore: 88.0, comprehensiveScore: 90.6 },
  { id: "pf002", supplierId: "s002", supplierName: "成飞制造技术中心", performanceYear: 2026, performanceMonth: 7, score: 88.3, halfYearAvg: 86.0, lastMonthScore: 85.0, comprehensiveScore: 87.1 },
  { id: "pf003", supplierId: "s003", supplierName: "西飞机械加工公司", performanceYear: 2026, performanceMonth: 7, score: 75.2, halfYearAvg: 74.8, lastMonthScore: 74.0, comprehensiveScore: 74.9 },
  { id: "pf004", supplierId: "s004", supplierName: "沈飞零件制造厂", performanceYear: 2026, performanceMonth: 7, score: 91.0, halfYearAvg: 88.5, lastMonthScore: 87.2, comprehensiveScore: 89.6 },
  { id: "pf005", supplierId: "s005", supplierName: "哈飞制造有限公司", performanceYear: 2026, performanceMonth: 7, score: 62.0, halfYearAvg: 65.3, lastMonthScore: 68.0, comprehensiveScore: 64.6 },
  { id: "pf006", supplierId: "s007", supplierName: "天津航空复材公司", performanceYear: 2026, performanceMonth: 7, score: 95.2, halfYearAvg: 93.0, lastMonthScore: 92.0, comprehensiveScore: 93.8 },
  { id: "pf007", supplierId: "s001", supplierName: "航空精密机械有限公司", performanceYear: 2026, performanceMonth: 6, score: 88.0, halfYearAvg: 87.5, lastMonthScore: 86.0, comprehensiveScore: 87.9 },
  { id: "pf008", supplierId: "s002", supplierName: "成飞制造技术中心", performanceYear: 2026, performanceMonth: 6, score: 85.0, halfYearAvg: 84.0, lastMonthScore: 83.5, comprehensiveScore: 84.5 },
  { id: "pf009", supplierId: "s004", supplierName: "沈飞零件制造厂", performanceYear: 2026, performanceMonth: 6, score: 87.2, halfYearAvg: 85.0, lastMonthScore: 84.0, comprehensiveScore: 86.2 },
]

export const RANKINGS: RankingSnapshotVO[] = [
  { id: "rk001", supplierId: "s001", supplierName: "航空精密机械有限公司", categoryId: "cat001", categoryName: "铝合金钣金件", rankingYear: 2026, rankingMonth: 7, comprehensiveScore: 90.6, rankInCategory: 1, qualityLevel: "优质", totalSupplierCount: 4 },
  { id: "rk002", supplierId: "s002", supplierName: "成飞制造技术中心", categoryId: "cat001", categoryName: "铝合金钣金件", rankingYear: 2026, rankingMonth: 7, comprehensiveScore: 87.1, rankInCategory: 2, qualityLevel: "优质", totalSupplierCount: 4 },
  { id: "rk003", supplierId: "s003", supplierName: "西飞机械加工公司", categoryId: "cat001", categoryName: "铝合金钣金件", rankingYear: 2026, rankingMonth: 7, comprehensiveScore: 74.9, rankInCategory: 3, qualityLevel: "普通", totalSupplierCount: 4 },
  { id: "rk004", supplierId: "s005", supplierName: "哈飞制造有限公司", categoryId: "cat001", categoryName: "铝合金钣金件", rankingYear: 2026, rankingMonth: 7, comprehensiveScore: 64.6, rankInCategory: 4, qualityLevel: "普通", totalSupplierCount: 4 },
  { id: "rk005", supplierId: "s004", supplierName: "沈飞零件制造厂", categoryId: "cat002", categoryName: "钛合金机加工件", rankingYear: 2026, rankingMonth: 7, comprehensiveScore: 89.6, rankInCategory: 1, qualityLevel: "优质", totalSupplierCount: 2 },
  { id: "rk006", supplierId: "s005", supplierName: "哈飞制造有限公司", categoryId: "cat002", categoryName: "钛合金机加工件", rankingYear: 2026, rankingMonth: 7, comprehensiveScore: 64.6, rankInCategory: 2, qualityLevel: "普通", totalSupplierCount: 2 },
  { id: "rk007", supplierId: "s007", supplierName: "天津航空复材公司", categoryId: "cat003", categoryName: "复合材料蒙皮", rankingYear: 2026, rankingMonth: 7, comprehensiveScore: 93.8, rankInCategory: 1, qualityLevel: "优质", totalSupplierCount: 2 },
  { id: "rk008", supplierId: "s008", supplierName: "北京复合材料研究院", categoryId: "cat003", categoryName: "复合材料蒙皮", rankingYear: 2026, rankingMonth: 7, comprehensiveScore: 90.1, rankInCategory: 2, qualityLevel: "优质", totalSupplierCount: 2 },
]

export const CATEGORY_MASTERS: CategoryMasterVO[] = [
  { id: "cat001", categoryName: "铝合金钣金件", materialType: "铝合金", lengthMin: 0, lengthMax: 500, widthMin: 0, widthMax: 300, sizeLogic: "AND", partType: "小型" },
  { id: "cat002", categoryName: "钛合金机加工件", materialType: "钛合金", lengthMin: 100, lengthMax: 600, widthMin: 50, widthMax: 200, sizeLogic: "AND", partType: "中型" },
  { id: "cat003", categoryName: "复合材料蒙皮", materialType: "碳纤维复合材料", lengthMin: 300, lengthMax: 2000, widthMin: 200, widthMax: 1000, sizeLogic: "OR", partType: "大型" },
  { id: "cat004", categoryName: "标准紧固件", materialType: "钢", lengthMin: 0, lengthMax: 50, widthMin: 0, widthMax: 20, sizeLogic: "AND", partType: "其他" },
  { id: "cat005", categoryName: "橡胶密封件", materialType: "橡胶", lengthMin: 0, lengthMax: 100, widthMin: 0, widthMax: 100, sizeLogic: "AND", partType: "其他" },
]

export const CATEGORY_CONFIGS: CategoryConfigVO[] = [
  { id: "cfg001", categoryId: "cat003", categoryName: "复合材料蒙皮", specialType: "COMPOSITE", recommendRule: "ALL_SUPPLIERS", ignoreQuality: 0 },
  { id: "cfg002", categoryId: "cat002", categoryName: "钛合金机加工件", specialType: "REINFORCEMENT", recommendRule: "ROUND_ROBIN", ignoreQuality: 1 },
]

export const RIGHT_RULES: RightRuleVO[] = [
  { id: "rr001", aircraftModel: "ARJ21", leftSuffix: "L", rightSuffix: "R" },
  { id: "rr002", aircraftModel: "C919", leftSuffix: "-L", rightSuffix: "-R" },
  { id: "rr003", aircraftModel: "CR929", leftSuffix: "LH", rightSuffix: "RH" },
  { id: "rr004", aircraftModel: "MA700", leftSuffix: "_L", rightSuffix: "_R" },
]

export const RIGHT_MANUALS: RightManualVO[] = [
  { id: "rm001", leftPartDrawingNo: "ARJ21-DOOR-005A", rightPartDrawingNo: "ARJ21-DOOR-005B" },
  { id: "rm002", leftPartDrawingNo: "C919-WING-EDGE-03X", rightPartDrawingNo: "C919-WING-EDGE-03Y" },
  { id: "rm003", leftPartDrawingNo: "ARJ21-FLAP-001", rightPartDrawingNo: "ARJ21-FLAP-002" },
]

export const TYPE_CONFIGS: TypePackageConfigVO[] = [
  { id: "tc001", partType: "小型", typeLabel: "小型零件", maxPartCount: 20 },
  { id: "tc002", partType: "中型", typeLabel: "中型零件", maxPartCount: 10 },
  { id: "tc003", partType: "大型", typeLabel: "大型零件", maxPartCount: 5 },
  { id: "tc004", partType: "超大型", typeLabel: "超大型零件", maxPartCount: 2 },
  { id: "tc005", partType: "其他", typeLabel: "其他零件", maxPartCount: 8 },
]

export const OPERATION_LOGS: OperationLogVO[] = [
  { id: "ol001", operator: "张三", operatorIp: "192.168.1.101", operationType: "导入Excel", targetModule: "分包中心", targetObject: "SUB-20260814-001", result: "成功", operateTime: "2026-08-14 09:32:15", remark: "导入145条零件记录" },
  { id: "ol002", operator: "张三", operatorIp: "192.168.1.101", operationType: "生成工作包", targetModule: "批次工作台", targetObject: "SUB-20260810-002", result: "成功", operateTime: "2026-08-10 11:05:42", remark: "生成5个工作包" },
  { id: "ol003", operator: "王五", operatorIp: "192.168.1.105", operationType: "Fetch抓取", targetModule: "分包中心", targetObject: "FLOW-10293", result: "失败", operateTime: "2026-08-09 17:42:29", remark: "连接全流程系统超时" },
  { id: "ol004", operator: "李四", operatorIp: "192.168.1.102", operationType: "生成推荐", targetModule: "批次工作台", targetObject: "SUB-20260810-002", result: "成功", operateTime: "2026-08-10 14:30:00", remark: "生成13条推荐结果" },
  { id: "ol005", operator: "赵六", operatorIp: "192.168.1.108", operationType: "导出Excel", targetModule: "批次工作台", targetObject: "SUB-20260728-002", result: "成功", operateTime: "2026-07-30 16:20:00", remark: "批次置为COMPLETED" },
  { id: "ol006", operator: "Admin", operatorIp: "10.0.0.1", operationType: "上传绩效", targetModule: "供应商绩效", targetObject: "2026-07", result: "成功", operateTime: "2026-08-05 09:00:00", remark: "成功6条，失败0条" },
  { id: "ol007", operator: "Admin", operatorIp: "10.0.0.1", operationType: "新增供应商", targetModule: "供应商中心", targetObject: "天津航空复材公司", result: "成功", operateTime: "2026-08-01 10:15:00", remark: "" },
  { id: "ol008", operator: "Admin", operatorIp: "10.0.0.1", operationType: "停用供应商", targetModule: "供应商中心", targetObject: "昌飞航空工业集团", result: "成功", operateTime: "2026-07-28 14:00:00", remark: "绩效不达标" },
]

export const SYSTEM_LOGS: OperationLogVO[] = [
  { id: "sl001", operator: "张三", operatorIp: "192.168.1.101", operationType: "用户登录", targetModule: "认证模块", targetObject: "张三", result: "成功", operateTime: "2026-08-14 09:30:12", remark: "OAuth2 Bearer Token" },
  { id: "sl002", operator: "Admin", operatorIp: "10.0.0.1", operationType: "权限变更", targetModule: "RBAC", targetObject: "李四", result: "成功", operateTime: "2026-08-14 09:00:00", remark: "赋予分包中心编辑权限" },
  { id: "sl003", operator: "李四", operatorIp: "192.168.1.102", operationType: "用户登录", targetModule: "认证模块", targetObject: "李四", result: "成功", operateTime: "2026-08-13 08:45:00", remark: "" },
  { id: "sl004", operator: "王五", operatorIp: "192.168.1.105", operationType: "Token刷新", targetModule: "认证模块", targetObject: "王五", result: "失败", operateTime: "2026-08-12 17:30:00", remark: "Token已过期，需重新登录" },
  { id: "sl005", operator: "Admin", operatorIp: "10.0.0.1", operationType: "系统配置变更", targetModule: "系统设置", targetObject: "工作包容量配置", result: "成功", operateTime: "2026-08-10 09:00:00", remark: "小型零件最大数从15改为20" },
]
