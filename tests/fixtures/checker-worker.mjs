import {calculateExcel} from '../../server/generated/excel-checker.mjs';
const lesson={name:'СУММ',enName:'SUM',table:[['Значения'],[2],[3]],expected:['=SUM(A2:A3)'],result:'5'};
export default {async fetch(){try{const verified=calculateExcel({lesson,type:'verify'}),good=calculateExcel({lesson:{...lesson,...verified},type:'answer',formula:'=SUM(A2:A3)'}),bad=calculateExcel({lesson:{...lesson,...verified},type:'answer',formula:'=SUM(A2:A2)'});return Response.json({verified,good,bad});}catch(e){return Response.json({error:e.message,code:e.code},{status:500});}}};
