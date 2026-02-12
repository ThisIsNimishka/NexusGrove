
node -e "
const fs = require('fs');
console.log('\n=== Network Access URLs ===\n');
console.log('✅ Corp Network (Static):  http://10.48.95.172:3000');
console.log('✅ SE Network:             http://10.223.163.100:3000');
console.log('\nLM Studio Backend is LISTENING ON ALL INTERFACES (0.0.0.0:1234)');
console.log('It will accept connections from both networks automatically.\n');
"
