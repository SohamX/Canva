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
    const [myNode, setMyNode] = useState(defaultNodes)
    const [myEdge, setMyEdge] = useState(null)
    const [operation, setOperation] = useState('');
    const [mySelectedNodes, setMySelectedNodes] = useState([]);
    const [mySelectedEdges, setMySelectedEdges] = useState([]);

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
        setMyNode(newNode);
        setOperation('adding');
      },
      [reactFlowInstance],
    );

    const onNodeDoubleClick = (event, node) => {
      if(selectNode=={}||selectNode.id!==node.id){
        setSelectNode(node)
      }
      else{
        setSelectNode({})
      }
    }

    const onNodeDrag = (event, node) => {
      delete node.dragging;
      delete node.selected;
      delete node.positionAbsolute;
      setMyNode(node);
      setOperation('dragging');
    };

    const onSelectionDrag = (event, nodes) => {
      const newNodes = nodes.map(node => {
        const { dragging, selected, positionAbsolute, ...rest } = node;
        return rest;
      });
      setMySelectedNodes(newNodes);
      setOperation('dragging');
    }

    const onNodesDelete = (elementsToRemove) => {
      console.log(elementsToRemove);
      if(elementsToRemove.length === 1){
        setMyNode(elementsToRemove[0]);
        setOperation('deleting');
      }     
      else{
        console.log("Multiple elements selected for deletion");
        setMySelectedNodes(elementsToRemove)
        setOperation('deleting');
      }
    };

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

useEffect(() => {
  const handleAddingNode = ({ myNode: newNode, email: senderEmail, username: otheruser }) => {
    if (senderEmail !== email) {
      setNodes((nodes) => nodes.concat(newNode));
      id++;
    }
  };
  const handleDeletingNode = ({ myNode: newNode, email: senderEmail, username: otheruser }) => {
    if (senderEmail !== email) {
      setNodes((nodes) => nodes.filter((node) => node.id !== newNode.id));
    }
  };
  const handleDeletingNodes = ({ mySelectedNodes: newNodes, email: senderEmail, username: otheruser }) => {
    if (senderEmail !== email) {
      setNodes((nodes) => nodes.filter((node) => !newNodes.some((newNode) => newNode.id === node.id)));
    }
  };
  const handleDraggingNode = ({ myNode: newNode, email: senderEmail, username: otheruser }) => {
    if (senderEmail !== email) {
      setNodes((nodes) =>
      nodes.map((node) => 
        node.id === newNode.id ? newNode : node
        )
      );
    }
  };
  const handleDraggingNodes = ({ mySelectedNodes: newNodes, email: senderEmail, username: otheruser }) => {
    if (senderEmail !== email) {
      console.log(newNodes,"newNodes");
      setNodes((nodes) =>
      nodes.map((node) => {
        const newNode = newNodes.find((newNode) => newNode.id === node.id);
        return newNode ? newNode : node;
        })
      );
    }
  }
  socket.on('addingNode', handleAddingNode);
  socket.on('deletingNode', handleDeletingNode);
  socket.on('deletingSelectedNodes', handleDeletingNodes);
  socket.on('draggingNode', handleDraggingNode);
  socket.on('draggingSelectedNodes', handleDraggingNodes);
  return () => {
    socket.off('addingNode');
    socket.off('draggingNodes');
    socket.off('deleting');
  };  
}, [email, socket]);

useEffect(() => {
    socket.emit('nodeUpdates', { myNode, roomId, username, email, operation });
}, [myNode, roomId, username, email, socket]);

useEffect(() => {
  socket.emit('selectedNodesUpdates', { mySelectedNodes, roomId, username, email, operation });
}, [mySelectedNodes, roomId, username, email, socket]);

    return(
      <>
        <div className="reactflow-wrapper" class="fixed top-0 left-0 h-[100vh] w-[100vw]" ref={reactFlowWrapper}>
            <ReactFlow  
            defaultEdgeOptions={defaultEdgeOptions}
            defaultViewport={{ zoom: 1, x: 0, y: 0 }}
            edges={edges}
            fitView
            fitViewOptions={{ padding: 0.4 }}
            nodes={nodes}
            nodeOrigin={nodeorigin}
            nodeTypes={nodeTypes}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onInit={setReactFlowInstance}
            onNodesChange={onNodesChange}
            onNodeDoubleClick= {onNodeDoubleClick}
            onNodeDrag= {onNodeDrag}
            onNodesDelete={onNodesDelete}
            onSelectionDrag={onSelectionDrag}
            >
            <Background color="#ccc" variant={variant} />
            <BgType setVariant={setVariant}/>
            <Controls />
            {/* <ToolVisible setNodes={setNodes} /> */}
            <MiniMap nodeStrokeWidth={3} zoomable pannable position='top-right' />
            </ReactFlow>
        </div>
        <Sidebar selectNode={selectNode} setNodes={setNodes} setMyNode={setMyNode} myNode={myNode} /*onUpdateNode={(selectNode)=>update*//> 
      </>
    )
}

export default Whiteboard;