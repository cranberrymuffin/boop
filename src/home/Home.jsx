import React from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';
import './home.css'; // Your general styles

export default function Home() {
  return (
    <div>
      <div id="home">
        <Canvas>
          <color attach="background" args={['black']} />
          <Experience />
        </Canvas>
      </div>
    </div>
  );
}
