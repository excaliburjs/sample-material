var p=Object.defineProperty;var f=(o,t,e)=>t in o?p(o,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):o[t]=e;var l=(o,t,e)=>f(o,typeof t!="symbol"?t+"":t,e);import{_ as d,a as h,g,k as i,l as w,o as b,b as u}from"./excalibur-C1y0mcCw.js";const S=`#version 300 es
precision mediump float;

in vec2 v_uv; // built in from excalibur

out vec4 fragColor;

uniform vec2 u_resolution; // built in uniform from excalibur
uniform vec2 u_graphic_resolution; // built in uniform from excalibur
uniform float u_spacing;
uniform float u_width;
uniform vec2 u_camera;
uniform float u_camera_zoom;
uniform vec2 u_offset;
uniform vec4 u_background_color;
uniform vec4 u_line_color;

vec3 drawGrid(vec2 center, vec3 color, vec3 lineColor, float spacing, float width, float zoom) {
    spacing *= zoom;
    vec2 cells = abs(fract(center * u_graphic_resolution / spacing) - 0.5);
    float distToEdge = (0.5 - max(cells.x, cells.y)) * spacing;
    float lines = smoothstep(0., width, distToEdge);
    color = mix(lineColor,color,lines);
    return color;
}
void main() {
    vec2 center = v_uv; // center screen
    vec2 offset = (u_offset / u_graphic_resolution) * u_camera_zoom;
    vec2 distFromCenter = (center + offset)  - (u_camera / u_graphic_resolution) * u_camera_zoom;
    vec3 gridColor = drawGrid(distFromCenter, u_background_color.rgb, u_line_color.rgb, u_spacing, u_width,  u_camera_zoom);
    fragColor.a = 1.;
    fragColor.rgb = gridColor * fragColor.a; // excalibur expects pre-multiplied colors in shaders

}

`;class v extends g{constructor(e){super({pos:i(0,0),anchor:i(0,0),coordPlane:w.Screen,z:-1/0});l(this,"originalCenter");l(this,"material");this.size=e}onInitialize(e){this.originalCenter=e.currentScene.camera.pos,this.graphics.use(new b({width:e.screen.resolution.width,height:e.screen.resolution.height,color:u.Transparent})),this.material=e.graphicsContext.createMaterial({name:"grid",fragmentSource:S}),this.material.update(n=>{n.trySetUniformFloat("u_spacing",this.size),n.trySetUniformFloat("u_width",1);const a=i(e.screen.resolution.width,e.screen.resolution.height),c=a.sub(a.scale(1/e.currentScene.camera.zoom)).scale(.5);n.trySetUniformFloatVector("u_offset",c),n.trySetUniformFloatColor("u_background_color",u.ExcaliburBlue),n.trySetUniformFloatColor("u_line_color",u.White)}),this.graphics.material=this.material,this.graphics.onPreDraw=()=>{this.material.update(n=>{const a=this.originalCenter.sub(e.currentScene.camera.pos),c=i(e.screen.resolution.width,e.screen.resolution.height),_=c.sub(c.scale(1/e.currentScene.camera.zoom)).scale(.5);n.trySetUniformFloatVector("u_offset",_),n.trySetUniformFloatVector("u_camera",a),n.trySetUniformFloat("u_camera_zoom",e.currentScene.camera.zoom)})}}}const r=new d({width:800,height:800,displayMode:h.FitScreen});r.add(new v(32));let s,m=!1;r.input.pointers.primary.on("down",o=>{s=o.worldPos,m=!0});r.input.pointers.primary.on("up",()=>{m=!1});r.input.pointers.primary.on("move",o=>{if(m){const e=r.screen.worldToScreenCoordinates(r.currentScene.camera.pos).sub(o.screenPos).scale(1/r.currentScene.camera.zoom);r.currentScene.camera.pos=s.add(e)}});r.input.pointers.primary.on("wheel",o=>{r.currentScene.camera.pos=s,o.deltaY<0?r.currentScene.camera.zoom*=1.02:r.currentScene.camera.zoom/=1.02});r.start().then(()=>{s=r.currentScene.camera.pos});r.start();
//# sourceMappingURL=index-7XxETAfB.js.map
