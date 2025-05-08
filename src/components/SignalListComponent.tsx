import React from 'react';
import { Box, Typography, useTheme } from '@material-ui/core';

// Define the signal configuration interface
export type SignalType = 'indicator' | 'freeform';

export interface SignalConfig {
  /** Display name on the left */
  name: string;
  /** Unique key for the signal */
  key: string;
  /** Type of rendering */
  type: SignalType;
  /** State value (for indicator: number, for freeform: any displayable) */
  state: number | string;
  /**
   * If indicator: mapping from state to color (e.g., {0: 'red', 1: 'green'})
   * If freeform: ignored
   */
  colors?: Record<string, string>;
}

interface SignalListItemProps {
  config: SignalConfig;
}

const SignalListItem: React.FC<SignalListItemProps> = ({ config }) => {
  const theme = useTheme();
  const { name, type, state, colors = {} } = config;
  let content: React.ReactNode;

  if (type === 'indicator') {
    // Determine color based on state, default to gray
    const color = colors[String(state)] || 'gray';
    content = (
      <Box
        component="span"
        style={{
          display: 'inline-block',
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: color,
          border: `1px solid ${theme.palette.grey[400]}`,
        }}
      />
    );
  } else {
    // Freeform: display the raw state value
    content = <Typography variant="body2">{state}</Typography>;
  }

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      paddingY={0.5}
      paddingX={1}
      marginY={0.5}
      border={1}
      borderColor="grey.300"
      borderRadius={4}
      bgcolor="background.paper"
    >
      <Typography variant="body2" style={{ fontWeight: 500 }}>
        {name}
      </Typography>
      {content}
    </Box>
  );
};

interface SignalListProps {
  signals: SignalConfig[];
}

export const SignalList: React.FC<SignalListProps> = ({ signals }) => (
  <Box>
    {signals.map((sig) => (
      <SignalListItem key={sig.name} config={sig} />
    ))}
  </Box>
);
