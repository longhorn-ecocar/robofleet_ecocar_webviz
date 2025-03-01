import {
  Card,
  CardContent,
  Typography,
  Grid,
  makeStyles,
  Box
} from '@material-ui/core';
import React, { useState, useCallback, useContext } from "react";
import { fb } from '../schema';
import { flatbuffers } from 'flatbuffers';
import WebSocketContext from '../contexts/WebSocketContext';
import useRobofleetMsgListener from '../hooks/useRobofleetMsgListener';
import { matchTopicAnyNamespace } from '../util';
import { Button } from "@material-ui/core";

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

function createByteMultiArrayMsg({
  namespace,
  topic,
  data,
}: {
  namespace: string;
  topic: string;
  data: number[];
}): Uint8Array {
  const fbb = new flatbuffers.Builder();

  // Create metadata offset.
  const metadataOffset = fb.MsgMetadata.createMsgMetadata(
    fbb,
    fbb.createString('std_msgs/ByteMultiArray'),
    fbb.createString(`${namespace}/${topic}`)
  );

  // Create the empty dimensions vector BEFORE starting the MultiArrayLayout.
  const emptyDimVector = fb.std_msgs.MultiArrayLayout.createDimVector(fbb, []);

  // Now start and finish the MultiArrayLayout.
  fb.std_msgs.MultiArrayLayout.startMultiArrayLayout(fbb);
  fb.std_msgs.MultiArrayLayout.addDim(fbb, emptyDimVector);
  fb.std_msgs.MultiArrayLayout.addDataOffset(fbb, 0);
  const layoutOffset = fb.std_msgs.MultiArrayLayout.endMultiArrayLayout(fbb);

  // Create the data vector for ByteMultiArray.
  const dataOffset = fb.std_msgs.ByteMultiArray.createDataVector(fbb, data);

  // Build the ByteMultiArray message.
  fb.std_msgs.ByteMultiArray.startByteMultiArray(fbb);
  fb.std_msgs.ByteMultiArray.add_Metadata(fbb, metadataOffset);
  fb.std_msgs.ByteMultiArray.addLayout(fbb, layoutOffset);
  fb.std_msgs.ByteMultiArray.addData(fbb, dataOffset);
  const byteMultiArrayOffset = fb.std_msgs.ByteMultiArray.endByteMultiArray(fbb);

  fbb.finish(byteMultiArrayOffset);
  return fbb.asUint8Array();
}


export function StatusIndicator(props: { color: string, dataVal: number, matchVal: number }) {
  // should display hardcoded color if dataVal == matchVal
  // otherwise display gray
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
};

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
  // Here, choose two other keys that you expect in the dictionary.
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
  // TODO: Move dictionary decoding here
  const ws = useContext(WebSocketContext);

  // Received dictionary from incoming messages (for display)
  const defaultSystemDict = {
    dyno_mode_req: 0,
    byte_count: 0,
    dyno_mode_state: 0,
    ACC_state: 0,
  };
  const [systemDict, setSystemDict] = useState<{ [key: string]: number } | null>(null);
  const displayDict = systemDict || defaultSystemDict;

  // Command dictionary for transmitting commands
  const defaultCommandDict = {
    toggle_dms: 0,
    toggle_dyno: 0,
  };
  const [commandDict, setCommandDict] = useState<{ [key: string]: number }>(defaultCommandDict);

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

  // When a toggle button is pressed, update commandDict and transmit it.
  const handleCommandToggle = (key: "toggle_dms" | "toggle_dyno") => {
    const newCommandDict = { ...commandDict };
    newCommandDict[key] = newCommandDict[key] === 0 ? 1 : 0;
    setCommandDict(newCommandDict);

    // Encode the command dictionary as "key1:val1;key2:val2"
    const msgString = Object.entries(newCommandDict)
      .map(([k, v]) => `${k}:${v}`)
      .join(";");
    const data = msgString.split('').map(c => c.charCodeAt(0));
    const msg = createByteMultiArrayMsg({
      namespace: props.namespace,
      topic: `/leva/initialpose`, // TODO: Figure out how this works? Wrong topic name but correctr output
      // topic: `/leva/autera_rx`,
      data,
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
          <ThreeStatusIndicator dataVal={displayDict["dyno_mode_state"]} />
        </Grid>

        <Grid>
          <Typography>UDP Simulation Status</Typography>
          <TwoStatusIndicator dataVal={displayDict["ACC_state"]} />
        </Grid>

        <Grid>
          <Typography>Request for Dyno Mode</Typography>
          <TwoStatusIndicator dataVal={displayDict["ACC_state"]} />
        </Grid>

        <Grid>
          <Typography>Simulation Active Status</Typography>
          <TwoStatusIndicator dataVal={displayDict["ACC_state"]} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
