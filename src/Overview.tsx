import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Grid,
  Typography,
  makeStyles,
  Theme,
} from '@material-ui/core';
import NavBar from './components/NavBar';
import PercentageDisplay from './components/PercentageDisplay';
import AppContext from './contexts/AppContext';
import IdTokenContext from './contexts/IdTokenContext';
import { SensorHealthComponent } from './components/SensorHealth';
import { SystemHealthComponent } from './components/SystemHealth';
import { SystemControlComponent, ButtonConfig } from './components/SystemControl';
import { SignalConfig } from './components/SignalListComponent';

const useStyles = makeStyles((theme: Theme) => ({
  leftPanel: {
    background: theme.palette.background.paper,
    padding: theme.spacing(2),
    height: 'calc(100vh - 136px)',
    overflowY: 'auto',
  },
}));

export default function Overview() {
  const classes = useStyles();
  const { setPaused } = useContext(AppContext);
  const { idToken } = useContext(IdTokenContext);
  const [showVehicleMonitor, setShowVehicleMonitor] = useState<boolean>(true);

  useEffect(() => {
    setPaused(false);
  }, [setPaused]);

  // Namespace for topics
  const namespace = 'leva';

  // 1) Define signal configurations
  const cavSignalConfigs: SignalConfig[] = [
    {
      name: 'Dyno Mode Request',
      key: 'dyno_mode_req',
      type: 'indicator',
      state: 0,
      colors: { '0': 'red', '1': 'green' }
    },
    {
      name: 'Dyno Mode State',
      key: 'dyno_mode_state',
      type: 'indicator',
      state: 0,
      colors: { '0': 'red', '1': 'green' }
    },
    {
      name: 'ACC State',
      key: 'ACC_state',
      type: 'indicator',
      state: 0,
      colors: { '0': 'red', '1': 'yellow', '2': 'green' }
    },
    {
      name: 'Vehicle Ahead',
      key: 'vehicle_ahead',
      type: 'indicator',
      state: 0,
      colors: { '0': 'red', '1': 'green' }
    },
    {
      name: 'Vehicle Headway',
      key: 'vehicle_headway',
      type: 'freeform',
      state: 0
    },
    {
      name: 'Traffic Light State',
      key: 'traffic_light_state',
      type: 'indicator',
      state: 0,
      colors: { '0': 'red', '1': 'green', '2': 'yellow' }
    },
    {
      name: 'CACC Mileage',
      key: 'CACC_mileage',
      type: 'freeform',
      state: 0
    },
    {
      name: 'AIN State',
      key: 'AIN_state',
      type: 'indicator',
      state: 0,
      colors: { '0': 'red', '1': 'yellow', '2': 'green' }
    },
    {
      name: 'LCC State',
      key: 'LCC_state',
      type: 'indicator',
      state: 0,
      colors: { '0': 'red', '1': 'yellow', '2': 'green' }
    },
    {
      name: 'AP State',
      key: 'AP_state',
      type: 'indicator',
      state: 0,
      colors: { '0': 'red', '1': 'yellow', '2': 'green' }
    },
    {
      name: 'DMS State',
      key: 'DMS_state',
      type: 'indicator',
      state: 0,
      colors: { '0': 'red', '1': 'yellow', '2': 'green' }
    },
    {
      name: 'UDP Byte Count',
      key: 'udp_byte_count',
      type: 'freeform',
      state: 0
    },
    {
      name: 'Simulation Active',
      key: 'simulation_active',
      type: 'indicator',
      state: 0,
      colors: { '0': 'red', '1': 'green' }
    },
  ];

  // 2) Define button configurations
  const cavButtonConfigs: ButtonConfig[] = [
    { name: 'Toggle Dyno', key: 'toggle_dyno', type: 'stateless' },
    { name: 'Enable AIN', key: 'AIN_button', type: 'stateful' },
    { name: 'Enable AP', key: 'AP_button', type: 'stateful' },
    { name: 'Enable DMS', key: 'DMS_button', type: 'stateful' },
  ];

  const pcmSignalConfigs: SignalConfig[] = [
    {
      name: "Power Flow",
      key: "pwr_flow",
      type: "freeform",
      state: 0
    },
    {
      name: "HV Battery SOC",
      key: 'hv_bat_soc',
      type: "freeform",
      state: 0
    },
    {
      name: "HV Battery Temp",
      key: 'hv_bat_temp',
      type: "freeform",
      state: 0
    },
    {
      name: "EDU Temp",
      key: 'edu_temp',
      type: "freeform",
      state: 0
    },
    {
      name: "Drive Mode",
      key: 'drv_mod',
      type: "freeform",
      state: 0
    },
  ]

  const pcmButtonConfigs: ButtonConfig[] = [
  ]

  return (
    <Container maxWidth={false} disableGutters>
      <Box p={2} display="flex" alignItems="center">
        <Typography variant="h5">LEVA Monitor</Typography>
        <SystemHealthComponent info_level={1} />
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Paper className={classes.leftPanel}>
            <Typography variant="h6">Sensor Health</Typography>
            <SensorHealthComponent info_level={1} />
          </Paper>
        </Grid>

        <Grid item xs={3}>
          <Paper className={classes.leftPanel}>
            <SystemControlComponent
              title="CAV Control Panel"
              signals={cavSignalConfigs}
              buttons={cavButtonConfigs}
              rxTopic="autera_can_tx"
              txTopic="/leva/initialpose"
              namespace={namespace}
            />
          </Paper>
        </Grid>

        <Grid item xs={3}>
          <Paper className={classes.leftPanel}>
            <SystemControlComponent
              title="PCM Control Panel"
              signals={pcmSignalConfigs}
              buttons={pcmButtonConfigs}
              rxTopic="autera_evccan_tx"
              txTopic="initialpose"
              namespace={namespace}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
