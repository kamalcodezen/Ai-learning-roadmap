"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface CurvedCarouselSlide {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

export interface CurvedCarouselProps {
  slides: CurvedCarouselSlide[];
  className?: string;
  // Ignore these props to maintain backward compatibility with AudienceBanner
  radius?: number;
  perspective?: number;
  cardWidth?: string;
}

// Helper to create rounded-lg plane geometry in Three.js with normalized UVs
function createRoundedPlaneGeometry(
  width: number,
  height: number,
  radius: number,
  segments: number = 8,
) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const w = width;
  const h = height;
  const r = Math.min(radius, w / 2, h / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  const geometry = new THREE.ShapeGeometry(shape, segments);
  const pos = geometry.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    uvs[i * 2] = (px - x) / w;
    uvs[i * 2 + 1] = (py - y) / h;
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

export default function CurvedCarousel({ slides, className }: CurvedCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || slides.length === 0) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 560;

    let displaySlides = [...slides];
    // Increase the minimum number of cards from 14 to 26. 
    // More cards = larger cylinder radius = much flatter curve!
    while (displaySlides.length < 26) {
      displaySlides = [...displaySlides, ...slides];
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const totalCards = displaySlides.length;
    const angleStep = (Math.PI * 2) / totalCards;

    const cardWidth = 1.22;
    const cardHeight = 1.76;
    const cornerRadius = 0.08;
    const cardGap = 0.12;
    const arcSlot = cardWidth + cardGap;
    const radius = (totalCards * arcSlot) / (Math.PI * 2);

    const camera = new THREE.PerspectiveCamera(24, width / height, 0.1, 100);
    // Dynamically position the camera to maintain exactly 8.0 units of distance 
    // from the front card to act as a telephoto lens and prevent edge distortion.
    camera.position.set(0, 0, -radius + 8.0);

    const carouselGroup = new THREE.Group();
    scene.add(carouselGroup);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const roundedCardGeometry = createRoundedPlaneGeometry(cardWidth, cardHeight, cornerRadius, 8);

    // Create a texture from the image directly (no canvas overlay)
    const loadTexture = (src: string) => {
      const tex = new THREE.TextureLoader().load(src);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    };

    displaySlides.forEach((item, i) => {
      const angle = i * angleStep;

      // Ensure no external coloring or emissive effects
      const material = new THREE.MeshBasicMaterial({
        map: loadTexture(item.src),
        side: THREE.DoubleSide,
        color: 0xffffff,
      });

      const mesh = new THREE.Mesh(roundedCardGeometry, material);
      mesh.position.x = radius * Math.sin(angle);
      mesh.position.z = -radius * Math.cos(angle);
      mesh.rotation.y = -angle;

      carouselGroup.add(mesh);
    });

    // ── Interaction Physics & Loop ─────────────────
    let currentRotation = 0;
    let targetRotation = 0;
    let dragVelocity = 0;
    let isDragging = false;
    let previousPointerX = 0;
    let lastMoveTime = 0;
    const autoSpeed = 0.0015;

    let animationFrameId: number;

    const animate = () => {
      if (!isDragging) {
        dragVelocity *= 0.95;
        if (Math.abs(dragVelocity) < 0.00003) {
          dragVelocity = 0;
        }

        if (dragVelocity === 0) {
          targetRotation += autoSpeed;
        } else {
          targetRotation += dragVelocity;
        }

        currentRotation += (targetRotation - currentRotation) * 0.15;
      }

      carouselGroup.rotation.y = currentRotation;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // ── Mouse & Touch Interactions ───────────
    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousPointerX = e.clientX;
      lastMoveTime = performance.now();
      dragVelocity = 0;
      renderer.domElement.style.cursor = "grabbing";
      if (renderer.domElement.setPointerCapture) {
        renderer.domElement.setPointerCapture(e.pointerId);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const now = performance.now();
        const deltaX = e.clientX - previousPointerX;
        const dt = Math.max(now - lastMoveTime, 8);
        previousPointerX = e.clientX;
        lastMoveTime = now;

        const sensitivity = 2.4;
        const rotationDelta = -(deltaX / width) * sensitivity;

        targetRotation += rotationDelta;
        currentRotation += rotationDelta;

        dragVelocity = (rotationDelta / dt) * 16.6;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDragging = false;
      renderer.domElement.style.cursor = "grab";
      if (renderer.domElement.releasePointerCapture) {
        try {
          renderer.domElement.releasePointerCapture(e.pointerId);
        } catch {}
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        const delta = (e.deltaX / width) * 2.0;
        targetRotation += delta;
        dragVelocity = delta * 0.5;
      }
    };

    const handleMouseLeave = () => {
      isDragging = false;
      renderer.domElement.style.cursor = "grab";
    };

    // ── Global Scroll Velocity ────────────────────────────────
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      // Add velocity based on scroll direction & speed
      dragVelocity += (deltaY / window.innerHeight) * 0.2;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const domElement = renderer.domElement;
    domElement.style.cursor = "grab";
    domElement.style.touchAction = "none";

    domElement.addEventListener("pointerdown", handlePointerDown);
    domElement.addEventListener("pointermove", handlePointerMove);
    domElement.addEventListener("pointerup", handlePointerUp);
    domElement.addEventListener("pointercancel", handlePointerUp);
    domElement.addEventListener("wheel", handleWheel, { passive: false });
    domElement.addEventListener("mouseleave", handleMouseLeave);

    // ── Responsive Resize Handling ────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight || 560;

      if (width < 640) {
        camera.fov = 18;
      } else if (width < 1024) {
        camera.fov = 22;
      } else if (width < 1440) {
        camera.fov = 26;
      } else {
        camera.fov = 24;
      }

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);

      domElement.removeEventListener("pointerdown", handlePointerDown);
      domElement.removeEventListener("pointermove", handlePointerMove);
      domElement.removeEventListener("pointerup", handlePointerUp);
      domElement.removeEventListener("pointercancel", handlePointerUp);
      domElement.removeEventListener("wheel", handleWheel);
      domElement.removeEventListener("mouseleave", handleMouseLeave);

      renderer.dispose();
      roundedCardGeometry.dispose();
      
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [slides]);

  return (
    <div
      className={cn("relative w-full max-w-full select-none -mt-4 sm:-mt-8", className)}
      style={{ touchAction: "none" }}
    >
      <div
        ref={containerRef}
        className="w-full h-[460px] sm:h-[480px] md:h-[500px] lg:h-[540px] xl:h-[580px] flex items-center justify-center"
      />
    </div>
  );
}
