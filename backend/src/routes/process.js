import express from 'express';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import {processImage,PRESETS} from '../services/imageProcessor.js';
import {writePhotoMetadata} from '../services/metadataWriter.js';

const router=express.Router();
const outputDir=path.resolve('output');
fs.mkdirSync(outputDir,{recursive:true});
router.get('/presets',(_req,res)=>res.json(PRESETS));

const timestampForFilename=()=>{
  const now=new Date();
  const pad=value=>String(value).padStart(2,'0');
  return `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())} ${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

router.post('/',async(req,res)=>{
  try{
    const {files=[],preset='web',watermark={},analysis=[],author=''}=req.body;
    console.log(`[process] received ${files.length} file(s), ${analysis.length} analysis result(s), author=${JSON.stringify(author)}`);
    if(!files.length) return res.status(400).json({error:'No files supplied'});

    const jobDir=path.join(
      outputDir,
      `PhotoFlow - ${timestampForFilename()}`
    );
    fs.mkdirSync(jobDir,{recursive:true});

    const processed=[];
    for(const file of files){
      const outputName=`${path.parse(file.originalName).name}.jpg`;
      const outputPath=path.join(jobDir,outputName);

      await processImage(
        file.path,
        outputPath,
        preset,
        {...watermark, enabled: watermark.enabled === true}
      );

      // The analysis and processing uploads are intentionally separate requests,
      // so the multer-generated file ids can differ. Resolve the AI result by
      // stable original filename first, then id, and finally by array position.
      // This guarantees that analysis metadata is associated with the correct
      // output image even when the same source files were uploaded twice.
      const result =
        analysis.find(
          item => item.originalName && item.originalName === file.originalName
        ) ||
        analysis.find(
          item => item.id && item.id === file.id
        ) ||
        analysis[files.indexOf(file)];

      console.log(
        `[process] ${file.originalName}: matched analysis=${Boolean(result)}, author=${JSON.stringify(author)}`
      );

      let metadataResult = {
        saved: false,
        verified: false,
        keywords: []
      };

      let metadataError = '';

      if(result && !result.error && (
        Array.isArray(result.tags) ||
        Array.isArray(result.themes) ||
        typeof result.description === 'string' ||
        typeof author === 'string'
      )){
        try {
          metadataResult = await writePhotoMetadata(
            outputPath,
            {...result, author}
          );

          console.log(
            `[process] ${file.originalName}: metadata verified=${metadataResult.verified}`
          );
        } catch (error) {
          metadataError = error.message;
          console.error(`Metadata error for ${file.originalName}:`, error);
        }
      }

      processed.push({
        originalName:file.originalName,
        outputName,
        metadataSaved:Boolean(metadataResult.saved),
        metadataTags:metadataResult.keywords || [],
        metadataVerified:Boolean(metadataResult.verified),
        metadataError,
        metadataSkipped: !result || Boolean(result.error),
        analysisMatched: Boolean(result)
      });
    }

    const zipPath=`${jobDir}.zip`;

    await new Promise((resolve,reject)=>{
      const out=fs.createWriteStream(zipPath);
      const archive=archiver('zip',{zlib:{level:9}});

      out.on('close',resolve);
      archive.on('error',reject);

      archive.pipe(out);
      archive.directory(jobDir,false);
      archive.finalize();
    });

    res.json({
      processed,
      zip:`/api/process/download/${path.basename(zipPath)}`
    });

  }catch(error){
    console.error(error);
    res.status(500).json({error:error.message});
  }
});

router.get('/download/:name',(req,res)=>{
  const filePath=path.join(outputDir,req.params.name);

  if(!fs.existsSync(filePath)){
    return res.status(404).json({error:'File not found'});
  }

  res.download(filePath,path.basename(filePath));
});

export default router;