import fs from "fs";
import {execSync} from "child_process";

const config = JSON.parse(fs.readFileSync("./config.json", {encoding: "utf8"}))
const rcloneCmd = config.rcloneCmd || 'rclone';

export async function uploadFileWithRclone(f) {
    execSync(`${rcloneCmd} copy ${JSON.stringify(f)} ${config.rcloneRemote}:${config.rcloneRemotePath}`, {
        stdio: 'inherit',
        env: {
            ...process.env,
        }
    })
}
