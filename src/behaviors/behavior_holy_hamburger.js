import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let has_played_chorus = false;
let has_squashed_player = false;
let behavior_holy_hamburger = new Behavior('holy_hamburger', (entity, sim_space, parameters, memory, context) => {

    if (!has_played_chorus) {
        let angel_sound = sim_space.asset_manager.get_sound('./assets/sounds/angels.wav');
        angel_sound.play();
        has_played_chorus = true;
    }

    if (entity.render_data['image-renderer'].offset_y < -30) {
        entity.render_data['image-renderer'].offset_y += 40 * context.tpf;
    } else {
        if (!has_squashed_player) {
            let squash_sound = sim_space.asset_manager.get_sound('./assets/sounds/player_squish.wav');
            squash_sound.play();
            has_squashed_player = true;

            //permanent ichor marks
            for (let w = 0; w < 30; w++) {
                let ichor = new Entity(entity.location.clone().add(Victor(Math.random() - .5, Math.random() - .5).multiply(Victor(12, 12))), []);
                world_space.add_entity(ichor);
                let ichor_config = {
                    'renderer': 'render-decals',
                    'start_scale': .4 - Math.random() * .1,
                    'end_scale': .01,
                    'start_opacity': .4,
                    'end_opacity': .1,
                    'start_rotation': 0,
                    'end_rotation': 0,
                    //'direction': damage_check_adder.clone().normalize().add(Victor(Math.random() - .5 * 2, Math.random() - .5 * 2)),
                    'direction': Victor(Math.random() - .5, Math.random() - .5 * .5),
                    'velocity': 16,
                    'acceleration': 1 - .045,
                    'duration': 40 + Math.random() * 10,
                };
                world_space.entity_add_event_listener(ichor, 'update', 'particle', ichor_config);
                ichor.render_data['render-decals'] = { image: './assets/blood_particle.png', scale: ichor_config.start_scale, opacity: ichor_config.start_opacity };
            }


        } else {
            window.current_text = ['Victory!'];
        }
    }
    


},);