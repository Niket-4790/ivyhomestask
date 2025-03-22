const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://35.200.185.69:8000';
const VERSION = 'v3';
const MAX_RESULTS = 15; 
const PREFIX_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?/`~';
const CONCURRENCY_LIMIT = 10;
const BATCH_DELAY_MS = 100;
const MAX_PREFIX_LENGTH = 5;
let successfulRequests = 0;
let failedRequests = 0;
let totalRequests = 0;
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
    this.complete = false;
  }
}
class Trie {
  constructor() {
    this.root = new TrieNode();
  }
  insert(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEnd = true;
  }
  
  markComplete(prefix) {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.complete = true;
  }
  
  isComplete(prefix) {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return node.complete;
  }
  
  getAllWords() {
    const words = [];
    function dfs(node, prefix) {
      if (node.isEnd) words.push(prefix);
      for (const char in node.children) {
        dfs(node.children[char], prefix + char);
      }
    }
    dfs(this.root, '');
    return words;
  }
}

const trie = new Trie();
async function queryAutocomplete(query) {
  try {
    totalRequests++;
    const url = `${BASE_URL}/${VERSION}/autocomplete?query=${encodeURIComponent(query)}`;
    const response = await axios.get(url);
    successfulRequests++;
    console.log(`Request #${totalRequests} successful for prefix "${query || 'empty'}"`);
    return response.data;
  } catch (error) {
    failedRequests++;
    console.error(`Error for prefix "${query}": ${error.message}`);
    return null;
  }
}
async function processPrefix(prefix) {
  const response = await queryAutocomplete(prefix);
  if (!response) return { prefix, results: [] };
  const results = response.results || [];
  results.forEach(name => trie.insert(name));
  return { prefix, results };
}
async function extractAllNames() {
  const processedPrefixes = new Set();
  const queue = ['']; 
  let completedPrefixes = 0;
  const startTime = Date.now();
  async function processBatch(batch) {
    const tasks = batch.map(prefix => processPrefix(prefix));
    return await Promise.all(tasks);
  }

  while (queue.length > 0) {
    const batch = [];
    while (queue.length > 0 && batch.length < CONCURRENCY_LIMIT) {
      const prefix = queue.shift();
      if (processedPrefixes.has(prefix) || trie.isComplete(prefix)) continue;
      processedPrefixes.add(prefix);
      batch.push(prefix);
    }
    
    if (batch.length === 0) continue;
    
    const batchResults = await processBatch(batch);
    for (const { prefix, results } of batchResults) {
      completedPrefixes++;
      if (completedPrefixes % 10 === 0) {
        console.log(`Progress: ${completedPrefixes} prefixes processed, ${queue.length} in queue, ${trie.getAllWords().length} names found`);
      }
      if (results.length === MAX_RESULTS && prefix.length < MAX_PREFIX_LENGTH) {
        for (const char of PREFIX_CHARS) {
          const nextPrefix = prefix + char;
          if (!processedPrefixes.has(nextPrefix)) {
            queue.push(nextPrefix);
          }
        }
      } else {
        trie.markComplete(prefix);
      }
    }    
    await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
  }
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  const allNames = trie.getAllWords();
  fs.writeFileSync('v3_names_trie.json', JSON.stringify(allNames, null, 2));
  
  console.log('\n--- EXTRACTION SUMMARY ---');
  console.log(`Total unique names found (from trie): ${allNames.length}`);
  console.log(`Successful API requests: ${successfulRequests}`);
  console.log(`Failed API requests: ${failedRequests}`);
  console.log(`Total API requests made: ${totalRequests}`);
  console.log(`Prefixes processed: ${completedPrefixes}`);
  console.log(`Time taken: ${Math.floor(duration / 60)} minutes ${Math.floor(duration % 60)} seconds`);
  console.log('------------------------\n');
  console.log(`Number of results found in v2 autocomplete: ${allNames.length}`);
  
  process.exit(0);
}
extractAllNames();
