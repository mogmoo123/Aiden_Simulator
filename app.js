const MAX_CHARGE = 5;
const DUMMY_HIT_RADIUS = 24;    // 더미 히트박스 반경(px) ≈ 더미 시각 크기(54×58)의 0.9배(가로 절반 27px × 0.9)
const OVERCHARGE_TIME = 7;      // 과전하 지속시간(초)
const CHARGE_DURATION = 5;      // 전하 지속시간(초). 전하 획득 시마다 초기화, 만료 시 전하 소멸
const POST_HASTE_TIME = 2;
const POST_E2_HASTE_TIME = 2; // 백스텝(E1) 사용 후 이속 +20% 지속시간(초)
const W_HOLD_FULL = 1.5; // W 완충 후 바가 가득 찬 상태로 유지되다 자동 방출되기까지의 시간(초)
const WORLD_SCALE = 10;
const ATTACK_RATE = { melee: 1.5, ranged: 1.35 };

const RANGE = {
  Q_NORMAL: 168,
  Q_OVER: 470,
  W: 190,
  E1: 242,
  E2: 484,
  R: 150,
  D_DASH: 185,
  ATTACK_MELEE: 152,
  ATTACK_OVER: 420,
  F: 225
};

// 1m = E1 사거리 / 6.5. 이하 미터 기준 수치를 px로 환산해 RANGE에 반영.
const M = RANGE.E1 / 6.5;
RANGE.Q_NORMAL = 3.6 * M;   // Q1 사거리 3.6m
RANGE.Q_WIDTH = 0.6 * M;    // Q1 폭 0.6m
RANGE.Q_OVER = 7.5 * M;     // Q2 사거리 7.5m
RANGE.W = 3.25 * M;         // W 반경 3.25m
RANGE.W_RING_INNER = 2.75 * M; // W 전하 소산 링 안쪽 경계
RANGE.W_RING_OUTER = 3.75 * M; // W 전하 소산 링 바깥쪽 경계
RANGE.E_WIDTH = 0.6 * M;    // E1(백스텝 사격) 폭 0.6m
RANGE.E2 = 11 * M;          // E2 재사용 가능 거리 11m
RANGE.R = 2.75 * M;         // 낙뢰 자체 반지름 2.75m
RANGE.R_CAST = 6.5 * M;     // R 사용 사거리 6.5m
RANGE.R_CENTER = 1 * M;     // 낙뢰 중심(CC) 범위 1m
RANGE.ATTACK_MELEE = 2.3 * M; // 근접 평타 사거리 2.3m
RANGE.ATTACK_OVER = 5 * M;     // 원거리 평타 사거리 5m
RANGE.OVERCHARGE = 2.4 * M;    // 근→원거리 폼 전환에 필요한 "주변 적 없음" 범위 2.4m
RANGE.D_DASH = 3 * M;          // D 반격 돌진 거리 3m
RANGE.F = 3 * M;               // F(전술 스킬) 사거리 3m
const E_PROJECTILE_SPEED = 15.5 * M; // E 투사체 속도 15.5m/s (px/s)
const MOVE_SPEED_DEFAULT = 4.08;     // 기본 이동 속도 4.08m/s (UI에서 조절)

const CAST = {
  Q_NORMAL: 0.216,
  Q_OVER: 0.264,
  W_START: 0.12,
  W_RELEASE: 0.2,
  E1: 0.16,
  E2: 0.05,
  R1: 0.34,
  R2: 0.12,
  D: 0.75,
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
    "src/voice/passive/Aiden_skillPassive2_02.wav",
    "src/voice/passive/Aiden_skillPassive3_01.wav",
    "src/voice/passive/Aiden_skillPassive3_02.wav"
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
    "src/voice/E/Aiden_skillE1_01.wav"
  ],
  E2: [
    "src/voice/E/Aiden_skillE1-2_01.wav"
  ],
  R1: [
    "src/voice/R/Aiden_skillR_1_01.wav",
    "src/voice/R/Aiden_skillR_2_01.wav",
    "src/voice/R/Aiden_skillR_3_01.wav"
  ],
  R2: [
    "src/voice/R/Aiden_skillR_1-2_01.wav",
    "src/voice/R/Aiden_skillR_2-2_01.wav",
    "src/voice/R/Aiden_skillR_3-2_01.wav"
  ]
};

const state = {
  mode: "normal",
  charge: 0,
  chargeDecay: 0,
  bullets: 0,
  overTime: 0,
  hasteTime: 0,
  e2HasteTime: 0,
  cooldowns: {},
  recast: { W: 0, E: 0, R: 0 },
  wStart: 0,
  wChargeHudActive: false,
  eDelay: 0,
  eRelock: 0,
  eFreeBackstep: false,
  markedDummyId: null,
  lastHitDummyId: 1,
  moveTarget: null,
  dash: null,
  casts: [],
  rTarget: null,
  rHit: false,
  pendingE1Release: null,
  wVoiceIndex: null,
  rVoiceIndex: null,
  nextBasicAttackAt: 0,
  cam: { x: 38, y: 56 },
  spaceHeld: false,
  pointer: { x: 0, y: 0 },
  placingDummy: false,
  buffer: null,
  shiftHeld: false,
  rebinding: null,
  keybinds: {
    Q: "KeyQ", W: "KeyW", E: "KeyE", R: "KeyR", D: "KeyD", F: "KeyF",
    A: "KeyA", S: "KeyS", COOLDOWN_RESET: "KeyC", CAMERA_LOCK: "KeyY",
    FULLSCREEN: "F11", EXIT_FULLSCREEN: "Escape"
  },
  cursor: { x: 58, y: 50 },
  aiden: { x: 38, y: 56 },
  facing: 0,
  previewSkill: "Q",
  pendingSkill: null,
  showAttackRange: false,
  attackMove: null,
  skillAutoAttackActive: false,
  debugMode: false,
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
  rCastRange: document.getElementById("rCastRange"),
  overchargeRange: document.getElementById("overchargeRange"),
  qRange: document.getElementById("qRange"),
  eRange: document.getElementById("eRange"),
  fRange: document.getElementById("fRange"),
  aRange: document.getElementById("aRange"),
  dummyHp: document.getElementById("dummyHp"),
  dummyCount: document.getElementById("dummyCount"),
  autoFace: document.getElementById("autoFace"),
  rangePreview: document.getElementById("rangePreview"),
  cooldownResetMode: document.getElementById("cooldownResetMode"),
  cooldownResetLabel: document.getElementById("cooldownResetLabel"),
  autoAttackAfterSkill: document.getElementById("autoAttackAfterSkill"),
  openKeybindsBtn: document.getElementById("openKeybindsBtn"),
  keybindModal: document.getElementById("keybindModal"),
  keybindModalClose: document.getElementById("keybindModalClose"),
  dummyMoveMode: document.getElementById("dummyMoveMode"),
  cameraShakeMode: document.getElementById("cameraShakeMode"),
  voiceMode: document.getElementById("voiceMode"),
  alexMode: document.getElementById("alexMode"),
  alexLabel: document.getElementById("alexLabel"),
  cameraLock: document.getElementById("cameraLock"),
  cameraLockLabel: document.getElementById("cameraLockLabel"),
  healBtn: document.getElementById("healBtn"),
  addDummyBtn: document.getElementById("addDummyBtn"),
  champResetBtn: document.getElementById("champResetBtn"),
  fullChargeBtn: document.getElementById("fullChargeBtn"),
  castPanel: document.getElementById("castPanel"),
  castName: document.getElementById("castName"),
  castFill: document.getElementById("castFill"),
  wCastPanel: document.getElementById("wCastPanel"),
  wCastName: document.getElementById("wCastName"),
  wCastFill: document.getElementById("wCastFill"),
  passiveSlot: document.getElementById("passiveSlot"),
  passiveDur: document.getElementById("passiveDur"),
  charStacks: document.getElementById("charStacks"),
  debug: document.getElementById("debug"),
  speedReadout: document.getElementById("speedReadout"),
  cooldownDebug: document.getElementById("cooldownDebug"),
  skillLog: document.getElementById("skillLog"),
  camSens: document.getElementById("camSens"),
  moveSpeed: document.getElementById("moveSpeed"),
  attackSpeed: document.getElementById("attackSpeed"),
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

// 이동 속도: UI 입력값(m/s)을 읽어 월드 px/s로 환산. 미설정 시 기본값.
function moveSpeedMps() {
  const v = parseFloat(els.moveSpeed.value);
  return Number.isFinite(v) && v > 0 ? v : MOVE_SPEED_DEFAULT;
}

// 공격 속도(회/초): UI 입력값. 미설정 시 근접 기본값. 평타 쿨다운 = 1 / 공격속도.
function attackSpeed() {
  const v = parseFloat(els.attackSpeed.value);
  return Number.isFinite(v) && v > 0 ? v : ATTACK_RATE.melee;
}


// 현재 실효 이동 속도(m/s) — 기본값에 W 차징 슬로우·패시브 가속·백스텝 가속을 곱한 값.
function effectiveMoveSpeedMps() {
  const slowed = state.recast.W > 0 && state.wStart > 0 ? 0.8 : 1;
  const hasted = state.hasteTime > 0 ? 1.13 : 1;
  const e2Haste = state.e2HasteTime > 0 ? 1.2 : 1;
  return moveSpeedMps() * slowed * hasted * e2Haste;
}

// ===== 조작감 설정 (control.md 로더) =====
const CONTROL_DEFAULTS = {
  movement: { moveSpeed: 151.9, arrivalRadius: 4, turnInstantlyOnMoveCommand: true, stopOnSkillCast: true },
  camera: { followPlayer: true, smoothFollow: false, followLerp: 0.15, zoom: 1.5 },
  input: {
    defaultCastMode: "quickCast", moveCommandButton: "right", attackOrConfirmButton: "left",
    cancelSkillOnRightClick: true, rightClickDuringAimingAlsoMoves: true,
    inputBufferTime: 0.18, skillBufferTime: 0.2, movementBufferTime: 0.12, targetClickRadius: 22
  },
  skillCommon: { clampAimToRange: true, faceMouseOnCast: false, showRangeIndicator: true, showHitboxDebug: false, allowSkillQueueDuringRecovery: true },
  skills: {},
  debug: { showMouseWorldPosition: false, showDestination: false, showFacingDirection: false, showSkillRange: false, showSkillHitbox: false, showStateText: false }
};

const CFG = JSON.parse(JSON.stringify(CONTROL_DEFAULTS));

function mergeConfig(target, src) {
  Object.keys(src).forEach((k) => {
    const val = src[k];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      if (!target[k] || typeof target[k] !== "object") target[k] = {};
      mergeConfig(target[k], val);
    } else {
      target[k] = val;
    }
  });
  return target;
}

