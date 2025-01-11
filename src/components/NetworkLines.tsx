import { useEffect, useRef, useState } from 'react';

interface Node {
  id: number;
  x: number;
  y: number;
  connections: number[];
  element: HTMLElement;
}

interface Line {
  from: number;
  to: number;
  isActive: boolean;
  element: HTMLDivElement;
}

export const NetworkLines = () => {
  const linesRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [lines, setLines] = useState<Line[]>([]);

  // Find path between two nodes using BFS
  const findPath = (start: number, end: number, nodes: Node[]): number[] => {
    const visited = new Set<number>();
    const queue: { node: number; path: number[] }[] = [{ node: start, path: [start] }];
    visited.add(start);

    while (queue.length > 0) {
      const { node, path } = queue.shift()!;
      if (node === end) return path;

      const currentNode = nodes[node];
      for (const neighbor of currentNode.connections) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ node: neighbor, path: [...path, neighbor] });
        }
      }
    }
    return [];
  };

  // Start a new path traversal
  const startNewPath = () => {
    if (nodes.length < 2) return;
    const start = Math.floor(Math.random() * nodes.length);
    let end = Math.floor(Math.random() * nodes.length);
    while (end === start) {
      end = Math.floor(Math.random() * nodes.length);
    }

    const path = findPath(start, end, nodes);
    if (path.length === 0) {
      // If no path found, try again with different nodes
      setTimeout(startNewPath, 100);
      return;
    }

    // Reset all lines and nodes
    lines.forEach(line => {
      line.element.classList.remove('active');
      line.isActive = false;
    });
    nodes.forEach(node => {
      node.element.classList.remove('active');
    });

    // Animate path
    path.forEach((_, index) => {
      if (index < path.length - 1) {
        setTimeout(() => {
          // Activate all nodes and lines in the path simultaneously
          path.forEach(pathNodeId => {
            nodes[pathNodeId].element.classList.add('active');
          });

          // Activate all lines in the path
          for (let i = 0; i < path.length - 1; i++) {
            const currentLine = lines.find(
              line => (line.from === path[i] && line.to === path[i + 1]) || (line.from === path[i + 1] && line.to === path[i])
            );
            if (currentLine) {
              currentLine.element.classList.add('active');
              currentLine.isActive = true;
            }
          }
        }, 0);

        // Deactivate everything after 100ms
        setTimeout(() => {
          path.forEach(pathNodeId => {
            nodes[pathNodeId].element.classList.remove('active');
          });
          lines.forEach(line => {
            line.element.classList.remove('active');
            line.isActive = false;
          });
        }, 300);
      }
    });

    // Start new path after a short delay
    setTimeout(() => {
      startNewPath();
    }, 800);
  };

  useEffect(() => {
    const linesContainer = linesRef.current;
    if (!linesContainer) return;

    // Function to initialize network
    const initializeNetwork = () => {
      const nodeElements = document.querySelectorAll('.node');
      if (nodeElements.length === 0) return false;

      // Initialize nodes
      const newNodes: Node[] = Array.from(nodeElements).map((node, id) => {
        const rect = node.getBoundingClientRect();
        // Get the actual center position of the node
        return {
          id,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          connections: [],
          element: node as HTMLElement,
        };
      });

      // Create connections and lines
      const newLines: Line[] = [];
      const maxConnectionsPerNode = 5; // Increased max connections
      const maxDistance = 400; // Increased connection distance

      newNodes.forEach((node1, i) => {
        // Find potential connections
        const potentialConnections = newNodes
          .map((node2, j) => ({
            index: j,
            distance: Math.sqrt(Math.pow(node2.x - node1.x, 2) + Math.pow(node2.y - node1.y, 2)),
          }))
          .filter(
            ({ index, distance }) =>
              index !== i && // Don't connect to self
              distance < maxDistance && // Within max distance
              !node1.connections.includes(index) && // Not already connected
              newNodes[index].connections.length < maxConnectionsPerNode // Target node has room
          )
          .sort((a, b) => a.distance - b.distance) // Connect to closest nodes first
          .slice(0, maxConnectionsPerNode - node1.connections.length);

        potentialConnections.forEach(({ index: j, distance }) => {
          if (node1.connections.length < maxConnectionsPerNode && newNodes[j].connections.length < maxConnectionsPerNode) {
            node1.connections.push(j);
            newNodes[j].connections.push(i);

            const line = document.createElement('div');
            line.className = 'line';

            line.style.width = `${distance}px`;
            line.style.left = `${node1.x}px`;
            line.style.top = `${node1.y}px`;
            line.style.transform = `rotate(${(Math.atan2(newNodes[j].y - node1.y, newNodes[j].x - node1.x) * 180) / Math.PI}deg)`;

            linesContainer.appendChild(line);
            newLines.push({ from: i, to: j, isActive: false, element: line });
          }
        });
      });

      setNodes(newNodes);
      setLines(newLines);

      return true;
    };

    // Create observer for watching nodes
    const observer = new MutationObserver(_ => {
      if (initializeNetwork()) {
        observer.disconnect();
      }
    });

    // Try to initialize immediately in case nodes are already present
    if (!initializeNetwork()) {
      // If nodes aren't present, start observing for them
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    } else {
      observer.disconnect();
    }

    // Create resize handler
    const handleResize = () => {
      const currentNodeElements = document.querySelectorAll('.node');
      if (currentNodeElements.length === 0) return;

      const updatedNodes = Array.from(currentNodeElements).map((node, id) => {
        const rect = node.getBoundingClientRect();
        return {
          ...nodes[id],
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      });

      // Update line positions
      lines.forEach(line => {
        const node1 = updatedNodes[line.from];
        const node2 = updatedNodes[line.to];
        const length = Math.sqrt(Math.pow(node2.x - node1.x, 2) + Math.pow(node2.y - node1.y, 2));
        const angle = (Math.atan2(node2.y - node1.y, node2.x - node1.x) * 180) / Math.PI;

        line.element.style.width = `${length}px`;
        line.element.style.left = `${node1.x}px`;
        line.element.style.top = `${node1.y}px`;
        line.element.style.transform = `rotate(${angle}deg)`;
      });

      setNodes(updatedNodes);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Ensure animation starts when nodes and lines are ready
  useEffect(() => {
    if (nodes.length > 0 && lines.length > 0) {
      requestAnimationFrame(() => {
        startNewPath();
      });
    }
  }, [nodes.length, lines.length]);

  return (
    <div
      ref={linesRef}
      className="pointer-events-none absolute inset-0 z-0"
    />
  );
};
