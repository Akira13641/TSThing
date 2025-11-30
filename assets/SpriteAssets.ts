/**
 * Hardcoded Sprite Assets for Aetherial Vanguard
 * @fileoverview Contains all sprite pixel art data as constant static data structures
 */

import { TextureData, AnimationDef } from '../types';

/**
 * Creates a simple colored square texture
 * @param width - Texture width
 * @param height - Texture height
 * @param color - RGBA color value
 * @returns Texture data structure
 */
function createColoredTexture(width: number, height: number, color: number): TextureData {
  const data = new Uint8Array(width * height * 4);
  const r = (color >> 24) & 0xFF;
  const g = (color >> 16) & 0xFF;
  const b = (color >> 8) & 0xFF;
  const a = color & 0xFF;

  for (let i = 0; i < width * height; i++) {
    const offset = i * 4;
    data[offset] = r;
    data[offset + 1] = g;
    data[offset + 2] = b;
    data[offset + 3] = a;
  }

  return { width, height, data };
}

/**
 * Creates a simple character sprite (16x32 pixel humanoid figure)
 * @param bodyColor - Body color
 * @param hairColor - Hair color
 * @returns Texture data structure
 */
function createCharacterSprite(bodyColor: number, hairColor: number): TextureData {
  const width = 16;
  const height = 32;
  const data = new Uint8Array(width * height * 4);

  // Initialize with transparent pixels
  for (let i = 0; i < width * height; i++) {
    const offset = i * 4;
    data[offset] = 0;
    data[offset + 1] = 0;
    data[offset + 2] = 0;
    data[offset + 3] = 0;
  }

  const setPixel = (x: number, y: number, color: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const offset = (y * width + x) * 4;
    data[offset] = (color >> 24) & 0xFF;
    data[offset + 1] = (color >> 16) & 0xFF;
    data[offset + 2] = (color >> 8) & 0xFF;
    data[offset + 3] = color & 0xFF;
  };

  const fillRect = (x: number, y: number, w: number, h: number, color: number) => {
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        setPixel(px, py, color);
      }
    }
  };

  // Draw head
  fillRect(6, 4, 4, 4, hairColor);
  fillRect(5, 8, 6, 4, 0xFFDBAC); // Skin color
  
  // Draw body
  fillRect(5, 12, 6, 8, bodyColor);
  
  // Draw arms
  fillRect(3, 14, 2, 4, bodyColor);
  fillRect(11, 14, 2, 4, bodyColor);
  
  // Draw legs
  fillRect(5, 20, 2, 8, 0x4A4A4A); // Pants color
  fillRect(9, 20, 2, 8, 0x4A4A4A);

  return { width, height, data };
}

/**
 * Creates a slime enemy sprite (16x16 pixel)
 * @param color - Slime color
 * @returns Texture data structure
 */
function createSlimeSprite(color: number): TextureData {
  const width = 16;
  const height = 16;
  const data = new Uint8Array(width * height * 4);

  // Initialize with transparent pixels
  for (let i = 0; i < width * height; i++) {
    const offset = i * 4;
    data[offset] = 0;
    data[offset + 1] = 0;
    data[offset + 2] = 0;
    data[offset + 3] = 0;
  }

  const setPixel = (x: number, y: number, color: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const offset = (y * width + x) * 4;
    data[offset] = (color >> 24) & 0xFF;
    data[offset + 1] = (color >> 16) & 0xFF;
    data[offset + 2] = (color >> 8) & 0xFF;
    data[offset + 3] = color & 0xFF;
  };

  // Draw jellybean-shaped slime
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const centerX = 8;
      const centerY = 8;
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= 6 && y >= 4) {
        setPixel(x, y, color);
      }
    }
  }

  // Add highlight
  setPixel(6, 6, 0xFFFFFFFF);
  setPixel(7, 6, 0xFFFFFFFF);
  setPixel(6, 7, 0xFFFFFFFF);

  // Add eyes
  setPixel(5, 8, 0x000000FF);
  setPixel(9, 8, 0x000000FF);

  return { width, height, data };
}

/**
 * Creates a tile sprite (32x32 pixel)
 * @param color - Tile color
 * @param pattern - Pattern type
 * @returns Texture data structure
 */
