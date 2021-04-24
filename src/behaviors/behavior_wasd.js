import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

const step_sound_time = 4;
const step_sound_variance = 1;
let sounds_by_size = ['./assets/sounds/player_0_step.wav',
    './assets/sounds/player_1_step.wav',
    './assets/sounds/player_2_step.wav',
    './assets/sounds/player_3_step.wav',]

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

    if (input_manager.is_key_down('w')) { is_moving = true; direction.add(Victor(0, -1)); }
    if (input_manager.is_key_down('s')) { is_moving = true; direction.add(Victor(0, 1)); }
    if (input_manager.is_key_down('a')) { is_moving = true; direction.add(Victor(-1, 0)); }
    if (input_manager.is_key_down('d')) { is_moving = true; direction.add(Victor(1, 0)); }


    
    if (is_moving) {
        entity.location.add(direction.normalize().multiply(Victor(tpf, tpf)).multiply(Victor(parameters.speed, parameters.speed)));

        parameters.time_until_step_sound -= tpf;
        if (parameters.time_until_step_sound <= 0) {
            parameters.time_until_step_sound = step_sound_time + Math.random() * step_sound_variance;
            let sound = sim_space.asset_manager.get_sound(sounds_by_size[entity.memory.size]);
            sound.play();
        }
    } else {
        parameters.time_until_step_sound = 0;
    }
    return false;

}, { 'speed': 'number' });

console.log('Loaded')