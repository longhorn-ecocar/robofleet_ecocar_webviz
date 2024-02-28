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

dayjs.extend(relativeTime);

type RobotStatus = {
  name: string;
  is_ok: boolean;
  battery_level: number;
  status: string;
  location: string;
  is_active: boolean;
  last_updated: string;
};

type StaticRobotInfo = {
  name: string;
  ip: string;
  lastStatus: string;
  lastLocation: string;
  lastUpdated: string;
};

const useStyles = makeStyles((theme: Theme) => ({
  inactive: {
    '& td': {
      color: theme.palette.text.secondary,
    },
  },
  button: {
    '&$disabled': {
      color: theme.palette.text.secondary,
    },
  },
  sensorHealthContainer: {
    maxWidth: '30%',
    margin: 'auto',
  },
  disabled: {},
}));

const MaybeDisconnectedLabel = (props: {
  label: ReactElement | string;
  disconnected: boolean;
}) => {
  if (props.disconnected) {
    return (
      <Tooltip arrow title="Offline, showing saved data.">
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
        >
          <CloudOff fontSize="small" />
          <Box marginRight={1} />
          {props.label}
        </Box>
      </Tooltip>
    );
  }
  return <>{props.label}</>;
};

export default function Overview() {
  const { setPaused } = useContext(AppContext);
  const [data, setData] = useState({} as { [name: string]: RobotStatus });

  const [systemLog, setSystemLog] = useState<fb.amrl_msgs.SystemLog[]>([]);
  const [sensorHealth, setSensorHealth] = useState<fb.amrl_msgs.SensorHealth | null>(null)
  const [sensorStatuses, setSensorStatuses] = useState<fb.amrl_msgs.SensorStatus[]>([]);
  const [caccStatus, setCaccStatus] = useState<fb.amrl_msgs.CACCStatus | null>(null)
  const [systemHealth, setSystemHealth] = useState<fb.amrl_msgs.SystemHealth | null>(null);

  const [manageMode, setManageMode] = useState(false);
  const { idToken } = useContext(IdTokenContext);
  const classes = useStyles();

  const updateRobotList = useCallback(async () => {
    const baseUrl = new URL(config.serverUrl);
    baseUrl.protocol = window.location.protocol;
    const url = new URL('robots', baseUrl).toString();
    const res = await fetch(url, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      try {
        const robotInfo = (await res.json()) as Array<StaticRobotInfo>;
        const staticData = {} as { [name: string]: RobotStatus };
        robotInfo.forEach((robot) => {
          const name = '/' + robot.name;
          staticData[name] = {
            name,
            is_ok: true,
            battery_level: -1,
            status: robot.lastStatus,
            location: robot.lastLocation,
            is_active: false,
            last_updated: dayjs(robot.lastUpdated).fromNow(),
          };
        });

        setData({
          ...staticData,
        });
      } catch (err) {
        console.error(`Failed to fetch static robot info`, err);
      }
    }
  }, []);

  async function handleRemove(name: string, obj: any) {
    console.log('removing ', name, obj);
    const baseUrl = new URL(config.serverUrl);
    baseUrl.protocol = window.location.protocol;
    const url = new URL('robots/delete', baseUrl).toString();

    try {
      await fetch(url, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          ...(idToken && { id_token: idToken }),
        }),
      });

      const newData = data;
      delete newData[name];

      setData(newData);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    setPaused(false);
  }, [setPaused]);

  useRobofleetMsgListener(
    matchTopicAnyNamespace('status'),
    useCallback(
      (buf, match) => {
        const name = match[1];
        const status = fb.amrl_msgs.RobofleetStatus.getRootAsRobofleetStatus(
          buf
        );
        setData({
          ...data,
          [name]: {
            name: name,
            is_ok: status.isOk(),
            battery_level: status.batteryLevel(),
            status: status.status() ?? '',
            location: status.location() ?? '',
            is_active: true,
            last_updated: 'now',
          },
        });
      },
      [data]
    )
  );

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

  useEffect(() => {
    updateRobotList();
  }, [updateRobotList]);

  const tableHead = (
    <TableHead>
      <TableRow>
        <TableCell align="left">Name</TableCell>
        <TableCell style={{ width: '3em' }} align="center">
          OK
        </TableCell>
        <TableCell style={{ width: '6.5em' }} align="center">
          Battery
        </TableCell>
        <TableCell align="center">Status</TableCell>
        <TableCell align="center">Location</TableCell>
        <TableCell align="center">Last seen</TableCell>
        {manageMode ? <TableCell align="center"></TableCell> : null}
      </TableRow>
    </TableHead>
  );

  const sortedData = useMemo(
    () =>
      Object.entries(data).sort(
        ([_, a], [__, b]) => Number(b.is_active) - Number(a.is_active)
      ),
    [data]
  );

  const items = sortedData.map(([name, obj]) => {
    let batteryContent: ReactElement | string;
    if (obj.battery_level >= 0) {
      batteryContent = <PercentageDisplay value={obj.battery_level} />;
    } else {
      batteryContent = 'unknown';
    }

    const nameContent = (
      <Button
        classes={{ root: classes.button, disabled: classes.disabled }}
        component={Link}
        to={`/robot/${btoa(name)}`}
        style={{ textTransform: 'none' }}
        variant={obj.is_active ? 'outlined' : 'text'}
        disabled={!obj.is_active}
        startIcon={!obj.is_active && <CloudOff />}
      >
        {name}
      </Button>
    );

    const removalContent = obj.is_active ? null : (
      <Button
        onClick={() => handleRemove(name, obj)}
        style={{ textTransform: 'none' }}
        variant={'outlined'}
        startIcon={<Delete />}
      >
        Remove
      </Button>
    );

    return (
      <TableRow key={name} className={obj.is_active ? '' : classes.inactive}>
        <TableCell align="left">{nameContent}</TableCell>
        <TableCell align="center">
          {obj.is_ok ? <Check /> : <Clear color="error" />}
        </TableCell>
        <TableCell align="center">{batteryContent}</TableCell>
        <TableCell align="center">
          <MaybeDisconnectedLabel
            label={obj.status}
            disconnected={!obj.is_active}
          />
        </TableCell>
        <TableCell align="center">
          <MaybeDisconnectedLabel
            label={obj.location}
            disconnected={!obj.is_active}
          />
        </TableCell>
        <TableCell align="center">{obj.last_updated}</TableCell>
        {manageMode ? (
          <TableCell align="center">{removalContent}</TableCell>
        ) : null}
      </TableRow>
    );
  });

  const num_arr = []
  if(sensorHealth != null) {
    for (let i = 0; i < sensorHealth?.healthsLength(); i++) {
        num_arr.push(i);
    }
  }

  return (
    <>
      <NavBar />
      <Box height="2em" />
      <Container component="main" maxWidth="md">
        <Container className={classes.sensorHealthContainer}>
            <h2>Sensor Health</h2>
            {sensorStatuses.map((sensorStatus) => {
                return <SensorHealthComponent 
                  info_level={1} msg={sensorStatus} key={sensorStatus.sensorid()!}/>
            })}
          </Container>
        <div>
            <h2>Live Vehicle Monitor</h2>
            <VehicleMonitorComponent info_level={1}/>
        </div>
        <div>
            <h2>System Health</h2>
            {systemHealth && 
              <SystemHealthComponent info_level={1} msg={systemHealth} />
            }   
        </div>
        <div>
            <h2>CACCStatus</h2>
            {caccStatus && 
                <React.Fragment>
                    <p>Status: {caccStatus.status()}</p>
                </React.Fragment>
            }   
        </div>
        <div>
            <h2>System Logs</h2>
            {systemLog.map((log) => {
                return <p>{log.log()}</p>
            })
            }   
        </div>
      </Container>
    </>
  );
}