function createTileSprite(color: number, pattern: 'solid' | 'checkerboard' | 'dots'): TextureData {
  const width = 32;
  const height = 32;
  const data = new Uint8Array(width * height * 4);

  const r = (color >> 24) & 0xFF;
  const g = (color >> 16) & 0xFF;
  const b = (color >> 8) & 0xFF;
  const a = color & 0xFF;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      
      let pixelColor = color;
      
      if (pattern === 'checkerboard') {
        const checkerSize = 4;
        if ((Math.floor(x / checkerSize) + Math.floor(y / checkerSize)) % 2 === 0) {
          pixelColor = 0x808080FF; // Gray
        }
      } else if (pattern === 'dots') {
        const dotSize = 2;
        if (x % 8 < dotSize && y % 8 < dotSize) {
          pixelColor = 0x606060FF; // Darker gray
        }
      }
      
      data[offset] = (pixelColor >> 24) & 0xFF;
      data[offset + 1] = (pixelColor >> 16) & 0xFF;
      data[offset + 2] = (pixelColor >> 8) & 0xFF;
      data[offset + 3] = pixelColor & 0xFF;
    }
  }

  return { width, height, data };
}

/**
 * Creates a UI button sprite (64x32 pixel)
 * @param color - Button color
 * @returns Texture data structure
 */
function createButtonSprite(color: number): TextureData {
  const width = 64;
  const height = 32;
  const data = new Uint8Array(width * height * 4);

  const setPixel = (x: number, y: number, color: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const offset = (y * width + x) * 4;
    data[offset] = (color >> 24) & 0xFF;
    data[offset + 1] = (color >> 16) & 0xFF;
    data[offset + 2] = (color >> 8) & 0xFF;
    data[offset + 3] = color & 0xFF;
  };

  // Fill with button color
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      setPixel(x, y, color);
    }
  }

  // Add border
  for (let x = 0; x < width; x++) {
    setPixel(x, 0, 0xFFFFFFFF); // Top border
    setPixel(x, height - 1, 0x000000FF); // Bottom border
  }
  for (let y = 0; y < height; y++) {
    setPixel(0, y, 0xFFFFFFFF); // Left border
    setPixel(width - 1, y, 0x000000FF); // Right border
  }

  return { width, height, data };
}

// ============= TEXTURE DEFINITIONS =============

/** Hero character texture (blue clothes, brown hair) */
export const HERO_TEXTURE: TextureData = createCharacterSprite(0x0066CCFF, 0x8B4513FF);

/** Female hero texture (red clothes, blonde hair) */
export const HEROINE_TEXTURE: TextureData = createCharacterSprite(0xCC0066FF, 0xFFD700FF);

/** Green slime enemy texture */
export const SLIME_GREEN_TEXTURE: TextureData = createSlimeSprite(0x00FF00FF);

/** Red slime enemy texture */
export const SLIME_RED_TEXTURE: TextureData = createSlimeSprite(0xFF0000FF);

/** Blue slime enemy texture */
export const SLIME_BLUE_TEXTURE: TextureData = createSlimeSprite(0x0088FFFF);

/** Grass tile texture */
export const GRASS_TILE_TEXTURE: TextureData = createTileSprite(0x228B22FF, 'dots');

/** Stone tile texture */
export const STONE_TILE_TEXTURE: TextureData = createTileSprite(0x808080FF, 'solid');

/** Wood tile texture */
export const WOOD_TILE_TEXTURE: TextureData = createTileSprite(0x8B4513FF, 'checkerboard');

/** UI button normal texture */
export const BUTTON_NORMAL_TEXTURE: TextureData = createButtonSprite(0x4A90E2FF);

/** UI button hover texture */
export const BUTTON_HOVER_TEXTURE: TextureData = createButtonSprite(0x357ABDFF);

/** UI button pressed texture */
export const BUTTON_PRESSED_TEXTURE: TextureData = createButtonSprite(0x2968A8FF);

/** White pixel for effects */
export const WHITE_PIXEL_TEXTURE: TextureData = createColoredTexture(1, 1, 0xFFFFFFFF);

/** Black pixel for outlines */
export const BLACK_PIXEL_TEXTURE: TextureData = createColoredTexture(1, 1, 0x000000FF);

// ============= ANIMATION DEFINITIONS =============

