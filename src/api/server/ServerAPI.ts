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

import { RESPONSE_INTERNAL_ERROR } from '@yourwishes/app-api';
import * as express from 'express';
import { Router, Request, Response, NextFunction } from 'express';

import { ServerModule } from '~module';
import { ServerAPIRequest, ServerAPIHandler, ServerAPIResponse } from './../';

export class ServerAPI {
  module:ServerModule;

  //API
  apiRouter:Router;
  apiHandlers:ServerAPIHandler[]=[];

  constructor(module:ServerModule) {
    this.module = module;

    //Create our API Router
    this.apiRouter = express.Router();
    this.apiRouter.all('*', (req,res,next) => this.onAPIRequest(req,res,next));
    this.module.server.express.use(this.apiRouter);
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

  addAPIHandler(handler:ServerAPIHandler) {
    if(!handler) throw new Error("Invalid API Handler.");
    if(this.apiHandlers.indexOf(handler) !== -1) return;
    this.apiHandlers.push(handler);
  }

  removeAPIHandler(handler:ServerAPIHandler) {
    if(!handler) throw new Error("Invalid API Handler");
    let index = this.apiHandlers.indexOf(handler);
    if(index === -1) return;
    this.apiHandlers.splice(index, 1);
  }

  sendResponse(response:ServerAPIResponse, res:Response) {
    res.status(response.code).json(response.data);
  }

  async onAPIRequest(req:Request,res:Response, next:NextFunction) {
    let { method, path } = req;

    let handler = this.getAPIHandlerFromMethodAndPath(method, path);
    if(!handler) return next();

    //This matches, get the result
    let request = new ServerAPIRequest(this.module, method, path, req);
    let result:ServerAPIResponse;
    try {
      result = await handler.onRequest(request);
    } catch(e) {
      this.module.logger.severe(`Failed to handle API Request!`);
      this.module.logger.severe(e);

      //Create a generic error response
      result = { code: RESPONSE_INTERNAL_ERROR, data: `An internal error occured, please try again later.` };
    }
    return this.sendResponse(result,res);
  }
}
