import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavController,ViewController } from 'ionic-angular';
import { CourseService } from '../../services/course';
import { ConfigService } from '../../services/config';
import { BlogService } from '../../services/blog';
import { UserService } from '../../services/users';

import { Course } from '../../models/course';

import 'rxjs/add/operator/debounceTime';
 
@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})

export class SearchPage {
 
    searchTerm: string = '';
    searchControl: FormControl;
    courseitems: any=[];
    items: any=[];
    users: any=[];
    searching: any = false;

    constructor(
      private viewCtrl: ViewController,
      public navCtrl: NavController, 
      public courseService: CourseService,
      private blog:BlogService,
      private userService:UserService,
      private config:ConfigService
      ){
      
      this.searchControl = new FormControl();
    }
 
    ionViewDidLoad() {
      this.setFilteredItems();

      this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
          this.searching = false;
          console.log("Searching");
          this.setFilteredItems();
      });
    }
     
     onClose(){
          console.log("close");
          this.viewCtrl.dismiss();
      }

    onSearchInput(){
        this.searching = true;
    }

    setFilteredItems() {
        console.log(this.searchTerm);

        this.courseitems = this.getSearchCourses();
        if(!this.courseitems){

          this.courseService.filterItems(this.searchTerm).subscribe(res=>{
            if(res){
              this.courseitems=res;
            }
          });
        }

        this.items = this.getSearchItems();
        this.users = this.getSearchUsers();
    }
     
    getSearchCourses(){
      return this.courseService.courses.filter((item) => {
          return item.name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1;
      });
    }

    getSearchItems(){
      return this.blog.posts.filter((item) => {
          return item.name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1;
      });
    }

    getSearchUsers(){
      return this.userService.instructors.filter((item) => {
          return item.name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1;
      });
    }
}