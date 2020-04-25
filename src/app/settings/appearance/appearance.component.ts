import { Platform } from '@ionic/angular';
import { StorageKeys } from './../../models/storageKeys.enum';
import { Component, OnInit } from '@angular/core';
import { Storage } from "@ionic/storage";
import * as storageModels from './../../models/storageDataModels.interface';

@Component({
  selector: 'app-appearance',
  templateUrl: './appearance.component.html',
  styleUrls: ['./appearance.component.scss'],
})
export class AppearanceComponent implements OnInit {

  darkThemeEnabled: boolean;
  useSystemThemeMode: boolean;
  defaultSearchType: string;


  constructor(
    private storage: Storage,
    private platform: Platform,
  ) { }

  ngOnInit() {
    this.getInitialValuesFromStorge();
  }

  getInitialValuesFromStorge(): void {
    this.storage.get(StorageKeys.darkMode).then((val) => {
      if (val) {
        this.useSystemThemeMode = !!val.useSystemDefault;
        this.darkThemeEnabled = !!val.darkModeEnabled;
      }
    });

    this.storage.get(StorageKeys.defaultSearchType).then((val) => {
      this.defaultSearchType = val ? val : 'all';
    });
  }

  darkThemeChange(event): void {
    let darkModeData: storageModels.darkModeData;
    if (event.target.classList.contains('system-default')) {
      darkModeData = {
        useSystemDefault: event.detail.checked,
        darkModeEnabled: this.darkThemeEnabled,
      };
    } else {
      darkModeData = {
        useSystemDefault: this.useSystemThemeMode,
        darkModeEnabled: event.detail.checked,
      };
    }
    this.storage.set(StorageKeys.darkMode, darkModeData).then(
      () => {
        this.useSystemThemeMode = darkModeData.useSystemDefault;
        this.darkThemeEnabled = darkModeData.darkModeEnabled ;
        this.shouldSetDarkMode();
      },
      () => { console.log('couldn\'t set the value'); }
    );
  }

  shouldSetDarkMode(): void {
    if (this.useSystemThemeMode) {
      this.setTheme(window.navigator.userAgent.includes('AndroidDarkMode'));
    } else {
      this.setTheme(this.darkThemeEnabled);
    }
  }

  setTheme(dark: boolean) {
    document.body.classList.toggle('dark', dark);
    if (dark) {
      window['StatusBar'].styleLightContent();
    } else {
      window['StatusBar'].styleDefault();
    }
    const statusBarColor = getComputedStyle(document.body).getPropertyValue('--status-bar-background').trim();
    window['StatusBar'].backgroundColorByHexString(statusBarColor);
    if (this.platform.is('android') && window.hasOwnProperty('NavigationBar')) {
      const navigationBarColor = dark ? '#000000' : '#ffffff';
      const ligthNavigationBar = dark ? false : true;
      window['NavigationBar'].backgroundColorByHexString(navigationBarColor, ligthNavigationBar);
    }
  }

  updateDefaultTypeForSearch(event): void {
    this.storage.set(StorageKeys.defaultSearchType, event.detail.value).then(
      () => { },
      () => { console.log('couldn\'t set the value'); }
    );
  }

  async resetCustomConfigs(): Promise<void> {
    await this.storage.set(StorageKeys.defaultSearchType, 'all');
    const defaultDarkMode: storageModels.darkModeData = {
      useSystemDefault: true,
      darkModeEnabled: false,
    };
    await this.storage.set(StorageKeys.darkMode, defaultDarkMode);

    this.getInitialValuesFromStorge();
  }

}
