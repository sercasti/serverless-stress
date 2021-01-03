const execa = require('execa');
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');

async function run(caseToRun) {
    await deployTester();
    await deployCase(caseToRun);
    await runCase(caseToRun);       
}

async function deployTester() {
    console.log("*** Deploying tester function ***");
    await execa.command('npm run deploy', {
        cwd: path.resolve(`${process.cwd()}/packages/tester`),
        stdout: process.stdout
    });
    console.log("*** Finished deploying tester function ***");
}

async function deployCase(caseToRun) {
    console.log("*** Deploying test case: " + caseToRun + " ***");
    await execa.command('npm run deploy', {
        cwd: path.resolve(`${process.cwd()}/packages/${caseToRun}`),
        stdout: process.stdout
    });
    console.log("*** Finished deploying test case: " + caseToRun + " ***");
}

async function runCase(caseToRun) {
    console.log("*** Scheduling test case: " + caseToRun + " ***");
    const defaultScript = YAML.parse(fs.readFileSync(path.resolve(`${process.cwd()}/packages/tester/default-script.yml`))+ '');
    const caseScript = YAML.parse(fs.readFileSync(path.resolve(`${process.cwd()}/packages/${caseToRun}/script.yml`))+ '');
    const stackOutput = require(path.resolve(`${process.cwd()}/packages/${caseToRun}/.tmp/output.json`));
    const script = {...caseScript, ...defaultScript};
    script.config.target = stackOutput.ServiceEndpoint;
    const scriptFileLocation = path.resolve(`${process.cwd()}/packages/${caseToRun}/.tmp/script.yml`);
    fs.writeFileSync(scriptFileLocation, YAML.stringify(script));
    await execa.command(`./node_modules/serverless-artillery/bin/serverless-artillery invoke -p ${scriptFileLocation}`, {
        cwd: path.resolve(`${process.cwd()}/packages/tester`),
        stdout: process.stdout
    });
    console.log("*** Finished scheduling test case: " + caseToRun + " ***");
}

run(process.argv[2]);