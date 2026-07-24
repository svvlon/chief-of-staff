module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/lib/callAgent.ts [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/app/lib/callAgent.ts'\n\nExpected ',', got ':'");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/app/api/process/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$callAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/callAgent.ts [app-route] (ecmascript)");
;
async function POST(req) {
    try {
        const { transcript } = await req.json();
        const step1 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$callAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callAgent"])(process.env.CAPTURE_AGENT_NAME, process.env.CAPTURE_AGENT_VERSION, transcript);
        const step2 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$callAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callAgent"])(process.env.DISCOVERY_AGENT_NAME, process.env.DISCOVERY_AGENT_VERSION, step1);
        // No real KB yet — hardcode empty existing workflows for now
        const step3Input = JSON.stringify({
            workflow: step2,
            existingWorkflows: []
        });
        const step3 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$callAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callAgent"])(process.env.KM_AGENT_NAME, process.env.KM_AGENT_VERSION, step3Input);
        const step4 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$callAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callAgent"])(process.env.REPORT_AGENT_NAME, process.env.REPORT_AGENT_VERSION, step3);
        return Response.json({
            step1,
            step2,
            step3,
            report: step4
        });
    } catch (err) {
        console.error(err);
        return Response.json({
            error: err.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0qoeu71._.js.map