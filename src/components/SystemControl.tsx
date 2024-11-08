import {
  Card,
  CardContent,
  Typography,
  makeStyles
} from '@material-ui/core';
import React, { useState, useCallback } from "react";
import { fb } from '../schema';
import {getStatusColor} from '../status'
import useRobofleetMsgListener from '../hooks/useRobofleetMsgListener';
import { matchTopicAnyNamespace } from '../util';

const useStyles = makeStyles({
  card: {
    width: 70,
    height: 70, // Set a fixed height
  },
  cardContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center', // Center-align items vertically
    alignItems: 'center', // Center-align items horizontally
  },
  status: {
    height: 30,
    width: 30,
    borderRadius: '50%',
  },
  background: (props: any) => (
    {
      backgroundColor: props.card_color
    }
  )
});

export function SystemControlComponent (props: {
  info_level: number;
}) {
  const [caccStatus, setCaccStatus] = useState<fb.amrl_msgs.CACCStatus | null>(null)

  let classes = useStyles({ card_color: "red" });
  classes = useStyles({ card_color: getStatusColor(caccStatus == null ? 0 : caccStatus.status()) });

  useRobofleetMsgListener(
      matchTopicAnyNamespace('cacc_status'),
      useCallback(
          (buf, match) => {
              const status = fb.amrl_msgs.CACCStatus.getRootAsCACCStatus(
                  buf
              );
              setCaccStatus(status)
          },
          [caccStatus]
      )
  );

  return (
      <React.Fragment>
          {caccStatus && 
              <Card variant="outlined" className={classes.card}>
                  <CardContent className={classes.cardContent}>
                  <span className={`${classes.status} ${classes.background}`} />
                  </CardContent>
              </Card>
          }
      </React.Fragment>
  );

  //<CardContent>
//   <Typography color="textPrimary" gutterBottom variant="h6">
//   {msg.sensorid()}
// </Typography>
}