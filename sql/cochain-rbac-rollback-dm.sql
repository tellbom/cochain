-- Roll back only Cochain project-scoped RBAC seed data.
-- Review the pre-delete counts before removing anything.
-- The shared administrator row for userid 196045 is intentionally retained.

SELECT 'project_grant' AS "table_name", COUNT(*) AS "row_count" FROM "rbac_project_grant" WHERE "project" = 'cochain'
UNION ALL SELECT 'group', COUNT(*) FROM "rbac_group" WHERE "project" = 'cochain'
UNION ALL SELECT 'group_member', COUNT(*) FROM "rbac_group_member" WHERE "project" = 'cochain'
UNION ALL SELECT 'rule', COUNT(*) FROM "rbac_rule" WHERE "project" = 'cochain'
UNION ALL SELECT 'api_map', COUNT(*) FROM "rbac_api_permission_map" WHERE "project" = 'cochain';

DELETE FROM "rbac_api_permission_map" WHERE "project" = 'cochain';
DELETE FROM "rbac_group_member" WHERE "project" = 'cochain';
DELETE FROM "rbac_group" WHERE "project" = 'cochain';
DELETE FROM "rbac_rule" WHERE "project" = 'cochain';
DELETE FROM "rbac_project_grant" WHERE "project" = 'cochain';

COMMIT;

SELECT 'project_grant' AS "table_name", COUNT(*) AS "row_count" FROM "rbac_project_grant" WHERE "project" = 'cochain'
UNION ALL SELECT 'group', COUNT(*) FROM "rbac_group" WHERE "project" = 'cochain'
UNION ALL SELECT 'group_member', COUNT(*) FROM "rbac_group_member" WHERE "project" = 'cochain'
UNION ALL SELECT 'rule', COUNT(*) FROM "rbac_rule" WHERE "project" = 'cochain'
UNION ALL SELECT 'api_map', COUNT(*) FROM "rbac_api_permission_map" WHERE "project" = 'cochain';
