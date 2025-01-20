import{_,a as s,c as t,d as i,e as c,g as p,k as r,b as n,f as g}from"./excalibur-C1y0mcCw.js";import{g as l}from"./glsl-B_VQ82k_.js";const m="/sample-material/assets/noise-DZ6yXIG8.png",e=new _({width:800,height:800,displayMode:s.FitScreen,suppressPlayButton:!0}),v=l`#version 300 es
  precision mediump float;
  uniform float animation_speed;
  uniform float offset;
  uniform float u_time_ms;
  uniform sampler2D u_graphic;
  uniform sampler2D noise;
  in vec2 v_uv;
  out vec4 fragColor;

  void main() {
    vec2 animatedUV = vec2(v_uv.x, v_uv.y + (u_time_ms / 1000.) * 0.5);
    vec4 color = texture(noise, animatedUV);
    color.rgb += (v_uv.y - 0.5);
    color.rgb = step(color.rgb, vec3(0.5));
    color.rgb = vec3(1.0) - color.rgb;

    fragColor.rgb = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), v_uv.y);
    fragColor.a = color.r;
    fragColor.rgb = fragColor.rgb * fragColor.a;
  }
`;var a=new t(m,{filtering:i.Blended,wrapping:c.Repeat}),f=e.graphicsContext.createMaterial({name:"fire",fragmentSource:v,images:{noise:a}}),o=new p({pos:r(0,200),anchor:r(0,0),width:800,height:600,color:n.Red});o.graphics.material=f;e.add(o);var u=new g([a]);e.start(u);
//# sourceMappingURL=index-BbGcrcbw.js.map
