import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

const step_sound_time = 4;
const step_sound_variance = 1;
let step_accum = 0;
let sounds_by_size = [['./assets/sounds/player_0_step_0.wav', './assets/sounds/player_0_step_1.wav', './assets/sounds/player_0_step_2.wav', './assets/sounds/player_0_step_3.wav'],
    ['./assets/sounds/player_1_step_0.wav', './assets/sounds/player_1_step_1.wav', './assets/sounds/player_1_step_2.wav', './assets/sounds/player_1_step_3.wav'],
    ['./assets/sounds/player_2_step_0.wav', './assets/sounds/player_2_step_1.wav', './assets/sounds/player_2_step_2.wav', './assets/sounds/player_2_step_3.wav'],
    ['./assets/sounds/player_3_step_0.wav', './assets/sounds/player_3_step_1.wav', './assets/sounds/player_3_step_2.wav', './assets/sounds/player_3_step_3.wav'],]

let behavior_wasd = new Behavior('wasd', (entity, sim_space, parameters, memory, context) => {
    if (!sim_space.input_manager) { return; }
    if (!parameters.speed) { parameters.speed = 1; }
    if (!parameters.time_until_step_sound) { parameters.time_until_step_sound = 0; }
    if (parameters.last_size === undefined || parameters.last_size !== entity.memory.size) { parameters.time_until_step_sound = 0;}
    parameters.last_size = entity.memory.size;

    let tpf = context.tpf;
    let direction = Victor(0, 0);
    let is_moving = false;

    let input_manager = sim_space.input_manager;

    if (input_manager.is_key_down('w') || input_manager.is_key_down('ArrowUp')) { is_moving = true; direction.add(Victor(0, -1)); }
    if (input_manager.is_key_down('s') || input_manager.is_key_down('ArrowDown')) { is_moving = true; direction.add(Victor(0, 1)); }
    if (input_manager.is_key_down('a') || input_manager.is_key_down('ArrowLeft')) { is_moving = true; direction.add(Victor(-1, 0)); entity.render_data['render-animation'].scale_x = -1; }
    if (input_manager.is_key_down('d') || input_manager.is_key_down('ArrowRight')) { is_moving = true; direction.add(Victor(1, 0)); entity.render_data['render-animation'].scale_x = 1; }
    
    if (is_moving) {
        if (entity.memory.animation !== entity.memory.animations[`run_${entity.memory.size}`] && entity.memory.animations[`run_${entity.memory.size}`]) {
            entity.memory.animation = entity.memory.animations[`run_${entity.memory.size}`];
            entity.memory.animation_progress = 0;
            entity.memory.animation_current_frame = 0;
        }
        

        let potential_location = entity.location.clone().add(direction.normalize().multiply(Victor(tpf, tpf)).multiply(Victor(parameters.speed, parameters.speed)))
        if (window.in_bounds(potential_location) && !window.freeze_player) {
            entity.location = potential_location;
        }

        parameters.time_until_step_sound -= tpf;
        if (parameters.time_until_step_sound <= 0 && !window.freeze_player) {
            parameters.time_until_step_sound = step_sound_time + Math.random() * step_sound_variance;
            let sound = sim_space.asset_manager.get_sound(sounds_by_size[entity.memory.size][step_accum % sounds_by_size[entity.memory.size].length]);
            sound.play();
            step_accum++;
        }

        if (Math.random() < .1) {
            let particle_dust = new Entity(entity.location.clone().add(Victor(0, 20), []));
            world_space.add_entity(particle_dust);
            world_space.entity_add_event_listener(particle_dust, 'update', 'particle', {
                'renderer': 'image-renderer',
                'start_scale': .3,
                'end_scale': 1,
                'start_opacity': .3,
                'end_opacity': .05,
                'duration': 30 + Math.random() * 20,
                'direction': Victor(0, -1),
                'velocity': (1 + Math.random()) * .1,
            });
            particle_dust.render_data['image-renderer'] = { image: './assets/particle_dust.png', scale: .3, opacity: .3 };
        }
    } else {
        parameters.time_until_step_sound = 0;

        if (entity.memory.animation !== entity.memory.animations[`idle_${entity.memory.size}`] && entity.memory.animations[`idle_${entity.memory.size}`]) {
            entity.memory.animation = entity.memory.animations[`idle_${entity.memory.size}`];
            entity.memory.animation_progress = 0;
            entity.memory.animation_current_frame = 0;
        }
    }
    return false;

}, { 'speed': 'number' });