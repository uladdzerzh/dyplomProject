const socket = io.connect("ws://localhost:5000/")
    socket.on('connect', (event) => {
        console.log("WebSocket connection OPENED:", event);
    });
    socket.on('disconnect', event =>{
        console.log("WebSocket connection CLOSED:", event);
    })
    socket.on('message', message => {
        console.log("Message received: ", message)
    })
    
export function useSocketIO(){

    return socket
}