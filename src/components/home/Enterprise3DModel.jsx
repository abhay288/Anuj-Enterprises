import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Enterprise3DModel = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Crisp Professional Lighting (No Yellow)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 3.2); // Electric Cyan Light
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x1d4ed8, 2.5); // Deep Sapphire Blue Light
    dirLight2.position.set(-5, -5, 5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x60a5fa, 3, 15);
    pointLight.position.set(0, 0, 4);
    scene.add(pointLight);

    // 3D Enterprise Object Group
    const enterpriseGroup = new THREE.Group();
    scene.add(enterpriseGroup);

    // Central Core Sculpture - High-Tech Liquid Chrome Metallic Finish
    const coreGeo = new THREE.TorusKnotGeometry(1.6, 0.42, 120, 16);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1, // Chrome Silver
      emissive: 0x1e3a8a, // Deep Sapphire Underglow
      emissiveIntensity: 0.2,
      roughness: 0.05,
      metalness: 0.95,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    enterpriseGroup.add(coreMesh);

    // Geodesic Cage - Bright Cyan Wireframe
    const cageGeo = new THREE.IcosahedronGeometry(2.8, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, // Vibrant Electric Cyan
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    enterpriseGroup.add(cageMesh);

    // Orbiting Spheres (Platinum Silver & Sapphire Blue)
    const nodeGroup = new THREE.Group();
    const sphereGeo = new THREE.SphereGeometry(0.24, 16, 16);
    
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const isSilver = i % 2 === 0;
      const sphereMat = new THREE.MeshStandardMaterial({
        color: isSilver ? 0xf8fafc : 0x3b82f6,
        emissive: isSilver ? 0x94a3b8 : 0x1d4ed8,
        emissiveIntensity: 0.3,
        metalness: 0.9,
        roughness: 0.1,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(Math.cos(angle) * 3.2, Math.sin(i * 1.5) * 0.8, Math.sin(angle) * 3.2);
      nodeGroup.add(sphere);
    }
    enterpriseGroup.add(nodeGroup);

    // Floating Diamond & Cyan Sparkle Particle Cloud
    const particleCount = 130;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      mouseX = x * 0.001;
      mouseY = y * 0.001;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      enterpriseGroup.rotation.y += 0.009;
      coreMesh.rotation.x += 0.012;
      coreMesh.rotation.z += 0.006;
      nodeGroup.rotation.y -= 0.016;
      cageMesh.rotation.y -= 0.004;

      targetRotationX += (mouseY - targetRotationX) * 0.05;
      targetRotationY += (mouseX - targetRotationY) * 0.05;

      enterpriseGroup.rotation.x = targetRotationX;
      enterpriseGroup.rotation.z = -targetRotationY * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[420px] overflow-hidden flex items-center justify-center">
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
