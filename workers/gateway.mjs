export {LmsRuntime} from './runtime.mjs';
const runtime=env=>env.LMS_RUNTIME.getByName('lms-v1');
// Keep the public Worker below the Free plan CPU limit. The private RPC methods
// are accessible only through this binding, never through a URL or client flag.
export default {
  fetch(request,env){return runtime(env).fetch(request);},
  scheduled(event,env,ctx){ctx.waitUntil(runtime(env).schedule(event.scheduledTime));},
  async queue(batch,env){
    for(const message of batch.messages){
      try{
        const result=await runtime(env).runJob(message.body.id);
        if(result.ok||result.permanent)message.ack();
        else message.retry({delaySeconds:Math.max(10,Math.min(43200,Math.ceil(result.retryAfter||2**message.attempts*10)))});
      }catch{message.retry({delaySeconds:60});}
    }
  }
};
