// Copyright (c) 2019 Dominic Masters
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import { ServerModule } from './../module/';
import { isValidPort, getAddressInfoHuman } from './../util/';

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as net from 'net';

import { Express } from 'express';

export const CONFIG_IP = 'server.ip';
export const CONFIG_PORT = 'server.port';
export const CONFIG_SSL = 'server.secure';
export const CONFIG_SSL_KEY = `${CONFIG_SSL}.key`;
export const CONFIG_SSL_CERT = `${CONFIG_SSL}.cert`;
export const CONFIG_HTTPS_PORT = `${CONFIG_SSL}.port`;

export class Server {
  //Module
  module:ServerModule;

  //Server
  express:Express;
  http:http.Server;
  https:https.Server;

  //Configurations
  ip:string = null;
  port:number = 80;
  ssl:boolean = false;
  httpsPort:number = 443;
  key:string;
  cert:string;

  constructor(module:ServerModule) {
    if(!module) throw new Error("Invalid Module Supplied");
    this.module = module;

    //Create my express wrapper.
    this.express = express();

    //Setup express to support JSON Encoded bodies
    this.express.use(bodyParser.json({
      type:'application/json'
    }));

    //Allow URL Encoded bodies
    this.express.use(bodyParser.urlencoded({
      extended: true
    }));
  }

  async init():Promise<void> {
    let { config } = this.module.app;

    //Configuration defaults
    if(config.isHeroku()) {
      //Heroku only configuration
      this.port = config.has('port') ? parseInt(config.get('port')) : 3000;
    }

    if(config.has(CONFIG_IP)) {
      if(!net.isIP(config.get(CONFIG_IP))) throw new Error('Invalid IP Address in Server Configuration.');
      this.ip = config.get(CONFIG_IP);
    }

    if(config.has(CONFIG_PORT)) {
      this.port = parseInt(config.get(CONFIG_PORT));
      if(!isValidPort(this.port)) throw new Error('Invalid Port in Server Configuration.');
    }

    if(config.has(CONFIG_SSL)) {
      //We need a key and certificate for SSL to work properly.
      if(!config.has(CONFIG_SSL_KEY)) throw new Error('Missing SSL Key file path in Configuration.');
      if(!config.has(CONFIG_SSL_CERT)) throw new Error('Missing SSL Certificate file path in Configuration.');

      //Check if there's a valid HTTPS port
      if(config.has(CONFIG_HTTPS_PORT)) {
        this.httpsPort = parseInt(config.get(CONFIG_HTTPS_PORT));
        if(!isValidPort(this.httpsPort)) throw new Error('Invalid HTTPS Port in Server Configuration.');
      }

      //Try and path resolve the files
      let keyPath = path.resolve(config.get(CONFIG_SSL_KEY));
      let certPath = path.resolve(config.get(CONFIG_SSL_CERT));
      if(!fs.existsSync(keyPath)) throw new Error('SSL Key file was not found.');
      if(!fs.existsSync(certPath)) throw new Error('SSL Certificate file was not found.');

      this.key = fs.readFileSync(keyPath, 'utf8');
      this.cert = fs.readFileSync(certPath, 'utf8');
      if(!this.key.length) throw new Error('SSL Key file is empty.');
      if(!this.cert.length) throw new Error('SSL Certificate file is empty.');

      this.ssl = true;
    }

    //Create a HTTP Server
    this.http = http.createServer(this.express);
    this.http.on('error', (e:Error) => this.onServerError(e));

    //Create a HTTPS Server
    if(this.ssl) {
      this.https = https.createServer({
        key: this.key, cert: this.cert
      }, this.express);
      this.https.on('error', (e:Error) => this.onSecureServerError(e));
    }
  }

  async destroy() {
    await this.stop();
  }

  async stop() {
    if(this.http) {
      await new Promise((resolve, reject) => {
        this.http.close(e => e ? reject(e) : resolve())
      });
    }

    if(this.https) {
      await new Promise((resolve, reject) => {
        this.https.close(e => e ? reject(e) : resolve())
      });
    }
  }

  async start() {
    this.http.listen({
      ip: this.ip,
      port: this.port
    }, () => this.onServerStarted());

    if(this.ssl) {
      this.https.listen({
        ip: this.ip,
        port: this.httpsPort
      }, () => this.onSecureStarted());
    }
  }

  //EVENTS
  onServerStarted():void {
    //TODO: Confirm the server actually started
    let address = getAddressInfoHuman(this.http.address());
    this.module.logger.info(`HTTP Server Started on ${address}`);
  }

  onServerError(e:Error):void {
    this.module.logger.severe('HTTP Error');
    this.module.logger.severe(e);
  }


  onSecureStarted():void {
    let address = getAddressInfoHuman(this.https.address());
    this.module.logger.info(`HTTPS Server Started on ${address}`);
  }

  onSecureServerError(e:Error):void {
    this.module.logger.severe('HTTPS Error');
    this.module.logger.severe(e);
  }
}
