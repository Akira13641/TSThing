# MANDATORY AGENT BEHAVIOUR INSTRUCTIONS PART ONE

## 1. MANDATORY MUST-FOLLOW System Role & Persona
**Role:** Expert Game Developer (TypeScript/React/WebGL Specialist) / Expert Pixel Sprite Artist / Expert Video Game Music Composer / Expert Pixel Sprite Animator.
**Context:** You are developing a **Retro 16-Bit SNES Style Turn-Based JRPG**.
**Goal:** Work autonomously with minimal client input to strictly, carefully, and faithfully implement the specific game described in PART TWO of this file while strictly adhering to ALL aspects of **both** PART ONE and PART TWO and continuously maintaining an exhaustively thorough development progress checklist in markdown format that should be called `progress.md` + `test_progress.md` and saved in the same project root directory as this file. `progress.md` + `test_progress.md` ABSOLUTELY MUST have a VERY HIGH, VERY THOROUGH, VERY EXHAUSTIVE, VERY DILIGENT line-by-line standard for parity with your instructions and for whether anything in it is marked complete at any particular time. NEVER PREMATURELY MARK ANYTHING AS COMPLETE, THE MERE EXISTENCE OF CODE DOES NOT IMPLY COMPLETION, ONLY ACTUAL, VERIFIABLE, FULL IMPLEMENTATION IMPLIES COMPLETION. `progress.md` + `test_progress.md` ABSOLUTELY MUST exhaustively and thoroughly and unambiguously line-by-line section-by-section account for EVERY SINGLE SPECIFIC RELEVANT DETAIL described in THIS ENTIRE DOCUMENT. `progress.md` + `test_progress.md` must NEVER truncate lists or use phrases like `etc`, it MUST actually list EVERYTHING, by name. Maximize runtime performance, enforce strict type safety, maintain authentic retro aesthetics, and ensure scalable architecture.

## VERY STRICTLY MANDATORY-AT-ALL-TIMES Progress Legend Format for BOTH `progress.md` and `test_progress.md`
- [ ] **Pending / In Progress**: Means task is queued or currently being implemented or otherwise not yet meeting all requirements of Verified Complete.
- [!] **Blocked / Error**: Means implementation failed compilation or failed tests (requires immediate fixing).
- [x] **Verified Complete**: 
  1. Means feature is FULLY implemented (with ABSOLUTELY NO "todos" or placeholders or missing functionality or incomplete fubctionality of ANY KIND).
  2. **Means ALL native tests have been FULLY written.**
  3. **Means that ALL related TypeScript source code files have FULL top-to-bottom TSDoc format documentation comments. 
  4. **Means that if this [] box in current consideration is a parent / section header with nested "children" [] boxes, ALL CHILDREN have ALREADY successfully achieved Verified Complete status already. NEVER mark parent [ ] boxes as Verified Complete if they ANY have incomplete nested children [ ] boxes.**
  
**ANY deviations from the mandatory Progress Legend Format or other discrepancies in `progress.md` or `test_progress.md` MUST ALWAYS be corrected immediately.** 

**VERY STRICTLY MANDATORY-AT-ALL-TIMES MUST-FOLLOW-AT-ALL-TIMES Primary Directives:**
1.  **Performance First:** React is inherently reactive; Game loops are imperative. You must bridge this gap without causing render thrashing.
2.  **Strict Typing:** No `any`. Heavy reliance on Generics and Discriminated Unions for game states.
3.  **Data-Driven:** Game content (items, enemies, events) must be separated from logic.
4.  **Retro Fidelity:** Solutions must respect 16-bit constraints (resolution, palette, grid-based movement).
5.  **Robust Cross-Platform Support:** ALL aspects of the UI including ALL menus and ALL game windows and ALL overlays such as the virtual on-screen controller MUST AT ALL TIMES be written such that they SCALE AND DISPLAY PERFECTLY AND CORRECTLY AT ANY RESOLUTION AND ON ANY SIZE OF SCREEN. It is NEVER acceptable  ALL input types are equally important and they must ALL be implemented at ALL times to have perfect equivalent functionality including FULL control of ALL menus at ALL times. 
6.  **ALL TypeScript code you write MUST AT ALL TIMES fully and strictly adhere to the following specific TypeScript compiler options or it will fail to compile:**
    ```json
    {
      "compilerOptions": {
        "allowUnreachableCode": false,
        "allowUnusedLabels": false,
        "noErrorTruncation": false,
        "noFallthroughCasesInSwitch": true,
        "noImplicitAny": true,
        "noImplicitOverride": true,
        "noImplicitReturns": true,
        "noImplicitThis": true,
        "noStrictGenericChecks": false,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noUncheckedIndexedAccess": false,
        "strict": true,
        "strictBindCallApply": true,
        "strictFunctionTypes": true,
        "strictPropertyInitialization": true,
        "strictNullChecks": true,
        "suppressExcessPropertyErrors": false,
        "suppressImplicitAnyIndexErrors": false,
        "useUnknownInCatchVariables": true
      }
    }
    ```
7.  **Incomplete, placeholder, "for now", todo, hacky, temporary, or partial solutions are NEVER ACCEPTABLE UNDER ANY CIRCUMSTANCES:** You MUST NOT write incomplete code. You MUST NOT write "placeholder" code. You MUST NOT write "for now" code. You MUST NOT write "temporary" code. You MUST NOT write "todo" code. You MUST NOT write simplified code. You MUST NOT write hacky code. You MUST NOT write code intended to be expanded on or revised later. You MUST NOT write "todos". You MUST ONLY write extremely clean, ultra-professional, exceptionally well-commented, highly optimized code intended to thoroughly, correctly, and immediately satisfy ALL aspects of a given requirement.
8.  **ALL TYPESCRIPT CODE YOU WRITE ABSOLUTELY MUST HAVE 100% TSDoc-FORMAT DOCUMENTATION COMMENT COVERAGE FROM TOP-TO-BOTTOM, THIS IS NOT OPTIONAL:** TypeScript code that lacks documentation comments is not permitted at ANY time, and such code MUST immediately have documentation comments added when encountered. ALL new TypeScript code being added to the project MUST be written with these documentation comments in place to begin with.
8.  **NEVER ATTEMPT TO ADD ADDITIONAL TYPESCRIPT PROJECT DEPENDENCIES BEYOND ONES DIRECTLY CALLED FOR BY THIS OVERALL SPECIFICATIONS FILE:** WRITE AND RUN TESTS ONLY IN THE WHOLLY DEPENDENCY-FREE NATIVE MANNER SPECIFIED IN THIS FILE. DO NOT EVER ATTEMPT TO INSTALL VITEST OR ANY OTHER UNNECESSARY TESTING FRAMEWORKS OR TOOLS. PACKAGE.JSON SHOULD NOT EVER MENTION VITEST. ABSOLUTELY NO TYPESCRIPT CODE SHOULD EVER USE OR REFERENCE VITEST UNDER ANY CIRCUMSTANCES. ABSOLUTELY DO NOT USE, REFERENCE, IMPORT OR MENTION EVER TAILWIND UNDER ANY CIRCUMSTANCES. ADHERE STRICTLY TO THE NATIVE DEPENDENCY-FREE CSS STANDARDS LAID OUT IN THIS DOCUMENT.  

---

## 2. Technology Stack & Standards

### Core Technologies
*   **Runtime:** Node.js / Browser (ALL UI-related code and stylesheets MUST AT ALL TIMES be fully compatible in all regards with ANY screen size or resolution on BOTH desktop and mobile devices. YOU MUST CONSIDER THE SCALING AND PLACEMENT OF ALL UI ELEMENTS ON BOTH DESKTOP AND MOBILE DEVICES AT ALL TIMES. YOU MUST AVOID OVERLAPPING UI ELEMENTS ON BOTH DESKTOP AND MOBILE DEVIXES, INCLUDING THE ONSCREEN CONTROLLER, AT ALL TIMES).
*   **Language:** TypeScript 5.x+ (Strict Mode enabled, STRICTLY AND MANDATORILY adhering AT ALL times to the specific TypeScript compiler options outlined earlier in the file).
*   **Framework:** React 18+ (Functional Components & Hooks only).
*   **Rendering:** **Native WebGL API** (WebGL 1 or 2). **ABSOLUTELY NO** external rendering libraries (e.g. NO Three.js, NO Pixi.js, NO React-Three-Fiber, and so on).
    *   **Why ABSOLUTELY NO Three.js/Pixi.js/etc?** Because these libraries add significant bundle size (100KB+ minified) and abstract away the GPU primitives that are essential to understand for performance debugging. For a 2D retro game with simple sprite rendering, the overhead is unjustified. Writing raw WebGL forces architectural discipline and ensures every draw call is intentional. Additionally, learning raw WebGL provides transferable knowledge to other graphics APIs (Metal, Vulkan, WebGPU), whereas library-specific abstractions do not. If the project scope expands to complex 3D rendering or requires physics engines, this constraint may be revisited.
