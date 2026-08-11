-- Cochain RBAC bootstrap for Dameng DM8.
-- Copied and adapted from:
--   E:\router\router\sql\rbac-bootstrap-dm.sql
-- The shared source template remains unchanged.
-- Project: cochain
-- Bootstrap user: 196045
-- This script never creates or grants the reserved __global__ project.
-- Run only after reviewing docs/rbac-permission-matrix.md.

CREATE TABLE IF NOT EXISTS "rbac_bootstrap_config" (
    "userid"  VARCHAR2(128) NOT NULL,
    "project" VARCHAR2(64) NOT NULL
);

DELETE FROM "rbac_bootstrap_config";
INSERT INTO "rbac_bootstrap_config" ("userid", "project") VALUES ('196045', 'cochain');

-- Preflight snapshot. Expected before first execution: all cochain counts are zero.
SELECT 'project_grant' AS "table_name", COUNT(*) AS "row_count" FROM "rbac_project_grant" WHERE "project" = 'cochain'
UNION ALL SELECT 'group', COUNT(*) FROM "rbac_group" WHERE "project" = 'cochain'
UNION ALL SELECT 'group_member', COUNT(*) FROM "rbac_group_member" WHERE "project" = 'cochain'
UNION ALL SELECT 'rule', COUNT(*) FROM "rbac_rule" WHERE "project" = 'cochain'
UNION ALL SELECT 'api_map', COUNT(*) FROM "rbac_api_permission_map" WHERE "project" = 'cochain';

