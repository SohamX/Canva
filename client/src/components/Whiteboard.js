import ReactFlow, { Background, Controls, MiniMap, Panel, useEdgesState, useNodesState, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { useState, useCallback, } from 'react';
import ResizeRotateNode from "./ResizeRotateNode";

// const initialNodes = [
//     { id: '1', data: { label: '-' }, position: { x: 100, y: 100 } },
//     { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 200 } },
//   ];

const nodeorigin = [0.5, 0.5];

const defaultNodes = [
  {
    id: "1",
    position: { x: 100, y: 100 },
    data: { label: "Node 1" },
    type: "resizeRotate",
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    selected: true,
    style: { width: 180, height: 100 }
  },
  {
    id: "2",
    position: { x: 100, y: 400 },
    data: { label: "Node 2" },
    type: "resizeRotate",
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    style: { width: 180, height: 100 }
  }
];

const defaultEdges = [
  {
    id: "1->2",
    source: "1",
    target: "2",
    type: "SimpleBezier"
  }
];

const nodeTypes = {
  resizeRotate: ResizeRotateNode
};

const defaultEdgeOptions = {
  style: { strokeWidth: 2, stroke: "#9ca8b3" },
  markerEnd: {
    type: "arrowclosed"
  }
};

const Whiteboard = ()=> {
    const [variant, setVariant] = useState('cross');
    const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
    const [edges, setEdges] = useEdgesState(defaultEdges);

    const forceToolbarVisible = useCallback((enabled) =>
      setNodes((nodes) =>
        nodes.map((node) => ({
          ...node,
          data: { ...node.data, forceToolbarVisible: enabled },
        })),console.log(nodes)
      ),
    );

    return(
        <div className="fixed top-0 left-0 h-[100vh] w-[100vw]">
            <ReactFlow  
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            nodes={nodes}
            edges={edges}
            defaultEdgeOptions={defaultEdgeOptions}
            defaultViewport={{ zoom: 1, x: 0, y: 0 }}
            fitView
            fitViewOptions={{ padding: 0.4 }}
            nodeOrigin={nodeorigin}
           // nodes={nodes}
            >
            <Background color="#ccc" variant={variant} />
            <Panel position="top-center">
                <div className="mt-6">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2" onClick={() => setVariant('dots')}>dots</button>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2" onClick={() => setVariant('lines')}>lines</button>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setVariant('cross')}>cross</button>
                </div>
            </Panel>
            <Controls />
            <Panel position="top-left">
              <div className="mt-60">
                <h3>Override Node Toolbar visibility</h3>
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => forceToolbarVisible(e.target.checked)}
                  />
                  <span>Always show toolbar</span>
                </label>
              </div>
            </Panel>
            <MiniMap nodeStrokeWidth={3} zoomable pannable position='top-right' />
            </ReactFlow>
        </div>
    )
}

export default Whiteboard;