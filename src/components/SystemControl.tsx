import {
  Card,
  CardContent,
  Typography,
  Grid,
  makeStyles,
  Box,
  Button,
} from '@material-ui/core';
import React, { useState, useCallback, useContext } from "react";
import { fb } from '../schema';
import { flatbuffers } from 'flatbuffers';
import WebSocketContext from '../contexts/WebSocketContext';
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
    height: 15,
    width: 15,
    borderRadius: '50%',
  },
  background: (props: StyleProps) => ({
    backgroundColor: props.card_color
  })
});

/**
 * New helper function to create a std_msgs/String FlatBuffer message.
 * The input parameter 'data' is now a string.
 */
function createStringMsg({
  namespace,
  topic,
  data,
}: {
  namespace: string;
  topic: string;
  data: string;
}): Uint8Array {
  const fbb = new flatbuffers.Builder();
  const metadataOffset = fb.MsgMetadata.createMsgMetadata(
    fbb,
    fbb.createString('std_msgs/String'),
    fbb.createString(`${namespace}/${topic}`)
  );
  const dataOffset = fbb.createString(data);
  const stringMessageOffset = fb.std_msgs.String.createString(fbb, metadataOffset, dataOffset);
  fbb.finish(stringMessageOffset);
  return fbb.asUint8Array();
}

// (Keep your existing StatusIndicator, ThreeStatusIndicator, TwoStatusIndicator, ByteCounter components as before.)
export function StatusIndicator(props: { color: string, dataVal: number, matchVal: number }) {
  let isMatching = props.dataVal === props.matchVal;
  const classes = useStyles({ card_color: isMatching ? props.color : "gray" });

  return (
    <React.Fragment>
      <Card variant="outlined" className={classes.card}>
        <CardContent className={classes.cardContent}>
          <span className={`${classes.status} ${classes.background}`} />
        </CardContent>
      </Card>
    </React.Fragment>
  );
}

function ThreeStatusIndicator(props: { dataVal: number }) {
  return (
    <React.Fragment>
      <Grid container spacing={2} direction="row" justify="center">
        <Grid item>
          <StatusIndicator color="red" matchVal={0} dataVal={props.dataVal} />
        </Grid>
        <Grid item>
          <StatusIndicator color="yellow" matchVal={1} dataVal={props.dataVal} />
        </Grid>
        <Grid item>
          <StatusIndicator color="green" matchVal={2} dataVal={props.dataVal} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

function TwoStatusIndicator(props: { dataVal: number }) {
  return (
    <React.Fragment>
      <Grid container spacing={2} direction="row" justify="center">
        <Grid item>
          <StatusIndicator color="red" matchVal={0} dataVal={props.dataVal} />
        </Grid>
        <Grid item>
          <StatusIndicator color="green" matchVal={1} dataVal={props.dataVal} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export function ByteCounter(props: { value: number }) {
  return (
    <h5>Byte Count: {props.value}</h5>
  );
}

export function SystemControlComponent(props: { info_level: number; topic: string; namespace: string }) {
  const ws = useContext(WebSocketContext);

  // Default system dictionary for displaying received values.
  const defaultSystemDict = {
    dyno_mode_req: 0,
    byte_count: 0,
    dyno_mode_state: 0,
    ACC_state: 0,
  };
  const [systemDict, setSystemDict] = useState<{ [key: string]: number } | null>(null);
  const displayDict = systemDict || defaultSystemDict;

  // Command dictionary for transmitting commands.
  const defaultCommandDict = {
    toggle_dms: 0,
    toggle_dyno: 0,
  };
  const [commandDict, setCommandDict] = useState<{ [key: string]: number }>(defaultCommandDict);

  // Listener for incoming messages (still expecting ByteMultiArray for display)
  useRobofleetMsgListener(
    matchTopicAnyNamespace(props.topic),
    useCallback((buf, match) => {
      // Get the std_msgs/String message from the FlatBuffer buffer.
      const stringMsg = fb.std_msgs.String.getRootAsString(buf);
      const decodedString = stringMsg.data();
      let dict: { [key: string]: number } = {};
      if (decodedString) {
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
      }
      console.log(dict);
      setSystemDict(dict);
    }, [])
  );

  // When a toggle button is pressed, update commandDict and transmit it using std_msgs/String.
  const handleCommandToggle = (key: "toggle_dms" | "toggle_dyno") => {
    const newCommandDict = { ...commandDict };
    newCommandDict[key] = newCommandDict[key] === 0 ? 1 : 0;
    setCommandDict(newCommandDict);

    // Encode the command dictionary as a string "key1:val1;key2:val2"
    const msgString = Object.entries(newCommandDict)
      .map(([k, v]) => `${k}:${v}`)
      .join(";");
    const msg = createStringMsg({
      namespace: props.namespace,
      topic: `/leva/initialpose`, // adjust topic as needed
      data: msgString,
    });

    if (ws?.connected) {
      console.log("Sending command dict:", msgString);
      ws.ws?.send(msg);
    } else {
      console.error("WebSocket not connected, cannot send command.");
    }
  };

  return (
    <React.Fragment>
      <Grid>
        <Grid>
          <Typography variant="h6">System Control</Typography>
        </Grid>

        <Grid>
          <Typography>Toggle DMS</Typography>
          <Button variant="contained" color="primary" onClick={() => handleCommandToggle("toggle_dms")}>
            Toggle DMS
          </Button>
          <ThreeStatusIndicator dataVal={displayDict["dyno_mode_req"]} />
        </Grid>

        <Grid>
          <Typography>UDP Received Byte Counter:</Typography>
          <ByteCounter value={displayDict["byte_count"]} />
        </Grid>

        <Grid>
          <Typography>Toggle CAV Dyno</Typography>
          <Button variant="contained" color="primary" onClick={() => handleCommandToggle("toggle_dyno")}>
            Toggle Dyno
          </Button>
          <TwoStatusIndicator dataVal={displayDict["dyno_mode_state"]} />
        </Grid>

        <Grid>
          <Typography>ACC State</Typography>
          <ThreeStatusIndicator dataVal={displayDict["ACC_state"]} />
        </Grid>

        <Grid>
          <Typography>Request for Dyno Mode</Typography>
          <TwoStatusIndicator dataVal={displayDict["dyno_mode_req"]} />
        </Grid>

        <Grid>
          <Typography>Simulation Active Status</Typography>
          <TwoStatusIndicator dataVal={displayDict["dyno_mode_req"]} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
