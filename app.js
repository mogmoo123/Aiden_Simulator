const MAX_CHARGE = 5;
const OVERCHARGE_TIME = 10;
const POST_HASTE_TIME = 2;
const WORLD_SCALE = 10;
const ATTACK_RATE = { melee: 1.5, ranged: 1.35 };

const RANGE = {
  Q_NORMAL: 168,
  Q_OVER: 470,
  W: 190,
  E1: 410,
  E2: 440,
  R: 150,
  D_DASH: 185,
  ATTACK_MELEE: 152,
  ATTACK_OVER: 420
};

const CAST = {
  Q_NORMAL: 0.216,
  Q_OVER: 0.264,
  W_START: 0.12,
  W_RELEASE: 0.2,
  E1: 0.16,
  E2: 0.2,
  R1: 0.34,
  R2: 0.12,
  D: 0.55,
  F: 0.05,
  A: 0.12
};

const skillDefs = {
  Q: { icon: "src/Aiden_Q.png", iconOver: "src/Aiden_Q2.png", cooldownNormal: 3, cooldownOver: 3, normalName: "뇌격", overName: "전자포" },
  W: { icon: "src/Aiden_W.png", cooldown: 11, recast: 7, chargeTime: 0.8, normalName: "전하 소산", recastName: "소산 방출" },
  E: { icon: "src/Aiden_E.png", icon2: "src/Aiden_E2.png", cooldown: 12, recast: 3.6, normalName: "백스텝", recastName: "볼트 러시" },
  R: { icon: "src/Aiden_R.png", cooldown: 60, recast: 2.1, normalName: "낙뢰", recastName: "낙뢰 이동" },
  D: { icon: "src/Aiden_D.png", cooldown: 14, normalName: "빗겨 흘리기" },
  F: { icon: "src/Aiden_F.png", cooldown: 18, normalName: "전술 스킬" },
  A: { icon: "src/Aiden_P.png", cooldown: 0.78, normalName: "평타" }
};

const voices = {
  passive: [
    "src/voice/passive/Aiden_skillPassive1_01.wav",
    "src/voice/passive/Aiden_skillPassive1_02.wav",
    "src/voice/passive/Aiden_skillPassive1_03.wav",
    "src/voice/passive/Aiden_skillPassive2_01.wav",
    "src/voice/passive/Aiden_skillPassive2_02.wav"
  ],
  W1: [
    "src/voice/W/Aiden_skillW1_01.wav",
    "src/voice/W/Aiden_skillW1_02.wav",
    "src/voice/W/Aiden_skillW1_03.wav"
  ],
  W2: [
    "src/voice/W/Aiden_skillW2_01.wav",
    "src/voice/W/Aiden_skillW2_02.wav",
    "src/voice/W/Aiden_skillW3_01.wav"
  ],
  E1: [
    "src/voice/E/Aiden_skillE1_01.wav",
    "src/voice/E/Aiden_skillE1-2_01.wav"
  ],
  E2: [
    "src/voice/E/Aiden_skillE1_01.wav",
    "src/voice/E/Aiden_skillE1-2_01.wav"
  ],
  R: [
    "src/voice/R/Aiden_skillR_1_01.wav",
    "src/voice/R/Aiden_skillR_2_01.wav",
    "src/voice/R/Aiden_skillR_3_01.wav"
  ]
};

const state = {
  mode: "normal",
  charge: 0,
  bullets: 0,
  overTime: 0,
  hasteTime: 0,
  cooldowns: {},
  recast: { W: 0, E: 0, R: 0 },
  wStart: 0,
  markedDummyId: null,
  lastHitDummyId: 1,
  moveTarget: null,
  dash: null,
  casts: [],
  rTarget: null,
  rHit: false,
  cam: { x: 38, y: 56 },
  spaceHeld: false,
  pointer: { x: 0, y: 0 },
  placingDummy: false,
  rebinding: null,
  keybinds: { Q: "KeyQ", W: "KeyW", E: "KeyE", R: "KeyR", D: "KeyD", F: "KeyF", A: "KeyA" },
  cursor: { x: 58, y: 50 },
  aiden: { x: 38, y: 56 },
  facing: 0,
  previewSkill: "Q",
  nextDummyId: 2,
  dummies: [
    { id: 1, x: 40, y: 55, hp: 100, vx: 1, vy: 0.35, seed: 0.4 }
  ],
  lastTick: performance.now()
};

const els = {
  stage: document.getElementById("stage"),
  field: document.getElementById("field"),
  world: document.getElementById("world"),
  dummyLayer: document.getElementById("dummyLayer"),
  aiden: document.getElementById("aiden"),
  cursorRing: document.getElementById("cursorRing"),
  movePoint: document.getElementById("movePoint"),
  aimLine: document.getElementById("aimLine"),
  wRange: document.getElementById("wRange"),
  e2Range: document.getElementById("e2Range"),
  rRange: document.getElementById("rRange"),
  qRange: document.getElementById("qRange"),
  eRange: document.getElementById("eRange"),
  aRange: document.getElementById("aRange"),
  modeText: document.getElementById("modeText"),
  resourceLabel: document.getElementById("resourceLabel"),
  chargeText: document.getElementById("chargeText"),
  chargeSlots: document.getElementById("chargeSlots"),
  modeTimer: document.getElementById("modeTimer"),
  dummyHp: document.getElementById("dummyHp"),
  dummyCount: document.getElementById("dummyCount"),
  autoFace: document.getElementById("autoFace"),
  rangePreview: document.getElementById("rangePreview"),
  cooldownResetMode: document.getElementById("cooldownResetMode"),
  dummyMoveMode: document.getElementById("dummyMoveMode"),
  cameraShakeMode: document.getElementById("cameraShakeMode"),
  voiceMode: document.getElementById("voiceMode"),
  alexMode: document.getElementById("alexMode"),
  alexLabel: document.getElementById("alexLabel"),
  cameraLock: document.getElementById("cameraLock"),
  healBtn: document.getElementById("healBtn"),
  addDummyBtn: document.getElementById("addDummyBtn"),
  champResetBtn: document.getElementById("champResetBtn"),
  fullChargeBtn: document.getElementById("fullChargeBtn"),
  clearCooldownBtn: document.getElementById("clearCooldownBtn"),
  castPanel: document.getElementById("castPanel"),
  castName: document.getElementById("castName"),
  castFill: document.getElementById("castFill"),
  passiveSlot: document.getElementById("passiveSlot"),
  passiveDur: document.getElementById("passiveDur"),
  charStacks: document.getElementById("charStacks"),
  camSens: document.getElementById("camSens"),
  keybinds: document.getElementById("keybinds"),
  skillSlots: [...document.querySelectorAll(".skill-slot")]
};

