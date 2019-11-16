import { Component, OnInit } from '@angular/core';
// import {SocketService} from '../shared/socket.service';
import {AvatarService} from '../shared/avatar/avatar.service';
import {Router} from '@angular/router';
// import {SocketService} from '../shared/socket.service';
import { environment } from 'src/environments/environment';
import {Storage} from 'aws-amplify';


// Create a variable to interact with jquery
declare var $: any;
declare var event: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    const squares1 = document.getElementById('square1');
    const squares2 = document.getElementById('square2');
    const squares3 = document.getElementById('square3');
    const squares4 = document.getElementById('square4');
    const squares5 = document.getElementById('square5');
    const squares6 = document.getElementById('square6');
    const squares9 = document.getElementById('square7');
    const squares10 = document.getElementById('square8');

    if ($('.square').length !== 0) {

      $(document).mousemove(function(e) {

        const posX = event.clientX - window.innerWidth / 2;
        const posY = event.clientY - window.innerWidth / 6;

        squares1.style.transform = 'perspective(500px) rotateY(' + posX * 0.05 + 'deg) rotateX(' + posY * (-0.05) + 'deg)';
        squares2.style.transform = 'perspective(500px) rotateY(' + posX * 0.05 + 'deg) rotateX(' + posY * (-0.05) + 'deg)';
        squares3.style.transform = 'perspective(500px) rotateY(' + posX * 0.05 + 'deg) rotateX(' + posY * (-0.05) + 'deg)';
        squares4.style.transform = 'perspective(500px) rotateY(' + posX * 0.05 + 'deg) rotateX(' + posY * (-0.05) + 'deg)';
        squares5.style.transform = 'perspective(500px) rotateY(' + posX * 0.05 + 'deg) rotateX(' + posY * (-0.05) + 'deg)';
        squares6.style.transform = 'perspective(500px) rotateY(' + posX * 0.05 + 'deg) rotateX(' + posY * (-0.05) + 'deg)';
        squares9.style.transform = 'perspective(500px) rotateY(' + posX * 0.02 + 'deg) rotateX(' + posY * (-0.02) + 'deg)';
        squares10.style.transform = 'perspective(500px) rotateY(' + posX * 0.02 + 'deg) rotateX(' + posY * (-0.02) + 'deg)';

        $('.form-control').on('focus', function() {
          $(this).parent('.input-group').addClass('input-group-focus');
        }).on('blur', function() {
          $(this).parent('.input-group').removeClass('input-group-focus');
        });

      });
    }
  }
}
