import { Actor, Color, DisplayMode, Engine, ImageFiltering, ImageSource, ImageWrapping, Loader, vec } from "excalibur";
import { glsl } from "../glsl";

import noiseImg from './noise.png?url';

// identity tagged template literal lights up glsl-literal vscode plugin
const game = new Engine({
    width: 800,
    height: 800,
    displayMode: DisplayMode.FitScreen,
    suppressPlayButton: true
});

const fireShader = glsl`#version 300 es
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
`;

var noiseImage = new ImageSource(noiseImg, {
    filtering: ImageFiltering.Blended,
    wrapping: ImageWrapping.Repeat
});

var material = game.graphicsContext.createMaterial({
    name: 'fire',
    fragmentSource: fireShader,
    images: {
        noise: noiseImage
    }
});

var actor = new Actor({
    pos: vec(0, 200),
    anchor: vec(0, 0),
    width: 800,
    height: 600,
    color: Color.Red
});
actor.graphics.material = material;
game.add(actor);

var loader = new Loader([noiseImage]);

game.start(loader);
