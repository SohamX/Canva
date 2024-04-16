import ReactFlow, { Background } from 'reactflow';
import 'reactflow/dist/style.css';

const Whiteboard = ()=> {
    return(
        <div className="fixed top-0 left-0 h-[100vh] w-[100vw]">
            <ReactFlow>
            < Background color="black" variant="dots"/>
            
            </ReactFlow>
        </div>
    )
}

export default Whiteboard;