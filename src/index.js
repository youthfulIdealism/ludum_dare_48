import { Entity, SimSpace, Behavior, ImageRenderer, BlockRenderer, MaskRenderer, ChaseCamera, behavior_registry, renderer_registry, InputManager, WholeScreenRenderer, AnimationRenderer, Renderer, behavior_play_sound } from 'yi-js-engine'
import './behaviors/behavior_wasd';
import './behaviors/behavior_click';
import './behaviors/behavior_log';

import * as Victor from 'victor'
const world_scale = 2;

window.vue = new Vue({
    el: '#main',
    components: {},
    data: {},
    computed: {
    },
    methods: {}
});

function random(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function lerp(v0, v1, t) {
    return v0 * (1 - t) + v1 * t;
}

function within(x, test, tolerance) {
    return x <= test + tolerance && x >= test - tolerance;
}

let canvas = document.getElementById('canvas_low_res');
window.canvas = canvas;

const image_renderer_id = 'image-renderer';
const block_renderer_id = 'block-renderer';
const mask_bg_renderer_id = 'mask-renderer-bg';
const render_animation_id = 'render-animation';

let input_manager;
let world_space;

let camera = new ChaseCamera(Victor(0, 0), 'empty');
camera.zoom = world_scale;
window.camera = camera;
let block_renderer = new BlockRenderer(block_renderer_id, (sim_space) => { return Object.values(sim_space.entities).filter(entity => entity.render_data[block_renderer_id] !== undefined); });
let image_renderer = new ImageRenderer(image_renderer_id, (sim_space) => { return Object.values(sim_space.entities).filter(entity => entity.render_data[image_renderer_id] !== undefined); });
let mask_renderer = new MaskRenderer(mask_bg_renderer_id, (sim_space) => { return Object.values(sim_space.entities).filter(entity => entity.render_data[mask_bg_renderer_id] !== undefined); }, './assets/bg.png', true)
let animation_renderer = new AnimationRenderer(render_animation_id, (sim_space) => { return Object.values(sim_space.entities).filter(entity => entity.render_data[render_animation_id] !== undefined); })

function init_world_space() {
    world_space = new SimSpace();
    world_space.push_renderer(animation_renderer, camera);
    world_space.push_renderer(image_renderer, camera);
    world_space.push_renderer(block_renderer, camera);
    world_space.push_renderer(mask_renderer, camera);

    window.world_space = world_space;
    if (input_manager) { input_manager.destroy(); }
    input_manager = new InputManager(world_space);
    world_space.input_manager = input_manager;
}

init_world_space();

let player = new Entity(Victor(0, 0), ['player']);
camera.entity_id = player.id;
world_space.add_entity(player);
world_space.entity_add_event_listener(player, 'update', 'wasd', {});

world_space.entity_add_event_listener(player, 'click', 'play_sound', { sounds: [{ path: './assets/sounds/test_sound.wav' }] });
world_space.entity_add_event_listener(player, 'click', 'log', {text: 'hi there'});
//player.render_data[image_renderer_id] = { image: './assets/stub.png' };
player.render_data[mask_bg_renderer_id] = { image: './assets/stub.png' };

let box = new Entity(Victor(0, 0), []);
world_space.add_entity(box);
//world_space.entity_add_event_listener(player, 'update', 'wasd', {});
//player.render_data[image_renderer_id] = { image: './assets/stub.png' };
box.render_data[block_renderer_id] = { height: 60, width: 60 };

let cursor = new Entity(Victor(0, 0), []);
world_space.add_entity(cursor);
world_space.entity_add_event_listener(cursor, 'update', 'click', {});


function loop(timestamp) {
    var progress = timestamp - last_render_timestamp;

    let tpf = progress / 64;

    world_space.update(tpf);
    if (input_manager) { input_manager.update(); }
    

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    world_space.draw(tpf, canvas);

    last_render_timestamp = timestamp;
    window.requestAnimationFrame(loop);
}
let last_render_timestamp = 0
window.requestAnimationFrame(loop)