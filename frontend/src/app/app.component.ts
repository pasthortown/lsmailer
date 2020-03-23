import { MailerService } from './../services/mailer.service';
import { Destiny } from './../models/destiny';
import { Attachment } from './../models/attachment';
import { Component, OnInit } from '@angular/core';
import { ToastrManager } from 'ng6-toastr-notifications';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver/FileSaver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  FromEmail = '';
  FromAlias = '';
  FromClave = '';
  ReplyEmail = '';
  ReplyAlias = '';
  Asunto = '';
  Mensaje = '';
  Attachments: Attachment[] = [];
  DestinyList: Destiny[] = [];
  enviando = false;
  currentIndex = 0;
  valueProgress = 0;

  constructor(private toastr: ToastrManager, private mailerDataService: MailerService) {

  }

  ngOnInit() {
  }

  CodeFileAttachment(event) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
       const file = event.target.files[0];
       reader.readAsDataURL(file);
       reader.onload = () => {
         const newAttachment = new Attachment();
         newAttachment.name = file.name;
         newAttachment.type = file.type;
         newAttachment.data = reader.result.toString().split(',')[1];
         this.Attachments.push(newAttachment);
         this.toastr.successToastr('Adjunto cargado satisfactoriamente',"Adjuntos");
       };
    }
  }

  CodeFileDestinyList(event){
    const reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
       const file = event.target.files[0];
       reader.readAsDataURL(file);
       reader.onload = () => {
          const fileBytes = reader.result.toString().split(',')[1];
          const newData = decodeURIComponent(escape(atob(fileBytes))).split('\n');
          let errores = false;
          newData.forEach(row => {
            if (row.trim() != '' && row.trim() != 'email;alias') {
              const columns = row.split(';');
              if (columns.length == 2) {
                const newDestiny = new Destiny();
                newDestiny.ToEmail = columns[0];
                newDestiny.ToAlias = columns[1];
                this.DestinyList.push(newDestiny);
              } else {
                console.log("error en: " + columns[0]);
                errores = true;
              }
            }
          });
          if (!errores) {
            this.toastr.successToastr('Datos cargados satisfactoriamente',"Carga de Destinatarios");
          } else {
            this.toastr.errorToastr('Se encontraron errores durante la carga',"Carga de Destinatarios");
          }
       };
    }
  }

  deleteAttachment(attachment: Attachment) {
    const newAttachmentList = [];
    this.Attachments.forEach(element => {
      if (element != attachment) {
        newAttachmentList.push(element);
      }
    });
    this.Attachments = newAttachmentList;
    this.toastr.warningToastr('Adjunto eliminado satisfactoriamente',"Adjuntos");
  }

  deleteDestiny(destiny: Destiny) {
    const newDestinyList = [];
    this.DestinyList.forEach(element => {
      if (element != destiny) {
        newDestinyList.push(element);
      }
    });
    this.DestinyList = newDestinyList;
    this.toastr.warningToastr('Destinatario eliminado satisfactoriamente',"Destinatarios");
  }

  downloadAttachment(attachment: Attachment) {
    this.downloadFile(attachment.data, attachment.type, attachment.name);
    this.toastr.successToastr('Inicia la descarga del archivo',"Adjuntos");
  }

  downloadFile(file: any, type: any, name: any) {
    const byteCharacters = atob(file);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: type });
    saveAs(blob, name);
  }

  addDestiny() {
    this.DestinyList.push(new Destiny());
    this.toastr.successToastr('Destinatario nuevo agregado',"Destinatarios");
  }

  downloadDestinyList() {
    let output = 'email;alias\n';
    this.DestinyList.forEach(element => {
       output += element.ToEmail + ';' + element.ToAlias + '\n';
    });
    const blob = new Blob(["\ufeff", output], { type: 'text/plain' });
    const fecha = new Date();
    saveAs(blob, fecha.toLocaleDateString() + '_Destiny_List.csv');
    this.toastr.successToastr('Inicia la descarga del archivo',"Destinatarios");
  }

  iniciarEnvio() {
    this.enviando = true;
    this.currentIndex = 0;
    this.DestinyList.forEach(element => {
      element.status = '';
    });
    console.log({event: 'inicio', date: new Date()});
    this.toastr.successToastr('Inicia el envío de correos',"Envío de Correos");
    this.enviar();
  }

  enviar() {
    if (this.enviando) {
      const await_time = Math.floor(Math.random() * 5) + 1;
      setTimeout(() =>
      {
        if (this.currentIndex < this.DestinyList.length) {
          const destiny = this.DestinyList[this.currentIndex];
          const data = {
            FromEmail: this.FromEmail,
            FromAlias: this.FromAlias,
            FromClave: this.FromClave,
            ReplyEmail: this.ReplyEmail,
            ReplyAlias: this.ReplyAlias,
            ToEmail: destiny.ToEmail,
            ToAlias: destiny.ToAlias,
            Mensaje: this.Mensaje,
            Asunto: this.Asunto,
            Attchments: this.Attachments,
          };
          this.mailerDataService.send(data).then( r => {
            if (r.respuesta == 'error') {
              this.DestinyList[this.currentIndex].status = 'error';
            } else {
              this.DestinyList[this.currentIndex].status = 'ok';
            }
            console.log({destiny: destiny, date: new Date()});
            this.currentIndex = this.currentIndex + 1;
            this.valueProgress =  Math.floor((this.currentIndex / this.DestinyList.length) * 100);
            this.enviar();
          }).catch( e => {
            this.currentIndex = this.currentIndex + 1;
            this.valueProgress =  Math.floor((this.currentIndex / this.DestinyList.length) * 100);
            console.log({error: e, destiny: destiny, date: new Date()});
            this.enviar();
          });
        } else {
          console.log({event: 'fin', date: new Date()});
          this.currentIndex = 0;
          this.valueProgress = 0;
          this.enviando = false;
          Swal.fire({
            title: 'Correos Enviados',
            text: 'La tarea se ha completado.',
            type: 'success',
          });
        }
      },
      5000 + (await_time * 1000));
    }
  }
}
