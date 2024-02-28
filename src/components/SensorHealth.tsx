import {
  Card,
  CardContent,
  Typography,
  makeStyles
} from '@material-ui/core';
import React from "react";
import { fb } from '../schema';
import {getStatusColor} from '../status'

const useStyles = makeStyles({
  root: (props: any) => ({
    backgroundColor: props.card_color, // Use a function to set the color dynamically
  }),
});

export function SensorHealthComponent(props: {
  info_level: number;
  msg: fb.amrl_msgs.SensorStatus;
}) {
  const { msg } = props;
  const card_color = getStatusColor(msg.status());

  const classes = useStyles({ card_color });

  return (
    <Card className={classes.root} variant="outlined">
      <CardContent>
        <Typography color="textPrimary" gutterBottom variant="h6">
          {msg.sensorid()}
        </Typography>
        <Typography color="textSecondary">
          Status: {msg.status()}
        </Typography>
        <Typography color="textSecondary">
          Frequency: {msg.frequency()}Hz
        </Typography>
        <Typography color="textSecondary">
          Standard Deviation: {msg.std()} 
        </Typography>
        <Typography color="textSecondary">
          Packet Size: {msg.packetSize()} Bytes
        </Typography>
      </CardContent>
    </Card>
  );
}

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


  