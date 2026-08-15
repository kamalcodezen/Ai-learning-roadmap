"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// 16 curated high-resolution AI, Programming Language, and Tech Roadmap imagery
const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=85",
    alt: "Generative AI & LLMs",
    title: "Generative AI & LLMs",
    description: "Master Transformers, fine-tuning, RLHF, and open-source models like Llama 3 with PyTorch.",
    color: "#eb5722",
  },
  {
    src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=85",
    alt: "Modern Full-Stack",
    title: "Modern Full-Stack",
    description: "Build reactive, full-stack AI applications with Next.js 15, React 19 Server Components, and Tailwind.",
    color: "#38d9d4",
  },
  {
    src: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=85",
    alt: "Python Data Science",
    title: "Python Data Science",
    description: "Deep dive into NumPy, Pandas, Scikit-Learn, data modeling, and mathematical foundations of ML.",
    color: "#eb5722",
  },
  {
    src: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&auto=format&fit=crop&q=85",
    alt: "Rust System Safety",
    title: "Rust System Safety",
    description: "High-performance systems programming, memory safety without garbage collection, and async Tokio.",
    color: "#38d9d4",
  },
  {
    src: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=85",
    alt: "Golang Microservices",
    title: "Golang Microservices",
    description: "Design ultra fast gRPC APIs, concurrent microservices with goroutines, and resilient architectures.",
    color: "#eb5722",
  },
  {
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=85",
    alt: "Data Engineering",
    title: "Data Engineering",
    description: "Architect scalable Big Data pipelines using Apache Spark, Kafka, Snowflake, and dbt.",
    color: "#38d9d4",
  },
  {
    src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=85",
    alt: "AI Infrastructure",
    title: "AI Infrastructure",
    description: "Scale distributed GPU clusters, Kubernetes inference servers, and high-throughput vector search engines.",
    color: "#eb5722",
  },
  {
    src: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=85",
    alt: "TypeScript Mastery",
    title: "TypeScript Mastery",
    description: "Advanced generic type systems, AST parsing, monorepos, and enterprise-grade full-stack patterns.",
    color: "#38d9d4",
  },
  {
    src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=85",
    alt: "Cloud & Kubernetes",
    title: "Cloud & Kubernetes",
    description: "Deploy production container clusters, Terraform IaC, Istio service meshes, and CI/CD pipelines.",
    color: "#eb5722",
  },
  {
    src: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=85",
    alt: "AI Agent Workflows",
    title: "AI Agent Workflows",
    description: "Build autonomous multi-agent systems, tool execution chains, and dynamic cognitive architectures.",
    color: "#38d9d4",
  },
  {
    src: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=85",
    alt: "Distributed Systems",
    title: "Distributed Systems",
    description: "Consensus algorithms, Raft, eventual consistency, high-availability caching, and sharding.",
    color: "#eb5722",
  },
  {
    src: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=85",
    alt: "Mobile App AI",
    title: "Mobile App AI",
    description: "On-device CoreML & TensorFlow Lite models integrated with Flutter and modern mobile frameworks.",
    color: "#38d9d4",
  },
  {
    src: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=85",
    alt: "Neural Networks",
    title: "Neural Networks",
    description: "Convolutional, Recurrent, and Diffusion architectures explained from mathematical first principles.",
    color: "#eb5722",
  },
  {
    src: "https://images.unsplash.com/photo-1531482615713-22afd69097998?w=800&auto=format&fit=crop&q=85",
    alt: "Tech Lead Growth",
    title: "Tech Lead Growth",
    description: "Engineering leadership, code review etiquette, system design interviews, and cross-team roadmapping.",
    color: "#38d9d4",
  },
  {
    src: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=85",
    alt: "Neural Security",
    title: "Neural Security",
    description: "Defend against prompt injection, model extraction, and jailbreak vectors with Zero-Trust AI security.",
    color: "#eb5722",
  },
  {
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=85",
    alt: "AI Product Roadmap",
    title: "AI Product Roadmap",
    description: "Turn AI research into viable products with rapid prototyping, evaluation metrics, and user feedback.",
    color: "#38d9d4",
  },
];

