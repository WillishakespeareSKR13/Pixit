import { FC } from 'react';
import InputCheckbox from './inputCheckbox';
import InputSelect from './inputSelect';
import InputDragDrop from './inputDragDrop';
import InputText from './inputText';
import { AtomInputTypes } from './types';
import InputDate from './inputDate';

const Input: FC<AtomInputTypes> = (props) => {
  const { type } = props;
  switch (type) {
    case `checkbox`:
      return <InputCheckbox {...props} />;
    case `select`:
      return <InputSelect {...props} />;
    case `dragdrop`:
      return <InputDragDrop {...props} />;
    case `date`:
      return <InputDate {...props} />;
    default:
      return <InputText {...props} />;
  }
};

export default Input;
