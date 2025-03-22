const axios = require('axios');

const BASE_URL = 'http://35.200.185.69:8000';

async function queryAutocomplete(query,version) {
    try {
      const url = `${BASE_URL}/${version}/autocomplete?query=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
async function exploreAPI() {
 
    console.log('\nQuery  in v1 starting with alphabets:');
    const v1alphabet= await queryAutocomplete('a', 'v1');
    console.log( v1alphabet);
  
    console.log('\nQuery  in v1 starting with number:');
    const v1number = await queryAutocomplete('1', 'v1');
    console.log(v1number);
  
    console.log('\nQuery  in v1 starting with special character:');
    const v1specchar = await queryAutocomplete('!', 'v1');
    console.log( v1specchar);
  
  console.log('\nQuery  in v2 starting with alphabets:');
  const v2alphabet= await queryAutocomplete('a', 'v2');
  console.log( v2alphabet);

  console.log('\nQuery  in v2 starting with number:');
  const v2number = await queryAutocomplete('1', 'v2');
  console.log(v2number);

  console.log('\nQuery  in v2 starting with special character:');
  const v2specchar = await queryAutocomplete('!', 'v2');
  console.log( v2specchar);
  
  console.log('\nQuery  in v3 starting with alphabets:');
  const v3alphabet= await queryAutocomplete('a', 'v3');
  console.log( v3alphabet);

  console.log('\nQuery  in v3starting with number:');
  const v3number = await queryAutocomplete('1', 'v3');
  console.log(v3number);

  console.log('\nQuery  in v3 starting with special character:');
  const v3specchar = await queryAutocomplete('!', 'v3');
  console.log( v3specchar);
}

exploreAPI();