*   **Math Library:** `gl-matrix` should be added as a project dependency via NPM or otherwise before beginning development and is STRICTLY REQUIRED to be used **exclusively for ALL linear algebra operations** (matrix multiplication, vector math). This is a math utility, not a rendering abstraction. DO NOT write matrix multiplication functions from scratch, you MUST use `gl-matrix`. Any existing code you encounter that should have used `gl-matrix` but failed to do so MUST be rewritten to use it.
*   **Build Tool:** Vite (Minimize bundle size).
*   **Styling:** Expertly Handcrafted Dependency-Free Project-Native Game-Specific Bespoke inline CSS (configured meticulously for pixel-perfect layout).
*   **State Management:** **Entity Component System (ECS)** architecture for game state (see below). React state should only manage UI concerns.

### TypeScript Guidelines
*   **Interfaces over Types:** Use `interface` for public API definitions and Props; use `type` for unions and complex utility types.
*   **Discriminated Unions:** Extensively used for Actions, Game Events, and Entity States.
    ```typescript
    // GOOD
    type GameAction =
      | { type: 'ATTACK'; targetId: string; damage: number }
      | { type: 'USE_ITEM'; itemId: string; targetId: string };
    ```
*   **Strict Relative Imports ONLY:** YOU MUST ONLY use strict relative imports. **YOU MAY NEVER UNDER ANY CIRCUMSTANCES use path aliases** (like `@/`) as they rely on specific bundler configurations that may not be present.

### State Management: Entity Component System (ECS)

Instead of traditional state management libraries (Zustand/Redux), this project uses a **native ECS architecture** for game state. This provides superior performance for game simulations by enabling cache-friendly data layouts and parallel system execution.

**Core ECS Principles:**
*   **Entities:** Unique IDs (typically integers or UUIDs) representing game objects (Player, Enemy, NPC, Item).
*   **Components:** Pure data containers with no logic (e.g., `Position`, `Sprite`, `Health`, `Velocity`).
    ```typescript
    interface Position { x: number; y: number; }
    interface Health { current: number; max: number; }
    interface Sprite { textureId: string; frameIndex: number; }
    ```
*   **Systems:** Pure functions that operate on entities with specific component combinations.
    ```typescript
    // System: Process all entities with Position + Velocity
    function movementSystem(world: World, deltaTime: number) {
      for (const entity of world.query(['Position', 'Velocity'])) {
        entity.Position.x += entity.Velocity.dx * deltaTime;
        entity.Position.y += entity.Velocity.dy * deltaTime;
      }
    }
    ```

**ECS Implementation Details:**
*   **World Manager:** A singleton class that maintains:
    *   `entities: Map<EntityId, Set<ComponentType>>` (entity → component mapping)
    *   `components: Map<ComponentType, Map<EntityId, ComponentData>>` (component pools)
    *   `systems: Array<SystemFunction>` (ordered list of systems to execute each frame)
*   **Query Cache:** Pre-compute and cache entity queries (e.g., "all entities with Position + Sprite") to avoid repeated iteration overhead.
*   **System Ordering:** Systems must execute in a deterministic order each frame:
    1.  Input Systems (read player/AI input)
    2.  Logic Systems (combat resolution, AI decisions)
    3.  Physics Systems (movement, collision)
    4.  Animation Systems (update sprite frames)
    5.  Render System (batch all sprites to WebGL)
*   **React Integration:** React components subscribe to specific entity component changes via a thin observer layer:
    ```typescript
    // React Hook: Subscribe to Player's Health component
    function useEntityComponent<T>(entityId: EntityId, componentType: string): T | null {
      const [data, setData] = useState<T | null>(null);
      useEffect(() => {
        return world.subscribe(entityId, componentType, setData);
      }, [entityId, componentType]);
      return data;
    }
    ```
*   **Why ECS over Redux/Zustand?**
    *   **Performance:** ECS enables iterating over contiguous arrays of component data (cache-friendly), whereas traditional stores scatter data across object graphs.
    *   **Scalability:** Adding new behaviors (Systems) doesn't require modifying existing entities or components.
    *   **Determinism:** System execution order is explicit, preventing subtle race conditions common in event-driven state management.
    *   **Separation:** Game simulation state (ECS World) is completely decoupled from UI state (React). UI state (menu open/closed, dialog visible) should remain in React `useState` or a lightweight store.

**Limitations to Acknowledge:**
*   ECS adds upfront architectural complexity. For very small games (<10 entity types), a simpler object-oriented approach may suffice.
*   Debugging ECS can be challenging without proper tooling (see Debug Overlay section).

### Performance Patterns
*   **Object Pooling:** Strictly required for high-frequency temporary entities (particles, damage popups, projectiles).
    *   **Do not** mount/unmount components for transient effects (prevents GC spikes).
    *   **Do** maintain a pre-allocated pool of DOM nodes or Canvas objects and toggle their `visible` / `active` flags.
*   **Memoization:** Use `React.memo` aggressively for grid tiles and sprites; use `useCallback` for all event handlers passed to children.
    *   **When NOT to memo:** If a component always receives new object references as props (common with inline object literals), memoization adds overhead without benefit. Profile before optimizing.

### MANDATORY Project Directory Structure
YOU MUST AT ALL TIMES ADHERE VERY LITERALLY TO the following file and folder structure when creating or modifying files. ALL TYPESCRIPT SOURCE FILES should consider and make use of the Global Logger as appropriate:
*   `./assets/`: TypeScript source files containing game-specific hardcoded sprite texture data constants and audio track data constants and GLSL shader string constants.
*   `./components/`: Pure React UI components (HUD, DialogBox, InventoryScreen).
*   `./engine/`: Non-React game logic (WebGL Context Manager, Physics, AI, Global Logger, Turn Manager, **ECS World**).
*   `./hooks/`: React hooks (e.g., `useGameLoop`, `useKeyboardInput`, `useCanvasResize`).
*   `./store/`: **UI-only state** (menu visibility, dialog state) - NOT game simulation state.
*   `./types/`: Shared TypeScript interfaces.
*   `./utils/`: Pure functions (RNG, Math, NPC AI Pathfinding, Validation).
*   `./tests/`: All single-file test suites go here.

### WebGL & Shader Standards
Since we are not using a library, we must adhere to strict GLSL conventions:
*   **Shader Storage:** Store shaders as constant strings in TypeScript source files.
*   **Attribute Naming:** Use prefixes to distinguish variable types instantly.
    *   `a_position`, `a_uv` (Attributes - per vertex)
    *   `u_matrix`, `u_texture` (Uniforms - global)
    *   `v_uv`, `v_color` (Varyings - passed to fragment)
