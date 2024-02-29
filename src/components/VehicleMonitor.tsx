import {
    Card,
    CardMedia,
    makeStyles
  } from '@material-ui/core';
  import React, { useEffect, useRef, useState } from "react";
  import { fb } from '../schema';
  import {getStatusColor} from '../status'
  // import BEVMockup from '../assets/BEVMockup.png'; // Adjust the path accordingly
  
  const useStyles = makeStyles({
    card: {
      maxWidth: '100%', // Set the maximum width of the card
      height: 'auto', // Height of the card should adjust to the content
    },
    media: {
      width: '100%', // Image takes full width of the card
      paddingTop: '100%', // Aspect ratio padding trick for 16:9
      backgroundSize: 'contain', // Contain the background image fully within the card
      backgroundRepeat: 'no-repeat', // Do not repeat the background image
      backgroundPosition: 'center', // Center the background image within the card
    },
  });
  
  
  
  export function VehicleMonitorComponent(props: {
    info_level: number;
    msg: fb.sensor_msgs.CompressedImage;
  }) {
    const classes = useStyles({});
    const { info_level, msg } = props;

    const canvas = useRef<HTMLCanvasElement>(null);
    const [size, setSize] = useState([0, 0]);

    useEffect(() => {
      (async () => {
        if (canvas.current === null) return;
        const ctx = canvas.current.getContext('2d');
        if (ctx === null) return;
  
        // const ci = fb.sensor_msgs.CompressedImage.getRootAsCompressedImage(
        //   props.data
        // );
        const blob = new Blob([msg.dataArray() ?? new Uint8Array()], {
          type: `image/${msg.format()}`,
        });
        const bmp = await window.createImageBitmap(blob);
        if (size[0] !== bmp.width || size[1] !== bmp.height)
          setSize([bmp.width, bmp.height]);
  
        ctx.clearRect(0, 0, size[0], size[1]);
        ctx.drawImage(bmp, 0, 0);
      })();
    });

    return (
      <canvas
        ref={canvas}
        width={size[0]}
        height={size[1]}
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
      // <Card className={classes.card}>
      //   <CardMedia
      //     className={classes.media}
      //     image={imageSrc}
      //   />
      //   {/* You can add more content here if needed */}
      // </Card>
    );
  }