/* Unable to require due to ESLint */
import Actuation from './Actuation.svg';
import Delete from './Delete.svg';
import DownloadFile from './DownloadFile.svg';
import ElectrodeNumbering from './ElectrodeNumbering.svg';
import ElectrodePen from './ElectrodePen.svg';
import Information from './Information.svg';
import Menu from './Menu.svg';
import Redo from './Redo.svg';
import Undo from './Undo.svg';
import ReferenceImage from './ReferenceImage.svg';
import SelectionTool from './SelectionTool.svg';
import ActuationonClick from './onClick/ActuationonClick.svg';
import ElectrodeNumberingonClick from './onClick/ElectrodeNumberingonClick.svg';
import ElectrodePenonClick from './onClick/ElectrodePenonClick.svg';
import SelectionToolonClick from './onClick/SelectionToolonClick.svg';
import USBconnected from './USB-connected.svg';
import USBdisconnected from './USB-disconnected.svg';
import ImportFile from './ImportFile.svg';
import CreateFile from './CreateFile.svg';
import Save from './Save.svg';
import SetVoltage from './SetVoltage.svg';
import SetVpp from './SetVpp.svg';
import SetVoltageonClick from './onClick/SetVoltageonClick.svg';
import SetVpponClick from './onClick/SetVpponClick.svg';

const icons = {
  actuation: {
    icon: Actuation,
    onClick: ActuationonClick,
  },
  delete: {
    icon: Delete,
  },
  downloadfile: {
    icon: DownloadFile,
  },
  electrodenumbering: {
    icon: ElectrodeNumbering,
    onClick: ElectrodeNumberingonClick,
  },
  electrodepen: {
    icon: ElectrodePen,
    onClick: ElectrodePenonClick,
  },
  info: {
    icon: Information,
  },
  menu: {
    icon: Menu,
  },
  redo: {
    icon: Redo,
  },
  undo: {
    icon: Undo,
  },
  refimage: {
    icon: ReferenceImage,
  },
  selectiontool: {
    icon: SelectionTool,
    onClick: SelectionToolonClick,
  },
  usb: {
    connected: USBconnected,
    disconnected: USBdisconnected,
  },
  import: {
    icon: ImportFile,
  },
  create: {
    icon: CreateFile,
  },
  save: {
    icon: Save,
  },
  setvoltage: {
    icon: SetVoltage,
    onClick: SetVoltageonClick,
  },
  setvpp: {
    icon: SetVpp,
    onClick: SetVpponClick,
  },
};

export default icons;