MERGE INTO "rbac_administrator" t
USING (
    SELECT LOWER(REGEXP_REPLACE(GUID(), '([0-9A-F]{8})([0-9A-F]{4})([0-9A-F]{4})([0-9A-F]{4})([0-9A-F]{12})', '\1-\2-\3-\4-\5')) AS "id",
           "userid", 'Cochain Bootstrap Admin' AS "username", 'Active' AS "status"
    FROM "rbac_bootstrap_config"
) s
ON (t."userid" = s."userid")
WHEN NOT MATCHED THEN
    INSERT ("id", "userid", "username", "status", "created_at", "updated_at")
    VALUES (s."id", s."userid", s."username", s."status", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

MERGE INTO "rbac_project_grant" t
USING (
    SELECT LOWER(REGEXP_REPLACE(GUID(), '([0-9A-F]{8})([0-9A-F]{4})([0-9A-F]{4})([0-9A-F]{4})([0-9A-F]{12})', '\1-\2-\3-\4-\5')) AS "id",
           "userid", "project", 1 AS "is_super", 'bootstrap' AS "granted_by"
    FROM "rbac_bootstrap_config"
) s
ON (t."userid" = s."userid" AND t."project" = s."project")
WHEN MATCHED THEN UPDATE SET
    t."is_super" = 1,
    t."granted_by" = 'bootstrap',
    t."updated_at" = CURRENT_TIMESTAMP
WHEN NOT MATCHED THEN
    INSERT ("id", "userid", "project", "is_super", "granted_by", "granted_at", "updated_at")
    VALUES (s."id", s."userid", s."project", 1, s."granted_by", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

MERGE INTO "rbac_group" t
USING (
    SELECT LOWER(REGEXP_REPLACE(GUID(), '([0-9A-F]{8})([0-9A-F]{4})([0-9A-F]{4})([0-9A-F]{4})([0-9A-F]{12})', '\1-\2-\3-\4-\5')) AS "id",
           'system_admin' AS "group_code", "project", 'Cochain System Admin (Bootstrap)' AS "group_name",
           '[]' AS "rule_codes", '[]' AS "permission_codes", 'Active' AS "status"
    FROM "rbac_bootstrap_config"
) s
ON (t."group_code" = s."group_code" AND t."project" = s."project")
WHEN MATCHED THEN UPDATE SET
    t."group_name" = s."group_name", t."status" = 'Active', t."updated_at" = CURRENT_TIMESTAMP
WHEN NOT MATCHED THEN
    INSERT ("id", "group_code", "project", "group_name", "parent_group_code", "rule_codes", "permission_codes", "status", "created_at", "updated_at")
    VALUES (s."id", s."group_code", s."project", s."group_name", NULL, s."rule_codes", s."permission_codes", s."status", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

MERGE INTO "rbac_group_member" t
USING (
    SELECT LOWER(REGEXP_REPLACE(GUID(), '([0-9A-F]{8})([0-9A-F]{4})([0-9A-F]{4})([0-9A-F]{4})([0-9A-F]{12})', '\1-\2-\3-\4-\5')) AS "id",
           "userid", 'system_admin' AS "group_code", "project", 'bootstrap' AS "granted_by"
    FROM "rbac_bootstrap_config"
) s
ON (t."userid" = s."userid" AND t."group_code" = s."group_code" AND t."project" = s."project")
WHEN MATCHED THEN UPDATE SET t."granted_by" = 'bootstrap', t."updated_at" = CURRENT_TIMESTAMP
WHEN NOT MATCHED THEN
    INSERT ("id", "userid", "group_code", "project", "granted_by", "created_at", "updated_at")
    VALUES (s."id", s."userid", s."group_code", s."project", s."granted_by", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

MERGE INTO "rbac_rule" t
USING (
    SELECT cfg."project", m."rule_code", m."permission_code", m."parent_rule_code", m."type", m."title",
           m."name", m."path", m."icon", m."menu_type", m."url", m."component", m."extend", m."remark",
           m."keepalive", m."weigh", m."status"
    FROM "rbac_bootstrap_config" cfg
    CROSS JOIN (
        -- Existing permission-center rules retained from the approved template.
        SELECT 'auth' AS "rule_code", 'menu:auth' AS "permission_code", CAST(NULL AS VARCHAR2(128)) AS "parent_rule_code", 'MenuDir' AS "type", 'Permission Management' AS "title", 'auth' AS "name", 'auth' AS "path", '' AS "icon", CAST(NULL AS VARCHAR2(16)) AS "menu_type", CAST(NULL AS VARCHAR2(512)) AS "url", CAST(NULL AS VARCHAR2(256)) AS "component", 'none' AS "extend", '' AS "remark", 0 AS "keepalive", 10 AS "weigh", 'Active' AS "status" FROM dual
        UNION ALL SELECT 'auth/apiMap','menu:auth/apiMap','auth','Menu','API Permission Map','auth/apiMap','auth/apiMap',NULL,'Tab',NULL,'/src/views/backend/auth/apiMap/index.vue',NULL,NULL,0,0,'Active' FROM dual
        UNION ALL SELECT 'auth/projectGrant','menu:auth/projectGrant','auth','Menu','Project Grants','auth/projectGrant','auth/projectGrant',NULL,'Tab',NULL,'/src/views/backend/auth/projectGrant/index.vue',NULL,NULL,0,0,'Active' FROM dual
        UNION ALL SELECT 'auth/rule','menu:auth/rule','auth','Menu','Menu Rules','auth/rule','auth/rule','','Tab',NULL,'/src/views/backend/auth/rule/index.vue','none','',0,97,'Active' FROM dual
        UNION ALL SELECT 'auth/admin','menu:auth/admin','auth','Menu','Administrators','auth/admin','auth/admin','','Tab',NULL,'/src/views/backend/auth/admin/index.vue','none','',0,98,'Active' FROM dual
        UNION ALL SELECT 'auth/group','menu:auth/group','auth','Menu','Permission Groups','auth/group','auth/group','','Tab',NULL,'/src/views/backend/auth/group/index.vue','none','',0,99,'Active' FROM dual
        UNION ALL SELECT 'auth/admin/add','button:auth/admin/add','auth/admin','Button','Add','auth/admin/add','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'auth/admin/del','button:auth/admin/del','auth/admin','Button','Delete','auth/admin/del','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'auth/admin/edit','button:auth/admin/edit','auth/admin','Button','Edit','auth/admin/edit','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'auth/admin/index','button:auth/admin/index','auth/admin','Button','View','auth/admin/index','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'auth/group/add','button:auth/group/add','auth/group','Button','Add','auth/group/add','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'auth/group/del','button:auth/group/del','auth/group','Button','Delete','auth/group/del','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'auth/group/edit','button:auth/group/edit','auth/group','Button','Edit','auth/group/edit','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'auth/group/index','button:auth/group/index','auth/group','Button','View','auth/group/index','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'auth/rule/add','button:auth/rule/add','auth/rule','Button','Add','auth/rule/add','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'auth/rule/del','button:auth/rule/del','auth/rule','Button','Delete','auth/rule/del','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'auth/rule/edit','button:auth/rule/edit','auth/rule','Button','Edit','auth/rule/edit','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'auth/rule/index','button:auth/rule/index','auth/rule','Button','View','auth/rule/index','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'auth/rule/sortable','button:auth/rule/sortable','auth/rule','Button','Sort','auth/rule/sortable','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual

        -- Four business menu directories.
        UNION ALL SELECT 'cochain/subcontract','menu:cochain/subcontract',NULL,'MenuDir','分包中心','cochain/subcontract','cochain/subcontract','',NULL,NULL,NULL,'none','',0,40,'Active' FROM dual
        UNION ALL SELECT 'cochain/supplier','menu:cochain/supplier',NULL,'MenuDir','供应商与绩效','cochain/supplier','cochain/supplier','',NULL,NULL,NULL,'none','',0,30,'Active' FROM dual
        UNION ALL SELECT 'cochain/master-data','menu:cochain/master-data',NULL,'MenuDir','规则与主数据','cochain/master-data','cochain/master-data','',NULL,NULL,NULL,'none','',0,20,'Active' FROM dual
        UNION ALL SELECT 'cochain/audit','menu:cochain/audit',NULL,'MenuDir','日志审计','cochain/audit','cochain/audit','',NULL,NULL,NULL,'none','',0,10,'Active' FROM dual

        -- Eighteen business pages. The page permission is the real :page permission.
        UNION ALL SELECT 'subcontract/batch','subcontract:batch:page','cochain/subcontract','Menu','分包批次管理','subcontract/batch','subcontract/batch','','Tab',NULL,'/src/views/backend/cochain/subcontract/batch/index.vue','none','',0,100,'Active' FROM dual
        UNION ALL SELECT 'part/batch-part','part:batch-part:page','cochain/subcontract','Menu','批次零件明细','part/batch-part','part/batch-part','','Tab',NULL,'/src/views/backend/cochain/part/batch-part/index.vue','none','',0,90,'Active' FROM dual
        UNION ALL SELECT 'work/package','work:package:page','cochain/subcontract','Menu','工作包管理','work/package','work/package','','Tab',NULL,'/src/views/backend/cochain/work/package/index.vue','none','',0,80,'Active' FROM dual
        UNION ALL SELECT 'package/part','package:part:page','cochain/subcontract','Menu','工作包零件关联','package/part','package/part','','Tab',NULL,'/src/views/backend/cochain/package/part/index.vue','none','',0,70,'Active' FROM dual
        UNION ALL SELECT 'package/supplier-recommendation','package:supplier-recommendation:page','cochain/subcontract','Menu','供应商推荐结果','package/supplier-recommendation','package/supplier-recommendation','','Tab',NULL,'/src/views/backend/cochain/package/supplier-recommendation/index.vue','none','',0,60,'Active' FROM dual
        UNION ALL SELECT 'supplier/supplier','supplier:supplier:page','cochain/supplier','Menu','供应商管理','supplier/supplier','supplier/supplier','','Tab',NULL,'/src/views/backend/cochain/supplier/supplier/index.vue','none','',0,100,'Active' FROM dual
        UNION ALL SELECT 'supplier/performance','supplier:performance:page','cochain/supplier','Menu','供应商绩效管理','supplier/performance','supplier/performance','','Tab',NULL,'/src/views/backend/cochain/supplier/performance/index.vue','none','',0,90,'Active' FROM dual
        UNION ALL SELECT 'supplier/ranking-snapshot','supplier:ranking-snapshot:page','cochain/supplier','Menu','排名快照管理','supplier/ranking-snapshot','supplier/ranking-snapshot','','Tab',NULL,'/src/views/backend/cochain/supplier/ranking-snapshot/index.vue','none','',0,80,'Active' FROM dual
        UNION ALL SELECT 'supplier/category','supplier:category:page','cochain/supplier','Menu','供应商品类关联','supplier/category','supplier/category','','Tab',NULL,'/src/views/backend/cochain/supplier/category/index.vue','none','',0,70,'Active' FROM dual
        UNION ALL SELECT 'round/robin-cursor','round:robin-cursor:page','cochain/supplier','Menu','轮流选取游标','round/robin-cursor','round/robin-cursor','','Tab',NULL,'/src/views/backend/cochain/round/robin-cursor/index.vue','none','',0,60,'Active' FROM dual
        UNION ALL SELECT 'part/history-supplier','part:history-supplier:page','cochain/supplier','Menu','零件历史供应商','part/history-supplier','part/history-supplier','','Tab',NULL,'/src/views/backend/cochain/part/history-supplier/index.vue','none','',0,50,'Active' FROM dual
        UNION ALL SELECT 'part/category-master','part:category-master:page','cochain/master-data','Menu','三级品类主数据','part/category-master','part/category-master','','Tab',NULL,'/src/views/backend/cochain/part/category-master/index.vue','none','',0,100,'Active' FROM dual
        UNION ALL SELECT 'special/category-config','special:category-config:page','cochain/master-data','Menu','特殊品类配置','special/category-config','special/category-config','','Tab',NULL,'/src/views/backend/cochain/special/category-config/index.vue','none','',0,90,'Active' FROM dual
        UNION ALL SELECT 'left/right-rule','left:right-rule:page','cochain/master-data','Menu','左右件识别规则','left/right-rule','left/right-rule','','Tab',NULL,'/src/views/backend/cochain/left/right-rule/index.vue','none','',0,80,'Active' FROM dual
        UNION ALL SELECT 'left/right-manual','left:right-manual:page','cochain/master-data','Menu','左右件手动维护','left/right-manual','left/right-manual','','Tab',NULL,'/src/views/backend/cochain/left/right-manual/index.vue','none','',0,70,'Active' FROM dual
        UNION ALL SELECT 'part/type-package-config','part:type-package-config:page','cochain/master-data','Menu','工作包容量配置','part/type-package-config','part/type-package-config','','Tab',NULL,'/src/views/backend/cochain/part/type-package-config/index.vue','none','',0,60,'Active' FROM dual
        UNION ALL SELECT 'operation/log','operation:log:page','cochain/audit','Menu','业务操作日志','operation/log','operation/log','','Tab',NULL,'/src/views/backend/cochain/operation/log/index.vue','none','',0,100,'Active' FROM dual
        UNION ALL SELECT 'system/operate-log','system:operate-log:page','cochain/audit','Menu','系统操作日志','system/operate-log','system/operate-log','','Tab',NULL,'/src/views/backend/cochain/system/operate-log/index.vue','none','',0,90,'Active' FROM dual

        -- Page action rules. No undocumented import/export/edit actions are granted.
        UNION ALL SELECT 'subcontract/batch/query','subcontract:batch:query','subcontract/batch','Button','查看','subcontract/batch/query','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'subcontract/batch/save','subcontract:batch:save','subcontract/batch','Button','新建','subcontract/batch/save','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'subcontract/batch/update','subcontract:batch:update','subcontract/batch','Button','编辑','subcontract/batch/update','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'subcontract/batch/delete','subcontract:batch:delete','subcontract/batch','Button','删除','subcontract/batch/delete','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'subcontract/batch/upload','subcontract:batch:upload','subcontract/batch','Button','上传分包数据','subcontract/batch/upload','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'subcontract/batch/fetch','subcontract:batch:fetch','subcontract/batch','Button','抓取数据','subcontract/batch/fetch','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'subcontract/batch/package','subcontract:batch:package','subcontract/batch','Button','执行分包','subcontract/batch/package','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'subcontract/batch/recommend','subcontract:batch:recommend','subcontract/batch','Button','执行推荐','subcontract/batch/recommend','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'subcontract/batch/run','subcontract:batch:run','subcontract/batch','Button','一键编排','subcontract/batch/run','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'subcontract/batch/export-result','subcontract:batch:export-result','subcontract/batch','Button','导出结果','subcontract/batch/export-result','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'part/batch-part/query','part:batch-part:query','part/batch-part','Button','查看','part/batch-part/query','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'work/package/query','work:package:query','work/package','Button','查看','work/package/query','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'package/part/query','package:part:query','package/part','Button','查看','package/part/query','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'package/supplier-recommendation/query','package:supplier-recommendation:query','package/supplier-recommendation','Button','查看','package/supplier-recommendation/query','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'supplier/supplier/query','supplier:supplier:query','supplier/supplier','Button','查看','supplier/supplier/query','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'supplier/supplier/save','supplier:supplier:save','supplier/supplier','Button','新建','supplier/supplier/save','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'supplier/supplier/update','supplier:supplier:update','supplier/supplier','Button','编辑或启停','supplier/supplier/update','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'supplier/supplier/delete','supplier:supplier:delete','supplier/supplier','Button','删除','supplier/supplier/delete','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'supplier/performance/query','supplier:performance:query','supplier/performance','Button','查看','supplier/performance/query','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'supplier/performance/upload','supplier:performance:upload','supplier/performance','Button','上传绩效','supplier/performance/upload','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'supplier/ranking-snapshot/query','supplier:ranking-snapshot:query','supplier/ranking-snapshot','Button','查看','supplier/ranking-snapshot/query','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'supplier/ranking-snapshot/generate','supplier:ranking-snapshot:generate','supplier/ranking-snapshot','Button','生成快照','supplier/ranking-snapshot/generate','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'supplier/category/query','supplier:category:query','supplier/category','Button','查看','supplier/category/query','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'supplier/category/save','supplier:category:save','supplier/category','Button','建立关联','supplier/category/save','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'supplier/category/delete','supplier:category:delete','supplier/category','Button','解除关联','supplier/category/delete','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'round/robin-cursor/query','round:robin-cursor:query','round/robin-cursor','Button','查看','round/robin-cursor/query','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'part/history-supplier/query','part:history-supplier:query','part/history-supplier','Button','查看','part/history-supplier/query','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'part/category-master/query','part:category-master:query','part/category-master','Button','查看','part/category-master/query','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'part/category-master/save','part:category-master:save','part/category-master','Button','新建','part/category-master/save','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'part/category-master/update','part:category-master:update','part/category-master','Button','编辑','part/category-master/update','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'part/category-master/delete','part:category-master:delete','part/category-master','Button','删除','part/category-master/delete','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'special/category-config/query','special:category-config:query','special/category-config','Button','查看','special/category-config/query','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'special/category-config/save','special:category-config:save','special/category-config','Button','新建','special/category-config/save','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'special/category-config/update','special:category-config:update','special/category-config','Button','编辑','special/category-config/update','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'special/category-config/delete','special:category-config:delete','special/category-config','Button','删除','special/category-config/delete','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'left/right-rule/query','left:right-rule:query','left/right-rule','Button','查看','left/right-rule/query','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'left/right-rule/save','left:right-rule:save','left/right-rule','Button','新建','left/right-rule/save','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'left/right-rule/update','left:right-rule:update','left/right-rule','Button','编辑','left/right-rule/update','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'left/right-rule/delete','left:right-rule:delete','left/right-rule','Button','删除','left/right-rule/delete','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'left/right-manual/query','left:right-manual:query','left/right-manual','Button','查看','left/right-manual/query','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'left/right-manual/save','left:right-manual:save','left/right-manual','Button','新建','left/right-manual/save','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'left/right-manual/update','left:right-manual:update','left/right-manual','Button','编辑','left/right-manual/update','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'left/right-manual/delete','left:right-manual:delete','left/right-manual','Button','删除','left/right-manual/delete','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'part/type-package-config/query','part:type-package-config:query','part/type-package-config','Button','查看','part/type-package-config/query','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'part/type-package-config/update','part:type-package-config:update','part/type-package-config','Button','修改容量','part/type-package-config/update','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'operation/log/query','operation:log:query','operation/log','Button','查看','operation/log/query','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
        UNION ALL SELECT 'system/operate-log/query','system:operate-log:query','system/operate-log','Button','查看','system/operate-log/query','', '',NULL,NULL,NULL,NULL,'',0,0,'Active' FROM dual
    ) m
) s
ON (t."rule_code" = s."rule_code" AND t."project" = s."project")
WHEN MATCHED THEN UPDATE SET
    t."permission_code" = s."permission_code", t."parent_rule_code" = s."parent_rule_code", t."type" = s."type",
    t."title" = s."title", t."name" = s."name", t."path" = s."path", t."icon" = s."icon",
    t."menu_type" = s."menu_type", t."url" = s."url", t."component" = s."component", t."extend" = s."extend",
    t."remark" = s."remark", t."keepalive" = s."keepalive", t."weigh" = s."weigh", t."status" = s."status",
    t."updated_at" = CURRENT_TIMESTAMP
WHEN NOT MATCHED THEN
    INSERT ("id", "project", "rule_code", "permission_code", "parent_rule_code", "type", "title", "name", "path",
            "icon", "menu_type", "url", "component", "extend", "remark", "keepalive", "weigh", "status", "created_at", "updated_at")
    VALUES (LOWER(REGEXP_REPLACE(GUID(), '([0-9A-F]{8})([0-9A-F]{4})([0-9A-F]{4})([0-9A-F]{4})([0-9A-F]{12})', '\1-\2-\3-\4-\5')),
            s."project", s."rule_code", s."permission_code", s."parent_rule_code", s."type", s."title", s."name", s."path",
            s."icon", s."menu_type", s."url", s."component", s."extend", s."remark", s."keepalive", s."weigh", s."status",
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Only RBAC management routes belong here. Business APIs are enforced by their own service.
MERGE INTO "rbac_api_permission_map" t
USING (
    SELECT cfg."project", m."http_method", m."route_pattern", m."permission_code", m."action"
    FROM "rbac_bootstrap_config" cfg
    CROSS JOIN (
        SELECT 'GET' AS "http_method", '/api/admin/index' AS "route_pattern", 'menu:admin.index' AS "permission_code", 'access' AS "action" FROM dual
        UNION ALL SELECT 'GET','/api/admin/list','menu:admin.list','read' FROM dual
        UNION ALL SELECT 'POST','/api/admin','button:admin.create','create' FROM dual
        UNION ALL SELECT 'PUT','/api/admin/{userid}','button:admin.edit','update' FROM dual
        UNION ALL SELECT 'PUT','/api/admin/{userid}/status','button:admin.status','update' FROM dual
        UNION ALL SELECT 'PUT','/api/admin/{userid}/username','button:admin.username','update' FROM dual
        UNION ALL SELECT 'DELETE','/api/admin/{userid}','button:admin.delete','delete' FROM dual
        UNION ALL SELECT 'GET','/api/group/list','menu:group.list','read' FROM dual
        UNION ALL SELECT 'POST','/api/group','button:group.create','create' FROM dual
        UNION ALL SELECT 'PUT','/api/group/{groupCode}','button:group.edit','update' FROM dual
        UNION ALL SELECT 'PUT','/api/group/{groupCode}/rules','button:group.rules','update' FROM dual
        UNION ALL SELECT 'PUT','/api/group/{groupCode}/status','button:group.status','update' FROM dual
        UNION ALL SELECT 'POST','/api/group/{groupCode}/members','button:group.member.add','create' FROM dual
        UNION ALL SELECT 'DELETE','/api/group/{groupCode}/members/{userid}','button:group.member.del','delete' FROM dual
        UNION ALL SELECT 'DELETE','/api/group/{groupCode}','button:group.delete','delete' FROM dual
        UNION ALL SELECT 'GET','/api/group/index','auth.group','read' FROM dual
        UNION ALL SELECT 'GET','/api/rule/tree','menu:rule.tree','read' FROM dual
        UNION ALL SELECT 'GET','/api/rule/list','menu:rule.list','read' FROM dual
        UNION ALL SELECT 'POST','/api/rule','button:rule.create','create' FROM dual
        UNION ALL SELECT 'PUT','/api/rule/{ruleCode}','button:rule.edit','update' FROM dual
        UNION ALL SELECT 'PUT','/api/rule/{ruleCode}/status','button:rule.status','update' FROM dual
        UNION ALL SELECT 'PUT','/api/rule/{ruleCode}/weigh','button:rule.weigh','update' FROM dual
        UNION ALL SELECT 'DELETE','/api/rule/{ruleCode}','button:rule.delete','delete' FROM dual
        UNION ALL SELECT 'GET','/api/api-map/list','menu:apimap.list','read' FROM dual
        UNION ALL SELECT 'GET','/api/api-map/records','menu:apimap.list','read' FROM dual
        UNION ALL SELECT 'POST','/api/api-map','button:apimap.create','create' FROM dual
        UNION ALL SELECT 'PUT','/api/api-map/{id}','button:apimap.edit','update' FROM dual
        UNION ALL SELECT 'DELETE','/api/api-map/{id}','button:apimap.delete','delete' FROM dual
        UNION ALL SELECT 'POST','/api/project-grant','button:grant.create','create' FROM dual
        UNION ALL SELECT 'DELETE','/api/project-grant/{userid}','button:grant.delete','delete' FROM dual
        UNION ALL SELECT 'PUT','/api/project-grant/{userid}/super','button:grant.super','update' FROM dual
        UNION ALL SELECT 'GET','/api/search/audit-logs','menu:search.audit','read' FROM dual
        UNION ALL SELECT 'GET','/api/search/permission-view','menu:search.permission','read' FROM dual
    ) m
) s
ON (t."project" = s."project" AND t."http_method" = s."http_method" AND t."route_pattern" = s."route_pattern")
WHEN MATCHED THEN UPDATE SET
    t."permission_code" = s."permission_code", t."action" = s."action", t."status" = 'Active', t."updated_at" = CURRENT_TIMESTAMP
WHEN NOT MATCHED THEN
    INSERT ("id", "project", "http_method", "route_pattern", "permission_code", "action", "status", "created_at", "updated_at")
    VALUES (LOWER(REGEXP_REPLACE(GUID(), '([0-9A-F]{8})([0-9A-F]{4})([0-9A-F]{4})([0-9A-F]{4})([0-9A-F]{12})', '\1-\2-\3-\4-\5')),
            s."project", s."http_method", s."route_pattern", s."permission_code", s."action", 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

COMMIT;

-- Verification matrix: expected 1 grant, 1 group, 1 member, 88 rules, 33 RBAC API mappings.
SELECT 'administrator' AS "table_name", COUNT(*) AS "row_count" FROM "rbac_administrator" WHERE "userid" = '196045'
UNION ALL SELECT 'project_grant', COUNT(*) FROM "rbac_project_grant" WHERE "userid" = '196045' AND "project" = 'cochain' AND "is_super" = 1
UNION ALL SELECT 'group', COUNT(*) FROM "rbac_group" WHERE "group_code" = 'system_admin' AND "project" = 'cochain' AND "status" = 'Active'
UNION ALL SELECT 'group_member', COUNT(*) FROM "rbac_group_member" WHERE "userid" = '196045' AND "group_code" = 'system_admin' AND "project" = 'cochain'
UNION ALL SELECT 'rbac_rule', COUNT(*) FROM "rbac_rule" WHERE "project" = 'cochain' AND "status" = 'Active'
UNION ALL SELECT 'business_pages', COUNT(*) FROM "rbac_rule" WHERE "project" = 'cochain' AND "type" = 'Menu' AND "component" LIKE '/src/views/backend/cochain/%'
UNION ALL SELECT 'business_buttons', COUNT(*) FROM "rbac_rule" WHERE "project" = 'cochain' AND "type" = 'Button' AND "rule_code" NOT LIKE 'auth/%'
UNION ALL SELECT 'api_permission_map', COUNT(*) FROM "rbac_api_permission_map" WHERE "project" = 'cochain' AND "status" = 'Active'
UNION ALL SELECT 'business_api_map_must_be_zero', COUNT(*) FROM "rbac_api_permission_map" WHERE "project" = 'cochain' AND ("route_pattern" LIKE '/api/subcontract/%' OR "route_pattern" LIKE '/api/supplier/%' OR "route_pattern" LIKE '/api/part/%' OR "route_pattern" LIKE '/api/work/%' OR "route_pattern" LIKE '/api/package/%');

SELECT "rule_code", "permission_code", "parent_rule_code", "type", "component", "status"
FROM "rbac_rule" WHERE "project" = 'cochain' ORDER BY "weigh" DESC, "rule_code";

SELECT "http_method", "route_pattern", "permission_code", "action", "status"
FROM "rbac_api_permission_map" WHERE "project" = 'cochain' ORDER BY "route_pattern", "http_method";

DROP TABLE "rbac_bootstrap_config";