function validateConfig() {
  const warn = (m) => console.warn("[control] 설정 경고:", m);
  if (!(CFG.movement.moveSpeed > 0)) warn("movement.moveSpeed는 0보다 커야 합니다");
  if (!(CFG.camera.zoom > 0)) warn("camera.zoom은 0보다 커야 합니다");
  if (!(CFG.camera.followLerp > 0 && CFG.camera.followLerp <= 1)) warn("camera.followLerp는 0~1 범위여야 합니다");
  ["inputBufferTime", "skillBufferTime", "movementBufferTime"].forEach((k) => {
    if (!(CFG.input[k] >= 0)) warn(`input.${k}는 0 이상이어야 합니다`);
  });
}

function applyConfig() {
  CAMERA.zoom = CFG.camera.zoom;
  // control.md의 moveSpeed(px)를 m/s로 환산해 이동속도 입력의 시작값으로 사용(이후 UI가 우선).
  if (els.moveSpeed && CFG.movement.moveSpeed > 0) els.moveSpeed.value = (CFG.movement.moveSpeed / M).toFixed(2);
  const sk = CFG.skills || {};
  Object.keys(sk).forEach((k) => {
    const cd = sk[k] && sk[k].cooldown;
    if (cd == null || !skillDefs[k]) return;
    if (k === "Q") {
      skillDefs.Q.cooldownNormal = cd;
      skillDefs.Q.cooldownOver = cd;
    } else {
      skillDefs[k].cooldown = cd;
    }
  });
}

async function loadControlConfig() {
  try {
    const res = await fetch("control.md", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const blocks = [...text.matchAll(/```json\s*([\s\S]*?)```/g)];
    const jsonText = blocks.map((b) => b[1].trim()).find((t) => t.startsWith("{"));
    if (!jsonText) throw new Error("json 코드블록(내용이 { 로 시작)을 찾지 못했습니다");
    const parsed = JSON.parse(jsonText);
    mergeConfig(CFG, parsed);
    validateConfig();
    applyConfig();
    console.info("[control] control.md 적용 완료", CFG);
  } catch (e) {
    console.warn("[control] control.md 로드/파싱 실패 — 기본값 사용:", e.message);
  }
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
  const follow = CFG.camera.followPlayer && (els.cameraLock.checked || state.spaceHeld);
  if (follow) {
    if (CFG.camera.smoothFollow) {
      state.cam.x += (state.aiden.x - state.cam.x) * CFG.camera.followLerp;
      state.cam.y += (state.aiden.y - state.cam.y) * CFG.camera.followLerp;
    } else {
      state.cam.x = state.aiden.x;
      state.cam.y = state.aiden.y;
    }
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
    .filter((dummy) => pointSegmentDistancePx(dummy, start, end) <= radius + DUMMY_HIT_RADIUS)
    .sort((a, b) => distance(start, a) - distance(start, b));
}

function circleHitDummies(center, radius) {
  return state.dummies
    .filter((dummy) => distance(center, dummy) <= radius + DUMMY_HIT_RADIUS)
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
    return len <= range + DUMMY_HIT_RADIUS && angle <= widthDegrees / 2;
  }).sort((a, b) => distance(state.aiden, a) - distance(state.aiden, b));
}

function enemyNearby() {
  return state.dummies.some((dummy) => distance(state.aiden, dummy) <= RANGE.OVERCHARGE);
}

const MASTER_AUDIO_GAIN = 0.5;
const W_CROSSFADE_MS = 160;
const R_CROSSFADE_MS = 160;
const WALKING_FADE_TIME = 0.12;
const OVERCHARGE_LOOP_CROSSFADE = 0.25;
let activeVoice = null;
let walkingAudio = null;
let walkingPlayPending = false;
let overchargeLoopState = null;
const activeSkillSounds = new Set();
const activeSkillSoundChannels = new Map();

function playVoice(group, fixedIndex = null) {
  if (!els.voiceMode.checked) return;
  if (activeVoice) return;
  const list = voices[group];
  if (!list || !list.length) return;
  const index = Number.isInteger(fixedIndex)
    ? ((fixedIndex % list.length) + list.length) % list.length
    : Math.floor(Math.random() * list.length);
  const src = list[index];
  const audio = new Audio(src);
  audio.volume = 0.72 * MASTER_AUDIO_GAIN;
  activeVoice = audio;
  audio.addEventListener("ended", () => {
    if (activeVoice === audio) activeVoice = null;
  });
  audio.play().catch(() => {
    if (activeVoice === audio) activeVoice = null;
  });
}

function stopSkillSound(channel) {
  const audio = activeSkillSoundChannels.get(channel);
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
  activeSkillSoundChannels.delete(channel);
  activeSkillSounds.delete(audio);
}

function playSkillSound(src, volume = 0.8, channel = null, options = {}) {
  if (channel) stopSkillSound(channel);
  const audio = new Audio(src);
  audio.volume = Math.min(1, volume * MASTER_AUDIO_GAIN);
  audio.loop = Boolean(options.loop);
  activeSkillSounds.add(audio);
  if (channel) activeSkillSoundChannels.set(channel, audio);
  const cleanup = () => {
    activeSkillSounds.delete(audio);
    if (channel && activeSkillSoundChannels.get(channel) === audio) activeSkillSoundChannels.delete(channel);
  };
  audio.addEventListener("ended", cleanup, { once: true });
  audio.addEventListener("error", cleanup, { once: true });
  audio.play().catch(cleanup);
}

function stopOverchargeLoop() {
  if (!overchargeLoopState) return;
  cancelAnimationFrame(overchargeLoopState.rafId);
  overchargeLoopState.tracks.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
  overchargeLoopState = null;
}

function startOverchargeLoop() {
  if (overchargeLoopState) return;
  stopSkillSound("P");
  const targetVolume = 0.8 * MASTER_AUDIO_GAIN;
  const tracks = [0, 1].map(() => {
    const audio = new Audio("src/sound/P_과전하.mp3");
    audio.preload = "auto";
    audio.volume = 0;
    return audio;
  });
  const loopState = {
    tracks,
    activeIndex: 0,
    transition: null,
    pendingNext: false,
    rafId: 0
  };
  overchargeLoopState = loopState;
  tracks[0].volume = targetVolume;
  tracks[0].play().catch(() => {
    if (overchargeLoopState === loopState) stopOverchargeLoop();
  });

  const frame = (time) => {
    if (overchargeLoopState !== loopState) return;
    const current = tracks[loopState.activeIndex];
    if (!loopState.transition && !loopState.pendingNext && Number.isFinite(current.duration)
      && current.duration > OVERCHARGE_LOOP_CROSSFADE
      && current.duration - current.currentTime <= OVERCHARGE_LOOP_CROSSFADE) {
      const nextIndex = 1 - loopState.activeIndex;
      const next = tracks[nextIndex];
      next.currentTime = 0;
      next.volume = 0;
      loopState.pendingNext = true;
      next.play().then(() => {
        if (overchargeLoopState !== loopState) {
          next.pause();
          return;
        }
        loopState.pendingNext = false;
        loopState.transition = { from: current, to: next, nextIndex, startedAt: performance.now() };
      }).catch(() => {
        loopState.pendingNext = false;
        current.loop = true;
      });
    }

    if (loopState.transition) {
      const progress = clamp(
        (time - loopState.transition.startedAt) / (OVERCHARGE_LOOP_CROSSFADE * 1000),
        0,
        1
      );
      loopState.transition.from.volume = targetVolume * (1 - progress);
      loopState.transition.to.volume = targetVolume * progress;
      if (progress >= 1) {
        loopState.transition.from.pause();
        loopState.transition.from.currentTime = 0;
        loopState.activeIndex = loopState.transition.nextIndex;
        loopState.transition = null;
      }
    }
    loopState.rafId = requestAnimationFrame(frame);
  };
  loopState.rafId = requestAnimationFrame(frame);
}

