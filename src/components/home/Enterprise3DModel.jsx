import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const Enterprise3DModel = () => {
  const mountRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Respect user reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Dimensions
    const width = container.clientWidth || 450;
    const height = container.clientHeight || 400;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: window.devicePixelRatio < 2, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);
    setIsLoaded(true);

    // Crisp Professional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 3.2); // Electric Cyan
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x1d4ed8, 2.5); // Deep Sapphire
    dirLight2.position.set(-5, -5, 5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x60a5fa, 2.5, 15);
    pointLight.position.set(0, 0, 4);
    scene.add(pointLight);

    // 3D Enterprise Object Group
    const enterpriseGroup = new THREE.Group();
    scene.add(enterpriseGroup);

    // Central Core Sculpture
    const coreGeo = new THREE.TorusKnotGeometry(1.6, 0.42, 80, 12); // Optimized segment count for high FPS
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.2,
      roughness: 0.05,
      metalness: 0.95,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    enterpriseGroup.add(coreMesh);

    // Geodesic Cage - Bright Cyan Wireframe
    const cageGeo = new THREE.IcosahedronGeometry(2.8, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    enterpriseGroup.add(cageMesh);

    // Orbiting Spheres
    const nodeGroup = new THREE.Group();
    const sphereGeo = new THREE.SphereGeometry(0.24, 12, 12);
    
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

    container.addEventListener('mousemove', handleMouseMove, { passive: true });

    // IntersectionObserver: Pause rendering when off-screen to save CPU / GPU
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // Animation Loop with Visibility & Reduced-Motion Gating
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return; // Zero CPU cost when scrolled out of view!

      if (!prefersReducedMotion) {
        enterpriseGroup.rotation.y += 0.007;
        coreMesh.rotation.x += 0.009;
        coreMesh.rotation.z += 0.005;
        nodeGroup.rotation.y -= 0.012;
        cageMesh.rotation.y -= 0.003;

        targetRotationX += (mouseY - targetRotationX) * 0.05;
        targetRotationY += (mouseX - targetRotationY) * 0.05;

        enterpriseGroup.rotation.x = targetRotationX;
        enterpriseGroup.rotation.z = -targetRotationY * 0.5;
      }

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

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      
      // Explicit Geometry & Material Disposal
      coreGeo.dispose();
      coreMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      sphereGeo.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[380px] sm:h-[420px] overflow-hidden flex items-center justify-center">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 rounded-3xl backdrop-blur-sm animate-pulse">
          <span className="text-xs font-bold text-amber-400">Loading 3D Supply Chain Model...</span>
        </div>
      )}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
export default Enterprise3DModel;
