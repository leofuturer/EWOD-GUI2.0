import React, { useContext } from 'react';
import { DeleteForeverOutlined } from '@material-ui/icons';
import Tooltip from '@material-ui/core/Tooltip';
import ListItem from '@material-ui/core/ListItem';
import { CanvasContext } from '../Contexts/CanvasProvider';

export default function DeleteButton() {
  const context = useContext(CanvasContext);
  const {
    setSelected, setElectrodes, setCombSelected, setComboLayout,
  } = context;

  function handleDelete() {
    setSelected([]);
    setCombSelected([]);

    setElectrodes({
      initPositions: [],
      deltas: [],
    });
    setComboLayout([]);
  }
  return (
    <Tooltip title="Delete">
      <ListItem button onClick={handleDelete}>
        <DeleteForeverOutlined />
      </ListItem>
    </Tooltip>
  );
}
