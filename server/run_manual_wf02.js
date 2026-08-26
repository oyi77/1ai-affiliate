const pipelineWorker = require('./services/pipelineWorker');
const pipelineService = require('./services/pipelineService');
const fs = require('fs');
const pool = require('./db/mysql');

async function manualRun() {
  const url = "https://www.tiktok.com/@mrbeast/video/7339832810332376366";
  
  // mock tikwm bypass for now
  pipelineService.downloadTikTok = async () => {
    return {
      buffer: Buffer.from("dummy video content"),
      caption: "MOCK VIRAL VIDEO",
      hashtags: ["#mock", "#viral"],
      author: "mock_author",
      musicTitle: "mock_music"
    };
  };

  try {
     const jobId = await pipelineWorker.enqueue(url, 'auto');
     console.log("Enqueued jobId:", jobId);
     
     // wait for completion
     let status = "queued";
     while (status !== "completed" && status !== "failed") {
        await new Promise(r => setTimeout(r, 1000));
        let jobObj = pipelineWorker.getStatus(jobId);
        if (jobObj) {
           status = jobObj.status;
           console.log("Status:", status);
        }
     }
     console.log("Final Job status:", pipelineWorker.getStatus(jobId));

  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

manualRun();
