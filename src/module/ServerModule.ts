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

import { Module } from '@yourwishes/app-base';
import { IServerApp } from './../app/';
import { APIRequest, APIHandler, sendResponse, RESPONSE_INTERNAL_ERROR, APIResponse } from './../api/';

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import * as https from 'https';
import * as net from 'net';
import * as path from 'path';
import * as fs from 'fs';

import { Express, Router, Request, Response, NextFunction } from 'express';


export const CONFIG_IP = 'server.ip';
export const CONFIG_PORT = 'server.port';
export const CONFIG_SSL = 'server.secure';
export const CONFIG_SSL_KEY = `${CONFIG_SSL}.key`;
export const CONFIG_SSL_CERT = `${CONFIG_SSL}.cert`;
export const CONFIG_HTTPS_PORT = `${CONFIG_SSL}.port`;


export const isValidPort = port => !isNaN(port) && port > -1 && port < 65536;

export class ServerModule extends Module {
  //Server
  express:Express;
  http:http.Server;
  https:https.Server;

  //API
  apiRouter:Router;
  apiHandlers:APIHandler[]=[];

  //Configurations
  ip:string = null;
  port:Number = 80;
  ssl:boolean = false;
  httpsPort:Number = 443;
  key:string;
  cert:string;

  //Programmatic configuration
  autoStart:boolean=true;

  constructor(app:IServerApp) {
    super(app);

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

    //Create our API Router
    this.apiRouter = express.Router();
    this.apiRouter.all('*', (req,res,next) => this.onAPIRequest(req,res,next));
    this.express.use(this.apiRouter);
  }

  addAPIHandler(handler:APIHandler) {
    if(!handler) throw new Error("Invalid API Handler.");
    if(this.apiHandlers.indexOf(handler) !== -1) return;
    this.apiHandlers.push(handler);
  }

  removeAPIHandler(handler:APIHandler) {
    if(!handler) throw new Error("Invalid API Handler");
    let index = this.apiHandlers.indexOf(handler);
    if(index === -1) return;
    this.apiHandlers.splice(index, 1);
  }

  async init():Promise<void> {
    let { config } = this.app;

    //Configuration defaults
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

    if(this.autoStart) await this.start();
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


  getAddressInfoHuman(add:net.AddressInfo|string):string {
    if(typeof add === typeof '') return add as string;
    let { port, address } = add as net.AddressInfo;
    return `${address}:${port}`;
  }

  /*** Events ****/
  onServerStarted():void {
    //Confirm the server actually started
    let address = this.getAddressInfoHuman(this.http.address());
    this.logger.info(`HTTP Server Started on ${address}`);
  }

  onServerError(e:Error):void {
    this.logger.severe('HTTP Error');
    this.logger.severe(e);
  }

  onSecureStarted():void {
    //Confirm the server actually started
    let address = this.getAddressInfoHuman(this.https.address());
    this.logger.info(`HTTPS Server Started on ${address}`);
  }

  onSecureServerError(e:Error):void {
    this.logger.severe('HTTPS Error');
    this.logger.severe(e);
  }

  getAPIHandlerFromMethodAndPath(method:string, path:string) {
    //Find if there's any matching request handler
    for(let i = 0; i < this.apiHandlers.length; i++) {
      let handler = this.apiHandlers[i];
      if(!handler.hasMethod(method)) continue;
      if(!handler.hasPath(path)) continue;
      return handler;
    }
    return null;
  }

  async onAPIRequest(req:Request,res:Response, next:NextFunction) {
    let { method, path } = req;

    let handler = this.getAPIHandlerFromMethodAndPath(method, path);
    if(!handler) return next();

    //This matches, get the result
    let request = new APIRequest(this, method, path, req);
    let result:APIResponse;
    try {
      result = await handler.onRequest(request);
    } catch(e) {
      this.logger.severe(`Failed to handle API Request!`);
      this.logger.severe(e);

      //Create a generic error response
      result = { code: RESPONSE_INTERNAL_ERROR, data: `An internal error occured, please try again later.` };
    }
    return sendResponse(result,res);
  }
}
