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
import {getStatusColor} from '../status'
import useRobofleetMsgListener from '../hooks/useRobofleetMsgListener';
import { matchTopicAnyNamespace } from '../util';

const useStyles = makeStyles({
  card: {
    flexGrow: 1,
    height: '100%',
  },
  cardTitle: {
    // height: '4rem', // Set a fixed height
  },
  cardContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center', // Center-align items vertically
    alignItems: 'center', // Center-align items horizontally
  },
  container: {
    display: 'flex', // Display as an inline block
    flexDirection: 'row',
    justifyCdontent: 'space-between', // Distribute space evenly
    alignItems: 'center', // Center-align items horizontally
    maxWidth: '100%',
    marginLeft: "auto"
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

export function StatusIndicator(props: {
  color: string,
  topic: string,
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
      <Card variant="outlined" className={classes.card}>
        <CardContent className={classes.cardContent}>
          <span className={`${classes.status} ${classes.background}`} />
        </CardContent>
      </Card>
    </React.Fragment>
  );
};

function ThreeStatusIndicator(props: {
  info_level: number,
  topic: string,
  }) {
  const {info_level, topic } = props;
  return (
    <React.Fragment>
      <Grid container spacing={2} direction="row" justify = "center">
        <Grid item>
          <StatusIndicator color="gray" topic={topic}/>
        </Grid>
        <Grid item>
        <StatusIndicator color="gray" topic={topic}/>
        </Grid>
        <Grid item>
          <StatusIndicator color="gray" topic={topic}/>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

function TwoStatusIndicator(props: {
  info_level: number,
  topic: string,
  }) {
  const {info_level, topic } = props;
  return (
    <React.Fragment>
      <Grid container spacing={2} direction="row" justify = "center">
        <Grid item>
          <StatusIndicator color="gray" topic={topic}/>
        </Grid>
        <Grid item>
          <StatusIndicator color="gray" topic={topic}/>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export function SystemControlComponent (props: {
  info_level: number;
}) {
  return (
      <React.Fragment>
          <Grid>                      
            <Grid>

              <Typography variant="h6">System Control</Typography>
            
            </Grid>

            <Grid>
              <Typography>Toggle DMS</Typography>
              <ThreeStatusIndicator info_level={1} topic ={'cacc_status'}/>
            </Grid>


            <Grid>
              <Typography>Toggle CAV Dyno</Typography>
              <ThreeStatusIndicator info_level={1} topic={'cacc_status'}/>
            </Grid>


            <Grid>
              <Typography>Object Sim Status</Typography>
              <TwoStatusIndicator info_level={1} topic={'cacc_status'}/>
            </Grid>


            <Grid>
              <Typography>UDP Sim Status</Typography>
              <TwoStatusIndicator info_level={1} topic={'cacc_status'}/>
            </Grid>

          </Grid>                    
          
        </React.Fragment>
  );

}