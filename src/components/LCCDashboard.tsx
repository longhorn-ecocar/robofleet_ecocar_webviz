import React from 'react';
import { Typography } from '@material-ui/core';

interface LaneCenteringDashboardProps {
  lanePosition: string;
}

const LaneCenteringDashboard: React.FC<LaneCenteringDashboardProps> = ({ lanePosition }) => {
  return (
    <div>
      <Typography>Lane Position: {lanePosition}</Typography>
    </div>
  );
};

export default LaneCenteringDashboard;
