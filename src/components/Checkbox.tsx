import { memo, type PropsWithChildren } from 'react';
import { Pressable } from 'react-native';
// import {useToggleState} from 'react-stately'

// const $size = 24;

// Have flow properties like onChange
export const Checkbox = memo(
  (
    props: PropsWithChildren<{
      selected?: boolean;
      onPress?: () => void;
      onChange?: () => void;
    }>
  ) => {
    console.log('LOG: > Checkbox > props:', props);
    //

    return <Pressable onPress={props.onPress}>{props.children}</Pressable>;
  }
);

// const CheckBoxTest = () => {
// const state = useToggleState(props);
//   return (
//     <>
//       <Checkbox>X</Checkbox>
//       <Checkbox>Y</Checkbox>
//     </>
//   );
// };
