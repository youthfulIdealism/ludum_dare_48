import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let behavior_mouse_camera = new Behavior('mouse_camera', (entity, sim_space, parameters, memory, context) => {
    let input_manager = sim_space.input_manager;
    let mouse_location = input_manager.mouse.location;
    let world_location = window.camera.screen_location_to_world_location(window.canvas, mouse_location.clone()).clone();

    let player = sim_space.get_entities_with_tag('player')[0];
    let player_distance = 60;
    entity.location.mix(player.location.clone().add(world_location.clone().subtract(player.location).normalize().multiply(Victor(player_distance, player_distance))), .07);
});