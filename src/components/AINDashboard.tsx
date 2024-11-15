import React from 'react';
import { Typography, Box } from '@material-ui/core';

interface AINDashboardProps {
  status: string;
}

const  AINDashboard: React.FC<AINDashboardProps> = ({ status }) => {
  return (
    <Box>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgcolor="green"
        color="white"
        p={1}
        my={1}
      >
        <Typography>{status}</Typography>
      </Box>
      <Typography variant="h6">Traffic State</Typography>
      <Box display="flex" justifyContent="space-around" mt={2}>
        <Box
          width={24}
          height={24}
          bgcolor="green"
          borderRadius="50%"
        />
        <Box
          width={24}
          height={24}
          bgcolor="yellow"
          borderRadius="50%"
        />
        <Box
          width={24}
          height={24}
          bgcolor="red"
          borderRadius="50%"
        />
      </Box>
    </Box>
  );
};

export default  AINDashboard;

