import {createStore, combineReducers} from 'redux';
import {canvasReducer} from './canvas'
import {scrollReducer} from './scroll'
const rootReducer = combineReducers(canvasReducer, scrollReducer);
const baseStore = createStore(rootReducer);
export default baseStore;