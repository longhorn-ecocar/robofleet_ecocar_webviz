import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  makeStyles,
  Grid,
  Theme,
} from '@material-ui/core';
import { Check, Clear, Delete } from '@material-ui/icons';
import CloudOff from '@material-ui/icons/CloudOff';
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactElement,
} from 'react';
import { Link } from 'react-router-dom';
import NavBar from './components/NavBar';
import PercentageDisplay from './components/PercentageDisplay';
import AppContext from './contexts/AppContext';
import { fb } from './schema';
import config from './config';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import IdTokenContext from './contexts/IdTokenContext';
import { SensorHealthComponent } from './components/SensorHealth';
import { SystemHealthComponent } from './components/SystemHealth';
import { SystemControlComponent } from './components/SystemControl';
import { VehicleMonitorComponent } from './components/VehicleMonitor';
import { CACCStatusComponent } from './components/CACCStatusComponent'; // old test
import { SystemLogComponent } from './components/SystemLog'; // old test
import { Dashboard } from './Dashboard';
import Toggle from './components/Toggle';

dayjs.extend(relativeTime);

const useStyles = makeStyles((theme: Theme) => ({
  disabled: {},
  leftPanel: {
    background: theme.palette.background.paper,
    padding: theme.spacing(2),
    height: 'calc(100vh - 136px)', // Assuming NavBar is 64px
    overflowY: 'auto', // Make only the left panel scrollable
  },
  middlePanel: {
    position: 'relative', // For absolute positioning of the image or overlay
    padding: theme.spacing(2),
    height: 'calc(100vh - 136px)',
    overflowY: 'auto', // Make only the middle panel scrollable
  },
  rightPanel: {
    background: theme.palette.background.paper,
    padding: theme.spacing(2),
    height: 'calc(100vh - 136px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between', // Distribute space evenly between the items
  },
  systemHealth: {
    marginBottom: theme.spacing(2), // Space between System Health and CACC Status
  },
  caccStatus: {
    // Additional styles if necessary
  },
  // systemControl: {

  // },
  dashboard: {
    // Additional styles if necessary
    flexGrow: 1,
    padding: theme.spacing(1),
    height: 'calc(100vh - 136px)', // Assuming NavBar is 64px
    overflowY: 'auto', // Make only the left panel scrollable
  },
  systemLogs: {
    flexGrow: 1, // Allow System Logs to take up remaining space
    overflowY: 'auto', // Make only the system logs scrollable
  },
}));

export default function Overview() {
  const { setPaused } = useContext(AppContext);

  const [showVehicleMonitor, setShowVehicleMonitor] = useState<boolean>(true);

  const { idToken } = useContext(IdTokenContext);
  const classes = useStyles();

  useEffect(() => {
    setPaused(false);
  }, [setPaused]);


  const setToggle = (shouldShowImageViewer: boolean) => {
    setShowVehicleMonitor(shouldShowImageViewer);
  };

  return (
    <Container maxWidth={false} disableGutters>
      <Box p={2} display="flex" alignItems="center">
        <Typography variant="h5">LEVA Monitor</Typography>
        <Toggle label="Show Image Viewer" setToggle={setToggle}/>
        {/* <Grid container spacing={1} style={{ marginLeft: 'auto', width: '50' }}> */}
          <SystemHealthComponent info_level={1} />
      </Box>
        {/* </Grid> */}

      {/* Sensor Health */}
      <Grid container spacing={2}>
        <Grid item xs={showVehicleMonitor ? 3 : 6}>
          <Paper className={classes.leftPanel}>
            <Typography variant="h6">Sensor Health</Typography>
            <SensorHealthComponent info_level={1} />
          </Paper>
        </Grid>

        {/* System Control Component */}
        <Grid item xs={3}>
          <Paper className={classes.leftPanel}>
            <SystemControlComponent info_level={1}/>
          </Paper>
        </Grid>

        {/* 4 Panel dashboard (CACC, AIN, LCC, AP)*/}
        <Box className={classes.dashboard}>
          <Dashboard/>
        </Box>
      </Grid>
    </Container>
  );
};

