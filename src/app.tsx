import React from 'react';
import { AudioInputListener } from './audioInputListener';

export const App: React.FC = props => {
  return <div>
    <h1>This is the root of your new React app! :)</h1>
    <AudioInputListener />
  </div>
};