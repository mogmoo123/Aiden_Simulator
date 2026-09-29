const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require(process.argv[2] || "playwright");

(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.argv[3] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const passed = [];
  try {
    await page.route(/^https?:/, (route) => route.abort());
    const epoch = new Date("2026-09-29T00:00:00Z");
    await page.clock.install({ time: epoch });
    await page.goto(pathToFileURL(path.join(__dirname, "..", "index.html")).href);
    await page.clock.pauseAt(new Date(epoch.getTime() + 10000));
    await page.evaluate(() => {
      window.testHits = [];
      window.testAttacks = [];
      const originalDamage = damageDummy;
      damageDummy = (dummy, amount, label, meta) => {
        testHits.push({ label, amount, time: nowSeconds() });
        originalDamage(dummy, amount, label, meta);
      };
      const originalBeginCast = beginCast;
      beginCast = (label, duration, complete, opts = {}) => {
        if (opts.skill === "A") testAttacks.push(nowSeconds());
        originalBeginCast(label, duration, complete, opts);
      };
      window.testScene = (dummyDistance = M) => {
        reset();
        state.attackMove = null;
        els.cameraLock.checked = true;
        els.cameraShakeMode.checked = false;
        els.voiceMode.checked = false;
        els.autoAttackAfterSkill.checked = false;
        els.cooldownResetMode.checked = false;
        els.rangePreview.checked = false;
        els.aSmartCastMode.checked = false;
        els.attackSpeed.value = "1.5";
        state.dummies = [{ id: 1, ...offsetPoint(state.aiden, { x: 1, y: 0 }, dummyDistance), hp: 100, maxHp: 100 }];
        testHits.length = 0;
        testAttacks.length = 0;
        render();
        applyCamera();
      };
      window.testScreenPoint = (point) => {
        const c = cameraParams();
        const p = toPx(point);
        const u = p.x - c.Ccx - c.W / 2;
        const v = (p.y - c.Ccy - c.H / 2) * c.zoom;
        const scale = c.P / (c.P - v * c.sin);
        return { x: c.rect.left + c.W / 2 + u * c.zoom * scale, y: c.rect.top + c.H / 2 + v * c.cos * scale };
      };
      testScene();
    });

    // Rebind through the actual settings UI, including keyboard autorepeat.
    await page.locator("#openKeybindsBtn").click();
    await page.locator('[data-action="CAMERA_LOCK"]').click();
    await page.keyboard.press("Space");
    await page.locator("#keybindModalClose").click();
    await page.keyboard.down("Space");
    assert.deepEqual(await page.evaluate(() => [els.cameraLock.checked, state.spaceHeld]), [false, false]);
    await page.keyboard.down("Space");
    assert.equal(await page.locator("#cameraLock").isChecked(), false);
    await page.keyboard.up("Space");
    await page.evaluate(() => {
      state.pointer = { x: 640, y: 400 };
      state.aiden.x += 1;
      updateCamera(0.016);
    });
    assert.equal(await page.evaluate(() => state.cam.x !== state.aiden.x), true);
    await page.keyboard.press("Space");
    await page.evaluate(() => updateCamera(0.016));
    assert.equal(await page.evaluate(() => els.cameraLock.checked && state.cam.x === state.aiden.x), true);
    passed.push("Space camera toggle, checkbox sync, autorepeat, actual camera follow");

    await page.evaluate(() => { assignKeybind("CAMERA_LOCK", "KeyY"); els.cameraLock.checked = false; });
    await page.keyboard.down("Space");
    assert.equal(await page.evaluate(() => state.spaceHeld), true);
    await page.keyboard.up("Space");
    assert.equal(await page.evaluate(() => state.spaceHeld), false);
    await page.evaluate(() => { testScene(); assignKeybind("Q", "Space"); els.rangePreview.checked = true; });
    await page.keyboard.down("Space");
    assert.equal(await page.evaluate(() => state.pendingSkill), "Q");
    await page.keyboard.up("Space");
    assert.equal(await page.evaluate(() => isCasting("Q") && !state.pendingSkill), true);
    await page.evaluate(() => assignKeybind("Q", "KeyQ"));
    passed.push("Unbound Space hold fallback; Space-bound skill keydown/keyup");

    for (const cooldownReset of [false, true]) {
      await page.evaluate((on) => { testScene(); els.cooldownResetMode.checked = on; }, cooldownReset);
      const target = await page.evaluate(() => testScreenPoint(state.dummies[0]));
      await page.mouse.move(target.x, target.y);
      await page.mouse.down({ button: "right" });
      await page.clock.runFor(2200);
      await page.mouse.up({ button: "right" });
      const attacks = await page.evaluate(() => [...testAttacks]);
      assert.ok(attacks.length >= 3, `held right-click repeats: ${attacks.length}`);
      for (let i = 1; i < attacks.length; i++) assert.ok(attacks[i] - attacks[i - 1] >= 1 / 1.5 - 1e-6);
      await page.clock.runFor(800);
      assert.equal(await page.evaluate(() => testAttacks.length), attacks.length);
    }
    passed.push("Right-click hold attacks, attack-speed limit, cooldown reset mode, release stops repeating");

    await page.evaluate(() => testScene());
    await page.mouse.move(850, 400);
    await page.mouse.down({ button: "right" });
    const first = await page.evaluate(() => state.aiden.x);
    await page.clock.runFor(1200);
    const second = await page.evaluate(() => state.aiden.x);
    await page.clock.runFor(1200);
    assert.ok(await page.evaluate(() => state.aiden.x) > second && second > first);
    await page.mouse.move(400, 400);
    await page.clock.runFor(500);
    assert.ok(await page.evaluate(() => state.moveTarget.x < state.aiden.x));
    await page.keyboard.press("KeyS");
    assert.equal(await page.evaluate(() => state.heldPointer), null);
    const stopped = await page.evaluate(() => ({ ...state.aiden }));
    await page.clock.runFor(400);
    assert.deepEqual(await page.evaluate(() => state.aiden), stopped);
    await page.mouse.up({ button: "right" });
    passed.push("Held movement follows screen cursor under camera lock; S cancels hold");

    await page.evaluate(() => { testScene(); els.aSmartCastMode.checked = true; });
    const near = await page.evaluate(() => testScreenPoint(state.dummies[0]));
    await page.keyboard.down("KeyA");
    await page.mouse.move(near.x, near.y);
    await page.mouse.down({ button: "left" });
    await page.clock.runFor(1600);
    assert.ok(await page.evaluate(() => testAttacks.length) >= 3);
    await page.keyboard.up("KeyA");
    const count = await page.evaluate(() => testAttacks.length);
    await page.clock.runFor(800);
    assert.equal(await page.evaluate(() => testAttacks.length), count);
    await page.mouse.up({ button: "left" });
    passed.push("A + left-click hold repeats; smart-cast keyup stops attacks");

    for (const eventName of ["pointercancel", "blur", "modal", "pointerleave"]) {
      await page.evaluate(() => testScene());
      await page.mouse.move(850, 400);
      await page.mouse.down({ button: "right" });
      if (eventName === "modal") {
        await page.evaluate(() => openOptionsModal());
      } else if (eventName === "pointerleave") {
        await page.mouse.move(1150, 200);
      } else {
        await page.evaluate((name) => window.dispatchEvent(new Event(name)), eventName);
      }
      assert.equal(await page.evaluate(() => state.heldPointer), null, eventName);
      await page.mouse.up({ button: "right" });
      if (eventName === "modal") await page.evaluate(() => closeOptionsModal());
    }
    await page.evaluate(() => { testScene(); state.placingDummy = true; });
    await page.mouse.move(850, 400);
    await page.mouse.down({ button: "left" });
    await page.clock.runFor(500);
    assert.equal(await page.evaluate(() => state.dummies.length), 2);
    assert.equal(await page.evaluate(() => state.heldPointer), null);
    await page.mouse.up({ button: "left" });
    passed.push("Focus loss, pointer cancellation, modal, field exit cleanup; one dummy per click");

    const wCases = await page.evaluate(() => [0.688, 0.79, 0.7999, 0.8001, 1.2].map((elapsed) => {
      testScene(3.5 * M);
      state.wStart = nowSeconds() - elapsed;
      state.recast.W = 2.3 - elapsed;
      state.wChargeHudActive = true;
      renderWCast();
      const fullBar = els.wCastFill.style.width === "100%";
      releaseW();
      return { elapsed, boundary: testHits[0].label === "전하소산(경계)", fullBar };
    }));
    for (const result of wCases) {
      assert.equal(result.boundary, result.elapsed >= 0.8);
      assert.equal(result.fullBar, result.elapsed >= 0.8);
    }
    await page.evaluate(() => testScene());
    await page.keyboard.press("KeyW");
    assert.equal(await page.evaluate(() => state.wStart), 0);
    await page.clock.runFor(128);
    assert.ok(await page.evaluate(() => isWCharging()));
    passed.push("W boundary and HUD agree at 0.8 s; separate 0.12 s startup retained");

    const rCases = await page.evaluate(() => [
      ["center", 0, true], ["outer", 2 * M, true], ["rim", RANGE.R, true],
      ["hitbox overlap", RANGE.R + DUMMY_HIT_RADIUS - 0.1, true],
      ["miss", RANGE.R + DUMMY_HIT_RADIUS + 0.1, false]
    ].map(([name, offset, expected]) => {
      testScene();
      state.cursor = offsetPoint(state.aiden, { x: 1, y: 0 }, 3 * M);
      Object.assign(state.dummies[0], offsetPoint(state.cursor, { x: 0, y: 1 }, offset));
      useR();
      updateCast(CAST.R1 + 0.001);
      return { name, expected, charge: state.charge, hit: state.rHit, hits: [...testHits] };
    }));
    for (const result of rCases) {
      assert.equal(result.charge, result.expected ? 1 : 0, result.name);
      assert.equal(result.hit, result.expected, result.name);
      assert.equal(result.hits.length, result.expected ? 1 : 0, result.name);
    }
    passed.push("R1 center, outer rim and hitbox overlap grant one charge; miss grants none");
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ passed, wCases, rCases, pageErrors: errors }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
