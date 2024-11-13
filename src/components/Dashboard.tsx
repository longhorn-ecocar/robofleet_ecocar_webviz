import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { fb } from '../schema';
import useRobofleetMsgListener from '../hooks/useRobofleetMsgListener';
import { matchTopicAnyNamespace } from '../util';

const useStyles = makeStyles({
  cardContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  status: {
    height: '30%',
    width: '30%',
    borderRadius: '50%',
  },
  fullscreenOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1300, // Ensure it appears above all other elements
  },
  fullscreenCard: {
    width: '80vw',
    height: '80vh',
  },
});

export function Dashboard() {
  const [fullscreenComponent, setFullscreenComponent] = useState<string | null>(null);

  const handleCardClick = (title: string) => {
    setFullscreenComponent(fullscreenComponent === title ? null : title);
  };

  return (
    <Grid container item spacing={2} direction="column" style={{ height: '100%' }}>
  {/* First Row */}
  <Grid container item spacing={2} xs>
    <Grid item xs={6}>
      <DashboardComponent
        title="Adaptive Cruise"
        info_level={1}
        width="100%"
        height="100%"
        isFullscreen={fullscreenComponent === "Adaptive Cruise"}
        onCardClick={() => handleCardClick("Adaptive Cruise")}
      />
    </Grid>
    <Grid item xs={6}>
      <DashboardComponent
        title="Lane Centering"
        info_level={1}
        width="100%"
        height="100%"
        isFullscreen={fullscreenComponent === "Lane Centering"}
        onCardClick={() => handleCardClick("Lane Centering")}
      />
    </Grid>
  </Grid>

  {/* Second Row */}
  <Grid container item spacing={2} xs>
    <Grid item xs={6}>
      <DashboardComponent
        title="Intersection Navigation"
        info_level={1}
        width="100%"
        height="100%"
        isFullscreen={fullscreenComponent === "Intersection Navigation"}
        onCardClick={() => handleCardClick("Intersection Navigation")}
      />
    </Grid>
    <Grid item xs={6}>
      <DashboardComponent
        title="Automatic Park"
        info_level={1}
        width="100%"
        height="100%"
        isFullscreen={fullscreenComponent === "Automatic Park"}
        onCardClick={() => handleCardClick("Automatic Park")}
      />
    </Grid>
  </Grid>
</Grid>
  )
};


function DashboardComponent(props: {
  title: string;
  info_level: number;
  width: string;
  height: string;
  isFullscreen: boolean;
  onCardClick: () => void;
}) {
  const { title, width, height, isFullscreen, onCardClick } = props;
  const [caccStatus, setCaccStatus] = useState<fb.amrl_msgs.CACCStatus | null>(null);
  const classes = useStyles();

  useRobofleetMsgListener(
    matchTopicAnyNamespace('cacc_status'),
    useCallback((buf) => {
      const status = fb.amrl_msgs.CACCStatus.getRootAsCACCStatus(buf);
      setCaccStatus(status);
    }, [])
  );

  return isFullscreen ? (
    <div className={classes.fullscreenOverlay} onClick={onCardClick}>
      <Card
        variant="outlined"
        className={classes.fullscreenCard}
      >
        <CardContent className={classes.cardContent}>
          <Typography variant="h4" gutterBottom>
            {title}
          </Typography>
        </CardContent>
      </Card>
    </div>
  ) : (
    <Card
      variant="outlined"
      style={{
        width: width,
        height: height,
        cursor: 'pointer',
      }}
      onClick={onCardClick}
    >
      <CardContent className={classes.cardContent}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}
