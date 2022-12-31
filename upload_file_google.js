import {google} from 'googleapis';
import fs from "fs";
import path from "path";

const config = JSON.parse(fs.readFileSync("./config.json", {encoding: "utf8"}))

const getDriveService = () => {
    const SCOPES = ['https://www.googleapis.com/auth/drive'];

    const auth = new google.auth.GoogleAuth({
        keyFile: 'google_service_account.json',
        scopes: SCOPES,
    });
    return google.drive({version: 'v3', auth});
};

export async function uploadFileToGoogleDrive(f) {
    await getDriveService().files.create({
        resource: {
            name: path.basename(f),
            parents: [config['googleDriveFolderId']],
        },
        media: {
            body: fs.createReadStream(f),
        },
        fields: 'id,name',
    });
}
