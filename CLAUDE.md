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

조작: Q/W/E/R/D/F 스킬 키(`state.keybinds`로 **재지정 가능** — 설정의 조작키 버튼 클릭 후 키 입력, `renderKeybinds`) / **우클릭 = 스마트 명령**(더미 위 → 평타, 빈 곳 → 이동), **Shift+클릭 = 강제 평타(이동 안 함)**, 평타는 **사거리 내 최근접 더미를 자동 유도**(`basicAttack`) / **A 키 = 평타 사거리 표시(공격 안 함)** / 좌클릭은 사용 안 함 / 카메라 잠금(기본 켜짐)=캐릭터 추적, 해제 시 화면 가장자리로 마우스 패닝(감도 `#camSens` 기본 50, Space 누르는 동안 일시 고정) / 스킬 슬롯에 마우스 올리면 사거리 미리보기. 음성 대사는 사이드 패널 토글로 끌 수 있다(동시 1개만 재생). 평타·빗겨 흘리기 시전 중(`isCasting("A"/"D")`)에는 캐릭터가 이동을 멈춘다(평타는 오브워킹). 평타 전용 스킬 독 슬롯은 제거됨. 바라보는 방향(`state.facing`)은 이동 명령(`moveTo`) 시 그 이동 방향으로 1회 설정되고 대기 중에는 유지된다(커서를 따라가지 않음). "마우스 방향 보기" 토글(기본 꺼짐)을 켜면 `renderUnits`가 매 프레임 커서 방향으로 갱신한다.

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

