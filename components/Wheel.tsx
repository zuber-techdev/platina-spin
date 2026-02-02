import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Member } from '../types';

interface WheelProps {
  members: Member[];
  onSpinEnd: (member: Member) => void;
  isSpinning: boolean;
}

const Wheel: React.FC<WheelProps> = ({ members, onSpinEnd, isSpinning }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef({
    isSpinning: false,
    startTime: 0,
    startRotation: 0,
    targetRotation: 0,
    duration: 5000,
  });
  const wheelMeshRef = useRef<THREE.Mesh>(null);
  const frameIdRef = useRef<number>(0);

  // Easing function: easeOutQuart
  const easeOutQuart = (x: number): number => {
    return 1 - Math.pow(1 - x, 4);
  };

  // Create texture from members
  const createWheelTexture = (members: Member[]) => {
    const canvas = document.createElement('canvas');
    const size = 1024; // High resolution
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10; // Margin

    ctx.clearRect(0, 0, size, size);

    const step = (Math.PI * 2) / members.length;

    members.forEach((member, i) => {
      const startAngle = i * step;
      const endAngle = (i + 1) * step;

      // Draw Slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = member.color;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Draw Text
      ctx.save();
      ctx.translate(centerX, centerY);
      const textAngle = startAngle + step / 2;
      ctx.rotate(textAngle);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      
      // Dynamic font size based on number of members
      const fontSize = members.length > 20 ? 24 : 40;
      ctx.font = `bold ${fontSize}px Inter, sans-serif`;
      
      // Truncate text if needed
      const maxTextWidth = radius * 0.75;
      let textToDraw = member.name;
      if (ctx.measureText(textToDraw).width > maxTextWidth) {
         // Simple truncation
         while (ctx.measureText(textToDraw + '...').width > maxTextWidth && textToDraw.length > 0) {
            textToDraw = textToDraw.slice(0, -1);
         }
         textToDraw += '...';
      }
      
      ctx.fillText(textToDraw, radius - 40, 0);

      ctx.restore();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    // Texture mapping needs to align with cylinder rotation
    texture.center.set(0.5, 0.5);
    texture.rotation = -Math.PI / 2; // Adjust texture rotation to align index 0 with 3 o'clock appropriately
    
    return texture;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // SCENE
    const width = 500;
    const height = 500;
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background
    
    // CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 14); // Look from top (Z-axis in our rotated world)

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 10);
    scene.add(dirLight);

    // WHEEL MESH
    const geometry = new THREE.CylinderGeometry(5, 5, 0.4, 64);
    // Rotate geometry so the flat side faces Z
    geometry.rotateX(Math.PI / 2);
    
    const sideMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.5 });
    
    // Initial Texture
    let texture = createWheelTexture(members);
    const faceMaterial = new THREE.MeshBasicMaterial({ map: texture }); // Basic for bright colors
    
    // Material array: [side, top, bottom] -> Cylinder usually has [side, top, bottom]
    const materials = [sideMaterial, faceMaterial, sideMaterial];
    
    const wheel = new THREE.Mesh(geometry, materials);
    wheel.rotation.z = 0;
    scene.add(wheel);
    (wheelMeshRef as any).current = wheel;

    // POINTER (Static)
    const pointerGeo = new THREE.ConeGeometry(0.4, 1, 32);
    const pointerMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.2 });
    const pointer = new THREE.Mesh(pointerGeo, pointerMat);
    pointer.position.set(0, 5.5, 0.2); // Top of wheel, slightly above face
    pointer.rotation.z = Math.PI; // Point down
    scene.add(pointer);

    // Shadow plane
    const shadowGeo = new THREE.CircleGeometry(5.2, 64);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.1 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.z = -0.5;
    scene.add(shadow);


    // ANIMATION LOOP
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      if (spinRef.current.isSpinning && wheelMeshRef.current) {
        const now = performance.now();
        const elapsed = now - spinRef.current.startTime;
        const progress = Math.min(elapsed / spinRef.current.duration, 1);
        const ease = easeOutQuart(progress);

        const currentRot =
          spinRef.current.startRotation +
          (spinRef.current.targetRotation - spinRef.current.startRotation) * ease;

        wheelMeshRef.current.rotation.z = currentRot;

        if (progress >= 1) {
          spinRef.current.isSpinning = false;
          
          // Calculate Result
          // Pointer is at Top (PI/2).
          // Normalized Rotation
          const r = currentRot % (Math.PI * 2);
          
          // Angle on texture under pointer (Top)
          // Texture was rotated -PI/2.
          // Let's deduce:
          // Visual 0 is at 3 o'clock (standard canvas).
          // If rot=0, 3 o'clock is at 3 o'clock world.
          // Pointer is at 12 o'clock world (PI/2).
          // Angle diff = PI/2 - 0 = PI/2.
          // So Index = floor((PI/2) / step).
          
          let angleUnderPointer = (Math.PI / 2 - r) % (Math.PI * 2);
          if (angleUnderPointer < 0) angleUnderPointer += Math.PI * 2;
          
          const step = (Math.PI * 2) / members.length;
          const index = Math.floor(angleUnderPointer / step);
          const safeIndex = Math.min(Math.max(0, index), members.length - 1);
          
          onSpinEnd(members[safeIndex]);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // CLEANUP
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      sideMaterial.dispose();
      faceMaterial.dispose();
      if (texture) texture.dispose();
      renderer.dispose();
    };
  }, [members, onSpinEnd]); // Re-run if members change

  // Watch for spin trigger
  useEffect(() => {
    if (isSpinning && !spinRef.current.isSpinning && wheelMeshRef.current) {
      const currentRot = wheelMeshRef.current.rotation.z;
      
      // Calculate a target that lands somewhere random
      // 5 to 8 full rotations
      const extraSpins = Math.PI * 2 * (5 + Math.random() * 3); 
      // Add random offset for result
      const randomOffset = Math.random() * Math.PI * 2;
      
      spinRef.current = {
        isSpinning: true,
        startTime: performance.now(),
        startRotation: currentRot,
        targetRotation: currentRot + extraSpins + randomOffset,
        duration: 5000,
      };
    }
  }, [isSpinning]);

  return (
    <div className="relative flex flex-col items-center justify-center animate-wheel-entrance">
      <div 
        ref={mountRef} 
        className="w-[500px] h-[500px] flex items-center justify-center"
        aria-label="3D Spin Wheel"
      />
      {/* Center Decoration (Overlay) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-inner border-4 border-gray-100 z-10 flex items-center justify-center pointer-events-none">
        <div className="text-xs font-bold text-gray-400">BNI</div>
      </div>
    </div>
  );
};

export default Wheel;
