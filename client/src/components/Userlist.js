

const userList = (users)=>{
    return(
      // <div className="fixed bottom-10 right-0 h-[30vh] w-[11.8vw] bg-white rounded-lg shadow-lg p-4 overflow-auto z-10 mb-8 mr-4">
        <div className="fixed top-0 left-0 h-[30vh] w-[15vw] bg-white rounded-lg shadow-lg p-4 overflow-auto z-10 mt-5 ml-5">
        <h2 className="text-lg font-bold mb-2">Users</h2>
        {users.users.map((user, index) => (
          <div key={index} className="flex items-center mb-2">
            <span className={`h-2 w-2 rounded-full mr-2 bg-blue-500`}></span>
            <span>{user}</span>
          </div>
        ))}
      </div>
    )
}

export default userList