import {
  Card,
  CardContent,
  Typography,
  makeStyles
} from '@material-ui/core';
import React, { useCallback, useState } from "react";
import { fb } from '../schema';
import {getStatusColor} from '../status'
import useRobofleetMsgListener from '../hooks/useRobofleetMsgListener';
import { matchTopicAnyNamespace } from '../util';

const useStyles = makeStyles({
  root: (props: any) => ({
    backgroundColor: props.card_color, // Use a function to set the color dynamically
  }),
});

function SensorStatusComponent(props: {
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

export function SensorHealthComponent(props: {
    info_level: number
}) {
  const [sensorHealth, setSensorHealth] = useState<fb.amrl_msgs.SensorHealth | null>(null)
  const [sensorStatuses, setSensorStatuses] = useState<fb.amrl_msgs.SensorStatus[]>([]);

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

  return (
    <React.Fragment>
        {sensorStatuses.map((sensorStatus: any) => {
            return <SensorStatusComponent 
                info_level={1} msg={sensorStatus} key={sensorStatus.sensorid()!}/>
        })}
    </React.Fragment>
  )
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


  