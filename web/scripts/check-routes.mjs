const base = process.env.BASE_URL || "http://localhost:3000";
const pages = ["/", "/about", "/design", "/app", "/app/roads", "/app/roads/analyze", "/app/roads/analyze?sample=s01", "/app/roads/reports", "/app/roads/reports/demo-001", "/app/roads/map", "/app/roads/rules", "/app/restrooms", "/app/restrooms/compare", "/app/restrooms/match", "/app/restrooms/rules", "/app/restrooms/checks/demo-rc-001", "/app/analytics", "/app/model", "/app/settings"];
const redirects = [["/app/analyze", "/app/roads/analyze"], ["/app/reports", "/app/roads/reports"], ["/app/reports/demo-001", "/app/roads/reports/demo-001"], ["/app/map", "/app/roads/map"], ["/app/rules", "/app/roads/rules"]];
const checks = [
  ...pages.map((route) => ({ route, status: 200 })),
  ...redirects.map(([route, location]) => ({ route, status: [307, 308], location })),
  { route: "/api/health?provider=mock", status: 200, health: true },
  { route: "/does-not-exist", status: 404 },
];
let failures = 0;
for (const check of checks) {
  const start = performance.now();
  try {
    const response = await fetch(new URL(check.route, base), { redirect: "manual", signal: AbortSignal.timeout(15000) });
    const statusOk = [check.status].flat().includes(response.status);
    const location = response.headers.get("location");
    const locationOk = !check.location || (location && new URL(location, base).pathname === check.location);
    const healthOk = !check.health || (response.ok && (await response.json()).ok === true);
    const ok = statusOk && locationOk && healthOk;
    if (!ok) failures++;
    console.log(`${ok ? "OK" : "FAIL"} ${response.status} ${check.route} ${Math.round(performance.now() - start)} ms${locationOk ? "" : ` (location: ${location})`}${healthOk ? "" : " (health is not ok)"}`);
  } catch (error) {
    failures++;
    console.log(`FAIL ${check.route}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
console.log(`${checks.length - failures}/${checks.length} checks passed`);
if (failures) process.exitCode = 1;
