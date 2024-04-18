import ReactFlow, { addEdge, Background, Controls, MiniMap, Panel, useEdgesState, useNodesState, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { useState, useRef, useCallback, useEffect  } from 'react';
import ResizeRotateNode from './ResizeRotateNode.js';
import BgType from './BgType.js';
import Sidebar from './Sidebar.js';
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

// const defaultEdges = [
//   {
//     id: "1->2",
//     source: "1",
//     target: "2",
//     type: "SimpleBezier"
//   }
// ];

const nodeTypes = {
  resizeRotate: ResizeRotateNode
};

const defaultEdgeOptions = {
  style: { strokeWidth: 2, stroke: "#9ca8b3" },
  markerEnd: {
    type: "arrowclosed"
  }
};

let id = 0;
const getId = () => `dndnode_${id++}`;

const Whiteboard = ({socket,roomId,username,email})=> {
    const reactFlowWrapper = useRef(null);
    const [variant, setVariant] = useState('cross');
    const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectNode, setSelectNode] = useEdgesState({})
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    const onConnect = useCallback(
      (params) => setEdges((eds) => addEdge(params, eds)),
      [],
    );
  
    const onDragOver = useCallback((event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }, []);
  
    const onDrop = useCallback(
      (event) => {
        event.preventDefault();
  
        const type = event.dataTransfer.getData('application/reactflow');
  
        // check if the dropped element is valid
        if (typeof type === 'undefined' || !type) {
          return;
        }
  
        // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
        // and you don't need to subtract the reactFlowBounds.left/top anymore
        // details: https://reactflow.dev/whats-new/2023-11-10
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        const newNode = {
          id: getId(),
          type,
          position,
          data: { label: `node ${id}` },
        };
  
        setNodes((nds) => nds.concat(newNode));
      },
      [reactFlowInstance],
    );

    const onNodeDoubleClick = (event, node) => {
      if(selectNode=={}||selectNode.id!==node.id){
        setSelectNode(node)
        console.log(selectNode,"node");
      }
      else{
        setSelectNode({})
        console.log("unselect")
      }
    }

    useEffect(() => {
      const errorHandler = (e) => {
        if (
          e.message.includes(
            "ResizeObserver loop completed with undelivered notifications" ||
              "ResizeObserver loop limit exceeded"
          )
        ) {
          const resizeObserverErr = document.getElementById(
            "webpack-dev-server-client-overlay"
          );
          if (resizeObserverErr) {
            resizeObserverErr.style.display = "none";
          }
        }
      };
      window.addEventListener("error", errorHandler);
    
      return () => {
        window.removeEventListener("error", errorHandler);
      };
    }, []);

    useEffect(()=>{
      socket.on('updateNodes', ({nodes:noedes,email:emoail}) => {
        console.log(noedes,"other user", emoail)
        if(emoail!=email){
          setNodes(noedes);
        }
      })
      socket.emit('nodeUpdates', { nodes, roomId, username, email });
      return () => {
        socket.off('updateNodes'); // Cleanup: Remove the listener when the component unmounts
    };
    },[nodes])

    return(
      <>
        <div className="reactflow-wrapper" class="fixed top-0 left-0 h-[100vh] w-[100vw]" ref={reactFlowWrapper}>
            <ReactFlow  
            nodes={nodes}
            nodeTypes={nodeTypes}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onInit={setReactFlowInstance}
            onNodesChange={onNodesChange}
            onNodeDoubleClick= {onNodeDoubleClick}
            edges={edges}
            defaultEdgeOptions={defaultEdgeOptions}
            defaultViewport={{ zoom: 1, x: 0, y: 0 }}
            fitView
            fitViewOptions={{ padding: 0.4 }}
            nodeOrigin={nodeorigin}
            >
            <Background color="#ccc" variant={variant} />
            <BgType setVariant={setVariant}/>
            <Controls />
            {/* <ToolVisible setNodes={setNodes} /> */}
            <MiniMap nodeStrokeWidth={3} zoomable pannable position='top-right' />
            </ReactFlow>
        </div>
        <Sidebar setSelectNode={setSelectNode} selectNode={selectNode} setNodes={setNodes} nodes={nodes} /*onUpdateNode={(selectNode)=>update*//> 
      </>
    )
}

export default Whiteboard;