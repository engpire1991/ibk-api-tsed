import { $log } from "@tsed/logger";
import { IO, Socket, SocketService, SocketSession, SocketUseAfter } from "@tsed/socketio";
import { JwtPayload } from "jsonwebtoken";
import * as SocketIO from "socket.io";
import { User } from "../entities/User";
import { InternalServerException } from "../exceptions/InternalServerException";
import { UnauthorizedException } from "../exceptions/UnauthorizedException";
import SocketExtender from "../extenders/SocketExtender";
import { SocketErrorHandlerMiddleware } from "../middleware/SocketErrorHandlerMiddleware";
import { UserRepository } from "../repositories/UserRepository";
import { AuthorizationService } from "./AuthorizationService";

declare module 'socket.io' {
  interface Namespace {
    users: { [id: number]: string[] }
  }
  interface Socket {
    user: User,
    tokenSessionId: string
  }
}

@SocketService()
@SocketUseAfter(SocketErrorHandlerMiddleware)
export class BaseSocketService extends SocketExtender{
  constructor(
    @IO io: SocketIO.Server,
    private userRepository: UserRepository
  ) {
    super();

    io.use(async (socket, next) => {
      if (!socket.handshake) {
        return next(new UnauthorizedException());
      }
      const token = socket.handshake.query.token;
      
      // return Unauthorized exception if token was not received
      if (!token) return next(new UnauthorizedException());

      let payload: JwtPayload;
      try {
        payload = AuthorizationService.verifyTyoken(token as string);
      } catch (err) {
        // failed to decode, so unauthorized
        $log.error(err);
        return next(new UnauthorizedException());
      }

      let user: User | undefined;
      try {
        user = await this.userRepository.findOne({username: payload.username});
      } catch (err) {
        $log.error(`got error while trying to get user by email ${payload.username}. Error: `, err);
        return next(new InternalServerException(err));
      }

      // return Unauthorized exception if user was not found
      if (!user) return next(new UnauthorizedException());

      // create empty user socket id array if not done already
      if (!this.nsp.users[user.id]) this.nsp.users[user.id] = [];
      this.nsp.users[user.id].push(socket.id);
      socket.user = user;
      return next();
    });
  }

  /**
   * Triggered when a new client connects to the Namespace.
   */
  async $onConnection(@Socket socket: SocketIO.Socket, @SocketSession session: SocketSession) {
    $log.info("socket connected", socket.id);
  }
}