function fieldRect() {
  return els.field.getBoundingClientRect();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clampPoint(point, pad = 4) {
  return { x: clamp(point.x, pad, 100 - pad), y: clamp(point.y, pad, 100 - pad) };
}

function toPx(point) {
  const rect = fieldRect();
  return { x: point.x * rect.width * WORLD_SCALE / 100, y: point.y * rect.height * WORLD_SCALE / 100 };
}

function fromPx(point) {
  const rect = fieldRect();
  return { x: point.x * 100 / (rect.width * WORLD_SCALE), y: point.y * 100 / (rect.height * WORLD_SCALE) };
}

const CAMERA = { fovDeg: 40, depressionDeg: 56, zoom: 1.5 };

function camMargin() {
  return 50 / (WORLD_SCALE * CAMERA.zoom);
}

function cameraSensitivity() {
  const v = parseFloat(els.camSens.value);
  return Number.isFinite(v) && v > 0 ? v : 20;
}

// LoL식 원근 카메라: #world를 rotateX로 기울이고 zoom으로 확대하며,
// state.cam(맵 중심, field%)이 화면 중앙에 오도록 평행이동한다.
function cameraParams() {
  const rect = fieldRect();
  const W = rect.width;
  const H = rect.height;
  const tilt = (90 - CAMERA.depressionDeg) * Math.PI / 180;
  const P = (H / 2) / Math.tan((CAMERA.fovDeg / 2) * Math.PI / 180);
  const sin = Math.sin(tilt);
  const cos = Math.cos(tilt);
  const worldW = W * WORLD_SCALE;
  const worldH = H * WORLD_SCALE;
  const Ccx = (state.cam.x / 100) * worldW - W / 2;
  const Ccy = (state.cam.y / 100) * worldH - H / 2;
  return { rect, W, H, worldW, worldH, P, sin, cos, zoom: CAMERA.zoom, Ccx, Ccy };
}

function applyCamera() {
  const c = cameraParams();
  const tilt = 90 - CAMERA.depressionDeg;
  els.world.style.transform =
    `perspective(${c.P.toFixed(2)}px) rotateX(${tilt}deg) scale(${c.zoom}) ` +
    `translate(${(-c.Ccx).toFixed(2)}px, ${(-c.Ccy).toFixed(2)}px)`;
}

// 화면 좌표 → 지면 평면의 논리 % (원근 + 카메라 평행이동 역투영)
function pointFromEvent(event) {
  const c = cameraParams();
  const Sx = event.clientX - c.rect.left - c.W / 2;
  const Sy = event.clientY - c.rect.top - c.H / 2;
  const m = (Sy * c.P) / (c.cos * c.P + Sy * c.sin);
  const v = m / c.zoom;
  const s = c.P / (c.P - m * c.sin);
  const u = Sx / (c.zoom * s);
  return clampPoint({
    x: (u + c.Ccx + c.W / 2) / c.worldW * 100,
    y: (v + c.Ccy + c.H / 2) / c.worldH * 100
  });
}

function updateCamera(delta) {
  const follow = els.cameraLock.checked || state.spaceHeld;
  if (follow) {
    state.cam.x = state.aiden.x;
    state.cam.y = state.aiden.y;
  } else {
    const rect = fieldRect();
    const edge = 64;
    const speed = cameraSensitivity();
    let dx = 0;
    let dy = 0;
    if (state.pointer.x < edge) dx = -1;
    else if (state.pointer.x > rect.width - edge) dx = 1;
    if (state.pointer.y < edge) dy = -1;
    else if (state.pointer.y > rect.height - edge) dy = 1;
    state.cam.x += dx * speed * delta;
    state.cam.y += dy * speed * delta;
  }
  const mg = camMargin();
  state.cam.x = clamp(state.cam.x, mg, 100 - mg);
  state.cam.y = clamp(state.cam.y, mg, 100 - mg);
}

function distance(a, b) {
  const ap = toPx(a);
  const bp = toPx(b);
  return Math.hypot(ap.x - bp.x, ap.y - bp.y);
}

function direction(from = state.aiden, to = state.cursor) {
  const a = toPx(from);
  const b = toPx(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len, angle: Math.atan2(dy, dx) * 180 / Math.PI };
}

function offsetPoint(origin, dir, pixels, shouldClamp = true) {
  const op = toPx(origin);
  const point = fromPx({ x: op.x + dir.x * pixels, y: op.y + dir.y * pixels });
  return shouldClamp ? clampPoint(point, 5) : point;
}

function nowSeconds() {
  return performance.now() / 1000;
}

function isOvercharged() {
  return state.mode === "overcharged";
}

function currentQCooldownKey() {
  return isOvercharged() ? "Q_OVER" : "Q_NORMAL";
}

function dummyById(id) {
  return state.dummies.find((dummy) => dummy.id === id) || null;
}

function markedDummy() {
  return dummyById(state.markedDummyId);
}

function lastHitDummy() {
  return dummyById(state.lastHitDummyId) || state.dummies[0] || null;
}

function nearestDummy(point = state.aiden) {
  return state.dummies.reduce((best, dummy) => {
    const dist = distance(point, dummy);
    if (!best || dist < best.dist) return { dummy, dist };
    return best;
  }, null)?.dummy || null;
}

function pointSegmentDistancePx(point, a, b) {
  const p = toPx(point);
  const ap = toPx(a);
  const bp = toPx(b);
  const abx = bp.x - ap.x;
  const aby = bp.y - ap.y;
  const len2 = abx * abx + aby * aby || 1;
  const t = clamp(((p.x - ap.x) * abx + (p.y - ap.y) * aby) / len2, 0, 1);
  const near = { x: ap.x + abx * t, y: ap.y + aby * t };
  return Math.hypot(p.x - near.x, p.y - near.y);
}

function lineHitDummies(start, end, radius = 40) {
  return state.dummies
    .filter((dummy) => pointSegmentDistancePx(dummy, start, end) <= radius)
    .sort((a, b) => distance(start, a) - distance(start, b));
}

function circleHitDummies(center, radius) {
  return state.dummies
    .filter((dummy) => distance(center, dummy) <= radius)
    .sort((a, b) => distance(center, a) - distance(center, b));
}

function coneHitDummies(range, widthDegrees, dir = direction()) {
  const ap = toPx(state.aiden);
  return state.dummies.filter((dummy) => {
    const dp = toPx(dummy);
    const dx = dp.x - ap.x;
    const dy = dp.y - ap.y;
    const len = Math.hypot(dx, dy) || 1;
    const dot = (dx / len) * dir.x + (dy / len) * dir.y;
    const angle = Math.acos(clamp(dot, -1, 1)) * 180 / Math.PI;
    return len <= range && angle <= widthDegrees / 2;
  }).sort((a, b) => distance(state.aiden, a) - distance(state.aiden, b));
}

function enemyNearby() {
  return state.dummies.some((dummy) => distance(state.aiden, dummy) <= 210);
}

let activeVoice = null;

function playVoice(group) {
  if (!els.voiceMode.checked) return;
  const list = voices[group];
  if (!list || !list.length) return;
  const src = list[Math.floor(Math.random() * list.length)];
  if (activeVoice) {
    activeVoice.pause();
    activeVoice.currentTime = 0;
  }
  const audio = new Audio(src);
  audio.volume = 0.72;
  activeVoice = audio;
  audio.addEventListener("ended", () => {
    if (activeVoice === audio) activeVoice = null;
  });
  audio.play().catch(() => {});
}

function shake() {
  if (!els.cameraShakeMode.checked) return;
  els.stage.classList.remove("shake");
  void els.stage.offsetWidth;
  els.stage.classList.add("shake");
}

function resetECooldownOnFullCharge(before) {
  if (before < MAX_CHARGE && state.charge >= MAX_CHARGE) {
    state.cooldowns.E = 0;
    floating("E 쿨타임 초기화", state.aiden, "blue");
  }
}

function addCharge(amount, reason = "") {
  if (isOvercharged()) return;
  const before = state.charge;
  state.charge = clamp(state.charge + amount, 0, MAX_CHARGE);
  if (state.charge > before && reason) floating(`전하 +${state.charge - before}`, state.aiden, "blue");
  resetECooldownOnFullCharge(before);
}

function enterOvercharge(reason = "") {
  if (isOvercharged() || state.charge < MAX_CHARGE) return;
  state.mode = "overcharged";
  state.bullets = MAX_CHARGE;
  state.overTime = OVERCHARGE_TIME;
  state.hasteTime = 0;
  state.recast.W = 0;
  state.wStart = 0;
  floating(reason || "과전하", state.aiden, "gold");
  playVoice("passive");
  spawnCircle(state.aiden, 170, "fx-circle");
}

function leaveOvercharge() {
  if (!isOvercharged()) return;
  state.mode = "normal";
  state.charge = 0;
  state.bullets = 0;
  state.overTime = 0;
  state.hasteTime = POST_HASTE_TIME;
  floating("이동 속도 증가", state.aiden, "blue");
  spawnCircle(state.aiden, 150, "fx-circle");
}

function consumeBullet(amount) {
  if (!isOvercharged()) return true;
  if (state.bullets < amount) {
    floating("탄환 부족", state.aiden, "gold");
    return false;
  }
  state.bullets -= amount;
  if (state.bullets <= 0) leaveOvercharge();
  return true;
}

function cooldownOf(key) {
  if (key === "Q") return state.cooldowns[currentQCooldownKey()] || 0;
  return state.cooldowns[key] || 0;
}

function setCooldown(key, multiplier = 1) {
  if (els.cooldownResetMode.checked) {
    if (key === "Q") {
      state.cooldowns.Q_NORMAL = 0;
      state.cooldowns.Q_OVER = 0;
    } else {
      state.cooldowns[key] = 0;
    }
    return;
  }
  if (key === "Q") {
    const cd = isOvercharged() ? skillDefs.Q.cooldownOver : skillDefs.Q.cooldownNormal;
    state.cooldowns[currentQCooldownKey()] = cd * multiplier;
    return;
  }
  state.cooldowns[key] = skillDefs[key].cooldown * multiplier;
}

function hasBlockingCast() {
  return state.casts.some((cast) => cast.blocking);
}

function isCasting(skill) {
  return state.casts.some((cast) => cast.skill === skill);
}

function isWCharging() {
  return state.wStart > 0 && state.recast.W > 0;
}

function isRRecast() {
  return state.recast.R > 0 && !!state.rTarget;
}

function isERecast() {
  return state.recast.E > 0 && !!markedDummy();
}

function activeCast() {
  for (let i = state.casts.length - 1; i >= 0; i -= 1) {
    if (state.casts[i].blocking) return state.casts[i];
  }
  return state.casts[state.casts.length - 1] || null;
}

function canUse(key) {
  if (isWCharging() && key !== "W" && !(key === "E" && isERecast()) && !(key === "R" && isRRecast())) return false;
  if (key === "E" && isCasting("E")) return false;
  if (key === "R" && isCasting("R")) return false;
  if (key !== "E" && !(key === "R" && isRRecast()) && hasBlockingCast()) return false;
  if (cooldownOf(key) > 0) return false;
  if (key === "E" && state.recast.E > 0 && !markedDummy()) return false;
  if (key === "Q" && isOvercharged() && state.bullets < 1) return false;
  if (key === "A" && isOvercharged() && state.bullets < 1) return false;
  return true;
}

function beginCast(label, duration, onComplete, opts = {}) {
  state.casts.push({
    label,
    duration,
    remaining: duration,
    onComplete,
    blocking: opts.blocking !== false,
    skill: opts.skill || null
  });
}

function damageDummy(dummy, amount, label) {
  if (!dummy || amount <= 0) return;
  dummy.hp = clamp(dummy.hp - amount, 0, 100);
  state.lastHitDummyId = dummy.id;
  floating("Hit", dummy, "hit");
  spawnHit(dummy);
  shake();
  if (dummy.hp <= 0) {
    setTimeout(() => {
      dummy.hp = 100;
      if (state.markedDummyId === dummy.id) state.markedDummyId = null;
    }, 450);
  }
}

function floating(text, point, tone = "hit") {
  if (point === state.aiden) return;
  const pos = toPx(point);
  const el = document.createElement("div");
  el.className = `float-text ${tone}`;
  el.textContent = text;
  el.style.left = `${pos.x}px`;
  el.style.top = `${pos.y - 30}px`;
  if (tone === "gold") el.style.color = "#ffc857";
  if (tone === "blue") el.style.color = "#8cecff";
  els.world.appendChild(el);
  setTimeout(() => el.remove(), 850);
}

function spawnBase(className, point, size = 80) {
  const pos = toPx(point);
  const el = document.createElement("div");
  el.className = `effect ${className}`;
  el.style.left = `${pos.x}px`;
  el.style.top = `${pos.y}px`;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  els.world.appendChild(el);
  setTimeout(() => el.remove(), className.includes("field") ? 2600 : 900);
  return el;
}

function spawnCircle(point, size, className = "fx-circle") {
  spawnBase(className, point, size);
}

function spawnLine(start, end, className = "fx-line", width = 10) {
  const a = toPx(start);
  const b = toPx(end);
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  const angle = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
  const el = document.createElement("div");
  el.className = `effect ${className}`;
  el.style.left = `${a.x}px`;
  el.style.top = `${a.y - width / 2}px`;
  el.style.width = `${length}px`;
  el.style.height = `${width}px`;
  const transform = `rotate(${angle}deg)`;
  el.style.setProperty("--fx-transform", transform);
  el.style.transform = transform;
  els.world.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

function spawnSlash(angle) {
  const pos = toPx(state.aiden);
  const el = document.createElement("div");
  el.className = "effect fx-slash";
  el.style.left = `${pos.x + Math.cos(angle * Math.PI / 180) * 28 - 75}px`;
  el.style.top = `${pos.y + Math.sin(angle * Math.PI / 180) * 28 - 46}px`;
  const transform = `rotate(${angle}deg)`;
  el.style.setProperty("--fx-transform", transform);
  el.style.transform = transform;
  els.world.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

function spawnBullet(start, end) {
  const a = toPx(start);
  const b = toPx(end);
  const el = document.createElement("div");
  el.className = "effect fx-bullet";
  el.style.left = `${a.x}px`;
  el.style.top = `${a.y}px`;
  el.style.setProperty("--bx", `${b.x - a.x}px`);
  el.style.setProperty("--by", `${b.y - a.y}px`);
  els.world.appendChild(el);
  setTimeout(() => el.remove(), 400);
}

function spawnAfterimage(point) {
  const pos = toPx(point);
  const el = document.createElement("div");
  el.className = "effect fx-wghost";
  el.style.left = `${pos.x}px`;
  el.style.top = `${pos.y}px`;
  el.style.width = `${RANGE.W * 2}px`;
  el.style.height = `${RANGE.W * 2}px`;
  els.world.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

function spawnHit(point) {
  const pos = toPx(point);
  const el = document.createElement("div");
  el.className = "effect fx-hit";
  el.style.left = `${pos.x}px`;
  el.style.top = `${pos.y}px`;
  els.world.appendChild(el);
  setTimeout(() => el.remove(), 380);
}

function spawnRZone(point) {
  const pos = toPx(point);
  const el = document.createElement("div");
  el.className = "effect fx-rzone";
  el.style.left = `${pos.x}px`;
  el.style.top = `${pos.y}px`;
  el.style.width = `${RANGE.R * 2}px`;
  el.style.height = `${RANGE.R * 2}px`;
  els.world.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

function spawnParry(dir) {
  const pos = toPx(state.aiden);
  const el = document.createElement("div");
  el.className = "effect fx-parry";
  el.style.left = `${pos.x - 20}px`;
  el.style.top = `${pos.y - 41}px`;
  const transform = `rotate(${dir.angle}deg)`;
  el.style.setProperty("--fx-transform", transform);
  el.style.transform = transform;
  els.world.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

function addTrail(point = state.aiden) {
  const pos = toPx(point);
  const el = document.createElement("div");
  el.className = "ghost-trail";
  el.style.left = `${pos.x}px`;
  el.style.top = `${pos.y}px`;
  els.world.appendChild(el);
  setTimeout(() => el.remove(), 500);
}

function dashTo(point, duration = 0.18) {
  state.moveTarget = null;
  state.dash = { from: { ...state.aiden }, to: clampPoint(point, 6), elapsed: 0, duration };
  addTrail(state.aiden);
}

function moveTo(point) {
  state.moveTarget = clampPoint(point, 6);
  state.facing = direction(state.aiden, state.moveTarget).angle;
  const p = toPx(state.moveTarget);
  els.movePoint.style.left = `${p.x}px`;
  els.movePoint.style.top = `${p.y}px`;
  els.movePoint.classList.remove("show");
  void els.movePoint.offsetWidth;
  els.movePoint.classList.add("show");
}

function getSkillName(key) {
  if (key === "Q") return isOvercharged() ? skillDefs.Q.overName : skillDefs.Q.normalName;
  if (key === "W") return state.recast.W > 0 ? skillDefs.W.recastName : skillDefs.W.normalName;
  if (key === "E") return state.recast.E > 0 ? skillDefs.E.recastName : skillDefs.E.normalName;
  if (key === "R") return state.recast.R > 0 ? skillDefs.R.recastName : skillDefs.R.normalName;
  if (key === "A") return isOvercharged() ? "원거리 평타" : "근접 평타";
  return skillDefs[key].normalName;
}

function getSkillIcon(key) {
  if (key === "Q" && isOvercharged()) return skillDefs.Q.iconOver;
  if (key === "E" && state.recast.E > 0) return skillDefs.E.icon2;
  return skillDefs[key].icon;
}

function basicAttack() {
  if (!canUse("A")) return;
  beginCast(getSkillName("A"), CAST.A, () => {
    const overcharged = isOvercharged();
    const range = overcharged ? RANGE.ATTACK_OVER : RANGE.ATTACK_MELEE;
    const target = state.dummies
      .filter((dummy) => distance(state.aiden, dummy) <= range)
      .sort((a, b) => distance(state.aiden, a) - distance(state.aiden, b))[0] || null;
    const dir = direction(state.aiden, target || state.cursor);
    if (target) state.facing = dir.angle;
    if (overcharged) {
      if (!consumeBullet(1)) return;
      spawnBullet(state.aiden, target || offsetPoint(state.aiden, dir, range, false));
      if (target) damageDummy(target, 8, "치명 원거리");
    } else {
      spawnSlash(dir.angle);
      if (target) {
        spawnBullet(state.aiden, target);
        damageDummy(target, 5, "평타");
        state.cooldowns.Q_NORMAL = Math.max(0, (state.cooldowns.Q_NORMAL || 0) - 1.5);
      }
    }
    const aps = overcharged ? ATTACK_RATE.ranged : ATTACK_RATE.melee;
    state.cooldowns.A = els.cooldownResetMode.checked ? 0 : 1 / aps;
  }, { skill: "A" });
}

function useQ() {
  if (!canUse("Q")) return;
  beginCast(getSkillName("Q"), isOvercharged() ? CAST.Q_OVER : CAST.Q_NORMAL, () => {
    const dir = direction();
    if (isOvercharged()) {
      if (!consumeBullet(Math.min(2, state.bullets))) return;
      const end = offsetPoint(state.aiden, dir, RANGE.Q_OVER, false);
      const hits = lineHitDummies(state.aiden, end, 34);
      spawnBullet(state.aiden, end);
      if (hits[0]) {
        damageDummy(hits[0], 17, "전자포");
        setCooldown("Q", 0.5);
      } else {
        setCooldown("Q");
      }
    } else {
      const end = offsetPoint(state.aiden, dir, RANGE.Q_NORMAL, false);
      const hits = coneHitDummies(RANGE.Q_NORMAL, 82, dir);
      spawnSlash(dir.angle);
      spawnLine(state.aiden, end, "fx-line", 16);
      if (hits[0]) {
        damageDummy(hits[0], 13, "뇌격");
        addCharge(2, "Q");
      }
      setCooldown("Q");
    }
  });
}

function releaseW() {
  const releasePos = { ...state.aiden };
  const held = clamp(nowSeconds() - state.wStart, 0.15, skillDefs.W.chargeTime);
  const ratio = held / skillDefs.W.chargeTime;
  spawnCircle(releasePos, RANGE.W * 2, "fx-wcircle");
  spawnAfterimage(releasePos);
  addCharge(1, "W");

  circleHitDummies(releasePos, RANGE.W).forEach((dummy) => {
    damageDummy(dummy, Math.round(9 + ratio * 13), "Hit");
  });

  if (ratio >= 0.86) {
    const dir = direction();
    const fieldPoint = offsetPoint(state.aiden, dir, RANGE.W, true);
    circleHitDummies(fieldPoint, 108).forEach((dummy) => {
      damageDummy(dummy, 12, "Hit");
    });
  }

  state.recast.W = 0;
  state.wStart = 0;
  setCooldown("W");
}

function useW() {
  if (!canUse("W")) return;
  if (state.recast.W <= 0) {
    beginCast("전하 소산 충전", CAST.W_START, () => {
      playVoice("W1");
      state.recast.W = skillDefs.W.recast;
      state.wStart = nowSeconds();
      spawnCircle(state.aiden, RANGE.W * 2, "fx-circle");
      floating("충전", state.aiden, "blue");
      addCharge(1, "W");
    });
    return;
  }

  beginCast("전하 소산 방출", CAST.W_RELEASE, () => {
    playVoice("W2");
    releaseW();
  });
}

function useE() {
  if (!canUse("E")) return;
  if (state.recast.E > 0) {
    const target = markedDummy();
    if (!target) return;
    if (distance(state.aiden, target) > RANGE.E2) {
      floating("볼트 러시 사거리 밖", state.aiden, "gold");
      return;
    }
    beginCast("볼트 러시", CAST.E2, () => {
      const dir = direction();
      playVoice("E2");
      const through = offsetPoint(target, dir, 82, true);
      spawnLine(state.aiden, through, "fx-line", 11);
      dashTo(through, 0.16);
      damageDummy(target, 16, "볼트 러시");
      addCharge(1, "E");
      state.markedDummyId = null;
      state.recast.E = 0;
      setCooldown("E");
    }, { blocking: false, skill: "E" });
    return;
  }

  beginCast("백스텝", CAST.E1, () => {
    const dir = direction();
    playVoice("E1");
    const bulletEnd = offsetPoint(state.aiden, dir, RANGE.E1, false);
    const backPoint = offsetPoint(state.aiden, { x: -dir.x, y: -dir.y }, 150, true);
    const hits = lineHitDummies(state.aiden, bulletEnd, 36);
    spawnBullet(state.aiden, bulletEnd);
    dashTo(backPoint, 0.18);
    if (hits[0]) {
      damageDummy(hits[0], 7, "백스텝");
      state.markedDummyId = hits[0].id;
      state.recast.E = skillDefs.E.recast;
      addCharge(1, "E");
    }
    if (state.charge >= MAX_CHARGE) enterOvercharge("백스텝 과전하");
    if (!hits[0]) setCooldown("E");
  }, { blocking: false, skill: "E" });
}

function castSecondLightning() {
  if (!state.rTarget) return;
  spawnCircle(state.rTarget, 160, "fx-lightning");
  circleHitDummies(state.rTarget, 130).forEach((dummy) => {
    damageDummy(dummy, 18, "낙뢰 2타");
  });
  state.rTarget = null;
  state.rHit = false;
  state.recast.R = 0;
  setCooldown("R");
}

function useR() {
  if (!canUse("R")) return;
  if (state.recast.R > 0 && state.rTarget) {
    beginCast("낙뢰 이동", CAST.R2, () => {
      playVoice("R");
      spawnLine(state.aiden, state.rTarget, "fx-line", 9);
      dashTo(state.rTarget, 0.16);
      if (state.rHit) {
        const before = state.charge;
        state.charge = MAX_CHARGE;
        resetECooldownOnFullCharge(before);
        floating("전하 최대", state.aiden, "gold");
      }
      castSecondLightning();
    }, { blocking: false, skill: "R" });
    return;
  }

  const target = { ...state.cursor };
  beginCast("낙뢰", CAST.R1, () => {
    playVoice("R");
    state.rTarget = target;
    spawnRZone(target);
    const outer = circleHitDummies(target, RANGE.R);
    const center = circleHitDummies(target, 75);
    spawnCircle(target, RANGE.R * 2, "fx-lightning");
    outer.forEach((dummy) => {
      damageDummy(dummy, center.includes(dummy) ? 18 : 12, center.includes(dummy) ? "중심 낙뢰" : "낙뢰");
    });
    state.rHit = outer.length > 0;
    state.recast.R = skillDefs.R.recast;
  });
}

function useD() {
  if (!canUse("D")) return;
  els.aiden.classList.add("parry");
  setTimeout(() => els.aiden.classList.remove("parry"), 700);
  const dir = direction();
  beginCast("빗겨 흘리기", CAST.D, () => {
    const aimDir = direction();
    const end = offsetPoint(state.aiden, aimDir, RANGE.D_DASH, true);
    spawnParry(aimDir);
    spawnLine(state.aiden, end, "fx-line", 11);
    dashTo(end, 0.14);
    lineHitDummies(state.aiden, end, 48).forEach((dummy) => {
      damageDummy(dummy, 14, "반격");
      addCharge(1, "D");
    });
    setCooldown("D");
  }, { skill: "D" });
  spawnParry(dir);
}

function useF() {
  if (!canUse("F")) return;
  beginCast("전술 스킬", CAST.F, () => {
    const dir = direction();
    const point = offsetPoint(state.aiden, dir, 225, true);
    spawnLine(state.aiden, point, "fx-line", 6);
    dashTo(point, 0.11);
    setCooldown("F");
  });
}

function useSkill(key) {
  if (!skillDefs[key]) return;
  state.previewSkill = key;
  if (key === "Q") useQ();
  if (key === "W") useW();
  if (key === "E") useE();
  if (key === "R") useR();
  if (key === "D") useD();
  if (key === "F") useF();
  render();
}

function updateCast(delta) {
  if (!state.casts.length) return;
  state.casts.forEach((cast) => { cast.remaining -= delta; });
  const completed = state.casts.filter((cast) => cast.remaining <= 0);
  if (!completed.length) return;
  state.casts = state.casts.filter((cast) => cast.remaining > 0);
  completed.forEach((cast) => cast.onComplete());
}

function updateMovement(delta) {
  if (state.dash) {
    state.dash.elapsed += delta;
    const t = clamp(state.dash.elapsed / state.dash.duration, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    state.aiden.x = state.dash.from.x + (state.dash.to.x - state.dash.from.x) * eased;
    state.aiden.y = state.dash.from.y + (state.dash.to.y - state.dash.from.y) * eased;
    if (Math.random() < 0.34) addTrail(state.aiden);
    if (t >= 1) state.dash = null;
    return;
  }

  if (isCasting("A") || isCasting("D")) return;
  if (!state.moveTarget) return;
  const pos = toPx(state.aiden);
  const target = toPx(state.moveTarget);
  const dx = target.x - pos.x;
  const dy = target.y - pos.y;
  const len = Math.hypot(dx, dy);
  if (len < 4) {
    state.moveTarget = null;
    return;
  }
  const slowed = state.recast.W > 0 && state.wStart > 0 ? 0.2 : 1;
  const hasted = state.hasteTime > 0 ? 1.13 : 1;
  const speed = 305 * slowed * hasted;
  const step = Math.min(len, speed * delta);
  state.aiden = clampPoint(fromPx({ x: pos.x + dx / len * step, y: pos.y + dy / len * step }), 6);
}

function updateDummies(delta) {
  if (!els.dummyMoveMode.checked) return;
  state.dummies.forEach((dummy) => {
    const px = toPx(dummy);
    let next = { x: px.x + dummy.vx * 120 * delta, y: px.y + dummy.vy * 34 * delta };
    const rect = fieldRect();
    if (next.x < 110 || next.x > rect.width - 120) dummy.vx *= -1;
    if (next.y < 120 || next.y > rect.height - 120) dummy.vy *= -1;
    next = { x: px.x + dummy.vx * 120 * delta, y: px.y + dummy.vy * 34 * delta };
    Object.assign(dummy, clampPoint(fromPx(next), 7));
  });
}

function updateTimers(delta) {
  Object.keys(state.cooldowns).forEach((key) => {
    state.cooldowns[key] = Math.max(0, state.cooldowns[key] - delta);
  });

  Object.keys(state.recast).forEach((key) => {
    state.recast[key] = Math.max(0, state.recast[key] - delta);
  });

  if (state.recast.W <= 0 && state.wStart > 0 && !hasBlockingCast()) {
    beginCast("전하 소산 방출", CAST.W_RELEASE, () => releaseW());
  }

  if (state.recast.E <= 0 && state.markedDummyId) {
    state.markedDummyId = null;
    setCooldown("E");
  }

  if (state.recast.R <= 0 && state.rTarget && !hasBlockingCast()) {
    castSecondLightning();
  }

  if (state.mode === "overcharged") {
    state.overTime = Math.max(0, state.overTime - delta);
    if (state.overTime <= 0) leaveOvercharge();
  } else {
    state.hasteTime = Math.max(0, state.hasteTime - delta);
    if (state.charge >= MAX_CHARGE && !enemyNearby()) enterOvercharge("거리 확보 과전하");
  }
}

function positionCircle(el, point, radius) {
  const pos = toPx(point);
  el.style.left = `${pos.x}px`;
  el.style.top = `${pos.y}px`;
  el.style.width = `${radius * 2}px`;
  el.style.height = `${radius * 2}px`;
}

function positionLine(el, start, dir, range, height = 16) {
  const pos = toPx(start);
  el.style.left = `${pos.x}px`;
  el.style.top = `${pos.y - height / 2}px`;
  el.style.width = `${range}px`;
  el.style.height = `${height}px`;
  el.style.transform = `rotate(${dir.angle}deg)`;
}

function renderRanges() {
  [els.wRange, els.e2Range, els.rRange, els.qRange, els.eRange, els.aRange].forEach((el) => el.classList.remove("show"));
  const dir = direction();
  const preview = els.rangePreview.checked ? state.previewSkill : "";

  if (preview === "A") {
    positionCircle(els.aRange, state.aiden, isOvercharged() ? RANGE.ATTACK_OVER : RANGE.ATTACK_MELEE);
    els.aRange.classList.add("show");
  }

  if (state.wStart > 0) {
    positionCircle(els.wRange, state.aiden, RANGE.W);
    els.wRange.classList.add("show");
  }

  const marked = markedDummy();
  if (marked) {
    positionCircle(els.e2Range, marked, RANGE.E2);
    els.e2Range.classList.add("show");
  }

  if (preview === "Q") {
    positionLine(els.qRange, state.aiden, dir, isOvercharged() ? RANGE.Q_OVER : RANGE.Q_NORMAL, isOvercharged() ? 18 : 24);
    els.qRange.classList.add("show");
  }

  if (preview === "E" && !marked) {
    positionLine(els.eRange, state.aiden, dir, RANGE.E1, 18);
    els.eRange.classList.add("show");
  }

  if (state.rTarget) {
    positionCircle(els.rRange, state.rTarget, RANGE.R);
    els.rRange.classList.add("show");
  } else if (preview === "R") {
    positionCircle(els.rRange, state.cursor, RANGE.R);
    els.rRange.classList.add("show");
  }
}

function renderUnits() {
  const ap = toPx(state.aiden);
  els.aiden.style.left = `${ap.x}px`;
  els.aiden.style.top = `${ap.y}px`;
  if (els.autoFace.checked) state.facing = direction().angle;
  els.aiden.style.transform = `translate(-50%, -50%) rotate(${state.facing}deg)`;
  els.aiden.classList.toggle("overcharged", isOvercharged());

  const stackCount = isOvercharged() ? state.bullets : state.charge;
  els.charStacks.style.left = `${ap.x}px`;
  els.charStacks.style.top = `${ap.y + 42}px`;
  els.charStacks.innerHTML = Array.from({ length: MAX_CHARGE }, (_, i) => {
    const filled = i < stackCount ? "filled" : "";
    const bullet = isOvercharged() ? "bullet" : "";
    return `<span class="${filled} ${bullet}"></span>`;
  }).join("");

  const cp = toPx(state.cursor);
  els.cursorRing.style.left = `${cp.x}px`;
  els.cursorRing.style.top = `${cp.y}px`;
  els.aimLine.style.left = `${ap.x}px`;
  els.aimLine.style.top = `${ap.y}px`;
  els.aimLine.style.transform = `rotate(${direction().angle}deg)`;

  const alex = els.alexMode.checked;
  els.dummyLayer.innerHTML = state.dummies.map((dummy) => {
    const p = toPx(dummy);
    const marked = dummy.id === state.markedDummyId ? "marked" : "";
    const body = alex
      ? `<img class="alex-sprite" src="src/Alex_Mini_00.png" alt="" />`
      : `<div class="dummy-core"></div>`;
    return `
      <div class="unit dummy ${marked} ${alex ? "alex" : ""}" data-id="${dummy.id}" style="left:${p.x}px; top:${p.y}px">
        <div class="mark"></div>
        ${body}
        <div class="dummy-base"></div>
        <div class="hp-chip"><span style="width:${dummy.hp}%"></span></div>
      </div>
    `;
  }).join("");
}

function renderPanel() {
  const resource = isOvercharged() ? state.bullets : state.charge;
  els.modeText.textContent = isOvercharged() ? "과전하" : state.hasteTime > 0 ? "가속" : "일반";
  els.resourceLabel.textContent = isOvercharged() ? "탄환" : "전하";
  els.chargeText.textContent = `${resource} / ${MAX_CHARGE}`;
  els.chargeSlots.innerHTML = Array.from({ length: MAX_CHARGE }, (_, index) => {
    const filled = index < resource ? "filled" : "";
    const bullet = isOvercharged() ? "bullet" : "";
    return `<span class="${filled} ${bullet}"></span>`;
  }).join("");
  els.modeTimer.style.width = `${isOvercharged() ? state.overTime / OVERCHARGE_TIME * 100 : state.hasteTime / POST_HASTE_TIME * 100}%`;

  const recent = lastHitDummy();
  els.dummyHp.style.width = `${recent ? recent.hp : 0}%`;
  els.dummyCount.textContent = `더미 ${state.dummies.length}개`;

  const over = isOvercharged();
  els.passiveSlot.classList.toggle("active", over);
  els.passiveDur.textContent = over ? `${Math.ceil(state.overTime)}` : "";
}

function renderCast() {
  const cast = activeCast();
  if (cast) {
    els.castPanel.classList.add("show");
    els.castName.textContent = cast.label;
    els.castFill.style.width = `${(1 - cast.remaining / cast.duration) * 100}%`;
    return;
  }
  if (isWCharging()) {
    const ratio = clamp((nowSeconds() - state.wStart) / skillDefs.W.chargeTime, 0, 1);
    els.castPanel.classList.add("show");
    els.castName.textContent = `전하 소산 충전 ${Math.round(ratio * 100)}%`;
    els.castFill.style.width = `${ratio * 100}%`;
    return;
  }
  els.castPanel.classList.remove("show");
  els.castFill.style.width = "0%";
  els.castName.textContent = "";
}

function keyLabel(code) {
  if (!code) return "-";
  if (code === "Space") return "Space";
  return code.replace(/^Key/, "").replace(/^Digit/, "").replace(/^Arrow/, "");
}

function renderKeybinds() {
  const actions = ["Q", "W", "E", "R", "D", "F", "A"];
  els.keybinds.innerHTML = actions.map((a) => {
    const listening = state.rebinding === a;
    return `<button class="keybind ${listening ? "listening" : ""}" data-action="${a}">${a}<b>${listening ? "..." : keyLabel(state.keybinds[a])}</b></button>`;
  }).join("");
}

function renderSkills() {
  els.skillSlots.forEach((button) => {
    const key = button.dataset.key;
    const cd = cooldownOf(key);
    button.classList.toggle("cooling", cd > 0.05);
    button.classList.toggle("recast", state.recast[key] > 0);
    button.classList.toggle("over", key === "Q" && isOvercharged());
    button.innerHTML = `
      <img src="${getSkillIcon(key)}" alt="" />
      <span class="key">${key}</span>
      <span class="name">${getSkillName(key)}</span>
      <span class="cool">${cd > 0 ? cd.toFixed(cd > 10 ? 0 : 1) : ""}</span>
    `;
  });
}

function render() {
  renderUnits();
  renderRanges();
  renderPanel();
  renderCast();
  renderSkills();
}

function tick(time) {
  const delta = Math.min(0.05, (time - state.lastTick) / 1000);
  state.lastTick = time;
  updateCast(delta);
  updateTimers(delta);
  updateMovement(delta);
  updateDummies(delta);
  updateCamera(delta);
  applyCamera();
  render();
  requestAnimationFrame(tick);
}

function addDummy(point = null) {
  const base = point || state.cursor;
  const dummy = {
    id: state.nextDummyId++,
    x: clamp(base.x, 6, 94),
    y: clamp(base.y, 6, 94),
    hp: 100,
    vx: Math.random() > 0.5 ? 1 : -1,
    vy: Math.random() > 0.5 ? 0.35 : -0.35,
    seed: Math.random()
  };
  state.dummies.push(dummy);
  state.lastHitDummyId = dummy.id;
}

function resetChampion() {
  state.mode = "normal";
  state.charge = 0;
  state.bullets = 0;
  state.overTime = 0;
  state.hasteTime = 0;
  state.cooldowns = {};
  state.recast = { W: 0, E: 0, R: 0 };
  state.wStart = 0;
  state.markedDummyId = null;
  state.casts = [];
  state.rTarget = null;
  state.rHit = false;
  render();
}

function reset() {
  state.mode = "normal";
  state.charge = 0;
  state.bullets = 0;
  state.overTime = 0;
  state.hasteTime = 0;
  state.cooldowns = {};
  state.recast = { W: 0, E: 0, R: 0 };
  state.wStart = 0;
  state.markedDummyId = null;
  state.lastHitDummyId = 1;
  state.moveTarget = null;
  state.dash = null;
  state.casts = [];
  state.rTarget = null;
  state.rHit = false;
  state.cam = { x: 38, y: 56 };
  state.spaceHeld = false;
  state.aiden = { x: 38, y: 56 };
  state.cursor = { x: 58, y: 50 };
  state.previewSkill = "Q";
  state.nextDummyId = 2;
  state.dummies = [{ id: 1, x: 40, y: 55, hp: 100, vx: 1, vy: 0.35, seed: 0.4 }];
  document.querySelectorAll(".effect, .float-text, .ghost-trail").forEach((el) => el.remove());
  render();
}

els.field.addEventListener("pointermove", (event) => {
  state.cursor = pointFromEvent(event);
  const rect = fieldRect();
  state.pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
});

els.field.addEventListener("pointerdown", (event) => {
  state.cursor = pointFromEvent(event);
  if (state.placingDummy) {
    event.preventDefault();
    addDummy({ ...state.cursor });
    state.placingDummy = false;
    els.field.classList.remove("placing");
    render();
    return;
  }
  if (event.shiftKey) {
    event.preventDefault();
    basicAttack();
    return;
  }
  if (event.button !== 2) return;
  event.preventDefault();
  const onDummy = state.dummies.some((dummy) => distance(state.cursor, dummy) <= 36);
  if (onDummy) basicAttack();
  else moveTo(state.cursor);
});

els.field.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

window.addEventListener("keydown", (event) => {
  if (state.rebinding) {
    event.preventDefault();
    if (event.code !== "Escape") state.keybinds[state.rebinding] = event.code;
    state.rebinding = null;
    renderKeybinds();
    return;
  }
  if (event.code === "Space") {
    event.preventDefault();
    state.spaceHeld = true;
    return;
  }
  const action = Object.keys(state.keybinds).find((a) => state.keybinds[a] === event.code);
  if (!action) return;
  event.preventDefault();
  useSkill(action);
});

window.addEventListener("keyup", (event) => {
  if (event.code === "Space") state.spaceHeld = false;
});

els.skillSlots.forEach((button) => {
  button.addEventListener("click", () => useSkill(button.dataset.key));
  button.addEventListener("mouseenter", () => {
    state.previewSkill = button.dataset.key;
    renderRanges();
  });
});

els.healBtn.addEventListener("click", () => {
  state.dummies.forEach((dummy) => { dummy.hp = 100; });
  state.markedDummyId = null;
  render();
});
els.addDummyBtn.addEventListener("click", () => {
  state.placingDummy = true;
  els.field.classList.add("placing");
});
els.champResetBtn.addEventListener("click", resetChampion);
els.alexMode.addEventListener("change", () => {
  els.alexLabel.textContent = els.alexMode.checked ? "포기하시는겁니까?" : "미안해.. 알렉스";
});
els.keybinds.addEventListener("click", (event) => {
  const btn = event.target.closest(".keybind");
  if (!btn) return;
  state.rebinding = btn.dataset.action;
  renderKeybinds();
});
els.fullChargeBtn.addEventListener("click", () => {
  const before = state.charge;
  state.charge = MAX_CHARGE;
  resetECooldownOnFullCharge(before);
  render();
});
els.clearCooldownBtn.addEventListener("click", () => {
  state.cooldowns = {};
  render();
});
els.cooldownResetMode.addEventListener("change", () => {
  if (els.cooldownResetMode.checked) state.cooldowns = {};
  render();
});

renderKeybinds();
reset();
requestAnimationFrame(tick);
