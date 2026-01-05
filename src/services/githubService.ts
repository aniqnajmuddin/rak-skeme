
export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  path: string; 
}

const utf8_to_b64 = (str: string) => {
  return window.btoa(unescape(encodeURIComponent(str)));
};

const b64_to_utf8 = (str: string) => {
  return decodeURIComponent(escape(window.atob(str)));
};

export const githubService = {
  /**
   * Menguji sambungan ke GitHub
   */
  async testConnection(config: GitHubConfig): Promise<{ success: boolean; msg: string }> {
    if (!config.token || !config.owner || !config.repo) {
      return { success: false, msg: "Sila isi Token, Owner, dan Repo." };
    }

    const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}`;
    
    try {
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });

      if (res.status === 200) {
        return { success: true, msg: "Sambungan berjaya! Repository ditemui." };
      } else if (res.status === 404) {
        // GitHub returns 404 if the repo doesn't exist OR if the token hides it due to lack of permission
        return { success: false, msg: "Gagal: Repo tidak dijumpai ATAU Token tiada akses (Repository Access). Sila semak setting token di GitHub." };
      } else if (res.status === 401) {
        return { success: false, msg: "Gagal: Token tidak sah (Unauthorized)." };
      } else {
        const err = await res.json();
        return { success: false, msg: `Ralat GitHub: ${err.message}` };
      }
    } catch (e: any) {
      return { success: false, msg: `Ralat Rangkaian: ${e.message}` };
    }
  },

  /**
   * Menyimpan data ke GitHub
   */
  async saveFile(config: GitHubConfig, content: string, message: string): Promise<{ success: boolean; msg: string }> {
    if (!config.token || !config.owner || !config.repo || !config.path) {
      return { success: false, msg: "Konfigurasi GitHub tidak lengkap." };
    }

    const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`;
    
    try {
      // 1. Dapatkan SHA jika fail sudah ada
      let sha = null;
      const getRes = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      
      if (getRes.status === 200) {
        const data = await getRes.json();
        sha = data.sha;
      }

      // 2. Hantar data
      const payload: any = {
        message: message,
        content: utf8_to_b64(content),
      };

      if (sha) payload.sha = sha;

      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (putRes.ok) {
        return { success: true, msg: "Berjaya! Fail telah dikemaskini di GitHub." };
      } else {
        const errData = await putRes.json();
        // FIXED: Changed 'res.status' to 'putRes.status'
        if (errData.message.includes('scope') || putRes.status === 404) {
          return { success: false, msg: "Gagal: Token tiada kebenaran 'Write'. Pastikan 'Repository Permissions > Contents' diset kepada 'Read and write'." };
        }
        return { success: false, msg: `Gagal Simpan: ${errData.message}` };
      }
    } catch (error: any) {
      return { success: false, msg: `Ralat: ${error.message}` };
    }
  },

  async getFile(config: GitHubConfig): Promise<{ success: boolean; data?: any; msg: string }> {
    const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`;

    try {
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });

      if (res.ok) {
        const json = await res.json();
        const content = b64_to_utf8(json.content);
        return { success: true, data: JSON.parse(content), msg: "Data berjaya diambil." };
      } else {
        return { success: false, msg: "Gagal ambil data. Pastikan Token ada akses 'Read' ke repo ini." };
      }
    } catch (error: any) {
      return { success: false, msg: `Ralat: ${error.message}` };
    }
  }
};
