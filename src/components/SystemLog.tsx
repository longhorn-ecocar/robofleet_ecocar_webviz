import React from 'react';
import { fb } from '../schema';
import { List, ListItem, ListItemText, makeStyles, Paper } from '@material-ui/core';

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

export const SystemLogComponent = ( props : {
    info_level: number;
    system_logs: fb.amrl_msgs.SystemLog[];
}) => {
  const classes = useStyles();
  const { info_level, system_logs } = props;
  const lastHundredMessages = system_logs.slice(-100); // Get the last 100 messages


  return (
    <Paper elevation={3}>
      <List className={classes.scrollableList}>
        {lastHundredMessages.map((message, idx) => (
          <ListItem key={idx} className={classes.listItem}>
            <ListItemText primary={message.log()} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
;