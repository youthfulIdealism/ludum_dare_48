import { Entity, SimSpace, Camera, Renderer, AssetManager, Schema } from 'yi-js-engine'
import * as Victor from 'victor'

export class RenderHealthBar extends Renderer {

    get schema() {
        return {};
    }

    render(tpf, asset_manager, camera, main_canvas, entities) {
        let renderer = main_canvas.getContext('2d');
        if (!renderer) { throw new Error('Renderer is null'); }
        renderer.resetTransform();
        renderer.imageSmoothingEnabled = false;

        renderer.translate(- camera.location.x + main_canvas.width / 2, -camera.location.y + main_canvas.height / 2);
        renderer.scale(camera.zoom, camera.zoom);

        for (let entity of entities) {
            renderer.save()
            renderer.translate(entity.location.x, entity.location.y);
            let health = entity.memory.health ? entity.memory.health : 0;
            let max_health = entity.memory.max_health ? entity.memory.max_health : health;
            let armor = entity.memory.armor ? entity.memory.armor : 0;
            let slot_count = max_health + armor;
            let slot_width = 8;
            let inner_width = 6;

            let x_offset = entity.render_data[this.id].x_offset ? entity.render_data[this.id].x_offset : -(slot_count * slot_width) / 2;
            let y_offset = entity.render_data[this.id].y_offset ? entity.render_data[this.id].y_offset : 20;

            //draw slots
            for (let q = 0; q < slot_count; q++) {
                renderer.fillStyle = 'black';
                renderer.fillRect(x_offset + slot_width * q, y_offset, slot_width, 6);
            }

            //draw health
            for (let q = 0; q < health; q++) {
                renderer.fillStyle = 'red';
                renderer.fillRect(x_offset + 1 + slot_width * q, y_offset + 1, inner_width, 4);
            }

            //draw armor
            for (let q = 0; q < armor; q++) {
                renderer.fillStyle = 'grey';
                renderer.fillRect(x_offset + 1 + slot_width * max_health + slot_width * q, y_offset + 1, inner_width, 4);
            }
            renderer.restore();
        }
    }
}