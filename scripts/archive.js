const fs = require("fs");
const path = require("path");
const https = require("https");

const archivePath = path.join(__dirname, "../data/leaderboard-archive.json");
const imageFolder = path.join(__dirname, "../archive-images");

/**
 * BURAYI KENDİ SİSTEMİNE GÖRE DEĞİŞTİR
 * leaderboard'dan top 7 çekmen lazım
 */
async function getLeaderboard() {
  return [
    { image: "https://placekitten.com/500/500", votes: 120 },
    { image: "https://placekitten.com/501/500", votes: 110 },
    { image: "https://placekitten.com/502/500", votes: 100 }
  ];
}

function downloadImage(url, filepath){
  return new Promise((resolve,reject)=>{
    const file = fs.createWriteStream(filepath);
    https.get(url,res=>{
      res.pipe(file);
      file.on("finish",()=>{
        file.close(resolve);
      });
    }).on("error",reject);
  });
}

async function run(){

  const today = new Date().toISOString().slice(0,10);
  const folder = path.join(imageFolder, today);

  if(!fs.existsSync(folder)){
    fs.mkdirSync(folder,{recursive:true});
  }

  let archive = {days:[]};
  if(fs.existsSync(archivePath)){
    archive = JSON.parse(fs.readFileSync(archivePath));
  }

  if(archive.days.find(d=>d.date===today)){
    console.log("already saved");
    return;
  }

  const leaderboard = await getLeaderboard();

  const winners = [];

  for(let i=0;i<leaderboard.length;i++){
    const file = `${folder}/rank-${i+1}.jpg`;

    await downloadImage(leaderboard[i].image, file);

    winners.push({
      rank:i+1,
      image:`/archive-images/${today}/rank-${i+1}.jpg`,
      votes:leaderboard[i].votes
    });
  }

  archive.days.unshift({
    date:today,
    title:`${today} Tournament Winners`,
    winners
  });

  fs.writeFileSync(archivePath, JSON.stringify(archive,null,2));

  console.log("DONE");
}

run();
