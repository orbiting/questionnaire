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
