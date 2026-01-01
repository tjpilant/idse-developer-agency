# Source: https://puckeditor.com/docs/integrating-puck/data-migration

Integrating Puck — Data Migration

# Data Migration

## Version migrating

Puck follows semantic versioning. Major releases may introduce breaking changes for your Data payload.

Puck provides the `migrate` helper method to help migrate legacy data payloads to the latest data model, transforming any deprecated properties to their latest counterparts as described by the Data API reference.

Copy

```
import { migrate } from "@measured/puck";

migrate(legacyData);
```

