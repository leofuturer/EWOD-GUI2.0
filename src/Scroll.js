import React, { useEffect, useState, useContext }  from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Context from "./context"

export default function Scroll(props){
    const context = useContext(Context);
    const classes = useStyles();
    const {pinActuate, currentStep} = context.state;
    const {setCurrentStep} = context;
    return (
        <div className={classes.container}>
            {pinActuate.map((item, index)=>{
                let append_string = "";
                item.content.forEach((e)=>{append_string += (e.toString()+", ")});
                append_string = append_string.slice(0,-2);
                return <Button 
                className={classes.button} 
                style={{backgroundColor: currentStep===index?'#78b6c2':'#595a5e'}}
                onClick={()=>{
                    setCurrentStep(index);
                }}
                key={index}
                >
                   {`Frame Number: ${index}      Actuated Pins: ${append_string}`}
                </Button>
            })}
            <Button className={classes.add} onClick={()=>{
                setCurrentStep(pinActuate.length);
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
        margin: "10px",
        textTransform: 'none'
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
