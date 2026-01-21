import { Text3D, Center, Environment } from '@react-three/drei';
import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

export default function Experience() {
  const rotatingLight1 = useRef();
  const rotatingLight2 = useRef();
  const { camera } = useThree();
  const [jump, setJump] = useState(false);
  const [jumpY, setJumpY] = useState(0);
  const jumpStart = useRef(null);

  // Remove parallax and touch refs since not needed for light rotation

  /* ---------------- ANIMATION: LIGHTS ROTATE ---------------- */
  useFrame(({ clock }) => {
    camera.position.set(0, 2, 12);
    camera.lookAt(0, 0, 0);

    // Animate two lights rotating back and forth
    const t = clock.getElapsedTime();
    const amplitude = 4; // how far left/right
    const speed = 3.5; // seconds per full swing (slower)
    const phase = Math.sin((t * Math.PI) / speed);
    if (rotatingLight1.current) {
      rotatingLight1.current.position.x = amplitude * phase;
      rotatingLight1.current.position.z =
        10 + Math.cos((t * Math.PI) / speed) * 2;
    }
    if (rotatingLight2.current) {
      rotatingLight2.current.position.x = -amplitude * phase;
      rotatingLight2.current.position.z =
        10 - Math.cos((t * Math.PI) / speed) * 2;
    }

    // Handle jump animation
    if (jump) {
      if (jumpStart.current === null) jumpStart.current = t;
      const jumpElapsed = t - jumpStart.current;
      // Simple jump: up and down in 0.6s
      const duration = 0.6;
      if (jumpElapsed < duration) {
        // Parabola: y = 2h * (t/T) * (1 - t/T), h = max height
        const h = 2.2;
        const progress = jumpElapsed / duration;
        setJumpY(h * 4 * progress * (1 - progress));
      } else {
        setJump(false);
        setJumpY(0);
        jumpStart.current = null;
      }
    }
  });

  return (
    <>
      {/* Soft baseline light for mobile screens */}
      <ambientLight intensity={0.35} />

      {/* Key light (stationary, increased intensity) */}
      <directionalLight position={[5, 5, 5]} intensity={3.5} castShadow />

      {/* Two animated fill lights (reduced intensity) */}
      <directionalLight
        ref={rotatingLight1}
        position={[0, 2, 10]}
        intensity={0.5}
      />
      <directionalLight
        ref={rotatingLight2}
        position={[0, 2, 10]}
        intensity={0.5}
      />

      {/* Needed for metallic readability */}
      <Environment preset="night" />

      <Center position-z={-5} position-y={jumpY}>
        <Text3D
          font="./fonts/Lard_Regular.json"
          size={1.8}
          height={0.35}
          curveSegments={10}
          bevelEnabled
          bevelThickness={0.15}
          bevelSize={0.06}
          letterSpacing={0.12}
          castShadow
          onClick={() => {
            if (!jump) {
              setJump(true);
              jumpStart.current = null;
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          BOOP
          <meshStandardMaterial color="#cccccc" metalness={1} roughness={0.2} />
        </Text3D>
      </Center>
    </>
  );
}
