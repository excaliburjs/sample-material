
import * as ex from 'excalibur';
import { PerlinDrawer2D, PerlinGenerator } from '@excaliburjs/plugin-perlin';
import { glsl } from '../glsl';
//import otherStar from './other-star.glsl?raw'; // ?raw pragma to get string source of the shader

const game = new ex.Engine({
    width: 800,
    height: 800,
    displayMode: ex.DisplayMode.FitScreen,
    backgroundColor: ex.Color.Black,
    fixedUpdateFps: 60,
    physics: {
        gravity: ex.vec(0, 900),
        solver: ex.SolverStrategy.Realistic
    }
});

const generator = new PerlinGenerator({
    seed: 5150,
    octaves: 40,
    frequency: 3,
    amplitude: 0.91,
    persistance: 0.475
});

// Noise is from [0-1]
const colorFcn = (val: number) => {
    return ex.Color.fromRGB(val * 255, val * 255, val * 255);
}
const drawer = new PerlinDrawer2D(generator, colorFcn);

const generateStar = (pos: ex.Vector, noiseImage: HTMLImageElement) => {
    const actor = new ex.Actor({
        pos,
        radius: 50,
        collisionType: ex.CollisionType.Active,
        color: ex.Color.Red
    });


    const material = game.graphicsContext.createMaterial({
        name: 'star',
        fragmentSource: glsl`#version 300 es
        precision mediump float;

        uniform float u_time_ms;
        uniform sampler2D u_noise;

        in vec2 v_uv;
        out vec4 color;

        float mirror(float v) {
            float m = mod(v, 2.0);
            return mix(m, 2.0 - m, step(1.0, m));
        }

        void main() {
            vec2 center = (v_uv - 0.5) * 2.;
            float distance = length(center);
            if (distance < 1.0) {
                vec2 newUv = vec2(sin(mirror(v_uv.x + u_time_ms/10000.0)), v_uv.y);
                float noise = texture(u_noise, newUv).x;
                // intensify noise and give it an orange hue
                color.rgb = mix(vec3(noise * noise * 2. ) * vec3(5., .9, 0.), vec3(noise * 1.) * vec3(0.0, .2, 1.), distance);
                // circle smooth drop off
                color.a = smoothstep(1.0 - distance, 0., .051);
                color.rgb = color.rgb * color.a;
            }
        }`,
        images: {
            'u_noise': ex.ImageSource.fromHtmlImageElement(noiseImage)
        }
    })

    actor.graphics.material = material;
    return actor;
}

game.start().then(async () => {
    const noiseImage = drawer.image(800, 800);
    await noiseImage.decode();
    // Show the generated noise
    //document.body.appendChild(noiseImage);
    game.input.pointers.on('down', (evt) => {
        game.add(generateStar(evt.worldPos, noiseImage))
    });
    //const startStar = new ex.Actor({
    //    pos: ex.vec(400, 400),
    //    radius: 200,
    //    color: ex.Color.Red,
    //    collisionType: ex.CollisionType.Active
    //});
    //startStar.graphics.material = game.graphicsContext.createMaterial({
    //    fragmentSource: otherStar
    //});
    //game.add(startStar);
    //
    const floor = new ex.Actor({
        pos: ex.vec(0, 600),
        anchor: ex.vec(0, 0),
        width: 800,
        height: 30,
        color: ex.Color.Red,
        collisionType: ex.CollisionType.Fixed
    });
    game.add(floor);
    const floor2 = new ex.Actor({
        pos: ex.vec(0, 500),
        anchor: ex.vec(0, 0),
        width: 200,
        height: 30,
        rotation: Math.PI / 3,
        color: ex.Color.Red,
        collisionType: ex.CollisionType.Fixed
    });
    game.add(floor2);

    const floor3 = new ex.Actor({
        pos: ex.vec(800, 500),
        anchor: ex.vec(1, 0),
        width: 200,
        height: 30,
        rotation: -Math.PI / 3,
        color: ex.Color.Red,
        collisionType: ex.CollisionType.Fixed
    });
    game.add(floor3);
});
