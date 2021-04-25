import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let current_wave_index = 0;
let waves = [
    {
        goblins: 3,
    },
    {
        goblins: 4,
        big_goblins: 1
    },
    {
        goblins: 6,
        big_goblins: 4
    },
    {
        goblins: 3,
        big_goblins: 2,
        spitting_goblins: 2
    },
    {
        shield_goblins: 2,
        spitting_goblins: 3
    },
    {
        goblins: 5,
        shield_goblins: 2,
        spitting_goblins: 4
    },
    {
        goblins: 12,
        shield_goblins: 4,
        spitting_goblins: 5,
        big_goblins: 4,
    },// DO NOT ADD MORE WAVES -- It'll break the music.
]

let music_paths = [
    './assets/sounds/music_intensity_0.wav',
    './assets/sounds/music_intensity_1.wav',
    './assets/sounds/music_intensity_2.wav',
    './assets/sounds/music_intensity_3.wav',
    './assets/sounds/music_intensity_4.wav',
    './assets/sounds/music_intensity_5.wav',
    './assets/sounds/music_intensity_6.wav'
];
let music_interlude_path = './assets/sounds/music_interlude.wav'
let current_music = undefined;
let queued_music = music_interlude_path;

let behavior_bell = new Behavior('bell', (entity, sim_space, parameters, memory, context) => {
    let remaining_enemies = sim_space.get_entities_with_tag('enemy')
    let enemy_spawners = sim_space.get_entities_with_tag('enemy_spawner')

    /*
     * 
     * return service.currentAudio
        && service.currentAudio.currentTime > 0
        && !service.currentAudio.paused
        && !service.currentAudio.ended
        && service.currentAudio.readyState > 2;
     * */
    if (!current_music || current_music.paused || current_music.ended) {
        current_music = sim_space.asset_manager.get_sound(queued_music);
        current_music.loop = true;
        current_music.play();
    }
    queued_music = music_interlude_path;

    entity.memory.armor = 5;
    entity.memory.max_health = waves.length;
    entity.memory.health = waves.length - current_wave_index;

    if (remaining_enemies.length > 1) { queued_music = music_paths[current_wave_index]; return false; }
    if (enemy_spawners.length > 0) { queued_music = music_paths[current_wave_index]; return false; }
    if (current_wave_index >= waves.length) { return false; }
    let current_wave = waves[current_wave_index];

    if (current_wave_index > 0) { window.current_text = ['The bell is vulnerable!'];}
    
    entity.memory.armor = 0;

    if (!entity.memory.hit) { return false; }
    window.current_text = [];
    entity.memory.hit = false;

    //force-switch audio
    let time = current_music.currentTime;
    current_music.pause();
    current_music.currentTime = 0;
    current_music = sim_space.asset_manager.get_sound(music_paths[current_wave_index]);
    current_music.currentTime = time;
    current_music.play();
    current_music.loop = true;

    let sound = sim_space.asset_manager.get_sound('./assets/sounds/spawn_drone.wav');
    sound.play();

    if (current_wave.goblins) {
        for (let q = 0; q < current_wave.goblins; q++) {
            let spawner = new Entity(Victor(0, 0), ['enemy_spawner']);
            world_space.add_entity(spawner);
            world_space.entity_add_event_listener(spawner, 'update', 'spawn_goblin', {});
        }
    }

    if (current_wave.big_goblins) {
        for (let q = 0; q < current_wave.big_goblins; q++) {
            let spawner = new Entity(Victor(0, 0), ['enemy_spawner']);
            world_space.add_entity(spawner);
            world_space.entity_add_event_listener(spawner, 'update', 'spawn_big_goblin', {});
        }
    }

    if (current_wave.spitting_goblins) {
        for (let q = 0; q < current_wave.spitting_goblins; q++) {
            let spawner = new Entity(Victor(0, 0), ['enemy_spawner']);
            world_space.add_entity(spawner);
            world_space.entity_add_event_listener(spawner, 'update', 'spawn_spitting_goblin', {});
        }
    }
    
    if (current_wave.shield_goblins) {
        for (let q = 0; q < current_wave.shield_goblins; q++) {
            let spawner = new Entity(Victor(0, 0), ['enemy_spawner']);
            world_space.add_entity(spawner);
            world_space.entity_add_event_listener(spawner, 'update', 'spawn_shield_goblin', {});
        }
    }

    current_wave_index++;
}, {});