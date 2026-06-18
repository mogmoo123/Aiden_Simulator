# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

"에이든 전투 시뮬레이터" — LoL(MOBA) 스타일 챔피언 "에이든"의 스킬을 연습하는 단일 화면 웹앱.
연습용 더미를 상대로 Q/W/E/R/D/F + 평타를 시전하며, 전하/과전하 자원 시스템과 스킬 재시전(recast) 메커니즘을 실험할 수 있다. UI 텍스트는 모두 한국어.

빌드 시스템·프레임워크·의존성·테스트·린트가 전혀 없는 순수 바닐라 정적 사이트다. 핵심 코드는 3개 파일뿐:
- `index.html` — DOM 골격(필드, 사이드 패널, 스킬 독). 모든 동적 엘리먼트는 여기 정의된 고정 id를 가짐.
- `app.js` — 전체 엔진(상태, 게임 루프, 스킬 로직, 렌더링). 모듈/번들 없이 전역 스코프 1개 파일.
- `styles.css` — 모든 비주얼. 스킬 이펙트는 `@keyframes` 애니메이션 + `.fx-*` 클래스로 구현.

## 작업 지침

사용자가 기존 코드 전체를 자유롭게 수정/리팩터링/재작성해도 좋다고 명시적으로 승인했다. 더 나은 구조·가독성·기능을 위해 필요하면 `app.js`/`index.html`/`styles.css`를 과감히 고쳐도 된다 — 기존 코드 형태를 보존할 의무는 없다. 단, 동작이 바뀌는 변경은 의도를 명확히 설명하고, 기능 회귀가 없는지 확인할 것.

## 실행 / 개발

빌드 단계가 없다. 로컬 정적 서버로 `index.html`을 열면 끝(이미지·음성이 상대경로 `src/`를 참조하고 `Audio` 재생이 있으므로 `file://` 직접 열기보다 서버 권장):

```powershell
python -m http.server 8000   # 그 후 http://localhost:8000 접속
```

테스트·린트·CI 없음. 검증은 브라우저에서 직접 조작해 확인한다. 데스크톱 전용(`.simulator { min-width: 980px }`).

