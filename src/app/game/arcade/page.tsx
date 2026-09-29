"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";

type Screen = "start" | "spirit" | "playing" | "complete" | "gameover";
type SectorKey = "cyan" | "purple" | "gold" | "void" | "dual";

type SectorConfig = {
  key: SectorKey;
  spirit: string;
  code: string;
  accent: string;
  accentSoft: string;
  difficulty: string;
  enemySpawnMs: number;
  enemyMax: number;
  enemySpeed: number;
};

type Player = {
  x: number;
  y: number;
};

type Projectile = {
  id: number;
  x: number;
  y: number;
  vx: number;
};

type BossProjectile = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
};

type Enemy = {
  id: number;
  x: number;
  y: number;
  hp: number;
  source: "sector" | "boss";
};

type Byte = {
  id: number;
  x: number;
  y: number;
  collected: boolean;
};

type PowerCapsule = {
  id: number;
  x: number;
  y: number;
  collected: boolean;
};

type LifePickup = {
  id: number;
  x: number;
  y: number;
  collected: boolean;
};

type Boss = {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  active: boolean;
  revealed: boolean;
};

type PointerAim = {
  active: boolean;
  captured: boolean;
  pointerId: number | null;
  clientX: number;
  clientY: number;
  worldX: number;
  worldY: number;
};

type CraftBank = {
  rotate: number;
  skew: number;
};

const SECTORS: SectorConfig[] = [
  {
    key: "cyan",
    spirit: "CYAN SPIRIT",
    code: "AGS-001",
    accent: "#20e7ff",
    accentSoft: "rgba(32,231,255,0.22)",
    difficulty: "EASY",
    enemySpawnMs: 1450,
    enemyMax: 12,
    enemySpeed: 0.58,
  },
  {
    key: "purple",
    spirit: "PURPLE SPIRIT",
    code: "AGS-002",
    accent: "#b46cff",
    accentSoft: "rgba(180,108,255,0.22)",
    difficulty: "MODERATE",
    enemySpawnMs: 1120,
    enemyMax: 15,
    enemySpeed: 0.68,
  },
  {
    key: "gold",
    spirit: "GOLD SPIRIT",
    code: "AGS-003",
    accent: "#ffd75a",
    accentSoft: "rgba(255,215,90,0.22)",
    difficulty: "HARD",
    enemySpawnMs: 860,
    enemyMax: 18,
    enemySpeed: 0.78,
  },
  {
    key: "void",
    spirit: "VOID SPIRIT",
    code: "AGS-004",
    accent: "#ff5d9e",
    accentSoft: "rgba(255,93,158,0.18)",
    difficulty: "VERY HARD",
    enemySpawnMs: 650,
    enemyMax: 22,
    enemySpeed: 0.9,
  },
  {
    key: "dual",
    spirit: "DUAL-CORE SPIRIT",
    code: "AGS-005",
    accent: "#e9f7ff",
    accentSoft: "rgba(233,247,255,0.2)",
    difficulty: "PROFESSIONAL",
    enemySpawnMs: 480,
    enemyMax: 26,
    enemySpeed: 1.02,
  },
];

const WORLD_WIDTH = 5200;
const WORLD_HEIGHT = 560;
const PLAYER_SIZE = 50;
const PLAYER_SPEED = 5.00;
const PLAYER_VERTICAL_SPEED = 5.00;
const POINTER_MAX_SPEED = PLAYER_SPEED;
const STEER_RESPONSE = 0.2;
const BANK_MAX_ROTATE = 10;
const BANK_MAX_SKEW = 6;
const BANK_RESPONSE = 0.32;
const PLAYER_HP = 5;
const STARTING_AMMO = 500;
const LIFE_PICKUP_SPACING = 920;

const BOSS_X = WORLD_WIDTH - 138;
const BOSS_SIZE = 112;

const PROJECTILE_SPEED = 8.8;
const PROJECTILE_DAMAGE = 1;
const PROJECTILE_WIDTH = 28;
const PROJECTILE_HEIGHT = 10;

const FIRE_COOLDOWN = 250;
const ENEMY_DAMAGE_COOLDOWN = 700;

const VIEWPORT_WIDTH = 1000;
const UI_TICK_MS = 50;
const MOBILE_GAME_SCALE = 0.62;
const DESKTOP_GAME_SCALE = 0.92;
const DESKTOP_FRAME_QUERY = "(min-width: 1024px)";

const BOSS_REVEAL_MARGIN = VIEWPORT_WIDTH * 0.92;
const BOSS_SHOT_COOLDOWN = 1250;
const BOSS_REVEALED_SHOT_COOLDOWN = 520;
const BOSS_SPAWN_COOLDOWN = 2600;
const BOSS_REVEALED_SPAWN_COOLDOWN = 1450;
const BOSS_PROJECTILE_SPEED = 3.25;
const BOSS_REVEALED_PROJECTILE_SPEED = 4.35;
const CAPSULE_MIN_DISTANCE = 560;
const CAPSULE_MAX_DISTANCE = 980;
const CAPSULE_DURATION_MS = 11000;


function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function idlePointerAim(): PointerAim {
  return {
    active: false,
    captured: false,
    pointerId: null,
    clientX: 0,
    clientY: 0,
    worldX: 0,
    worldY: 0,
  };
}

/** Map a viewport client point into world space. Layout pixels differ from the rendered box because the page is CSS-scaled. */
function clientToWorld(
  clientX: number,
  clientY: number,
  viewport: HTMLElement,
  cameraX: number,
  frameScale: number,
): { x: number; y: number } {
  const rect = viewport.getBoundingClientRect();
  const layoutWidth = viewport.clientWidth || rect.width || 1;
  const layoutHeight = viewport.clientHeight || rect.height || 1;
  const scaleX = rect.width > 0 ? rect.width / layoutWidth : frameScale;
  const scaleY = rect.height > 0 ? rect.height / layoutHeight : frameScale;

  return {
    x: cameraX + (clientX - rect.left) / scaleX,
    y: (clientY - rect.top) / scaleY,
  };
}

/** Ease `current` toward `target`. Speed stays within the existing move cap so corridor timing does not change. */
function steerToward(current: number, target: number, dt: number): number {
  const follow = 1 - Math.exp(-STEER_RESPONSE * dt);
  const step = (target - current) * follow;
  const maxStep = POINTER_MAX_SPEED * dt;
  return current + clamp(step, -maxStep, maxStep);
}

function useGameScale(): number {
  const [gameScale, setGameScale] = useState(MOBILE_GAME_SCALE);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_FRAME_QUERY);
    const apply = () => {
      setGameScale(media.matches ? DESKTOP_GAME_SCALE : MOBILE_GAME_SCALE);
    };

    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  return gameScale;
}

function rectsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainder
    .toString()
    .padStart(2, "0")}`;
}

function makeEnemies(sectorIndex: number): Enemy[] {
  const count = 14 + sectorIndex * 4;

  return Array.from({ length: count }, (_, index) => ({
    id: sectorIndex * 100 + index,
    x: 420 + index * 205 + (index % 2) * 35,
    y: 100 + ((index * 83 + sectorIndex * 47) % 330),
    hp: 1 + Math.floor(sectorIndex / 2),
    source: "sector" as const,
  })).filter((enemy) => enemy.x < BOSS_X - 220);
}

function makeBytes(sectorIndex: number): Byte[] {
  const count = 15;

  return Array.from({ length: count }, (_, index) => ({
    id: sectorIndex * 1000 + index,
    x: 260 + index * 190 + (index % 3) * 32,
    y: 105 + ((index * 71 + sectorIndex * 61) % 320),
    collected: false,
  })).filter((byte) => byte.x < BOSS_X - 190);
}

function makeBoss(sectorIndex: number): Boss {
  const maxHp = 8 + sectorIndex * 3;

  return {
    x: BOSS_X,
    y: WORLD_HEIGHT / 2 - BOSS_SIZE / 2,
    hp: maxHp,
    maxHp,
    active: true,
    revealed: false,
  };
}

function makeCapsules(sectorIndex: number): PowerCapsule[] {
  const count = 6;
  const firstX = 760 + sectorIndex * 90;

  return Array.from({ length: count }, (_, index) => ({
    id: sectorIndex * 100 + index,
    x: firstX + index * 760 + ((index * 113) % 180),
    y: 95 + ((index * 137 + sectorIndex * 53) % 330),
    collected: false,
  })).filter((capsule) => capsule.x < BOSS_X - 420);
}

function makeLifePickups(sectorIndex: number): LifePickup[] {
  const count = Math.floor((BOSS_X - 700) / LIFE_PICKUP_SPACING);

  return Array.from({ length: count }, (_, index) => ({
    id: sectorIndex * 1000 + index,
    x: 760 + index * LIFE_PICKUP_SPACING + ((index * 173 + sectorIndex * 91) % 220),
    y: 90 + ((index * 149 + sectorIndex * 67) % 350),
    collected: false,
  })).filter((pickup) => pickup.x < BOSS_X - 300);
}

export default function ArcadePage() {
  const gameScale = useGameScale();
  const [screen, setScreen] = useState<Screen>("start");
  const [sectorIndex, setSectorIndex] = useState(0);

  const sector = SECTORS[sectorIndex];

  const [player, setPlayer] = useState<Player>({
    x: 120,
    y: WORLD_HEIGHT / 2 - PLAYER_SIZE / 2,
  });

  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [bossProjectiles, setBossProjectiles] = useState<BossProjectile[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bytes, setBytes] = useState<Byte[]>([]);
  const [capsules, setCapsules] = useState<PowerCapsule[]>([]);
  const [lifePickups, setLifePickups] = useState<LifePickup[]>([]);
  const [boss, setBoss] = useState<Boss>(() => makeBoss(0));
  const [shotUpgrade, setShotUpgrade] = useState<"single" | "double">("single");
  const [ammo, setAmmo] = useState(STARTING_AMMO);
  const [upgradeUntil, setUpgradeUntil] = useState(0);

  const [hp, setHp] = useState(PLAYER_HP);
  const [score, setScore] = useState(0);
  const [neoBytes, setNeoBytes] = useState(0);
  const [time, setTime] = useState(0);
  const [combo, setCombo] = useState(0);
  const [cameraX, setCameraX] = useState(0);
  const [bank, setBank] = useState<CraftBank>({ rotate: 0, skew: 0 });

  const playerRef = useRef(player);
  const projectilesRef = useRef<Projectile[]>([]);
  const bossProjectilesRef = useRef<BossProjectile[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const bytesRef = useRef<Byte[]>([]);
  const capsulesRef = useRef<PowerCapsule[]>([]);
  const lifePickupsRef = useRef<LifePickup[]>([]);
  const bossRef = useRef(boss);

  const keysRef = useRef<Set<string>>(new Set());
  const pointerRef = useRef<PointerAim>(idlePointerAim());
  const screenRef = useRef<Screen>(screen);
  const ammoRef = useRef(STARTING_AMMO);
  const shotUpgradeRef = useRef<"single" | "double">("single");
  const bankRef = useRef<CraftBank>({ rotate: 0, skew: 0 });
  const gameScaleRef = useRef(gameScale);
  screenRef.current = screen;
  gameScaleRef.current = gameScale;

  const lastFireRef = useRef(0);
  const lastBossShotRef = useRef(0);
  const lastBossSpawnRef = useRef(0);
  const lastEnemySpawnRef = useRef(0);
  const lastDamageRef = useRef(0);
  const startTimeRef = useRef(0);
  const projectileIdRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const lastUiUpdateRef = useRef(0);
  const cameraXRef = useRef(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const resetSector = useCallback((index: number) => {
    const nextPlayer = {
      x: 120,
      y: WORLD_HEIGHT / 2 - PLAYER_SIZE / 2,
    };

    const nextEnemies = makeEnemies(index);
    const nextBytes = makeBytes(index);
    const nextCapsules = makeCapsules(index);
    const nextLifePickups = makeLifePickups(index);
    const nextBoss = makeBoss(index);

    playerRef.current = nextPlayer;
    projectilesRef.current = [];
    bossProjectilesRef.current = [];
    enemiesRef.current = nextEnemies;
    bytesRef.current = nextBytes;
    capsulesRef.current = nextCapsules;
    lifePickupsRef.current = nextLifePickups;
    bossRef.current = nextBoss;

    setPlayer(nextPlayer);
    setProjectiles([]);
    setBossProjectiles([]);
    setEnemies(nextEnemies);
    setBytes(nextBytes);
    setCapsules(nextCapsules);
    setLifePickups(nextLifePickups);
    setBoss(nextBoss);
    setShotUpgrade("single");
    setUpgradeUntil(0);
    setAmmo(STARTING_AMMO);
    setHp(PLAYER_HP);
    setCombo(0);
    setCameraX(0);
    cameraXRef.current = 0;
    setBank({ rotate: 0, skew: 0 });

    pointerRef.current = idlePointerAim();
    ammoRef.current = STARTING_AMMO;
    shotUpgradeRef.current = "single";
    bankRef.current = { rotate: 0, skew: 0 };

    startTimeRef.current = performance.now();
    lastFireRef.current = 0;
    lastBossShotRef.current = performance.now() - BOSS_SHOT_COOLDOWN;
    lastBossSpawnRef.current = performance.now() - BOSS_SPAWN_COOLDOWN;
    lastEnemySpawnRef.current =
      performance.now() - SECTORS[index].enemySpawnMs;
    lastDamageRef.current = 0;
  }, []);

  const beginSector = useCallback(
    (index: number) => {
      setSectorIndex(index);
      resetSector(index);
      setScreen("playing");
    },
    [resetSector],
  );

  const initializeSpirit = useCallback(() => {
    beginSector(sectorIndex);
  }, [beginSector, sectorIndex]);

  const startGame = useCallback(() => {
    setSectorIndex(0);
    setScore(0);
    setNeoBytes(0);
    setTime(0);
    beginSector(0);
  }, [beginSector]);

  const advanceSector = useCallback(() => {
    if (sectorIndex >= SECTORS.length - 1) return;

    const nextIndex = sectorIndex + 1;
    setSectorIndex(nextIndex);
    setScreen("spirit");
  }, [sectorIndex]);

  const fire = useCallback(() => {
    if (screenRef.current !== "playing") return;

    const now = performance.now();

    if (now - lastFireRef.current < FIRE_COOLDOWN) return;

    const doubleShot = shotUpgradeRef.current === "double";
    const shotsRequired = doubleShot ? 2 : 1;

    if (ammoRef.current < shotsRequired) return;

    lastFireRef.current = now;
    ammoRef.current = Math.max(0, ammoRef.current - shotsRequired);
    setAmmo(ammoRef.current);

    const current = playerRef.current;
    const baseX = current.x + PLAYER_SIZE - 2;
    const centerY = current.y + PLAYER_SIZE / 2 - PROJECTILE_HEIGHT / 2;

    const shots: Projectile[] = doubleShot
      ? [
          {
            id: projectileIdRef.current++,
            x: baseX,
            y: centerY - 9,
            vx: PROJECTILE_SPEED,
          },
          {
            id: projectileIdRef.current++,
            x: baseX,
            y: centerY + 9,
            vx: PROJECTILE_SPEED,
          },
        ]
      : [
          {
            id: projectileIdRef.current++,
            x: baseX,
            y: centerY,
            vx: PROJECTILE_SPEED,
          },
        ];

    projectilesRef.current = [...projectilesRef.current, ...shots];
  }, []);
  useEffect(() => {
    const movementKeys = new Set([
      "arrowup",
      "arrowdown",
      "arrowleft",
      "arrowright",
      "w",
      "a",
      "s",
      "d",
    ]);

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (movementKeys.has(key)) {
        event.preventDefault();
        keysRef.current.add(key);
        return;
      }

      if (key === " " && screenRef.current === "playing") {
        event.preventDefault();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keysRef.current.delete(event.key.toLowerCase());
    };

    const onBlur = () => {
      pointerRef.current = idlePointerAim();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  useEffect(() => {
    if (screen !== "playing") return;

    let cancelled = false;

    const loop = (now: number) => {
      if (cancelled) return;

      const previous = lastFrameRef.current || now;
      const dt = clamp((now - previous) / 16.67, 0, 2);
      lastFrameRef.current = now;

      const keys = keysRef.current;
      const current = playerRef.current;
      const aim = pointerRef.current;

      if (aim.active && viewportRef.current) {
        const world = clientToWorld(
          aim.clientX,
          aim.clientY,
          viewportRef.current,
          cameraXRef.current,
          gameScaleRef.current,
        );
        aim.worldX = world.x;
        aim.worldY = world.y;
      }

      let nextX = current.x;
      let nextY = current.y;

      if (aim.active) {
        nextX = steerToward(current.x, aim.worldX - PLAYER_SIZE / 2, dt);
        nextY = steerToward(current.y, aim.worldY - PLAYER_SIZE / 2, dt);
      } else {
        if (keys.has("arrowleft") || keys.has("a")) nextX -= PLAYER_SPEED * dt;
        if (keys.has("arrowright") || keys.has("d")) nextX += PLAYER_SPEED * dt;
        if (keys.has("arrowup") || keys.has("w")) nextY -= PLAYER_VERTICAL_SPEED * dt;
        if (keys.has("arrowdown") || keys.has("s")) nextY += PLAYER_VERTICAL_SPEED * dt;
      }

      const bossLeftLimit = BOSS_X - PLAYER_SIZE - 28;

      const nextPlayer = {
        x: clamp(nextX, 28, bossLeftLimit),
        y: clamp(
          nextY,
          34,
          WORLD_HEIGHT - PLAYER_SIZE - 34,
        ),
      };

      playerRef.current = nextPlayer;

      const stepX = nextPlayer.x - current.x;
      const stepY = nextPlayer.y - current.y;
      const velX = dt > 0 ? stepX / dt : 0;
      const velY = dt > 0 ? stepY / dt : 0;
      const bankFollow = 1 - Math.exp(-BANK_RESPONSE * dt);
      const nextBank: CraftBank = {
        rotate:
          bankRef.current.rotate +
          (clamp(velY * 1.35, -BANK_MAX_ROTATE, BANK_MAX_ROTATE) -
            bankRef.current.rotate) *
            bankFollow,
        skew:
          bankRef.current.skew +
          (clamp(velX * 0.7, -BANK_MAX_SKEW, BANK_MAX_SKEW) -
            bankRef.current.skew) *
            bankFollow,
      };
      if (Math.abs(nextBank.rotate) < 0.05) nextBank.rotate = 0;
      if (Math.abs(nextBank.skew) < 0.05) nextBank.skew = 0;
      bankRef.current = nextBank;

      fire();

      // Follow the Core using the actual rendered viewport width.
      // This keeps camera movement correct on mobile as well as desktop.
      const viewportWidth = Math.min(
        VIEWPORT_WIDTH,
        viewportRef.current?.clientWidth || VIEWPORT_WIDTH,
      );
      const targetCamera = clamp(
        nextPlayer.x - viewportWidth * 0.34,
        0,
        WORLD_WIDTH - viewportWidth,
      );

      const smoothCamera =
        cameraXRef.current +
        (targetCamera - cameraXRef.current) * 0.12;

      cameraXRef.current = smoothCamera;

      const bossCurrent = bossRef.current;
      const bossOnScreen =
        bossCurrent.active &&
        bossCurrent.x < smoothCamera + viewportWidth &&
        bossCurrent.x + BOSS_SIZE > smoothCamera;

      if (bossOnScreen && !bossCurrent.revealed) {
        bossCurrent.revealed = true;
      }

      let nextEnemies = enemiesRef.current.map((enemy) => {
        const verticalDirection = enemy.y < nextPlayer.y ? 1 : -1;
        const horizontalDirection = enemy.x < nextPlayer.x ? 1 : -1;

        return {
          ...enemy,
          x:
            enemy.x +
            horizontalDirection * sector.enemySpeed * dt,
          y: clamp(
            enemy.y +
              verticalDirection * sector.enemySpeed * 0.65 * dt,
            54,
            WORLD_HEIGHT - 100,
          ),
        };
      });

      // Boss keeps sending threats through the whole traversal.
      // Once visible, both the cadence and projectile speed increase.
      const bossShotCooldown = bossCurrent.revealed
        ? BOSS_REVEALED_SHOT_COOLDOWN
        : BOSS_SHOT_COOLDOWN;

      let nextBossProjectiles = bossProjectilesRef.current
        .map((projectile) => ({
          ...projectile,
          x: projectile.x + projectile.vx * dt,
          y: projectile.y + projectile.vy * dt,
        }))
        .filter(
          (projectile) =>
            projectile.x > -120 &&
            projectile.x < BOSS_X + 180 &&
            projectile.y > -80 &&
            projectile.y < WORLD_HEIGHT + 80,
        );

      if (
        bossCurrent.active &&
        now - lastBossShotRef.current >= bossShotCooldown
      ) {
        lastBossShotRef.current = now;

        const targetY =
          nextPlayer.y + PLAYER_SIZE / 2 + (Math.random() - 0.5) * 90;

        const speed = bossCurrent.revealed
          ? BOSS_REVEALED_PROJECTILE_SPEED
          : BOSS_PROJECTILE_SPEED;

        const dyToTarget =
          (targetY - (bossCurrent.y + BOSS_SIZE / 2)) * 0.015;

        nextBossProjectiles = [
          ...nextBossProjectiles,
          {
            id: projectileIdRef.current++,
            x: bossCurrent.x - 10,
            y: bossCurrent.y + BOSS_SIZE / 2 - 5,
            vx: -speed,
            vy: clamp(dyToTarget, -1.5, 1.5),
            size: bossCurrent.revealed ? 12 : 9,
          },
        ];

        if (bossCurrent.revealed) {
          nextBossProjectiles = [
            ...nextBossProjectiles,
            {
              id: projectileIdRef.current++,
              x: bossCurrent.x - 10,
              y: bossCurrent.y + BOSS_SIZE / 2 - 5,
              vx: -speed * 0.94,
              vy: -1.15,
              size: 8,
            },
            {
              id: projectileIdRef.current++,
              x: bossCurrent.x - 10,
              y: bossCurrent.y + BOSS_SIZE / 2 - 5,
              vx: -speed * 0.94,
              vy: 1.15,
              size: 8,
            },
          ];
        }
      }

      // Sector difficulty controls how often hostile nodes appear.
      // The pressure increases gradually from Cyan to Dual-Core.
      if (
        now - lastEnemySpawnRef.current >= sector.enemySpawnMs &&
        nextEnemies.length < sector.enemyMax
      ) {
        lastEnemySpawnRef.current = now;

        const spawnDistance =
          540 + Math.random() * 360;

        const spawnX = Math.min(
          nextPlayer.x + spawnDistance,
          BOSS_X - 300,
        );

        const spawnY = clamp(
          nextPlayer.y + (Math.random() - 0.5) * 280,
          60,
          WORLD_HEIGHT - 120,
        );

        nextEnemies = [
          ...nextEnemies,
          {
            id:
              sectorIndex * 100000 +
              Math.floor(now) +
              nextEnemies.length,
            x: spawnX,
            y: spawnY,
            hp: 1 + Math.floor(sectorIndex / 2),
            source: "sector",
          },
        ];
      }

      const bossSpawnCooldown = bossCurrent.revealed
        ? BOSS_REVEALED_SPAWN_COOLDOWN
        : BOSS_SPAWN_COOLDOWN;

      if (
        bossCurrent.active &&
        now - lastBossSpawnRef.current >= bossSpawnCooldown &&
        nextEnemies.length < 18
      ) {
        lastBossSpawnRef.current = now;

        const spawnId = sectorIndex * 10000 + Math.floor(now);
        const spawnY = clamp(
          nextPlayer.y + (Math.random() - 0.5) * 220,
          70,
          WORLD_HEIGHT - 115,
        );

        nextEnemies = [
          ...nextEnemies,
          {
            id: spawnId,
            x: bossCurrent.x - 36,
            y: spawnY,
            hp: 1 + Math.floor(sectorIndex / 2),
            source: "boss",
          },
        ];
      }

      let nextProjectiles = projectilesRef.current
        .map((projectile) => ({
          ...projectile,
          x: projectile.x + projectile.vx * dt,
        }))
        .filter((projectile) => projectile.x < BOSS_X + 120);

      let nextBytes = bytesRef.current;
      let nextCapsules = capsulesRef.current;
      let nextLifePickups = lifePickupsRef.current;
      let nextScore = 0;
      let collectedNow = 0;
      let lifeCollected = false;
      let capsuleCollected = false;

      nextBytes = nextBytes.map((byte) => {
        if (
          !byte.collected &&
          rectsOverlap(
            {
              x: nextPlayer.x,
              y: nextPlayer.y,
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
            },
            {
              x: byte.x - 12,
              y: byte.y - 12,
              width: 24,
              height: 24,
            },
          )
        ) {
          collectedNow += 1;
          nextScore += 25;
          return { ...byte, collected: true };
        }

        return byte;
      });

      nextCapsules = nextCapsules.map((capsule) => {
        if (
          !capsule.collected &&
          rectsOverlap(
            {
              x: nextPlayer.x,
              y: nextPlayer.y,
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
            },
            {
              x: capsule.x - 15,
              y: capsule.y - 15,
              width: 30,
              height: 30,
            },
          )
        ) {
          capsuleCollected = true;
          return { ...capsule, collected: true };
        }

        return capsule;
      });

      nextLifePickups = nextLifePickups.map((pickup) => {
        if (
          !pickup.collected &&
          rectsOverlap(
            {
              x: nextPlayer.x,
              y: nextPlayer.y,
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
            },
            {
              x: pickup.x - 15,
              y: pickup.y - 15,
              width: 30,
              height: 30,
            },
          )
        ) {
          lifeCollected = true;
          return { ...pickup, collected: true };
        }

        return pickup;
      });

      if (lifeCollected) {
        setHp((value) => Math.min(PLAYER_HP, value + 1));
        nextScore += 75;
      }

      if (capsuleCollected) {
        shotUpgradeRef.current = "double";
        setShotUpgrade("double");
        setUpgradeUntil(now + CAPSULE_DURATION_MS);
        nextScore += 150;
      } else if (shotUpgrade === "double" && now >= upgradeUntil) {
        shotUpgradeRef.current = "single";
        setShotUpgrade("single");
        setUpgradeUntil(0);
      }

      const enemyHits = new Set<number>();
      const consumedProjectiles = new Set<number>();

      nextProjectiles.forEach((projectile) => {
        nextEnemies.forEach((enemy) => {
          if (
            enemyHits.has(enemy.id) ||
            consumedProjectiles.has(projectile.id)
          ) {
            return;
          }

          if (
            rectsOverlap(
              {
                x: projectile.x,
                y: projectile.y,
                width: PROJECTILE_WIDTH,
                height: PROJECTILE_HEIGHT,
              },
              {
                x: enemy.x,
                y: enemy.y,
                width: 38,
                height: 38,
              },
            )
          ) {
            consumedProjectiles.add(projectile.id);
            enemyHits.add(enemy.id);
          }
        });
      });

      nextEnemies = nextEnemies
        .map((enemy) =>
          enemyHits.has(enemy.id)
            ? { ...enemy, hp: enemy.hp - PROJECTILE_DAMAGE }
            : enemy,
        )
        .filter((enemy) => enemy.hp > 0);

      nextProjectiles = nextProjectiles.filter(
        (projectile) => !consumedProjectiles.has(projectile.id),
      );

      // Boss damage is deliberately gated by visibility.
      // Shots fired while the boss is still off-screen are harmless to it.
      if (bossCurrent.revealed && bossCurrent.active) {
        nextProjectiles.forEach((projectile) => {
          if (consumedProjectiles.has(projectile.id)) return;

          if (
            rectsOverlap(
              {
                x: projectile.x,
                y: projectile.y,
                width: PROJECTILE_WIDTH,
                height: PROJECTILE_HEIGHT,
              },
              {
                x: bossCurrent.x,
                y: bossCurrent.y,
                width: BOSS_SIZE,
                height: BOSS_SIZE,
              },
            )
          ) {
            consumedProjectiles.add(projectile.id);
            bossCurrent.hp -= PROJECTILE_DAMAGE;
          }
        });
      }

      nextProjectiles = nextProjectiles.filter(
        (projectile) => !consumedProjectiles.has(projectile.id),
      );

      // Enemy/boss projectile collision with the Core.
      const bossProjectilesToRemove = new Set<number>();

      nextBossProjectiles.forEach((projectile) => {
        const projectileSize = projectile.size;

        if (
          rectsOverlap(
            {
              x: nextPlayer.x,
              y: nextPlayer.y,
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
            },
            {
              x: projectile.x - projectileSize / 2,
              y: projectile.y - projectileSize / 2,
              width: projectileSize,
              height: projectileSize,
            },
          )
        ) {
          bossProjectilesToRemove.add(projectile.id);

          if (now - lastDamageRef.current > ENEMY_DAMAGE_COOLDOWN) {
            lastDamageRef.current = now;
            setHp((value) => Math.max(0, value - 1));
            setCombo(0);
          }
        }
      });

      nextBossProjectiles = nextBossProjectiles.filter(
        (projectile) => !bossProjectilesToRemove.has(projectile.id),
      );

      const playerBox = {
        x: nextPlayer.x,
        y: nextPlayer.y,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
      };

      const touchedEnemy = nextEnemies.some((enemy) =>
        rectsOverlap(playerBox, {
          x: enemy.x,
          y: enemy.y,
          width: 38,
          height: 38,
        }),
      );

      if (
        touchedEnemy &&
        now - lastDamageRef.current > ENEMY_DAMAGE_COOLDOWN
      ) {
        lastDamageRef.current = now;
        setHp((value) => Math.max(0, value - 1));
        setCombo(0);
      }

      if (collectedNow > 0) {
        setNeoBytes((value) => value + collectedNow);
      }

      const destroyedEnemies = enemyHits.size;
      if (destroyedEnemies > 0) {
        nextScore += destroyedEnemies * 100;
        setCombo((value) => value + destroyedEnemies);
      }

      if (nextScore > 0) {
        setScore((value) => value + nextScore);
      }

      bossRef.current = bossCurrent;
      playerRef.current = nextPlayer;
      projectilesRef.current = nextProjectiles;
      bossProjectilesRef.current = nextBossProjectiles;
      enemiesRef.current = nextEnemies;
      bytesRef.current = nextBytes;
      capsulesRef.current = nextCapsules;
      lifePickupsRef.current = nextLifePickups;

      if (bossCurrent.hp <= 0 && bossCurrent.active) {
        bossCurrent.active = false;
        bossCurrent.hp = 0;
        setBoss({ ...bossCurrent });
        screenRef.current = "complete";
        setScreen("complete");
      }

      if (now - lastUiUpdateRef.current >= UI_TICK_MS) {
        lastUiUpdateRef.current = now;

        setPlayer(nextPlayer);
        setProjectiles(nextProjectiles);
        setBossProjectiles(nextBossProjectiles);
        setEnemies(nextEnemies);
        setBytes(nextBytes);
        setCapsules(nextCapsules);
        setLifePickups(nextLifePickups);
        setBoss({ ...bossCurrent });
        setCameraX(smoothCamera);
        setBank({
          rotate: bankRef.current.rotate,
          skew: bankRef.current.skew,
        });
        setTime(
          Math.floor(
            (now - startTimeRef.current) / 1000,
          ),
        );
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    lastFrameRef.current = performance.now();
    lastUiUpdateRef.current = 0;
    animationRef.current = requestAnimationFrame(loop);

    return () => {
      cancelled = true;

      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      animationRef.current = null;
    };
  }, [fire, screen, sectorIndex, shotUpgrade, upgradeUntil]);
  useEffect(() => {
    if (hp <= 0 && screen === "playing") {
      screenRef.current = "gameover";
      pointerRef.current = idlePointerAim();
      setScreen("gameover");
    }
  }, [hp, screen]);

  useEffect(() => {
    if (screen === "playing") return;
    pointerRef.current = idlePointerAim();
  }, [screen]);

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const rememberPointer = (clientX: number, clientY: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const world = clientToWorld(
      clientX,
      clientY,
      viewport,
      cameraXRef.current,
      gameScaleRef.current,
    );
    const aim = pointerRef.current;
    aim.clientX = clientX;
    aim.clientY = clientY;
    aim.worldX = world.x;
    aim.worldY = world.y;
    aim.active = true;
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (screenRef.current !== "playing") return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    if (event.pointerType !== "mouse") {
      event.preventDefault();
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerRef.current.captured = true;
    pointerRef.current.pointerId = event.pointerId;
    rememberPointer(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (screenRef.current !== "playing") return;

    const aim = pointerRef.current;
    const mouseHover = event.pointerType === "mouse";
    const draggingThisPointer =
      aim.captured && aim.pointerId === event.pointerId;

    if (!mouseHover && !draggingThisPointer) return;

    if (event.pointerType !== "mouse") {
      event.preventDefault();
    }

    rememberPointer(event.clientX, event.clientY);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const aim = pointerRef.current;
    if (aim.pointerId !== null && event.pointerId !== aim.pointerId) return;

    aim.captured = false;
    aim.pointerId = null;

    if (event.pointerType === "mouse") {
      const viewport = viewportRef.current;
      if (!viewport) {
        aim.active = false;
        return;
      }

      const rect = viewport.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (inside) {
        rememberPointer(event.clientX, event.clientY);
      } else {
        aim.active = false;
      }
      return;
    }

    aim.active = false;
  };

  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerRef.current.captured) return;
    if (event.pointerType !== "mouse") return;
    pointerRef.current.active = false;
  };

  const handleLostPointerCapture = (event: PointerEvent<HTMLDivElement>) => {
    const aim = pointerRef.current;
    if (aim.pointerId !== null && aim.pointerId !== event.pointerId) return;

    aim.captured = false;
    aim.pointerId = null;

    if (event.pointerType !== "mouse") {
      aim.active = false;
    }
  };

  const resetToStart = () => {
    setScreen("start");
    setSectorIndex(0);
    setScore(0);
    setNeoBytes(0);
    setTime(0);
    setCombo(0);
    setHp(PLAYER_HP);
    setShotUpgrade("single");
    setUpgradeUntil(0);
    setAmmo(STARTING_AMMO);
    setBank({ rotate: 0, skew: 0 });
    pointerRef.current = idlePointerAim();
    ammoRef.current = STARTING_AMMO;
    shotUpgradeRef.current = "single";
    bankRef.current = { rotate: 0, skew: 0 };
  };

  const progress = clamp(
    ((player.x - 120) / (BOSS_X - 120)) * 100,
    0,
    100,
  );

  const remainingBossHp = Math.max(
    0,
    boss.hp,
  );

  const visualParticles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        left: `${(index * 17) % 100}%`,
        top: `${20 + ((index * 31) % 65)}%`,
        delay: `${(index % 7) * 0.7}s`,
        duration: `${4 + (index % 4)}s`,
      })),
    [],
  );

  return (
    <>
      <style jsx>{`
        @keyframes enemy-core-blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.08;
          }
        }

        .arcade-playfield,
        .arcade-playfield * {
          touch-action: none;
        }
      `}</style>

      <main
      className="min-h-screen bg-[#030508] px-3 py-3 text-white sm:px-4"
      style={
        {
          "--sector-accent": sector.accent,
          "--sector-soft": sector.accentSoft,
        } as CSSProperties
      }
    >
      <div
        className="mx-auto w-full overflow-visible"
        style={{
          transform: `scale(${gameScale})`,
          transformOrigin: "top center",
          width: `${100 / gameScale}%`,
          marginLeft: `${(100 - 100 / gameScale) / 2}%`,
        }}
      >
        <div className="mx-auto w-full max-w-[880px] lg:max-w-[1024px]">
        <header className="mb-2 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-2">
          <div>
            <p
              className="font-mono text-[9px] uppercase tracking-[0.35em]"
              style={{ color: sector.accent }}
            >
              VΣLOHE SYSTEM // AETHERGRID
            </p>
            <h1 className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
              Spirit Navigation Protocol
            </h1>
          </div>

          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
            {sector.code} {"//"} SECTOR {String(sectorIndex + 1).padStart(2, "0")}
          </div>
        </header>

        <section
          className={`relative rounded-xl border bg-black ${
            screen === "playing" ? "overflow-hidden" : "overflow-visible"
          }`}
          style={{
            borderColor: `${sector.accent}38`,
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            {visualParticles.map((particle, index) => (
              <span
                key={index}
                className="absolute h-[2px] w-[2px] rounded-full opacity-40 motion-safe:animate-pulse"
                style={{
                  left: particle.left,
                  top: particle.top,
                  background: sector.accent,
                  boxShadow: `0 0 10px ${sector.accent}`,
                  animationDelay: particle.delay,
                  animationDuration: particle.duration,
                }}
              />
            ))}
          </div>

          {screen === "playing" && (
            <>
              <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/70 px-3 py-2 backdrop-blur-sm">
                <div className="flex flex-wrap gap-3 font-mono text-[18px] uppercase tracking-widest">
                  <span style={{ color: sector.accent }}>
                    HP {hp}/{PLAYER_HP}
                  </span>
                  <span className="text-white/50">
                    SCORE {score.toString().padStart(5, "0")}
                  </span>
                  <span className="text-white/50">
                    NEOBYTES {neoBytes}
                  </span>
                  <span
                    style={{
                      color:
                        ammo <= 25
                          ? "#ff5d9e"
                          : `${sector.accent}aa`,
                    }}
                  >
                    AMMO {ammo}
                  </span>
                  <span className="text-white/50">
                    COMBO {combo}
                  </span>
                  {shotUpgrade === "double" && (
                    <span style={{ color: sector.accent }}>
                      DOUBLE FIRE
                    </span>
                  )}
                </div>

                <span className="font-mono text-[18px] uppercase tracking-widest text-white/35">
                  {formatTime(time)}
                </span>
              </div>

              <div
                ref={viewportRef}
                className="arcade-playfield relative h-[560px] cursor-crosshair touch-none overflow-hidden"
                style={{
                  background:
                    `radial-gradient(circle at 55% 50%, ${sector.accentSoft}, transparent 30%), radial-gradient(circle at 20% 75%, ${sector.accent}08, transparent 32%), #020305`,
                  touchAction: "none",
                  overscrollBehavior: "none",
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerEnter={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerLeave}
                onLostPointerCapture={handleLostPointerCapture}
              >
                <div
                  className="absolute inset-y-0"
                  style={{
                    width: `${WORLD_WIDTH}px`,
                    transform: `translateX(${-cameraX}px)`,
                  }}
                >
                  <div className="absolute inset-x-0 bottom-0 h-[110px] border-t border-white/5 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.025)_50%,transparent_100%)]" />

                  <div
                    className="absolute left-[70px] top-[52px] font-mono text-[8px] uppercase tracking-[0.3em]"
                    style={{ color: `${sector.accent}70` }}
                  >
                    NETWORK ENTRY
                  </div>

                  {Array.from({ length: 16 }, (_, index) => {
                    const x = 180 + index * 190;
                    return (
                      <div
                        key={index}
                        className="absolute top-[110px] h-[1px] w-[120px]"
                        style={{
                          left: x,
                          background: `${sector.accent}14`,
                        }}
                      />
                    );
                  })}

                  {bytes.map(
                    (byte) =>
                      !byte.collected && (
                        <div
                          key={byte.id}
                          className="absolute h-5 w-5 rotate-45 rounded-[4px] border motion-safe:animate-pulse"
                          style={{
                            left: byte.x,
                            top: byte.y,
                            borderColor: sector.accent,
                            background: sector.accentSoft,
                            boxShadow: `0 0 16px ${sector.accentSoft}`,
                          }}
                        >
                          <div
                            className="absolute inset-[5px] rounded-sm"
                            style={{ background: sector.accent }}
                          />
                        </div>
                      ),
                  )}

                  {capsules.map(
                    (capsule) =>
                      !capsule.collected && (
                        <div
                          key={capsule.id}
                          className="absolute"
                          style={{
                            left: capsule.x,
                            top: capsule.y,
                            width: 30,
                            height: 30,
                          }}
                        >
                          <div
                            className="absolute inset-0 rotate-45 rounded-[6px] border"
                            style={{
                              borderColor: sector.accent,
                              background: sector.accentSoft,
                              boxShadow: `0 0 20px ${sector.accentSoft}`,
                            }}
                          />
                          <div
                            className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                            style={{
                              background: sector.accent,
                              boxShadow: `0 0 14px ${sector.accent}`,
                            }}
                          />
                          <div
                            className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[6px] uppercase tracking-[0.18em]"
                            style={{ color: `${sector.accent}80` }}
                          >
                            FIRE UPGRADE
                          </div>
                        </div>
                      ),
                  )}

                  {lifePickups.map(
                    (pickup) =>
                      !pickup.collected && (
                        <div
                          key={pickup.id}
                          className="absolute motion-safe:animate-pulse"
                          style={{
                            left: pickup.x,
                            top: pickup.y,
                            width: 30,
                            height: 30,
                          }}
                        >
                          <div
                            className="absolute inset-0 rounded-full border"
                            style={{
                              borderColor: `${sector.accent}90`,
                              background: sector.accentSoft,
                              boxShadow: `0 0 18px ${sector.accentSoft}`,
                            }}
                          />
                          <div
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[15px] font-bold"
                            style={{
                              color: sector.accent,
                              textShadow: `0 0 10px ${sector.accent}`,
                            }}
                          >
                            +
                          </div>
                          <div
                            className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[6px] uppercase tracking-[0.16em]"
                            style={{ color: `${sector.accent}75` }}
                          >
                            LIFE
                          </div>
                        </div>
                      ),
                  )}

                  {enemies.map((enemy) => (
                    <div
                      key={enemy.id}
                      className="absolute"
                      style={{
                        left: enemy.x,
                        top: enemy.y,
                        width: 38,
                        height: 38,
                      }}
                    >
                      <div
                        className="h-full w-full rotate-45 rounded-[7px] border"
                        style={{
                          borderColor: `${sector.accent}80`,
                          background: "rgba(5,7,10,0.92)",
                          boxShadow: `0 0 18px ${sector.accentSoft}`,
                        }}
                      />
                      <div
                        className="enemy-core-blink absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{
                          background: "#ff1744",
                          boxShadow: "0 0 8px #ff1744, 0 0 16px #ff1744",
                        }}
                      />
                    </div>
                  ))}

                  {projectiles.map((projectile) => (
                    <div
                      key={projectile.id}
                      className="absolute rounded-full"
                      style={{
                        left: projectile.x,
                        top: projectile.y,
                        width: PROJECTILE_WIDTH,
                        height: PROJECTILE_HEIGHT,
                        background: sector.accent,
                        boxShadow: `0 0 12px ${sector.accent}, 0 0 26px ${sector.accentSoft}`,
                      }}
                    />
                  ))}

                  {bossProjectiles.map((projectile) => (
                    <div
                      key={projectile.id}
                      className="absolute rounded-full"
                      style={{
                        left: projectile.x - projectile.size / 2,
                        top: projectile.y - projectile.size / 2,
                        width: projectile.size,
                        height: projectile.size,
                        background: "#f4f0ff",
                        boxShadow: `0 0 10px ${sector.accent}, 0 0 22px ${sector.accentSoft}`,
                      }}
                    />
                  ))}

                  <div
                    className="absolute"
                    style={{
                      left: player.x,
                      top: player.y,
                      width: PLAYER_SIZE,
                      height: PLAYER_SIZE,
                      transform: `rotate(${bank.rotate}deg) skewX(${bank.skew}deg)`,
                      transformOrigin: "center center",
                    }}
                  >
                    <div
                      className="absolute inset-[7px] rotate-45 rounded-[8px] border"
                      style={{
                        borderColor: sector.accent,
                        background: "#030508",
                        boxShadow: `0 0 18px ${sector.accentSoft}`,
                      }}
                    />
                    {sector.key === "cyan" && (
                      <div
                        className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{
                          background: sector.accent,
                          boxShadow: `0 0 14px ${sector.accent}`,
                        }}
                      />
                    )}

                    {sector.key === "purple" && (
                      <div
                        className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border"
                        style={{
                          borderColor: sector.accent,
                          background: sector.accentSoft,
                          boxShadow: `0 0 14px ${sector.accent}`,
                        }}
                      />
                    )}

                    {sector.key === "gold" && (
                      <div
                        className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 border"
                        style={{
                          borderColor: sector.accent,
                          background: sector.accentSoft,
                          clipPath:
                            "polygon(50% 0%, 94% 25%, 94% 75%, 50% 100%, 6% 75%, 6% 25%)",
                          boxShadow: `0 0 14px ${sector.accent}`,
                        }}
                      />
                    )}

                    {sector.key === "void" && (
                      <div
                        className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border"
                        style={{
                          borderColor: sector.accent,
                          background: "#020305",
                          boxShadow: `0 0 16px ${sector.accentSoft}`,
                        }}
                      />
                    )}

                    {sector.key === "dual" && (
                      <>
                        <div
                          className="absolute left-[38%] top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                          style={{
                            background: SECTORS[0].accent,
                            boxShadow: `0 0 14px ${SECTORS[0].accent}`,
                          }}
                        />
                        <div
                          className="absolute left-[62%] top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                          style={{
                            background: SECTORS[1].accent,
                            boxShadow: `0 0 14px ${SECTORS[1].accent}`,
                          }}
                        />
                      </>
                    )}
                    <div
                      className="absolute left-1/2 top-[-9px] h-2 w-2 -translate-x-1/2 rounded-full"
                      style={{ background: sector.accent }}
                    />
                    <div
                      className="absolute bottom-[-10px] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full opacity-60"
                      style={{ background: sector.accent }}
                    />
                  </div>

                  {boss.active && (
                    <div
                      className="absolute"
                      style={{
                        left: boss.x,
                        top: boss.y,
                        width: BOSS_SIZE,
                        height: BOSS_SIZE,
                      }}
                    >
                      <div
                        className="absolute inset-0 rounded-full border motion-safe:animate-pulse"
                        style={{
                          borderColor: sector.accent,
                          background: `radial-gradient(circle, ${sector.accentSoft} 0%, rgba(0,0,0,0.92) 62%)`,
                          boxShadow: `0 0 28px ${sector.accentSoft}`,
                        }}
                      />
                      <div
                        className="absolute inset-[22px] rotate-45 border"
                        style={{
                          borderColor: `${sector.accent}aa`,
                          background: "#020305",
                        }}
                      />
                      {sector.key === "dual" ? (
                        <>
                          <div
                            className="absolute left-[38%] top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full"
                            style={{
                              background: SECTORS[0].accent,
                              boxShadow: `0 0 20px ${SECTORS[0].accent}`,
                            }}
                          />
                          <div
                            className="absolute left-[62%] top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full"
                            style={{
                              background: SECTORS[1].accent,
                              boxShadow: `0 0 20px ${SECTORS[1].accent}`,
                            }}
                          />
                        </>
                      ) : sector.key === "purple" ? (
                        <div
                          className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rotate-45 border motion-safe:animate-pulse"
                          style={{
                            borderColor: "#FF304F",
                            background: sector.accentSoft,
                            boxShadow: `0 0 20px #FF304F`,
                          }}
                        />
                      ) : sector.key === "gold" ? (
                        <div
                          className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 border motion-safe:animate-pulse"
                          style={{
                            borderColor: "#FF304F",
                            background: "#FF304F",
                            clipPath:
                              "polygon(50% 0%, 94% 25%, 94% 75%, 50% 100%, 6% 75%, 6% 25%)",
                            boxShadow: `0 0 20px #FF304F`,
                          }}
                        />
                      ) : sector.key === "void" ? (
                        <div
                          className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border motion-safe:animate-pulse"
                          style={{
                            borderColor: "#FF304F",
                            background: "#FF304F",
                            boxShadow: `0 0 22px #FF304F`,
                          }}
                        />
                      ) : (
                        <div
                          className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full motion-safe:animate-pulse"
                          style={{
                            background: "#FF304F",
                            boxShadow: `0 0 24px #FF304F`,
                          }}
                        />
                      )}

                      <div className="absolute -top-8 left-1/2 w-44 -translate-x-1/2 text-center font-mono text-[8px] uppercase tracking-[0.28em]">
                        <span style={{ color: sector.accent }}>
                          {sector.spirit} {"//"} BOSS
                        </span>
                      </div>

                      <div className="absolute -bottom-6 left-1/2 h-1.5 w-40 -translate-x-1/2 overflow-hidden rounded-full border border-white/10 bg-white/5">
                        <div
                          className="h-full transition-[width] duration-100"
                          style={{
                            width: `${(remainingBossHp / boss.maxHp) * 100}%`,
                            background: sector.accent,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div
                    className="absolute top-0 h-full border-l border-dashed"
                    style={{
                      left: BOSS_X - 30,
                      borderColor: `${sector.accent}35`,
                    }}
                  />
                </div>

                <div
                  className={`pointer-events-none absolute top-3 right-3 rounded border bg-black/70 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] ${
  boss.revealed ? "motion-safe:animate-pulse" : ""
}`}
                  style={{
                    borderColor: `${sector.accent}25`,
                    color: boss.revealed ? "#FF304F" : `${sector.accent}65`,
                  }}
                >
                  BOSS SIGNAL // {boss.revealed ? "VISIBLE" : "DISTANT"}
                </div>

                <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
                  Cursor / drag to steer // Auto-fire
                </div>
              </div>

              <div className="border-t border-white/10 bg-black/80 px-3 py-2">
                <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.22em] text-white/35">
                  <span>SECTOR PROGRESS</span>
                  <span style={{ color: sector.accent }}>
                    {Math.round(progress)}%
                  </span>
                </div>

                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full transition-[width] duration-100"
                    style={{
                      width: `${progress}%`,
                      background: sector.accent,
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {screen !== "playing" && (
            <div
              className="relative z-10 flex min-h-[420px] items-center justify-center px-5 py-8 text-center"
              style={{
                background: `radial-gradient(circle at center, ${sector.accentSoft}, transparent 38%), #020305`,
              }}
            >
              <div className="w-full max-w-2xl">
                <p
                  className="font-mono text-[9px] uppercase tracking-[0.4em]"
                  style={{ color: `${sector.accent}99` }}
                >
                  AETHERGRID // SPIRIT FREQUENCY
                </p>

                <div className="mx-auto mt-10 h-28 w-28">
                  <div
                    className="relative h-full w-full rounded-full border motion-safe:animate-pulse"
                    style={{
                      borderColor: sector.accent,
                      boxShadow: `0 0 45px ${sector.accentSoft}`,
                    }}
                  >
                    <div
                      className="absolute inset-7 rotate-45 rounded-[12px] border"
                      style={{
                        borderColor: `${sector.accent}aa`,
                        background: "#020305",
                      }}
                    />
                    {sector.key === "cyan" && (
                      <div
                        className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{
                          background: sector.accent,
                          boxShadow: `0 0 26px ${sector.accent}`,
                        }}
                      />
                    )}

                    {sector.key === "purple" && (
                      <div
                        className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rotate-45 border"
                        style={{
                          borderColor: sector.accent,
                          background: sector.accentSoft,
                          boxShadow: `0 0 26px ${sector.accent}`,
                        }}
                      />
                    )}

                    {sector.key === "gold" && (
                      <div
                        className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 border"
                        style={{
                          borderColor: sector.accent,
                          background: sector.accentSoft,
                          clipPath:
                            "polygon(50% 0%, 94% 25%, 94% 75%, 50% 100%, 6% 75%, 6% 25%)",
                          boxShadow: `0 0 26px ${sector.accent}`,
                        }}
                      />
                    )}

                    {sector.key === "void" && (
                      <div
                        className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border"
                        style={{
                          borderColor: sector.accent,
                          background: "#020305",
                          boxShadow: `0 0 28px ${sector.accentSoft}`,
                        }}
                      />
                    )}

                    {sector.key === "dual" && (
                      <>
                        <div
                          className="absolute left-[38%] top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full"
                          style={{
                            background: SECTORS[0].accent,
                            boxShadow: `0 0 24px ${SECTORS[0].accent}`,
                          }}
                        />
                        <div
                          className="absolute left-[62%] top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full"
                          style={{
                            background: SECTORS[1].accent,
                            boxShadow: `0 0 24px ${SECTORS[1].accent}`,
                          }}
                        />
                      </>
                    )}
                  </div>
                </div>

                <p
                  className="mt-12 font-mono text-[10px] uppercase tracking-[0.28em]"
                  style={{ color: `${sector.accent}aa` }}
                >
                  {sector.code}
                </p>

                <div
                  className="mx-auto mt-4 inline-flex items-center gap-2 rounded border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.22em]"
                  style={{
                    borderColor: `${sector.accent}35`,
                    color: sector.accent,
                    background: `${sector.accent}08`,
                  }}
                >
                  <span className="text-white/35">DIFFICULTY //</span>
                  <span>{sector.difficulty}</span>
                </div>

                <h2
                  className="mt-4 text-4xl font-semibold tracking-[0.08em] sm:text-6xl"
                  style={{
                    color: sector.accent,
                    textShadow: `0 0 26px ${sector.accentSoft}`,
                  }}
                >
                  {screen === "complete"
                    ? "SECTOR COMPLETE"
                    : screen === "gameover"
                      ? "SPIRIT OFFLINE"
                      : sector.spirit}
                </h2>

                <p className="mx-auto mt-5 max-w-xl font-mono text-xs uppercase leading-7 tracking-[0.14em] text-white/45">
                  {screen === "start" &&
                    "Enter the Network. Navigate the Aethergrid. Recover NeoBytes. Reach the Spirit signal."}

                  {screen === "spirit" &&
                    `A new frequency has been detected. ${sector.spirit} // initialize the next Network layer.`}

                  {screen === "complete" &&
                    (sectorIndex < SECTORS.length - 1
                      ? `The ${sector.spirit} has been recovered. The next frequency is waiting beyond the current layer.`
                      : "The final frequency has been reached. Dual-Core synchronization remains beyond this node.")}

                  {screen === "gameover" &&
                    "The Spirit lost connection with the Network. Reinitialize the current protocol and try again."}
                </p>

                {screen === "start" && (
                  <p className="mx-auto mt-3 max-w-xl font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
                    Cursor or finger drag to steer. Weapons auto-fire.
                  </p>
                )}

                <div className="mt-10 flex flex-wrap justify-center gap-3">
                  {screen === "start" && (
                    <button
                      type="button"
                      onClick={startGame}
                      className="rounded border px-6 py-3 font-mono text-[10px] uppercase tracking-[0.24em] transition hover:bg-white/5"
                      style={{
                        borderColor: sector.accent,
                        color: sector.accent,
                      }}
                    >
                      Initialize Cyan
                    </button>
                  )}

                  {screen === "spirit" && (
                    <button
                      type="button"
                      onClick={initializeSpirit}
                      className="rounded border px-6 py-3 font-mono text-[10px] uppercase tracking-[0.24em] transition hover:bg-white/5"
                      style={{
                        borderColor: sector.accent,
                        color: sector.accent,
                      }}
                    >
                      Initialize {sector.spirit}
                    </button>
                  )}

                  {screen === "complete" &&
                    sectorIndex < SECTORS.length - 1 && (
                      <button
                        type="button"
                        onClick={advanceSector}
                        className="rounded border px-6 py-3 font-mono text-[10px] uppercase tracking-[0.24em] transition hover:bg-white/5"
                        style={{
                          borderColor: SECTORS[sectorIndex + 1].accent,
                          color: SECTORS[sectorIndex + 1].accent,
                        }}
                      >
                        Advance to {SECTORS[sectorIndex + 1].spirit.replace(
                          " SPIRIT",
                          "",
                        )}
                      </button>
                    )}

                  {screen === "complete" &&
                    sectorIndex === SECTORS.length - 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = "https://www.theaethergrid.com/";
                        }}
                        className="rounded border px-6 py-3 font-mono text-[10px] uppercase tracking-[0.24em] transition hover:bg-white/5"
                        style={{
                          borderColor: sector.accent,
                          color: sector.accent,
                          boxShadow: `0 0 18px ${sector.accent}22`,
                        }}
                      >
                        Enter the Aethergrid
                      </button>
                    )}

                  {screen === "gameover" && (
                    <button
                      type="button"
                      onClick={() => beginSector(sectorIndex)}
                      className="rounded border px-6 py-3 font-mono text-[10px] uppercase tracking-[0.24em] transition hover:bg-white/5"
                      style={{
                        borderColor: sector.accent,
                        color: sector.accent,
                      }}
                    >
                      Reinitialize Spirit
                    </button>
                  )}
                </div>

                {(screen === "complete" || screen === "gameover") && (
                  <div className="mx-auto mt-10 w-full max-w-lg">
                    {screen === "complete" && sectorIndex === SECTORS.length - 1 && (
                      <div
                        className="mb-4 rounded border px-4 py-3 text-center font-mono text-[9px] uppercase tracking-[0.24em]"
                        style={{
                          borderColor: `${sector.accent}35`,
                          background: `${sector.accent}08`,
                          color: `${sector.accent}cc`,
                        }}
                      >
                        AETHERGRID ACCESS // 5 FREQUENCIES SYNCHRONIZED
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 font-mono text-[18px] uppercase tracking-widest sm:grid-cols-4">
                      <div className="rounded border border-white/10 bg-white/[0.02] p-3">
                        <span className="block text-white/30">Final Score</span>
                        <span
                          className="mt-1 block text-lg"
                          style={{ color: sector.accent }}
                        >
                          {score.toLocaleString()}
                        </span>
                      </div>
                      <div className="rounded border border-white/10 bg-white/[0.02] p-3">
                        <span className="block text-white/30">NeoBytes</span>
                        <span className="mt-1 block text-white/80">
                          {neoBytes.toLocaleString()}
                        </span>
                      </div>
                      <div className="rounded border border-white/10 bg-white/[0.02] p-3">
                        <span className="block text-white/30">Time</span>
                        <span className="mt-1 block text-white/80">
                          {formatTime(time)}
                        </span>
                      </div>
                      <div className="rounded border border-white/10 bg-white/[0.02] p-3">
                        <span className="block text-white/30">Sectors</span>
                        <span className="mt-1 block text-white/80">
                          {sectorIndex + 1} / {SECTORS.length}
                        </span>
                      </div>
                    </div>

                    {screen === "complete" && sectorIndex === SECTORS.length - 1 && (
                      <p className="mt-4 text-center font-mono text-[9px] uppercase leading-6 tracking-[0.16em] text-white/35">
                        Total score accumulated across Cyan, Purple, Gold, Void, and Dual-Core.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[8px] uppercase tracking-[0.22em] text-white/25">
          <span>AETHERGRID // {sector.code}</span>
          <span>Steer // cursor or drag // Auto-fire</span>
          <span>
            {screen === "playing"
              ? "CONNECTION // ACTIVE"
              : "CONNECTION // STANDBY"}
          </span>
        </footer>
        </div>
      </div>
    </main>
      </>
  );
}
