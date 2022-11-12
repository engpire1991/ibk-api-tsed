import { $log } from "@tsed/logger";
import { Namespace, Nsp, Socket, SocketSession } from "@tsed/socketio";
import * as SocketIO from "socket.io";

export default abstract class SocketExtender {
  @Nsp nsp: Namespace;

  /**
   * Triggered the namespace is created
   */
  $onNamespaceInit(nsp: Namespace) {
    nsp.users = {};
  }
  /**
   * Triggered when a new client connects to the Namespace.
   */
  $onConnection(socket: SocketIO.Socket, session: SocketSession) {
    console.log((socket.conn as any).id, socket.id);
    if (!socket.user || !socket.user.id) {
      if (!(socket.conn as any).id) {
        return;
      }
      const baseSock = socket.nsp.sockets.get((socket.conn as any).id);

      // do nothing if we didn't get a socket or if it has no user assigned
      if (!baseSock || !baseSock.user) return;

      // assign base sockets user to this socket
      socket.user = baseSock.user;
    }

    $log.info("socket connected", socket.id);

    // create empty array for user sockets, if it is not set
    if (!this.nsp.users[socket.user.id]) this.nsp.users[socket.user.id] = [];

    // add socket to user sockets array
    this.nsp.users[socket.user.id].push(socket.id);
  }

  /**
   * Triggered when a client disconnects from the Namespace.
   */
  $onDisconnect(@Socket socket: SocketIO.Socket) {
    $log.info("socket " + socket.id + ' disconnected');
    if (!socket.user || !socket.user.id) {
      return;
    }
    const connection = this.nsp.users[socket.user.id];
    // do nothing if user has no connections
    if (!connection) return;

    let ind = connection.findIndex(c => c == socket.id);
    if (ind == -1) {
      return;
    }

    connection.splice(ind, 1);
    if (connection.length < 1) delete this.nsp.users[socket.user.id];
  }

  public emit(name: string, ...args: any[]): boolean {
    return this.nsp.emit(name, ...args);
  }

  public emitToSocket(name: string, socketId: string, ...args: any[]): boolean {
    // get the socket by id
    const socket = this.nsp.sockets.get(socketId);

    // if socket was not found then return false
    if (!socket) return false;

    // emit the event
    return socket.emit(name, ...args);
  }

  public emitToUsers(name: string, userIds: number | number[], ...args: any[]): { [userid: number]: boolean } {
    let res: { [id: number]: boolean } = {};
    // turn userIds to array if a single entry was received
    if (!Array.isArray(userIds)) userIds = [userIds];

    for (const id of userIds) {
      // check if user is in namespace
      if (!this.nsp.users[id]) {
        res[id] = false;
        continue;
      }

      // send to all sockets
      let sent = false;
      for (const sockId of this.nsp.users[id]) {
        // set sent to true if emited
        if (this.emitToSocket(name, sockId, args)) sent = true;
      }

      res[id] = sent;
    }
    return res;
  }
}