import {
    Box,
    makeStyles
  } from '@material-ui/core';
  import React from "react";
  import { fb } from '../schema';
  import {getStatusColor} from '../status'
  import BEVMockup from '../../public/BEVMockup.png'; // Adjust the path accordingly
  
  const useStyles = makeStyles({
    root: () => ({
        height: '50%', // set your desired height
        width: '50%', // set your desired width
    }),
  });
  
  export function VehicleMonitorComponent(props: {
    info_level: number;
    // msg: fb.amrl_msgs.SensorStatus;
  }) {
    const classes = useStyles({});

    return (
        <Box
            component="img"
            className={classes.root}
            alt="Filler Bird's Eye View Image"
            src={`${process.env.PUBLIC_URL}/BEVMockup.png`}
        />
    );
  }