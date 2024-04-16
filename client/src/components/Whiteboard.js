import ReactFlow, { Background } from 'reactflow';
import 'reactflow/dist/style.css';

const Whiteboard = ()=> {
    return(
        <div className="h-100%">
            <ReactFlow>
            < Background/>
            </ReactFlow>
        </div>
    )
}

export default Whiteboard;