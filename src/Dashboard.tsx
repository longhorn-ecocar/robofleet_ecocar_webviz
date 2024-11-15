import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { fb } from './schema';
import useRobofleetMsgListener from './hooks/useRobofleetMsgListener';
import AdaptiveCruiseControlDashboard from './components/CACCDashboard';
import LaneCenteringDashboard from './components/LCCDashboard';
import AINDashboard from './components/AINDashboard';
import { matchTopicAnyNamespace } from './util';

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
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, // Ensure it appears above other components within the Dashboard
  },
  fullscreenCard: {
    width: '90%',
    height: '90%',
  },
});

export function Dashboard() {
  const [fullscreenComponent, setFullscreenComponent] = useState<string | null>(null);

  const handleCardClick = (title: string) => {
    setFullscreenComponent(fullscreenComponent === title ? null : title);
  };

  return (
    <Grid container item spacing={2} direction="column" style={{ height: '100%', position: 'relative' }}>
      {/* First Row */}
      <Grid container item spacing={2} xs>
        <Grid item xs={6}>
          <DashboardComponent
            title="Adaptive Cruise"
            info_level={1}
            isFullscreen={fullscreenComponent === "Adaptive Cruise"}
            onCardClick={() => handleCardClick("Adaptive Cruise")}
            renderContent={() => (
              <AdaptiveCruiseControlDashboard
                status="Active"
                speed={60}
              />
            )}
          />
        </Grid>
        <Grid item xs={6}>
          <DashboardComponent
            title="Lane Centering"
            info_level={1}
            isFullscreen={fullscreenComponent === "Lane Centering"}
            onCardClick={() => handleCardClick("Lane Centering")}
            renderContent={(props) => <LaneCenteringDashboard {...props} lanePosition="Centered" />}
          />
        </Grid>
      </Grid>

      {/* Second Row */}
      <Grid container item spacing={2} xs>
        <Grid item xs={6}>
          <DashboardComponent
            title="Intersection Navigation"
            info_level={1}
            isFullscreen={fullscreenComponent === "Intersection Navigation"}
            onCardClick={() => handleCardClick("Intersection Navigation")}
            renderContent={(props) => <AINDashboard {...props} status="Active" trafficSignal="Green" />}
          />
        </Grid>
        <Grid item xs={6}>
          <DashboardComponent
            title="Automatic Park"
            info_level={1}
            isFullscreen={fullscreenComponent === "Automatic Park"}
            onCardClick={() => handleCardClick("Automatic Park")}
            renderContent={(props) => <AINDashboard {...props} status="In Progress" trafficSignal="Red" />}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

function DashboardComponent(props: {
  title: string;
  info_level: number;
  isFullscreen: boolean;
  onCardClick: () => void;
  renderContent: (props: any) => React.ReactNode;
}) {
  const { title, info_level, isFullscreen, onCardClick, renderContent } = props;
  const classes = useStyles();

  return (
    <div
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : '100%',
        backgroundColor: isFullscreen ? 'rgba(0, 0, 0, 0.8)' : 'transparent',
        zIndex: isFullscreen ? 1300 : 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onClick={onCardClick} // Toggle fullscreen on click
    >
      <Card
        variant="outlined"
        style={{
          width: isFullscreen ? '80%' : '100%',
          height: isFullscreen ? '80%' : '100%',
          cursor: 'pointer',
        }}
      >
        <CardContent
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            height: '100%',
          }}
        >
          {/* Title on top */}
          <div style={{ width: '100%', textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
          </div>

          {/* Custom content below title */}
          <div style={{ flex: 1, width: '100%' }}>
            {renderContent({ info_level })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
