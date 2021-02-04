import {connect} from 'react-redux'
import {addElectrode} from '../reducers/canvas'
import {Canvas} from '../Canvas'

const mapStateToProps = state => ({
    initPos: state.canvasReducer.initPos,
    delta: state.canvasReducer.delta,
    pinNum: state.canvasReducer.pinNum
})

const mapDispatchToProps = dispatch => ({
    addElectrode: (pos)=>{
        dispatch(addElectrode(pos));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Canvas);

