// GLSL for the scroll hero, unchanged from the original page.

// the film plane: fills the screen
export const STAGE_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;

// the film plane: cross-fades two frames, adds mist, lens split, vignette and grain
export const STAGE_FRAG = `
      precision highp float;
      uniform sampler2D tA, tB; uniform float uMix, uTime, uVel, uMist, uFlow, uZoom; uniform vec2 uRes, uImg, uMouse;
      varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
      float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 4; i++){ v += a*noise(p); p = p*2.03 + 7.1; a *= .5; } return v; }
      vec2 cover(vec2 uv){ float rs = uRes.x/uRes.y, ri = uImg.x/uImg.y;
        vec2 s = rs > ri ? vec2(1., ri/rs) : vec2(rs/ri, 1.); return (uv - .5)*s + .5; }
      vec3 samp(vec2 uv){ return mix(texture2D(tA, uv).rgb, texture2D(tB, uv).rgb, uMix); }
      void main(){
        vec2 uv = cover(vUv);
        uv = (uv - .5)/uZoom + .5 + uMouse*.008;
        uv.y = 1. - uv.y;
        vec2 dir = uv - .5;
        float ca = uVel * .012;
        vec3 col = samp(uv);
        if (abs(ca) > .0004) col = vec3(samp(uv + dir*ca).r, col.g, samp(uv - dir*ca).b);
        if (uMist > .004) {
          vec2 q = vUv*vec2(uRes.x/uRes.y, 1.)*1.6;
          float n = fbm(q + vec2(uTime*.015, -uFlow - uTime*.03));
          float n2 = fbm(q*1.7 - vec2(uTime*.02, uFlow*1.4));
          float m = smoothstep(.38, .9, n*.65 + n2*.45);
          col = mix(col, vec3(.965, .955, .94), clamp(uMist*m, 0., .9));
        }
        float vig = smoothstep(1.25, .35, length((vUv - .5)*vec2(uRes.x/uRes.y, 1.)));
        col *= mix(.8, 1., vig);
        col += (hash(vUv*uRes + fract(uTime)*100.) - .5)*.03;
        gl_FragColor = vec4(col, 1.);
      }`;

// drifting particles: position and size
export const PARTICLE_VERT = `
      attribute vec3 seed; uniform float uTime, uFlow, uSize, uPR; varying float vA;
      void main(){
        float d = mix(.25, 1., seed.z);
        float y = fract(seed.y + uFlow*1.4*d + uTime*.008*d);
        float x = fract(seed.x + sin(uTime*.25 + seed.z*30.)*.012*d);
        gl_Position = vec4(x*2. - 1., y*2. - 1., 0., 1.);
        gl_PointSize = uSize*d*d*uPR;
        vA = d*smoothstep(0., .12, y)*smoothstep(1., .85, y);
      }`;

// drifting particles: soft round dots
export const PARTICLE_FRAG = `
      uniform float uAlpha; uniform vec3 uColor; varying float vA;
      void main(){ float r = length(gl_PointCoord - .5); float a = smoothstep(.5, .0, r); gl_FragColor = vec4(uColor, a*a*vA*uAlpha); }`;
