import React, { useContext, useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import DialogTitle from '@material-ui/core/DialogTitle';
import {
  PlayArrow, SkipNext, SkipPrevious, Pause, Replay, AddCircleOutline, DeleteForever, Stop,
  DynamicFeed,
} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import { DialogContentText } from '@material-ui/core';
import ActuationSequence from './Actuation';
import { ActuationContext } from './Contexts/ActuationProvider';
import { GeneralContext } from './Contexts/GeneralProvider';

import { SCROLL_HEIGHT } from './constants';

const initState = {
  mouseX: null,
  mouseY: null,
};

const useStyles = makeStyles({
  container: {
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    bottom: -20,
    flexShrink: 0,
    overflowX: 'scroll',
    width: '100vw',
    height: `${SCROLL_HEIGHT}vh`,
    backgroundColor: '#fce6bd',
    scrollPaddingRight: '10px',
  },
  subcontainer: {
    display: 'flex',
    flexDirection: 'row',
    flexShrink: 0,
    // overflowX: "scroll",
    alignItems: 'center',
    // scrollPaddingRight: "10px"
  },
  button: {
    width: '15%',
    minWidth: '15%',
    height: '27vh',
    borderRadius: 5,
    borderWidth: 3,
    borderColor: '#A06933',
    color: '#A06933',
    margin: '5px',
    marginTop: 30,
    textTransform: 'none',
    boxShadow: '2px 2px 3px 1px #bfbbb4',
  },
  add: {
    width: '6%',
    minWidth: '6%',
    height: '27vh',
    borderRadius: 5,
    borderWidth: 3,
    borderColor: '#A06933',
    color: '#A06933',
    backgroundColor: '#FEFAE0',
    marginTop: 30,
    margin: '10px',
    boxShadow: '2px 2px 3px 1px #bfbbb4',
  },
  modal: {
    width: 400,
    height: 200,
    backgroundColor: '#778899',
  },
  loop: {
    height: '4vh',
    backgroundColor: '#b86944',
    color: 'white',
    borderRadius: 3,
    marginLeft: 10,
    textTransform: 'none',
    boxShadow: '2px 2px 3px 1px #bfbbb4',
  },
  playTab: {
    position: 'fixed',
    bottom: '33vh',
    height: '30px',
    width: '100vw',
    backgroundColor: '#FEFAE0',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTop: '3px solid #A06933',
    borderBottom: '3px solid #A06933',
  },
  input: {
    color: '#A06933',
  },
});

export default function Scroll() {
  const context = useContext(ActuationContext);
  const classes = useStyles();
  const { actuation } = context;
  const { pinActuate, currentStep } = actuation;
  const {
    setCurrentStep, addLoop, updateLoop, deleteCurrentStep,
    deleteLoop, insertStep, clearAll, updateDuration, updateAllDuration,
  } = context;
  const [mouseState, setMouseState] = useState(initState);
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [repTime, setRepTime] = useState('');
  const [update, setUpdate] = useState(null);
  const [index, setIndex] = useState(0);
  const [pause, setPause] = useState(true);
  const [fullseq, setFullseq] = useState([0]);
  const [time, setTime] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [alert, setAlert] = useState(false);
  const [forever, setForever] = useState(false);
  const [flush, setFlush] = useState(false);
  const [duration, setDuration] = useState(100);

  const indexRef = useRef();
  indexRef.current = index;
  const scrollRef = useRef();

  const { bannerRef } = useContext(GeneralContext);

  const handleClick = (event) => {
    event.preventDefault();
    setMouseState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleWheel = (event) => {
    // event.preventDefault();
    const container = scrollRef.current;
    const containerScrollPosition = scrollRef.current.scrollLeft;

    container.scrollTo({
      top: 0,
      left: containerScrollPosition + event.deltaY,
    });
  };

  const handleClose = () => {
    setMouseState(initState);
  };

  function generateSeq() {
    const visited = new Set();
    const list = [];
    pinActuate.forEach((value) => {
      if (value.type === 'simple' && !visited.has(value.id)) {
        visited.add(value.id);
        if (value.parent !== null) {
          const parent = pinActuate.get(value.parent);
          for (let i = 0; i < parent.repTime; i += 1) {
            parent.content.forEach((e) => {
              list.push(e);
              visited.add(e);
            });
          }
        } else {
          list.push(value.id);
        }
      }
    });
    setFullseq(list);
  }

  const modelOpen = () => { setOpen(true); };
  const modelClose = () => { setOpen(false); handleClose(); };
  const changeFrom = (event) => { setFrom(event.target.value); };
  const changeTo = (event) => { setTo(event.target.value); };
  const changeRepTime = (event) => { setRepTime(event.target.value); };

  const handleLoop = (id) => {
    const fromInt = parseInt(from, 10);
    const toInt = parseInt(to, 10);
    const repTimeInt = parseInt(repTime, 10);
    if (fromInt < toInt) {
      if (id !== null) {
        const success = updateLoop(fromInt, toInt, repTimeInt, id);
        if (!success) {
          bannerRef.current.getAlert('error', 'Update Loop Fail! Please check the range of frame.');
        } else {
          bannerRef.current.getAlert('success', 'Successfully update a loop.');
        }
        setUpdate(null);
      } else {
        const success = addLoop(fromInt, toInt, repTimeInt);
        if (!success) {
          bannerRef.current.getAlert('error', 'Add Loop Fail! Please check the range of frame.');
        } else {
          bannerRef.current.getAlert('success', 'Successfully add a loop.');
        }
      }

      setFrom('');
      setTo('');
      setRepTime('');
      generateSeq();
      modelClose();
    } else {
      bannerRef.current.getAlert('error', 'Invalid block number!');
    }
  };

  function proceed() {
    if (fullseq.length === 0) return;
    console.log(indexRef.current);
    if (indexRef.current === fullseq.length) {
      setPause(true);
      setIndex(0);
      setCurrentStep(fullseq[0]);
      clearTimeout(time);
    } else {
      setCurrentStep(fullseq[indexRef.current]);
      let dur = 100;
      if (pinActuate.get(fullseq[indexRef.current]) !== undefined) {
        dur = pinActuate.get(fullseq[indexRef.current]).duration;
      }
      setTime(setTimeout(proceed.bind(this), dur));
      if (forever) {
        setIndex((ind) => (ind + 1) % fullseq.length);
      } else {
        setIndex((ind) => ind + 1);
      }
    }
  }

  function handlePlay() {
    generateSeq();
    setIndex(index);
    setCurrentStep(fullseq[index]);
    console.log(fullseq);
    if (pause) {
      setPause(false);
      proceed();
    }
  }

  function handlePause() {
    if (time !== null || time !== undefined) {
      clearTimeout(time);
    }
    setIndex((ind) => ind - 1);
    setPause(true);
  }

  const handleDelete = () => {
    const success = deleteCurrentStep(currentStep);
    if (!success) {
      bannerRef.current.getAlert('error', 'Cannot delete the last block in a loop or the whole sequence!');
    } else {
      bannerRef.current.getAlert('warning', 'Delete one step!');
    }
    generateSeq();
    modelClose();
  };

  const handleInsert = () => {
    let ind = pinActuate.size;
    while (pinActuate.has(ind)) ind += 1;
    insertStep(new ActuationSequence(ind, 'simple', pinActuate.get(currentStep).order + 1));
    generateSeq();
    handleClose();
  };

  const handleCopy = () => {
    const cont = [];
    pinActuate.get(currentStep).content.forEach((e) => cont.push(e));
    setClipboard({ content: cont, duration: pinActuate.get(currentStep).duration });
    handleClose();
  };

  const handlePaste = () => {
    if (clipboard !== null) {
      let ind = pinActuate.size;
      while (pinActuate.has(ind)) ind += 1;
      const newSeq = new ActuationSequence(ind, 'simple', 0);
      clipboard.content.forEach((e) => {
        newSeq.content.add(e);
      });
      newSeq.duration = clipboard.duration;
      insertStep(newSeq);
      generateSeq();
    }
    handleClose();
  };

  return (
    <div>
      <div className={classes.playTab}>
        <p style={{
          position: 'absolute', left: '48vw', top: -10, fontSize: 14, color: '#A06933',
        }}
        >
          {`Step ${pinActuate.get(currentStep).order}`}
        </p>
        <IconButton onClick={() => { setFlush(true); }}>
          <DynamicFeed fontSize="small" style={{ color: '#A06933' }} />
        </IconButton>
        <IconButton onClick={() => { setAlert(true); }} data-testid="delete-start">
          <DeleteForever fontSize="small" style={{ color: '#A06933' }} />
        </IconButton>
        <IconButton onClick={handlePause}>
          <Pause fontSize="small" style={{ color: '#A06933' }} />
        </IconButton>
        <IconButton onClick={() => {
          if (index !== 0) {
            setCurrentStep(fullseq[index - 1]);
            setIndex(index - 1);
          }
        }}
        >
          <SkipPrevious fontSize="small" style={{ color: '#A06933' }} />
        </IconButton>
        <IconButton onClick={() => {
          handlePlay();
        }}
        >
          <PlayArrow fontSize="small" style={{ color: '#A06933' }} />
        </IconButton>
        <IconButton onClick={() => {
          if (index !== fullseq.length - 1) {
            setCurrentStep(fullseq[index + 1]);
            setIndex(index + 1);
          }
        }}
        >
          <SkipNext fontSize="small" style={{ color: '#A06933' }} />
        </IconButton>
        <IconButton onClick={() => {
          handlePause();
          setCurrentStep(fullseq[0]);
          setIndex(0);
          setForever(false);
        }}
        >
          <Stop fontSize="small" style={{ color: '#A06933' }} />
        </IconButton>
        <IconButton
          onClick={() => {
            setForever((tempforever) => !tempforever);
          }}
          style={{ backgroundColor: forever ? '#85daed' : 'transparent' }}
        >
          <Replay fontSize="small" style={{ color: forever ? 'black' : '#A06933' }} />
        </IconButton>
      </div>
      <div className={classes.container} ref={scrollRef} onWheel={handleWheel}>
        <div className={classes.subcontainer} style={{ overflowX: 'visible' }}>
          {
            Array.from(pinActuate.keys()).map((key) => {
              const value = pinActuate.get(key);
              if (value.type === 'loop') {
                let appendString = '';
                value.content.forEach((e) => { appendString += (`${pinActuate.get(e).order.toString()}, `); });
                appendString = appendString.slice(0, -2);
                const startBlock = pinActuate.get(value.content[0]);
                const padding = startBlock.order;
                return (
                  <Button
                    className={classes.loop}
                    style={{
                      position: 'absolute',
                      top: 5,
                      left: `calc(calc(15% + 10px) * ${padding} )`,
                      width: `calc(calc(15% + 10px) * ${value.content.length} - 10px)`,
                      height: 25,
                    }}
                    onClick={() => {
                      const loop = pinActuate.get(key);
                      setFrom(pinActuate.get(loop.content[0]).order.toString());
                      setTo(pinActuate.get(loop.content[loop.content.length - 1]).order.toString());
                      setRepTime(loop.repTime.toString());
                      setUpdate(key);
                      modelOpen();
                    }}
                    key={key}
                  >
                    {`Frame ${appendString} repeat ${value.repTime} times`}
                  </Button>
                );
              }
              return null;
            })
          }
        </div>
        <div className={classes.subcontainer}>
          {Array.from(pinActuate.keys()).map((key) => {
            const value = pinActuate.get(key);
            let appendString = '';
            value.content.forEach((e) => { appendString += (`${e.toString()}, `); });
            appendString = appendString.slice(0, -2);
            if (value.type === 'simple') {
              return (
                <Button
                  className={classes.button}
                  variant="outlined"
                  style={{ backgroundColor: currentStep === key ? '#D4A373' : '#FEFAE0' }}
                  onClick={() => {
                    setCurrentStep(key);
                  }}
                  onContextMenu={(event) => {
                    setCurrentStep(key);
                    handleClick(event);
                  }}
                  key={key}
                  data-testid="seq-button"
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <p>{`Frame Number: ${value.order}`}</p>
                    <p>{`Actuated Pins: ${appendString}`}</p>
                    <TextField
                      variant="outlined"
                      label="duration"
                      inputProps={{
                        className: classes.input,
                      }}
                      InputLabelProps={{
                        className: classes.input,
                      }}
                      value={pinActuate.get(key).duration}
                      onChange={(event) => {
                        updateDuration(key, event.target.value);
                      }}
                    />
                  </div>
                </Button>
              );
            }
            return null;
          })}
          <Button
            className={classes.add}
            onClick={() => {
              let ind = pinActuate.size;
              while (pinActuate.has(ind)) ind += 1;
              setCurrentStep(ind);
              generateSeq();
            }}
            data-testid="add-button"
            variant="outlined"
          >
            <AddCircleOutline />
          </Button>
          <div style={{ minWidth: '20px', height: '100px', backgroundColor: 'transparent' }} />
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
              helperText={!Number.isNaN(from) && parseInt(Number(from), 10) === Number(from) ? '' : 'need to be a number'}
              error={Number.isNaN(from) || parseInt(Number(from), 10) !== Number(from)}
            />

            <TextField
              variant="outlined"
              label="To"
              style={{ marginBottom: 10 }}
              value={to}
              onChange={changeTo}
              helperText={!Number.isNaN(to) && parseInt(Number(to), 10) === Number(to) ? '' : 'need to be a number'}
              error={Number.isNaN(to) || parseInt(Number(to), 10) !== Number(to)}
            />

            <TextField
              variant="outlined"
              label="Repeat Time"
              style={{ marginBottom: 10 }}
              value={repTime}
              onChange={changeRepTime}
              helperText={!Number.isNaN(repTime) && parseInt(Number(repTime), 10) === Number(repTime) ? '' : 'need to be a number'}
              error={Number.isNaN(repTime) || parseInt(Number(repTime), 10) !== Number(repTime)}
            />

          </DialogContent>
          <DialogActions>
            <Button onClick={modelClose} color="primary">
              Cancel
            </Button>
            {update !== null
              ? (
                <Button onClick={() => { deleteLoop(update); setUpdate(null); modelClose(); }} color="primary">
                  Delete
                </Button>
              ) : null}
            <Button
              onClick={() => {
                handleLoop(update);
              }}
              color="primary"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={alert}
          onClose={() => { setAlert(false); }}
          aria-labelledby="alert-dialog-title"
        >
          <DialogTitle id="alert-dialog-title">Delete Every Actuation Sequence?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              After clicking confirm, all work you made will be deleted permanently.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setAlert(false); }} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => {
                handlePause();
                setCurrentStep(fullseq[0]);
                setIndex(0);
                clearAll();
                setAlert(false);
              }}
              color="primary"
              autoFocus
              data-testid="delete-button"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={flush}
          onClose={() => { setFlush(false); }}
          aria-labelledby="alert-dialog-title"
        >
          <DialogTitle id="alert-dialog-title">How long for each actuation sequence?</DialogTitle>
          <DialogContent>
            <TextField
              variant="outlined"
              value={duration}
              onChange={(event) => { setDuration(event.target.value); }}
              style={{ marginBottom: 10 }}
              helperText={!Number.isNaN(duration) && parseInt(Number(duration), 10) === Number(duration) ? '' : 'need to be a number'}
              error={Number.isNaN(duration) || parseInt(Number(duration), 10) !== Number(duration)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setFlush(false); }} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!Number.isNaN(duration)) {
                  updateAllDuration(parseInt(Number(duration), 10));
                }
                setFlush(false);
              }}
              color="primary"
              autoFocus
              data-testid="delete-button"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