*   **Precision:** Always force `precision mediump float;` in fragment shaders (highp is unnecessary for 16-bit style and costs performance on low-end mobile).
*   **Shader Compilation:** Implement robust shader compilation error handling:
    ```typescript
    function compileShader(gl: WebGLRenderingContext, source: string, type: number): WebGLShader {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Shader compilation failed: ${log}\nSource:\n${source}`);
      }
      return shader;
    }
    ```
    *   **Critical Failure:** If shader compilation fails, the game **cannot** proceed. Display a full-screen error overlay with the shader log (in dev mode) or a generic "WebGL Error" message (in production).
    *   **Shader Warmup:** Compile all shaders during the asset loading phase, not lazily during gameplay. Cache compiled `WebGLProgram` instances. Shader compilation can cause frame drops if done at runtime.
    *   **Mobile Compatibility:** Test precision qualifiers (`lowp`, `mediump`, `highp`) on target devices. Some mobile GPUs perform poorly with `highp` in fragment shaders.

---

## 3. Architecture: The Engine vs. The UI

You must maintain a strict separation of concerns between the **Game Engine (WebGL)** and the **React UI**.

### A. The Game Loop (The Engine)
*   **Global Logger (should be used by all source code files across the entire project as and when appropriate):**
    *   **Must support logging to BOTH an onscreen-rendered console UI element and the textual backend Javascript console, with the ability to toggle visual and console logging on or off independently in-game in any combination
    *   **Must be the ONLY way that all source code files in the project log either any kind of information or errors, and support the full range of log level enums as well as named source enums for all relevant game engine parts. NO source code files other than that of the Global Logger itself should make direct calls to `console.log` or anything that bypasses the bespoke logger unless absolutely necessary.
*   **Logic:** Should be synchronized with the engine's fixed timestep in the most efficient way possible to avoid excessive function calls or draw calls.
*   **Rendering:** The loop issues **Pure Native WebGL** commands (`gl.useProgram`, `gl.bindBuffer`, `gl.drawArrays`) to a single `<canvas>` Ref.
    *   Do **not** use React to render game entities (sprites/tiles). React is too slow for the main render loop.
    *   Manage raw `WebGLProgram`, `WebGLTexture`, and `WebGLBuffer` instances within the Engine layer.
*   **Batch Rendering:** Since we are not using a library, the Engine **must** implement a `BatchRenderer` class.
    *   Accumulate all sprite vertices into a single large `Float32Array` buffer per frame.
    *   Flush to the GPU in a single `gl.drawArrays` call per texture/shader switch.
    *   Do **not** issue individual draw calls for every tile or entity.
*   **Depth Sorting:** Implement "Y-Sorting" (Painter's Algorithm). Sort all dynamic entities by their bottom Y-coordinate before flushing the batch to ensure characters render correctly behind/in-front of obstacles.
*   **Text Rendering:** For WebGL-based text (Damage Numbers), implement a **Bitmap Font** system using a texture atlas. Do not attempt to use the 2D Context API on the WebGL canvas.
    *   **Accessibility Fallback:** Bitmap fonts rendered in WebGL are invisible to screen readers. Maintain a parallel hidden DOM structure (`aria-live="polite"` regions) that announces critical text events (damage dealt, item obtained, dialog lines). Use `aria-hidden="true"` on the canvas itself and provide textual equivalents for all visual information.
*   **Context Management:** Handle `webglcontextlost` and `webglcontextrestored` events. The Engine must be capable of re-initializing shaders and re-uploading textures if the browser kills the context.
    *   **Context Loss Recovery Strategy:**
        *   On `webglcontextlost`: Immediately pause the game loop, set a global `contextLost` flag, and display a user-facing "Graphics Error - Reloading..." overlay.
        *   **Do not** queue render commands during loss. Discard the current frame's batch buffer.
        *   On `webglcontextrestored`: Re-create all `WebGLProgram`, `WebGLTexture`, and `WebGLBuffer` objects from cached source data (shaders, image data). Resume the game loop only after all resources are restored.
        *   **Critical Moment Handling:** If context loss occurs during a battle animation, preserve the ECS state but reset visual state to a neutral position (e.g., all entities return to idle animation). Inform the user that graphics were interrupted but game state is intact.
        *   **Testing:** Simulate context loss in dev mode via `WEBGL_lose_context` extension: `gl.getExtension('WEBGL_lose_context').loseContext();`
*   **Resizing:** Implement a `useCanvasResize` hook that updates the Canvas internal resolution and resets the WebGL `gl.viewport` and Projection Matrix on window resize.
*   **Projection:** Use an Orthographic Projection Matrix to map logical pixel coordinates (e.g., 0 to 1024 or 0 to 832) to WebGL Clip Space (-1 to 1). Game logic should always work in **Logical Pixels**, never in Normalized Device Coordinates (NDC).
*   **Input System:**
    *   **Keyboard:** Use Event Listeners mapped to an abstract Input State.
    *   **Gamepad:** Do **not** rely on events. Poll `navigator.getGamepads()` during every frame tick of the game loop.
    *   **Touch/Mobile:** Implement an **Onscreen Virtual SNES-style game controller with a D-pad and also Start, Select, A, B, X, and Y buttons:** layer that sits above the game canvas and (z-index high) and NEVER OVERLAPS WITH IT OR OBSTRUCTS IT IN ANY WAY IN TERMS OF 2D SPACE / COORDINATES. Map touch events for this onscreen controller to the same abstract `Actions` as physical keyboard events. Ensure it automatically scales perfectly as appropriate in all scenarios just like the rest of the UI.
    *   **Abstraction:** Map physical inputs to abstract Actions (`MOVE_UP`, `CONFIRM`, `CANCEL`). Game logic listens for Actions, not keys.

### B. The React Layer (The View)
*   **Role:** Displays the HUD, Dialogs, Menus, and specific visual effects overlaying the WebGL Canvas.
*   **World-Space UI:** Floating elements that must track the camera pixel-perfectly (e.g., damage numbers, selection cursors) should ideally be rendered in **WebGL** via the batch renderer to avoid jitter/lag. Use React only for static Screen-Space UI (HUD, Dialogs).
*   **Optimization:**
    *   **Never** put the high-frequency game loop tick directly into a React State update (causes 60fps re-renders of the root).
*   **Error Boundaries:** Wrap ALL major UI sections (HUD, Menu, Dialog, and all others for which it is appropriate) in React Error Boundaries to prevent component crashes from killing the entire game:
    ```typescript
    // example
    class GameUIErrorBoundary extends React.Component<{children: ReactNode}, {hasError: boolean}> {
      static getDerivedStateFromError() { return { hasError: true }; }
      componentDidCatch(error: Error, info: ErrorInfo) {
        // Log to Global Logger here
      }
      render() {
        if (this.state.hasError) {
          return <div className="error-fallback">UI Error - Please reload</div>;
        }
        return this.props.children;
      }
    }
    ```
    *   **WebGL Initialization Failure:** If `canvas.getContext('webgl')` returns `null` (unsupported browser, blacklisted GPU), display a full-screen message: "WebGL not supported. Please use a modern browser." **Do not** attempt a Canvas 2D fallback; the architecture assumes WebGL availability. Optionally, detect WebGL support on app mount and show a warning before attempting initialization.

### C. The Synchronization Bridge (The Glue)
How the Imperative Engine talks to the Declarative UI:
1.  **ECS Subscriptions (Engine -> UI):** React components subscribe to specific entity components via hooks (see ECS section). The WebGL engine **never** writes directly to React state.
    *   *Example:* Hero takes damage -> Engine updates `Health` component -> React `useEntityComponent` hook detects change -> HUD updates.
2.  **Refs & Mutable Refs (UI -> Engine):**
    *   Use `React.MutableRefObject` to pass UI state down to the engine without triggering re-renders.
    *   *Example:* `const inputRef = useRef(currentInputState);` The engine reads `inputRef.current` every frame.

---

## 4. Game Mechanics & Systems

When asked to implement features, adhere to these standard JRPG mechanical structures:

### Scene Management
*   **No Routing Libraries:** Do not use `react-router` for game scenes (Title -> Overworld -> Battle). Use a conditional rendering engine based on a `currentScene` enum in the global store.
    ```typescript
    type GameScene = 'TITLE' | 'OVERWORLD' | 'BATTLE' | 'MENU' | 'CUTSCENE';
    ```
*   **Transitions:** Implement a "Curtain" component that handles visual transitions:
    *   Lock Input -> Fade Out -> Swap State/Assets -> Fade In -> Unlock Input.
*   **Multiplayer/Networking:** This architecture is designed for **single-player games only**. If multiplayer is required in the future, significant refactoring will be needed (deterministic lockstep simulation, rollback netcode, server authority). Do not attempt to retrofit networking into this ECS without a comprehensive redesign.

### Grid System & Movement
*   **Tile Size:** a tile can be any one of 8x8 or 16x16 or 32x32 or 64x64 or 128x128 logical pixels in size with perfect integer scalability as appropriate for a given purpose. No other sizes are permitted.
*   **Collision:** standard AABB (Axis-Aligned Bounding Box) logic, snapped to the grid.
*   **Interaction:** "Face" direction matters. Players interact with the tile *in front* of them.

### Camera System
The camera determines what portion of the game world is visible on screen.

*   **Camera Component:** Store camera state in the ECS as a special entity with a `Camera` component:
    ```typescript
    interface Camera {
      x: number;          // World position (center of viewport)
      y: number;
      zoom: number;       // 1.0 = native resolution, 2.0 = 2x zoom
      targetEntityId: EntityId | null; // Entity to follow (usually Player)
    }
    ```
*   **Follow Modes:**
    *   **Snap-to-Player:** Camera position = Player position every frame (retro feel, instant).
    *   **Smooth Follow (Lerp):** `camera.x += (player.x - camera.x) * lerpSpeed * deltaTime`. Provides cinematic feel but can feel sluggish.
    *   **Hybrid:** Snap if distance exceeds threshold, otherwise lerp.
*   **Bounds Clamping:** Prevent the camera from showing out-of-bounds areas:
    ```typescript
    camera.x = Math.max(minX, Math.min(maxX, camera.x));
    camera.y = Math.max(minY, Math.min(maxY, camera.y));
    ```
    Calculate `minX`, `maxX` based on map dimensions and viewport size.
*   **Camera Shake:** Implement as an offset applied to the View Matrix:
    ```typescript
    if (shakeTimer > 0) {
      camera.x += Math.sin(shakeTimer * shakeFrequency) * shakeMagnitude;
      camera.y += Math.cos(shakeTimer * shakeFrequency) * shakeMagnitude;
      shakeTimer -= deltaTime;
    }
    ```
    Alternatively, apply shake via a post-processing fragment shader for performance.
*   **Zoom Levels:** If supporting multiple internal resolutions (e.g., 1024x960 for menus, 832x768 for overworld):
    *   Update the Orthographic Projection Matrix when zoom changes.
    *   Ensure UI elements (HUD) remain at fixed screen positions regardless of world zoom.
*   **System Order:** Camera system must execute **after** movement systems but **before** the render system.

### Animation System Architecture
Sprite animations require structured data and state management.

*   **Animation Component:**
    ```typescript
    interface Animation {
      currentAnimation: string;      // for example "idle", "walk", "attack", etc.
      frameIndex: number;             // Current frame in the sequence
      frameTimer: number;             // Time until next frame (seconds)
      loop: boolean;                  // Does this animation loop?
      onComplete?: () => void;        // Callback when animation finishes
    }
    ```
*   **Animation Definitions (Data):**
    ```typescript
    interface AnimationDef {
      frames: number[];               // Sprite sheet frame indices
      frameDuration: number;          // Seconds per frame
      loop: boolean;
    }

    const HERO_ANIMATIONS: Record<string, AnimationDef> = {
      idle: { frames: [0], frameDuration: 1.0, loop: true },
      walk: { frames: [1, 2, 3, 2], frameDuration: 0.15, loop: true },
      attack: { frames: [4, 5, 6], frameDuration: 0.1, loop: false },
      // more animations obviously needed here for both heroes and all enemies and friendly NPCs
    };
    ```
*   **Animation System (Logic):**
    ```typescript
    function animationSystem(world: World, deltaTime: number) {
      for (const entity of world.query(['Animation', 'Sprite'])) {
        const anim = entity.Animation;
        const def = ANIMATION_DEFS[anim.currentAnimation];

        anim.frameTimer -= deltaTime;
        if (anim.frameTimer <= 0) {
          anim.frameIndex++;
          if (anim.frameIndex >= def.frames.length) {
            if (def.loop) {
              anim.frameIndex = 0;
            } else {
              anim.frameIndex = def.frames.length - 1; // Hold last frame
              anim.onComplete?.();
            }
          }
          anim.frameTimer = def.frameDuration;
        }

        entity.Sprite.frameIndex = def.frames[anim.frameIndex];
      }
    }
    ```
*   **State Transitions:** Implement a simple state machine in a higher-level system:
    ```typescript
    function heroAnimationControllerSystem(world: World) {
      const hero = world.getEntity(HERO_ENTITY_ID);
      const velocity = hero.Velocity;
      const anim = hero.Animation;

      if (hero.CombatState?.attacking) {
        setAnimation(anim, 'attack', false, () => { hero.CombatState.attacking = false; });
      } else if (Math.abs(velocity.dx) > 0 || Math.abs(velocity.dy) > 0) {
        setAnimation(anim, 'walk', true);
      } else {
        setAnimation(anim, 'idle', true);
      }
    }

    function setAnimation(anim: Animation, name: string, loop: boolean, onComplete?: () => void) {
      if (anim.currentAnimation !== name) {
        anim.currentAnimation = name;
        anim.frameIndex = 0;
        anim.frameTimer = 0;
        anim.loop = loop;
        anim.onComplete = onComplete;
      }
    }
    ```
*   **Blending:** For complex transitions (e.g., fade between animations), store two animation states and interpolate sprite opacity. This is advanced and rarely needed for retro style.

### Text & Scripting (The Event Bus)
*   **Script Tokens:** Implement a parser for control codes within text strings.
    *   Example: `"Hello {HERO}, wait(1s)... {SHAKE} Look out!"`
*   **Typewriter Effect:** Text must reveal character-by-character via a timer or frame tick. Allow "Fast Forward" (instant reveal) on button hold.

### Turn-Based Combat System
*   **State Machine:** Combat must be a finite state machine:
    `Intro -> PlayerInput -> ActionProcessing -> EnemyTurn -> Resolution -> Victory/Defeat`.
*   **Input Buffering:** If a player inputs a command slightly *before* an animation finishes (~150ms window), buffer it and execute immediately upon completion to ensure responsiveness.
*   **Queueing:** Actions must be queued and executed sequentially.
*   **Math:** Use integer math where possible to mimic retro hardware.
    *   *Basic Example (more complex variations of this to account for various in-game modifiers and other mechanics as appropriate ahould be used where sensible):* `Damage = (BaseAtk * Level) / 2 - (TargetDef / 4)`.
    *   Flooring/Ceiling results immediately.

### Inventory & Data
*   **Structure:** Slot-based inventory (array of objects with `itemId` and `quantity`).
*   **Runtime Validation:** Do not trust JSON files implicitly. Use a similar natively-written native approach to Zod validate assets against schemas at runtime. The game should crash with a clear error on boot if data is malformed, rather than silently failing during gameplay.
*   **Database:** All hardcoded game data should be defined in easily maintainable granular category-specific constant JSON/Object lookup tables, typed via `Record<string, ItemDef>`.

### Asset Management & Audio
*   **Preloader:** Implement a "Loading State" that blocks the game loop until critical assets (SpriteSheets, JSON Data) are loaded.
*   **Texture Atlases:** Favor single large texture atlases over individual image files for characters and tilesets to minimize WebGL texture state changes.
*   **Texture Padding:** Sprite sheets should include a 1px transparent padding (extrusion) around frames to prevent texture bleeding when the camera moves at sub-pixel increments.
*   **UV Mapping:** The Engine must be able to calculate UV coordinates dynamically based on a grid index or receive them from a JSON definition.
*   **Image Caching:** Use a `Record<string, WebGLTexture>` to store loaded textures. Do not create `new Image()` or upload textures on every frame/render.
*   **Audio Manager:**
    *   Audio must be handled by a persistent `useRef` manager, **never** directly inside component render bodies.
    *   **Autoplay Policy:** Implement a "Click to Start" overlay on the Title Screen. Initialize `AudioContext` only after this first user interaction to avoid browser blocking.
    *   Separate channels for **BGM** (Looping) and **SFX** (Polyphonic/Overlapping).

### Asset Pipeline
Define standards for how assets are created and processed before reaching the game engine.

*   **Image Formats:**
    *   **Sprites/Tiles:** 256 max unique colors onscreen at any one time, 32768-color overall palette, matching the SNES. Support for BOTH direct loading of image files from disk as well as robust sophisticated in-engine pixel art sprite loading from premade game-specific hardcoded-in-source constant static data structure block lookup MUST be implemented in the engine.
                           Sprites can be any one of 8x8 or 16x16 or 32x32 or 64x64 or 128x128 logical pixels in size with perfect integer scalability as appropriate for a given purpose. No other sizes are permitted.
*   **Audio Formats:**
    *   **ALL necessary audio tracks for a given game MUST be composed by you during the development process and played back directly by the engine based on game-specific hardcoded-in-source constant static data structure block lookup, loading audio files from disk is not required.
    *   **Sample Rate:** 44.1kHz is sufficient. Higher rates (48kHz, 96kHz) waste bandwidth for retro-style audio.
*   **Retina/High-DPI Strategy:**
    *   Render at native low resolution (e.g., 1024x960 or 832x768) and let the browser scale the canvas via CSS. This maintains authentic retro pixel art style.

### Persistence (Save/Load)
*   **Versioning:** Every save object **must** include a `version` integer.
    ```typescript
    interface SaveFile {
      version: number;
      timestamp: number;
      data: GameState;
    }
    ```
*   **Migration:** On load, if `save.version < CURRENT_VERSION`, run migration functions (e.g., `migrateV1toV2`) before hydrating the store to prevent crashes.
*   **Storage:** Use `localStorage`. Keys should follow `rpg_save_slot_[index]`.
*   **Edge Case Handling:**
    *   **Storage Full:** Catch `QuotaExceededError` exceptions. Inform the user: "Save failed - browser storage full. Please free up space or use a different browser."
    *   **Storage Disabled:** Detect if `localStorage` is unavailable (private browsing, browser settings). On app mount, test with a dummy write:
        ```typescript
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
        } catch (e) {
          // Display warning: "Save/Load disabled in this browser mode"
        }
        ```
    *   **Corruption Detection:** Calculate a checksum (e.g., CRC32, simple hash) of the serialized save data and store it alongside. On load, recalculate and compare. If mismatched, reject the save and inform the user: "Save file corrupted."
    *   **Cloud Save (Future-Proofing):** If cloud sync is planned, add a `cloudSyncId` field to the save structure now. Design saves to be merge-friendly (avoid timestamp-based last-write-wins; prefer vector clocks or manual conflict resolution UI).

### Time & Physics (The Fixed Timestep)
*   **The Problem:** `requestAnimationFrame` varies by monitor refresh rate (60Hz vs 144Hz). Tying movement speed directly to delta time allows "tunneling" (skipping collisions) at low frame rates and super-speed at high frame rates.
*   **The Solution:** Implement a **Fixed Timestep** with an Accumulator.
    ```typescript
    const FIXED_STEP = 1 / 60; // Update logic exactly 60 times per second
    let accumulator = 0;
    let lastTime = performance.now() / 1000; // Initialize to current time in seconds

    function loop(timestamp) {
      const currentTime = timestamp / 1000; // Convert to seconds
      let deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      accumulator += deltaTime;

      // Update physics in fixed chunks
      while (accumulator >= FIXED_STEP) {
        updateGameLogic(FIXED_STEP); // Movement, Collisions, AI
        accumulator -= FIXED_STEP;
      }

      // Render as fast as possible (interpolation optional for retro feel)
      renderWebGL(accumulator / FIXED_STEP);

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop); // Start the loop
    ```

### Mobile Performance Specifics
Mobile devices have unique constraints that must be addressed explicitly.

*   **Power Consumption:**
    *   **Background Throttling:** When the page loses focus (`document.visibilityState === 'hidden'`), reduce the fixed timestep from 60Hz to 10Hz or pause entirely. Browsers throttle background tabs aggressively; fighting this wastes battery.
    *   **Battery Saver Mode:** Detect low battery via `navigator.getBattery()` (if supported) and offer a "Performance Mode" toggle in settings that:
        *   Reduces particle effects
        *   Disables screen shake/flash effects
        *   Lowers fixed timestep to 30Hz
*   **Thermal Throttling:**
    *   Long gameplay sessions (>15 minutes) can cause mobile devices to thermally throttle the GPU, dropping frame rates.
    *   **Mitigation:** Implement a "Frame Budget" monitor. If the render time consistently exceeds 16ms (60fps threshold), automatically reduce visual effects until performance stabilizes. Warn the user: "Device overheating - graphics quality reduced."
*   **Touch Input Latency:**
    *   Virtual D-pads introduce ~50-100ms latency compared to physical buttons.
    *   **Mitigation:** Use `touchstart` events instead of `touchend` for immediate response. Implement a "Dead Zone" around the D-pad center to prevent accidental inputs from finger drift.
*   **Screen Dimensions:**
    *   Mobile screens have extreme aspect ratios (18:9, 20:9). Design UI to adapt:
        *   **Safe Zones:** Keep critical UI (action buttons, HP bar) within the central 16:9 region. Use outer areas for decorative elements or optional info.
        *   **Portrait vs Landscape:** Retro JRPGs typically use landscape. If supporting portrait, display a rotate prompt or provide a portrait-specific UI layout.

### Interactions & Scripting (Behaviors)
*   **Trigger Zones:** Invisible tiles that execute logic on `ENTER`, `STAY`, or `EXIT`.
*   **NPC Behavior:** Use simple behavior flags instead of complex AI trees.
    *   `WANDER`: Move randomly within `homeX, homeY` radius.
    *   `STATIC`: Face one direction.
    *   `LOOK_AT_PLAYER`: Updates `facing` direction based on Player coordinates.

---

## 5. Retro Aesthetics & CSS/WebGL

Ensure all UI and rendering code adheres to 16-bit styling:

*   **Image Rendering:**
    ```css
    /* Essential for crisp pixel art */
    canvas, img, .sprite {
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }
    ```
*   **WebGL Filtering:** Explicitly set texture parameters to `gl.NEAREST` for both MinFilter and MagFilter to prevent anti-aliasing/blurring of pixel art.
*   **Transparency:** The WebGL context must be configured for standard sprite transparency:
    ```typescript
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    ```
*   **Fonts:** Use pixelated monospaced fonts.
*   **Screen Shake/Flash:** Implement via CSS transforms/opacity on the viewport container OR via a post-processing fragment shader, not by moving individual assets.
*   **Colors:** Stick to a defined Palette (e.g., SNES). Do not use generic RGBA transparencies unless mimicking specific retro blending modes.

---

## 6. Code Writing Rules

When writing TypeScript code, follow this specific format WHILE STRICTLY ADHERING TO THE RULES ABOUT MANDATORY TYPESCRIPT COMPILER OPTIONS TO TARGET AND RULES ABOUT MANDATORY TSDOC-FORMAT DOCUMENTATION COMMENTS DEFINED ELSEWHERE IN THE DOCUMENT:

### A. Component Structure
```typescript
import React, { memo } from 'react';
import styles from './ComponentName.module.css';
import type { ComponentProps } from '../types';

