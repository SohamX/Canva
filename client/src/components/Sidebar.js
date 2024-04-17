import React from 'react';

export default (selectNode) => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  
  return (
    <aside className="fixed z-2 border-r border-gray-300 p-4 bg-white">
      <h1 className="text-lg font-semibold">SidePanel</h1>
      <div className="text-sm text-gray-600 mb-4">You can drag these nodes to the pane on the right.</div>
      <div className="dndnode input h-12 px-4 border border-blue-500 rounded-md flex justify-center items-center cursor-grab" onDragStart={(event) => onDragStart(event, 'resizeRotate')} draggable>
        resizeRotate Node
      </div>
      {/* <div className="dndnode h-12 px-4 border border-gray-500 rounded-md flex justify-center items-center cursor-grab" onDragStart={(event) => onDragStart(event, 'default')} draggable>
        Default Node
      </div>
      <div className="dndnode output h-12 px-4 border border-pink-500 rounded-md flex justify-center items-center cursor-grab" onDragStart={(event) => onDragStart(event, 'output')} draggable>
        Output Node
      </div> */}
      <h1 >{selectNode.selectNode.data.label}</h1>
    </aside>
  );
};