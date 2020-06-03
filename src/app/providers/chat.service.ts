import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { Mensaje } from '../interfaces/mensaje.interface';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private itemsCollection: AngularFirestoreCollection<Mensaje>

  public chats:Mensaje[]=[]
  public usuario:any={}

  constructor(private angularFirestore: AngularFirestore, public angularFireAuth:AngularFireAuth) {
    this.angularFireAuth.authState.subscribe(user=> {
      if(!user){
        return
      }else{
        this.usuario.nombre = user.displayName
        this.usuario.uid = user.uid
      }
    })
  }

  login(proveedor:string) {
    if(proveedor === 'google'){
        this.angularFireAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    }else{
        this.angularFireAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
    }

  }
  logout() {
    this.usuario = {}
    this.angularFireAuth.auth.signOut();
  }

  cargarMensajes(){
    this.itemsCollection = this.angularFirestore.collection<Mensaje>('chats', ref => ref.orderBy('fecha','desc').limit(10));
    return this.itemsCollection.valueChanges().pipe(
          map((mensajes:Mensaje[]) => {
          this.chats = []
          for(let mensaje of mensajes){
            this.chats.unshift(mensaje)
          }
          return this.chats
      }))
  }

  agregarMensaje(texto:string){

    let mensaje:Mensaje = {
      nombre:this.usuario.nombre,
      mensaje:texto,
      fecha: new Date().getTime(),
      uid:this.usuario.uid
    }
    return this.itemsCollection.add(mensaje)
  }

}
