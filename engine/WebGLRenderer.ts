/**
 * WebGL Rendering Engine with Batch Renderer
 * @fileoverview Core WebGL rendering system for efficient sprite batch rendering
 */

import { mat4, vec2 } from 'gl-matrix';
import { TextureData, ShaderSource, Rectangle } from '../types';
import { logger, LogSource } from './GlobalLogger';

/**
 * Vertex structure for batch rendering
 */
interface Vertex {
  /** Position X */
  x: number;
  /** Position Y */
  y: number;
  /** Texture U coordinate */
  u: number;
  /** Texture V coordinate */
  v: number;
  /** Color (RGBA) */
  color: number;
}

/**
 * Sprite batch structure
 */
interface SpriteBatch {
  /** Texture ID for this batch */
  textureId: string;
  /** Array of vertices */
  vertices: Vertex[];
  /** WebGL texture reference */
  glTexture?: WebGLTexture;
}

/**
 * Camera configuration
 */
interface Camera {
  /** Camera position X */
  x: number;
  /** Camera position Y */
  y: number;
  /** Zoom level */
  zoom: number;
  /** Viewport width */
  width: number;
  /** Viewport height */
  height: number;
}

/**
 * WebGL Rendering Engine class
 * Provides efficient batched sprite rendering using native WebGL API
 */
export class WebGLRenderer {
  /** WebGL rendering context */
  private gl: WebGLRenderingContext | null = null;
  
  /** WebGL program for sprite rendering */
  private program: WebGLProgram | null = null;
  
  /** Vertex buffer */
  private vertexBuffer: WebGLBuffer | null = null;
  
  /** Texture cache */
  private textureCache: Map<string, WebGLTexture> = new Map();
  
  /** Current sprite batches */
  private batches: Map<string, SpriteBatch> = new Map();
  
  /** Projection matrix */
  private projectionMatrix: mat4 = mat4.create();
  
  /** View matrix */
  private viewMatrix: mat4 = mat4.create();
  
  /** Combined matrix */
  private combinedMatrix: mat4 = mat4.create();
  
  /** Camera configuration */
  private camera: Camera = {
    x: 0,
    y: 0,
    zoom: 1.0,
    width: 1024,
    height: 768
  };
  
  /** Context lost flag */
  private contextLost: boolean = false;
  
  /** Shader source */
  private static readonly SHADER_SOURCE: ShaderSource = {
    vertex: `
      attribute vec2 a_position;
      attribute vec2 a_uv;
      attribute vec4 a_color;
      uniform mat4 u_matrix;
      varying vec2 v_uv;
      varying vec4 v_color;
      
      void main() {
        vec4 position = u_matrix * vec4(a_position, 0.0, 1.0);
        gl_Position = position;
        v_uv = a_uv;
        v_color = a_color;
      }
    `,
    fragment: `
      precision mediump float;
      uniform sampler2D u_texture;
      varying vec2 v_uv;
      varying vec4 v_color;
      
      void main() {
        vec4 texColor = texture2D(u_texture, v_uv);
        gl_FragColor = texColor * v_color;
      }
    `
  };

  /**
   * Initializes the WebGL renderer
   * @param canvas - HTML canvas element
   * @param width - Render width
   * @param height - Render height
   */
  public initialize(canvas: HTMLCanvasElement, width: number, height: number): boolean {
    try {
      // Get WebGL context
      this.gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        preserveDrawingBuffer: false,
        premultipliedAlpha: false
      });

      if (!this.gl) {
        logger.error(LogSource.RENDERER, 'Failed to get WebGL context');
        return false;
      }

      // Set viewport
      this.gl.viewport(0, 0, width, height);
      
      // Update camera dimensions
      this.camera.width = width;
      this.camera.height = height;

      // Initialize WebGL settings
      this.setupWebGLState();

      // Compile shaders
      if (!this.compileShaders()) {
        return false;
      }

      // Create buffers
      this.createBuffers();

      // Setup matrices
      this.updateMatrices();

      // Setup context loss handlers
      this.setupContextLossHandling(canvas);

