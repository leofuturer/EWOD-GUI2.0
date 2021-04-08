import React, { useContext, useState, useRef}  from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import DialogTitle from '@material-ui/core/DialogTitle';
import {PlayArrow, SkipNext, SkipPrevious, Pause, Replay, AddCircleOutline, DeleteForever, Stop} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import ActuationSequence from './Actuation'
import { DialogContentText } from '@material-ui/core';
import { ActuationContext } from "./Contexts/ActuationProvider"

const initState = {
    mouseX: null,
    mouseY: null,
};

export default function Scroll(props) {
    const context = useContext(ActuationContext);
    const classes = useStyles();
    const {pinActuate, currentStep} = context.actuation;
    const {setCurrentStep, addLoop, updateLoop, deleteCurrentStep, 
        deleteLoop, insertStep, clearAll, updateDuration} = context;
    const [mouseState, setMouseState] = useState(initState);
    const [open, setOpen] = useState(false);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [repTime, setRepTime] = useState("");
    const [update, setUpdate] = useState(null);
    const [index, setIndex] = useState(0);
    const [pause, setPause] = useState(true);
    const [fullseq, setFullseq] = useState([0]);
    const [time, setTime] = useState(null);
    const [clipboard, setClipboard] = useState(null);
    const [alert, setAlert] = useState(false);
    const [forever, setForever] = useState(false);

    const handleClick = (event) => {
        event.preventDefault();
        setMouseState({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
        });
    };

    const handleWheel = (event) => {
        //event.preventDefault();
        const container = scrollRef.current;
        const containerScrollPosition = scrollRef.current.scrollLeft;

        container.scrollTo({
            top: 0,
            left: containerScrollPosition + event.deltaY
        })
    }

    const handleClose = ()=>{
        setMouseState(initState);
    }

    const handleLoop = (id) => {
        let from_int = parseInt(from);
        let to_int = parseInt(to);
        let repTime_int = parseInt(repTime);
        if(from_int < to_int){
                if(id!==null){
                    updateLoop(from_int, to_int, repTime_int, id);
                    console.log("update!");
                    setUpdate(null);
                }else{
                    addLoop(from_int, to_int, repTime_int);
                }
            
                setFrom("");
                setTo("");
                setRepTime("");
                generateSeq();
                modelClose();
        }else{
            alert("invalid block number.")
        }
    }

    function generateSeq(){ 
        let visited = new Set();
        let list = [];
            for(let value of pinActuate.values()){
                if(value.type === 'simple' && !visited.has(value.id)){
                    visited.add(value.id);
                    if(value.parent!== null){
                        let parent = pinActuate.get(value.parent);
                        for(let i = 0; i < parent.repTime; i++){
                            for(let e of parent.content){
                                list.push(e);
                                visited.add(e);
                            }
                        }
                    }else{
                        list.push(value.id);
                    }
                }
            }
        setFullseq(list);
    }

    let indexRef = useRef();
    indexRef.current = index;
    const scrollRef = useRef();


    function handlePlay(){
        generateSeq();
        setIndex(index);
        setCurrentStep(fullseq[index]);
        console.log(fullseq);
        if(pause){
            setPause(false);
            proceed();
        }
    }
    
    function proceed(){
        if(fullseq.length === 0) return;
        console.log(indexRef.current);
        if(indexRef.current === fullseq.length){
            setPause(true);
            setIndex(0);
            setCurrentStep(fullseq[0]);
            clearTimeout(time);
            return;
        }else{
            setCurrentStep(fullseq[indexRef.current]);
            let dur = 100;
            if(pinActuate.get(fullseq[indexRef.current]) !== undefined){
                dur = pinActuate.get(fullseq[indexRef.current]).duration;
            }
            setTime(setTimeout(proceed.bind(this), dur));
            if(forever){
                setIndex((index)=> (index+1)%fullseq.length);
            }else{
                setIndex((index) => index+1);
            }
        }
    }

    function handlePause(){
        if(time !== null || time !== undefined){
            clearTimeout(time);
        }
        setIndex((index)=>index-1);
        setPause(true);
    }

    const handleDelete = () => {
        deleteCurrentStep(currentStep);
        generateSeq();
        modelClose();
    }

    const handleInsert = () => {
        let ind = pinActuate.size;
        while(pinActuate.has(ind)) ind++;
        insertStep(new ActuationSequence(ind, 'simple', pinActuate.get(currentStep).order+1));
        generateSeq();
        handleClose();
    }

    const handleCopy = () => {
        let newSeq = new ActuationSequence(pinActuate.size, 'simple', 0);
        pinActuate.get(currentStep).content.forEach(e => {
            newSeq.content.add(e);
        });
        setClipboard(newSeq);
        handleClose();
    }

    const handlePaste = () => {
        if(clipboard !== null){
            let ind = pinActuate.size;
            while(pinActuate.has(ind)) ind++;
            clipboard.id = ind;
            insertStep(clipboard);
            generateSeq();
        }
        handleClose();
    }

    
    const modelOpen = () => {setOpen(true)}
    const modelClose = () => {setOpen(false); handleClose();}
    const changeFrom = (event) => {setFrom(event.target.value)}
    const changeTo = (event) => {setTo(event.target.value)}
    const changeRepTime = (event) => {setRepTime(event.target.value)}

    return (
        <div>
            <div className={classes.playTab}>
                <p style={{position: 'absolute', left: '48vw', top: -10, fontSize: 14, color: 'white'}}>{`Step ${pinActuate.get(currentStep).order}`}</p>
                <IconButton onClick={()=>{setAlert(true)}} data-testid="delete-start">
                    <DeleteForever fontSize='small' style={{color: '#A06933'}}/>
                </IconButton>
                <IconButton onClick={handlePause}>
                    <Pause fontSize='small' style={{color: '#A06933'}}/>
                </IconButton>
                <IconButton onClick={()=>{
                    if(index!==0) {
                        setCurrentStep(fullseq[index-1]);
                        setIndex(index-1);
                    }
                }}>
                    <SkipPrevious fontSize='small' style={{color: '#A06933'}}/>
                </IconButton>
                <IconButton onClick={()=>{
                    handlePlay();
                }}>
                    <PlayArrow fontSize='small' style={{color: '#A06933'}}/>
                </IconButton>
                <IconButton onClick={()=>{
                    if(index!==fullseq.length-1) {
                        setCurrentStep(fullseq[index+1]);
                        setIndex(index+1);
                    }
                }}>
                    <SkipNext fontSize='small' style={{color: '#A06933'}}/>
                </IconButton>
                <IconButton onClick={()=>{
                    handlePause();
                    setCurrentStep(fullseq[0]);
                    setIndex(0);
                    setForever(false);
                }}>
                    <Stop fontSize='small' style={{color: '#A06933'}}/>
                </IconButton>
                <IconButton onClick={()=>{
                    setForever((forever)=> !forever);
                }}
                style={{backgroundColor: forever?'#85daed':'transparent'}}
                >
                    <Replay fontSize='small' style={{color: forever?'black':'#A06933'}}/>
                </IconButton>
            </div>
        <div className={classes.container} ref={scrollRef} onWheel={handleWheel}>
            <div className={classes.subcontainer} style={{overflowX: 'visible'}}>
               {
                   Array.from(pinActuate.keys()).map(key => {
                       let value = pinActuate.get(key);
                       if(value.type==="loop"){
                            let append_string = "";
                            value.content.forEach((e) => { append_string += (e.toString() + ", ") });
                            append_string = append_string.slice(0, -2);
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
                                onClick={() => {
                                    let loop = pinActuate.get(key);
                                    setFrom(loop.content[0].toString());
                                    setTo(loop.content[loop.content.length - 1].toString());
                                    setRepTime(loop.repTime.toString());
                                    setUpdate(key);
                                    modelOpen();
                                }}
                                key={key}
                            >
                                {`Frame ${append_string} repeat ${value.repTime} times`}
                            </Button>
                        } else {
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
                variant="outlined"
                style={{backgroundColor: currentStep===key?'#D4A373':'#FEFAE0'}}
                onClick={()=>{
                    setCurrentStep(key);
                }}
                onContextMenu={(event)=>{
                    setCurrentStep(key);
                    handleClick(event);
                }}
                key={key}
                data-testid="seq-button"
                >
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <p>{`Frame Number: ${value.order}`}</p>     
                        <p>{`Actuated Pins: ${append_string}`}</p>
                        <TextField
                            variant="outlined"
                            label="duration"
                            inputProps={{
                                className: classes.input
                            }}
                            InputLabelProps={{
                                className: classes.input
                            }}
                            value={pinActuate.get(key).duration}
                            onChange={(event)=>{
                                updateDuration(key, event.target.value);
                            }}
                        />
                    </div>
                </Button>
                }else{
                    return null;
                }
                
            })}
            <Button className={classes.add} onClick={()=>{
                let ind = pinActuate.size;
                while(pinActuate.has(ind)) ind++;
                setCurrentStep(ind);
                generateSeq();
            }} data-testid="add-button" variant="outlined">
                <AddCircleOutline/>
            </Button>
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
                <MenuItem onClick={handleInsert}>Insert</MenuItem>
                <MenuItem onClick={handleCopy}>Copy</MenuItem>
                <MenuItem onClick={handlePaste}>Paste</MenuItem>
                <MenuItem onClick={modelOpen}>Loop</MenuItem>
                <MenuItem onClick={handleDelete}>Delete</MenuItem>
            </Menu>
            <Dialog
                open={open}
                onClose={modelClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">Set Repeat</DialogTitle>
                <DialogContent style={{ display: 'flex', flexDirection: 'column', width: 400 }}>

                    <TextField
                        autoFocus
                        variant="outlined"
                        label="From"
                        style={{ marginBottom: 10 }}
                        value={from}
                        onChange={changeFrom}
                        helperText={!isNaN(from) && parseInt(Number(from)) === Number(from) ? "" : "need to be a number"}
                        error={isNaN(from) || parseInt(Number(from)) !== Number(from)}
                    />

                    <TextField
                        variant="outlined"
                        label="To"
                        style={{ marginBottom: 10 }}
                        value={to}
                        onChange={changeTo}
                        helperText={!isNaN(to) && parseInt(Number(to)) === Number(to) ? "" : "need to be a number"}
                        error={isNaN(to) || parseInt(Number(to)) !== Number(to)}
                    />

                    <TextField
                        variant="outlined"
                        label="Repeat Time"
                        style={{ marginBottom: 10 }}
                        value={repTime}
                        onChange={changeRepTime}
                        helperText={!isNaN(repTime) && parseInt(Number(repTime)) === Number(repTime) ? "" : "need to be a number"}
                        error={isNaN(repTime) || parseInt(Number(repTime)) !== Number(repTime)}
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={modelClose} color="primary">
                        Cancel
                </Button>
                {update !== null ? 
                <Button onClick={()=>{deleteLoop(update); setUpdate(null); modelClose();}} color="primary">
                    Delete
                </Button>:null
                }
                <Button onClick={()=>{
                    handleLoop(update);
                }} color="primary">
                    Confirm
                </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={alert}
                onClose={()=>{setAlert(false)}}
                aria-labelledby="alert-dialog-title"
            >
                <DialogTitle id="alert-dialog-title">{"Delete Every Actuation Sequence?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        After clicking confirm, all work you made will be deleted permanently.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={()=>{setAlert(false)}} color="primary">
                    Cancel
                </Button>
                <Button onClick={()=>{clearAll();setAlert(false);}} color="primary" autoFocus data-testid="delete-button">
                    Confirm
                </Button>
                </DialogActions>
            </Dialog>
        </div>
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
        height: "35.8vh",
        backgroundColor: "#fce6bd",
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
    button: {
        width: "15%",
        minWidth: "15%",
        height: "27vh",
        borderRadius: 5,
        borderWidth: 3,
        borderColor: '#A06933',
        color: '#A06933',
        margin: "5px",
        marginTop: 30,
        textTransform: 'none',
        boxShadow: '2px 2px 3px 1px #bfbbb4'
    },
    add: {
        width: "6%",
        minWidth: "6%",
        height: "27vh",
        borderRadius: 5,
        borderWidth: 3,
        borderColor: '#A06933',
        color: '#A06933',
        backgroundColor: '#FEFAE0',
        marginTop: 30,
        margin:"10px",
        boxShadow: '2px 2px 3px 1px #bfbbb4'
    },
    modal: {
        width: 400,
        height: 200,
        backgroundColor: '#778899',
    },
    loop:{
        height: '4vh', 
        backgroundColor: '#b86944', 
        color: 'white',
        borderRadius: 3,
        marginLeft: 10,
        textTransform: 'none',
        boxShadow: '2px 2px 3px 1px #bfbbb4'
    },
    playTab:{
        position: 'fixed', 
        bottom: '33vh', 
        height: '30px', 
        width: '100vw', 
        backgroundColor:'#FEFAE0', 
        zIndex: 2,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderTop: '3px solid #A06933',
        borderBottom: '3px solid #A06933'
    },
    input: {
        color: '#A06933'
    }
});
