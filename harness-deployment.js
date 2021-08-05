const core = require('@actions/core');
const github = require('@actions/github');

class HarnessDeployment {
    constructor(webhookUrl, application, version, services, poll_for_deploy_completion) {
        this.webhookUrl = webhookUrl,
        this.application = application,
        this.version = version,
        this.services = services,
        this.poll_for_deploy_completion = poll_for_deploy_completion
    }

    start() {
        console.log(`Deploying application:${this.application} (${this.services}) at ${this.version}`)
        this.makeRequest();
    }

    makeRequest() {
        var request = new XMLHttpRequest();
        request.open('POST', this.webhookUrl, false);  // `false` makes the request synchronous
        request.setRequestHeader('Content-Type', 'application/json',);
        request.send(this.payload());

        console.log(`BODY:${request.responseText}`);
        this.do_the_response(request.status, JSON.parse(request.responseText));
    }

    payload() {
        const art = this.services.split(/\s*,\s*/).map(x => { return { service: x, buildNumber: this.version } });

        return JSON.stringify({
            application: this.application,
            artifacts: art
        }, undefined, 2)
    }

    do_the_response(statusCode, data) {
        const { uiUrl, error } = data;
        core.setOutput("harness_url", uiUrl);
        core.setOutput("error", error);

        const request_success = [200, 201, 400].includes(statusCode);
        const deploy_success = ['QUEUED', 'RUNNING', 'PAUSED'].includes(data.status);

        if (request_success && deploy_success) {
            if (data.status == 'PAUSED') {
                core.info("⚠️ Waiting for approval to start the deployment pipeline on Harness")
            } else {
                core.info("🚀 Deployment pipeline is now running on Harness")
            }
            core.info(`Harness deploy submitted, view at ${uiUrl}`)

            if (this.poll_for_deploy_completion == 'true') {
                this.pollForDeployCompletion(data.apiUrl);
            }
        } else {
            if (error) {
                core.error(`💣 Failed to start deployment: ${error}`)
            } else {
                core.error(`💣 Deployment pipeline state is ${data.status}, check the health through the Harness website.`)
            }

            core.setFailed(error || 'Unknown');
        }
    }

    pollForDeployCompletion(apiUrl) {
        while (true) {
            sleep(10)

            // From groovy lib, fix for bug, needs carried forward?
            // Workaround for a bug in the Harness API response, wrong URL is returned
            // apiUrl = apiUrl.replaceFirst("harness.io/api", "harness.io/gateway/api")

            var request = new XMLHttpRequest();
            request.open('GET', this.apiUrl, false);  // `false` makes the request synchronous
            request.setRequestHeader('X-Api-Key', process.env.HARNESS_API_KEY,);
            request.send();

            const ignoreResponses = [408, 429, 503]
             if (ignoreResponses.includes(response.status)) {
                 continue;
             }

            // TODO: Find the right bit of the response to switch on. This is
            // This is the Jenkins code for reference:
            // def parsedResponse = new JsonSlurperClassic().parseText(response.getContent())
            const response = request.responseText

            switch (parsedResponse.status) {
              case "RUNNING":
                console.log("⏳ Deployment is running")
                break
              case "QUEUED":
                console.log("⏳ Deployment is queued")
                break
              case "SUCCESS":
                console.log("🎉 Deployment succeeded")
                break
              case "ABORTED":
                core.error("🛑 Deployment was aborted or cancelled")
                break
              case "REJECTED":
                core.error("🛑 Deployment was rejected")
                break
              case "FAILED":
                core.error("💣 Deployment has failed. Check the Harness link for more details and see https://www.notion.so/freeagent/Deployment-failures-8ef5762f707944a4b880a8970cf16132 for help identifying the issue.")
                break
              default:
                core.error("Unknown status from Harness: ${parsedResponse.status}. Please check deployment link to see what happened and confirm everything's ok.")
                break
            }

            console.log("finished polling")
        }
    }
}

module.exports = HarnessDeployment;
