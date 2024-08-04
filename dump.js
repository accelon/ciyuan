import {nodefs,writeChanged} from 'ptk/nodebundle.cjs'
import {default as mod} from "js-mdict"
await nodefs;
const Mdict=mod.default

const dict = new Mdict("raw/辭源.mdx");
const out=[];
for (let i=0;i<dict.keyList.length-1;i++){
    if (i%100==0) process.stdout.write("\r   "+i);
	const {keyText,definition}=dict.fetch_defination(dict.keyList[i]);
	out.push(keyText+'\t'+definition);
}
writeChanged("raw/ciyuan.txt",out.join('\n'),true);