const fs = require("fs");
const os = require("os");
const crypto = require("crypto");

function setEnvValue(key, value) {
    const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);
    const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
        return line.match(new RegExp(key));
    }));
    ENV_VARS.splice(target, 1, `${key}=${value}`);
    fs.writeFileSync("./.env", ENV_VARS.join(os.EOL));

}

var jwt_secret_generated = crypto.randomBytes(256).toString('hex');
setEnvValue("SECRET_JWT", jwt_secret_generated);
