const bcrypt = require('bcryptjs');
const hash = '$2b$10$YMc1dhFhZOyOO2VN9nfI7.hSlsvuhYRNwODpijbOmkAsTv8.6StqS';
const candidates = ['admin123','admin','password','admin1234','1ai-admin','changeme','Admin123','admin@123','password123','test1234','secret','123456','admin12345','1ai','affiliate','Admin@123','P@ssw0rd','admin@1ai.io','test','test123','demo','letmein','qwerty','root','toor','administrator','pass','12345678','adminadmin','prosper202','prosper','tracking202'];
let found = null;
for (const c of candidates) {
  if (bcrypt.compareSync(c, hash)) { found = c; break; }
}
console.log(found ? 'MATCH: ' + found : 'NO_MATCH');
