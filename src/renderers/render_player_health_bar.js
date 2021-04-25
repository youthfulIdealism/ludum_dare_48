import { Entity, SimSpace, Camera, Renderer, AssetManager, Schema } from 'yi-js-engine'
import * as Victor from 'victor'

export class RenderPlayerHealthBar extends Renderer {

    get schema() {
        return {};
    }

    render(tpf, asset_manager, camera, main_canvas, entities) {
        let renderer = main_canvas.getContext('2d');
        if (!renderer) { throw new Error('Renderer is null'); }
        renderer.resetTransform();
        renderer.imageSmoothingEnabled = false;

        for (let entity of entities) {
            renderer.save()
            renderer.translate(50, 50);
            let health = entity.memory.health ? entity.memory.health : 0;
            let max_health = entity.memory.max_health ? entity.memory.max_health : health;
            let slot_width = 60;

            //draw slots
            for (let q = 0; q < max_health; q++) {
                renderer.fillStyle = 'black';
                renderer.fillRect(slot_width * q, 0, slot_width, 30);
            }

            //draw health
            for (let q = 0; q < health; q++) {
                renderer.fillStyle = 'red';
                renderer.fillRect(2 + slot_width * q, 2, slot_width - 4, 30 - 4);
            }

            renderer.restore();
        }
    }
}