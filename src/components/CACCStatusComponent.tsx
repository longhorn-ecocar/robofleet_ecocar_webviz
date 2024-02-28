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
  
  export function cacc_status(props: {
    info_level: number;
    msg: fb.amrl_msgs.CACCStatus
  }) {
    const { msg } = props;
  
    return (
      <Card className={classes.root} variant="outlined">
      <CardContent>
        <Typography color="textPrimary" gutterBottom variant="h6">
            Status: {getStatusColor(msg.status(msg.status()))}
        </Typography>
      </CardContent>
    </Card>
    );

    //<CardContent>
  //   <Typography color="textPrimary" gutterBottom variant="h6">
  //   {msg.sensorid()}
  // </Typography>
  }