조작: Q/W/E/R/D/F 스킬 키(`state.keybinds`로 **재지정 가능** — 설정의 조작키 버튼 클릭 후 키 입력, `renderKeybinds`) / **우클릭 = 스마트 명령**(사거리 내 더미 클릭 → 평타 / **사거리 밖 더미 클릭 → 사거리에 들어올 때까지 추격 후 평타**, `state.attackMove`=대상 id, `updateAttackMove` / 빈 곳 → 이동, 이동 명령은 추격 취소), **S 키 = 이동 정지**(진행 중이던 클릭 이동·추격 평타 취소 / `moveTarget`·`attackMove`만 비우고 돌진 등 스킬 이동은 유지). S는 `state.keybinds`의 정식 액션이라 **조작키 변경에서 재지정 가능**(`renderKeybinds`의 actions에 포함), **Shift+클릭 = 강제 평타(이동 안 함)**, 평타는 **사거리 내 최근접 더미를 자동 유도**하고 **사거리 밖이면 시전 자체를 하지 않음**(`basicAttack`이 시작 시 대상 없으면 return) / **A 키 = 평타 사거리 표시(공격 안 함)** — `state.showAttackRange`를 켜며, **키를 떼도 표시가 유지**되고 **이동 명령(`moveTo`) 시 해제**된다(토글과 무관하게 동작). **A를 누른 채(`state.aHeld`) 좌클릭 = 캐릭터에서 가장 가까운 적을 공격**(`attackMove`로 추격 후 평타). / **인디케이터 캐스트**: "스킬 사거리 표시"(`#rangePreview`, **기본 꺼짐**) 상태에서는 스킬 키를 **누르고 있는 동안에만** 그 스킬 사거리가 표시되고(`state.pendingSkill`, 조준만), **우클릭 또는 그 키를 떼는 순간 현재 커서로 시전**(`requestSkill`). 키를 누르지 않으면 사거리는 표시되지 않는다(`renderRanges`의 `preview`가 `pendingSkill` 기준). **W·W2(차징)만 제외**(키 누름 즉시 시전), **A는 인디케이터 캐스트 흐름에서 제외**(위의 고정 표시 전용). 조준 중 Esc = 취소. 토글이 꺼져 있으면 종전대로 키 누름 즉시 시전(quickCast) / 카메라 잠금(기본 켜짐)=캐릭터 추적, 해제 시 화면 가장자리로 마우스 패닝(감도 `#camSens` 기본 50, Space 누르는 동안 일시 고정) / 스킬 슬롯에 마우스 올리면 사거리 미리보기. 음성 대사는 사이드 패널 토글로 끌 수 있다(동시 1개만 재생). **시전 시간 동안에는 이동 불가**: `updateMovement`이 `state.casts.some(c => c.skill !== "W")`(W 외 캐스트 진행 중)이면 클릭 이동을 막는다. **시전이 시작되면(`beginCast`) 남아있던 클릭 이동 명령(`moveTarget`)은 취소**되어 시전 후 재개되지 않는다. **단 W(전하 소산)는 이동하며 충전하므로 예외** — W 캐스트는 이동을 막지도, 이동 명령을 취소하지도 않는다(`beginCast`에서 `opts.skill !== "W"`일 때만 `moveTarget` 비움). 반대로 **시전 중 이동/공격 명령을 내려도 시전은 끊기지 않는다**(`pointerdown`에서 `cancelCasts()`를 호출하지 않음 — `CFG.input.cancelSkillOnRightClick`은 사실상 비활성). **단 E 돌진·R2 텔레포트 같은 스킬 이동(`state.dash`)은 예외**로 `updateMovement` 첫 분기에서 먼저 처리되어 정상 진행(그래서 Q 시전 중 E2 돌진으로 위치를 옮겨 Q가 그 위치에서 나가는 콤보가 가능). W 차징(홀드) 상태는 캐스트가 아니라 별도 상태라 슬로우 이동이 허용된다. 평타 전용 스킬 독 슬롯은 제거됨. 바라보는 방향(`state.facing`)은 이동 명령(`moveTo`) 시 그 이동 방향으로 1회 설정되고 대기 중에는 유지된다(커서를 따라가지 않음). "마우스 방향 보기" 토글(기본 꺼짐)을 켜면 `renderUnits`가 매 프레임 커서 방향으로 갱신한다.

## 아키텍처 (큰 그림)

### 단일 상태 + 고정 루프
`app.js`는 전역 `state` 객체 하나로 모든 게임 상태를 보관하고, `requestAnimationFrame(tick)` 루프가 매 프레임:
`updateCast → updateTimers → updateMovement → updateDummies → render` 순으로 돈다.
`render()`는 매 프레임 전체를 다시 그린다(`renderUnits/renderRanges/renderPanel/renderCast/renderSkills`). 더미 레이어는 `innerHTML` 통째 교체 방식 — 더미 DOM에 직접 상태를 들고 있지 않다.

### 좌표계 — 퍼센트 vs 픽셀 (가장 헷갈리는 지점)
유닛 위치(`state.aiden`, `state.cursor`, 더미)는 **0~100 퍼센트** 필드 좌표로 저장한다.
거리·히트·렌더는 **픽셀**로 계산한다. 변환은 `toPx()/fromPx()`가 `field`의 `getBoundingClientRect()`로 처리.
`RANGE`/`CAST` 상수, 모든 히트 판정, 이펙트 크기는 전부 픽셀 단위다. 새 로직 추가 시 어느 단위로 작업 중인지 반드시 의식할 것.
경계 안전은 `clamp()`/`clampPoint()`로.
- **미터 단위(`M`)**: 게임 밸런스 수치는 "미터"로 정의한다 — `const M = RANGE.E1 / 6.5`(즉 **1m = E1 사거리 ÷ 6.5**). `RANGE` 리터럴 직후에서 각 사거리를 `<m> * M`로 재할당한다(Q1 3.6m·폭 0.6m, Q2 7.5m, W 3.25m, E2 11m, 낙뢰 반지름 `R` 2.75m·사용 사거리 `R_CAST` 6.5m·중심 CC `R_CENTER` 1m, 평타 근접 `ATTACK_MELEE` 1.65m·원거리 `ATTACK_OVER` 5m, 폼 전환 `OVERCHARGE` 2.4m). 투사체 속도 `E_PROJECTILE_SPEED = 15.5 * M`(px/s), 이동속도 기본 `MOVE_SPEED_DEFAULT = 4.08`(m/s). **E1(=242px)만 단위 기준**이라 그대로 두고, E1을 바꾸면 나머지가 비례해 따라온다.

