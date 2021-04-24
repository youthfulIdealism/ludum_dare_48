import { Entity, SimSpace, Behavior, ImageRenderer, BlockRenderer, MaskRenderer, ChaseCamera, behavior_registry, renderer_registry, InputManager, WholeScreenRenderer, AnimationRenderer, Renderer, behavior_play_sound } from 'yi-js-engine'
import './behaviors/behavior_wasd';
import './behaviors/behavior_click';
import './behaviors/behavior_log';
import './behaviors/eat';
import './behaviors/player_impact';
import './behaviors/mouse_camera';
import './behaviors/goblin';
import './behaviors/behavior_blarg';
import './behaviors/behavior_update_blarg';

import { RenderHealthBar } from './renderers/render_health_bar';

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
const render_health_bar_id = 'render-health-bar';

let input_manager;
let world_space;

let camera = new ChaseCamera(Victor(0, 0), 'empty');
camera.zoom = world_scale;
window.camera = camera;
let block_renderer = new BlockRenderer(block_renderer_id, (sim_space) => { return Object.values(sim_space.entities).filter(entity => entity.render_data[block_renderer_id] !== undefined); });
let image_renderer = new ImageRenderer(image_renderer_id, (sim_space) => { return Object.values(sim_space.entities).filter(entity => entity.render_data[image_renderer_id] !== undefined); });
let mask_renderer = new MaskRenderer(mask_bg_renderer_id, (sim_space) => { return Object.values(sim_space.entities).filter(entity => entity.render_data[mask_bg_renderer_id] !== undefined); }, './assets/bg.png', true)
let animation_renderer = new AnimationRenderer(render_animation_id, (sim_space) => { return Object.values(sim_space.entities).filter(entity => entity.render_data[render_animation_id] !== undefined); })
let health_bar_renderer = new RenderHealthBar(render_health_bar_id, (sim_space) => { return Object.values(sim_space.entities).filter(entity => entity.render_data[render_health_bar_id] !== undefined); })

function init_world_space() {
    world_space = new SimSpace();
    world_space.push_renderer(mask_renderer, camera);
    world_space.push_renderer(animation_renderer, camera);
    world_space.push_renderer(image_renderer, camera);
    world_space.push_renderer(block_renderer, camera);
    world_space.push_renderer(health_bar_renderer, camera);
    
    window.world_space = world_space;
    if (input_manager) { input_manager.destroy(); }
    input_manager = new InputManager(world_space);
    world_space.input_manager = input_manager;
}

init_world_space();

let player = new Entity(Victor(0, 0), ['player']);
world_space.add_entity(player);
player.memory.animations = {
    idle_0: {
        frames: [
            {
                image: "./assets/player_0_idle_0.png",
                duration: 50
            }
        ],
        type: 'loop',
    },
    idle_1: {
        frames: [
            {
                image: "./assets/player_1_idle_0.png",
                duration: 50
            }
        ],
        type: 'loop',
    },
    idle_2: {
        frames: [
            {
                image: "./assets/player_2_idle_0.png",
                duration: 50
            }
        ],
        type: 'loop',
    },
    idle_3: {
        frames: [
            {
                image: "./assets/player_3_idle_0.png",
                duration: 50
            }
        ],
        type: 'loop',
    },
}

window.player_speed_settings = [16, 10, 5, 3];

player.memory.animation = JSON.parse(JSON.stringify(player.memory.animations.idle_0));
player.memory.size = 0;
player.memory.width = 40;
world_space.entity_add_event_listener(player, 'update', 'wasd', { speed: 16 });
world_space.entity_add_event_listener(player, 'update', 'blarg', {});
world_space.entity_add_event_listener(player, 'click', 'play_sound', { sounds: [{ path: './assets/sounds/test_sound.wav' }] });
world_space.entity_add_event_listener(player, 'click', 'log', { text: 'hi there' });
world_space.entity_add_event_listener(player, 'collide', 'eat', { amount: 1 });
player.render_data[render_animation_id] = { };
/*let box = new Entity(Victor(0, 0), []);
world_space.add_entity(box);
box.render_data[block_renderer_id] = { height: 60, width: 60 };*/

for (let q = 0; q < 5; q++) {
    let food = new Entity(Victor(100 + Math.random() * 400, 100 + Math.random() * 400), ['food']);
    world_space.add_entity(food);
    food.render_data[image_renderer_id] = { image: './assets/food_0.png' };
    world_space.entity_add_event_listener(food, 'update', 'check_player_impact', {});
}

for (let q = 0; q < 5; q++) {
    let goblin = new Entity(Victor(100 + Math.random() * 400, 100 + Math.random() * 400), ['goblin', 'enemy']);
    world_space.add_entity(goblin);
    goblin.memory.health = 1;
    goblin.memory.max_health = 1;
    goblin.render_data[image_renderer_id] = { image: './assets/goblin.png' };
    goblin.render_data[render_health_bar_id] = {};
    world_space.entity_add_event_listener(goblin, 'update', 'goblin', {});
}

for (let q = 0; q < 3; q++) {
    let big_goblin = new Entity(Victor(100 + Math.random() * 400, 100 + Math.random() * 400), ['goblin', 'enemy']);
    world_space.add_entity(big_goblin);
    big_goblin.memory.health = 1;
    big_goblin.memory.max_health = 1;
    big_goblin.memory.armor = 2;
    big_goblin.render_data[image_renderer_id] = { image: './assets/shield_goblin.png' };
    big_goblin.render_data[render_health_bar_id] = {};
    world_space.entity_add_event_listener(big_goblin, 'update', 'goblin', {});
}

let cursor = new Entity(Victor(0, 0), ['cursor']);
world_space.add_entity(cursor);
world_space.entity_add_event_listener(cursor, 'update', 'mouse_camera', {});
world_space.entity_add_event_listener(cursor, 'update', 'click', {});
camera.entity_id = cursor.id;

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