import React, { useContext, useState }  from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import DialogTitle from '@material-ui/core/DialogTitle';
import Context from "./context"

const initState = {
    mouseX : null,
    mouseY : null,
};

export default function Scroll(props){
    const context = useContext(Context);
    const classes = useStyles();
    const {pinActuate, currentStep} = context.state;
    const {setCurrentStep, addLoop} = context;
    const [mouseState, setMouseState] = useState(initState);
    const [open, setOpen] = useState(false);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [repTime, setRepTime] = useState("");

    const handleClick = (event) => {
        event.preventDefault();
        setMouseState({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
        });
    };

    const handleClose = ()=>{
        setMouseState(initState);
    }

    const handleLoop = () => {
        let from_int = parseInt(from);
        let to_int = parseInt(to);
        let repTime_int = parseInt(repTime);
        if(pinActuate.has(from_int) && pinActuate.get(from_int).type==="simple" &&
            pinActuate.has(to_int) && pinActuate.get(to_int).type==="simple" && from_int < to_int){
            addLoop(from_int, to_int, repTime_int);
            setFrom("");
            setTo("");
            setRepTime("");
            modelClose();
        }else{
            alert("invalid block number.")
        }
    }

    const modelOpen = () => {setOpen(true)}
    const modelClose = () => {setOpen(false); handleClose();}
    const changeFrom = (event) => {setFrom(event.target.value)}
    const changeTo = (event) => {setTo(event.target.value)}
    const changeRepTime = (event) => {setRepTime(event.target.value)}

    return (
        <div className={classes.container} onContextMenu={handleClick}>
            <div className={classes.subcontainer} style={{overflowX: 'visible'}}>
               {
                   Array.from(pinActuate.keys()).map(key => {
                       let value = pinActuate.get(key);
                       if(value.type==="loop"){
                            let append_string = "";
                            value.content.forEach((e)=>{append_string += (e.toString()+", ")});
                            append_string = append_string.slice(0,-2);
                            let startBlock = pinActuate.get(value.content[0]);
                            let padding = startBlock.order;
                            return <Button
                                className={classes.loop}
                                style={{
                                    position: 'absolute',
                                    top: 5,
                                    left: `calc(calc(15% + 10px) * ${padding} )`,
                                    width: `calc(calc(15% + 10px) * ${value.content.length} - 10px)`, 
                                    height: 25
                                }}
                                key={key}
                            >
                                {`Frame ${append_string} repeat ${value.repTime} times`}
                            </Button>
                       }else{
                           return null;
                       }
                   })
               }
            </div>
            <div className={classes.subcontainer}>
            {Array.from(pinActuate.keys()).map(key => {
                let value = pinActuate.get(key);
                let append_string = "";
                value.content.forEach((e)=>{append_string += (e.toString()+", ")});
                append_string = append_string.slice(0,-2);
                if(value.type === "simple"){
                    return <Button 
                className={classes.button} 
                style={{backgroundColor: currentStep===key?'#78b6c2':'#595a5e'}}
                onClick={()=>{
                    setCurrentStep(key);
                }}
                key={key}
                >
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <p>{`Frame Number: ${key}`}</p>     
                        <p>{`Actuated Pins: ${append_string}`}</p>
                    </div>
                </Button>
                }else{
                    return null;
                }
                
            })}
            <Button className={classes.add} onClick={()=>{
                setCurrentStep(pinActuate.size);
            }}>+</Button>
            <div style={{minWidth: "20px", height: "100px", backgroundColor:'transparent'}}></div>
            </div>
            <Menu
                keepMounted
                open={mouseState.mouseY !== null}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={
                  mouseState.mouseY !== null && mouseState.mouseX !== null
                    ? { top: mouseState.mouseY, left: mouseState.mouseX }
                    : undefined
                }
            >
                <MenuItem onClick={handleClose}>Copy</MenuItem>
                <MenuItem onClick={handleClose}>Paste</MenuItem>
                <MenuItem onClick={modelOpen}>Loop</MenuItem>
                <MenuItem onClick={handleClose}>Delete</MenuItem>
            </Menu>
            <Dialog
                open={open}
                onClose={modelClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">Set Repeat</DialogTitle>
                <DialogContent style={{display: 'flex', flexDirection: 'column', width: 400}}>
        
                         <TextField
                            autoFocus
                            variant="outlined"
                            label="From"
                            style={{marginBottom: 10}}
                            value={from}
                            onChange={changeFrom}
                            helperText={!isNaN(from)&&parseInt(Number(from))==from?"":"need to be a number"}
                            error={isNaN(from)||parseInt(Number(from))!=from}
                        />
                  
                         <TextField
                            variant="outlined"
                            label="To"
                            style={{marginBottom: 10}}
                            value={to}
                            onChange={changeTo}
                            helperText={!isNaN(to)&&parseInt(Number(to))==to?"":"need to be a number"}
                            error={isNaN(to)||parseInt(Number(to))!=to}
                        />
                    
                         <TextField
                            variant="outlined"
                            label="Repeat Time"
                            style={{marginBottom: 10}}
                            value={repTime}
                            onChange={changeRepTime}
                            helperText={!isNaN(repTime)&&parseInt(Number(repTime))==repTime?"":"need to be a number"}
                            error={isNaN(repTime)||parseInt(Number(repTime))!=repTime}
                        />
                    
                </DialogContent>
                <DialogActions>
                <Button onClick={modelClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleLoop} color="primary">
                    Confirm
                </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

const useStyles = makeStyles({
    container: {
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        bottom: -20,
        flexShrink: 0,
        overflowX: "scroll",
        width: "100vw",
        height: "35vh",
        backgroundColor: "#868891",
        scrollPaddingRight: "10px"
    },
    subcontainer: {
        display: "flex",
        flexDirection: "row",
        flexShrink: 0,
        // overflowX: "scroll",
        alignItems: 'center',
        // scrollPaddingRight: "10px"
    },
    button:{
        width: "15%",
        minWidth: "15%",
        height: "27vh",
        borderRadius: 5,
        color: 'white',
        margin: "5px",
        marginTop: 30,
        textTransform: 'none',
    },
    add: {
        width: "6%",
        minWidth: "6%",
        height: "27vh",
        borderRadius: 5,
        color: 'white',
        backgroundColor: '#2a78de',
        marginTop: 30,
        margin:"10px"
    },
    modal: {
        width: 400,
        height: 200,
        backgroundColor: '#778899',
    },
    loop:{
        height: '4vh', 
        backgroundColor: '#394aa8', 
        color: 'white',
        borderRadius: 3,
        marginLeft: 10,
        textTransform: 'none'
    }
});
