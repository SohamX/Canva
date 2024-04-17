import { Panel } from 'reactflow';

const BgType = ({setVariant})=> {
    return(
        <Panel position="top-center">
                        <div className="mt-6">
                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2" onClick={() => setVariant('dots')}>dots</button>
                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2" onClick={() => setVariant('lines')}>lines</button>
                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setVariant('cross')}>cross</button>
                        </div>
        </Panel>
    )
}

export default BgType;