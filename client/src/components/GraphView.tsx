/*
 * GraphView — Force-directed graph, Bauhaus style
 * Black nodes, red edges on highlight, white background
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { getGraphData, type GraphNode, type GraphEdge } from "@/lib/notes";

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Mathematics: "#E63946",
  Philosophy: "#0A0A0A",
  Journal: "#666666",
};

interface GraphViewProps {
  width?: number;
  height?: number;
  className?: string;
  interactive?: boolean;
  highlightSlug?: string;
}

export default function GraphView({
  width: propWidth,
  height: propHeight,
  className = "",
  interactive = true,
  highlightSlug
}: GraphViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const animRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: propWidth || 800, height: propHeight || 400 });

  useEffect(() => {
    const { nodes, edges } = getGraphData();
    const w = dimensions.width;
    const h = dimensions.height;

    nodesRef.current = nodes.map(n => ({
      ...n,
      x: w / 2 + (Math.random() - 0.5) * w * 0.5,
      y: h / 2 + (Math.random() - 0.5) * h * 0.5,
      vx: 0,
      vy: 0,
    }));
    edgesRef.current = edges;
  }, [dimensions]);

  useEffect(() => {
    if (!containerRef.current || propWidth) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: Math.max(350, entry.contentRect.height),
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [propWidth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    let running = true;

    function simulate() {
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const w = dimensions.width;
      const h = dimensions.height;
      const nodeMap = new Map(nodes.map(n => [n.id, n]));

      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 1) dist = 1;
          const force = 2000 / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          a.vx -= fx;
          a.vy -= fy;
          b.vx += fx;
          b.vy += fy;
        }
      }

      // Attraction
      for (const edge of edges) {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target) continue;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = (dist - 150) * 0.004;
        const fx = (dx / (dist || 1)) * force;
        const fy = (dy / (dist || 1)) * force;
        source.vx += fx;
        source.vy += fy;
        target.vx -= fx;
        target.vy -= fy;
      }

      // Center gravity
      for (const node of nodes) {
        node.vx += (w / 2 - node.x) * 0.001;
        node.vy += (h / 2 - node.y) * 0.001;
      }

      // Apply
      for (const node of nodes) {
        node.vx *= 0.85;
        node.vy *= 0.85;
        node.x += node.vx;
        node.y += node.vy;
        node.x = Math.max(60, Math.min(w - 60, node.x));
        node.y = Math.max(60, Math.min(h - 60, node.y));
      }

      // Draw
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      // Edges
      for (const edge of edges) {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target) continue;

        const isHighlighted = hoveredNode === edge.source || hoveredNode === edge.target ||
          highlightSlug === edge.source || highlightSlug === edge.target;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = isHighlighted ? "#E63946" : "rgba(10, 10, 10, 0.12)";
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.stroke();
      }

      // Nodes
      for (const node of nodes) {
        const isHovered = hoveredNode === node.id;
        const isHighlighted = highlightSlug === node.id;
        const color = CATEGORY_COLORS[node.category] || "#0A0A0A";
        const radius = 5 + Math.min(node.connections * 2, 10);

        // Node shape: circle for Math, square for Philosophy, diamond for Journal
        ctx.fillStyle = isHovered || isHighlighted ? "#E63946" : color;

        if (node.category === "Philosophy") {
          // Square
          const s = (isHovered || isHighlighted ? radius + 3 : radius) * 1.4;
          ctx.fillRect(node.x - s / 2, node.y - s / 2, s, s);
        } else if (node.category === "Journal") {
          // Diamond (rotated square)
          const s = (isHovered || isHighlighted ? radius + 3 : radius) * 1.2;
          ctx.save();
          ctx.translate(node.x, node.y);
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-s / 2, -s / 2, s, s);
          ctx.restore();
        } else {
          // Circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, isHovered || isHighlighted ? radius + 3 : radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Label
        if (isHovered || isHighlighted || node.connections > 1) {
          ctx.font = `${isHovered || isHighlighted ? '13' : '11'}px 'Space Grotesk', sans-serif`;
          ctx.fillStyle = isHovered || isHighlighted ? "#E63946" : "#0A0A0A";
          ctx.textAlign = "center";
          ctx.fillText(node.title, node.x, node.y - radius - 10);
        }
      }

      if (running) {
        animRef.current = requestAnimationFrame(simulate);
      }
    }

    simulate();

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [dimensions, hoveredNode, highlightSlug]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let found: string | null = null;
    for (const node of nodesRef.current) {
      const radius = 5 + Math.min(node.connections * 2, 10) + 5;
      const dx = node.x - x;
      const dy = node.y - y;
      if (dx * dx + dy * dy < radius * radius) {
        found = node.id;
        break;
      }
    }
    setHoveredNode(found);
    canvas.style.cursor = found ? "pointer" : "default";
  }, [interactive]);

  const handleClick = useCallback(() => {
    if (!interactive || !hoveredNode) return;
    navigate(`/note/${hoveredNode}`);
  }, [interactive, hoveredNode, navigate]);

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ width: propWidth || '100%', height: propHeight || 400 }}>
      <canvas
        ref={canvasRef}
        style={{ width: dimensions.width, height: dimensions.height }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onMouseLeave={() => setHoveredNode(null)}
      />
    </div>
  );
}