/** Hero animation definitions */
export const HERO_ANIMATIONS: Record<string, AnimationDef> = {
  idle: {
    frames: [0],
    frameDuration: 1.0,
    loop: true
  },
  walk: {
    frames: [0, 1, 2, 1],
    frameDuration: 0.15,
    loop: true
  },
  attack: {
    frames: [3, 4, 5],
    frameDuration: 0.1,
    loop: false
  },
  hurt: {
    frames: [6],
    frameDuration: 0.3,
    loop: false
  },
  victory: {
    frames: [7, 8],
    frameDuration: 0.2,
    loop: true
  }
};

/** Heroine animation definitions */
export const HEROINE_ANIMATIONS: Record<string, AnimationDef> = {
  idle: {
    frames: [0],
    frameDuration: 1.0,
    loop: true
  },
  walk: {
    frames: [0, 1, 2, 1],
    frameDuration: 0.15,
    loop: true
  },
  attack: {
    frames: [3, 4, 5],
    frameDuration: 0.1,
    loop: false
  },
  cast: {
    frames: [6, 7, 8],
    frameDuration: 0.12,
    loop: false
  },
  hurt: {
    frames: [9],
    frameDuration: 0.3,
    loop: false
  }
};

/** Slime animation definitions */
export const SLIME_ANIMATIONS: Record<string, AnimationDef> = {
  idle: {
    frames: [0, 1],
    frameDuration: 0.8,
    loop: true
  },
  move: {
    frames: [0, 1, 2],
    frameDuration: 0.2,
    loop: true
  },
  attack: {
    frames: [3, 4],
    frameDuration: 0.15,
    loop: false
  },
  hurt: {
    frames: [5],
    frameDuration: 0.3,
    loop: false
  },
  defeat: {
    frames: [6],
    frameDuration: 1.0,
    loop: false
  }
};

// ============= SPRITE SHEET LAYOUTS =============

/**
 * Hero sprite sheet layout (4x4 frames, 64x128 total)
 */
export const HERO_SPRITE_SHEET = {
  width: 64,
  height: 128,
  frameWidth: 16,
  frameHeight: 32,
  frames: [
    // Row 0: Idle frames
    { x: 0, y: 0 }, { x: 16, y: 0 }, { x: 32, y: 0 }, { x: 48, y: 0 },
    // Row 1: Attack frames
    { x: 0, y: 32 }, { x: 16, y: 32 }, { x: 32, y: 32 }, { x: 48, y: 32 },
    // Row 2: Special frames
    { x: 0, y: 64 }, { x: 16, y: 64 }, { x: 32, y: 64 }, { x: 48, y: 64 },
    // Row 3: Status frames
    { x: 0, y: 96 }, { x: 16, y: 96 }, { x: 32, y: 96 }, { x: 48, y: 96 }
  ]
};

/**
 * Slime sprite sheet layout (4x2 frames, 64x32 total)
 */
export const SLIME_SPRITE_SHEET = {
  width: 64,
  height: 32,
  frameWidth: 16,
  frameHeight: 16,
  frames: [
    // Row 0: Movement frames
    { x: 0, y: 0 }, { x: 16, y: 0 }, { x: 32, y: 0 }, { x: 48, y: 0 },
    // Row 1: Action frames
    { x: 0, y: 16 }, { x: 16, y: 16 }, { x: 32, y: 16 }, { x: 48, y: 16 }
  ]
};

// ============= TEXTURE REGISTRY =============

/**
 * Registry of all game textures with their identifiers
 */
export const TEXTURE_REGISTRY: Record<string, TextureData> = {
  'hero': HERO_TEXTURE,
  'heroine': HEROINE_TEXTURE,
  'slime_green': SLIME_GREEN_TEXTURE,
  'slime_red': SLIME_RED_TEXTURE,
  'slime_blue': SLIME_BLUE_TEXTURE,
  'grass_tile': GRASS_TILE_TEXTURE,
  'stone_tile': STONE_TILE_TEXTURE,
  'wood_tile': WOOD_TILE_TEXTURE,
  'button_normal': BUTTON_NORMAL_TEXTURE,
  'button_hover': BUTTON_HOVER_TEXTURE,
  'button_pressed': BUTTON_PRESSED_TEXTURE,
  'white_pixel': WHITE_PIXEL_TEXTURE,
  'black_pixel': BLACK_PIXEL_TEXTURE
};

/**
 * Registry of all animation definitions
 */
export const ANIMATION_REGISTRY: Record<string, Record<string, AnimationDef>> = {
  'hero': HERO_ANIMATIONS,
  'heroine': HEROINE_ANIMATIONS,
  'slime': SLIME_ANIMATIONS
};