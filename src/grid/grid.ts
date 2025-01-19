import { Actor, Color, CoordPlane, DisplayMode, Engine, Material, Rectangle, Vector, vec } from "excalibur";

import gridSource from './grid.glsl?raw' // vite needs raw pragma to get import as text

export class Grid extends Actor {
    originalCenter!: Vector;
    material!: Material;
    constructor(public size: number) {
        super({
            pos: vec(0, 0),
            anchor: vec(0, 0),
            coordPlane: CoordPlane.Screen,
            z: -Infinity
        })
    }

    onInitialize(engine: Engine): void {
        this.originalCenter = engine.currentScene.camera.pos;
        this.graphics.use(new Rectangle({
            width: engine.screen.resolution.width,
            height: engine.screen.resolution.height,
            color: Color.Transparent // overridden by shader
        }));
        this.material = engine.graphicsContext.createMaterial({
            name: 'grid',
            fragmentSource: gridSource
        });
        this.material.update(shader => {
            shader.trySetUniformFloat('u_spacing', this.size);
            shader.trySetUniformFloat('u_width', 1);
            const res = vec(engine.screen.resolution.width, engine.screen.resolution.height);
            const offset = res.sub(res.scale(1 / engine.currentScene.camera.zoom)).scale(.5);
            shader.trySetUniformFloatVector('u_offset', offset);
            shader.trySetUniformFloatColor('u_background_color', Color.ExcaliburBlue);
            shader.trySetUniformFloatColor('u_line_color', Color.White);
        });
        this.graphics.material = this.material;

        this.graphics.onPreDraw = () => {
            this.material.update(shader => {
                const delta = this.originalCenter.sub(engine.currentScene.camera.pos);
                const res = vec(engine.screen.resolution.width, engine.screen.resolution.height);
                const offset = res.sub(res.scale(1 / engine.currentScene.camera.zoom)).scale(.5);
                shader.trySetUniformFloatVector('u_offset', offset);
                shader.trySetUniformFloatVector('u_camera', delta);
                shader.trySetUniformFloat('u_camera_zoom', engine.currentScene.camera.zoom);
            })
        }
    }
}

const game = new Engine({
    width: 800,
    height: 800,
    displayMode: DisplayMode.FitScreen
});

game.add(new Grid(32));
let currentPointer!: ex.Vector;
let down = false;
game.input.pointers.primary.on('down', (e) => {
    currentPointer = e.worldPos;
    down = true;
});
game.input.pointers.primary.on('up', () => {
    down = false;
});

game.input.pointers.primary.on('move', (e) => {
    if (down) {
        // drag the camera
        const currentCameraScreen = game.screen.worldToScreenCoordinates(game.currentScene.camera.pos)
        const delta = currentCameraScreen.sub(e.screenPos).scale(1 / game.currentScene.camera.zoom);
        game.currentScene.camera.pos = currentPointer.add(delta);
    }
})


game.input.pointers.primary.on('wheel', (wheelEvent) => {
    // wheel up
    game.currentScene.camera.pos = currentPointer;
    if (wheelEvent.deltaY < 0) {
        game.currentScene.camera.zoom *= 1.02;
    } else {
        game.currentScene.camera.zoom /= 1.02;
    }
});

game.start().then(() => {
    currentPointer = game.currentScene.camera.pos;
});

game.start();
