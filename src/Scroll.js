import React, { useEffect, useState, useCallback }  from 'react'
import ActuationSequence from './Actuation'
import {makeStyles} from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

export default function Scroll(props){
    const classes = useStyles();
    let actseq = new ActuationSequence(new Map(), []);
    const [actlist, setActlist] = useState([]);
    const [selected, setSelected] = useState(null);
    return (
        <div className={classes.container}>
            {actlist.map((item, index)=>{
                return <Button 
                className={classes.button} 
                style={{backgroundColor: selected===index?'#78b6c2':'#595a5e'}}
                onClick={()=>{
                    setSelected(index);
                }}
                key={index}
                >Frame Number: {`${index}`}</Button>
            })}
            <Button className={classes.add} onClick={()=>{
                setActlist(actlist=>[...actlist, {x:0, y:0}]);
                actseq.addTime();
                setSelected(actlist.length);
            }}>+</Button>
            <div style={{minWidth: "20px", height: "100px", backgroundColor:'transparent'}}></div>

        </div>
    )
}

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "row",
        flexShrink: 0,
        overflowX: "scroll",
        width: "100vw",
        height: "40vh",
        marginTop: "20px",
        backgroundColor: "#868891",
        alignItems: 'center',
        scrollPaddingRight: "10px"
    },
    button:{
        width: "15%",
        minWidth: "15%",
        height: "27vh",
        borderRadius: 5,
        color: 'white',
        margin: "10px"
    },
    add: {
        width: "6%",
        minWidth: "6%",
        height: "27vh",
        borderRadius: 5,
        color: 'white',
        backgroundColor: '#2a78de',
        margin:"10px"
    }
});
