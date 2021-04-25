import { Entity, SimSpace, Camera, Renderer, AssetManager, Schema } from 'yi-js-engine'
import * as Victor from 'victor'

export class RenderDecals extends Renderer {

    get schema() {
        return {};
    }

    render(tpf, asset_manager, camera, main_canvas, entities) {
        let mask_canvas = Renderer.request_canvas('mask', this.id);
        if (mask_canvas.width !== 1080) {
            mask_canvas.width = 1080;
            mask_canvas.height = 1080;
        }

        let mask_renderer = mask_canvas.getContext('2d');
        mask_renderer.imageSmoothingEnabled = false;

        mask_renderer.resetTransform();
        //mask_renderer.translate(-camera.location.x + main_canvas.width / 2, -camera.location.y + main_canvas.height / 2);
        //mask_renderer.scale(camera.zoom, camera.zoom);
        mask_renderer.translate(-1800 + 1080 / 2, -1800 + 1080 / 2);

        for (let entity of entities) {
            
            let render_data = entity.render_data[this.id];
            let image_path = render_data.image;
            if (!image_path) { continue; }
            let image = asset_manager.get_image(entity.render_data[this.id].image);

            mask_renderer.save();
            mask_renderer.translate(entity.location.x, entity.location.y);


            if (render_data.opacity !== undefined) { mask_renderer.globalAlpha = render_data.opacity; }
            if (render_data.rotation !== undefined) { mask_renderer.rotate(render_data.rotation); }

            if (render_data.scale !== undefined) { mask_renderer.scale(render_data.scale, render_data.scale); }
            if (render_data.scale_x !== undefined) { mask_renderer.scale(render_data.scale_x, 1); }
            if (render_data.scale_y !== undefined) { mask_renderer.scale(1, render_data.scale_y); }

            mask_renderer.translate(-image.width / 2, -image.height / 2);
            mask_renderer.drawImage(image, 0, 0);

            mask_renderer.restore();
            if (render_data.opacity !== undefined) { mask_renderer.globalAlpha = 1; }
        }

        let renderer = main_canvas.getContext('2d');
        if (!renderer) { throw new Error('Renderer is null'); }
        renderer.resetTransform();
        renderer.imageSmoothingEnabled = false;
        //let top_left_corner_x = window.valid_min_x;
        //let top_left_corner_y = window.valid_min_y
        // mask_renderer.drawImage(mask_texture_canvas, -(camera.location.x % (mask_texture_canvas.width / 2)), -(camera.location.y % (mask_texture_canvas.height / 2)));

        //console.log(`${(camera.location.x - top_left_corner_x - main_canvas.width) / 2}, ${(camera.location.y - top_left_corner_y - main_canvas.width) / 2}`);
        //renderer.translate((camera.location.x - top_left_corner_x - main_canvas.width) / 2, (camera.location.y - top_left_corner_y - main_canvas.width) / 2);
        let scalar = 1 / camera.zoom;
        renderer.translate(-camera.location.x + main_canvas.width / 2, -camera.location.y + main_canvas.height / 2);
        renderer.scale(camera.zoom, camera.zoom);
        //renderer.translate(1800 * scalar, 1800 * scalar);
        //renderer.translate((-1800 / 2) * scalar, (-1800 / 2) * scalar);
        renderer.drawImage(mask_canvas, (1800 + 1080 / 2) * scalar + 90, (1800 + 1080 / 2) * scalar + 90);
        renderer.resetTransform();
    }
}