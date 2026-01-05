
// Types for Google API
declare var gapi: any;
declare var google: any;

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
// Adding userinfo.email scope to identify KPM accounts
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email';
const DB_FILENAME = 'RAK_SKEME_DB.json';

// Dynamic Script Loader
const loadScript = (src: string) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

export interface CloudStatus {
    isSignedIn: boolean;
    userEmail: string | null;
    isSyncing: boolean;
    lastSyncTime: string | null;
    error: string | null;
}

class GoogleDriveService {
    private tokenClient: any;
    private gapiInited = false;
    private gisInited = false;
    private _status: CloudStatus = {
        isSignedIn: false,
        userEmail: null,
        isSyncing: false,
        lastSyncTime: null,
        error: null
    };
    
    // Callbacks
    public onStatusChange: ((status: CloudStatus) => void) | null = null;

    constructor() {}

    // 1. Initialize API (Called when component mounts)
    public async init(clientId: string, apiKey: string): Promise<boolean> {
        if (!clientId || !apiKey) return false;

        try {
            await loadScript('https://apis.google.com/js/api.js');
            await loadScript('https://accounts.google.com/gsi/client');

            return new Promise((resolve) => {
                gapi.load('client', async () => {
                    try {
                        await gapi.client.init({
                            apiKey: apiKey,
                            discoveryDocs: [DISCOVERY_DOC],
                        });
                        this.gapiInited = true;
                        this.checkInit(resolve);
                    } catch (e: any) {
                        console.error("GAPI Init Error", e);
                        this.updateStatus({ error: `GAPI Init Failed: ${e.message || e}` });
                        resolve(false);
                    }
                });

                try {
                    this.tokenClient = google.accounts.oauth2.initTokenClient({
                        client_id: clientId,
                        scope: SCOPES,
                        callback: async (resp: any) => {
                            if (resp.error) {
                                throw resp;
                            }
                            // Auth Success, now get User Info to confirm email
                            await this.fetchUserInfo(resp.access_token);
                        },
                    });
                    this.gisInited = true;
                    this.checkInit(resolve);
                } catch (e: any) {
                     console.error("GIS Init Error", e);
                     resolve(false);
                }
            });
        } catch (e) {
            console.error("Failed to load Google Scripts", e);
            this.updateStatus({ error: "Gagal memuatkan skrip Google. Periksa sambungan internet." });
            return false;
        }
    }

    private checkInit(resolve: (val: boolean) => void) {
        if (this.gapiInited && this.gisInited) resolve(true);
    }

    private async fetchUserInfo(accessToken: string) {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const data = await response.json();
            this.updateStatus({ 
                isSignedIn: true, 
                userEmail: data.email,
                error: null 
            });
        } catch (e) {
            console.error("Failed to fetch user info", e);
            // Still signed in to Drive even if profile fails
            this.updateStatus({ isSignedIn: true, userEmail: 'Pengguna Google (Email Hidden)' });
        }
    }

    // 2. Authenticate
    public handleAuthClick() {
        if (this.tokenClient) {
            // Request access token
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
        }
    }

    public handleSignoutClick() {
        const token = gapi.client.getToken();
        if (token !== null) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken('');
            this.updateStatus({ isSignedIn: false, userEmail: null });
        }
    }

    // 3. Find Existing DB File
    public async findDbFile(): Promise<string | null> {
        try {
            const response = await gapi.client.drive.files.list({
                q: `name = '${DB_FILENAME}' and trashed = false`,
                fields: 'files(id, name)',
            });
            const files = response.result.files;
            if (files && files.length > 0) {
                return files[0].id;
            }
            return null;
        } catch (err: any) {
            this.updateStatus({ error: err.message });
            return null;
        }
    }

    // 4. Upload Data (Create or Update)
    public async uploadData(data: any): Promise<void> {
        if (!this._status.isSignedIn) return;
        this.updateStatus({ isSyncing: true, error: null });

        try {
            const fileId = await this.findDbFile();
            const fileContent = JSON.stringify(data);
            
            const accessToken = gapi.client.getToken().access_token;
            const blob = new Blob([fileContent], { type: 'application/json' });

            if (fileId) {
                // UPDATE existing file
                await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
                    method: 'PATCH',
                    headers: { 
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: fileContent
                });
            } else {
                // CREATE new file
                // We need to do a multipart upload to set name AND content in one go
                const fileMetadata = {
                    name: DB_FILENAME,
                    mimeType: 'application/json'
                };
                
                const form = new FormData();
                form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
                form.append('file', blob);

                await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                    body: form
                });
            }

            this.updateStatus({ isSyncing: false, lastSyncTime: new Date().toLocaleTimeString() });

        } catch (err: any) {
            console.error(err);
            this.updateStatus({ isSyncing: false, error: "Gagal muat naik ke Drive." });
        }
    }

    // 5. Download Data
    public async downloadData(): Promise<any | null> {
        if (!this._status.isSignedIn) return null;
        this.updateStatus({ isSyncing: true, error: null });

        try {
            const fileId = await this.findDbFile();
            if (!fileId) {
                this.updateStatus({ isSyncing: false, error: "Fail database tidak dijumpai di Drive ini." });
                return null;
            }

            const response = await gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media',
            });

            this.updateStatus({ isSyncing: false, lastSyncTime: new Date().toLocaleTimeString() });
            return response.result;

        } catch (err: any) {
            this.updateStatus({ isSyncing: false, error: "Gagal muat turun." });
            return null;
        }
    }

    // Helpers
    private updateStatus(partial: Partial<CloudStatus>) {
        this._status = { ...this._status, ...partial };
        if (this.onStatusChange) this.onStatusChange(this._status);
    }

    public get status() { return this._status; }
}

export const googleDriveService = new GoogleDriveService();
