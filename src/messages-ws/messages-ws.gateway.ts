import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService) {}
  async handleConnection(client: Socket) {
    const authHeader = client.handshake.headers.authorization as
      | string
      | undefined;

    const jwt =
      client.handshake.auth?.token ??
      authHeader?.replace('Bearer ', '') ??
      client.handshake.headers.authentication;
    let payload: JwtPayload;
    try{
      payload = this.jwtService.verify(jwt);
      await this.messagesWsService.registerClient(client, payload.id);
    }catch(error){
      client.disconnect();
      return;
    }

    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }
  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    // Emite únicamente al cliente
    //client.emit('message-from-server', {fullname: 'Soy Yo', messsage: payload.message || 'no-message'})
    
    // Emite a todos menos al cliente inical
    //client.broadcast.emit('message-from-server', {fullname: 'Soy Yo', messsage: payload.message || 'no-message'})
    
    // Emite a todos 
    this.wss.emit('message-from-server', { fullName: this.messagesWsService.getUserFullName(client.id), message: payload.message || 'no-message'})
  }
}
