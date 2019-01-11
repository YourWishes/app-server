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

import * as express from 'express';

import { APIResponse } from './APIResponse';
import { APIRequest } from './APIRequest';

export abstract class APIHandler {
  methods:string[];
  paths:string[];

  constructor(methods:string[]|string, paths:string[]|string) {
    //Take string and convert to array
    if(!Array.isArray(methods)) methods = [ methods ];
    if(!Array.isArray(paths)) paths = [ paths ];

    //Validate
    if(!methods.length) throw new Error('You must provide a method.');
    if(!paths.length) throw new Error('You must provide a path');

    methods.forEach(e => {
      if(typeof(e) !== 'string') throw new Error('Methods must be strings');
    });

    paths.forEach(e => {
      if(typeof(e) !== 'string') throw new Error('Paths must be strings');
    });

    //Set
    this.methods = methods.map(e => e.toUpperCase());
    this.paths = paths;
  }

  hasMethod(method:string):boolean { return this.methods.indexOf(method.toUpperCase()) !== -1; }
  hasPath(path:string):boolean {
    for(let i = 0; i < this.paths.length; i++) {
      if(this.paths[i] === path) return true;
    }
    return false;
  }

  abstract async onRequest(request:APIRequest):Promise<APIResponse>;
}
