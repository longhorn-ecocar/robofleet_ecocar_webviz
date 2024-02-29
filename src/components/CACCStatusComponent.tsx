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
  
  export function CACCStatusComponent(props: {
    info_level: number;
    msg: fb.amrl_msgs.CACCStatus
  }) {
    const { msg } = props;

    const classes = useStyles({ card_color: getStatusColor(msg.status()) });
  
    return (
      <Card variant="outlined" className={classes.card}>
        <CardContent className={classes.cardContent}>
          <span className={`${classes.status} ${classes.background}`} />
        </CardContent>
    </Card>
    );

    //<CardContent>
  //   <Typography color="textPrimary" gutterBottom variant="h6">
  //   {msg.sensorid()}
  // </Typography>
  }