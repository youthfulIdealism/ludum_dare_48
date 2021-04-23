import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let behavior_log = new Behavior('log', (entity, sim_space, parameters, memory, context) => {
    if (parameters.text) { console.log(parameters.text); }
    else { console.log('FLAG') }
    
    return false;

}, { 'text': 'string' });