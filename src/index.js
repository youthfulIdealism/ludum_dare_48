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
import './behaviors/hit_by_charging_goblin';
import './behaviors/behavior_immune_time';
import './behaviors/behavior_food_float';
import './behaviors/behavior_bell';
import './behaviors/behavior_spawn_goblin';
import './behaviors/behavior_spawn_big_goblin';
import './behaviors/behavior_spawn_food';
import './behaviors/behavior_manage_food'
import './behaviors/behavior_spawn_shield_goblin'
import './behaviors/behavior_spawn_spitting_goblin'
import './behaviors/spitting_goblin'
import './behaviors/projectile'
import './behaviors/shield_goblin'
import './behaviors/splat'
import './behaviors/behavior_shaddup'
import './behaviors/behavior_holy_hamburger'


import { RenderHealthBar } from './renderers/render_health_bar';
import { RenderPlayerHealthBar } from './renderers/render_player_health_bar';
import { RenderDecals } from './renderers/render_decals';

import * as Victor from 'victor'
const world_scale = 2;

let vue = new Vue({
    el: '#main',
    components: {},
    data: {
        text_segments: ['a'],
    },
    computed: {
    },
    methods: {}
});
window.vue = vue;

window.current_text = [
    'The cursed bell binds the holy hamburger.',
    'Destroy the bell!'
]

function update_text_loop() {
    let current_text = window.current_text;
    if (vue.text_segments.length > current_text.length) {
        vue.text_segments = [];
    }

    while (vue.text_segments.length < current_text.length) {
        vue.text_segments.push('');
    }

    for (let q = 0; q < current_text.length; q++) {
        let segment = current_text[q]
        if (!segment.startsWith(vue.text_segments[q])) {
            vue.text_segments.splice(q, 1, '')
        }
        if (vue.text_segments[q].length < segment.length) {
            vue.$set(vue.text_segments, q, vue.text_segments[q] + segment[vue.text_segments[q].length]);
        }
    }
    window.setTimeout(update_text_loop, 200 * Math.random())
}
window.setTimeout(update_text_loop, 200 * Math.random())

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

const render_map_background_id = 'map-background';
const image_renderer_id = 'image-renderer';
const block_renderer_id = 'block-renderer';
const mask_bg_renderer_id = 'mask-renderer-bg';
const attack_renderer_id = 'attack-renderer';
const render_animation_id = 'render-animation';
const render_health_bar_id = 'render-health-bar';
const render_player_bar_id = 'render-player-health-bar';

let input_manager;
let world_space;

let camera = new ChaseCamera(Victor(0, 0), 'empty');
camera.zoom = world_scale;
window.camera = camera;

const camera_shake_switch_time = .5;
window.shake = {
    current_offset: Victor(0, 0),
    target_offset: Victor(0, 0),
    remaining_until_switch: 0,
    remaining_violence: 5,
    remaining_duration: 0,
    shake(violence, duration) {
        this.remaining_violence = Math.max(this.remaining_violence, violence);
        this.remaining_duration = Math.max(this.remaining_duration, duration);
    },
    update(tpf) {
        this.remaining_duration -= tpf;
        this.remaining_violence *= .99;
        this.remaining_until_switch -= tpf;
        if (this.remaining_duration <= 0) { this.current_offset = Victor(0, 0); return; }
        this.current_offset.mix(this.target_offset, .1)
        if (this.remaining_until_switch <= 0) {
            this.remaining_until_switch = camera_shake_switch_time;
            this.target_offset = Victor(Math.random() - .5, Math.random() - .5).multiply(Victor(this.remaining_violence, this.remaining_violence))
        }
    }
}

let map_background_renderer = new WholeScreenRenderer(render_map_background_id, (sim_space) => { }, './assets/tiles.png', true)
let block_renderer = new BlockRenderer(block_renderer_id, (sim_space) => { return Object.values(sim_space.entities).filter(entity => entity.render_data[block_renderer_id] !== undefined); });
let shadow_renderer = new ImageRenderer('render_shadow', (sim_space) => { return Object.values(sim_space.entities).filter(entity => entity.render_data['render_shadow'] !== undefined); });
let image_renderer = new ImageRenderer(image_renderer_id, (sim_space) => { return Object.values(sim_space.entities).filter(entity => entity.render_data[image_renderer_id] !== undefined); });
let attack_renderer = new MaskRenderer(attack_renderer_id, (sim_space) => { return Object.values(sim_space.entities).filter(entity => entity.render_data[attack_renderer_id] !== undefined); }, './assets/bg_attack.png', false)
let mask_renderer = new MaskRenderer(mask_bg_renderer_id, (sim_space) => { return Object.values(sim_space.entities).filter(entity => entity.render_data[mask_bg_renderer_id] !== undefined); }, './assets/bg.png', true)
let animation_renderer = new AnimationRenderer(render_animation_id, (sim_space) => { return Object.values(sim_space.entities).filter(entity => entity.render_data[render_animation_id] !== undefined); })
let health_bar_renderer = new RenderHealthBar(render_health_bar_id, (sim_space) => { return Object.values(sim_space.entities).filter(entity => entity.render_data[render_health_bar_id] !== undefined); })
let player_health_bar_renderer = new RenderPlayerHealthBar(render_player_bar_id, (sim_space) => { return Object.values(sim_space.entities).filter(entity => entity.render_data[render_player_bar_id] !== undefined); })
let render_decals = new RenderDecals('render-decals', (sim_space) => { return Object.values(sim_space.entities).filter(entity => entity.render_data['render-decals'] !== undefined); })

