import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let behavior_splat = new Behavior('splat', (entity, sim_space, parameters, memory, context) => {
    if (context.entity === entity) {
        let render_data = entity.render_data['image-renderer'];
        let splat_particle = new Entity(parameters.location.clone(), []);
        world_space.add_entity(splat_particle);
        world_space.entity_add_event_listener(splat_particle, 'update', 'particle', {
            'renderer': 'render-decals',
            'start_scale': render_data.scale ? render_data.scale : 1,
            'end_scale': render_data.scale ? render_data.scale : 1,
            'start_opacity': render_data.opacity ? render_data.opacity : 1,
            'end_opacity': render_data.opacity ? render_data.opacity : 1,
            'start_rotation': render_data.rotation ? render_data.rotation : 1,
            'end_rotation': render_data.rotation ? render_data.rotation : 1,
            'duration': .01,
            'direction': Victor(1, 0),
            'velocity': 0,
        });
        splat_particle.render_data['render-decals'] = render_data;
    }
}, {});