import { 
Card, 
CardContent, 
Typography, 
makeStyles 
} from '@material-ui/core';
import React, { useState, useCallback } from 'react';
import { fb } from '../schema';
import {getStatusColor} from '../status'
import useRobofleetMsgListener from '../hooks/useRobofleetMsgListener';
import { matchTopicAnyNamespace } from '../util';

const useStyles = makeStyles({
  container: {
    display: 'flex', // Display as an inline block
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribute space evenly
    alignItems: 'center', // Center-align items horizontally
    maxWidth: '100%'
  },
  card: {
    marginRight: 2,
    marginBottom: 8,
    width: '100%',
    height: '8rem', // Set a fixed height
    textAlign: 'center',
  },
  cardTitle: {
    height: '4rem', // Set a fixed height
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly', // Center-align items vertically
    alignItems: 'center', // Center-align items horizontally
    flexGrow: 1, // Allow card content to grow and fill the space
    paddingTop: 16, // Add padding to the top to push content down if needed
    paddingBottom: 16, // Add padding to the bottom for spacing
  },
  status: {
    height: 30,
    width: 30,
    borderRadius: '50%',
    display: 'inline-block',
    marginBottom: 8,
  },
  background: (props: any) => (
    {
      backgroundColor: props.color
    }
  )
});

const StatusIndicator = ({ color, text}: {color: string, text: string}) => {
  const classes = useStyles({ color });

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Typography className={classes.cardTitle} variant="body2">{text}</Typography>      
        <span className={`${classes.status} ${classes.background}`} />
      </CardContent>
    </Card>
  );
};

export const SystemHealthComponent = (props: {
  info_level: number;
}) => {
  const classes = useStyles();

  const [systemHealth, setSystemHealth] = useState<fb.amrl_msgs.SystemHealth | null>(null);

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

  return (
    <React.Fragment>
        {systemHealth && 
            <div className={classes.container}>
                <StatusIndicator color={getStatusColor(systemHealth.pcmPropulsion())} text="Propulsion System" />
                <StatusIndicator color={getStatusColor(systemHealth.pcmHighvoltage())} text="HV System" />
                <StatusIndicator color={getStatusColor(systemHealth.cavLongitudinal())} text="CAV Long. Control" />
                <StatusIndicator color={getStatusColor(systemHealth.cavLateral())} text="CAV Lat. Control" />
                <StatusIndicator color={getStatusColor(systemHealth.cavV2x())} text="CAV V2X" />
            </div>
        }
    </React.Fragment>
  );
};


//   **SensorHealthComponent (Container for rendering Sensor Health)**

//   State:
  
//   - int8 info_level
//   - sensorStatusMsg[] teamSensorStatus
//   - sensorStatusMsg[] stockSensorStatus
  
//   Render:
  
//   **→ SensorStatusComponent []** teamSensorHealth
  
//   → SensorStatusComponents [] stockSensorHealth
  
//   if info_level is 0, don’t render the SensorStatusComponent
  
//   **SensorStatusComponent**
  
//   State: 
  
//   - sensorStatusMsg
//   - int8 info_level
  
//   Render:
  
//   - If info_level is 0
//       - Return sensor name + green/yellow/red depending on the status field in the SensorStatus.msg
//   - If info_level is 1
//       - Return List with each sensor field’s information


  