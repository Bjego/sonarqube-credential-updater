export interface AlmSetting {
  key: string;
  alm: string;
  url: string;
}

export interface AlmSettingContainer {
  almSettings: AlmSetting[];
}