# Redwood setup command args parsing POC

Target args shape:

```
yarn rw setup --global-flag +scope:value --scoped-flag +scope --scoped-arg=value +scope --scoped-arg value
```

For example:

```
yarn rw setup --force +deploy:netlify --migrate-data +auth:supabase +tailwind --ui --version 2 +i18n --lang=en,fr
```

However `yargs`, which is used internally for the `setup` command, is not directly configurable to work with 
this format.  
This PoC demonstrates how we can transform the `argv` array before it's parsed by `yargs` to leverage the 
dotted notation that yargs supports, so that we can provide a nice DevX to both Redwood's users and internal devs.

The above example is transformed to:

```
--force --deploy=netlify --deploy.migrate-data --auth=supabase --tailwind.ui --tailwind.version=2 --i18n.lang=en,fr
```

Which, once parsed by `yargs`, makes this `argv` object available to the command: 

```
{
  force: true,
  deploy: [ 'netlify', { 'migrate-data': true }, { migrateData: true } ],
  auth: 'supabase',
  tailwind: { ui: true, version: 2 },
  i18n: { lang: 'en,fr' },
}
```

