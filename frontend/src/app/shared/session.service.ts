import { Injectable } from '@angular/core';
import {SocketService} from './socket.service';
import {NotifierService} from 'angular-notifier';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private socketService: SocketService,
              private notifierService: NotifierService,
              private http: HttpClient) { }

  SetSessionLoggedIn() {
    this.socketService.socket.io.opts['loggedIn'] = true;
  }

  SetSessionLoggedOut() {
    const property = 'loggedIn';
    const userId = localStorage.getItem('userId');
    console.log('Setting session property "' + property + '" to "' + userId + '"');
    this.socketService.socket.io.opts['loggedIn'] = false;
  }

  SetSessionUserId() {
    const property = 'userId';
    const value = localStorage.getItem('userId');
    console.log('Setting session property "' + property + '" to "' + value + '"');
    this.socketService.socket.io.opts[property] = value;
  }

  SetSessionProperty(property: string, value: any) {
    console.log('Setting session property "' + property + '" to "' + value + '"');
    this.socketService.socket.io.opts[property] = value;
  }

  GetSessionProperty(property: string) {
    console.log('Getting value for session property "' + property + '"');
    const value = this.socketService.socket.io.opts[property];
    if (value) {
      console.log('Value for session property "' + property + '" is "' + value + '"');
    } else {
      console.log('Value for session property "' + property + '" does not exist');
    }
    return value;
  }

  UpdateSessionHeartbeat() {
    this.socketService.socket.io.opts['heartbeatAt'] = Date.now();
  }

  CreateSession() {
    const userId = localStorage.getItem('userId');
    const loggedIn = true;
    const heartbeatAt = Date.now();
    const data = {'userId': userId, 'loggedIn': loggedIn, 'heartbeatAt': heartbeatAt};
    this.socketService.emit('createSession', data);
  }

  CreateSessionCreatedListener() {
    const username = localStorage.getItem('username');
    const eventName = 'sessionCreated';
    const self1 = this;
    console.log('Creating listener for event "' + eventName + '" for username: ' + username);
    self1.socketService.on(username, eventName, data => {
      console.log('Received "' + eventName + '" event from server. Setting "backendSessionConnected" property to "true"');
      self1.SetSessionProperty('initialized', true);
      self1.SetSessionProperty('backendSessionConnected', true);
    });
  }

  CreateSessionHeartbeatListener() {
    const username = localStorage.getItem('username');
    const eventName = 'checkSessionHeartbeat';
    const self1 = this;
    const sessionId = self1.socketService.socket.id;
    console.log('Creating listener for event "' + eventName + '" for username: ' + username);
    self1.socketService.on(username, eventName, () => {
      console.log('Received "' + eventName + '" event from server. Responding to keep session alive');
      const heartbeatAt = Date.now();
      self1.socketService.emit('sessionHeartbeatResponse', {'status': 'alive', 'sessionId': sessionId, 'heartbeatAt': heartbeatAt});
    });
  }

  CreateSessionDisconnectedListener() {
    const username = localStorage.getItem('username');
    const eventName = 'sessionDisconnected';
    const self1 = this;
    const sessionId = self1.socketService.socket.id;
    console.log('Creating listener for event "' + eventName + '" for username: ' + username);
    self1.socketService.on(username, eventName, (data) => {
      console.log('Received "' + eventName + '" event from server');
      if (!(self1.GetSessionProperty('loggedIn'))) {
        // session is currently not logged in, so we don't need to display a message to the user
        console.log('Session is NOT currently logged in. No need to display message...');
      } else {
        // session is currently logged in, display a message to the user
        console.log('Session is currently logged in. Displaying message...');
        self1.notifierService.notify('success', 'Your session has been disconnected. Reason: ' + data.reason);
      }

      this.SetSessionProperty('backendSessionConnected', false);
    });
  }

  LogoutSession() {
    console.log('Alerting backend server that session has logged out');
    const self1 = this;
    const userId = +localStorage.getItem('userId');
    self1.socketService.emit('logoutSession');

    console.log('Found session match in session hashtable...');
    if (self1.GetSessionProperty('loggedIn')) {
      console.log('Session is currently set as logged in. Setting session as logged out');
      self1.SetSessionProperty('loggedIn', false);
    } else {
      console.warn('Session is already set as logged out');
    }
  }

  getServerIo() {
    console.log('getServerIo');
    return this.http.get(environment.apiBaseUrl + '/getIo');
  }
}