function init_world_space() {
    world_space = new SimSpace();
    world_space.push_renderer(map_background_renderer, camera);
    world_space.push_renderer(render_decals, camera);
    world_space.push_renderer(shadow_renderer, camera);
    world_space.push_renderer(attack_renderer, camera);
    world_space.push_renderer(mask_renderer, camera);
    world_space.push_renderer(animation_renderer, camera);
    world_space.push_renderer(image_renderer, camera);
    world_space.push_renderer(block_renderer, camera);
    world_space.push_renderer(health_bar_renderer, camera);
    world_space.push_renderer(player_health_bar_renderer, camera);
    
    window.world_space = world_space;
    if (input_manager) { input_manager.destroy(); }
    input_manager = new InputManager(world_space);
    world_space.input_manager = input_manager;
}

init_world_space();

let player = new Entity(Victor(1600, 1800), ['player']);
window.player = player;//debugging
world_space.add_entity(player);
player.memory.animations = {
    idle_0: {
        frames: [
            {
                image: "./assets/player_0_idle_0.png",
                duration: 4
            },
            {
                image: "./assets/player_0_idle_1.png",
                duration: 4
            },
            {
                image: "./assets/player_0_idle_2.png",
                duration: 4
            },
            {
                image: "./assets/player_0_idle_1.png",
                duration: 4
            },
        ],
        type: 'loop',
    },
    run_0: {
        frames: [
            {
                image: "./assets/player_0_run_0.png",
                duration: 1
            },
            {
                image: "./assets/player_0_run_1.png",
                duration: 1
            },
            {
                image: "./assets/player_0_run_2.png",
                duration: 1
            },
            {
                image: "./assets/player_0_run_3.png",
                duration: 1
            },
            {
                image: "./assets/player_0_run_4.png",
                duration: 1
            },
            {
                image: "./assets/player_0_run_5.png",
                duration: 1
            },
            {
                image: "./assets/player_0_run_6.png",
                duration: 1
            },
            {
                image: "./assets/player_0_run_7.png",
                duration: 1
            },
        ],
        type: 'loop',
    },
    run_1: {
        frames: [
            {
                image: "./assets/player_1_run_0.png",
                duration: 1
            },
            {
                image: "./assets/player_1_run_1.png",
                duration: 1
            },
            {
                image: "./assets/player_1_run_2.png",
                duration: 1
            },
            {
                image: "./assets/player_1_run_3.png",
                duration: 1
            },
            {
                image: "./assets/player_1_run_4.png",
                duration: 1
            },
            {
                image: "./assets/player_1_run_5.png",
                duration: 1
            },
        ],
        type: 'loop',
    },
    run_2: {
        frames: [
            {
                image: "./assets/player_2_run_0.png",
                duration: 1
            },
            {
                image: "./assets/player_2_run_1.png",
                duration: 1
            },
            {
                image: "./assets/player_2_run_2.png",
                duration: 1
            },
            {
                image: "./assets/player_2_run_3.png",
                duration: 1
            },
            {
                image: "./assets/player_2_run_4.png",
                duration: 1
            },
            {
                image: "./assets/player_2_run_5.png",
                duration: 1
            },
            {
                image: "./assets/player_2_run_6.png",
                duration: 1
            },
        ],
        type: 'loop',
    },
    run_3: {
        frames: [
            {
                image: "./assets/player_3_run_0.png",
                duration: 1.5
            },
            {
                image: "./assets/player_3_run_1.png",
                duration: 1
            },
            {
                image: "./assets/player_3_run_2.png",
                duration: 1
            },
            {
                image: "./assets/player_3_run_3.png",
                duration: 1.5
            },
            {
                image: "./assets/player_3_run_1.png",
                duration: 1
            },
        ],
        type: 'loop',
    },
    idle_1: {
        frames: [
            {
                image: "./assets/player_1_idle_0.png",
                duration: 4
            },
            {
                image: "./assets/player_1_idle_1.png",
                duration: 4
            },
            {
                image: "./assets/player_1_idle_2.png",
                duration: 4
            },
            {
                image: "./assets/player_1_idle_1.png",
                duration: 4
            },
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
window.player_immune_time = 25;

player.memory.animation = JSON.parse(JSON.stringify(player.memory.animations.idle_0));
player.memory.size = 0;
player.memory.width = 25;
player.memory.health = 4;
player.memory.max_health = 4;
world_space.entity_add_event_listener(player, 'update', 'wasd', { speed: 16 });
world_space.entity_add_event_listener(player, 'update', 'blarg', {});
world_space.entity_add_event_listener(player, 'update', 'immune_time', {});
world_space.entity_add_event_listener(player, 'click', 'log', { text: 'hi there' });
world_space.entity_add_event_listener(player, 'collide', 'eat', { amount: 1 });
world_space.entity_add_event_listener(player, 'collide', 'hit_by_charging_goblin', {});
world_space.entity_add_event_listener(player, 'remove_entity', 'shaddup', {});
player.render_data[render_animation_id] = {};
player.render_data[render_player_bar_id] = {};
player.render_data['render_shadow'] = { image: './assets/shadow.png', opacity: .3, scale: .5, offset_y: 45 };


/*let box = new Entity(Victor(0, 0), []);
world_space.add_entity(box);
box.render_data[block_renderer_id] = { height: 60, width: 60 };*/

for (let q = 0; q < 5; q++) {
    let food = new Entity(Victor(1800 + 100 + Math.random() * 400, 1800 + 100 + Math.random() * 400), ['food']);
    world_space.add_entity(food);
    food.render_data[image_renderer_id] = { image: './assets/food_0.png' };
    food.render_data['render_shadow'] = { image: './assets/shadow.png', opacity: .3, scale: .5, offset_y: 35 };
    world_space.entity_add_event_listener(food, 'update', 'check_player_impact', {});
    world_space.entity_add_event_listener(food, 'update', 'food_float', {});
}
/*
for (let q = 0; q < 3; q++) {
    let big_goblin = new Entity(Victor(1800 + 100 + Math.random() * 400, 1800 + 100 + Math.random() * 400), ['goblin', 'enemy']);
    world_space.add_entity(big_goblin);
    big_goblin.memory.health = 1;
    big_goblin.memory.max_health = 1;
    big_goblin.memory.armor = 2;
    big_goblin.memory.state = 'chase';
    big_goblin.render_data[image_renderer_id] = { image: './assets/shield_goblin.png' };
    big_goblin.render_data[render_health_bar_id] = {};
    big_goblin.render_data['render_shadow'] = { image: './assets/shadow.png', opacity: .3, scale: .7, offset_y: 30 };
    world_space.entity_add_event_listener(big_goblin, 'update', 'goblin', { state: 'chase' });
    world_space.entity_add_event_listener(big_goblin, 'update', 'check_player_impact', {});
}
*/
let cursor = new Entity(Victor(0, 0), ['cursor']);
world_space.add_entity(cursor);
world_space.entity_add_event_listener(cursor, 'update', 'mouse_camera', {});
world_space.entity_add_event_listener(cursor, 'update', 'click', {});
camera.entity_id = cursor.id;

let arena_walls = new Entity(Victor(1800, 1800), ['arena_walls']);
world_space.add_entity(arena_walls);
arena_walls.render_data[image_renderer_id] = { image: './assets/arena_walls.png' };
window.valid_min_x = 1800 - 1080 / 2;
window.valid_min_y = 1800 - 1080 / 2;
window.valid_max_x = 1800 + 1080 / 2;
window.valid_max_y = 1800 + 1080 / 2;

let bell = new Entity(Victor(1800, 1800), ['bell', 'enemy']);
world_space.add_entity(bell);
world_space.entity_add_event_listener(bell, 'update', 'bell', {});
world_space.entity_add_event_listener(bell, 'update', 'manage_food', {});
bell.render_data[image_renderer_id] = { image: './assets/bell_0.png' };
bell.render_data['render_shadow'] = { image: './assets/shadow.png', opacity: .3, scale: 2, offset_y: 25 };
bell.render_data['render-health-bar'] = {};

window.in_bounds = function (location) {
    return location.x >= window.valid_min_x &&
        location.y >= window.valid_min_y &&
        location.x <= window.valid_max_x &&
        location.y <= window.valid_max_y;

}

function loop(timestamp) {
    var progress = timestamp - last_render_timestamp;

    let tpf = progress / 64;

    if (player.memory.health <= 0) {
        tpf *= .05;
        window.current_text = [
            'Game Over',
            'Refresh to try again'
        ]
    }

    world_space.update(tpf);
    if (input_manager) { input_manager.update(); }
    

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.shake.update(tpf);
    camera.location.add(window.shake.current_offset);
    try {
        world_space.draw(tpf, canvas);
    } catch (err) {
        console.log(player.memory);
    }
   

    last_render_timestamp = timestamp;
    window.requestAnimationFrame(loop);
}
let last_render_timestamp = 0
window.requestAnimationFrame(loop)