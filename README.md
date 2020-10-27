## Questionnaire Dynamic Component

This components were extracted from [republik-frontend - Questionnaire](https://github.com/orbiting/republik-frontend).

### Develop

```bash
npm run dev:code
# run in seperate tab/window
npm run dev:server
open http://localhost:3000/
```

#### Development Server Env

You can use a git-excluded .env file in development. Add styleguide configuration there.

Bootstrap your .env file:

```
cp test/.env.example test/.env
```

The example assumes you'll have a backend running on port 5000. You'll will need to add the host of this dev app to the backends cors list:

```
CORS_WHITELIST_URL=http://localhost:3000
```

### Deploy

```bash
npm run build
npm run deploy
```

### Clear CDN

Goto https://app.keycdn.com/zones/purgeurl/87880 and enter:

```
/s3/republik-assets/dynamic-components/questionnaire-dn/index.js
```

If you change asset files be sure to purge those too.

### Setups

#### Slider Question with Live Distribution

Example DB Setup

```sql
INSERT INTO "public"."questionnaires"("id", slug", "description", "beginDate", "endDate", "allowedRoles", "liveResult", "submitAnswersImmediately", "updateResultIncrementally", "noEmptyAnswers", "unattributedAnswers") VALUES('fc755123-e4a0-445d-86bd-febdac3ff2f1', mss-schwabb', 'mss-schwabb', 'NOW()', '2119-06-11 15:26:18.711+02', '[]', TRUE, TRUE, TRUE, TRUE, TRUE) RETURNING "id", "slug", "description", "beginDate", "endDate", "allowedRoles", "result", "createdAt", "updatedAt", "liveResult", "submitAnswersImmediately", "updateResultIncrementally", "noEmptyAnswers", "unattributedAnswers";


INSERT INTO "public"."questions"("questionnaireId", "order", "text", "type", "typePayload", "metadata") VALUES('fc755123-e4a0-445d-86bd-febdac3ff2f1', 0, 'Wo liegt Ihre Frist?', 'Range', '{"kind": "continous", "ticks": [{"label": "Befruchtung", "value": 0}, {"label": "Geburt", "value": 1}]}', '{"histogramTicks": 250}') RETURNING "id", "questionnaireId", "order", "text", "type", "typePayload", "createdAt", "updatedAt", "metadata", "hidden";
```

Example Dynamic Config

```json
{
  "autoHtml": false,
  "props": {
    "slug": "mss-schwabb",
    "hideAnonymize": true,
    "settings": [
      {
        "order": 0,
        "colors": {
          "empty": "#ffffff",
          "min": "#EFEFEF",
          "max": "#7F7F7F",
          "clusters": [
            "#fbfbfb",
            "#f7f7f7",
            "#f3f3f3",
            "#efefef",
            "#eaeaea",
            "#e6e6e6",
            "#e2e2e2",
            "#dedede",
            "#dadada",
            "#d6d6d6"
          ],
          "answer": "#048e02"
        },
        "slider": {
          "step": 0.001
        },
        "augments": [
          {
            "path": "[0].userAnswer.payload.value",
            "color": "#048e02",
            "label": "Ihre Position"
          },
          {
            "path": "[0].rangeResults.median",
            "color": "#ba5968",
            "label": "Mittelwert"
          }
        ]
      }
    ]
  },
  "src": "https://cdn.republik.space/s3/republik-assets/dynamic-components/questionnaire/index.js"
}
```