function updateWalkingSound(isWalking, delta) {
  if (!walkingAudio && !isWalking) return;
  if (!walkingAudio) {
    walkingAudio = new Audio("src/sound/걷기.mp3");
    walkingAudio.preload = "auto";
    walkingAudio.loop = true;
    walkingAudio.volume = 0;
  }

  const targetVolume = isWalking ? 0.8 * MASTER_AUDIO_GAIN : 0;
  if (isWalking && walkingAudio.paused && !walkingPlayPending) {
    walkingPlayPending = true;
    walkingAudio.play().catch(() => {}).finally(() => { walkingPlayPending = false; });
  }

  const fadeStep = (0.8 * MASTER_AUDIO_GAIN) * delta / WALKING_FADE_TIME;
  if (walkingAudio.volume < targetVolume) {
    walkingAudio.volume = Math.min(targetVolume, walkingAudio.volume + fadeStep);
  } else if (walkingAudio.volume > targetVolume) {
    walkingAudio.volume = Math.max(targetVolume, walkingAudio.volume - fadeStep);
  }

  if (!isWalking && walkingAudio.volume <= 0.001 && !walkingAudio.paused) {
    // 재개 시 동일 구간을 이어서 재생해 짧은 이동마다 같은 첫 음이 반복되지 않게 한다.
    walkingAudio.pause();
  }
}

function resetWalkingSound() {
  if (!walkingAudio) return;
  walkingAudio.pause();
  walkingAudio.currentTime = 0;
  walkingAudio.volume = 0;
}

function crossfadeSkillSound(channel, src, volume = 0.8, durationMs = 160) {
  const previous = activeSkillSoundChannels.get(channel) || null;
  const previousVolume = previous ? previous.volume : 0;
  const audio = new Audio(src);
  const targetVolume = Math.min(1, volume * MASTER_AUDIO_GAIN);
  audio.volume = 0;
  activeSkillSounds.add(audio);
  activeSkillSoundChannels.set(channel, audio);
  const cleanup = () => {
    activeSkillSounds.delete(audio);
    if (activeSkillSoundChannels.get(channel) === audio) activeSkillSoundChannels.delete(channel);
  };
  audio.addEventListener("ended", cleanup, { once: true });
  audio.addEventListener("error", cleanup, { once: true });
  audio.play().catch(cleanup);

  const startedAt = performance.now();
  const fade = (time) => {
    if (activeSkillSoundChannels.get(channel) !== audio) {
      if (previous) {
        previous.pause();
        activeSkillSounds.delete(previous);
      }
      return;
    }
    const progress = clamp((time - startedAt) / durationMs, 0, 1);
    audio.volume = targetVolume * progress;
    if (previous) previous.volume = previousVolume * (1 - progress);
    if (progress < 1) {
      requestAnimationFrame(fade);
      return;
    }
    if (previous) {
      previous.pause();
      previous.currentTime = 0;
      activeSkillSounds.delete(previous);
    }
  };
  requestAnimationFrame(fade);
}

function shake() {
  if (!els.cameraShakeMode.checked) return;
  els.stage.classList.remove("shake");
  void els.stage.offsetWidth;
  els.stage.classList.add("shake");
}

// 백스텝(E) 초기화: 쿨 0 + (볼트 러시 중이면) E2 사용 후에도 쿨이 다시 걸리지 않도록 플래그.
function resetBackstep() {
  state.cooldowns.E = 0;
  state.eRelock = 0;
  if (state.recast.E > 0) state.eFreeBackstep = true;
}

function resetECooldownOnFullCharge(before) {
  if (before < MAX_CHARGE && state.charge >= MAX_CHARGE) {
    resetBackstep();
    playSkillSound("src/sound/P_돌입.mp3", 0.8, "P");
    floating("백스텝 초기화", state.aiden, "blue");
  }
}

function addCharge(amount, reason = "") {
  if (isOvercharged()) return;
  const before = state.charge;
  state.charge = clamp(state.charge + amount, 0, MAX_CHARGE);
  if (state.charge > before && reason) floating(`전하 +${state.charge - before}`, state.aiden, "blue");
  if (state.charge > 0) state.chargeDecay = CHARGE_DURATION; // 전하 획득 시마다 지속시간 초기화
  resetECooldownOnFullCharge(before);
}

// force=true면 이미 과전하 상태여도 재돌입(탄환·지속시간 재충전). R2 적중 시 사용.
function enterOvercharge(reason = "", force = false) {
  if (!force && (isOvercharged() || state.charge < MAX_CHARGE)) return;
  const changedFromMelee = !isOvercharged();
  state.mode = "overcharged";
  state.bullets = MAX_CHARGE;       // 탄환 충전(재돌입 시 재충전)
  state.overTime = OVERCHARGE_TIME; // 지속시간 갱신
  state.hasteTime = 0;
  // 충전 중이던 W가 과전하로 취소될 때 쿨다운을 적용(쿨 초기화/무료 W 버그 방지)
  if (state.wStart > 0 && cooldownOf("W") <= 0) setCooldown("W");
  if (state.wStart > 0) stopSkillSound("W");
  state.recast.W = 0;
  state.wStart = 0;
  state.wChargeHudActive = false;
  state.wVoiceIndex = null;
  resetBackstep();                  // 과전하 진입 시 백스텝(E) 초기화
  floating(reason || "과전하", state.aiden, "gold");
  startOverchargeLoop();
  // 근접 폼에서 원거리 폼으로 실제 전환될 때만 패시브 음성을 재생한다.
  if (changedFromMelee) playVoice("passive");
  spawnCircle(state.aiden, 170, "fx-circle");
}

function leaveOvercharge() {
  if (!isOvercharged()) return;
  state.mode = "normal";
  state.charge = 0;
  state.bullets = 0;
  state.overTime = 0;
  state.hasteTime = POST_HASTE_TIME;
  stopOverchargeLoop();
  playSkillSound("src/sound/P_종료.mp3", 0.8, "P");
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
  if (state.bullets <= 0) leaveOvercharge(); // 탄환 소진 시 즉시 과전하 종료
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
    // 사용한 폼의 Q 쿨만 새로 시작한다(근거리 Q_NORMAL·원거리 Q_OVER는 서로 독립, 연결 없음).
    // 반대 폼의 쿨은 건드리지 않고, 이미 돌고 있던 쿨은 updateTimers가 폼과 무관하게 계속 감소(내부 진행).
    const cur = currentQCooldownKey();
    const base = cur === "Q_OVER" ? skillDefs.Q.cooldownOver : skillDefs.Q.cooldownNormal;
    state.cooldowns[cur] = base * multiplier;
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
  // 돌진 중에는 일반 스킬 불가. 단 E2·R2 재시전 이동과 충전된 W2 방출은 허용한다.
  const wRecast = key === "W" && isWCharging();
  if (state.dash && !(key === "E" && isERecast()) && !(key === "R" && isRRecast()) && !wRecast) return false;
  // D(빗겨 흘리기) 시전 중에는 R·E 포함 모든 스킬 사용 불가.
  if (isCasting("D") && key !== "D") return false;
  if (isWCharging() && key !== "W" && !(key === "E" && isERecast()) && !(key === "R" && isRRecast())) return false;
  if (key === "E" && isCasting("E")) return false;
  if (key === "E" && state.pendingE1Release) return false;
  if (key === "R" && isCasting("R")) return false;
  if (key !== "E" && !(key === "R" && isRRecast()) && hasBlockingCast()) return false;
  if (key === "A" && nowSeconds() < state.nextBasicAttackAt) return false;
  if (cooldownOf(key) > 0) return false;
  if (key === "E" && state.recast.E > 0 && !markedDummy()) return false;
  if (key === "E" && state.recast.E > 0 && state.eDelay > 0) return false;
  if (key === "E" && state.eRelock > 0) return false;
  if (key === "Q" && isOvercharged() && state.bullets < 1) return false;
  if (key === "A" && isOvercharged() && state.bullets < 1) return false;
  return true;
}

