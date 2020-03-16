import {request,RequestOptions} from 'http';
import {URL} from 'url';
import {
  IRequestOptions,
  IUploadRequestOptions,
  ResponseObject,
  SDKAdapterInterface,
  StorageType,
  AbstractSDKRequest
} from '@cloudbase/adapter-interface';

declare const window;
declare const process;
declare const global;

function isMatch(): boolean {
  if (typeof window !== 'undefined') {
    return false;
  }
  if(typeof process === 'undefined'){
    return false;
  }
  if(typeof global === 'undefined'){
    return false;
  }
  return true;
}

class NodeRequest extends AbstractSDKRequest {
  public get(options: IRequestOptions): Promise<ResponseObject> {
    return this._request({
      ...options,
      method: 'get'
    });
  }
  public post(options: IRequestOptions): Promise<ResponseObject> {
    return this._request({
      ...options,
      method: 'post'
    });
  }
  // @ts-ignore
  public download(options: IRequestOptions) {
    return new Promise(resolve => {
      resolve({});
    });
  }
  // @ts-ignore
  public upload(options: IUploadRequestOptions): Promise<ResponseObject> {
    return new Promise(async resolve => {
      resolve({})
    });
  }
  protected _request(options: IRequestOptions): Promise<ResponseObject> {
    const method = (String(options.method)).toUpperCase() || 'GET';
    const {url,headers={},data} = options;
    const {hostname,pathname='/',search=''} = new URL(url);
    const contentData = JSON.stringify(data);
    return new Promise(resolve => {
      let result = '';
      const req = request(<RequestOptions>{
        method,
        hostname,
        protocol: 'http:',
        path: pathname+search,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(contentData)
        }
      },res => {
        res.setEncoding('utf8');
        res.on('data',content=>{
          result += content;
        });
        res.on('end',()=>{
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(result||'{}')
          });
        })
      });

      req.on('error', err => {
        console.error(err);
      });

      req.write(contentData);
      req.end();
    });
  }
}

function genAdapter() {
  // @ts-ignore
  const adapter: SDKAdapterInterface = {
    root: {},
    reqClass: NodeRequest,
    primaryStorage: StorageType.none
  };
  return adapter;
}

const adapter = {
  genAdapter,
  isMatch,
  runtime: 'nodejs'
}

export {
  adapter
};

export default adapter;