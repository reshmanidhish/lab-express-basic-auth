const bcrypt = require('bcryptjs');
const saltRounds = 10
const salt = bcrypt.genSaltSync(saltRounds)

const hash = bcrypt.hashSync(Password, salt);
const verifyPass = bcrypt.compareSync('some random string', hash);