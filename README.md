# Harness Deploy Action

## Description

Call the Harness.io API to deploy an application.

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

   - name: Deploy Link
     run: |
       echo harness_url: ${{ steps.deploy.outputs.harness_url }}
```

## Inputs

### webhookUrl

The full webhook url for harness, including the authentication token. You **should** pass this as a secret.

e.g. `https://app.harness.io/gateway/api/webhooks/XXXXXXXX?accountId=YYYYYYYYYY`, where `XXXXXXXX` and `YYYYYYYY` are actual tokens. You can get this from the harness UI.

### application

String id of the application to deploy.

You may want to use a secret if your repo (and hence workflow file) are public, however this will break the URL when displayed by github actions.

### services

String, comma separated list of services to deploy.

### version

String version to deploy.

## Outputs

### harness_url

The harness url to watch the deploy on. Note that this contains the application
id.

### error

If the harness API returned and error it will be in this output.
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
