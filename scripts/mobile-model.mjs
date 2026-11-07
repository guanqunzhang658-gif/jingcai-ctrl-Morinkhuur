// Produce an additional mobile mesh. Never overwrite the full-resolution asset.
import fs from 'node:fs';
import {MeshoptSimplifier as M} from './meshopt_simplifier.mjs';
await M.ready;
const base=new URL('../public/3d/assets/',import.meta.url);
const b=fs.readFileSync(new URL('morin-optimized.glb',base));
const jsonLength=b.readUInt32LE(12),g=JSON.parse(b.subarray(20,20+jsonLength)),bin=28+jsonLength;
function read(i){const a=g.accessors[i],v=g.bufferViews[a.bufferView],Type={5126:Float32Array,5125:Uint32Array,5123:Uint16Array}[a.componentType],n=a.count*({VEC2:2,VEC3:3}[a.type]||1);const bytes=b.subarray(bin+(v.byteOffset||0)+(a.byteOffset||0),bin+(v.byteOffset||0)+(a.byteOffset||0)+n*Type.BYTES_PER_ELEMENT);return new Type(Uint8Array.from(bytes).buffer);}
const primitive=g.meshes[0].primitives[0];const positions=read(primitive.attributes.POSITION),uv=read(primitive.attributes.TEXCOORD_0),normals=read(primitive.attributes.NORMAL),indices=read(primitive.indices);
const [reduced,error]=M.simplifyWithAttributes(indices,positions,3,uv,2,[.1,.1],null,24000*3,.02);
const [remap,count]=M.compactMesh(reduced),p=new Float32Array(count*3),u=new Float32Array(count*2),n=new Float32Array(count*3);
for(let i=0;i<remap.length;i++)if(remap[i]!==0xffffffff){p.set(positions.subarray(i*3,i*3+3),remap[i]*3);u.set(uv.subarray(i*2,i*2+2),remap[i]*2);n.set(normals.subarray(i*3,i*3+3),remap[i]*3);}
const t=count<65536?new Uint16Array(reduced):reduced;
const texture=fs.readFileSync(process.argv[2]||'/tmp/morin-mobile-texture-small.jpg');
g.bufferViews=[];g.accessors=[];const chunks=[];let offset=0;
function view(bytes){const data=Buffer.from(bytes.buffer,bytes.byteOffset,bytes.byteLength);const i=g.bufferViews.length;g.bufferViews.push({buffer:0,byteOffset:offset,byteLength:data.length});chunks.push(data);offset+=data.length;const padding=(4-offset%4)%4;if(padding){chunks.push(Buffer.alloc(padding));offset+=padding;}return i;}
function accessor(data,type,componentType){const id=g.accessors.length;g.accessors.push({bufferView:view(data),componentType,count:data.length/({VEC2:2,VEC3:3}[type]||1),type});return id;}
primitive.indices=accessor(t,'SCALAR',t instanceof Uint16Array?5123:5125);
primitive.attributes={POSITION:accessor(p,'VEC3',5126),NORMAL:accessor(n,'VEC3',5126),TEXCOORD_0:accessor(u,'VEC2',5126)};
g.images[0].bufferView=view(texture);g.buffers=[{byteLength:offset}];
let json=Buffer.from(JSON.stringify(g));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const payload=Buffer.concat(chunks),header=Buffer.alloc(20),binHeader=Buffer.alloc(8);
header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+payload.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);binHeader.writeUInt32LE(payload.length,0);binHeader.writeUInt32LE(0x004e4942,4);
const result=Buffer.concat([header,json,binHeader,payload]);fs.writeFileSync(new URL('morin-mobile.glb',base),result);
const report={bytes:result.length,triangles:t.length/3,vertices:count,relativeError:error,texture:[1024,1024],source:'morin-optimized.glb',note:'移动端额外减面版本，保留UV和照片贴图；高精度网页模型保持不变。'};
fs.writeFileSync(new URL('mobile-model-report.json',base),JSON.stringify(report,null,2));console.log(report);
