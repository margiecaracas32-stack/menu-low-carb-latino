import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("el piloto ofrece únicamente el plan mensual certificado", async () => {
  const source = await readFile(new URL("../app/paywall/page.tsx", import.meta.url), "utf8");

  assert.match(source, /const PILOT_MONTHLY_ONLY = true/);
  assert.match(source, /useState<Plan>\("monthly"\)/);
  assert.match(source, /!PILOT_MONTHLY_ONLY && <button[^>]+aria-checked=\{plan === "annual"\}/);
  assert.match(source, /PLAN CERTIFICADO PARA EL PILOTO/);
  assert.match(source, /Después de la prueba: US\$6\.99 al mes/);
});
