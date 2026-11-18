export const LMS_URL='https://msleaderindustry-hue.github.io/Test-LMS/';
export function discordEnvelope(content,{kind='events',at=Date.now(),part=1,total=1}={}){
  const titles={login:'🟢 Вход в LMS',report:'📊 Отчёт об успеваемости','report-delivery':'📊 Отчёт об успеваемости',events:'👀 Активность учеников',notification:'🔔 Уведомление LMS',maintenance:'🧹 Предложения по уборке'};
  return {embeds:[{title:titles[kind]||'Ultimate LMS',description:content.slice(0,1850),color:kind==='login'?3066993:kind.startsWith('report')?5793266:10181046,url:LMS_URL,timestamp:new Date(at).toISOString(),footer:{text:'Ultimate LMS · Ташкент'+(total>1?` · ${part}/${total}`:'')}}],allowed_mentions:{parse:[]}};
}
