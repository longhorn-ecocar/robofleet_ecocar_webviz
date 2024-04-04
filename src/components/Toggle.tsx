import React, { useState } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const CustomCheckbox = ({ label, setToggle }: {setToggle: any, label: string}) => {
  const [checkVal, setCheckVal] = useState<boolean>(true);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setToggle(event.target.checked);
    setCheckVal(event.target.checked);
  };

  return (
    <FormControlLabel
      control={<Checkbox checked={checkVal} onChange={handleChange} />}
      label={label}
    />
  );
};

export default CustomCheckbox;