# Changelog · dsh-plugin-flower-cockpit

## [迁移] - 2026-10-09

### CJS → ESM 迁移（代做）
- **时间戳**：2026-10-09T21:57
- **最后变动人**：session-b250bf9d
- **授权**：AUTH-20261009-dea67d017d9f（所有者原话：「4 个 cjs 插件做迁移，这次你代做。」）
- **通道**：plugin:dsh-plugin-flower-cockpit
- **变更**：① tsconfig 的 `module` CommonJS→es2022；package.json 加 `"type": "module"`  ② ★ **实质修复**：`lib/adapt.js` 由 CJS 转 ESM（`require`→`import`、`module.exports`→`export`、用 `createRequire(import.meta.url)` 保留探测能力）；`src/index.ts` 的 `require('../lib/adapt.js')` → `import * as adapt from '../lib/adapt.js'` —— **原写法在 `type:module` 下会抛 `require is not defined`**
- **验证**：tsc 重编译后 `lib/index.js` 为纯 ESM（`export` 语句、`exports.`/`require` 归零）；`node -e "import('./lib/index.js')"` 实测通过（`name`/`apply` 正常）；`lib/client.js` 未改动（仍为宿主 `__ModuleLoader__.load` 格式）。
- **回滚**：`git -C ~/dsh-plugin-flower-cockpit checkout 8805d1e -- .`，或回填 `/tmp/fc-adapt-before.js` + `/tmp/fc-index-before.ts`

## [0.1.0] - 2026-08-27

### 首版登记（版本管理补全）
- 定位：花店驾驶舱（waimai 数据源+周报+促销+8卡）
- 说明：本插件此前未做版本管理，本次补全 CHANGELOG + git 初始化。

## 0.2.0 (2026-08-27)

- 插件化标准对齐：dsh 版本自适应（adapt.js startAdaptGuard）
- 统一文件日志（~/.dsh/flower-cockpit.log，CLD stdout 不可见兜底）
- host ws.register 路由修复（flower-cockpit API 生效）
