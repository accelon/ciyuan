import {fromObj,nodefs,writeChanged,readTextLines,fromChineseNumber, splitUTF32} from 'ptk/nodebundle.cjs'
await nodefs;
const srcfn='raw/ciyuan.txt';//ciyuan.txt
const out=[];
const parseLine=line=>{
    line=line
    .replace(/<span class="cy_pua">([^<]+)<\/span>/g,'$1') //as it is
    .replace(/<span class="cy_buZi">/g,'') 
    .replace(/<sub class="cy_sub">(\d+)<\/sub>/g,(m,m1)=>{
        return String.fromCharCode(parseInt(m1)+0x2080)
    }).replace(/<sub class="cy_sub">([一二三四五六七八九十]+)<\/sub>/g,(m,m1)=>{ //中文
        const n=fromChineseNumber(m1)
        if (n>10) console.log('wrong chinese number',line)
        return String.fromCharCode(n+0x2080);
    }).replace(/<span class="cy_pua cy_jiaoJi"[^>]+>([^<]+)<\/span>/g,(m,m1)=>{
        return m1;//造字
    }).replace(/<span class="cy_pinYin">([^<]*)<\/span>/g,(m,m1)=>{
        return '^py﹛'+m1+'﹜'
    }).replace(/<span class="cy_fanQie">([^<]+)<\/span>/g,(m,m1)=>{
        return '^fq﹛'+m1+'﹜'
    }).replace(/<span class="cy_zhuYin">([^<]*)<\/span>/g,(m,m1)=>{
        return '^zy﹛'+m1+'﹜'
    }).replace(/<span class="cy_shengDiao">([^<]+)<\/span>/g,(m,m1)=>{
        return '^sd﹛'+m1+'﹜'
    }).replace(/<span class="cy_yunBu">([^<]+)<\/span>/g,(m,m1)=>{
        return '^yb﹛'+m1+'﹜'
    }).replace(/<span class="cy_youDu">([^<]+)<\/span>/g,(m,m1)=>{
        return '^yd﹛'+m1+'﹜'
    }).replace(/<span class="cy_shengLei">([^<]+)<\/span>/g,(m,m1)=>{
        return '^sl﹛'+m1+'﹜'
    }).replace(/<span class="cy_shangGuYunBu">([^<]+)<\/span>/g,(m,m1)=>{
        return '^sg﹛'+m1+'﹜'
    }).replace(/<span class="cy_z">([^<]*)<\/span>/g,(m,m1)=>{
        return '^{'+m1+'}' //傷弓之鳥 ,empty span
    }).replace(/<span class="cy_q">([^<]+)<\/span>/g,(m,m1)=>{
        return '^《'+m1+'》'
    }).replace(/<div class="cy_ziMu">([^<]+)<\/div>/g,(m,m1)=>{
        return '^〔'+m1+'〕';
    }).replace(/<span class="cy_ciMu">([^<]+)<\/span>/g,(m,m1)=>{
        return '\n^〔'+m1+'〕'
    }).replace(/<a class="cy_lianJie">([^<]+)<\/a>/g,(m,m1)=>{//莐藩,飅, 嘲₂𠹗
        return '^['+m1+']'
    }).replace(/<a class="cy_lianJie" link="[^>]+">([^<]+)<\/a>/g,(m,m1)=>{
        return '^['+m1+']'
    }).replace(/<div class="cy_jiaoJiItem" sequence="(\d+)">/g,(m,m1)=>{//替換字
        return '\n⮀'+m1+' '
    }).replace(/<img class="cy_image" src="([A-Z\d]+)\.png"[^>]*\/>/g,(m,fn,title)=>{//替換字
        return '^png('+fn+')'
    }).replace(/<img class="cy_image" src="([A-Z\d]+)\.png" style="block" title="([^\"]+)"\/>/g,(m,fn,title)=>{
        return '^png('+title+'|'+fn+')'
    }).replace(/<span class="cy_shuoMing">([^<]+)<\/span>/g,(m,m1)=>{
    return '㊟'+m1        
    })
    .replace(/<div class="cy_yiXiang"> */g,'\n')
    .replace(/<div class="cy_pinYinZu">/g,'')

    .replace(/<div class="cy_jiaoJiBox">/g,'')
    .replace(/<span class="cy_guYin">/g,'')
    .replace(/<span class="cy_shuZheng">/g,'\n🕮')

    return line.trim();
}
const emitEntry=(name,deflines)=>{
    if (splitUTF32(name).length>1) return;//只處理字頭，詞已含在字頭內
    const entry=[]
    for (let i=0;i<deflines.length;i++) {
        const line=deflines[i];
        if (~line.indexOf('stylesheet')) continue;
        if (~line.indexOf('class="cy"')) continue;
        if (~line.indexOf('cy_ciTiao')) continue;        
        if (~line.indexOf('cy_ziTiao')) continue;
        
        if (~line=='</div>') continue;
        entry.push(line)
    }
    let parsed=parseLine(entry.join(''))
    .replace(/<\/div>/g,'').replace(/<\/span>/g,'')
    .replace(/。(\d+)\./g,"。\n$1.")
    .replace(/。\^/g,"。\n^")
    //.replace(/([^。]{10,})。([’”]*)/g,"$1。$2\n")
    .replace(/\n+/g,'\n')
    .replace(/\x00/g,'')
    
    out.push(parsed);
}
const gen=(lines)=>{
    const entry=[];
    let name='';
    for (let i=0;i<lines.length;i++) {
        if (i%100==0) process.stdout.write("\r   "+i);
        const line=lines[i];
        const at=line.indexOf('\t')
        if (~at) {
            if (name) emitEntry(name,entry);
            name=line.slice(0,at);
            entry.length=0;
        } else {
            entry.push(line.slice(at+1))
        }
    }
    emitEntry(name,entry)
}
gen(readTextLines(srcfn));
writeChanged('ciyuan.off',out.join('\n'))
