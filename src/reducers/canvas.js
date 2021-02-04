const initialState = {
    initPos: [],
    delta: [],
    pinNum: []
}

const ADD_ELECTRODE = "ADD_ELECTRODE";
const MOVE_ELECTRODE = "MOVE_ELECTRODE";
const NUMBER = "NUMBER";

export function canvasReducer(state = initialState, action){
    switch(action.type){
        case ADD_ELECTRODE:
            let newPos = state.initPos.push(action.payload);
            let newDelta = state.delta.push(0);
            return {
                ...state,
                initPos: newPos,
                delta: newDelta
            }
        case MOVE_ELECTRODE:
            return {
                ...state,
                delta: action.payload
            }
        case NUMBER:
            let newPin = state.pinNum;
            newPin[action.payload.index] = action.payload.number;
            return {
                ...state,
                pinNum: newPin
            }
        default:
            return state
    }
}

export const addElectrode = (list) => async (dispatch) => {
    try{
        dispatch({type: ADD_ELECTRODE, payload: list});
    }catch(err){
        console.log(err);
    } 
}