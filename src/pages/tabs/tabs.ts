import { Component } from '@angular/core';
import { App, NavController, NavParams } from 'ionic-angular';

import { HomePage } from '../home/home';
import { ContactPage } from '../contact/contact';
import { CourseStatusPage } from '../course-status/course-status';
import { ProfilePage } from '../profile/profile';
import { DirectoryPage } from '../directory/directory';
import { WalletPage } from '../wallet/wallet';

import { WishlistPage } from '../wishlist/wishlist';
import { UpdatesPage } from '../updates/updates';
import { ConfigService } from '../../services/config';
import { Storage } from '@ionic/storage';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  myIndex:number;
  home: any = HomePage;
  profileTab: any = ProfilePage;
  courseStatus: any = CourseStatusPage;
  stats: any = ContactPage;
  wishlist: any = WishlistPage;
  directoryPage: any = DirectoryPage;
  updates:any = UpdatesPage;
  wallet:any =WalletPage;

  page:any;
  user: any;
  userdata: any;
  coursetatusdata: any;

  constructor(
    private nav: NavController, 
    private navParams: NavParams,
    private config:ConfigService,
    private app:App,
    private storage:Storage) {
    
    this.myIndex = 0;
    if (navParams.data.index){
      this.myIndex = navParams.data.index;
    }


  }

  ionViewDidEnter(){
    this.config.updateUser();
    this.config.getLastCourse();
  }
}
