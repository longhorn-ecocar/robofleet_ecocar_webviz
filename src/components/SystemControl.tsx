import {
  Card,
  CardContent,
  Typography,
  Grid,
  makeStyles,
  Box
} from '@material-ui/core';
import React, { useState, useCallback } from "react";
import { fb } from '../schema';
import { getStatusColor } from '../status';
import useRobofleetMsgListener from '../hooks/useRobofleetMsgListener';
import { matchTopicAnyNamespace } from '../util';

interface StyleProps {
  card_color: string;
}

const useStyles = makeStyles({
  card: {
    flexGrow: 1,
    height: '100%',
  },
  cardTitle: {
    // height: '4rem',
  },
  cardContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center', // center items vertically
    alignItems: 'center', // center items horizontally
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '100%',
    marginLeft: "auto"
  },
  status: {
    height: 30,
    width: 30,
    borderRadius: '50%',
  },
  background: (props: StyleProps) => ({
    backgroundColor: props.card_color
  })
});

export function StatusIndicator(props: { topic: string, dictKey: string }) {
  // We'll store the decoded dictionary here
  const [systemDict, setSystemDict] = useState<{ [key: string]: number } | null>(null);

  // Compute the color for this block based on the value for props.dictKey
  const value = systemDict && systemDict[props.dictKey] !== undefined ? systemDict[props.dictKey] : 0;
  const classes = useStyles({ card_color: getStatusColor(value) });

  // Listen for messages on the given topic and decode the dictionary
  useRobofleetMsgListener(
    matchTopicAnyNamespace(props.topic),
    useCallback((buf, match) => {
      // Get the ByteMultiArray message from the flatbuffer buffer.
      const byteMsg = fb.std_msgs.ByteMultiArray.getRootAsByteMultiArray(buf);

      // Build an array of numbers from the message.
      let dataArr: number[] = [];
      for (let i = 0; i < byteMsg.dataLength(); i++) {
        const val = byteMsg.data(i);
        if (val !== null) {
          dataArr.push(val);
        }
      }

      // Convert the array of char codes into a string.
      const decodedString = String.fromCharCode(...dataArr);

      // Decode the string into a dictionary.
      // Expected format: "key1:val1;key2:val2;..."
      let dict: { [key: string]: number } = {};
      decodedString.split(';').forEach(pair => {
        if (pair.trim() !== '') {
          const parts = pair.split(':');
          if (parts.length === 2) {
            const key = parts[0].trim();
            const val = parseInt(parts[1].trim(), 10);
            if (!isNaN(val)) {
              dict[key] = val;
            }
          }
        }
      });
      console.log(dict);
      setSystemDict(dict);
    }, [])
  );

  return (
    <React.Fragment>
      <Card variant="outlined" className={classes.card}>
        <CardContent className={classes.cardContent}>
          <span className={`${classes.status} ${classes.background}`} />
        </CardContent>
      </Card>
    </React.Fragment>
  );
};

function ThreeStatusIndicator(props: { info_level: number, topic: string }) {
  // For example, we assume the dictionary has keys: "dyno_mode_req", "dyno_mode_state", and "ACC_state"
  return (
    <React.Fragment>
      <Grid container spacing={2} direction="row" justify="center">
        <Grid item>
          <StatusIndicator topic={props.topic} dictKey="dyno_mode_req" />
        </Grid>
        <Grid item>
          <StatusIndicator topic={props.topic} dictKey="dyno_mode_state" />
        </Grid>
        <Grid item>
          <StatusIndicator topic={props.topic} dictKey="ACC_state" />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

function TwoStatusIndicator(props: { info_level: number, topic: string }) {
  // Here, choose two other keys that you expect in the dictionary.
  return (
    <React.Fragment>
      <Grid container spacing={2} direction="row" justify="center">
        <Grid item>
          <StatusIndicator topic={props.topic} dictKey="object_sim_status" />
        </Grid>
        <Grid item>
          <StatusIndicator topic={props.topic} dictKey="udp_sim_status" />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export function SystemControlComponent(props: { info_level: number; }) {
  return (
    <React.Fragment>
      <Grid>
        <Grid>
          <Typography variant="h6">System Control</Typography>
        </Grid>

        <Grid>
          <Typography>Toggle DMS</Typography>
          <ThreeStatusIndicator info_level={1} topic={'autera_can_tx'} />
        </Grid>

        <Grid>
          <Typography>Toggle CAV Dyno</Typography>
          <ThreeStatusIndicator info_level={1} topic={'autera_can_tx'} />
        </Grid>

        <Grid>
          <Typography>Object Sim Status</Typography>
          <TwoStatusIndicator info_level={1} topic={'autera_can_tx'} />
        </Grid>

        <Grid>
          <Typography>UDP Sim Status</Typography>
          <TwoStatusIndicator info_level={1} topic={'autera_can_tx'} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