// Helper to draw rounded rectangle in 2D canvas
function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Helper to wrap text cleanly in 2D canvas with alignment
function wrapTextCenter(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let currentY = startY;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), centerX, currentY);
      line = words[n] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), centerX, currentY);
  return currentY;
}

// Helper to split title into one word per line format
function getOneWordPerLine(title: string): string[] {
  const rawWords = title.split(" ");
  const lines: string[] = [];
  for (let i = 0; i < rawWords.length; i++) {
    if (rawWords[i] === "&" && lines.length > 0) {
      lines[lines.length - 1] += " &";
    } else if (rawWords[i] === "&" && i + 1 < rawWords.length) {
      lines.push("& " + rawWords[i + 1]);
      i++;
    } else {
      lines.push(rawWords[i]);
    }
  }
  return lines;
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

export default function Endless3DCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 560;

    // ── 1. Renderer Setup ───────────────────────────────────────────────────
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

    // ── 2. Scene & Camera Setup ─────────────────────────────────────────────
    const scene = new THREE.Scene();

    // Camera calibrated with vertical headroom to eliminate any top/bottom clipping
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 0, 0.35);

    // ── 3. Cylinder & Rounded-lg Card Parameters ─────────────────────────────
    const totalCards = SLIDES.length; // 16 cards
    const angleStep = (Math.PI * 2) / totalCards;

    const cardWidth = 1.22;
    const cardHeight = 1.76;
    const cornerRadius = 0.08;
    const cardGap = 0.12;
    const arcSlot = cardWidth + cardGap;
    const radius = (totalCards * arcSlot) / (Math.PI * 2); // R ≈ 3.41

    const carouselGroup = new THREE.Group();
    scene.add(carouselGroup);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    const roundedCardGeometry = createRoundedPlaneGeometry(
      cardWidth,
      cardHeight,
      cornerRadius,
      8,
    );

    // Helper: Single Smooth Authentic Inner Glow (Native Canvas Inset Shadow, zero stepped lines)
    const drawWhiteInnerGlow = (ctx: CanvasRenderingContext2D) => {
      ctx.save();
      // Clip to card rounded rectangle
      drawRoundedRectPath(ctx, 0, 0, 600, 900, 36);
      ctx.clip();

      // 1. Crisp subtle hairline border
      drawRoundedRectPath(ctx, 2, 2, 596, 896, 36);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // 2. True smooth Gaussian Inset Glow (casts inward with ZERO stepped concentric lines)
      ctx.shadowColor = "rgba(255, 255, 255, 0.60)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Stroke just outside the clipped region so only the pure blurred glow bleeds inward
      ctx.strokeStyle = "rgba(0, 0, 0, 1)";
      ctx.lineWidth = 20;
      drawRoundedRectPath(ctx, -10, -10, 620, 920, 46);
      ctx.stroke();

      // Reset shadow blur
      ctx.shadowBlur = 0;

      ctx.restore();
    };

    // Helper: Composite normal resting texture (90px Semibold, ONE word per line, Left Aligned & Vertically Justified Center)
    const createNormalTexture = (
      img: HTMLImageElement | null,
      title: string,
    ) => {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 900;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0c0e14";
        ctx.fillRect(0, 0, 600, 900);

        if (img && img.complete) {
          ctx.drawImage(img, 0, 0, 600, 900);
        }

        // Dark gradient backdrop across middle of card for high contrast
        const gradient = ctx.createLinearGradient(0, 0, 0, 900);
        gradient.addColorStop(0, "rgba(0,0,0,0.30)");
        gradient.addColorStop(0.4, "rgba(0,0,0,0.60)");
        gradient.addColorStop(0.6, "rgba(0,0,0,0.60)");
        gradient.addColorStop(1, "rgba(0,0,0,0.75)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 900);

        // White Inner Glow Effect
        drawWhiteInnerGlow(ctx);

        // 90px Font Weight 400 Text - One word per line, Left Aligned & Vertically Justified in Center
        const lines = getOneWordPerLine(title);
        ctx.fillStyle = "#ffffff";
        const fontSize = lines.length > 3 ? 78 : 90;
        const lineHeight = fontSize + 12;
        ctx.font = `400 ${fontSize}px 'Outfit', sans-serif`;
        ctx.textAlign = "left";
        ctx.shadowColor = "rgba(0,0,0,0.95)";
        ctx.shadowBlur = 16;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        // Position words vertically centered (justify-center) and left aligned
        const centerY = 450;
        const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
        lines.forEach((word, idx) => {
          ctx.fillText(word, 44, startY + idx * lineHeight);
        });

        ctx.shadowBlur = 0;
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    };

    // Helper: Composite hovered texture (2xl Header, Base Details, sm Button, Centered & Justified)
    const createHoverTexture = (
      img: HTMLImageElement | null,
      title: string,
      description: string,
      color: string,
    ) => {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 900;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0c0e14";
        ctx.fillRect(0, 0, 600, 900);

        if (img && img.complete) {
          ctx.drawImage(img, 0, 0, 600, 900);
        }

        // Dark Glassmorphic Backdrop Overlay
        ctx.fillStyle = "rgba(6, 8, 14, 0.92)";
        ctx.fillRect(0, 0, 600, 900);

        // White Inner Glow Effect
        drawWhiteInnerGlow(ctx);

        // ── Text-Align Center & Vertically Justified (justify-center) in Card ──
        ctx.textAlign = "center";

        // Calculate dynamic vertical centering with scaled up typography
        ctx.font = "400 26px 'Outfit', sans-serif";
        const descWords = description.split(" ");
        let lineCount = 1;
        let testLine = "";
        for (let n = 0; n < descWords.length; n++) {
          const l = testLine + descWords[n] + " ";
          if (ctx.measureText(l).width > 500 && n > 0) {
            lineCount++;
            testLine = descWords[n] + " ";
          } else {
            testLine = l;
          }
        }

        const titleH = 52;
        const titleMarginBottom = 36; // Generous margin bottom under header
        const descLineHeight = 38;
        const descH = lineCount * descLineHeight;
        const btnMarginTop = 46;
        const btnW = 270;
        const btnH = 68;
        const btnR = btnH / 2; // rounded-full
        const totalBlockHeight = titleH + titleMarginBottom + descH + btnMarginTop + btnH;
        const startBlockY = 450 - totalBlockHeight / 2;

        // 1. Title in Large Bold Header (48px Semibold)
        const titleY = startBlockY + titleH;
        ctx.fillStyle = "#ffffff";
        ctx.font = "600 48px 'Outfit', sans-serif";
        ctx.fillText(title, 300, titleY);

        // 2. Short Course Detail Description with distinct margin-bottom from header
        const descY = titleY + titleMarginBottom;
        ctx.fillStyle = "rgba(220, 226, 238, 0.95)";
        ctx.font = "400 26px 'Outfit', sans-serif";
        wrapTextCenter(ctx, description, 300, descY, 500, descLineHeight);

        // 3. Extra Prominent Rounded-Full Button (Explore Path) - 270x68px Pill
        const btnX = 300 - btnW / 2;
        const btnY = descY + (lineCount - 1) * descLineHeight + btnMarginTop;

        // Solid Pill Fill (No border)
        drawRoundedRectPath(ctx, btnX, btnY, btnW, btnH, btnR);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        // Perfectly centered Text + Matching Angle Chevron Icon inside button
        ctx.font = "600 24px 'Outfit', sans-serif";
        const btnText = "Explore Path";
        const textMetrics = ctx.measureText(btnText);
        const textWidth = textMetrics.width;
        const iconWidth = 12;
        const gap = 10;
        const totalContentWidth = textWidth + gap + iconWidth;

        const contentStartX = 300 - totalContentWidth / 2;
        const textCenterY = btnY + 43;

        // Draw text
        ctx.textAlign = "left";
        ctx.fillStyle = "#080a0f";
        ctx.fillText(btnText, contentStartX, textCenterY);

        // Draw matching angle-small-right chevron icon
        const iconCenterX = contentStartX + textWidth + gap + 4;
        const iconCenterY = btnY + btnH / 2 + 1;

        ctx.beginPath();
        ctx.strokeStyle = "#080a0f";
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.moveTo(iconCenterX - 4, iconCenterY - 7);
        ctx.lineTo(iconCenterX + 4.5, iconCenterY);
        ctx.lineTo(iconCenterX - 4, iconCenterY + 7);
        ctx.stroke();
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    };

    interface CardMeshInfo {
      rootGroup: THREE.Group;
      baseMesh: THREE.Mesh;
      hoverMesh: THREE.Mesh;
      baseMaterial: THREE.MeshBasicMaterial;
      hoverMaterial: THREE.MeshBasicMaterial;
      normalTex: THREE.CanvasTexture;
      hoverTex: THREE.CanvasTexture;
      currentOpacity: number;
      targetOpacity: number;
      currentScale: number;
      targetScale: number;
    }

    const cardMeshes: CardMeshInfo[] = [];

    SLIDES.forEach((item, i) => {
      const angle = i * angleStep;

      const initialNormalTex = createNormalTexture(null, item.title);
      const initialHoverTex = createHoverTexture(
        null,
        item.title,
        item.description,
        item.color,
      );

      // 1. Base Mesh (Resting State)
      const baseMaterial = new THREE.MeshBasicMaterial({
        map: initialNormalTex,
        side: THREE.DoubleSide,
      });
      const baseMesh = new THREE.Mesh(roundedCardGeometry, baseMaterial);

      // 2. Hover Mesh (Smooth Alpha Dissolve Layer)
      const hoverMaterial = new THREE.MeshBasicMaterial({
        map: initialHoverTex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const hoverMesh = new THREE.Mesh(roundedCardGeometry, hoverMaterial);
      hoverMesh.position.z = 0.005;

      const cardGroup = new THREE.Group();
      cardGroup.position.x = radius * Math.sin(angle);
      cardGroup.position.z = -radius * Math.cos(angle);
      cardGroup.rotation.y = -angle;

      cardGroup.add(baseMesh);
      cardGroup.add(hoverMesh);

      const cardInfo: CardMeshInfo = {
        rootGroup: cardGroup,
        baseMesh,
        hoverMesh,
        baseMaterial,
        hoverMaterial,
        normalTex: initialNormalTex,
        hoverTex: initialHoverTex,
        currentOpacity: 0,
        targetOpacity: 0,
        currentScale: 1,
        targetScale: 1,
      };

      // Preload image & update composites
      const img = new (window as Window & typeof globalThis).Image();
      img.crossOrigin = "anonymous";
      img.src = item.src;
      img.onload = () => {
        cardInfo.normalTex = createNormalTexture(img, item.title);
        cardInfo.hoverTex = createHoverTexture(
          img,
          item.title,
          item.description,
          item.color,
        );
        baseMaterial.map = cardInfo.normalTex;
        baseMaterial.needsUpdate = true;
        hoverMaterial.map = cardInfo.hoverTex;
        hoverMaterial.needsUpdate = true;
      };

      carouselGroup.add(cardGroup);
      cardMeshes.push(cardInfo);
    });

    // ── 4. Interaction Physics & 60fps Smooth Animation Loop ─────────────────
    let currentRotation = 0;
    let targetRotation = 0;
    let dragVelocity = 0;
    let isDragging = false;
    let previousPointerX = 0;
    let lastMoveTime = 0;
    const autoSpeed = 0.0015;
    let isHovered = false;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    let animationFrameId: number;

    const animate = () => {
      // Rotation physics
      if (!isDragging) {
        dragVelocity *= 0.95;
        if (Math.abs(dragVelocity) < 0.00003) {
          dragVelocity = 0;
        }

        if (!isHovered && dragVelocity === 0) {
          targetRotation += autoSpeed;
        } else {
          targetRotation += dragVelocity;
        }

        currentRotation += (targetRotation - currentRotation) * 0.15;
      }

      carouselGroup.rotation.y = currentRotation;

      // ── Smooth 60fps Alpha Fade & Lift Interpolation for Hover ───────────
      for (let i = 0; i < cardMeshes.length; i++) {
        const card = cardMeshes[i];

        // Smoothly interpolate hover overlay opacity
        card.currentOpacity += (card.targetOpacity - card.currentOpacity) * 0.14;
        card.hoverMaterial.opacity = card.currentOpacity;

        // Smoothly scale & lift card slightly when hovered
        card.currentScale += (card.targetScale - card.currentScale) * 0.14;
        card.rootGroup.scale.setScalar(card.currentScale);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // ── 5. Mouse & Touch Interactions with Smooth Raycaster Hover ───────────
    const checkCardHover = (clientX: number, clientY: number) => {
      if (isDragging) return;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const targetMeshes = cardMeshes.map((c) => c.baseMesh);
      const intersects = raycaster.intersectObjects(targetMeshes);

      if (intersects.length > 0) {
        const hitBaseMesh = intersects[0].object as THREE.Mesh;
        for (let i = 0; i < cardMeshes.length; i++) {
          const card = cardMeshes[i];
          if (card.baseMesh === hitBaseMesh) {
            card.targetOpacity = 1;
            card.targetScale = 1.04;
          } else {
            card.targetOpacity = 0;
            card.targetScale = 1;
          }
        }
      } else {
        for (let i = 0; i < cardMeshes.length; i++) {
          cardMeshes[i].targetOpacity = 0;
          cardMeshes[i].targetScale = 1;
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousPointerX = e.clientX;
      lastMoveTime = performance.now();
      dragVelocity = 0;
      renderer.domElement.style.cursor = "grabbing";

      // Reset hover when dragging
      for (let i = 0; i < cardMeshes.length; i++) {
        cardMeshes[i].targetOpacity = 0;
        cardMeshes[i].targetScale = 1;
      }

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
      } else {
        checkCardHover(e.clientX, e.clientY);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDragging = false;
      renderer.domElement.style.cursor = "grab";
      if (renderer.domElement.releasePointerCapture) {
        try {
          renderer.domElement.releasePointerCapture(e.pointerId);
        } catch {
          // already released
        }
      }
      checkCardHover(e.clientX, e.clientY);
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        const delta = (e.deltaX / width) * 2.0;
        targetRotation += delta;
        dragVelocity = delta * 0.5;
      }
    };

    const handleMouseEnter = () => {
      isHovered = true;
    };

    const handleMouseLeave = () => {
      isHovered = false;
      isDragging = false;
      renderer.domElement.style.cursor = "grab";
      for (let i = 0; i < cardMeshes.length; i++) {
        cardMeshes[i].targetOpacity = 0;
        cardMeshes[i].targetScale = 1;
      }
    };

    const domElement = renderer.domElement;
    domElement.style.cursor = "grab";
    domElement.style.touchAction = "none";

    domElement.addEventListener("pointerdown", handlePointerDown);
    domElement.addEventListener("pointermove", handlePointerMove);
    domElement.addEventListener("pointerup", handlePointerUp);
    domElement.addEventListener("pointercancel", handlePointerUp);
    domElement.addEventListener("wheel", handleWheel, { passive: false });
    domElement.addEventListener("mouseenter", handleMouseEnter);
    domElement.addEventListener("mouseleave", handleMouseLeave);

    // ── 6. Responsive Resize Handling ────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight || 560;

      if (width < 640) {
        camera.fov = 66;
      } else if (width < 1024) {
        camera.fov = 58;
      } else if (width < 1440) {
        camera.fov = 52;
      } else {
        camera.fov = 48;
      }

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // ── 7. Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      domElement.removeEventListener("pointerdown", handlePointerDown);
      domElement.removeEventListener("pointermove", handlePointerMove);
      domElement.removeEventListener("pointerup", handlePointerUp);
      domElement.removeEventListener("pointercancel", handlePointerUp);
      domElement.removeEventListener("wheel", handleWheel);
      domElement.removeEventListener("mouseenter", handleMouseEnter);
      domElement.removeEventListener("mouseleave", handleMouseLeave);

      renderer.dispose();
      roundedCardGeometry.dispose();
      cardMeshes.forEach(
        ({ baseMaterial, hoverMaterial, normalTex, hoverTex }) => {
          normalTex.dispose();
          hoverTex.dispose();
          baseMaterial.dispose();
          hoverMaterial.dispose();
        },
      );

      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, []);

  return (
    <div
      className="relative w-full max-w-full select-none py-2 sm:py-4"
      style={{ touchAction: "none" }}
    >
      <div
        ref={containerRef}
        className="w-full h-[420px] sm:h-[480px] md:h-[540px] lg:h-[600px] xl:h-[650px] flex items-center justify-center"
      />
    </div>
  );
}
