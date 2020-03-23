import { Destiny } from './../models/destiny';
import { Attachment } from './../models/attachment';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  FromEmail = '';
  FromAlias = '';
  FromClave = '';
  ReplyEmail = '';
  ReplyAlias = '';
  Asunto = '';
  Mensaje = '';
  Attachments: Attachment[] = [];
  DestinyList: Destiny[] = [];

}
