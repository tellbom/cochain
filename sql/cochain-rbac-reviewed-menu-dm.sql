-- Reviewed Figma menu projection for DM8.
-- ASCII-only by design: UNISTR avoids DIsql client code-page corruption.

UPDATE "rbac_rule"
SET "extend" = 'add_rules_only', "updated_at" = CURRENT_TIMESTAMP
WHERE "project" = 'cochain'
  AND "type" = 'Menu'
  AND "rule_code" NOT IN (
      'subcontract/batch', 'supplier/supplier', 'supplier/category',
      'supplier/performance', 'part/category-master', 'operation/log',
      'auth', 'auth/apiMap', 'auth/projectGrant', 'auth/rule', 'auth/admin', 'auth/group'
  );

UPDATE "rbac_rule"
SET "parent_rule_code" = NULL, "title" = UNISTR('\5206\5305\4E2D\5FC3'), "extend" = 'none', "weigh" = 10, "updated_at" = CURRENT_TIMESTAMP
WHERE "project" = 'cochain' AND "rule_code" = 'subcontract/batch';

UPDATE "rbac_rule"
SET "parent_rule_code" = NULL, "title" = UNISTR('\4F9B\5E94\5546\4E2D\5FC3'), "extend" = 'none', "weigh" = 20, "updated_at" = CURRENT_TIMESTAMP
WHERE "project" = 'cochain' AND "rule_code" = 'supplier/supplier';

UPDATE "rbac_rule"
SET "parent_rule_code" = NULL, "title" = UNISTR('\54C1\7C7B\4F9B\65B9\5927\76D8'), "extend" = 'none', "weigh" = 30, "updated_at" = CURRENT_TIMESTAMP
WHERE "project" = 'cochain' AND "rule_code" = 'supplier/category';

UPDATE "rbac_rule"
SET "parent_rule_code" = NULL, "title" = UNISTR('\4F9B\5E94\5546\7EE9\6548\4E0E\6392\540D'), "extend" = 'none', "weigh" = 40, "updated_at" = CURRENT_TIMESTAMP
WHERE "project" = 'cochain' AND "rule_code" = 'supplier/performance';

UPDATE "rbac_rule"
SET "parent_rule_code" = NULL, "title" = UNISTR('\89C4\5219\914D\7F6E'), "extend" = 'none', "weigh" = 50, "updated_at" = CURRENT_TIMESTAMP
WHERE "project" = 'cochain' AND "rule_code" = 'part/category-master';

UPDATE "rbac_rule"
SET "parent_rule_code" = NULL, "title" = UNISTR('\65E5\5FD7\8BB0\5F55'), "extend" = 'none', "weigh" = 60, "updated_at" = CURRENT_TIMESTAMP
WHERE "project" = 'cochain' AND "rule_code" = 'operation/log';

UPDATE "rbac_rule"
SET "parent_rule_code" = NULL, "title" = UNISTR('\6743\9650\4E2D\5FC3'), "extend" = 'none', "weigh" = 70, "updated_at" = CURRENT_TIMESTAMP
WHERE "project" = 'cochain' AND "rule_code" = 'auth';

UPDATE "rbac_rule"
SET "parent_rule_code" = 'auth', "title" = UNISTR('\63A5\53E3\6743\9650\6620\5C04'), "extend" = 'none', "weigh" = 10, "updated_at" = CURRENT_TIMESTAMP
WHERE "project" = 'cochain' AND "rule_code" = 'auth/apiMap';

UPDATE "rbac_rule"
SET "parent_rule_code" = 'auth', "title" = UNISTR('\9879\76EE\6388\6743'), "extend" = 'none', "weigh" = 20, "updated_at" = CURRENT_TIMESTAMP
WHERE "project" = 'cochain' AND "rule_code" = 'auth/projectGrant';

UPDATE "rbac_rule"
SET "parent_rule_code" = 'auth', "title" = UNISTR('\83DC\5355\89C4\5219'), "extend" = 'none', "weigh" = 30, "updated_at" = CURRENT_TIMESTAMP
WHERE "project" = 'cochain' AND "rule_code" = 'auth/rule';

UPDATE "rbac_rule"
SET "parent_rule_code" = 'auth', "title" = UNISTR('\7BA1\7406\5458'), "extend" = 'none', "weigh" = 40, "updated_at" = CURRENT_TIMESTAMP
WHERE "project" = 'cochain' AND "rule_code" = 'auth/admin';

UPDATE "rbac_rule"
SET "parent_rule_code" = 'auth', "title" = UNISTR('\6743\9650\7EC4'), "extend" = 'none', "weigh" = 50, "updated_at" = CURRENT_TIMESTAMP
WHERE "project" = 'cochain' AND "rule_code" = 'auth/group';

UPDATE "rbac_rule"
SET "extend" = 'add_rules_only', "updated_at" = CURRENT_TIMESTAMP
WHERE "project" = 'cochain'
  AND "rule_code" IN (
      'part/batch-part', 'work/package', 'package/part', 'package/supplier-recommendation',
      'supplier/ranking-snapshot', 'round/robin-cursor', 'part/history-supplier',
      'special/category-config', 'left/right-rule', 'left/right-manual',
      'part/type-package-config', 'system/operate-log'
  );

COMMIT;

SELECT "rule_code", "parent_rule_code", "title", "extend", "weigh"
FROM "rbac_rule"
WHERE "project" = 'cochain'
  AND "type" = 'Menu'
  AND "extend" = 'none'
ORDER BY "weigh" ASC;

SELECT COUNT(*) AS "visible_menu_node_count"
FROM "rbac_rule"
WHERE "project" = 'cochain'
  AND "type" IN ('Menu', 'MenuDir')
  AND "extend" = 'none';
