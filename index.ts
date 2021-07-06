import { AlmSettingContainer } from './Interfaces';
import fetch from './proxyFetch';
const sonarqubeServer: string = process.env.SONARQUBE_SERVER;
const sonarqubeUser: string = process.env.SONARQUBE_USER;
const key: string = process.env.SONARQUBE_KEY;
const azureUrl: string = process.env.AZURE_URL;
const azurePat: string = process.env.AZURE_PAT;

class SonarqubeApi {
  private _user: string;
  private _deleteUrl: URL;
  private _createUrl: URL;
  private _listUrl: URL;
  constructor(
    server: string,
    user: string
  ) {
    this._user = `${user}:`;
    this._deleteUrl = new URL('/api/alm_settings/delete', server);
    this._createUrl = new URL('/api/alm_settings/create_azure', server);
    this._listUrl = new URL('/api/alm_settings/list', server);
  }

  CreateAuth(): string {
    return `Basic ${Buffer.from(this._user).toString('base64')}`;
  }

  async DeleteBindingAsync(id: string): Promise<boolean> {
    console.log(`Deleting existing binding: ${id}`);
    const response = await fetch(`${this._deleteUrl.href}?key=${id}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.CreateAuth()
      }
    });
    console.log(await response.text())
    const isOK = response.ok;
    if (isOK) {
      console.log(`Binding deleted`);
    } else {
      throw new Error('Can not delete binding');
    }
    return isOK;
  }

  async CreateBindngAsync(id: string,
    pat: string,
    url: string): Promise<boolean> {
    console.log(`Creating binding: ${id}`);
    const response = await fetch(`${this._createUrl.href}?key=${id}&personalAccessToken=${pat}&url=${url}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.CreateAuth()
      }
    });
    console.log(await response.text())
    const isOK = response.ok;
    if (isOK) {
      console.log(`Binding created`);
    } else {
      throw new Error('Can not create binding');
    }
    return isOK;
  }

  async HasBindingAsync(id: string): Promise<boolean> {
    console.log(`Checking for binding : ${id}`);
    const bindingsRequest = await fetch(this._listUrl.href, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.CreateAuth()
      }
    });
    const json = await bindingsRequest.json() as AlmSettingContainer;
    const bindings = json.almSettings;
    const exists = bindings.some(b => b.key == id && b.alm == "azure");
    if (exists) {
      console.log('Binding exists');
    } else {
      console.log('No existing binding');
    }
    return exists;
  }
}

async function main() {
  const api = new SonarqubeApi(sonarqubeServer, sonarqubeUser);
  if (await api.HasBindingAsync(key)) {
    await api.DeleteBindingAsync(key);
  }
  await api.CreateBindngAsync(key, azurePat, azureUrl);
}

main()
  .catch(err => console.error(err))
  .finally(process.exit);