      logger.info(LogSource.RENDERER, `WebGL renderer initialized (${width}x${height})`);
      return true;

    } catch (error) {
      logger.error(LogSource.RENDERER, `WebGL initialization failed: ${error}`);
      return false;
    }
  }

  /**
   * Sets up WebGL state and blending
   */
  private setupWebGLState(): void {
    if (!this.gl) return;

    // Enable blending for transparency
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    // Set texture filtering to nearest for pixel art
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

    // Set texture wrapping
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
  }

  /**
   * Compiles vertex and fragment shaders
   * @returns True if compilation succeeded
   */
  private compileShaders(): boolean {
    if (!this.gl) return false;

    try {
      // Compile vertex shader
      const vertexShader = this.compileShader(
        WebGLRenderer.SHADER_SOURCE.vertex, 
        this.gl.VERTEX_SHADER
      );
      if (!vertexShader) return false;

      // Compile fragment shader
      const fragmentShader = this.compileShader(
        WebGLRenderer.SHADER_SOURCE.fragment, 
        this.gl.FRAGMENT_SHADER
      );
      if (!fragmentShader) return false;

      // Create program
      this.program = this.gl.createProgram();
      if (!this.program) {
        logger.error(LogSource.RENDERER, 'Failed to create WebGL program');
        return false;
      }

      // Attach shaders
      this.gl.attachShader(this.program, vertexShader);
      this.gl.attachShader(this.program, fragmentShader);

      // Link program
      this.gl.linkProgram(this.program);

      // Check linking
      if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
        const log = this.gl.getProgramInfoLog(this.program);
        logger.error(LogSource.RENDERER, `Program linking failed: ${log}`);
        return false;
      }

      // Clean up shaders
      this.gl.deleteShader(vertexShader);
      this.gl.deleteShader(fragmentShader);

      logger.debug(LogSource.RENDERER, 'Shaders compiled successfully');
      return true;

    } catch (error) {
      logger.error(LogSource.RENDERER, `Shader compilation failed: ${error}`);
      return false;
    }
  }

  /**
   * Compiles a single shader
   * @param source - Shader source code
   * @param type - Shader type (vertex or fragment)
   * @returns Compiled shader or null if failed
   */
  private compileShader(source: string, type: number): WebGLShader | null {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type);
    if (!shader) {
      logger.error(LogSource.RENDERER, 'Failed to create shader');
      return null;
    }

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const log = this.gl.getShaderInfoLog(shader);
      const shaderType = type === this.gl.VERTEX_SHADER ? 'vertex' : 'fragment';
      logger.error(LogSource.RENDERER, `${shaderType} shader compilation failed: ${log}`);
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /**
   * Creates WebGL buffers
   */
  private createBuffers(): void {
    if (!this.gl) return;

    this.vertexBuffer = this.gl.createBuffer();
    if (!this.vertexBuffer) {
      logger.error(LogSource.RENDERER, 'Failed to create vertex buffer');
      return;
    }

    logger.debug(LogSource.RENDERER, 'WebGL buffers created');
  }

  /**
   * Sets up context loss event handlers
   * @param canvas - Canvas element
   */
  private setupContextLossHandling(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      this.contextLost = true;
      logger.warn(LogSource.RENDERER, 'WebGL context lost');
    });

    canvas.addEventListener('webglcontextrestored', () => {
      this.contextLost = false;
      this.restoreContext();
      logger.info(LogSource.RENDERER, 'WebGL context restored');
    });
  }

  /**
   * Restores WebGL context after loss
   */
  private restoreContext(): void {
    // Recreate all WebGL resources
    this.setupWebGLState();
    this.compileShaders();
    this.createBuffers();
    
    // Re-upload all textures
    for (const [textureId, textureData] of this.textureCache) {
      // Texture data would need to be cached for restoration
      // This is a simplified version
    }
  }

  /**
   * Updates projection and view matrices
   */
  private updateMatrices(): void {
    // Create orthographic projection matrix
    mat4.ortho(this.projectionMatrix, 0, this.camera.width, this.camera.height, 0, -1, 1);

    // Create view matrix (camera transform)
    mat4.identity(this.viewMatrix);
    mat4.translate(this.viewMatrix, this.viewMatrix, [
      this.camera.width / 2 - this.camera.x,
      this.camera.height / 2 - this.camera.y,
      0
    ]);
    mat4.scale(this.viewMatrix, this.viewMatrix, [this.camera.zoom, this.camera.zoom, 1]);

    // Combine matrices
    mat4.multiply(this.combinedMatrix, this.projectionMatrix, this.viewMatrix);
  }

  /**
   * Creates a texture from texture data
   * @param textureId - Unique texture identifier
   * @param textureData - Texture pixel data
   */
  public createTexture(textureId: string, textureData: TextureData): void {
    if (!this.gl || this.contextLost) return;

    // Check if texture already exists
    if (this.textureCache.has(textureId)) {
      logger.warn(LogSource.RENDERER, `Texture ${textureId} already exists`);
      return;
    }

    // Create WebGL texture
    const glTexture = this.gl.createTexture();
    if (!glTexture) {
      logger.error(LogSource.RENDERER, `Failed to create texture ${textureId}`);
      return;
    }

    // Bind texture
    this.gl.bindTexture(this.gl.TEXTURE_2D, glTexture);

    // Upload texture data
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      textureData.width,
      textureData.height,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      textureData.data
    );

    // Set texture parameters
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    // Cache texture
    this.textureCache.set(textureId, glTexture);

    logger.debug(LogSource.RENDERER, `Created texture ${textureId} (${textureData.width}x${textureData.height})`);
  }

  /**
   * Begins a new rendering frame
   */
  public beginFrame(): void {
    if (!this.gl || this.contextLost) return;

    // Clear screen
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Clear batches
    this.batches.clear();

    // Update matrices
    this.updateMatrices();
  }

  /**
   * Adds a sprite to the render batch
   * @param textureId - Texture identifier
   * @param x - World X position
   * @param y - World Y position
   * @param width - Sprite width
   * @param height - Sprite height
   * @param uvRect - UV rectangle in texture
   * @param color - Tint color (RGBA)
   */
  public drawSprite(
    textureId: string,
    x: number,
    y: number,
    width: number,
    height: number,
    uvRect: Rectangle,
    color: number = 0xFFFFFFFF
  ): void {
    if (!this.textureCache.has(textureId)) {
      logger.warn(LogSource.RENDERER, `Attempted to draw non-existent texture ${textureId}`);
      return;
    }

    // Get or create batch for this texture
    let batch = this.batches.get(textureId);
    if (!batch) {
      batch = {
        textureId,
        vertices: [],
        glTexture: this.textureCache.get(textureId)!
      };
      this.batches.set(textureId, batch);
    }

    // Calculate UV coordinates
    const u1 = uvRect.x;
    const v1 = uvRect.y;
    const u2 = uvRect.x + uvRect.width;
    const v2 = uvRect.y + uvRect.height;

    // Create 6 vertices for 2 triangles (quad)
    const vertices: Vertex[] = [
      // Triangle 1
      { x, y, u: u1, v: v1, color },
      { x: x + width, y, u: u2, v: v1, color },
      { x, y: y + height, u: u1, v: v2, color },
      
      // Triangle 2
      { x: x + width, y, u: u2, v: v1, color },
      { x: x + width, y: y + height, u: u2, v: v2, color },
      { x, y: y + height, u: u1, v: v2, color }
    ];

    // Add vertices to batch
    batch.vertices.push(...vertices);
  }

  /**
   * Ends the current rendering frame and draws all batches
   */
  public endFrame(): void {
    if (!this.gl || !this.program || this.contextLost) return;

    // Use shader program
    this.gl.useProgram(this.program);

    // Set uniforms
    this.setUniforms();

    // Draw each batch
    for (const batch of this.batches.values()) {
      if (batch.vertices.length === 0) continue;

      this.drawBatch(batch);
    }

    // Unbind texture
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

  /**
   * Sets shader uniforms
   */
  private setUniforms(): void {
    if (!this.gl || !this.program) return;

    // Set matrix uniform
    const matrixLocation = this.gl.getUniformLocation(this.program, 'u_matrix');
    this.gl.uniformMatrix4fv(matrixLocation, false, this.combinedMatrix);

    // Set texture uniform
    const textureLocation = this.gl.getUniformLocation(this.program, 'u_texture');
    this.gl.uniform1i(textureLocation, 0);
  }

  /**
   * Draws a single sprite batch
   * @param batch - Sprite batch to draw
   */
  private drawBatch(batch: SpriteBatch): void {
    if (!this.gl || !this.vertexBuffer || batch.vertices.length === 0) return;

    // Bind texture
    this.gl.bindTexture(this.gl.TEXTURE_2D, batch.glTexture);

    // Create vertex data array
    const vertexData = new Float32Array(batch.vertices.length * 10); // 10 floats per vertex (x, y, u, v, r, g, b, a, z, pad)

    let offset = 0;
    for (const vertex of batch.vertices) {
      // Position
      vertexData[offset++] = vertex.x;
      vertexData[offset++] = vertex.y;
      
      // UV
      vertexData[offset++] = vertex.u;
      vertexData[offset++] = vertex.v;
      
      // Color (RGBA)
      const r = (vertex.color >> 24) & 0xFF;
      const g = (vertex.color >> 16) & 0xFF;
      const b = (vertex.color >> 8) & 0xFF;
      const a = vertex.color & 0xFF;
      
      vertexData[offset++] = r / 255.0;
      vertexData[offset++] = g / 255.0;
      vertexData[offset++] = b / 255.0;
      vertexData[offset++] = a / 255.0;
      
      // Z coordinate (for mat4)
      vertexData[offset++] = 0;
      
      // Padding
      vertexData[offset++] = 0;
    }

    // Bind vertex buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexData, this.gl.DYNAMIC_DRAW);

    // Set vertex attributes
    this.setupVertexAttributes();

    // Draw vertices
    this.gl.drawArrays(this.gl.TRIANGLES, 0, batch.vertices.length);
  }

  /**
   * Sets up vertex attribute pointers
   */
  private setupVertexAttributes(): void {
    if (!this.gl || !this.program || !this.vertexBuffer) return;

    const stride = 10 * 4; // 10 floats * 4 bytes per float

    // Position attribute
    const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, stride, 0);

    // UV attribute
    const uvLocation = this.gl.getAttribLocation(this.program, 'a_uv');
    this.gl.enableVertexAttribArray(uvLocation);
    this.gl.vertexAttribPointer(uvLocation, 2, this.gl.FLOAT, false, stride, 2 * 4);

    // Color attribute
    const colorLocation = this.gl.getAttribLocation(this.program, 'a_color');
    this.gl.enableVertexAttribArray(colorLocation);
    this.gl.vertexAttribPointer(colorLocation, 4, this.gl.FLOAT, false, stride, 4 * 4);
  }

  /**
   * Sets the camera position and zoom
   * @param x - Camera X position
   * @param y - Camera Y position
   * @param zoom - Camera zoom level
   */
  public setCamera(x: number, y: number, zoom: number = 1.0): void {
    this.camera.x = x;
    this.camera.y = y;
    this.camera.zoom = zoom;
  }

  /**
   * Gets the current camera configuration
   * @returns Camera configuration
   */
  public getCamera(): Camera {
    return { ...this.camera };
  }

  /**
   * Resizes the renderer
   * @param width - New width
   * @param height - New height
   */
  public resize(width: number, height: number): void {
    if (!this.gl) return;

    this.gl.viewport(0, 0, width, height);
    this.camera.width = width;
    this.camera.height = height;

    logger.debug(LogSource.RENDERER, `Renderer resized to ${width}x${height}`);
  }

  /**
   * Checks if the context is lost
   * @returns True if context is lost
   */
  public isContextLost(): boolean {
    return this.contextLost;
  }

  /**
   * Gets rendering statistics
   * @returns Rendering statistics
   */
  public getStats(): {
    textureCount: number;
    batchCount: number;
    vertexCount: number;
  } {
    let vertexCount = 0;
    for (const batch of this.batches.values()) {
      vertexCount += batch.vertices.length;
    }

    return {
      textureCount: this.textureCache.size,
      batchCount: this.batches.size,
      vertexCount
    };
  }

  /**
   * Disposes of WebGL resources
   */
  public dispose(): void {
    if (!this.gl) return;

    // Delete textures
    for (const texture of this.textureCache.values()) {
      this.gl.deleteTexture(texture);
    }
    this.textureCache.clear();

    // Delete buffers
    if (this.vertexBuffer) {
      this.gl.deleteBuffer(this.vertexBuffer);
      this.vertexBuffer = null;
    }

    // Delete program
    if (this.program) {
      this.gl.deleteProgram(this.program);
      this.program = null;
    }

    logger.info(LogSource.RENDERER, 'WebGL renderer disposed');
  }
}