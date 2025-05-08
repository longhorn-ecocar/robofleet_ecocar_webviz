// src/components/SystemControl.tsx
import React, { useState, useCallback, useContext } from 'react';
import { Box, Button, Grid, Typography } from '@material-ui/core';
import { fb } from '../schema';
import { flatbuffers } from 'flatbuffers';
import WebSocketContext from '../contexts/WebSocketContext';
import useRobofleetMsgListener from '../hooks/useRobofleetMsgListener';
import { matchTopicAnyNamespace } from '../util';
import { SignalList, SignalConfig } from './SignalListComponent';

export type ButtonType = 'stateless' | 'stateful';
export interface ButtonConfig {
  name: string;     // label shown to the user
  key: string;      // used in commandDict lookup/send
  type: ButtonType;
}

export interface SystemControlProps {
  title?: string;
  signals: SignalConfig[];    // now each SignalConfig must include a `.key`
  buttons: ButtonConfig[];
  rxTopic: string;
  txTopic: string;
  namespace: string;
}

function createStringMsg({ namespace, topic, data }: { namespace: string; topic: string; data: string }): Uint8Array {
  const fbb = new flatbuffers.Builder();
  const metaOff = fb.MsgMetadata.createMsgMetadata(
    fbb,
    fbb.createString('std_msgs/String'),
    fbb.createString(`${namespace}/${topic}`)
  );
  const dataOff = fbb.createString(data);
  const msgOff = fb.std_msgs.String.createString(fbb, metaOff, dataOff);
  fbb.finish(msgOff);
  return fbb.asUint8Array();
}

export const SystemControlComponent: React.FC<SystemControlProps> = ({
  title = 'System Control',
  signals: initialSignals,
  buttons: buttonConfigs,
  rxTopic,
  txTopic,
  namespace,
}) => {
  const ws = useContext(WebSocketContext);

  // incoming state by key
  const [stateDict, setStateDict] = useState<Record<string, number>>({});
  // outgoing commands by key, initialize to zero
  const [commandDict, setCommandDict] = useState(
    buttonConfigs.reduce((acc, b) => ({ ...acc, [b.key]: 0 }), {} as Record<string, number>)
  );

  // helper to send out the entire commandDict
  const sendCommands = useCallback(
    (newDict: Record<string, number>) => {
      setCommandDict(newDict);
      const payload = Object.entries(newDict).map(([k, v]) => `${k}:${v}`).join(';');
      const msg = createStringMsg({ namespace, topic: txTopic, data: payload });
      console.log('Sending command with topic:', txTopic, 'and payload:', payload);
      if (ws?.connected) ws.ws?.send(msg);
      else console.error('WebSocket not connected');
    },
    [ws, namespace, txTopic]
  );

  // subscribe for incoming messages
  useRobofleetMsgListener(
    matchTopicAnyNamespace(rxTopic),
    useCallback((buf) => {
      const msg = fb.std_msgs.String.getRootAsString(buf);
      const raw = msg.data() as string;
      const parsed: Record<string, number> = {};
      raw.split(';').forEach(pair => {
        const [k, v] = pair.split(':').map(s => s.trim());
        const n = Number(v);
        if (k && !isNaN(n)) parsed[k] = n;
      });
      setStateDict(parsed);
    }, [])
  );

  // stateless = toggle on click
  const handleStateless = (key: string) => {
    const next = { ...commandDict, [key]: commandDict[key] ^ 1 };
    sendCommands(next);
  };
  // stateful = hold down to set 1, release to set 0
  const handleStateful = (key: string, val: number) => {
    const next = { ...commandDict, [key]: val };
    sendCommands(next);
  };

  // inject the live stateDict values into each SignalConfig
  const signals = initialSignals.map(sig => ({
    ...sig,
    // if sig.state was a default number, override from stateDict by key
    state: typeof sig.state === 'number'
      ? (stateDict[sig.key] ?? sig.state)
      : sig.state
  }));

  return (
    <Box p={2}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}

      {/* Buttons */}
      <Box mb={2}>
        <Grid container spacing={2}>
          {buttonConfigs.map(btn => {
            const isStateless = btn.type === 'stateless';
            return (
              <Grid key={btn.key} item>
                <Button
                  variant={isStateless ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={isStateless ? () => handleStateless(btn.key) : undefined}
                  onMouseDown={!isStateless ? () => handleStateful(btn.key, 1) : undefined}
                  onMouseUp={!isStateless ? () => handleStateful(btn.key, 0) : undefined}
                >
                  {btn.name}
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Signals */}
      <SignalList signals={signals} />
    </Box>
  );
};
