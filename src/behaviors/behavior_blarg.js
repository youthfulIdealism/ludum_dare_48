import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let behavior_blarg = new Behavior('blarg', (entity, sim_space, parameters, memory, context) => {
    if (!sim_space.input_manager) { return; }

    let input_manager = sim_space.input_manager;
    let mouse_location = input_manager.mouse.location;
    let world_location = window.camera.screen_location_to_world_location(window.canvas, mouse_location.clone()).clone();

    let size = entity.size;
    let other_blargs = sim_space.sim_space.get_entities_with_tag('blarg');
    if (input_manager.mouse.mouse1.went_down && size > 0 && other_blargs.length <= 0) {

        let blarg = new Entity(player.location.clone(), ['blarg']);
        world_space.add_entity(blarg);
        world_space.entity_add_event_listener(blarg, 'update', 'update_blarg', { size: entity.size, target: world_location });
    }

}, {});

console.log('Loaded')