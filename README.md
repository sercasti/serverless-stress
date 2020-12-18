# Serverless Stress
This projects aims to provide performance metrics of a series of baseline serverless stacks (cases), as to understand the possibilities an limitations of each service separately and when used in combination with others. It does so by deploying the stacks using [serverless framework](https://www.serverless.com/) and stress testing them with [serverless artillery](https://github.com/Nordstrom/serverless-artillery). We provide a set of common use cases but are open to contributions.

# How to run a case
``` shell
npm install -g serverless@1.83.0 # artillery doesn't support serverless 2.x
npm install -g serverless-artillery 
npm install
npm run stress --case=vanilla
```

This will take three steps:
* Deploys the "tester" function - the one serverless artillery uses to execute tests (aka load generator)
* Deploys the "tested" case - in this case "vanilla" - a simple vanilla JS "Hello World!" returning function
* Start the execution of the stress tests (this happens in the cloud)

After it finishes, you should be able to view the results as CloudWatch metrics, in the `Serverless Stress` namespace.

# How to create a new case

Each case should be a folder in the `packages` folder, containing:
* A `serverless.yml` file describing the service you want to test.
* A `script.yml` file that describes the test you would want so exectue. Note that this file will get merged with the one in `packages/tester/default-script.yml` - the case's script having precedence in the merge. You can get more information about these script files [here](https://artillery.io/docs/guides/guides/test-script-reference.html#Overview). 
* Additionaly, the tester script expects that your stack -after deploy- creates a JSON file in `packages/{your-case}/.tmp/output.json` with a `ServiceEndpoint` key that will be used as the base URL for your test script. By default, our test script sets `config.target` to whatever comes in that value. There are samples on how to do this in our cases - the easy way is using the `serverless-stack-output` plugin (which requires an `output.js` file - samples also provided). For more info on this, please check [the plugin's page](https://www.serverless.com/plugins/serverless-stack-output).