### 카메라 (LoL식 원근 + 추적/패닝)
`#world` 레이어에 `perspective + rotateX + scale(zoom) + translate(cam)`을 걸어 지면을 기울이고 확대·이동한다(`CAMERA = { fovDeg:40, depressionDeg:56, zoom:1.5 }`; 틸트 = 90 − 56 = **34°**). **`#field`는 틸트하지 않는 전체 화면 평면**(`inset:0`)으로 입력·측정 기준이며(`fieldRect()`는 항상 #field), 모든 시각 요소·이펙트는 #world에 들어가 함께 변환된다(이펙트는 `els.world.appendChild`).
- **월드 크기**: 맵은 뷰포트의 `WORLD_SCALE`(=10)배다. `toPx/fromPx`가 field%(0~100)를 `WORLD_SCALE × field px`로 매핑하므로 캐릭터가 움직이는 월드가 가로·세로 10배 넓다. RANGE/속도 등 절대 px 값은 그대로라 **화면상 크기는 동일**하고 맵만 넓어진다(전체 횡단 ≈ 10배 시간). 그리드는 10배짜리 `.ground`(`width/height:1000%`) 위에 그리며, **CSS의 1000%와 `WORLD_SCALE`은 반드시 일치**해야 한다.
- 줌+월드 배율로 화면에는 맵의 일부만 보인다. `state.cam`(맵 중심, field%)이 화면 중앙에 오도록 `translate`하며, `applyCamera()`를 **매 프레임(`tick`)** 호출(별도 resize 핸들러 없음).
- **카메라 잠금**(`#cameraLock`, 기본 켜짐): `updateCamera`가 `cam`을 에이든 위치에 맞춰 캐릭터를 화면 중앙에 고정(따라다님). 해제 시 마우스가 화면 가장자리(`state.pointer` 기준 64px 이내)에 닿으면 그 방향으로 패닝. **Space를 누르는 동안**에는 해제 상태여도 일시적으로 캐릭터에 고정(`state.spaceHeld`). `cam`은 `camMargin()=50/zoom`으로 맵 밖이 보이지 않게 클램프.
- 마우스 입력은 `pointFromEvent`가 화면 좌표를 **원근+카메라 평행이동 역투영**해 지면의 논리 %로 되돌린다(`cameraParams()`의 P·tilt·zoom·Ccx·Ccy 사용). 게임 로직(거리/히트/이동)은 평면 좌표 그대로 동작.
- 카메라 각도/시야각/배율은 `CAMERA` 상수(`fovDeg`/`depressionDeg`/`zoom`)만 수정. 엣지 패닝 속도(감도)는 `#camSens` 입력(기본 20, `cameraSensitivity()`)으로 조절.

### 조작감 설정 레이어 (control.md)
루트 `control.md`의 ` ```json ``` 블록을 `loadControlConfig()`가 fetch→추출→파싱해 전역 `CFG`에 머지한다(실패 시 `console.warn` + 내장 `CONTROL_DEFAULTS` 폴백; `file://`에선 fetch가 막혀 기본값 사용). `CFG`는 **조작감 레이어만** 제어하고 기존 커스텀 스킬 효과·고유 타이밍은 그대로 둔다.
- **이동**: `CFG.movement.moveSpeed`(px)는 로드 시 `applyConfig`가 m/s로 환산해 옵션의 **이동 속도(m/s) 입력**(`#moveSpeed`)에 채우고, 실제 이동은 `updateMovement`가 `moveSpeedMps() * M`(UI 입력값 우선, 기본 4.08m/s)로 계산한다. `arrivalRadius/turnInstantlyOnMoveCommand/stopOnSkillCast`는 그대로 `updateMovement`/`moveTo`.
- **카메라**: `CFG.camera.zoom/smoothFollow/followLerp/followPlayer` → `applyConfig`(zoom을 `CAMERA`에 반영)/`updateCamera`(smoothFollow면 `cam`을 lerp 추적).
- **입력 버퍼**: 차단 캐스트 중 입력은 `state.buffer`에 **가장 최근 1개**만 보관하고, `flushBuffer`가 가능해지면 실행(`skillBufferTime`/`movementBufferTime` 경과 시 폐기). 진입점은 `requestSkill`(키 입력)·`requestMove`(우클릭 이동) — `useSkill`/`moveTo`를 직접 부르지 말고 이쪽을 쓴다.
- **우클릭 취소**: 현재 **비활성**(시전 중 이동/공격으로 시전이 끊기면 안 되므로 `pointerdown`에서 `cancelCasts()`를 호출하지 않음). `CFG.input.cancelSkillOnRightClick`·`cancelCasts()`는 코드에 남아있지만 미사용.
- **스킬 쿨타임**: `CFG.skills.*.cooldown`을 `applyConfig`가 `skillDefs`에 덮어쓴다(Q는 일반/과전하 동시).
- **디버그**: `CFG.debug.*` → `renderDebug`가 좌상단 `#debug`에 상태(`charStateLabel`)/마우스 월드좌표/목적지/방향 텍스트 표시.
- 제네릭 캐스트 모드(normal/quickCast/indicator)와 per-skill 3단계(castDelay/activeTime/recovery)는 커스텀 스킬(차징·재시전·과전하)과 충돌하므로 **미적용**(현재 quickCast + 고유 타이밍 유지). 튜닝 표는 `control.md` 본문 참조.

### 시전 파이프라인
모든 스킬은 즉발이 아니라 `beginCast(label, duration, onComplete, opts)`로 **캐스트 큐(`state.casts` 배열)** 에 쌓이고, `updateCast`가 각 캐스트 시간을 깎아 0이 되면 `onComplete` 콜백이 실제 효과(데미지/대시/이펙트)를 낸다. **방향·R좌표는 시전 즉시(시작) 고정, 발사 원점은 시전 종료 위치**: ① **방향**과 **R1 낙하 좌표**는 *시전 시작* 시점에 고정 — 각 `use*`가 `beginCast` **전에** `const dir = direction()`(R은 `target`)을 캡처해 `onComplete`에서 그대로 쓴다(시전 중 마우스를 움직여도 안 바뀜, `state.facing`도 그때 설정). ② **몸에서 나가는 스킬(근거리 Q 등)의 발사 원점은 *시전 종료* 시점의 캐릭터 위치** — 효과는 `onComplete`에서 **실시간 `state.aiden`** 기준으로 나가므로, 시전시간 동안 이동하면 **이동한 위치에서 고정 방향으로** 발사된다(`offsetPoint(state.aiden, dir, ...)`; Q 등은 blocking이라도 시전 전부터 이동 중이면 윈드업 동안 계속 이동, A/D만 시전 중 정지). R2는 `rTarget`로 고정. **E2(볼트 러시)는 대상에게 유도**(`direction(state.aiden, target)`)로 날아가 **적 뒤 1.5m**까지 통과한다. 평타는 시작 시점에 대상 더미를 고정.
- **차단(blocking) vs 비차단**: 기본 캐스트는 `blocking:true`라 진행 중 다른 스킬 입력을 막는다(`hasBlockingCast`). **E(백스텝/볼트 러시) 전체와 R2(낙뢰 이동)** 는 `{ blocking:false }`로 시전돼 ① 시전 중에도 다른 스킬을 쓸 수 있고, ② **다른 스킬 시전 중에도 끼워 쓸 수 있다**(진행 중인 스킬은 캐스트 큐에 그대로 유지). `canUse`에서 E와 `key === "R" && isRRecast()`(=R2)를 차단 검사에서 제외. 중복 입력은 `isCasting("E"/"R")`로 차단. 단 W 차징 잠금은 E·R도 재시전(E2/R2)만 허용.
- **돌진(`state.dash`) 중 스킬 제한**: 대시(백스텝/볼트 러시/F/D/R2 텔레포트) 진행 중에는 `canUse`가 일반 스킬을 막는다. **단 재시전 이동(E2 `isERecast`·R2 `isRRecast`)은 예외로 허용**해 콤보(RER/RQR/RWR)가 이어진다(`if (state.dash && !E2 && !R2) return false`).
- **D(빗겨 흘리기) 시전 중에는 R·E 포함 모든 스킬 불가**(`if (isCasting("D") && key !== "D") return false`). 추가로 D 중 **R2·E2는 버퍼(선입력)도 안 됨**(`requestSkill`에서 D 시전 중 `isRRecast`/`isERecast` 입력은 버리고 버퍼 안 함).
- **Q→E2 콤보(시전 중 돌진)**: 캐스트 큐는 여러 스킬을 동시에 진행하므로(차단 Q 시전 중에도 E는 비차단으로 끼워 시전 가능), 근거리 Q를 시전한 직후 E2를 쓰면 Q가 큐에 남아 계속 진행된다. Q가 **돌진 도중에** 완료되려면 E2의 돌진이 Q 완료(`CAST.Q_NORMAL≈0.216s`) 전에 시작돼야 하므로 **`CAST.E2`를 0.05s로 짧게** 둔다(예전 0.2s면 Q가 E2 윈드업 중에 끝나 돌진 전 원위치에서 나갔다). Q는 `onComplete`에서 실시간 `state.aiden`(=돌진으로 이동한 위치)·고정 방향으로 발사된다.
- **W 차징 잠금**: W1 충전이 끝나 홀드 상태(`isWCharging()` = `wStart>0 && recast.W>0`)면 **W 방출·E2(`isERecast()`)·R2(`isRRecast()`)를 제외한** 모든 스킬이 막힌다(차징 중 볼트 러시·낙뢰 이동만 허용, **E1·R1은 불가**).
- 시전 바 UI는 `activeCast()`(가장 최근 blocking 캐스트, 없으면 마지막 캐스트)를 표시한다.

### 자원/모드 시스템
- **일반 모드**: 스킬 명중 시 `addCharge`로 "전하"가 쌓인다(최대 `MAX_CHARGE=5`). 전하는 **지속시간 `CHARGE_DURATION=5`초**로, 획득(`addCharge`)할 때마다 `state.chargeDecay`가 초기화되고, 5초간 추가 획득이 없으면 `updateTimers`(비과전하 분기)가 전하를 0으로 소멸시킨다.
- 전하 5 도달 → 적이 근처에 없으면(`enemyNearby` false, 기준 반경 `RANGE.OVERCHARGE = 2.4m`) `enterOvercharge`로 **과전하** 진입. 전하가 "탄환"으로 바뀌고 Q·평타가 원거리 변형이 되며, 일부 스킬이 탄환을 소모(`consumeBullet`). 전하 만충·미전환(대기) 중에는 `renderRanges`가 그 2.4m 범위를 **파란 원**(`.overcharge-range`/`#overchargeRange`)으로 그리고, 과전하로 전환되면 사라진다. 과전하는 **`OVERCHARGE_TIME=12`초 지속시간 종료** 또는 **탄환 소진**(`consumeBullet`이 `bullets<=0`) 시 `leaveOvercharge` → 일시 가속(`hasteTime`, +13%). 스킬 독 우측의 패시브 슬롯(`#passiveSlot`, Aiden_P.png 아이콘)이 과전하 잔여 시간을 표시한다.
- 원거리 Q는 탄환 2개를 소모하지만 **1개만 남아도 사용 가능**(`consumeBullet(Math.min(2, bullets))`). 평타·E의 백스텝 사격도 과전하에서 탄환 발사체가 된다.
- 전하 획득은 **반드시 적(더미) 명중 시에만** 일어난다(빗맞거나 단순 시전으로는 안 쌓임): 일반 Q(뇌격) 명중 **+2**(`addCharge(2,"Q")`), W 2타(방출)는 **반경 내 명중 시 +1**(`hits.length>0`일 때만), E1 백스텝·E2 볼트 러시 명중 각 **+1**. **W 1타(충전 윈드업)와 D(반격)는 전하를 주지 않는다**.
- 일반/원거리 Q는 **쿨다운이 완전히 독립**이다: `Q_NORMAL`/`Q_OVER` 별도 키로 추적·감소하며 `currentQCooldownKey()`(모드 기준)로 읽는다. 쿨 길이는 `skillDefs.Q.cooldownNormal`/`cooldownOver`(control.md `skills.Q.cooldown`로 덮어씀). **`setCooldown("Q")`는 사용한 폼의 키 하나만 설정**(서로 연결 안 됨)하고, 두 키 모두 `updateTimers`가 폼과 무관하게 감소시키므로 이미 돌던 쿨은 폼 전환 후에도 백그라운드로 계속 진행된다.
- `isOvercharged()`가 스킬 이름/아이콘/사거리/데미지 분기의 기준점. Q 쿨다운은 모드별로 `Q_NORMAL`/`Q_OVER` 별도 키로 추적된다.

### 재시전(recast) 스킬: W / E / R
`state.recast = {W,E,R}` 타이머가 0보다 크면 두 번째 시전이 가능하다. 각기 다른 패턴:
- **W**: 1차 짧은 윈드업(`CAST.W_START`) 후 충전 시작 — `recast.W = chargeTime(0.8s) + W_HOLD_FULL(2.5s) = 3.3s`. **0.8초간 완충**(`ratio = 경과/chargeTime`)되고, 완충 후 **바가 가득 찬 채 2.5초 유지**되다가 타이머 만료(`recast.W<=0`) 시 `updateTimers`가 **시전시간 없이 즉시 자동 방출**(`releaseW`). 충전 중 W를 다시 누르면 즉시 방출(이른 방출은 `ratio`만큼 약함). 시전 바는 충전 중 "전하 소산 X.X초"(남은 충전), 완충 후 "전하 소산 (방출 X.X초)"(자동 방출 카운트다운)로 **초 단위** 표시(`renderCast`의 `isWCharging` 분기). 방출 데미지/속박은 `ratio`로 결정.
- **E**: 1차 백스텝(`CAST.E1` 윈드업, 사용 후 +20% 이속 2초) 적중 시 대상에 "표식"(`markedDummyId`) → 2차 "볼트 러시"는 **시전시간 없이 즉시** 표식 대상에게 **유도로 날아가 적 뒤 1.5m까지 통과**. 표식 사라지면 쿨 적용. E2 준비 창은 `recast.E`(3.6초)로 과전하 중에도 정상 진행되어 만료될 수 있다(`recast.E<=0` 시 표식 해제 + `setCooldown("E")`). 더미는 죽지 않으므로(체력 최소 1) **표식이 더미 사망으로 끊기지 않는다** — 오직 타이머 만료/E2 사용으로만 해제.
- **R**: 1차 낙뢰는 **시전 시작(키 누른) 시점 커서**에 지정(`rTarget`, `R_CAST` 클램프) → 2차는 **시전시간 없이 즉시** 그 위치로 순간이동(텔레포트 `dashTo` 0.05초). **R2를 시전해 낙뢰가 적에게 맞으면 과전하 즉시 (재)돌입**(`castSecondLightning()`이 적중 여부 반환 → 적중 시 `enterOvercharge("낙뢰 과전하", true)`) — 이미 과전하여도 `force`로 재돌입해 탄환·지속시간이 재충전되고, 과전하 진입의 부수효과로 백스텝(E)이 초기화된다(`enterOvercharge` 내부 `resetBackstep()`). 미사용 시 `updateTimers`가 자동 2타(`castSecondLightning`). **R 위빙 콤보**: R2 직전에 Q/E/W를 섞으면, 그 스킬이 큐에 남아 R2 텔레포트 후 **이동한 위치에서** 발동(RQR/RER/RWR).

자동 만료/방출 로직이 `updateTimers`에 모여 있으므로, recast 동작을 바꿀 땐 `use*` 함수와 `updateTimers` 양쪽을 함께 봐야 한다.

### 공격 속도
- 평타 쿨다운 = `1 / 공격속도`. 공격 속도는 **사이드 패널 "캐릭터 설정"의 `#attackSpeed` 입력(회/초, 기본 1.5)** 으로 실시간 조절(`attackSpeed()`, 근접·원거리 공통). `ATTACK_RATE`는 폴백 기본값.
- 이동 속도도 같은 "캐릭터 설정" 그룹의 `#moveSpeed`(m/s)로 조절(`moveSpeedMps()`).
- `basicAttack`은 **시전 시작 시점**에 사거리(`ATTACK_MELEE`/`ATTACK_OVER`) 내 최근접 더미를 대상으로 고정하고, **대상이 없으면 시전하지 않는다**(사거리 밖 평타 금지).
- 평타 **적중 시 근거리 Q 쿨타임(`Q_NORMAL`)을 1.5초 감소**(근접·원거리 평타 공통).

### 히트 판정 & 이펙트
- 기하 헬퍼: `lineHitDummies`(직선/투사체 — 일반 Q·E·D), `circleHitDummies`(원형 — W·R), `coneHitDummies`(부채꼴, 현재 미사용). 전부 픽셀 거리 기준, 거리순 정렬. 더미는 점이지만 **히트박스 반경 `DUMMY_HIT_RADIUS`(=24px, 더미 시각 크기의 약 0.9배)** 를 스킬 반경에 더해 판정한다(점이 아니라 몸을 맞춤). (일반 Q는 부채꼴이 아니라 **직선 판정**: `lineHitDummies(state.aiden, end, RANGE.Q_WIDTH/2)`.)
- **빔 이펙트 원점**: `spawnLine`은 `start`(보통 `state.aiden`)에 `left`를 두고 길이만큼 오른쪽으로 그린 뒤 회전한다. `.fx-line`은 반드시 `transform-origin: left center`여야 시작점(에이든 몸)을 기준으로 회전한다 — 기본값(center)이면 빔이 **오른쪽으로 치우쳐** 보인다.
- 시각 이펙트는 모두 **임시 DOM 엘리먼트**: `spawnLine/spawnCircle/spawnSlash/spawnBullet/spawnParry/spawnAfterimage/spawnHit/floating/addTrail`가 `.effect`/`.float-text` 엘리먼트를 만들고 `setTimeout`으로 제거. 회전은 CSS 변수 `--fx-transform`로 keyframe에 전달.
- `damageDummy`는 피격 시 `spawnHit`(`.fx-hit`)을 띄운다. W 2타는 **충전량 비례 피해(`9 + ratio*13`, 미충전도 약하게 적용)** 를 반경(`RANGE.W`) 내 **모든 더미**에 주고, **풀차징(`ratio ≥ 0.86`)** 이면 방향 속박 전기장 피해가 추가된다(W·R 모두 `circleHitDummies(...).forEach`로 다중 타격). 충전 진행도는 시전 막대(`renderCast`의 `isWCharging` 분기)로 표시. R는 **2단계 낙뢰**: R1 = 둥근 번개(`spawnCircle(...,"fx-lightning")`) → 잔류 전기장 장판(`spawnRZone`, `.fx-rzone`, 2.4초) → 낙뢰 1타(중심 `R_CENTER` 강타/외곽 `R` 일반), R2(`castSecondLightning`) = 둥근 번개 파지직 + 한 번 더 낙뢰. R1/R2 모두 반경 `RANGE.R`. 일반 Q(뇌격)·평타도 에이든 몸에서 `spawnBullet`로 발사.
- 에이든 발밑 `#charStacks`(`renderUnits`에서 매 프레임 위치/내용 갱신)에 현재 전하/탄환 스택을 표시. 빗겨 흘리기(D) 사용 시 `#aiden`에 `.parry` 클래스가 0.7초 붙어 흰색 아우라(`@keyframes parryShield`)로 감싼다.
- 에이든 근처 자기 버프 텍스트(전하+1·충전·과전하 등)는 `floating`에서 `point === state.aiden`이면 표시하지 않는다(더미 피해 숫자·표식·속박 등은 유지). "더미 추가" 버튼은 즉시 생성이 아니라 **배치 모드**(`state.placingDummy`)를 켜고 다음 **필드 클릭 위치**에 더미를 생성한다(`.field.placing` 커서=copy). 그 아래 **"실험체 초기화"**(`resetChampion`)는 쿨다운·전하/과전하 등 에이든 전투 상태만 리셋(더미·위치 유지).
- 조작키는 `state.keybinds`(액션→`event.code`)로 매핑하며 설정에서 재지정한다(`state.rebinding`으로 다음 입력 대기, `renderKeybinds`/`#keybinds`). 에이든의 파란 칼날(`.blade`)은 제거하고, 바라보는 방향 표시용 `.facing-mark`("<", #aiden과 함께 회전)를 추가. "미안해.. 알렉스" 토글은 켜지면 라벨이 "포기하시는겁니까?"로 바뀐다(`#alexLabel`).
- `spawnBullet(start,end,speed?)`는 에이든 몸(start)에서 목표로 날아가는 탄환 발사체(`--bx/--by`로 이동량 전달). `speed`(px/s)를 주면 거리에 비례해 비행 시간을 잡는다(`dur = dist/speed`); E1 사격은 `E_PROJECTILE_SPEED`로 호출. `spawnAfterimage`는 W 2타 사용 위치에 남는 잔상 링(`fx-wghost`).
- 사거리 표시(`renderRanges`)는 **"스킬 사거리 표시" 토글과 무관하게** 다음을 그린다: 전하 만충·미전환 시 폼 전환 2.4m 파란 원(`#overchargeRange`), W 충전 중(`wStart>0`)에는 W 2타 범위 원, R 1타 시전 후(`rTarget` 설정 시)에는 낙뢰 위치 원. R 조준 미리보기(토글 종속)에서는 **사용 사거리 원**(`#rCastRange`, `RANGE.R_CAST`)과 그 안으로 클램프된 낙뢰 예상 범위를 함께 표시한다. 각각 상태 해소 시 사라진다. 조준 미리보기(토글+`pendingSkill` 종속)는 **Q·E·R·F** 모두 지원한다(F는 `#fRange`, 대시 거리 `RANGE.F`=225px의 직선).
- 데미지는 `damageDummy` 단일 경로. 더미는 **죽지 않고 체력이 최소 1로 고정**(`clamp(hp-amount, 1, 100)`)되며, 사망/부활 로직은 없다(그래서 표식이 사망으로 풀리지 않음). 피격 시 `dummy.regenDelay=1.2`가 찍히고, `updateDummies`가 그 지연 후 **초당 `DUMMY_REGEN`(=12)으로 체력을 자연 회복**(최대 100)시킨다(회복은 더미 이동 토글과 무관하게 매 프레임).

### 데이터 ↔ 자산 매핑
- `skillDefs`가 키→아이콘 경로·쿨다운·이름(일반/과전하/재시전)을 정의. 아이콘은 `src/Aiden_*.png`.
- `voices` 그룹(passive/W1/W2/E1/E2/R)이 `src/voice/<스킬>/*.wav` 목록을 들고, `playVoice(group)`이 랜덤 재생.
- `els` 객체가 모든 DOM 참조를 한 번에 캐싱 — 새 UI 요소는 `index.html`에 id 추가 후 `els`에 등록하는 패턴.
- 에이든 스프라이트는 `src/Aiden_Mini_03.png`([index.html]의 `.aiden-sprite` `img`). (이전의 `aiden_top_sprite.svg`/`.png`는 더 이상 참조하지 않는다.)
- `src/01. Concept ARt/`, `skill effect sample/*.gif` 는 원화·이펙트 레퍼런스 자료(코드 미참조).

## 주의사항

- 입력→상태→렌더가 단방향이라, 즉시 반영이 필요한 핸들러는 명시적으로 `render()`를 호출한다(버튼 클릭 등). 루프가 곧 다시 그리므로 대부분은 생략 가능.
- 사이드 패널 토글(`els.cooldownResetMode`, `cameraShakeMode`, `alexMode` 등)은 DOM 체크박스를 직접 진실의 원천으로 읽는다 — 별도 상태 변수 없음. "미안해.. 알렉스"(`#alexMode`)를 켜면 `renderUnits`가 더미를 `Alex_Mini_00.png`(`.alex-sprite`)로 그린다(`.dummy-core` 대체). "초기화" 버튼은 제거됨(`reset()`은 로드 시 1회만 호출).
- 비주얼 좌표가 `field`의 실제 픽셀 크기에 의존하므로, 창 크기가 바뀌면 다음 프레임에 자연 보정된다(상태는 % 보관).
- `.tools/`는 환경 부산물(yt_dlp 등)로 프로젝트 코드가 아니다. 무시할 것.
