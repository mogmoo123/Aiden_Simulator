# control.md — 조작감 설정

이 파일은 **사람이 직접 수정하는 조작감 설정 파일**입니다.
앱은 실행 시 이 파일을 `fetch`로 읽어 아래 JSON 코드블록(내용이 `{` 로 시작하는 블록)만 추출·파싱해서 적용합니다.
(로컬 `file://`로 열면 fetch가 막혀 파싱에 실패할 수 있으니 정적 서버로 여세요. 실패 시 코드 내장 기본값으로 동작하며 콘솔에 경고가 뜹니다.)

수정 후에는 **브라우저 새로고침**하면 반영됩니다. JSON 코드블록 안에는 주석을 넣지 마세요(파싱 실패함).

```json
{
  "movement": {
    "moveSpeed": 151.9,
    "arrivalRadius": 4,
    "turnInstantlyOnMoveCommand": true,
    "stopOnSkillCast": true
  },
  "camera": {
    "followPlayer": true,
    "smoothFollow": false,
    "followLerp": 0.15,
    "zoom": 1.5
  },
  "input": {
    "defaultCastMode": "quickCast",
    "moveCommandButton": "right",
    "attackOrConfirmButton": "left",
    "cancelSkillOnRightClick": true,
    "rightClickDuringAimingAlsoMoves": true,
    "inputBufferTime": 0.18,
    "skillBufferTime": 0.20,
    "movementBufferTime": 0.12,
    "targetClickRadius": 26
  },
  "skillCommon": {
    "clampAimToRange": true,
    "faceMouseOnCast": false,
    "showRangeIndicator": true,
    "showHitboxDebug": false,
    "allowSkillQueueDuringRecovery": true
  },
  "skills": {
    "Q": { "cooldown": 3.0 },
    "W": { "cooldown": 11.0 },
    "E": { "cooldown": 12.0 },
    "R": { "cooldown": 60.0 },
    "D": { "cooldown": 14.0 },
    "F": { "cooldown": 18.0 }
  },
  "debug": {
    "showMouseWorldPosition": false,
    "showDestination": false,
    "showFacingDirection": false,
    "showSkillRange": false,
    "showSkillHitbox": false,
    "showStateText": false
  }
}
```

## 동작 방식 / 적용 범위

이 시뮬레이터의 스킬(Q 뇌격·전자포, W 전하 소산 차징, E 백스텝·볼트 러시, R 낙뢰·낙뢰 이동 등)은
이미 게임 고유의 충전/재시전/과전하 로직을 갖고 있어, 제네릭한 `castDelay/activeTime/recovery`
3단계 모델로 통째로 교체하면 기존 동작이 깨집니다. 그래서 이 설정은 **기존 스킬을 보존**하면서
"조작감 레이어"만 제어합니다.

| 키 | 적용(LIVE) 여부 | 설명 |
| --- | --- | --- |
| `movement.moveSpeed` | ✅ | 이동 속도 **시작값(월드 px/초)**. 로드 시 m/s로 환산되어 옵션의 "이동 속도(m/s)" 입력에 들어가며, 이후엔 그 **UI 입력값이 우선**(실시간 반영). 151.9px ≈ 4.08m/s. |
| `movement.arrivalRadius` | ✅ | 목적지 도착 판정 반경(px). |
| `movement.turnInstantlyOnMoveCommand` | ✅ | 우클릭 즉시 그 방향을 바라봄. |
| `movement.stopOnSkillCast` | ✅ | 차단 스킬 시전 중 이동 명령을 버퍼에 보관(시전 후 실행). |
| `camera.followPlayer` | ✅ | 카메라 잠금 시 캐릭터 추적 여부. |
| `camera.smoothFollow` | ✅ | true면 카메라가 보간(부드럽게)으로 따라감. |
| `camera.followLerp` | ✅ | 보간 계수(0~1). 클수록 빠르게 따라붙음. |
| `camera.zoom` | ✅ | 카메라 확대 배율(`CAMERA.zoom`). |
| `input.cancelSkillOnRightClick` | ✅ | 우클릭 시 진행 중 시전을 취소하고 이동/공격. |
| `input.skillBufferTime` | ✅ | 스킬 입력 버퍼 유지 시간(초). |
| `input.movementBufferTime` | ✅ | 이동 입력 버퍼 유지 시간(초). |
| `input.targetClickRadius` | ✅ | 우클릭으로 적(더미)을 인식하는 반경. 작을수록 더 정확히 클릭해야 공격. |
| `input.inputBufferTime` | ⚙️ | 공통 버퍼 기준값(현재 스킬/이동 버퍼를 개별 사용). |
| `skills.*.cooldown` | ✅ | 각 스킬 쿨타임 덮어쓰기. Q는 일반/과전하 쿨에 동시 적용. |
| `debug.showStateText` | ✅ | 좌상단에 현재 상태(idle/moving/casting/charging) 표시. |
| `debug.showMouseWorldPosition` | ✅ | 마우스 월드 좌표(필드 %) 표시. |
| `debug.showDestination` | ✅ | 이동 목적지 좌표 표시. |
| `debug.showFacingDirection` | ✅ | 바라보는 각도 표시. |
| `skillCommon.faceMouseOnCast` | ⚙️ | (옵션) 기본 false — 켜면 스킬 시전 시 마우스 방향을 바라봄. |
| `skillCommon.showRangeIndicator` / `debug.showSkillRange` | ℹ️ | 사거리 표시는 사이드 패널 "스킬 사거리 표시" 토글이 우선. |
| `skills.*.range/width/castDelay/activeTime/recovery`, `input.defaultCastMode`, `castMode` | ℹ️ | 제네릭 모델용 스펙. 현재 커스텀 스킬은 고유 사거리/타이밍을 그대로 사용(미적용). |

`ℹ️`/`⚙️` 항목은 구조상 보관/일부만 반영됩니다. `✅` 항목이 실제 조작감에 바로 반영됩니다.