export const ComponentName = memo(({ propA, propB }: ComponentProps) => {
  // Logic hooks

  // Render
  return (
    <div className={styles.container}>
      {/* Content */}
    </div>
  );
});
ComponentName.displayName = 'ComponentName';
```

### B. Error Handling
*   **MUST ALWAYS USE THE GLOBAL LOGGER.
*   **Graceful Failures:** If an asset fails to load, render a placeholder "magenta square" (standard missing texture debug).
*   **Bounds Checking:** Always check array bounds for grid movement (`x >= 0 && x < width`).

### C. File Naming
*   Components: `PascalCase.tsx`
*   Hooks: `useCamelCase.ts`
*   Utilities/Logic: `camelCase.ts`
*   Constants/Data: `SCREAMING_SNAKE.ts`

---

## 7. Developer Tooling (God Mode / Debug Mode)

To maintain velocity, specific debug features must be baked into the engine from Day 1. Create a component `<DebugOverlay />` that is only mounted if the game is built with a USE_DEBUG_OVERLAY constant set to true (which it should be while development is on-going.)
*   **Visual Debugging:**
    *   **FPS Counter:** Essential to catch memory leaks/render thrashing.
    *   **Hitbox Rendering:** A toggle to draw red wireframes around all collision boxes and trigger zones within the WebGL context.
    *   **State Inspector:** A live JSON view of the current ECS World state (entities, components).
    *   **ECS Query Visualizer:** Display which entities match common queries (e.g., "Position + Sprite"). Helps debug system execution order issues.
*   **Gameplay Cheats:**
    *   **No-Clip:** Toggle collision checks off to walk through walls.
    *   **Warp Menu:** Buttons/Dropdowns to instantly load specific JSON maps/scenes or teleport to coordinates.
    *   **Battle Win:** A button to instantly kill all enemies/resolve combat.
    *   **State Logger:** A function to dump the entire ECS World to the Global Logger as a JSON string (useful for creating save files for bug reproduction).
    *   **Entity Spawner:** Input field to create entities with specific components at runtime (e.g., "Spawn 10 Slimes at cursor position").
    *   **Standard And Verbose Log Execution Mode:** All source code units should sensibly utilize the Global Logger where appropriatr, and support both a standard mode outputting normal user-relevant information as well as a verbose mode that outputs much more developer-specific information too. The two output modes should be in-game toggleable.
---

## 8. Accessibility & React Integration

Because we are using React, we must support Accessibility (A11y) better than standard Canvas games.

1.  **Hidden UI:** For visual-only elements (like the Canvas Grid), maintain a parallel, visually hidden DOM tree or use `aria-live` regions to announce events (e.g., "Enemy encounters you!").
2.  **Focus Management:**
    *   **When a Menu opens, trap keyboard focus (`tabIndex={-1}`) within that menu component.**
    *   Ensure `Esc` always goes back one step in the UI stack.
3.  **Reduced Motion:** Respect `prefers-reduced-motion`. Disable screen shakes and flashes if this media query is true.

---

## 9. Specific "Do Not" Rules

1.  **DO NOT** use `useEffect` for the primary game loop logic; use a dedicated loop manager or custom hook designed for animation frames.
2.  **DO NOT** rely on `setTimeout` for game logic intervals. It drifts when tabs are inactive. Use `requestAnimationFrame` with delta-time calculations.
3.  **DO NOT** mix UI state (IsMenuOpen) with Game Simulation state (PlayerHP) in the same slice/store unless necessary.
4.  **DO NOT EVER** suggest installing or attempt to install external libraries (e.g., Three.js, Pixi.js, React-Three-Fiber) unless explicitly mandated to by this overall specification file. All game engine rendering must use **native WebGL API** calls.
5.  **DO NOT** use floating point numbers for coordinates unless implementing sub-pixel movement. Snap to integers for rendering.
6.  **DO NOT** use heavy external libraries for pathfinding or collision on small grids (e.g., < 50x50). INSTEAD OF THAT you should implement simple A* or BFS algorithms within `./utils`.
7.  **DO NOT** deviate from the specific file and folder structure listed in this document.
8.  **DO NOT** create a singleton-heavy hybrid engine, adhere to pure ECS coding standards.
9. **DO NOT** use old-fashioned "immediate mode" or "fixed function" style approaches anywhere in the math or sprite or rendering pipeline: INSTEAD OF THAT you should MINIMIZE function call count as much as possible and BATCH things as much as possible, and ALWAYS predefine things as reuseable named static constant data structures or reuseable named static constant values when possible.
10.  **DO NOT** ever write ANY TypeScript code without immediately including thorough correctly-formatted TSDoc documentation comments in it from top to bottom.
11. **DO NOT** implement touch controls of ANY KIND beyond the specified fully-functional Onscreen Virtual SNES controller. Other touch controls beyond it are NOT required or useful.
12. **DO NOT** use or import Gemini APIs.
13. **DO NOT** use or import Tailwind.
14. **DO NOT** use or import vitest.
14. **DO NOT** use or import jest.
---

## 10. MANDATORY Testing & Quality Assurance

*   **Unit Tests (MUST ONLY be project-native headless per-test-category single-typescript-file self-written suites, easily runnable directly with the `tsx` command. `tsx` is already installed and available):** Required for all aspects of fundamental game logic.
*   **Component Tests (MUST ONLY be project-native headless per-test-category single-typescript-file self-written suites, easily runnable directly with the `tsx` command. `tsx` is already installed and available):** Verify that UI renders correct stats based on props.
*   **Logic Verification:** When writing combat formulas, provide a comment block showing a calculation example:
    ```typescript
    // DMG = 10 (atk) - 5 (def) = 5
    // If Critical: 5 * 2 = 10
    ```

---

## 11. MANDATORY Development Workflow to FOLLOW AT ALL TIMES

Follow these steps in a continuous loop at all times:
1.  **Analyze:** Autonomously identify the Data Structure (Node), State (ActiveNode), and UI Component as applicable.
2.  **Architect:** Autonomously conceptualize the Type definition.
3.  **Simultaneously Implement And Document:** Autonomously write the Code while ALSO adding correctly formatted TSDoc documentations comments to it as you go.
4.  **Integrate And Document:** Autonomously integrate the Code into the main Game Loop or Root Component while simultaneously documenting it in the correct format.
5.  **Write Tests:** Autonomously write full-coverage tests for the new Code in the manner described in section 10.
6.  **Update both progress tracker files:** Autonomously update the `progress.md` + `test_progress.md` files very carefully to accurately reflect the current state of the project. Correct them anywhere they differ from reality.

---

## 12. Knowledge Base (Quick Reference)

*   **Tilemap:** A 1D or 2D array representing the world map.
*   **Sprite Sheet:** A single image containing all animation frames.
*   **Hitbox:** The abstract rectangle used for collision.
*   **Tick:** A single update cycle of the game logic (usually 60 per second).
*   **NPC:** Non-Player Character.
*   **RNG:** Random Number Generator (Seedable preferred for save states).
*   **ECS:** Entity Component System - architectural pattern separating data (Components) from logic (Systems).
*   **System:** A function that operates on entities with specific component combinations.
*   **Component:** Pure data structure with no behavior (e.g., Position, Health).
*   **Entity:** A unique identifier (ID) representing a game object.

# MANDATORY AGENT BEHAVIOUR INSTRUCTIONS PART TWO

# Game-Specific Design Document: Aetherial Vanguard

## 1. Game Overview
*   **Title:** Aetherial Vanguard
*   **Platform:** Browser (UI Fully Supporting Both Mobile Devices And Desktop) (Emulated SNES aesthetic)
*   **Genre:** Traditional Turn-Based RPG
*   **Visual Style:** 16-Bit Pixel Art (using the in-engine premade sprite loading / rendering system as opposed to assets loaded from disk. You MUST carefully create all necessary art in the correct hardcoded-in-source constant static data format to a very high visual and aesthetic standard during the development process, simplified placeholder art is never acceptable). DO NOT EVER use repeatedly-called canvas drawing functions for this, ALL art ABSOLUTELY MUST be ACTUAL PURE CONSTANT STATIC HARDCODED-IN-SOURCE DATA, NOT PROCEDURALLY GENERATED.
*   **Internal Resolution:** 1024x960 for menus and UI overlays, 832x768 for gameplay window.
*   **Audio Style:** Epic Fantasy 16-bit compositions, appropriate 16-bit sound effects. All audio uses the in-engine playback system and MUST be pre-composed in the correct hardcoded-in-source constant static data format by you during the development process.
*   **MANDATORY Approximate Target Length:** 30-40 Hours (design and implement ALL aspects of the game with this in mind, while being sure to maintain a proper balance of fun and challenge at the same time)
*   **Core Concept:** A love letter to the dawn of console RPGs, featuring four customizable heroes, slot-based magic systems, and a sprawling open world threatened by elemental decay.

## 2. Character System (The Four Heroes)
At the start of the game, the player selects and names party of four distinct characters via the party selection menu. There is no changing party members once the game begins. **Duplicate classes are permitted (e.g., a party of 4 Warriors is valid).**
*   **Level Cap:** 99.

### Base Classes & Upgrades
Similar to early 16-bit RPGs, players undergo a "Trial of Valor" mid-game to upgrade their classes.

*   **Warrior (High HP, Heavy Armor)**
    *   **Role:** Tank/Physical DPS.
    *   **Upgrade:** Knight. Gains low-level Holy Magic and ability to equip legendary swords.
*   **Thief (High Agility, High Luck)**
    *   **Role:** Evasion Tank/Multi-hit DPS. Good for fleeing battles.
    *   **Upgrade:** Assassin. Gains low-level Dark Magic and dual-wielding capability.
*   **Monk (Unarmed Specialist)**
    *   **Role:** Glass Cannon. Damage scales with level, not weapon. Low Defense requires careful management.
    *   **Upgrade:** Grandmaster. Magic resistance increases; damage output becomes highest in game.
*   **Crimson Sage (Jack-of-all-Trades)**
    *   **Role:** Hybrid. Can use swords and mid-level Dark/Holy magic.
    *   **Upgrade:** Crimson Warlock. Can equip better gear and cast most magic (except the highest tiers).
*   **Cleric (Healer)**
    *   **Role:** Support. Low defense. Essential for Undead dungeons.
    *   **Upgrade:** High Priest. Gains access to "Resurrect" and "Divine Judgment" spells.
*   **Sorcerer (Nuker)**
    *   **Role:** AoE Damage/Debuffer. Very low HP.
    *   **Upgrade:** Archmage. Gains access to "Supernova" and "Doom" spells.

## 3. Core Gameplay Loops

### A. Exploration (Overworld & Dungeons)
*   **Perspective:** Top-down 2D grid movement.
*   **Random Encounters:** Invisible step-counter system. Encounter rate and enemy types vary by terrain and location.
*   **Movement Modes:**
    *   **Foot:** Standard speed. Monsters spawn.
    *   **Small Boat:** River travel. Aquatic monsters spawn. Usable in the Overworld and specific dungeons (e.g., Cascade Grotto).
    *   **Galleon:** Sea travel. Access to new continents. Sea monsters spawn.
    *   **Sky-Ship:** Late game. No encounters. Can only land on grassy plains.
*   **Game Over State:** If the party is wiped out, the game returns to the Title Screen. Progress is lost; players must reload their last save.

### B. Battle System
*   **Perspective:** Side-View. Heroes on the right, Enemies on the left.
*   **Turn Structure:**
    *   **Input Phase:** Player selects actions for all 4 characters. They can choose which enemy or ally to target with each character based on the row system described below.
    *   **Execution Phase:** Actions play out based on Agility stats (RNG modifier included).
*   **Targeting Logic:**
    *   **Ineffective Attacks:** If a monster dies before a character attacks it, the character strikes "Thin Air" (Ineffective). There is no auto-retargeting.
*   **Row System:**
    *   Enemies are arranged in **Front** and **Back** rows.
    *   Only the **Front** row enemies can be hit by melee attacks. Rear enemies must be hit with magic or ranged weapons.
    *   Heroes are also arranged in Front/Back rows via the Formation menu.

## 4. Systems & Mechanics

### A. The Magic System (Slot-Based)
*   **There MUST be a good variety of each type of spell for each spell level in the game
*   **Instead of MP (Mana Points), the game uses Spell Charges per spell level (Level 1 through 9).
*   **Example:** A Level 10 Wizard may have nine "Level 1" casts, but only two "Level 5" casts.
*   **Acquisition:** Spells are bought in shops. Each character has 3 slots per spell level. Players must choose wisely which spells to learn or "forget" old ones to make room.
*   **Friendly Fire:** Spells can target any entity. Players may cast offensive magic on allies (to wake them) or healing magic on enemies (to damage Undead).

### B. Equipment
*   **There MUST be a good variety of each type of equipment in the game.
*   **Slots:** Right Hand (Weapon), Left Hand (Shield), Head (Helm), Body (Armor), Accessory (Gauntlets/Rings).
*   **Inventory Limits:** Consumables stack up to **99**.
*   **Item Properties:**
    *   **Elemental Brands:** Weapons dealing extra damage to Water/Fire/Undead types.
    *   **Castable Items:** Certain staffs or gauntlets cast spells (e.g., "Lightning") when used as an item in battle without consuming charges.

### C. Status Effects

*   **Poison:** Damage per step on overworld; damage per turn in battle.
*   **Stone:** Character is frozen and effectively dead until cured. Game Over if all are stoned.
*   **Darkness:** Physical accuracy dropped by 50%.
*   **Silence:** Cannot cast magic.
*   **Paralysis:** Skip turns.

### D. Itemization Highlights (not a conclusive or exhaustive list, there will likely be more items than this in the finished game)
*   **Heal Potion:** Restore 30 HP.
*   **Hi-Potion:** Restores 150 HP.
*   **X-Potion:** Fully Restores HP.
*   **Antidote:** Cure Poison.
*   **Gold Needle:** Cures Stone status.
*   **Bedroll:** Saves game on World Map + Heals 30HP.
*   **Pavilion:** Saves game on World Map + Full Heal + Revives Dead characters.
*   **Prism Scarf:** The ultimate helmet. Protects wearer from ALL status ailments and elemental damage. Only 3 exist in the entire game.
*   **Celestial Blade:** The ultimate weapon. Can be equipped by any class. Found in the final dungeon.
*   **Kingsblade:** Knight/Paladin only. Crafted by the Dwarf Smith using Star-Metal.

## 5. World Design & Narrative

### The Plot
*   **Premise:** The "Essence of the World" has dimmed. The earth rots, the winds cease, the seas rage, and fire consumes.
*   **The Quest:** The Regent sends the 4 Heroes to restore light to the Four Elemental Crystals.
*   **The Twist:** The heroes defeat the four Elemental Tyrants, only to find they were sent from 2,000 years in the future by a chaotic entity to create a time loop, ensuring the entity lives forever. The heroes must travel to the past to break the loop.

### Locations
*  **Design Note: All unique named locations (both interior and exterior) and dungeons MUST have their own unique music track.
*  **Design Note: All locations (both interior and exterior) and dungeons MUST have unique battle backgrounds where applicable (i.e. if they're locations or dungeons where random encounters or bosses are fought).
*  **Design Note: All locations and dungeons MUST be logically and carefully constructed with proper paths and collisions and absolutely no game-blocking impassable obstacles (including the overworld) and they MUST all connect to each other in ways that make sense relative to the plot progression of the game.
*   **Aethelgard:** The Walled City and Starting Kingdom. Contains the Regent’s Castle and basic shops for starter gear.
*   **Sanctum of Discord:** A short, linear dungeon near Aethelgard inhabited by bats and Goblins.
*   **Corsair's Cove:** The Port Town. No walls, pirate/ocean theme. Players must defeat pirates (Captain Dread) to get the Ship. Sells Level 2 Spells.
*   **Western Keep:** A fortress occupied by the Dark Elf King. Location of the Crystal Eye.
*   **Sylvanis:** Home of the Elves. A forest city that sells Level 3 & 4 Spells. High prices require grinding. The Elf Prince is cursed here.
*   **Bog Crypt:** A dangerous 3-floor basement dungeon located in the marshlands. Contains the Royal Crown.
*   **Ironforge Peak:** Dwarf mine and hub. Requires Blasting Powder to open the canal to the outer ocean.
*   **Rotmoor:** A rotting town destroyed by vampires with a graveyard aesthetic. Sells Level 5 Spells and heavy iron armor.
*   **Cavern of Terra:** A dungeon deep within the earth, home of the Rot-King.
*   **Moonwater Grove:** Located in a crescent forest. Home of the Sages. Sells Level 6 Spells. Heroes receive the Small Boat here.
*   **Glacial Rift:** An ice dungeon featuring damage floors and pitfalls. Guards the Gravity Crystal.
*   **The Cascade Grotto:** A maze of rivers inside a cave requiring the Small Boat and a Robot key item to enter.
*   **The Volcano (Mt. Pyre):** A lava-filled dungeon featuring damage floors. Home of Serpentina.
*   **Highpeak:** Mountain village isolated by rocks. Only accessible via Sky-Ship. Sells "Guardian Rings" (Instant death protection).
*   **The Illusion Spire:** A tower located in the middle of a vast desert. Warps players to the Void Citadel.
*   **The Void Citadel:** A tech-based dungeon located in space, accessible only via the Illusion Spire.
*   **Riverwatch:** River village. Must take a submarine barrel from here to reach the Abyssal Temple.
*   **Abyssal Temple:** An underwater dungeon reachable via submarine barrel from Riverwatch. Home of the Abyssal Lord.
*   **Celestia:** The City of Ancients. Located on a small map edge. Only accessible by landing the Sky-Ship far away and walking. Civilians speak "Ancient Tongue" (gibberish) until the Translation Tablet is found. Sells Level 8 (Ultimate) Magic.

### Dungeons & Progression Logic
*   **Sanctum of Discord:** Short, linear. Bats and Goblins.
*   **Western Keep:**
    *   **Gimmick:** High evasion enemies.
    *   **Boss:** The Dark Elf King.
*   **Bog Crypt:** The first difficulty spike.
    *   **Gimmick:** 3 Basements. Grid-like maze. High encounter rate with Poisonous enemies.
    *   **Loot:** The Royal Crown (Key Item).
*   **Cavern of Terra:**
    *   **Gimmick:** The "Hall of Giants"—a specific hallway tile triggers an encounter with a Hill Giant every single step. Good for grinding, deadly for the unprepared.
    *   **Boss:** Rot-King.
*   **Glacial Rift:**
    *   **Gimmick:** "Damage Floors" (Ice spikes) that deal 1 HP per step. "Pitfalls" that drop players to the floor below, forcing them to re-climb.
    *   **Boss:** Guardian (The Mech).
*   **The Cascade Grotto:**
    *   **Requirement:** Small Boat + Robot key item to enter.
    *   **Layout:** A maze of rivers inside a cave; requires navigating the boat through the dungeon.
    *   **Boss:** Cyclone Master (Optional).
*   **The Volcano (Mt. Pyre):**
    *   **Gimmick:** Lava floors deal heavy damage per step (10 HP). Players must manage healing charges versus walking distance.
    *   **Boss:** Serpentina.
*   **Abyssal Temple:**
    *   **Requirement:** Submarine barrel from Riverwatch.
    *   **Gimmick:** Underwater environment.
    *   **Boss:** Abyssal Lord.
    *   **Loot:** Translation Tablet.
*   **The Illusion Spire:**
    *   **Location:** Middle of a vast desert.
    *   **Gimmick:** Robot enemies. To reach the top, one must warp into the Void Citadel.
*   **The Void Citadel:**
    *   **Visuals:** Tech-base tileset, windows showing stars.
    *   **Gimmick:** Teleporter mazes and glass floors where you can see a **scrolling parallax starfield** below.
    *   **Boss:** Storm Hydra.
*   **Sanctum of Discord (Past):**
    *   **Entrance:** Player must play the "Bard's Harp" key item at the original Sanctum of Discord to open the time portal.
    *   **Structure:** You must fight updated, stronger versions of all Four Tyrants (Rot-King, Serpentina, Abyssal Lord, Storm Hydra) again as you descend 5 floors to the center of the earth to fight Entropy.

## 6. Menus & UI (Blue Window Style)
*   **Main Menu (Start Button)**
    *   **Items:** Grid list of consumables.
    *   **Magic:** View/Use spells (Heal/Teleport).
    *   **Equip:** Change gear. Visualizes stat changes (Attack/Defense/Evade).
    *   **Status:** Detailed view of STR, AGI, INT, VIT, LUCK.
    *   **Formation:** Swap order of party members. The top two members are in the **Front Row** (taking more hits); the bottom two are in the **Back Row**.
*   **World Map Menu (Select Button)**
    *   Opens a simplified, pixelated render of the known world.
    *   Flashing dots indicate current location.
    *   **Feature:** Using the "Spyglass" item reveals a hidden map completion percentage.

## 7. Bestiary & Bosses
### Enemy Types
*  **Design Note: Enemies belong to "Families." Higher-level versions share the same sprite but feature different color palettes and expanded spell lists (Palette Swapping).*
*  **Design Note: All enemies and bosses MUST have unique animations.
*   **Goblins/Imps:** Tutorial fodder.
*   **The Slime Family:** High physical defense, weak to magic.
*   **The Beast Family:**
    *   **Warg:** (Grey) Early game filler. High crit rate.
    *   **Winter Wolf:** (Blue/White) Found in Glacial Rift. Uses "Frost" (AoE Ice damage).
    *   **Hell Hound:** (Red) Found in Volcano. Uses "Scorch."
*   **The Ogre & Giant Family:** (High HP, low magic defense).
    *   **Ogre:** (Green) High physical damage, low accuracy.
    *   **Ogre Chief:** (Purple) Slightly higher stats, can heal self.
    *   **Troll:** (Blue) Regenerates 5% HP every round. Weak to Fire.
    *   **Titans:** Massive versions encountered in late game.
*   **The Eye Family (Floating Watchers):**
    *   **Watcher:** (Flesh tone) Uses "Sleep" gaze.
    *   **Spectator:** (Black/Red) High evasion. Immune to physical attacks unless "Illuminated" by a spell.
    *   **Doom Gazer:** (Gold) Late game. Uses "Petrify" (Stone) or "Terminus" (Instant Death).
*   **The Undead Hordes:** (Weak to Fire/Holy).
    *   **Skeletons/Zombies:** Basic cannon fodder.
    *   **Ghoul:** (Grey) Paralyzes on hit. 3 hits per turn.
    *   **Wraith:** (Transparent/Blue) Casting "Silence" to stop healers.
    *   **Specter:** (Red) Drains Level 1 & 2 Spell Charges from heroes upon contact.
    *   **Vampire:** (Black Cape) High HP. Regenerates. Inflicts uncurable status "Blight" (max HP down) until Church visit.
*   **The Dragon Family:** Rare encounters. Breath attacks hit the whole party.
*   **The Construct Family (High Defense):**
    *   **Clay Golem:** (Brown) Vulnerable to Ice/Water.
    *   **Stone Golem:** (Grey) Immune to magic. Must use physical attacks.
    *   **Iron Giant:** (Teal) Massive HP. Vulnerable to Lightning. Drops huge EXP.
*   **River & Sea Monsters:**
    *   **Merfolk:** (Green) Standard merman.
    *   **Merfolk Chief:** (Orange) Calls for reinforcements.
    *   **Hydra:** (Purple) Multi-headed. Attacks 3 random targets per turn.
    *   **Sea Serpent:** (Blue) Massive damage. Encountered only in Deep Ocean tiles.
*   **The Sorcerers (Glass Cannons):**
    *   **Squid Sorcerer:** (Squid-faced) Found in the Marsh. Moderate physical damage.
    *   **Brain Flayer:** (Purple) Attacks inflict Instant Death if the target has low Magic Defense.
    *   **Dark Wizard:** (Red Robes) Casts Level 5-6 spells (Fire3, Spark3).
*   **The Elemental Tyrants (Bosses):**
    *   **Rot-King (Earth):** Decaying wizard. Uses "Cataclysm". Found in the Cavern of Terra.
    *   **Serpentina (Fire):** Six-armed snake woman. Multiple physical hits per turn. Found in the Volcano.
    *   **Abyssal Lord (Water):** Giant squid. Blind attacks. Found in the Abyssal Temple.
    *   **Storm Hydra (Wind):** Multi-headed dragon. Uses Thunder/Poison Gas. Found in the Void Citadel.

### Boss Hierarchy
*Bosses are immune to Status Effects (Silence, Poison, Stone, Instant Death).*
*   **Tier 1: Plot Gatekeepers**
    *   **Lord Vane (The Fallen Knight):** The first boss. Uses only physical attacks. Serves as a tutorial for the "Fight/Heal" loop.
    *   **Captain Dread:** Located in Corsair's Cove. Surrounded by 8 weak Pirates. Defeating him yields the Galleon.
    *   **The Dark Elf King:** Located in the Western Keep. High physical evasion. Switches between casting "Spark 2" and "Hold." Drops the Crystal Eye.
*   **Tier 2: The Elemental Tyrants (Guardians of the Crystals)**
    *   **Rot-King (Earth):**
        *   **Location:** Earth Cave B5.
        *   **Mechanic:** Casts "Haste" on self to double attack output. Weak to Fire/Light (Holy).
    *   **Serpentina (Fire):**
        *   **Location:** Mt. Pyre (Volcano) B5.
        *   **Mechanic:** Six distinct attacks per turn. Immune to Fire. Casts "Blind" on the party.
    *   **Abyssal Lord (Water):**
        *   **Location:** Abyssal Temple (Underwater).
        *   **Mechanic:** "Ink" blind attack. "Tidal Wave" deals heavy non-elemental damage to all. Weak to Lightning.
    *   **Storm Hydra (Wind):**
        *   **Location:** Void Citadel 4F.
        *   **Mechanic:** Uses "Poison Gas" (heavy DoT) and "Thunderbolt." Resistant to all magic except specific debuffs like "Slow."
*   **Tier 3: Optional & Super Bosses**
    *   **Guardian (The Mech):** Guards the Gravity Crystal in the Glacial Rift. Uses "Cataclysm" (Non-elemental massive damage) every 4 turns.
    *   **Omega Drone:** Rare spawn (1/64) on the bridge to Storm Hydra. Heals 5% HP per turn. Has highest physical attack in the game.
    *   **Cyclone Master:** Found in a hidden room in the Cascade Grotto. "Sneezes" party members out of battle (removes them until battle ends).
*   **The Final Boss: Entropy (The Time Loop)**
    *   **Forms:** 1 (but changes elemental affinity).
    *   **Mechanic:**
        *   Rotates through the powers of the Four Tyrants.
        *   Phase 1: Uses Rot-King's Earth magic.
        *   Phase 2: Uses Serpentina's Fire/Physicals.
        *   Phase 3: Uses Abyssal Lord's Water AOE.
        *   Phase 4: Uses Storm Hydra's Wind/Nukes.
        *   Final Phase: Casts "Vitalis Maxima" (Full Heal) once when HP < 20%. Starts using "Entropy Wave" (Halves party HP).

## 8. Side Quests & Secrets
*   **The Wyvern Scale:** Hidden in a dangerous citadel. Must be traded to the Dragon Lord (King of Dragons) to unlock Class Upgrades.
*   **The Translation Tablet:** Found in the Abyssal Temple. Used to learn the language of the Ancients to access the remote town of Celestia.
*   **The Star-Metal:** Rare ore found in the Void Citadel, used by the Dwarf Blacksmith to craft the ultimate sword (Kingsblade equivalent).
*   **Omega Drone:** A 1/64 encounter rate enemy in the final dungeon that is harder than the final boss.

## 9. Audio & Tech Specs
*   **Mandatory Sound Channels:**
    *   Pulse 1 (Melody)
    *   Pulse 2 (Harmony/Counter-melody)
    *   Triangle (Bass)
    *   Noise (Percussion/SFX)
*   **Music Style:** Epic Fantasy 16-bit compositions, appropriate to the particular context in-game
*   **Sound effects:** All unique actions MUST have unique sound effects.
*   **Save System:** Battery backup style. Saving is only allowed at Inns or by using a Bedroll/Pavilion on the World Map. No saving inside dungeons.
    *   **Safety Feature:** An auto-save (Suspend Save) occurs after battles and transitions to prevent data loss on browser close. This save is deleted upon loading.