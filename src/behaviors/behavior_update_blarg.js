import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

const damage_tick_frequency = 10;

let behavior_update_blarg = new Behavior('update_blarg', (entity, sim_space, parameters, memory, context) => {
    if (!sim_space.input_manager) { return; }

    //get mouse location
    let input_manager = sim_space.input_manager;
    let mouse_location = input_manager.mouse.location;
    let world_location = window.camera.screen_location_to_world_location(window.canvas, mouse_location.clone()).clone();

    //move the blarg endpoint towards the mouse
    let target_location = parameters.target_location ? parameters.target_location : world_location.clone();
    target_location.mix(world_location, .01);
    parameters.target_location = target_location;


    let player = sim_space.get_entities_with_tag('player')[0];
    let enemies = sim_space.get_entities_with_tag('enemy');
    let tpf = context.tpf;


    //generate render direction
    let start_loc = player.location.clone();
    let direction = target_location.clone().subtract(start_loc).normalize();
    entity.location = start_loc;
    entity.render_data['mask-renderer-bg'].rotation = direction.angle() - (Math.PI / 2) * 3;

    //keep player from moving bery fast
    player.event_listeners.update.wasd.speed = 2;

    //tick down until damage time
    if (parameters.time_until_damage_tick === undefined) { parameters.time_until_damage_tick = 0; }
    if (parameters.damage_ticks_remaining === undefined) { parameters.damage_ticks_remaining = parameters.size; }
    parameters.time_until_damage_tick -= tpf;
    let is_damage_tick = parameters.time_until_damage_tick <= 0;

    if (is_damage_tick) {
        parameters.time_until_damage_tick = damage_tick_frequency;
        parameters.damage_ticks_remaining--;
        if (parameters.damage_ticks_remaining < 0) {
            //stop the blarg
            sim_space.remove_entity(entity);

            //reset the player size
            player.event_listeners.update.wasd.speed = window.player_speed_settings[0];
            player.memory.size = 0;
            player.memory.animation = player.memory.animations[`idle_${player.memory.size}`];
        }
    }

    let damage_check_location = start_loc.clone();
    let damage_check_interval = 30;
    let damage_check_adder = direction.clone().multiply(Victor(damage_check_interval, damage_check_interval));
    for (let q = 0; q < 1920 / 2; q += damage_check_interval) {
        for (let enemy of enemies) {
            if (damage_check_location.distance(enemy.location) < 40) {
                if (is_damage_tick) {
                    //deal damage
                    
                    if (enemy.memory.armor === undefined || parameters.size >= enemy.memory.armor) {
                        enemy.memory.health--;
                    }

                    if (enemy.memory.health <= 0) {
                        sim_space.remove_entity(enemy);
                    }
                    
                }
            }
        }
        damage_check_location.add(damage_check_adder)
    }

}, {});

console.log('Loaded')