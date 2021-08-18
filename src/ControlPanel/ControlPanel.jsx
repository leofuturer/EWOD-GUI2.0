import React, { useContext, useState } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import {
  ViewWeek, OpenWith,
} from '@material-ui/icons';
import Tooltip from '@material-ui/core/Tooltip';
import Divider from '@material-ui/core/Divider';
import icons from '../Icons/icons';

import { ActuationContext } from '../Contexts/ActuationProvider';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { GeneralContext } from '../Contexts/GeneralProvider';

// import SaveButton from './SaveButton';
import UploadButton from './UploadButton';
import DownloadButton from './DownloadButton';

import USBPanel from './USBPanel';
import DeleteButton from './DeleteButton';
import { SCROLL_HEIGHT } from '../constants';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    height: '8vh',
  },
  appBar: {
    zIndex: theme.zIndex.drawer - 1,
    marginLeft: '3vh',
    backgroundColor: '#FAEDCD',
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 20,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: theme.zIndex.drawer + 1,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    height: `${100 - SCROLL_HEIGHT}vh`,
    backgroundColor: '#FAEDCD',
    border: '1px solid #A06933',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    backgroundColor: '#FAEDCD',
    border: '1px solid #A06933',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(5) + 1,
    height: `${100 - SCROLL_HEIGHT}vh`,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(6) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',

    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  listItemText: {
    fontFamily: 'Roboto',
    fontWeight: 500,
    color: '#A06933',
  },
  toolbarContainer: {
    backgroundColor: '#FAEDCD',
    boxShadow: '2px 2px 4px 3px rgba(0, 0, 0, 0.2)',
    justifyContent: 'space-between',
    border: '1px solid #A06933',
  },
  toolbarContainerShift: {
    marginLeft: 40,
    transition: theme.transitions.create(['margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const MuiListItem = withStyles({
  root: {
    '&:hover': {
      backgroundImage: 'linear-gradient(to right, #FAEDCD 0%, rgba(212, 163, 115, 0.25) 100%)',
      border: '1px solid #D4A373',
    },
  },
})(ListItem);

export default function ControlPanel() {
  const canvasContext = useContext(CanvasContext);
  const actuationContext = useContext(ActuationContext);
  const {
    mode, setMode, setCurrElec, panning, setPanning, setScaleXY,
  } = useContext(GeneralContext);
  const { setSelected, setCombSelected } = canvasContext;
  const { undo, redo } = actuationContext;

  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [usbPanelOpen, setUsbPanelOpen] = useState(false);
  const [usbConnected, setUsbConnected] = useState(false);

  function setNewMode(newMode) {
    if (mode === 'PIN' && newMode !== 'PIN') {
      setScaleXY({ scale: 1, svgX: 0, svgY: 0 });
    }
    setMode(newMode);
    setSelected([]);
    setCombSelected([]);
    setCurrElec(null);
  }

  return (
    // <UploadButton />
    // <SaveButton />
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        color="inherit"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar
          className={clsx(classes.toolbarContainer, {
            [classes.toolbarContainerShift]: !open,
          })}
        >
          <List style={{ display: 'flex', flexDirection: 'row' }}>
            <Tooltip title="Draw">
              <ListItem button onClick={() => setNewMode('DRAW')} data-testid="draw-button">
                <img src={mode === 'DRAW' ? icons.electrodepen.onClick : icons.electrodepen.icon} alt="Electrode Pen" />
              </ListItem>
            </Tooltip>

            <UploadButton />
            <ListItem button>
              <ViewWeek />
            </ListItem>
            <DownloadButton />

            <Tooltip title="Map Pins" data-testid="PIN">
              <ListItem
                button
                onClick={() => {
                  setScaleXY({ scale: 0.51, svgX: 0, svgY: 0 });
                  setNewMode('PIN');
                }}
              >
                <img src={mode === 'PIN' ? icons.electrodenumbering.onClick : icons.electrodenumbering.icon} alt="Electrode Numbering" />
              </ListItem>
            </Tooltip>

            <DownloadButton />

            <Tooltip title="Sequence Actuation">
              <ListItem button onClick={() => setNewMode('SEQ')} data-testid="act-seq-start">
                <img src={mode === 'SEQ' ? icons.actuation.onClick : icons.actuation.icon} alt="Actuation Sequence" />
              </ListItem>
            </Tooltip>

            <Tooltip title="Select and Move Electrodes" data-testid="CAN">
              <ListItem button onClick={() => setNewMode('CAN')}>
                <img src={mode === 'CAN' ? icons.selectiontool.onClick : icons.selectiontool.icon} alt="Selection Tool" />
              </ListItem>
            </Tooltip>
            <Tooltip title="Pan Canvas" data-testid="PAN">
              <ListItem button onClick={() => setPanning(!panning)}>
                <OpenWith style={{ color: panning ? '#23A829' : 'black' }} />
              </ListItem>
            </Tooltip>

            <ListItem button onClick={undo}>
              <img src={icons.undo.icon} alt="Undo" />
            </ListItem>
            <ListItem button onClick={redo}>
              <img src={icons.redo.icon} alt="Redo" />
            </ListItem>
          </List>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={() => {
            setUsbPanelOpen(false);
            setOpen(!open);
          }}
          >
            <img src={icons.menu.icon} alt="Sidebar menu" />
          </IconButton>
        </div>
        <List>
          <MuiListItem button onClick={() => { if (open) setUsbPanelOpen(!usbPanelOpen); }}>
            <ListItemIcon>
              <img src={usbConnected ? icons.usb.connected : icons.usb.disconnected} alt="USB Connection" />
            </ListItemIcon>
            <ListItemText classes={{ primary: classes.listItemText }} primary="USB Connection" />
          </MuiListItem>

          <Collapse in={usbPanelOpen} timeout="auto">
            <USBPanel setUsbConnected={setUsbConnected} />
          </Collapse>

          <MuiListItem button>
            <ListItemIcon>
              <img src={icons.refimage.icon} alt="Ref" />
            </ListItemIcon>
            <ListItemText classes={{ primary: classes.listItemText }} primary="Reference Image" />
          </MuiListItem>
        </List>
        <Divider />
        <List>
          <DeleteButton />
          <ListItem button>
            <img src={icons.info.icon} alt="Info" />
          </ListItem>
        </List>
      </Drawer>
    </div>
  );
}
