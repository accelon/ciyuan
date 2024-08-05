import {nodefs,writeChanged,readTextLines} from 'ptk/nodebundle.cjs'
import {parseMDictEntry} from './src/parsemdict.js'
await nodefs;
const srcfn='raw/ciyuan.txt';//output of dump.js
const out=[]
const convert=(lines)=>{
    const entry=[];
    let name='';
    for (let i=0;i<lines.length;i++) {
        if (i%100==0) process.stdout.write("\r   "+i);
        const line=lines[i];
        const at=line.indexOf('\t')
        if (~at) {
            if (name) {
                out.push(parseMDictEntry(name,entry));
            }
            name=line.slice(0,at);
            entry.length=0;
        } else {
            entry.push(line.slice(at+1))
        }
    }
    if (name) out.push(parseMDictEntry(name,entry));
}
convert(readTextLines(srcfn));
writeChanged('raw/ciyuan.off',out.join('\n'),true)