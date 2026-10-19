/* Ultimate LMS Stockfish loader. GPL-3.0-or-later; vendor engine is unchanged.
 * The WASM is split into files under 20 MB for static hosting uploads.
 */
const engineFetch=self.fetch.bind(self);
const pieces=["stockfish-19-single.part-0.bin", "stockfish-19-single.part-1.bin", "stockfish-19-single.part-2.bin", "stockfish-19-single.part-3.bin", "stockfish-19-single.part-4.bin", "stockfish-19-single.part-5.bin"];
const expectedSize=99102793;
self.fetch=async function(input,options){
 const address=typeof input==='string'?input:input instanceof URL?input.href:input.url;
 if(!new URL(address,self.location.href).pathname.endsWith('/stockfish-19-single.wasm'))return engineFetch(input,options);
 let index=0,reader=null,loaded=0;
 const stream=new ReadableStream({
  async pull(controller){try{
   while(!reader){
    if(index===pieces.length){if(loaded!==expectedSize)throw Error('Incomplete engine download');controller.close();return;}
    const response=await engineFetch(new URL(pieces[index++],self.location.href),options);
    if(!response.ok)throw Error('Engine asset HTTP '+response.status);
    if(!response.body)throw Error('Streaming downloads unavailable');reader=response.body.getReader();
   }
   const chunk=await reader.read();
   if(chunk.done){reader=null;return this.pull(controller);}
   loaded+=chunk.value.byteLength;controller.enqueue(chunk.value);
   self.postMessage({type:'lms-engine-progress',loaded,total:expectedSize});
  }catch(error){controller.error(error);}},
  cancel(){return reader?.cancel();}
 });
 return new Response(stream,{headers:{'Content-Type':'application/wasm','Content-Length':String(expectedSize)}});
};
importScripts('stockfish-19-single.core.js');
