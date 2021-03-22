import React, { useContext, useState } from "react"
import Context from "../context"
import {makeStyles} from "@material-ui/core/styles";
import clsx from 'clsx';
import CssBaseline from '@material-ui/core/CssBaseline'
import Drawer from "@material-ui/core/Drawer"
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {Undo, Redo, Highlight, GetApp, FileCopy, Create, Info, ViewWeek, Usb, Image, Menu, 
    FormatListNumberedOutlined, DeleteForeverOutlined} from '@material-ui/icons';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        height: '8vh'
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

export function ControlPanel() {
    const context = useContext(Context);
    const { drawing } = context.state
    const { setDrawing, setSelected, setStartActuate, undo, redo } = context

    const classes = useStyles();
    const [open, setOpen] = useState(false);

    function toggleDraw(e) {
        setSelected([])
        setDrawing(!drawing)
    }

    return (
        <div className={classes.root}>
            <CssBaseline/>
            <AppBar
                position="fixed"
                color='inherit'
                className={clsx(classes.appBar, {
                [classes.appBarShift]: open,
                })}
            >
                <Toolbar style={{marginLeft: 40}}>
                    <List style={{display: 'flex', flexDirection: 'row'}}>
                        <ListItem button onClick={toggleDraw}>
                            <Create/>
                        </ListItem>
                        <ListItem button onClick={setStartActuate}>
                            <Highlight/>
                        </ListItem>
                        <ListItem button>
                            <FileCopy/>
                        </ListItem>
                        <ListItem button>
                            <GetApp/>
                        </ListItem>
                        <ListItem button onClick={undo}>
                            <Undo/>
                        </ListItem>
                        <ListItem button onClick={redo}>
                            <Redo/>
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
                <IconButton onClick={()=>{
                    setOpen(!open);
                }}>
                    <Menu/>
                </IconButton>
                </div>
                <Divider />
                <List>
                    <ListItem button>
                        <ListItemIcon><Usb /></ListItemIcon>
                        <ListItemText primary={'USB Connection'} />
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon><Image /></ListItemIcon>
                        <ListItemText primary={'Reference Image'} />
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon><FormatListNumberedOutlined/></ListItemIcon>
                        <ListItemText primary={'Numbering'} />
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon><ViewWeek /></ListItemIcon>
                        <ListItemText primary={'Actuation Sequence'} />
                    </ListItem>
                </List>
                <Divider />
                <List>
                    <ListItem button>
                        <ListItemIcon><DeleteForeverOutlined /></ListItemIcon>
                        <ListItemText primary={'Delete'} />
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon><Info /></ListItemIcon>
                        <ListItemText primary={'Info'} />
                    </ListItem>
                </List>
            </Drawer>
        </div>
    )
}