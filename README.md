# automated backup

1. [x] specify dir, excluded files; (achievable with `gnu-tar`)
2. [x] auto tar with cron; if no change then skip;
3. [x] upload to S3, or preferably GoogleDrive, etc.
4. auto prune files more than X days old
5. [x] send heartbeat

#

```
node run.js

30 */8 * * * (cd /root/backup-framework && ./index.js) 2>&1 | logger -t backup
```

config.json

```
{
  "tarCmd": "gtar",
  "backupBase": "/Users/kewang/WebstormProjects/backup-framework",
  "projectName": "test",
  "tmpDir": "/tmp",
  "backupExcludeFilePath": "/Users/kewang/WebstormProjects/backup-framework/backup_exclude.txt",
  "googleDriveFolderId": "...",
  "healthchecksIoPingUrl": "https://hc-ping.com/..."
}

```

Google drive service account

https://www.labnol.org/google-api-service-account-220404