### 카메라 (LoL식 원근 + 추적/패닝)
`#world` 레이어에 `perspective + rotateX + scale(zoom) + translate(cam)`을 걸어 지면을 기울이고 확대·이동한다(`CAMERA = { fovDeg:40, depressionDeg:56, zoom:1.5 }`; 틸트 = 90 − 56 = **34°**). **`#field`는 틸트하지 않는 전체 화면 평면**(`inset:0`)으로 입력·측정 기준이며(`fieldRect()`는 항상 #field), 모든 시각 요소·이펙트는 #world에 들어가 함께 변환된다(이펙트는 `els.world.appendChild`).
- **월드 크기**: 맵은 뷰포트의 `WORLD_SCALE`(=10)배다. `toPx/fromPx`가 field%(0~100)를 `WORLD_SCALE × field px`로 매핑하므로 캐릭터가 움직이는 월드가 가로·세로 10배 넓다. RANGE/속도 등 절대 px 값은 그대로라 **화면상 크기는 동일**하고 맵만 넓어진다(전체 횡단 ≈ 10배 시간). 그리드는 10배짜리 `.ground`(`width/height:1000%`) 위에 그리며, **CSS의 1000%와 `WORLD_SCALE`은 반드시 일치**해야 한다.
- 줌+월드 배율로 화면에는 맵의 일부만 보인다. `state.cam`(맵 중심, field%)이 화면 중앙에 오도록 `translate`하며, `applyCamera()`를 **매 프레임(`tick`)** 호출(별도 resize 핸들러 없음).
- **카메라 잠금**(`#cameraLock`, 기본 켜짐): `updateCamera`가 `cam`을 에이든 위치에 맞춰 캐릭터를 화면 중앙에 고정(따라다님). 해제 시 마우스가 화면 가장자리(`state.pointer` 기준 64px 이내)에 닿으면 그 방향으로 패닝. **Space를 누르는 동안**에는 해제 상태여도 일시적으로 캐릭터에 고정(`state.spaceHeld`). `cam`은 `camMargin()=50/zoom`으로 맵 밖이 보이지 않게 클램프.
- 마우스 입력은 `pointFromEvent`가 화면 좌표를 **원근+카메라 평행이동 역투영**해 지면의 논리 %로 되돌린다(`cameraParams()`의 P·tilt·zoom·Ccx·Ccy 사용). 게임 로직(거리/히트/이동)은 평면 좌표 그대로 동작.
- 카메라 각도/시야각/배율은 `CAMERA` 상수(`fovDeg`/`depressionDeg`/`zoom`)만 수정. 엣지 패닝 속도(감도)는 `#camSens` 입력(기본 20, `cameraSensitivity()`)으로 조절.

### 시전 파이프라인
모든 스킬은 즉발이 아니라 `beginCast(label, duration, onComplete, opts)`로 **캐스트 큐(`state.casts` 배열)** 에 쌓이고, `updateCast`가 각 캐스트 시간을 깎아 0이 되면 `onComplete` 콜백이 실제 효과(데미지/대시/이펙트)를 낸다. 조준 방향·대상 지점은 **시전이 끝나는 순간** `onComplete` 안에서 `direction()`/`state.cursor`로 새로 계산한다(시전 시작이 아니라 캐스트 완료 시점의 마우스 기준). 예외: **R1(낙뢰)은 키를 누른 시점의 커서**에 떨어진다(`useR`에서 `beginCast` 전에 `target` 캡처), R2는 R1이 찍어둔 `rTarget`로 고정, D의 즉발 패리 윈드업도 누름 시점 방향(`useD`의 바깥 `dir`).
- **차단(blocking) vs 비차단**: 기본 캐스트는 `blocking:true`라 진행 중 다른 스킬 입력을 막는다(`hasBlockingCast`). **E(백스텝/볼트 러시) 전체와 R2(낙뢰 이동)** 는 `{ blocking:false }`로 시전돼 ① 시전 중에도 다른 스킬을 쓸 수 있고, ② **다른 스킬 시전 중에도 끼워 쓸 수 있다**(진행 중인 스킬은 캐스트 큐에 그대로 유지). `canUse`에서 E와 `key === "R" && isRRecast()`(=R2)를 차단 검사에서 제외. 중복 입력은 `isCasting("E"/"R")`로 차단. 단 W 차징 잠금은 E·R도 재시전(E2/R2)만 허용.
- **W 차징 잠금**: W1 충전이 끝나 홀드 상태(`isWCharging()` = `wStart>0 && recast.W>0`)면 **W 방출·E2(`isERecast()`)·R2(`isRRecast()`)를 제외한** 모든 스킬이 막힌다(차징 중 볼트 러시·낙뢰 이동만 허용, **E1·R1은 불가**).
- 시전 바 UI는 `activeCast()`(가장 최근 blocking 캐스트, 없으면 마지막 캐스트)를 표시한다.

### 자원/모드 시스템
- **일반 모드**: 스킬 명중 시 `addCharge`로 "전하"가 쌓인다(최대 `MAX_CHARGE=5`).
- 전하 5 도달 → 적이 근처에 없으면(`enemyNearby` false) `enterOvercharge`로 **과전하** 진입. 전하가 "탄환"으로 바뀌고 Q·평타가 원거리 변형이 되며, 일부 스킬이 탄환을 소모(`consumeBullet`). **`OVERCHARGE_TIME=10`초 경과 또는 탄환 소진 시** `leaveOvercharge` → 일시 가속(`hasteTime`)(`consumeBullet`이 `bullets<=0`이면 즉시 종료). 스킬 독 우측의 패시브 슬롯(`#passiveSlot`, Aiden_P.png 아이콘)이 과전하 잔여 시간을 표시한다.
- 원거리 Q는 탄환 2개를 소모하지만 **1개만 남아도 사용 가능**(`consumeBullet(Math.min(2, bullets))`). 평타·E의 백스텝 사격도 과전하에서 탄환 발사체가 된다.
- 전하 획득량: 일반 Q(뇌격) 명중 **+2**(`addCharge(2,"Q")`), W는 1타(충전)·2타(방출) 각각 **+1**. (그 외 E·D 명중은 +1.)
- 일반/원거리 Q는 **쿨다운이 독립**이다: `Q_NORMAL`/`Q_OVER` 별도 키로 추적·감소하며 `currentQCooldownKey()`(모드 기준)로 읽는다.
- `isOvercharged()`가 스킬 이름/아이콘/사거리/데미지 분기의 기준점. Q 쿨다운은 모드별로 `Q_NORMAL`/`Q_OVER` 별도 키로 추적된다.

### 재시전(recast) 스킬: W / E / R
`state.recast = {W,E,R}` 타이머가 0보다 크면 두 번째 시전이 가능하다. 각기 다른 패턴:
- **W**: 1차 충전 → 홀드 시간 비율(`ratio`)로 방출 데미지/속박 결정. 타이머 만료 시 `updateTimers`가 자동 방출(`releaseW`).
- **E**: 1차 백스텝이 적중 시 대상에 "표식"(`markedDummyId`) → 2차 "볼트 러시"는 표식 대상으로 돌진. 표식 사라지면 쿨 적용.
- **R**: 1차 낙뢰 위치 지정(`rTarget`) → 2차 그 위치로 순간이동. 미사용 시 `updateTimers`가 자동 2타(`castSecondLightning`).

자동 만료/방출 로직이 `updateTimers`에 모여 있으므로, recast 동작을 바꿀 땐 `use*` 함수와 `updateTimers` 양쪽을 함께 봐야 한다.

### 공격 속도
- 평타 쿨다운 = `1 / 공격속도`. **고정값**(`ATTACK_RATE`): 근접 1.5회/초, 원거리 1.35회/초. `basicAttack`이 모드(`isOvercharged`)에 따라 적용한다. (조절 UI·쿨감 기능은 제거됨.)

### 히트 판정 & 이펙트
- 기하 헬퍼: `lineHitDummies`(직선/투사체), `circleHitDummies`(원형), `coneHitDummies`(부채꼴 — 근접 평타·일반 Q). 전부 픽셀 거리 기준, 거리순 정렬.
- 시각 이펙트는 모두 **임시 DOM 엘리먼트**: `spawnLine/spawnCircle/spawnSlash/spawnBullet/spawnParry/spawnAfterimage/spawnHit/floating/addTrail`가 `.effect`/`.float-text` 엘리먼트를 만들고 `setTimeout`으로 제거. 회전은 CSS 변수 `--fx-transform`로 keyframe에 전달.
- `damageDummy`는 피격 시 `spawnHit`(`.fx-hit`)을 띄운다. W 2타는 **충전량 비례 피해(`9 + ratio*13`, 미충전도 약하게 적용)** 를 반경(`RANGE.W`) 내 **모든 더미**에 주고, **풀차징(`ratio ≥ 0.86`)** 이면 방향 속박 전기장 피해가 추가된다(W·R 모두 `circleHitDummies(...).forEach`로 다중 타격). 충전 진행도는 시전 막대(`renderCast`의 `isWCharging` 분기)로 표시. R 1타는 낙뢰 지점에 잔류 전기장 `spawnRZone`(`.fx-rzone`, 2.4초). 일반 Q(뇌격)·평타도 에이든 몸에서 `spawnBullet`로 발사.
- 에이든 발밑 `#charStacks`(`renderUnits`에서 매 프레임 위치/내용 갱신)에 현재 전하/탄환 스택을 표시. 빗겨 흘리기(D) 사용 시 `#aiden`에 `.parry` 클래스가 0.7초 붙어 흰색 아우라(`@keyframes parryShield`)로 감싼다.
- 에이든 근처 자기 버프 텍스트(전하+1·충전·과전하 등)는 `floating`에서 `point === state.aiden`이면 표시하지 않는다(더미 피해 숫자·표식·속박 등은 유지). "더미 추가" 버튼은 즉시 생성이 아니라 **배치 모드**(`state.placingDummy`)를 켜고 다음 **필드 클릭 위치**에 더미를 생성한다(`.field.placing` 커서=copy). 그 아래 **"실험체 초기화"**(`resetChampion`)는 쿨다운·전하/과전하 등 에이든 전투 상태만 리셋(더미·위치 유지).
- 조작키는 `state.keybinds`(액션→`event.code`)로 매핑하며 설정에서 재지정한다(`state.rebinding`으로 다음 입력 대기, `renderKeybinds`/`#keybinds`). 에이든의 파란 칼날(`.blade`)은 제거하고, 바라보는 방향 표시용 `.facing-mark`("<", #aiden과 함께 회전)를 추가. "미안해.. 알렉스" 토글은 켜지면 라벨이 "포기하시는겁니까?"로 바뀐다(`#alexLabel`).
- `spawnBullet(start,end)`는 에이든 몸(start)에서 목표로 날아가는 탄환 발사체(`--bx/--by`로 이동량 전달). `spawnAfterimage`는 W 2타 사용 위치에 남는 잔상 링(`fx-wghost`).
- 사거리 표시(`renderRanges`)는 **"스킬 사거리 표시" 토글과 무관하게** 다음을 그린다: W 충전 중(`wStart>0`)에는 W 2타 범위 원, R 1타 시전 후(`rTarget` 설정 시)에는 낙뢰 위치 원. 각각 충전 종료·R 해소 시 사라진다. (나머지 Q/E/R 미리보기는 토글에 종속.)
- 데미지는 `damageDummy` 단일 경로(체력 0 → 0.45초 후 100으로 부활).

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
