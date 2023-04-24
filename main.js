import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { Network, Alchemy } from "alchemy-sdk";
import { ethers } from "ethers";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = "FBLzs61qh4ezL3XbY6vdjOxoUAkTXcKf";
const ETHERSCAN_API_KEY = "I3GDMPD27UYYAWF23MDDHI9G546KXWRNTT";

const settings = {
  apiKey: API_KEY,
  Network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(settings);

async function main() {
  // await getTokenMetadata("0xC7A5B2f8CFed62890f9b826A20139169dc9Cc403")
  //   await getTokenBalancesOfAnAdress("0xaec539a116fa75e8bdcf016d3c146a25bc1af93b");
  //   await getTokenContractAbi("0xC7A5B2f8CFed62890f9b826A20139169dc9Cc403");
  //   await getEarlyTokenHolders("0xdAC17F958D2ee523a2206206994597C13D831ec7");
  // await getTransferEventSig("0xC7A5B2f8CFed62890f9b826A20139169dc9Cc403");
  // await getAllTokenHolders("0xC7A5B2f8CFed62890f9b826A20139169dc9Cc403","earliest","latest");
  //   await getTokenHoldersInChunk("0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3");
  // await getMintBlockNumberOfAToken(
  //   "0xdAC17F958D2ee523a2206206994597C13D831ec7"
  // );

  // await getBlockHashByBlockNumber(4634748);
  // await getEarlyNTokenHolders("0xdAC17F958D2ee523a2206206994597C13D831ec7",4634748,10);
  
  // let txHash = await getTxHashOfAToken("0x6982508145454Ce325dDbE47a25d4ec3d2311933");
  // let blockNo = await getBLockNoFromTxHash("0x2afae7763487e60b893cb57803694810e6d3d136186a6de6719921afd7ca304a");
  // await getEarlyNTokenHolders("0x6982508145454Ce325dDbE47a25d4ec3d2311933",blockNo,10);
  // await getEarlyNTokenHoldersCondensed("0xdAC17F958D2ee523a2206206994597C13D831ec7",10);
  // await getEarlyNTokenHolderMetrics("0x6982508145454Ce325dDbE47a25d4ec3d2311933",5);
  await getEarlyNTokenHolderMetrics("0xdAC17F958D2ee523a2206206994597C13D831ec7",50);
  // await getMetricsForAnAdress("0xfbfeaf0da0f2fde5c66df570133ae35f3eb58c9a");
  // await getMetricsForAnAdress("0xdAC17F958D2ee523a2206206994597C13D831ec7");
}

await main();

// async function getTokenMetadataFromTokenContractAdress(tokenAdress) {
//   let res = await axios.post(
//     `https://eth-mainnet.g.alchemy.com/v2/${API_KEY}`,
//     {
//       id: 1,
//       jsonrpc: "2.0",
//       method: "alchemy_getTokenMetadata",
//       params: [tokenAdress],
//     },
//     {
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   console.log(res.data);
//   return res;
// }

async function getAllTokenHolders(tokenAdress, fromBlock, toBlock) {
  let res = await alchemy.core.getLogs({
    fromBlock: fromBlock,
    toBlock: toBlock,
    address: tokenAdress,
    topics: [
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    ],
  });
  //   console.log(res);
  let tokenHoldersSet = new Set();

  res.forEach((ele) => {
    tokenHoldersSet.add(ele.topics[1]);
    tokenHoldersSet.add(ele.topics[2]);
  });

  return tokenHoldersSet;
}




async function getTokenHoldersInChunk(tokenAdress) {
  let tokenHoldersSet = new Set();
  let latestBlockNum = await alchemy.core.getBlockNumber();
  // console.log(latestBlockNum);
  //   let jump = Math.floor(latestBlockNum/100);
  let jump = 10;
  let start = 0;
  let end = jump;

  while (end < latestBlockNum) {
    let chunk = await getAllTokenHolders(
      tokenAdress,
      "0x" + start.toString(16),
      "0x" + end.toString(16)
    );
    // console.log(chunk);
    chunk.forEach((ele) => {
      tokenHoldersSet.add(ele);
    });

    start += jump;
    end += jump;
  }

  let lastChunk = await getAllTokenHolders(
    tokenAdress,
    "0x" + start.toString(16),
    "0x" + latestBlockNum.toString(16)
  );

  lastChunk.forEach((ele) => {
    tokenHoldersSet.add(ele);
  });

  // console.log(tokenHoldersSet);
  // console.log(tokenHoldersSet.size);
  return tokenHoldersSet;
}

async function getTokenBalancesOfAnAdress(tokenAdress) {
  let res = await axios.post(
    `https://eth-mainnet.g.alchemy.com/v2/${API_KEY}`,
    {
      id: 1,
      jsonrpc: "2.0",
      method: "alchemy_getTokenBalances",
      params: [tokenAdress, "erc20"],
      pageKey: 1,
      maxCount: 100,
    },
    {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
    }
  );
  // console.log(res.data.result.tokenBalances);
  //   let tmd = await getTokenMetadata(res.data.result.tokenBalances[2].contractAddress);
  return res;
}


async function getTxHashOfAToken(tokenAdress) {
  const apiUrl = `https://api.etherscan.io/api?module=contract&action=getcontractcreation&contractaddresses=${tokenAdress}&apikey=${ETHERSCAN_API_KEY}`;
  let res = await axios.get(apiUrl);
  let txHash = res.data.result[0].txHash;
  // console.log("txHash:",res.data.result[0].txHash);
  // let blockNo = await alchemy.core.getBlockWithTransactions(txHash)
  // console.log("blockNo:",blockNo);
  return txHash
}

async function getBLockNoFromTxHash(txHash) {
  const response = await alchemy.transact.getTransaction(txHash)
  // console.log(response.blockNumber)
  return response.blockNumber
}

async function getBlockHashByBlockNumber(blockNo) {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const data = {
    jsonrpc: '2.0',
    method: 'eth_getBlockByNumber',
    params: ["0x" + blockNo.toString(16), true],
    id: 0
  };
  
  let res = await axios.post(`https://eth-mainnet.g.alchemy.com/v2/${API_KEY}`, data, config)

  // console.log(res.data.result.hash);
  return res.data.result.hash;
}

async function getEarlyNTokenHoldersCondensed(tokenAdress,n) {
  let txHash = await getTxHashOfAToken(tokenAdress);
  let blockNo = await getBLockNoFromTxHash(txHash);
  let topHolders = await getEarlyNTokenHolders(tokenAdress,blockNo,n);
  // console.log(topHolders);
  return topHolders;
}

async function getEarlyNTokenHolders(tokenAdress,blockNo,n) {
  // let blockNo =getMintBlockNumberOfAToken(tokenAdress)
  // console.log(blockNo);
  let jump = 10000;
  let start = blockNo
  let end = start+ jump

  let tokenHoldersSet = new Set();
  while(tokenHoldersSet.size<n){

    let res = await alchemy.core.getLogs({
      fromBlock: "0x"+ start.toString(16),
      toBlock: "0x" + end.toString(16),
      address: tokenAdress,
      topics: [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      ],
    });
    
    // console.log(res);
  
    res.forEach((ele) => {
      tokenHoldersSet.add(ele.topics[1]);
      tokenHoldersSet.add(ele.topics[2]);
    });

    start = start + jump;
    end = end+ jump;
  
  }

  let topNEarlyTokenHolders = Array.from(tokenHoldersSet).slice(0, n);
  // console.log(topNEarlyTokenHolders)
  let topNEarlyTokenHolderscondensed = topNEarlyTokenHolders.map(x => hexFormatter(x))
  console.log(topNEarlyTokenHolders,topNEarlyTokenHolderscondensed)
  return topNEarlyTokenHolderscondensed;
}

async function getEarlyNTokenHolderMetrics(tokenAdress,n){
  let earlyTokenHolders = await getEarlyNTokenHoldersCondensed(tokenAdress,n);
  let tokenHoldersMetric =  {}
  await Promise.all(earlyTokenHolders.map(async (ele)=>{
    tokenHoldersMetric[ele.toString()] = await getMetricsForAnAdress(ele);
  }));
  console.log(tokenHoldersMetric);
  let tokenFrequencyArraySorted = await commonTokensOfEarlyNHolders(tokenHoldersMetric);
  dumpJsonInFile(earlyTokenHolders,'earlyTokenHolders.json');
  dumpJsonInFile(tokenHoldersMetric,'tokenHolderMetrics.json');
  dumpJsonInFile(tokenFrequencyArraySorted,'commonTokens.json');
  return tokenHoldersMetric;
}

async function commonTokensOfEarlyNHolders(tokenHoldersMetric){
  let tokenFrequencyMap = {}
  let tokenFrequencyArraySorted = [];
  
  for (let key in tokenHoldersMetric){
    tokenHoldersMetric[key].tokenHoldings?.forEach((ele) =>{
      if(ele.tokenName){
        if(tokenFrequencyMap[ele.tokenName]){
          tokenFrequencyMap[ele.tokenName]+=1
        }else tokenFrequencyMap[ele.tokenName]=1
      }
    })
  }

  for (let ele in tokenFrequencyMap) {
    tokenFrequencyArraySorted.push([ele, tokenFrequencyMap[ele]]);
  }
  
  // console.log(tokenFrequencyArraySorted.length);
  // console.log(tokenFrequencyArraySorted);
  tokenFrequencyArraySorted.sort(function(a, b) {
      return b[1] - a[1];
  });



  console.log(tokenFrequencyMap);
  console.log(tokenFrequencyArraySorted);
  console.log(Object.keys(tokenFrequencyMap).length);
  console.log(tokenFrequencyArraySorted.length);
  
  return tokenFrequencyArraySorted;
}


async function getMetricsForAnAdress(walletAdress){
  let resObj = {};
  resObj.ethBalance = null;
  resObj.tokenHoldings= null;
  resObj.nftHoldings = null;
  try{
    let res1 = await alchemy.core.getBalance(walletAdress, "latest");
    let balance = parseInt(res1._hex);
    resObj.ethBalance = balance;
  }catch(err){
    console.log("ERROR FOR THIS API");
  }

  // console.log(balance,resObj);
  console.log(walletAdress);
  try{
    let res2 = await alchemy.core.getTokenBalances(walletAdress);
    resObj.tokenHoldings = res2.tokenBalances;
      // console.log(resObj.tokenHoldings)
    resObj.tokenHoldings = await Promise.all(resObj.tokenHoldings.map(async (ele)=>{
    ele.tokenBalance= parseInt(ele.tokenBalance);
    let tokenMetadata=await alchemy.core.getTokenMetadata(ele.contractAddress);
    ele.tokenName = tokenMetadata.name;
    ele.tokenSymbol = tokenMetadata.symbol;
    return ele;
  }));
  }catch(err){
    console.log("ERROR FOR THIS API");
  }

  try{
      //Call the method to get the nfts owned by this address
      let res3 = await alchemy.nft.getNftsForOwner(walletAdress)
      resObj.nftHoldings = []
      // console.log(res3);
      await Promise.all(res3.ownedNfts.map(async (ele)=>{
        let objNft={}
        objNft.tokenType=ele.tokenType;
        objNft.balance=ele.balance;
        objNft.title=ele.title;
        objNft.name=ele.contract.name;
        objNft.symbol=ele.contract.symbol;
        objNft.imageUrl=ele.media[0]?.raw;
        resObj.nftHoldings.push(objNft)
      }));
  }catch(err){
    console.log("ERROR FOR THIS API");
  }
  

  // console.log(resObj.nftHoldings);
  // console.log(walletAdress,"::::::::::::");
  // console.log(resObj);

  return resObj;
}

// async function getTokenMetadataFromTokenContractAdress(tokenAdress){
//       let response = await alchemy.core.getTokenMetadata(tokenAdress)
//       console.log(response)
// }

function hexFormatter(hexToShorted) {
  var shortedtHex = hexToShorted.replace(/^(0x)0+(0?.*)$/, "$1$2")
  return shortedtHex;
}

function dumpJsonInFile(jsonData,filename){
  const fs = require('fs');
  var jsonContent = JSON.stringify(jsonData);
  // console.log(jsonContent);
  
  fs.writeFile(filename, jsonContent, 'utf8', function (err) {
      if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
      }
  
      console.log("JSON file has been saved.");
  });
}