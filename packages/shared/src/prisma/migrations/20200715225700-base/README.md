# Migration `20200715225700-base`

This migration has been generated by Errorname at 7/15/2020, 10:57:00 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
PRAGMA foreign_keys=OFF;

CREATE TABLE "Tenant" (
"name" TEXT NOT NULL,
"url" TEXT NOT NULL,
    PRIMARY KEY ("name"))

PRAGMA foreign_key_check;

PRAGMA foreign_keys=ON;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration ..20200715225700-base
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,15 @@
+datasource management {
+  provider = ["sqlite","mysql","postgresql"]
+  url = "***"
+}
+
+generator client {
+  provider      = "prisma-client-js"
+  output        = env("PMT_OUTPUT")
+  binaryTargets = ["native"]
+}
+
+model Tenant {
+  name     String @id
+  url      String
+}
```


