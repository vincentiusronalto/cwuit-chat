const bcrypt = require('bcrypt');
const saltRounds = 8;
let password = 'endlessfrontier'

async function pass() {
    let pass = await bcrypt.hash(password,saltRounds)
    console.log(pass)
}

pass()


