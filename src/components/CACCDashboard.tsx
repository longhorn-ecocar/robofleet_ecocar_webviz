import React from 'react';
import { Typography, Box } from '@material-ui/core';

interface AdaptiveCruiseControlDashboardProps {
  status: string;
  speed: number;
  leadVehicleDistance?: number;
  caccMileage?: number;
}

const AdaptiveCruiseControlDashboard: React.FC<AdaptiveCruiseControlDashboardProps> = ({
  status,
  speed,
  leadVehicleDistance,
  caccMileage,
}) => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" width="100%">
      {/* Status Section */}
      <Box width="100%" bgcolor="green" color="white" p={1} textAlign="center" mb={2}>
        <Typography>{status}</Typography>
      </Box>

      {/* Lead Vehicle Distance */}
      <Box textAlign="center" mb={1}>
        <Typography variant="subtitle1">Lead Vehicle Distance</Typography>
        <Typography>___ feet</Typography>
      </Box>

      {/* Target Speed */}
      <Box textAlign="center" mb={1}>
        <Typography variant="subtitle1">Target Speed</Typography>
        <Typography>{speed} mph</Typography>
      </Box>

      {/* CACC Mileage */}
      <Box textAlign="center" mb={1}>
        <Typography variant="subtitle1">CACC Mileage</Typography>
        <Typography>___ miles</Typography>
      </Box>
    </Box>
  );
};

export default AdaptiveCruiseControlDashboard;

