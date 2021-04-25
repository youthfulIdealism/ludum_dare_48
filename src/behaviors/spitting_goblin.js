import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

const goblin_time_between_shots = 50;

let spitting_goblin = new Behavior('spitting_goblin', (entity, sim_space, parameters, memory, context) => {
    let player = sim_space.get_entities_with_tag('player')[0];
    let shot_countdown = parameters.shot_countdown ? parameters.shot_countdown : goblin_time_between_shots * Math.random();
    let tpf = context.tpf;
    shot_countdown -= tpf;

    if (shot_countdown <= 0 && player.location.distance(entity.location) < 500) {
        let sound = sim_space.asset_manager.get_sound('./assets/sounds/spit.wav');
        sound.play();


        let projectile = new Entity(entity.location.clone(), ['projectile']);
        world_space.add_entity(projectile);
        projectile.render_data['image-renderer'] = { image: './assets/projectile.png' };
        projectile.render_data['render-health-bar'] = {};
        projectile.render_data['render_shadow'] = { image: './assets/shadow.png', opacity: .3, scale: .3, offset_y: 50 };
        world_space.entity_add_event_listener(projectile, 'update', 'projectile', { speed: 18, range: 1000, direction: player.location.clone().subtract(entity.location).normalize() });
        world_space.entity_add_event_listener(projectile, 'update', 'check_player_impact', {});

        parameters.shot_countdown = goblin_time_between_shots;
    } else {
        parameters.shot_countdown = shot_countdown;
    }
    
});