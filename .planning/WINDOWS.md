---
schema_version: 1
open_count: 1
waived_count: 0
fixed_count: 0
total_count: 1
last_updated: 2026-08-12T13:44:28.924Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 03 | deviation | sanity/schemaTypes/service.ts |  | Wave 1 tracer omitted the plugin-required 'language' field on doc-i18n types; corrected in 03-02 for all five types | open |  | 2026-08-12T13:44:28.924Z |  |

````json
[
  {
    "id": 1,
    "kind": "deviation",
    "phase": "03",
    "file": "sanity/schemaTypes/service.ts",
    "line": null,
    "description": "Wave 1 tracer omitted the plugin-required 'language' field on doc-i18n types; corrected in 03-02 for all five types",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-12T13:44:28.924Z",
    "resolved_at": null
  }
]
````
