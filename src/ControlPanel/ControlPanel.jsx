import React, { useContext, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {
  Undo, Redo, Highlight, FileCopy, Create, Info, ViewWeek, Usb, Image, Menu,
  FormatListNumberedOutlined, DeleteForeverOutlined, GridOn,
} from '@material-ui/icons';
import Tooltip from '@material-ui/core/Tooltip';

import { ActuationContext } from '../Contexts/ActuationProvider';
import { CanvasContext } from '../Contexts/CanvasProvider';

import SaveButton from './SaveButton';
import UploadButton from './UploadButton';
import { DownloadButton } from './DownloadButton';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    height: '8vh',
  },
  appBar: {
    zIndex: theme.zIndex.drawer - 1,
    marginLeft: '3wh',
    height: '7vh',
    backgroundColor: '#f7cd83',
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
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    height: '63vh',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(5) + 1,
    height: '63vh',
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
}));

export function ControlPanel({ setMode }) {
  const canvasContext = useContext(CanvasContext);
  const actuationContext = useContext(ActuationContext);
  const { drawing } = canvasContext.state;
  const { setDrawing, setSelected, setCombSelected } = canvasContext;
  const { undo, redo } = actuationContext;

  const classes = useStyles();
  const [open, setOpen] = useState(false);

  function toggleDraw(e) {
    setSelected([]);
    setCombSelected([]);
    setDrawing(!drawing);
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
        <Toolbar style={{ marginLeft: 40 }}>
          <List style={{ display: 'flex', flexDirection: 'row' }}>
            <Tooltip title="Draw">
              <ListItem button onClick={toggleDraw}>
                <Create />
              </ListItem>
            </Tooltip>

            <ListItem button>
              <FileCopy />
            </ListItem>
            <ListItem button>
              <ViewWeek />
            </ListItem>
            <DownloadButton />

            <Tooltip title="Map Pins">
              <ListItem button onClick={() => setMode('PIN')}>
                <FormatListNumberedOutlined />
              </ListItem>
            </Tooltip>
            <Tooltip title="Sequence Actuation">
              <ListItem button onClick={() => setMode('SEQ')}>
                <Highlight />
              </ListItem>
            </Tooltip>
            <Tooltip title="Edit Canvas">
              <ListItem button onClick={() => setMode('CAN')}>
                <GridOn />
              </ListItem>
            </Tooltip>

            <ListItem button onClick={undo}>
              <Undo />
            </ListItem>
            <ListItem button onClick={redo}>
              <Redo />
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
            setOpen(!open);
          }}
          >
            <Menu />
          </IconButton>
        </div>
        <Divider />
        <List>
          <ListItem button>
            <ListItemIcon><Usb /></ListItemIcon>
            <ListItemText primary="USB Connection" />
          </ListItem>
          <ListItem button>
            <ListItemIcon><Image /></ListItemIcon>
            <ListItemText primary="Reference Image" />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem button>
            <ListItemIcon><DeleteForeverOutlined /></ListItemIcon>
            <ListItemText primary="Delete" />
          </ListItem>
          <ListItem button>
            <ListItemIcon><Info /></ListItemIcon>
            <ListItemText primary="Info" />
          </ListItem>
        </List>
      </Drawer>
    </div>
  );
}
