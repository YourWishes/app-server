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
import { ServerModule } from './../module/';

export class APIRequest {
  server:ServerModule;
  method:string;
  path:string;
  req:Request;

  constructor(server:ServerModule, method:string, path:string, req:Request) {
    if(!server) throw new Error("Invalid Server Module");
    if(!req) throw new Error("Invalid Request");

    this.server = server;
    this.method = method.toUpperCase();
    this.path = path;
    this.req = req;
  }

  getData() {
    let data = this.req.body || {};
    if(this.method === "GET") data = this.req.query || data;
    return data;
  }

  isStringTrue(t:string) {
    t = t.toLowerCase();
    return (
      t === "true" || t === "1" || t === "checked" || t === 'yes'
    );
  }


  //Some really nice API handlers
  get(key:string=null) {
    let data = this.getData();
    if(!key || !key.length) return data;
    return this.getRecursive(key.split("."), data);
  }

  getRecursive(key_array:string[], data_obj?:object) {
    if(typeof data_obj === typeof undefined) return null;

    let k = key_array[0];
    let o = data_obj[k];
    if(typeof o === typeof undefined) return null;

    //Awesome
    if(key_array.length > 1) {
      if(typeof o !== typeof {}) return null;
      key_array.shift();
      return this.getRecursive(key_array, o);
    }
    return o;
  }

  getInteger(key:string) {
    if(!this.hasInteger(key)) throw new Error("Invalid Data Type!");
    return parseInt(this.get(key));
  }

  getDouble(key:string) {
    if(!this.hasDouble(key)) throw new Error("Invalid Data Type!");
    return parseFloat(this.get(key));
  }

  getBool(key:string) {
    if(!this.hasBool(key)) throw new Error("Invalid Type!");
    let t = this.get(key);
    return this.isStringTrue(t);
  }

  getString(key:string, maxLength:number, allowBlank:boolean=false) {
    if(!this.hasString(key, maxLength, allowBlank)) throw new Error("Invalid Data!");
    return this.get(key)+"";
  }



  has(key:string) {
    let data = this.getData();
    if(typeof key === typeof undefined) return data;
    return this.hasRecursive(key.split("."), data);
  }

  hasRecursive(key_array:string[], data_obj?:object) {
    if(typeof data_obj === typeof undefined) return false;

    let k = key_array[0];
    let o = data_obj[k];
    if(typeof o === typeof undefined) return false;

    if(key_array.length > 1) {
      if(typeof o !== typeof {}) return false;
      key_array.shift();
      return this.hasRecursive(key_array, o);
    }
    return true;
  }

  hasInteger(key:string) {
    if(!this.has(key)) return false;
    let t = parseInt(this.get(key));
    if(typeof t !== "number" || isNaN(t) || !isFinite(t)) return false;
    let tf = parseFloat(this.get(key));
    if(tf !== t) return false;
    return true;
  }

  hasDouble(key:string) {
    if(!this.has(key)) return false;
    let t = parseFloat(this.get(key));
    return typeof t === "number" && !isNaN(t) && isFinite(t);
  }

  hasBool(bool:string) {
    if(!this.has(bool)) return false;
    let t = this.get(bool);
    return (
      t == "true" || t == "1" || t == "checked" || t == "yes" ||
      t == "false" || t == "0" || t == "unchecked" || t == "no" || t.length == 0
    );
  }

  hasString(str:string, maxLength:Number, allowBlank:boolean=false) {
    if(typeof maxLength === typeof undefined) throw new Error("MaxLength check missing.");
    if(!this.has(str)) return false;
    let t = this.get(str);
    let v = typeof t === typeof "" && t.length <= maxLength;
    if(!v) return false;
    if(!allowBlank) {
      t = t.replace(/\s/g, "");
      if(!t.length) return false;
    }
    return typeof t === typeof "" && (t.length <= maxLength ? true : false);
  }


  //Headers
  hasHeader(header:string) {
    return this.req && typeof this.req.get(header) !== typeof undefined
  }

  getHeader(header:string) {
    return this.req.get(header);
  }
}
