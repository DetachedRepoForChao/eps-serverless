import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

// declare var io: any;

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  // We create socket object for socket.io lib and events object
  // to store all events that are bound from specific username
  socket;
  events;

  // When the service is injected it checks if socket.io and our
  // events objects are initialised
  constructor() {
/*    if (!this.socket) {
      this.socket = io('http://localhost:3000');
      this.events = {};
    }*/
  }

  reinitialize() {
    this.socket = io('http://localhost:3000');
    this.events = {};
  }

  // Then we create a middleware function to intercept the socket.on()
  // function and we request one more parameter which is the username.
  on(username, event, callback) {
    // We check if username key already exists in our events object.
    if (this.events[username]) {
      // We check if the wanted event is already bound in selected username
      // (basically we check if its added to events[username] array)
      if (this.events[username].indexOf(event) < 1) {
        // If it's not added we bind the event to socket and add it to events[username] array
        this.events[username].push(event);
        this.socket.on(event, callback);
      }
      // If the username key does not exist we initialise event[username] as an array
      // and we add our event to the array as well as we bind the socket event
    } else {
      this.events[username] = [];
      this.events[username].push(event);
      this.socket.on(event, callback);
    }
  }

  // We also create a middleware function to intercept the socket.emit()
  // function and just forward data to socket.emit
  emit(event, data = {}) {
    this.socket.emit(event, data);
  }

  // And last we add unsubscribe function so we can unbind all listeners from
  // single username (mostly used in onNgDestroy() when we don't want that bound events
  // are persistent between more than one username)
  unsubscribe(username) {
    // We check if username key exists in events object
    if (this.events[username]) {
      // We iterate through array and we remove listeners for every
      // event that was bound to selected username
      this.events[username].forEach((event) => {
        this.socket.off(event);
      });

      // And in the end we remove username key from events
      delete this.events[username];
    }
  }
}
