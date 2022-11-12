import { Socket, SocketService, SocketSession } from "@tsed/socketio";
import * as SocketIO from "socket.io";
import SocketExtender from "../extenders/SocketExtender";



@SocketService("/user")
export class UserNsp extends SocketExtender {
  constructor(
  ) {
    super();
  }

  $onNamespaceInit(nsp: SocketIO.Namespace) {
    super.$onNamespaceInit(nsp);
  }
  $onConnection(@Socket socket: SocketIO.Socket, @SocketSession session: SocketSession) {
    super.$onConnection(socket, session);
  }
  $onDisconnect(@Socket socket: SocketIO.Socket) {
    super.$onDisconnect(socket);
  }

}