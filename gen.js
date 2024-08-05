import {nodefs,writeChanged,readTextLines,styledNumber, splitUTF32Char} from 'ptk/nodebundle.cjs'
await nodefs;
const lines=readTextLines('raw/ciyuan.off');//output of convert.js
import {PUA2HZPX} from './puahzpx.js'

const main=[],phonetic=[],proof=[],pua=[];
const Yixiang={'㊀':1,'㊁':2,'㊂':3,'㊃':4,'㊄':5,'㊅':6,'㊆':7,'㊇':8,'㊈':9,'㊉':10,
    '⑪':11,'⑫':12,'⑬':13,'⑭':14,'⑮':15,'⑯':16,'⑰':17,'⑱':18,'⑲':19,'⑳':20,
    '㉑':21,'㉒':22,'㉓':23,'㉔':24}
const replaceHZPX=line=>{
    for (let hzpx in PUA2HZPX) {
        const pat=PUA2HZPX[hzpx];
        
        line=line.replace(pat,'‵'+hzpx+'′');
    }
    return line
}
const split=(lines)=>{
    while (lines.length&&lines[0]=='') lines.shift();
    const yin=[];
    const body=[];
    const entrypua=[];
    let wordhead='',pyz=0, //pinyinzhu
    yx=0;
    const emitPhonetic=()=>{
        if (yin.length) { 
            phonetic.push(
            wordhead+(pyz>1?styledNumber(pyz,'₁'):'') // 形、音群
            +'\t'+yin.join(''))  //音項
            yin.length=0;
        }
    }

    for (let i=0;i<lines.length;i++) {
        let line=lines[i];

        if (line.match(/[\u2ff0-\u2fff]/)) {
            line=replaceHZPX(line);
        }

        const m=line.match(/\^〔([^〕]+)〕/);
        if (m) { //字頭
            emitPhonetic();
            main.push(...body);
            body.length=0;
            pyz=0;
            wordhead=m[1];
        }
        else if (line.startsWith('🗣')) {
            emitPhonetic();
            line=line.slice(2);
            pyz++;
        } else if (line.startsWith('⮀')) {
            
            entrypua.push(line.slice(2))
            line='';
        } else if (line.startsWith('💬')) {
            yx=yx||(Yixiang[line.charAt(1)]||'');
        } else if (line.startsWith('🕮')) { 
            proof.push( wordhead
                + (pyz>1?styledNumber(pyz,'₁'):'')+yx // 形、音群、義項
                +'\t'+line.slice(2)); //書證
            line='';
        }
        //取出音項
        line=line.replace(/\^([a-z]+﹛[^﹜]+﹜)[。，]*/g,(m,m1)=>{
            yin.push(m1);
            return ''
        })

        if (line) body.push(line);
    }
    emitPhonetic();
}

split(lines);
writeChanged('ciyuan-def.off',main.join('\n'),true)
writeChanged('ciyuan-proof.off',proof.join('\n'),true)
writeChanged('ciyuan-phonetic.tsv',phonetic.join('\n'),true)
//writeChanged('ciyuan-pua.tsv',pua.join('\n'),true);//should be empty , move to puahzpx.js
