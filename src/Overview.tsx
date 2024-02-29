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
import useRobofleetMsgListener from './hooks/useRobofleetMsgListener';
import { fb } from './schema';
import { matchTopicAnyNamespace } from './util';
import config from './config';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import IdTokenContext from './contexts/IdTokenContext';
import { SensorHealthComponent } from './components/SensorHealth';
import { SystemHealthComponent } from './components/SystemHealth';
import { VehicleMonitorComponent } from './components/VehicleMonitor';
import { CACCStatusComponent } from './components/CACCStatusComponent';
import { SystemLogComponent } from './components/SystemLog';

dayjs.extend(relativeTime);

const useStyles = makeStyles((theme: Theme) => ({
  sensorHealthContainer: {
    maxWidth: '30%',
    margin: 'auto',
  },
  disabled: {},
  leftPanel: {
    background: theme.palette.background.paper,
    padding: theme.spacing(2),
    height: 'calc(100vh - 64px)', // Assuming NavBar is 64px
    overflowY: 'auto', // Make only the left panel scrollable
  },
  middlePanel: {
    position: 'relative', // For absolute positioning of the image or overlay
    padding: theme.spacing(2),
    height: 'calc(100vh - 64px)',
    overflowY: 'auto', // Make only the middle panel scrollable
  },
  rightPanel: {
    background: theme.palette.background.paper,
    padding: theme.spacing(2),
    height: 'calc(100vh - 64px)',
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
  systemLogs: {
    flexGrow: 1, // Allow System Logs to take up remaining space
    overflowY: 'auto', // Make only the system logs scrollable
  },
}));

export default function Overview() {
  const { setPaused } = useContext(AppContext);

  const [systemLog, setSystemLog] = useState<fb.amrl_msgs.SystemLog[]>([]);
  const [sensorHealth, setSensorHealth] = useState<fb.amrl_msgs.SensorHealth | null>(null)
  const [sensorStatuses, setSensorStatuses] = useState<fb.amrl_msgs.SensorStatus[]>([]);
  const [caccStatus, setCaccStatus] = useState<fb.amrl_msgs.CACCStatus | null>(null)
  const [systemHealth, setSystemHealth] = useState<fb.amrl_msgs.SystemHealth | null>(null);
  const [vehicleMonitor, setVehicleMonitor] = useState<fb.sensor_msgs.CompressedImage | null>(null);

  const { idToken } = useContext(IdTokenContext);
  const classes = useStyles();

  useEffect(() => {
    setPaused(false);
  }, [setPaused]);

  useRobofleetMsgListener(
    matchTopicAnyNamespace('system_log'),
    useCallback(
        (buf, match) => {
            const status = fb.amrl_msgs.SystemLog.getRootAsSystemLog(
                buf
            );
            systemLog.push(status);
            setSystemLog(systemLog);
        },
        [systemLog]
    )
  );

  useRobofleetMsgListener(
    matchTopicAnyNamespace('system_health'),
    useCallback(
        (buf, match) => {
            const status = fb.amrl_msgs.SystemHealth.getRootAsSystemHealth(
                buf
            );
            setSystemHealth(status);
        },
        [systemHealth]
    )
  );

  useRobofleetMsgListener(
    matchTopicAnyNamespace('sensor_health'),
    useCallback(
        (buf, match) => {
            const status = fb.amrl_msgs.SensorHealth.getRootAsSensorHealth(
                buf
            );
            setSensorHealth(status)
            if (status) {
                const sensorStatusesResult = []
                for (let i = 0; i < status.healthsLength(); i += 1) {
                    sensorStatusesResult.push(status.healths(i)!);
                }
                setSensorStatuses(sensorStatusesResult);
            }
        },
        [sensorHealth, sensorStatuses]
    )
  );

  useRobofleetMsgListener(
    matchTopicAnyNamespace('cacc_status'),
    useCallback(
        (buf, match) => {
            const status = fb.amrl_msgs.CACCStatus.getRootAsCACCStatus(
                buf
            );
            setCaccStatus(status)
        },
        [caccStatus]
    )
  );

  useRobofleetMsgListener(
    matchTopicAnyNamespace('birdseyeview_image'),
    useCallback(
        (buf, match) => {
            const status = fb.sensor_msgs.CompressedImage.getRootAsCompressedImage(
                buf
            );
            setVehicleMonitor(status)
        },
        [vehicleMonitor]
    )
  );

  const num_arr = []
  if(sensorHealth != null) {
    for (let i = 0; i < sensorHealth?.healthsLength(); i++) {
        num_arr.push(i);
    }
  }

  return (
    <Container maxWidth={false} disableGutters>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Paper className={classes.leftPanel}>
            <Typography variant="h6">Sensor Health</Typography>
            {sensorStatuses.map((sensorStatus) => {
                return <SensorHealthComponent 
                  info_level={1} msg={sensorStatus} key={sensorStatus.sensorid()!}/>
            })}
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Box className={classes.middlePanel}>
            <Typography variant="h6">Live Vehicle Monitor</Typography>
            {vehicleMonitor && 
              <VehicleMonitorComponent info_level={1} msg={vehicleMonitor}/>
            }
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box className={classes.rightPanel}>
            <Box className={classes.systemHealth}>
              <Typography variant="h6">System Health</Typography>
              {systemHealth && 
                <SystemHealthComponent info_level={1} msg={systemHealth} />
              }   
            </Box>
            <Box className={classes.caccStatus}>
              <Typography variant="h6">CACC Status</Typography>
              {caccStatus && 
                <CACCStatusComponent info_level={1} msg={caccStatus} />
              }
            </Box>
            <Box className={classes.systemLogs}>
              <Typography variant="h6">System Logs</Typography>
              <SystemLogComponent info_level={1} system_logs={systemLog} /> 
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

