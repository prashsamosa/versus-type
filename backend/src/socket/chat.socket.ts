export function registerChatHandlers(io: any, socket: any) {
  socket.on("chat:send-message", (data: { room: string; message: string; username: string }) => {
    const { room, message, username } = data;

}
