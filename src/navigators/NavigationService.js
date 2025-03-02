import * as React from 'react';

export const navigationRef = React.createRef();

export function navigate(name, params) {
  navigationRef.current.navigate(name, params);
}

export function goBack() {
  navigationRef.current.goBack();
}

export function reset(name, index) {
  navigationRef.current.reset({
    index: index,
    routes: [{name: name}],
  });
}