// 좌측 하단 스킬 로그: 최근 항목을 아래에 추가하고 오래된 것은 제거
function logEvent(text, tone = "") {
  if (!els.skillLog) return;
  const line = document.createElement("div");
  line.className = `log-line${tone ? " " + tone : ""}`;
  line.textContent = text;
  els.skillLog.appendChild(line);
  while (els.skillLog.childElementCount > 8) els.skillLog.firstElementChild.remove();
}

function beginCast(label, duration, onComplete, opts = {}) {
  logEvent(`▶ ${label} 시전`, "cast");
  // 시전 시작 시 남아있던 클릭 이동 명령은 취소(재개하지 않음). 단 W(전하 소산)는 이동하며 충전하므로 예외.
  if (opts.skill !== "W") state.moveTarget = null;
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
  dummy.hp = clamp(dummy.hp - amount, 1, 100); // 죽지 않고 체력 최소 1로 고정
  dummy.regenDelay = 1.2;                       // 피격 후 잠깐 뒤부터 자연 회복
  state.lastHitDummyId = dummy.id;
  floating("Hit", dummy, "hit");
  spawnHit(dummy);
  shake();
  logEvent(`✔ ${label || "타격"} 명중 (-${amount})`, "hit");
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

function spawnBullet(start, end, speed) {
  const a = toPx(start);
  const b = toPx(end);
  const dur = speed ? Math.max(0.1, Math.hypot(b.x - a.x, b.y - a.y) / speed) : 0.36;
  const el = document.createElement("div");
  el.className = "effect fx-bullet";
  el.style.left = `${a.x}px`;
  el.style.top = `${a.y}px`;
  el.style.setProperty("--bx", `${b.x - a.x}px`);
  el.style.setProperty("--by", `${b.y - a.y}px`);
  el.style.animationDuration = `${dur}s`;
  els.world.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000 + 50);
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

function dashTo(point, duration = 0.18, linear = false, tag = null) {
  state.moveTarget = null;
  state.dash = { from: { ...state.aiden }, to: clampPoint(point, 6), elapsed: 0, duration, linear, tag };
  addTrail(state.aiden);
}

function teleportTo(point) {
  state.moveTarget = null;
  state.dash = null;
  addTrail(state.aiden);
  state.aiden = clampPoint(point, 6);
  addTrail(state.aiden);
}

function moveTo(point) {
  state.showAttackRange = false; // 땅을 클릭해 이동하면 평타 사거리 표시 해제
  state.attackMove = null;       // 명시적 이동 명령은 추격 취소
  state.skillAutoAttackActive = false;
  state.moveTarget = clampPoint(point, 6);
  if (CFG.movement.turnInstantlyOnMoveCommand) state.facing = direction(state.aiden, state.moveTarget).angle;
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
  const overcharged = isOvercharged();
  const range = overcharged ? RANGE.ATTACK_OVER : RANGE.ATTACK_MELEE;
  // 시전 시작 시점에 사거리 내 최근접 더미를 대상으로 고정. 사거리 밖이면 평타가 나가지 않음.
  const target = state.dummies
    .filter((dummy) => distance(state.aiden, dummy) <= range)
    .sort((a, b) => distance(state.aiden, a) - distance(state.aiden, b))[0] || null;
  if (!target) {
    state.skillAutoAttackActive = false;
    return;
  }
  const dir = direction(state.aiden, target);
  state.facing = dir.angle;
  const attackInterval = 1 / attackSpeed();
  state.nextBasicAttackAt = nowSeconds() + attackInterval;
  state.cooldowns.A = attackInterval;
  beginCast(getSkillName("A"), CAST.A, () => {
    if (overcharged) {
      if (!consumeBullet(1)) return;
      spawnBullet(state.aiden, target);
      damageDummy(target, 8, "치명 원거리");
    } else {
      spawnSlash(dir.angle);
      // 근접 평타는 투사체 없이 공격 프레임에 즉시 적중하는 히트스캔 판정이다.
      damageDummy(target, 5, "평타");
    }
    playSkillSound(overcharged ? "src/sound/평타_원거리.mp3" : "src/sound/타격.mov");
    // 평타 적중당 현재 모드의 Q(근거리=Q_NORMAL / 원거리=Q_OVER) 쿨타임을 1.5초 감소(근·원 Q 쿨 독립)
    const qKey = currentQCooldownKey();
    state.cooldowns[qKey] = Math.max(0, (state.cooldowns[qKey] || 0) - 1.5);
  }, { skill: "A" });
}

// 지정한 Q 폼 키(Q_NORMAL/Q_OVER)에만 쿨 적용(쿨 초기화 모드면 둘 다 0).
function setQCd(key, multiplier = 1) {
  if (els.cooldownResetMode.checked) {
    state.cooldowns.Q_NORMAL = 0;
    state.cooldowns.Q_OVER = 0;
    return;
  }
  const base = key === "Q_OVER" ? skillDefs.Q.cooldownOver : skillDefs.Q.cooldownNormal;
  state.cooldowns[key] = base * multiplier;
}

function useQ() {
  if (!canUse("Q")) return false;
  const dir = direction(); // 시전 시작 시점 방향으로 고정
  state.facing = dir.angle;
  // Q 폼(근/원)을 시전 시작 시점에 고정한다. 시전 중 과전하 진입/종료로 모드가 바뀌어도
  // 시작 시점 폼으로 발동하고, 쿨도 그 폼의 키(Q_NORMAL/Q_OVER)에만 적용된다.
  const ranged = isOvercharged();
  playSkillSound(ranged ? "src/sound/Q_원거리.mp3" : "src/sound/Q_근접.mov");
  beginCast(getSkillName("Q"), ranged ? CAST.Q_OVER : CAST.Q_NORMAL, () => {
    if (ranged) {
      const end = offsetPoint(state.aiden, dir, RANGE.Q_OVER, false);
      const hits = lineHitDummies(state.aiden, end, 34);
      // 적중 시 탄환은 맞은 대상 지점에서 사라진다(끝까지 날아가지 않음)
      spawnBullet(state.aiden, hits[0] ? { x: hits[0].x, y: hits[0].y } : end, E_PROJECTILE_SPEED);
      if (hits[0]) {
        damageDummy(hits[0], 17, "전자포");
        playSkillSound("src/sound/Q_원거리_타격.mov");
      }
      setQCd("Q_OVER", hits[0] ? 0.5 : 1); // 원거리 Q 쿨은 항상 Q_OVER에(적중 시 0.5배)
      consumeBullet(1);
    } else {
      const end = offsetPoint(state.aiden, dir, RANGE.Q_NORMAL, false);
      const hits = lineHitDummies(state.aiden, end, RANGE.Q_WIDTH / 2);
      spawnLine(state.aiden, end, "fx-line", RANGE.Q_WIDTH);
      if (hits[0]) {
        damageDummy(hits[0], 13, "뇌격");
        playSkillSound("src/sound/Q_타격.mov");
        addCharge(2, "Q");
      }
      setQCd("Q_NORMAL", 1); // 근거리 Q 쿨은 항상 Q_NORMAL에
    }
  }, { skill: "Q" });
  return true;
}

function releaseW() {
  logEvent("▶ 소산 방출 시전", "cast"); // W2는 즉발이라 beginCast를 거치지 않음
  playVoice("W2", state.wVoiceIndex);
  state.wVoiceIndex = null;
  crossfadeSkillSound("W", "src/sound/W2.mp3", 0.8, W_CROSSFADE_MS);
  const releasePos = { ...state.aiden };
  const held = clamp(nowSeconds() - state.wStart, 0.15, skillDefs.W.chargeTime);
  const ratio = held / skillDefs.W.chargeTime;
  const fullCharged = ratio >= 0.86;
  spawnCircle(releasePos, RANGE.W * 2, "fx-wcircle");
  spawnAfterimage(releasePos);

  const boundaryHits = [];
  const innerHits = [];
  state.dummies.forEach((dummy) => {
    const dist = distance(releasePos, dummy);
    if (dist > RANGE.W_RING_OUTER) return;
    if (fullCharged && dist >= RANGE.W_RING_INNER) boundaryHits.push(dummy);
    else innerHits.push(dummy);
  });

  boundaryHits.forEach((dummy) => {
    damageDummy(dummy, Math.round(9 + ratio * 13), "전하소산(경계)");
  });
  innerHits.forEach((dummy) => {
    damageDummy(dummy, 12, "전하소산(내부)");
  });
  if (boundaryHits.length > 0 || innerHits.length > 0) addCharge(1, "W");

  if (boundaryHits.length > 0) playSkillSound("src/sound/W_타격.mp3");
  if (innerHits.length > 0) playSkillSound("src/sound/W_안.mp3");

  state.recast.W = 0;
  state.wStart = 0;
  state.wChargeHudActive = false;
  setCooldown("W");
}

function useW() {
  if (!canUse("W")) return false;
  if (state.recast.W <= 0) {
    state.wChargeHudActive = true;
    state.wVoiceIndex = Math.floor(Math.random() * voices.W1.length);
    playSkillSound("src/sound/W1.mp3", 0.8, "W");
    beginCast("전하 소산", CAST.W_START, () => {
      playVoice("W1", state.wVoiceIndex);
      // 충전 0.8초 + 완충 유지 1.5초 = 자동 방출까지의 전체 창
      state.recast.W = skillDefs.W.chargeTime + W_HOLD_FULL;
      state.wStart = nowSeconds();
      spawnCircle(state.aiden, RANGE.W * 2, "fx-circle");
    }, { skill: "W" });
    return true;
  }

  // W2타는 시전시간 없이 즉시 방출
  releaseW();
  return true;
}

function useE() {
  if (!canUse("E")) return false;
  if (state.recast.E > 0) {
    const dir = direction();
    state.facing = dir.angle;
    const target = markedDummy();
    if (!target) return false;
    if (distance(state.aiden, target) > RANGE.E2) {
      floating("볼트 러시 사거리 밖", state.aiden, "gold");
      return false;
    }
    // E2(볼트 러시)는 시전시간 없이 즉시 발동. 대상에게 유도로 날아가 적 뒤까지 이동(접근 방향 = 에이든→대상, 그 연장선으로 1.5m 통과)
    playSkillSound("src/sound/E2.mov");
    playVoice("E2");
    const toTarget = direction(state.aiden, target);
    const through = offsetPoint(target, toTarget, 1.5 * M, true);
    spawnLine(state.aiden, through, "fx-line", 11);
    const flyDur = Math.max(0.1, distance(state.aiden, through) / 1560);
    dashTo(through, flyDur, true, "E2");
    state.eRelock = flyDur * 0.7;
    damageDummy(target, 16, "볼트 러시");
    playSkillSound("src/sound/E_타격.mov");
    addCharge(1, "E");
    state.markedDummyId = null;
    state.recast.E = 0;
    // 볼트 러시 중 백스텝 초기화가 있었다면 쿨 없이 즉시 백스텝 가능(쿨 재적용 안 함)
    if (state.eFreeBackstep) {
      state.cooldowns.E = 0;
      state.eRelock = 0;
      state.eFreeBackstep = false;
    } else {
      setCooldown("E");
    }
    return true;
  }

  const e1AimTarget = { ...state.cursor };
  state.facing = direction(state.aiden, e1AimTarget).angle;
  playSkillSound("src/sound/E1.mov");
  beginCast("백스텝", CAST.E1, () => {
    const bufferedR2 = isCasting("R") && state.buffer?.type === "skill" && state.buffer.key === "R";
    if (bufferedR2) {
      state.pendingE1Release = { aimTarget: e1AimTarget, remaining: 0.5 };
      return;
    }
    releaseE1(e1AimTarget);
  }, { blocking: false, skill: "E" });
  return true;
}

function releaseE1(aimTarget) {
  playVoice("E1");
  // E 입력 좌표는 고정하되, R2 이동 뒤의 새 원점에서 그 좌표를 다시 조준한다.
  const fireDir = direction(state.aiden, aimTarget);
  state.facing = fireDir.angle;
  const bulletEnd = offsetPoint(state.aiden, fireDir, RANGE.E1, false);
  const backPoint = offsetPoint(state.aiden, { x: -fireDir.x, y: -fireDir.y }, 3 * M, true);
  const hits = lineHitDummies(state.aiden, bulletEnd, RANGE.E_WIDTH / 2); // E1 폭 0.6m(반폭 0.3m)
  const bulletStart = offsetPoint(state.aiden, fireDir, 0.5 * M, false);
  let bulletTarget = bulletEnd;
  if (hits[0]) {
    const sPx = toPx(bulletStart);
    const hPx = toPx(hits[0]);
    const proj = clamp((hPx.x - sPx.x) * fireDir.x + (hPx.y - sPx.y) * fireDir.y, 0, RANGE.E1);
    bulletTarget = fromPx({ x: sPx.x + fireDir.x * proj, y: sPx.y + fireDir.y * proj });
  }
  spawnBullet(bulletStart, bulletTarget, E_PROJECTILE_SPEED);
  dashTo(backPoint, 0.18);
  state.e2HasteTime = POST_E2_HASTE_TIME;
  if (hits[0]) {
    damageDummy(hits[0], 7, "백스텝");
    playSkillSound("src/sound/E_타격.mov");
    state.markedDummyId = hits[0].id;
    state.recast.E = skillDefs.E.recast;
    state.eDelay = 0.5;
    addCharge(1, "E");
  }
  if (state.charge >= MAX_CHARGE) enterOvercharge("백스텝 과전하");
  if (!hits[0]) setCooldown("E");
}

function castSecondLightning() {
  if (!state.rTarget) return false;
  spawnCircle(state.rTarget, RANGE.R * 2, "fx-lightning"); // 둥근 번개 파지직
  const outer = circleHitDummies(state.rTarget, RANGE.R);
  const center = circleHitDummies(state.rTarget, RANGE.R_CENTER);
  outer.forEach((dummy) => {                               // 한번 더 낙뢰
    damageDummy(dummy, center.includes(dummy) ? 24 : 18, center.includes(dummy) ? "중심 낙뢰 2타" : "낙뢰 2타");
  });
  if (outer.length > 0) playSkillSound("src/sound/R_타격.mov");
  state.rTarget = null;
  state.rHit = false;
  state.recast.R = 0;
  setCooldown("R");
  return outer.length > 0; // R2 낙뢰가 적에게 맞았는지
}

function useR() {
  if (!canUse("R")) return false;
  if (state.recast.R > 0 && state.rTarget) {
    // R2(낙뢰 이동)는 보간 없이 목표 좌표로 즉시 이동한다.
    crossfadeSkillSound("R", "src/sound/R2.mp3", 0.8, R_CROSSFADE_MS);
    spawnLine(state.aiden, state.rTarget, "fx-line", 9);
    teleportTo(state.rTarget);
    if (state.pendingE1Release) {
      const pendingE1 = state.pendingE1Release;
      state.pendingE1Release = null;
      releaseE1(pendingE1.aimTarget);
    }
    // R2 낙뢰가 적에게 맞으면 과전하 즉시 (재)돌입. 이미 과전하여도 force로 재돌입해
    // 탄환·지속시간이 다시 초기화되고, 과전하 진입의 부수효과로 백스텝(E)도 초기화된다.
    const r2Hit = castSecondLightning();
    if (r2Hit) {
      state.charge = MAX_CHARGE;
      enterOvercharge("낙뢰 과전하", true);
    }
    // 과전하 진입 음성이 R2 대사를 덮지 않도록 모든 R2 처리 뒤 재생한다.
    playVoice("R2", state.rVoiceIndex);
    state.rVoiceIndex = null;
    return true;
  }

  // R 좌표는 시전 즉시(시작 시점) 고정 — 키 누른 순간 커서를 낙하 지점으로(R_CAST 클램프)
  let target = { ...state.cursor };
  if (distance(state.aiden, target) > RANGE.R_CAST) {
    target = offsetPoint(state.aiden, direction(state.aiden, target), RANGE.R_CAST, true);
  }
  state.rVoiceIndex = Math.floor(Math.random() * voices.R1.length);
  playSkillSound("src/sound/R1.mp3", 0.8, "R");
  beginCast("낙뢰", CAST.R1, () => {
    playVoice("R1", state.rVoiceIndex);
    state.rTarget = target;
    spawnCircle(target, RANGE.R * 2, "fx-lightning"); // 둥근 번개
    spawnRZone(target);                               // 장판 생성
    const outer = circleHitDummies(target, RANGE.R);
    const center = circleHitDummies(target, RANGE.R_CENTER);
    outer.forEach((dummy) => {                         // 낙뢰 1개
      damageDummy(dummy, center.includes(dummy) ? 18 : 12, center.includes(dummy) ? "중심 낙뢰" : "낙뢰");
    });
    if (outer.length > 0) playSkillSound("src/sound/R_타격.mov");
    state.rHit = outer.length > 0;
    state.recast.R = skillDefs.R.recast;
  }, { skill: "R" });
  return true;
}

function useD() {
  if (!canUse("D")) return false;
  playSkillSound("src/sound/D.mp3");
  els.aiden.classList.add("parry");
  setTimeout(() => els.aiden.classList.remove("parry"), CAST.D * 1000);
  const dir = direction(); // 시전 시작 시점 방향으로 고정
  state.facing = dir.angle;
  beginCast("빗겨 흘리기", CAST.D, () => {
    const end = offsetPoint(state.aiden, dir, RANGE.D_DASH, true);
    spawnParry(dir);
    spawnLine(state.aiden, end, "fx-line", 11);
    dashTo(end, 0.14);
    const hits = lineHitDummies(state.aiden, end, 48);
    hits.forEach((dummy) => {
      damageDummy(dummy, 14, "반격"); // D는 전하를 쌓지 않음
    });
    if (hits.length > 0) playSkillSound("src/sound/타격.mov");
    setCooldown("D");
  }, { skill: "D" });
  spawnParry(dir);
  return true;
}

function useF() {
  if (!canUse("F")) return false;
  playSkillSound("src/sound/F.mp3");
  const dir = direction(); // 시전 시작 시점 방향으로 고정
  state.facing = dir.angle;
  beginCast("전술 스킬", CAST.F, () => {
    const point = offsetPoint(state.aiden, dir, RANGE.F, true);
    spawnLine(state.aiden, point, "fx-line", 6);
    teleportTo(point);
    setCooldown("F");
  });
  return true;
}

function useSkill(key) {
  if (!skillDefs[key]) return false;
  state.previewSkill = key;
  let used = false;
  if (key === "Q") used = useQ();
  if (key === "W") used = useW();
  if (key === "E") used = useE();
  if (key === "R") used = useR();
  if (key === "D") used = useD();
  if (key === "F") used = useF();
  if (used && els.autoAttackAfterSkill.checked) state.skillAutoAttackActive = true;
  render();
  return used;
}

// 입력을 즉시 실행하거나, 차단 캐스트 중이면 짧게 버퍼에 보관(후딜 입력 살리기)
function cancelCasts() {
  state.casts = state.casts.filter((cast) => !cast.blocking);
}

function requestSkill(key) {
  if (canUse(key)) {
    useSkill(key);
  } else {
    // 빗겨 흘리기(D) 시전 중에는 R2(낙뢰 이동)·E2(볼트 러시)를 선입력(버퍼)하지 않는다.
    if (isCasting("D") && ((key === "E" && isERecast()) || (key === "R" && isRRecast()))) return;
    state.buffer = { type: "skill", key, time: nowSeconds() };
  }
}

function requestMove(point) {
  if (CFG.movement.stopOnSkillCast && hasBlockingCast()) {
    state.buffer = { type: "move", point: { ...point }, time: nowSeconds() };
  } else {
    moveTo(point);
  }
}

function flushBuffer() {
  const b = state.buffer;
  if (!b) return;
  // 차단 캐스트가 진행 중이면(예: R1 0.34초) 버퍼 나이를 리셋해 유지 — 긴 시전 동안 입력이 버려지지 않고, 시전이 끝나면 바로 실행(RW 등 부드럽게).
  if (hasBlockingCast()) b.time = nowSeconds();
  const maxAge = b.type === "skill" ? CFG.input.skillBufferTime : CFG.input.movementBufferTime;
  if (nowSeconds() - b.time > maxAge) {
    state.buffer = null;
    return;
  }
  if (b.type === "skill") {
    if (canUse(b.key)) {
      state.buffer = null;
      useSkill(b.key);
    }
  } else if (!(CFG.movement.stopOnSkillCast && hasBlockingCast())) {
    state.buffer = null;
    moveTo(b.point);
  }
}

function updateCast(delta) {
  if (!state.casts.length) return;
  state.casts.forEach((cast) => { cast.remaining -= delta; });
  const completed = state.casts.filter((cast) => cast.remaining <= 0);
  if (!completed.length) return;
  state.casts = state.casts.filter((cast) => cast.remaining > 0);
  completed.forEach((cast) => cast.onComplete());
}

// 사거리 밖 더미를 우클릭하면 사거리에 들어올 때까지 추격 후 평타
function updateAttackMove() {
  if (state.attackMove == null) return;
  const dummy = state.dummies.find((d) => d.id === state.attackMove);
  if (!dummy) { state.attackMove = null; return; }
  const range = isOvercharged() ? RANGE.ATTACK_OVER : RANGE.ATTACK_MELEE;
  if (distance(state.aiden, dummy) <= range) {
    state.moveTarget = null; // 사거리 진입 → 정지
    if (canUse("A")) {
      basicAttack();
      state.attackMove = null;
    }
    // 평타 쿨/시전 중이면 사거리 안에서 대기(다음 프레임 재시도)
  } else {
    state.moveTarget = clampPoint({ x: dummy.x, y: dummy.y }, 6); // 움직이는 더미도 추적
    state.facing = direction(state.aiden, dummy).angle;
  }
}

function updateSkillAutoAttack() {
  if (!els.autoAttackAfterSkill.checked || !state.skillAutoAttackActive) return;
  if (state.casts.length || state.dash || isWCharging()) return;
  const range = isOvercharged() ? RANGE.ATTACK_OVER : RANGE.ATTACK_MELEE;
  const target = state.dummies
    .filter((dummy) => distance(state.aiden, dummy) <= range)
    .sort((a, b) => distance(state.aiden, a) - distance(state.aiden, b))[0] || null;
  if (!target) {
    state.skillAutoAttackActive = false;
    return;
  }
  if (!canUse("A")) return;
  basicAttack();
}

function updateMovement(delta) {
  if (state.dash) {
    state.dash.elapsed += delta;
    const t = clamp(state.dash.elapsed / state.dash.duration, 0, 1);
    const eased = state.dash.linear ? t : 1 - Math.pow(1 - t, 3);
    state.aiden.x = state.dash.from.x + (state.dash.to.x - state.dash.from.x) * eased;
    state.aiden.y = state.dash.from.y + (state.dash.to.y - state.dash.from.y) * eased;
    if (Math.random() < 0.34) addTrail(state.aiden);
    if (t >= 1) state.dash = null;
    return false;
  }

  // 시전 시간 동안에는 이동 불가. 단 W(전하 소산)는 이동하며 충전하므로 W 캐스트는 정지 대상에서 제외.
  // E 돌진·R2 텔레포트 등 스킬 이동은 위의 state.dash가 먼저 처리하므로 예외.
  if (state.casts.some((c) => c.skill !== "W")) return false;
  if (!state.moveTarget) return false;
  const pos = toPx(state.aiden);
  const target = toPx(state.moveTarget);
  const dx = target.x - pos.x;
  const dy = target.y - pos.y;
  const len = Math.hypot(dx, dy);
  if (len < CFG.movement.arrivalRadius) {
    state.moveTarget = null;
    return false;
  }
  const speed = effectiveMoveSpeedMps() * M; // 실효 이속(m/s) → 월드 px/s
  const step = Math.min(len, speed * delta);
  state.aiden = clampPoint(fromPx({ x: pos.x + dx / len * step, y: pos.y + dy / len * step }), 6);
  return step > 0;
}

const DUMMY_REGEN = 12; // 체력 자연 회복 속도(초당)

function updateDummies(delta) {
  // 피격 후 잠깐 뒤부터 체력이 시간에 따라 자연 회복(최대 100)
  state.dummies.forEach((dummy) => {
    if (dummy.regenDelay > 0) {
      dummy.regenDelay = Math.max(0, dummy.regenDelay - delta);
    } else if (dummy.hp < 100) {
      dummy.hp = clamp(dummy.hp + DUMMY_REGEN * delta, 1, 100);
    }
  });

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
  state.eDelay = Math.max(0, state.eDelay - delta);
  state.eRelock = Math.max(0, state.eRelock - delta);
  state.e2HasteTime = Math.max(0, (state.e2HasteTime || 0) - delta);

  if (state.pendingE1Release) {
    state.pendingE1Release.remaining -= delta;
    if (state.pendingE1Release.remaining <= 0) {
      const pendingE1 = state.pendingE1Release;
      state.pendingE1Release = null;
      releaseE1(pendingE1.aimTarget);
    }
  }

  if (state.recast.W <= 0 && state.wStart > 0 && !hasBlockingCast()) {
    releaseW(); // 완충 유지 시간이 끝나면 시전시간 없이 자동 방출
  }

  if (state.recast.E <= 0 && state.markedDummyId) {
    state.markedDummyId = null;
    state.eFreeBackstep = false; // 볼트 러시 미사용 만료 시 플래그 정리
    setCooldown("E");
  }

  if (state.recast.R <= 0 && state.rTarget && !hasBlockingCast()) {
    castSecondLightning();
    state.rVoiceIndex = null;
  }

  if (state.mode === "overcharged") {
    state.overTime = Math.max(0, state.overTime - delta);
    if (state.overTime <= 0) leaveOvercharge();
  } else {
    state.hasteTime = Math.max(0, state.hasteTime - delta);
    // 전하 지속시간: 획득이 멈춘 채 CHARGE_DURATION 경과하면 전하 소멸
    if (state.charge > 0) {
      state.chargeDecay = Math.max(0, state.chargeDecay - delta);
      if (state.chargeDecay <= 0) {
        state.charge = 0;
        floating("전하 소멸", state.aiden, "gold");
      }
    }
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
  [els.wRange, els.e2Range, els.rRange, els.rCastRange, els.overchargeRange, els.qRange, els.eRange, els.fRange, els.aRange].forEach((el) => el.classList.remove("show"));
  const dir = direction();
  // 사거리 표시 상태에서 스킬 키를 누르는 동안(pendingSkill)에만 해당 스킬 사거리를 표시
  const preview = (els.rangePreview.checked && state.pendingSkill) ? state.pendingSkill : "";

  // 폼 전환 대기(전하 만충·미전환) 중에는 "주변 적 없음" 범위를 파란 원으로 표시. 과전하 진입 시 자동으로 사라짐.
  if (state.charge >= MAX_CHARGE && !isOvercharged()) {
    positionCircle(els.overchargeRange, state.aiden, RANGE.OVERCHARGE);
    els.overchargeRange.classList.add("show");
  }

  if (state.showAttackRange) {
    positionCircle(els.aRange, state.aiden, isOvercharged() ? RANGE.ATTACK_OVER : RANGE.ATTACK_MELEE);
    els.aRange.classList.add("show");
  }

  if (state.wStart > 0 || isCasting("W")) {
    positionCircle(els.wRange, state.aiden, RANGE.W);
    els.wRange.classList.add("show");
  }

  const marked = markedDummy();
  if (marked) {
    positionCircle(els.e2Range, state.aiden, RANGE.E2);
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

  if (preview === "F") {
    positionCircle(els.fRange, state.aiden, RANGE.F);
    els.fRange.classList.add("show");
  }

  if (state.rTarget) {
    positionCircle(els.rRange, state.rTarget, RANGE.R);
    els.rRange.classList.add("show");
  } else if (preview === "R") {
    // R 사용 가능 사거리(에이든 기준 R_CAST 원)와, 그 안으로 클램프된 낙뢰 예상 범위를 함께 표시.
    positionCircle(els.rCastRange, state.aiden, RANGE.R_CAST);
    els.rCastRange.classList.add("show");
    const rp = distance(state.aiden, state.cursor) > RANGE.R_CAST
      ? offsetPoint(state.aiden, direction(state.aiden, state.cursor), RANGE.R_CAST, true)
      : state.cursor;
    positionCircle(els.rRange, rp, RANGE.R);
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
  const aimAttack = state.shiftHeld || state.dummies.some((d) => distance(state.cursor, d) <= CFG.input.targetClickRadius);
  els.cursorRing.classList.toggle("attack", aimAttack);
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
  const recent = lastHitDummy();
  els.dummyHp.style.width = `${recent ? recent.hp : 0}%`;
  els.dummyCount.textContent = `더미 ${state.dummies.length}개`;

  const over = isOvercharged();
  // P 아이콘: 과전하 중엔 과전하 잔여시간, 일반 모드에서 전하가 있으면 전하 지속시간을 표시
  els.passiveSlot.classList.toggle("active", over || state.charge > 0);
  els.passiveDur.textContent = over
    ? `${Math.ceil(state.overTime)}`
    : (state.charge > 0 ? `${Math.ceil(state.chargeDecay)}` : "");

  els.speedReadout.textContent = `이속 ${effectiveMoveSpeedMps().toFixed(2)} m/s`;
}

function renderWCast() {
  if (!state.wChargeHudActive) {
    els.wCastPanel.classList.remove("show");
    els.wCastFill.style.width = "0%";
    els.wCastName.textContent = "";
    return;
  }

  els.wCastPanel.classList.add("show");
  const wStartCast = state.casts.find((item) => item.skill === "W") || null;
  if (wStartCast && state.wStart <= 0) {
    els.wCastName.textContent = wStartCast.label;
    els.wCastFill.style.width = `${(1 - wStartCast.remaining / wStartCast.duration) * 100}%`;
    return;
  }

  const elapsed = nowSeconds() - state.wStart;
  const chargeT = skillDefs.W.chargeTime;
  if (elapsed < chargeT) {
    els.wCastName.textContent = `전하 소산 ${(chargeT - elapsed).toFixed(1)}초`;
    els.wCastFill.style.width = `${clamp(elapsed / chargeT, 0, 1) * 100}%`;
  } else {
    els.wCastName.textContent = `전하 소산 (방출 ${Math.max(0, state.recast.W).toFixed(1)}초)`;
    els.wCastFill.style.width = "100%";
  }
}

function renderCast() {
  renderWCast();
  const cast = activeCast();
  if (cast && cast.skill !== "W") {
    els.castPanel.classList.add("show");
    els.castName.textContent = cast.label;
    els.castFill.style.width = `${(1 - cast.remaining / cast.duration) * 100}%`;
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

function renderCooldownResetLabel() {
  els.cooldownResetLabel.textContent = "쿨타임 초기화";
}

function renderCameraLockLabel() {
  if (els.cameraLockLabel) {
    els.cameraLockLabel.textContent = `카메라 잠금 (${keyLabel(state.keybinds.CAMERA_LOCK)})`;
  }
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    }
  } catch (error) {
    console.warn("전체화면 전환 실패", error);
  }
}

function assignKeybind(action, code) {
  const previousCode = state.keybinds[action];
  const conflict = Object.keys(state.keybinds).find((key) => key !== action && state.keybinds[key] === code);
  if (conflict) state.keybinds[conflict] = previousCode;
  state.keybinds[action] = code;
}

function openKeybindModal() {
  state.rebinding = null;
  state.pendingSkill = null;
  renderKeybinds();
  if (!els.keybindModal.open) els.keybindModal.showModal();
}

function closeKeybindModal() {
  state.rebinding = null;
  renderKeybinds();
  if (els.keybindModal.open) els.keybindModal.close();
}

function renderKeybinds() {
  const actions = [
    ["Q", "Q"], ["W", "W"], ["E", "E"], ["R", "R"],
    ["D", "D"], ["F", "F"], ["A", "A"], ["S", "S"],
    ["COOLDOWN_RESET", "쿨타임 초기화"],
    ["CAMERA_LOCK", "화면 잠금"],
    ["FULLSCREEN", "전체화면 전환"], ["EXIT_FULLSCREEN", "전체화면 종료"]
  ];
  els.keybinds.innerHTML = actions.map(([action, label]) => {
    const listening = state.rebinding === action;
    return `<button class="keybind ${listening ? "listening" : ""}" data-action="${action}">${label}<b>${listening ? "..." : keyLabel(state.keybinds[action])}</b></button>`;
  }).join("");
  renderCooldownResetLabel();
  renderCameraLockLabel();
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

function renderCooldownDebug() {
  if (!state.debugMode) {
    els.cooldownDebug.classList.remove("show");
    return;
  }
  els.cooldownDebug.classList.add("show");
  const cd = (v) => (v > 0.05 ? `${v.toFixed(1)}s` : "준비");
  const c = state.cooldowns;
  const rows = [
    `Q근 ${cd(c.Q_NORMAL || 0)}`,
    `Q원 ${cd(c.Q_OVER || 0)}`,
    `W ${cd(c.W || 0)}`,
    `E ${cd(c.E || 0)}`,
    `R ${cd(c.R || 0)}`,
    `D ${cd(c.D || 0)}`,
    `F ${cd(c.F || 0)}`,
    `평타 ${cd(c.A || 0)}`,
    `재시전 W${(state.recast.W || 0).toFixed(1)} E${(state.recast.E || 0).toFixed(1)} R${(state.recast.R || 0).toFixed(1)}`,
    `전하 ${state.charge} (소산 ${state.chargeDecay.toFixed(1)}s)`,
    `과전하 ${isOvercharged() ? `${state.overTime.toFixed(1)}s · 탄환 ${state.bullets}` : "-"}`
  ];
  els.cooldownDebug.innerHTML = rows.map((r) => `<div>${r}</div>`).join("");
}

function render() {
  renderUnits();
  renderRanges();
  renderPanel();
  renderCast();
  renderSkills();
  renderCooldownDebug();
}

function charStateLabel() {
  if (hasBlockingCast()) return "casting";
  if (isWCharging()) return "charging";
  if (state.dash) return "dashing";
  if (state.moveTarget) return "moving";
  return "idle";
}

function renderDebug() {
  const d = CFG.debug;
  if (!(d.showStateText || d.showMouseWorldPosition || d.showDestination || d.showFacingDirection)) {
    els.debug.style.display = "none";
    return;
  }
  const lines = [];
  if (d.showStateText) lines.push(`state : ${charStateLabel()}`);
  if (d.showMouseWorldPosition) lines.push(`mouse : ${state.cursor.x.toFixed(1)}, ${state.cursor.y.toFixed(1)}`);
  if (d.showDestination) lines.push(`dest  : ${state.moveTarget ? `${state.moveTarget.x.toFixed(1)}, ${state.moveTarget.y.toFixed(1)}` : "-"}`);
  if (d.showFacingDirection) lines.push(`facing: ${Math.round(state.facing)}deg`);
  els.debug.style.display = "block";
  els.debug.textContent = lines.join("\n");
}

function tick(time) {
  const delta = Math.min(0.05, (time - state.lastTick) / 1000);
  state.lastTick = time;
  updateCast(delta);
  updateTimers(delta);
  flushBuffer(delta);
  updateAttackMove();
  updateWalkingSound(updateMovement(delta), delta);
  updateSkillAutoAttack();
  updateDummies(delta);
  updateCamera(delta);
  applyCamera();
  render();
  renderDebug();
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
  stopSkillSound("W");
  stopSkillSound("R");
  stopSkillSound("P");
  stopOverchargeLoop();
  state.mode = "normal";
  state.charge = 0;
  state.bullets = 0;
  state.overTime = 0;
  state.hasteTime = 0;
  state.cooldowns = {};
  state.recast = { W: 0, E: 0, R: 0 };
  state.wStart = 0;
  state.wChargeHudActive = false;
  state.markedDummyId = null;
  state.casts = [];
  state.buffer = null;
  state.skillAutoAttackActive = false;
  state.rTarget = null;
  state.rHit = false;
  state.pendingE1Release = null;
  state.wVoiceIndex = null;
  state.rVoiceIndex = null;
  state.nextBasicAttackAt = 0;
  render();
}

function reset() {
  stopSkillSound("W");
  stopSkillSound("R");
  stopSkillSound("P");
  stopOverchargeLoop();
  resetWalkingSound();
  state.mode = "normal";
  state.charge = 0;
  state.bullets = 0;
  state.overTime = 0;
  state.hasteTime = 0;
  state.cooldowns = {};
  state.recast = { W: 0, E: 0, R: 0 };
  state.wStart = 0;
  state.wChargeHudActive = false;
  state.markedDummyId = null;
  state.lastHitDummyId = 1;
  state.moveTarget = null;
  state.dash = null;
  state.casts = [];
  state.buffer = null;
  state.skillAutoAttackActive = false;
  state.rTarget = null;
  state.rHit = false;
  state.pendingE1Release = null;
  state.wVoiceIndex = null;
  state.rVoiceIndex = null;
  state.nextBasicAttackAt = 0;
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
  state.shiftHeld = event.shiftKey;
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
    state.skillAutoAttackActive = false;
    basicAttack();
    return;
  }
  // A 사거리 표시가 활성화된 동안 사거리 원 내부 좌클릭: 사거리 내 최근접 적에게 즉시 평타
  if (event.button === 0 && state.showAttackRange) {
    event.preventDefault();
    const attackRange = isOvercharged() ? RANGE.ATTACK_OVER : RANGE.ATTACK_MELEE;
    if (distance(state.aiden, state.cursor) <= attackRange) {
      state.skillAutoAttackActive = false;
      state.attackMove = null;
      basicAttack();
    }
    return;
  }
  if (event.button !== 2) return;
  event.preventDefault();
  // 인디케이터 캐스트: 조준 중인 스킬을 우클릭으로 시전(취소는 Esc)
  if (state.pendingSkill) {
    const key = state.pendingSkill;
    state.pendingSkill = null;
    requestSkill(key);
    return;
  }
  // 시전 중 이동/공격 명령으로 시전이 끊기지 않도록 cancelCasts는 호출하지 않는다(시전은 끝까지 진행).
  const range = isOvercharged() ? RANGE.ATTACK_OVER : RANGE.ATTACK_MELEE;
  const clickedDummy = state.dummies
    .filter((dummy) => distance(state.cursor, dummy) <= CFG.input.targetClickRadius)
    .sort((a, b) => distance(state.cursor, a) - distance(state.cursor, b))[0];
  if (clickedDummy) {
    state.skillAutoAttackActive = false;
    if (distance(state.aiden, clickedDummy) <= range) {
      state.attackMove = null;
      basicAttack();
    } else {
      // 사거리 밖 더미 클릭 → 사거리에 들어올 때까지 추격 후 평타
      state.attackMove = clickedDummy.id;
      state.showAttackRange = false;
    }
  } else {
    requestMove(state.cursor); // 빈 곳 클릭 → 이동(추격 취소)
  }
});

els.field.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

window.addEventListener("keydown", (event) => {
  state.shiftHeld = event.shiftKey;
  if (state.rebinding) {
    event.preventDefault();
    event.stopPropagation();
    assignKeybind(state.rebinding, event.code);
    state.rebinding = null;
    renderKeybinds();
    return;
  }
  if (els.keybindModal.open) {
    if (event.code !== "Escape") event.preventDefault();
    return;
  }
  if (event.code === "Space") {
    event.preventDefault();
    state.spaceHeld = true;
    return;
  }
  const action = Object.keys(state.keybinds).find((a) => state.keybinds[a] === event.code);
  if (action === "FULLSCREEN") {
    event.preventDefault();
    if (!event.repeat) toggleFullscreen();
    return;
  }
  if (action === "EXIT_FULLSCREEN" && document.fullscreenElement) {
    event.preventDefault();
    if (!event.repeat) document.exitFullscreen();
    return;
  }
  if (event.code === "Escape" && state.pendingSkill) {
    event.preventDefault();
    state.pendingSkill = null;
    render();
    return;
  }
  if (!action) return;
  event.preventDefault();
  if (action === "EXIT_FULLSCREEN") return;
  if (action === "CAMERA_LOCK") {
    if (!event.repeat) {
      els.cameraLock.checked = !els.cameraLock.checked;
      els.cameraLock.dispatchEvent(new Event("change"));
      logEvent(els.cameraLock.checked ? "카메라 잠금" : "카메라 잠금 해제");
      render();
    }
    return;
  }
  if (action === "S") {
    // S: 진행 중이던 이동 정지(클릭 이동·추격 평타·버퍼된 이동 명령 취소). 돌진 등 스킬 이동은 유지.
    state.moveTarget = null;
    state.attackMove = null;
    state.skillAutoAttackActive = false;
    if (state.buffer && state.buffer.type === "move") state.buffer = null;
    render();
    return;
  }
  if (action === "COOLDOWN_RESET") {
    if (!event.repeat) {
      els.cooldownResetMode.checked = !els.cooldownResetMode.checked;
      els.cooldownResetMode.dispatchEvent(new Event("change"));
    }
    return;
  }
  // A 키: 평타 사거리 표시. 키를 떼도 유지되고, 활성화 중 좌클릭은 최근접 적 공격 이동.
  if (action === "A") {
    state.skillAutoAttackActive = false;
    if (!event.repeat) {
      state.showAttackRange = true;
      render();
    }
    return;
  }
  // 사거리 표시 상태: 키를 누르는 동안만 사거리 표시(조준). 우클릭 또는 키 떼기로 시전. W는 제외(즉시 시전).
  if (els.rangePreview.checked && action !== "W") {
    if (!event.repeat) {
      state.pendingSkill = action;
      state.previewSkill = action;
      render();
    }
    return;
  }
  state.pendingSkill = null;
  requestSkill(action);
});

window.addEventListener("keyup", (event) => {
  state.shiftHeld = event.shiftKey;
  if (event.code === "Space") { state.spaceHeld = false; return; }
  const upAction = Object.keys(state.keybinds).find((a) => state.keybinds[a] === event.code);
  // 사거리 표시 상태: 조준 중인 스킬의 키를 떼면 현재 커서 기준으로 시전
  if (state.pendingSkill) {
    if (upAction && upAction === state.pendingSkill) {
      const key = state.pendingSkill;
      state.pendingSkill = null;
      requestSkill(key);
    }
  }
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
els.openKeybindsBtn.addEventListener("click", openKeybindModal);
els.keybindModalClose.addEventListener("click", closeKeybindModal);
els.keybindModal.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeKeybindModal();
});
els.keybindModal.addEventListener("click", (event) => {
  if (event.target === els.keybindModal) closeKeybindModal();
});
els.keybinds.addEventListener("click", (event) => {
  const btn = event.target.closest(".keybind");
  if (!btn) return;
  state.rebinding = btn.dataset.action;
  renderKeybinds();
});
els.fullChargeBtn.addEventListener("click", () => {
  if (isOvercharged()) {
    state.bullets = MAX_CHARGE;
    state.overTime = OVERCHARGE_TIME;
  } else {
    addCharge(MAX_CHARGE - state.charge);
  }
  render();
});
els.cooldownResetMode.addEventListener("change", () => {
  if (els.cooldownResetMode.checked) {
    const attackCooldown = state.cooldowns.A || 0;
    state.cooldowns = attackCooldown > 0 ? { A: attackCooldown } : {};
  }
  renderCooldownResetLabel();
  render();
});
els.autoAttackAfterSkill.addEventListener("change", () => {
  if (!els.autoAttackAfterSkill.checked) state.skillAutoAttackActive = false;
});

// F12 콘솔에서 디버그(쿨타임 표시)를 켜고 끈다: debug() 토글, debug(true)/debug(false)
window.debug = function (on) {
  state.debugMode = on === undefined ? !state.debugMode : !!on;
  console.log(`[debug] 쿨타임 표시 ${state.debugMode ? "ON" : "OFF"} — debug(true)/debug(false)/debug()`);
  return state.debugMode;
};

renderKeybinds();
loadControlConfig();
reset();
requestAnimationFrame(tick);
console.info("[디버그] 콘솔에서 debug() 입력 시 쿨타임 표시 ON/OFF");
