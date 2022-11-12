import { $log } from "@tsed/logger";
import { Socket, SocketErr, SocketEventName, SocketMiddlewareError } from "@tsed/socketio";

@SocketMiddlewareError()
export class SocketErrorHandlerMiddleware {
  async use(@SocketEventName eventName: string, @SocketErr err: any, @Socket socket: Socket) {
    $log.error(err);
    socket.emit("error", {message: "An error has occured"});
  }
}