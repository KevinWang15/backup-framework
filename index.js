#!/usr/bin/env node

import path from "path";
import fs from "fs";
import {execSync} from "child_process";
import {sha1File} from 'sha1-file';
import axios from 'axios';

import {uploadFileToGoogleDrive} from "./upload_file_google.js";
import {uploadFileWithRclone} from "./upload_file_rclone.js";

const config = JSON.parse(fs.readFileSync("./config.json", {encoding: "utf8"}));

const tarCmd = config.tarCmd || 'tar';

const {backupBase, backupExcludeFilePath, tmpDir, projectName} = config;
const tgzFileName = `${projectName}-${+new Date()}.tgz`;

const tgzFilePath = path.join(tmpDir, tgzFileName);
const lastCompletedBackupFile = `${projectName}.last_completed_backup`;

function SetUpEnv() {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
    if (config.proxy) {
        process.env["HTTP_PROXY"] = config.proxy;
        process.env["HTTPS_PROXY"] = config.proxy;
    }
}

async function pruneLast() {
    for (let file of fs.readdirSync(tmpDir).filter(x => x.startsWith(`${projectName}-`) && x.endsWith(".tgz"))) {
        fs.rmSync(path.join(tmpDir, file));
    }
}

async function makeTarGz() {
    const oldWd = process.cwd();
    process.chdir(backupBase);
    execSync(`${tarCmd} -X "${backupExcludeFilePath}" -cf - . | gzip --no-name > "${tgzFilePath}"`)
    process.chdir(oldWd);
}

async function writeLastCompletedBackup() {
    fs.writeFileSync(lastCompletedBackupFile, JSON.stringify({
        tgzFileName,
        sha1: await sha1File(tgzFilePath)
    }))
}

async function noChangeDetected() {
    if (!fs.existsSync(lastCompletedBackupFile)) {
        return false;
    }
    const currentSha1 = await sha1File(tgzFilePath);
    const lastSha1 = JSON.parse(fs.readFileSync(lastCompletedBackupFile, {encoding: "utf8"}));
    return lastSha1.sha1 === currentSha1;
}

function log(txt) {
    console.log(`${projectName} - ${txt}`)
}

async function sendSuccessHeartbeat() {
    await axios.get(config.healthchecksIoPingUrl);
}

(async function () {
    SetUpEnv();

    await pruneLast()
    await makeTarGz()
    if (await noChangeDetected()) {
        log(`no change detected, skipping backup`);
        await sendSuccessHeartbeat();
        process.exit(0);
    }
    // await uploadFileToGoogleDrive(tgzFilePath)
    await uploadFileWithRclone(tgzFilePath)
    await writeLastCompletedBackup()
    await sendSuccessHeartbeat();
    log(`Done`);
})()
