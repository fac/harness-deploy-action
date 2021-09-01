# Harness Deploy Action

## Description

Call the [Harness.io](https://harness.io/) API to deploy an application.

## Usage

```yaml
   - name: Deploy
     id: deploy
     uses: fac/harness-deploy-action@v1
     with:
       webhookUrl: ${{ secrets.HARNESS_WEBHOOK_URL }}
       application: XYZ12345678ABC
       services: web,console,job
       version: ${{ github.sha }}
       waitForDeploy: false # optional
       harnessApiKey: ${{ secrets.HARNESS_API_KEY }} # only required when waitForDeploy is true

   - name: Deploy Link
     run: |
       echo harness_url: ${{ steps.deploy.outputs.harness_url }}
```

## Package for distribution

GitHub Actions will run the entry point from the action.yml. Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos.  Packaging the action will create a packaged action in the dist folder.

Run prepare

```bash
yarn run prepare
```

Since the packaged index.js is run from the dist folder.

After pushing to GitHub, an Action running on this repo will check if the `dist/` folder is up to date for you. If it's not up to date, the Action
will run `yarn prepare` to update the `dist/` folder for you and push a commit back to your branch with the updated code.

```bash
git add dist
```

## Run tests

Run tests using

```bash
yarn run test
````

Tests are also run in an action on GitHub.

## Inputs

### webhookUrl

The full webhook url for harness, including the authentication token. Add the
URL as an Actions secret on your repo, and pass it to the action.

The value needs to be the complete URL (include `https://`), the action will
make a request using it as it, with a payload built from the other inputs.

For this you need to a [Harness webhook trigger](https://docs.harness.io/article/ys3cvwm5gc-trigger-a-deployment-on-git-event)
setup with a custom payload. Go to *Setup >> App Name >> Triggers* in the UI,
you can add a trigger if you don't have one. Click *Manual Trigger* on the one
you want to use and copy the Webhook URL from the top of the dialog that opens.

### application

String id of the application to deploy. You can get this from harness, by going
to *Setup >> App Name* and then copying from the url, path segment after `app/`.

### services

String, comma separated list of services to deploy.

### version

String version to deploy.

## Outputs

### harness_url

The harness url to watch the deploy on. Note that this contains the application
id.

### error

If the harness API returned an error, it will be in this output.
## Environment Variables

None.
## Authors

* FreeAgent dev-platform opensource@freeagent.com
## Licence

```
Copyright 2021 FreeAgent Central Ltd.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
