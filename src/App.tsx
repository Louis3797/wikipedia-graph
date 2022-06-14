import { useEffect, useRef, useState, useCallback } from "react";
import { ForceGraph3D } from "react-force-graph";
import { API_PREFIX, API_SUFFIX } from "./utils/constants";
import generateColorHex from "./utils/generateHexColor";

interface Node {
  title: string;
  color: string;
}

interface Link {
  source: Node;
  target: Node;
}
const App = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  const fgRef = useRef<any>();

  const handleClick = useCallback(
    (node: any) => {
      // Aim at node from outside it
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        3000 // ms transition duration
      );
    },
    [fgRef]
  );

  const getData = (title: string, depth: number, parentNode: Node): void => {
    if (depth === 0) {
      return;
    }

    depth--;

    const url = API_PREFIX + title + API_SUFFIX;
    fetch(url)
      .then((response) => response.json())
      .then((response) => {
        let pages = response.query.pages;
        for (let p in pages) {
          for (let l of pages[p].links) {
            const res: string = l.title;
            const newNode: Node = { title: res, color: generateColorHex() };

            setNodes((n) => [...n, newNode]);

            // @ts-ignore

            const newLink: Link = { source: parentNode, target: newNode };
            setLinks((l) => [...l, newLink]);

            const set: Set<Node> = new Set();
            nodes.forEach((n) => set.add(n));
            set.forEach((n) => {
              setNodes((e) => [...e, n]);
            });

            getData(res, depth, newNode);
          }
        }
      })
      .catch((error) => {
        throw new Error(error);
      });
  };

  useEffect(() => {
    setNodes([]);
    setLinks([]);

    const firstNode: Node = {
      title: "Albert Einstein",
      color: generateColorHex()
    };

    setNodes((n) => [...n, firstNode]);
    getData("Albert Einstein", 6, firstNode);
  }, []);

  console.log(nodes);
  console.log(links);
  return (
    <div className="container">
      <ForceGraph3D
        graphData={{ nodes, links }}
        linkWidth={1}
        // @ts-ignore
        nodeAutoColorBy={(n) => n.color}
        linkDirectionalParticles={2}
        ref={fgRef}
        onNodeClick={handleClick}
        // @ts-ignore
        nodeLabel={(n) => `${n.title}`}
        warmupTicks={100}
        cooldownTicks={0}
        onEngineStop={() => fgRef.current.zoomToFit(400)}
      />
    </div>
  );
};

export default App;
