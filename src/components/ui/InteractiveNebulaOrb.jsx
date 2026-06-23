"use client";

import { useEffect, useRef } from "react";

const vertexShader = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_pos;

void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const fragmentShader = `#version 300 es
precision highp float;

out vec4 fragColor;
uniform vec3 iResolution;
uniform float iTime;
uniform int iFrame;
uniform vec4 iMouse;
uniform float iThinking;
uniform float iThinkingProgress;
uniform float iRelease;

void mainImage(out vec4 outputColor, in vec2 fragCoord) {
  vec2 resolution = iResolution.xy;
  float time = iTime;
  vec3 ray = vec3(fragCoord, 0.0);
  vec4 energyColor = vec4(0.0);
  float phase = 0.0;

  for (
    float iteration = 0.0, depth = 0.0, distanceField = 0.0;
    iteration++ < 8e1;
    energyColor += (cos(phase + vec4(0.0, 1.0, 8.0, 0.0)) + 1.0) / distanceField
  ) {
    vec3 position = depth * normalize(ray.rgb * 2.0 - resolution.xyy);
    vec3 direction = normalize(cos(vec3(5.0, 0.0, 1.0) + time - distanceField * 4.0));
    position.z += 5.0;
    direction = direction * dot(direction, position) - cross(direction, position);

    for (distanceField = 1.0; distanceField++ < 9.0;) {
      direction -= sin(direction * distanceField + time).zxy / distanceField;
    }

    depth += distanceField = 0.1 * abs(length(position) - 3.0)
      + 0.07 * abs(cos(phase = direction.y));
  }

  energyColor = tanh(energyColor / 5e3);

  vec3 intenseViolet = vec3(0.36, 0.13, 0.71);
  vec3 luminousPurple = vec3(0.66, 0.33, 0.97);
  vec3 deepBlue = vec3(0.12, 0.23, 0.54);
  vec3 softCyan = vec3(0.13, 0.83, 0.93);
  vec3 source = clamp(energyColor.rgb, 0.0, 1.0);
  float flow = clamp(source.r * 0.7 + source.g * 0.3, 0.0, 1.0);
  vec3 color = mix(deepBlue, intenseViolet, flow);
  color += luminousPurple * source.g * 0.72;
  color += softCyan * source.b * 0.58;
  color = color / (1.0 + color * 0.28);

  vec2 centered = (fragCoord - resolution * 0.5) / min(resolution.x, resolution.y);
  float radialDistance = length(centered);
  float circle = 1.0 - smoothstep(0.42, 0.52, radialDistance);
  float innerRim = smoothstep(0.18, 0.44, radialDistance) * circle;
  float strength = max(max(source.r, source.g), source.b);
  float alpha = circle * mix(0.1, 0.95, smoothstep(0.02, 0.72, strength));
  vec3 rimColor = mix(intenseViolet, softCyan, 0.45 + 0.2 * sin(time * 0.7));
  color += rimColor * innerRim * 0.18;
  alpha = max(alpha, innerRim * 0.18);

  vec3 inputIndigo = vec3(0.2, 0.12, 0.86);
  vec3 inputMagenta = vec3(0.95, 0.12, 0.78);
  vec3 inputViolet = vec3(0.55, 0.18, 1.0);
  vec3 inputCyan = vec3(0.0, 0.9, 1.0);
  vec3 thinkingBlue = vec3(0.0, 0.52, 1.0);
  vec3 thinkingViolet = vec3(0.62, 0.18, 1.0);
  vec3 thinkingRed = vec3(1.0, 0.08, 0.28);
  vec3 electricHighlight = vec3(0.76, 1.0, 1.0);
  float thinkingBreath = 0.84
    + 0.1 * sin(time * 4.7)
    + 0.06 * sin(time * 7.9 + 1.2);
  float thinkingTime = time * mix(1.0, 1.45, iThinking);
  float angle = atan(centered.y, centered.x);
  float energySweep = pow(
    max(0.0, sin(angle * 2.5 - thinkingTime * 4.45 + radialDistance * 7.0)),
    10.0
  );
  float neuralShimmer = pow(
    max(0.0, sin(thinkingTime * 8.1 + source.g * 10.0 + angle * 1.5)),
    12.0
  );
  float paletteFlowA = 0.5 + 0.5 * sin(angle * 1.8 + thinkingTime * 2.1 + source.r * 3.0);
  float paletteFlowB = 0.5 + 0.5 * sin(angle * 3.1 - thinkingTime * 2.6 + source.b * 2.0);
  vec3 purpleBand = mix(inputIndigo, inputMagenta, paletteFlowA);
  vec3 cyanBand = mix(inputViolet, inputCyan, 1.0 - paletteFlowA);
  float thinkingProgress = smoothstep(0.0, 1.0, clamp(iThinkingProgress, 0.0, 1.0));
  float violetBlend = smoothstep(0.08, 0.72, thinkingProgress);
  float redBlend = smoothstep(0.78, 1.0, thinkingProgress);
  vec3 thinkingSequence = mix(thinkingBlue, thinkingViolet, violetBlend);
  thinkingSequence = mix(thinkingSequence, thinkingRed, redBlend);
  vec3 thinkingColor = mix(
    thinkingSequence,
    mix(purpleBand, cyanBand, 0.5 + 0.32 * sin(angle * 2.4 - thinkingTime * 1.25)),
    0.14
  );
  vec3 thinkingHighlight = mix(electricHighlight, thinkingSequence, 0.24 + paletteFlowB * 0.42);
  float glassGlow = smoothstep(0.08, 0.74, strength);
  vec3 illuminatedThinkingColor = thinkingColor * thinkingBreath * (0.92 + strength * 0.68);
  color = mix(color, illuminatedThinkingColor, iThinking * 0.82);
  color += thinkingHighlight * energySweep * strength * iThinking * 0.42;
  color += thinkingHighlight * neuralShimmer * iThinking * 0.22;
  color += thinkingColor * innerRim * iThinking * (0.44 + glassGlow * 0.18);
  color = mix(color, normalize(max(color, vec3(0.001))) * length(color), iThinking * 0.12);
  color = min(color * (1.0 + iThinking * 0.12), vec3(1.18));
  alpha = max(alpha, circle * iThinking * (0.48 + thinkingBreath * 0.18));

  vec3 releasePurple = vec3(0.72, 0.08, 1.0);
  float releaseGlow = 0.86 + 0.14 * sin(time * 8.5);
  vec3 purpleTransition = mix(luminousPurple, releasePurple, 0.68) * releaseGlow;
  color = mix(color, purpleTransition * (0.82 + strength * 0.42), iRelease * 0.82);
  color += electricHighlight * neuralShimmer * iRelease * 0.24;

  float grainSeed = dot(fragCoord, vec2(12.9898, 78.233)) + floor(time * 24.0) * 4.137;
  float grain = fract(sin(grainSeed) * 43758.5453) - 0.5;
  float grainAmount = 0.035 + iThinking * 0.075 + iRelease * 0.11;
  color += mix(softCyan, electricHighlight, strength) * grain * grainAmount;
  alpha *= 1.0 - iRelease * (0.12 + max(grain, 0.0) * 0.22);

  outputColor = vec4(color, alpha);
}

void main() {
  mainImage(fragColor, gl_FragCoord.xy);
}
`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("CORTEX shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

  if (!vertex || !fragment) {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    return null;
  }

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("CORTEX shader link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

export function InteractiveNebulaOrb({ className = "", pixelRatio = 2, isThinking = false }) {
  const canvasRef = useRef(null);
  const thinkingRef = useRef(isThinking);
  const wasThinkingRef = useRef(isThinking);
  const thinkingStartedAtRef = useRef(
    isThinking && typeof performance !== "undefined" ? performance.now() : null,
  );
  const releaseStartedAtRef = useRef(null);

  useEffect(() => {
    if (wasThinkingRef.current && !isThinking) {
      releaseStartedAtRef.current = performance.now();
      thinkingStartedAtRef.current = null;
    } else if (isThinking) {
      if (!wasThinkingRef.current) {
        thinkingStartedAtRef.current = performance.now();
      }
      releaseStartedAtRef.current = null;
    }

    wasThinkingRef.current = isThinking;
    thinkingRef.current = isThinking;
  }, [isThinking]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: "low-power",
    });
    if (!gl) return undefined;

    const program = createProgram(gl);
    const vertexArray = gl.createVertexArray();
    const positionBuffer = gl.createBuffer();

    if (!program || !vertexArray || !positionBuffer) {
      if (program) gl.deleteProgram(program);
      if (vertexArray) gl.deleteVertexArray(vertexArray);
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      return undefined;
    }

    gl.bindVertexArray(vertexArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const resolutionUniform = gl.getUniformLocation(program, "iResolution");
    const timeUniform = gl.getUniformLocation(program, "iTime");
    const frameUniform = gl.getUniformLocation(program, "iFrame");
    const mouseUniform = gl.getUniformLocation(program, "iMouse");
    const thinkingUniform = gl.getUniformLocation(program, "iThinking");
    const thinkingProgressUniform = gl.getUniformLocation(program, "iThinkingProgress");
    const releaseUniform = gl.getUniformLocation(program, "iRelease");
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const startTime = performance.now();
    let animationFrame;
    let frame = 0;
    let lastRender = 0;
    let thinkingMix = thinkingRef.current ? 1 : 0;
    let releaseMix = 0;

    const resize = () => {
      const dpr = Math.max(1, Math.min(2.5, pixelRatio));
      const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const render = (now) => {
      if (now - lastRender >= 1000 / 30 || motionPreference.matches) {
        lastRender = now;
        frame += 1;
        resize();
        gl.useProgram(program);

        if (resolutionUniform !== null) {
          gl.uniform3f(resolutionUniform, canvas.width, canvas.height, pixelRatio);
        }
        if (timeUniform !== null) gl.uniform1f(timeUniform, (now - startTime) / 1000);
        if (frameUniform !== null) gl.uniform1i(frameUniform, frame);
        if (mouseUniform !== null) gl.uniform4f(mouseUniform, 0, 0, 0, 0);
        thinkingMix += ((thinkingRef.current ? 1 : 0) - thinkingMix) * 0.12;
        if (thinkingUniform !== null) gl.uniform1f(thinkingUniform, thinkingMix);
        if (thinkingProgressUniform !== null) {
          const startedAt = thinkingStartedAtRef.current;
          const progress = startedAt === null ? 0 : Math.min((now - startedAt) / 1200, 1);
          gl.uniform1f(thinkingProgressUniform, progress);
        }
        if (releaseStartedAtRef.current !== null) {
          const releaseProgress = Math.min((now - releaseStartedAtRef.current) / 1700, 1);
          const easedReleaseProgress = releaseProgress * releaseProgress * (3.0 - 2.0 * releaseProgress);
          releaseMix = Math.sin(easedReleaseProgress * Math.PI);

          if (releaseProgress >= 1) releaseStartedAtRef.current = null;
        } else {
          releaseMix += (0 - releaseMix) * 0.12;
        }
        if (releaseUniform !== null) gl.uniform1f(releaseUniform, releaseMix);

        gl.bindVertexArray(vertexArray);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      if (!motionPreference.matches && !document.hidden) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const restart = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    document.addEventListener("visibilitychange", restart);
    motionPreference.addEventListener("change", restart);
    resize();
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", restart);
      motionPreference.removeEventListener("change", restart);
      gl.deleteBuffer(positionBuffer);
      gl.deleteVertexArray(vertexArray);
      gl.deleteProgram(program);
    };
  }, [pixelRatio]);

  return (
    <div
      className={`relative overflow-hidden rounded-full bg-transparent transition-[background-color,box-shadow] duration-1000 ease-out ${className}`}
      role="img"
      aria-label={isThinking ? "CORTEX A.I está pensando" : "Orbe animado de CORTEX A.I"}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full [image-rendering:auto]" aria-hidden="true" />
    </div>
  );
}
