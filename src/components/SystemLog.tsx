import React, { useState, useCallback } from 'react';
import { fb } from '../schema';
import {
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Paper,
} from '@material-ui/core';
import useRobofleetMsgListener from '../hooks/useRobofleetMsgListener';
import { matchTopicAnyNamespace } from '../util';

const useStyles = makeStyles((theme) => ({
  scrollableList: {
    width: '100%',
    maxHeight: 300, // Adjust the height as needed
    overflow: 'auto',
    backgroundColor: theme.palette.background.paper,
  },
  listItem: {
    borderBottom: '1px solid #ddd', // Optional: adds a line to separate items
  },
}));

// Mock data: An array of 100 message objects
const messages = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  primary: `Message ${i}`,
  secondary: `Details about message ${i}`,
}));

export const SystemLogComponent = (props: { info_level: number }) => {
  const classes = useStyles();
  const [systemLog, setSystemLog] = useState<fb.amrl_msgs.SystemLog[]>([]);
  let lastHundredMessages: fb.amrl_msgs.SystemLog[] = [];
  if (systemLog) {
    lastHundredMessages = systemLog.slice(-100); // Get the last 100 messages
  }

  const updateSystemLog = (status: fb.amrl_msgs.SystemLog) => {
    setSystemLog((prevSystemLog) => [...prevSystemLog, status]);
  };

  useRobofleetMsgListener(
    matchTopicAnyNamespace('system_log'),
    useCallback((buf, match) => {
      const status = fb.amrl_msgs.SystemLog.getRootAsSystemLog(buf);
      updateSystemLog(status);
    }, [])
  );

  return (
    <React.Fragment>
      {systemLog && (
        <Paper elevation={3}>
          <List className={classes.scrollableList}>
            {lastHundredMessages.map((message, idx) => (
              <ListItem key={idx} className={classes.listItem}>
                <ListItemText primary={message.log()} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </React.Fragment>
  );
};
