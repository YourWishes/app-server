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

import { Request } from 'express';
import { ServerModule } from '~module';
import { APIRequest } from '@yourwishes/app-api';

export class ServerAPIRequest extends APIRequest {
  owner:ServerModule;
  method:string;
  req:Request;

  constructor(server:ServerModule, method:string, path:string, req:Request) {
    super(server, path);
    if(!req) throw new Error("Invalid Request");

    this.method = method.toUpperCase();
    this.req = req;
  }

  getData() {
    let data = this.req.body || {};
    if(this.method === "GET") data = this.req.query || data;
    return data;
  }

  //Headers
  hasHeader(header:string) {
    return this.req && typeof this.req.get(header) !== typeof undefined
  }

  getHeader(header:string) {
    return this.req.get(header);
  }
}
