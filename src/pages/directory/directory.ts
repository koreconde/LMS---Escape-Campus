import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavController, NavParams, ModalController,LoadingController } from 'ionic-angular';

import { CoursePage } from '../course/course';
import { ProfilePage } from '../profile/profile';
import { SearchPage } from '../search/search';

import { CourseCategory } from '../../models/course';
import { Course } from '../../models/course';
import { User } from '../../models/user';
import { FullCourseCategory } from '../../models/coursecategory';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { ConfigService } from '../../services/config';
import { CourseService } from '../../services/course';
import { UserService } from '../../services/users';
import { Courseblock } from '../../components/courseblock/courseblock';
import { WishlistService } from '../../services/wishlist';

@Component({
  selector: 'page-directory',
  templateUrl: 'directory.html'
})
export class DirectoryPage implements OnInit{

    title:string;
    subtitle:string;


	paged: number = 1;
    isLoggedIn: boolean = false;
    user: any;
    instructor:any;
	category:any;
    childCategories:CourseCategory[]=[];
    
    profilePage=ProfilePage;
    coursePage = CoursePage;

    userdata: any;
    courses: any =[]; //Course[]=[];
    categories:any=[];
    locations:any=[];
    levels:any=[];
    noMoreCoursesAvailable:number = 0;

    searchTerm: string = '';
    searchControl= new FormControl();
    
    selectedCategories:any[]=[];
    selectedInstructors:any[]=[];
    selectedLocations:any[]=[];
    selectedLevels:any[]=[];
    instructors:User[]=[];
    free_paid:any;
    offline:any;
    start_date:any;
    end_date:any;

    filters:any=[];
    sortby:any='';

    
    items: any;
    searching: any = false;
    activateFilterBlock:boolean=false;

    sortSelectOptions: any;


  	constructor(public navCtrl: NavController, 
          public config: ConfigService,
  		    public navParams: NavParams,
          private nav: NavController,
          private modalCtrl: ModalController,
          public userService:UserService,
          public courseService: CourseService,
          private wishlistService:WishlistService,
          public loadingCtrl: LoadingController
  		) {}

  	ngOnInit(){
      
        this.title = this.config.get_translation('course_directory_title');
        this.subtitle = this.config.get_translation('course_directory_sub_title');

        this.wishlistService.getWishList();
        
        if('term_id' in this.navParams.data){
            this.category = this.navParams.data;
        }

        if('email' in this.navParams.data){
            this.instructor = this.navParams.data;
        }

        if('sortby' in this.navParams.data){
            this.sortby = this.navParams.get('sortby');
        }

        if(this.category && Object.keys(this.category).length !== 0 ){
            
            this.selectedCategories.push(this.category.term_id);
            var cats = {'type':'taxonomy','taxonomy':this.category.taxonomy,'values':this.selectedCategories};
            this.filters.push(cats);
            this.title = this.category.name;
            this.subtitle = this.category.description;
        }

        if(this.instructor && Object.keys(this.instructor).length !== 0 ){
            
            this.filters=[];

            this.selectedInstructors.push(this.instructor.id);
            var insts = {'type':'instructors','values':this.selectedInstructors};
            this.filters.push(insts);
            this.title = this.instructor.name;
            this.subtitle = this.instructor.sub;
        }

        if(this.config.isLoggedIn){
            this.userdata={'isLoggedIn':this.config.isLoggedIn,'User':this.config.user};    
        }
        
        if(this.config.directoryFilters.instructors){
            this.userService.getAllInstructors().subscribe(res=>{
                if(res){
                    this.instructors = res;
                }
            });    
        }
        
        if(this.config.directoryFilters.categories){
            this.courseService.getAllCourseCategory().subscribe(cats =>{
                if(cats){
                    this.categories = this.mergeCategories(this.categories,cats);
                    
                }
            });
        }      

        if(this.config.directoryFilters.levels){
            this.courseService.getAllCourseLevels().subscribe(levels =>{
                if(levels){
                    this.levels = levels;
                }
            });
        }

        if(this.config.directoryFilters.locations){
            this.courseService.getAllCourseLocations().subscribe(locations =>{
                if(locations){
                    this.locations = locations;
                }
            });
        }
        
  	}
  	
  	ionViewDidLoad() {
         
        if(this.category && this.categories.length && Object.keys(this.category).length !== 0){
            for(let i=0;i<this.categories.length;i++){
                if(this.categories[i].parent == this.category.term_id){
                    this.childCategories.push(this.categories[i]);
                }
            }
        }

        this.sortSelectOptions = {
            title : this.config.get_translation('sort_options'),
            okText:this.config.get_translation('okay'),
            cancelText:this.config.get_translation('dismiss'),
        };
        this.setFilteredItems();
 
        this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
            this.searching = false;
            this.setFilteredItems();
        });

    }

    loadCategory(category:any){
        
        this.category = category;
        this.selectedCategories = [];
        this.filters =[];
        this.searchTerm = '';
        this.paged=1;
        this.childCategories =[];

        this.selectedCategories.push(this.category.term_id);
        var cats = {'type':'taxonomy','taxonomy':this.category.taxonomy,'values':this.selectedCategories};
        console.log(cats);
        this.filters.push(cats);
        this.title = this.category.name;
        this.subtitle = this.category.description;

        for(let i=0;i<this.categories.length;i++){
            if(this.categories[i].parent == this.category.term_id){
                this.childCategories.push(this.categories[i]);
            }
        }
        this.setFilteredItems();
    }

    onSearchInput(){
        this.searching = true;

    }
 
    setFilteredItems() {
      
        let loading = this.loadingCtrl.create({
            content: '<img src="assets/images/bubbles.svg">',
            duration: 15000,//this.config.get_translation('loadingresults'),
            spinner:'hide',
            showBackdrop:true,

        });

        loading.present();


      if(this.searchTerm.length || this.filters.length || this.sortby.length){
        let f = {'search':this.searchTerm,'filters':this.filters, 'sort':this.sortby,'paged':1 }; 
        this.courseService.filterItems(f).subscribe(res=>{
            loading.dismiss();
            if(res){
                this.courses = res;      
            }else{
                this.courses =[];
            }
            
        });
      }else{
        let f = {'search':'','filters':[], 'sort':'','paged':1}; 
        this.courseService.filterItems(f).subscribe(res=>{
            loading.dismiss();
            if(res){this.courses = res;}else{
                this.courses =[];
            }
        });

      }

    }

    openSearch(){
        let modal = this.modalCtrl.create(SearchPage);
        modal.present();
    }

    activateFilters(){
      this.activateFilterBlock=true;
    }

    private fetchFiltersSorters(){
        this.filters = [];
        if(this.selectedCategories){

            if(this.filters.length){
                for(let i=0;i<this.filters.length;i++){
                    if(this.filters[i].type == 'taxonomy' && this.filters[i].taxonomy == 'course-cat'){
                        this.filters.splice(i, 1);
                    }
                }
            }

            var cats = {'type':'taxonomy','taxonomy':'course-cat','values':this.selectedCategories};
            this.filters.push(cats);
        }

        if(this.selectedLocations){

            if(this.filters.length){
                for(let i=0;i<this.filters.length;i++){
                    if(this.filters[i].type == 'taxonomy' && this.filters[i].taxonomy == 'location'){
                        this.filters.splice(i, 1);
                    }
                }
            }
            console.log(this.selectedLocations);
            var cats = {'type':'taxonomy','taxonomy':'location','values':this.selectedLocations};
            this.filters.push(cats);
        }

        if(this.selectedLevels){

            if(this.filters.length){
                for(let i=0;i<this.filters.length;i++){
                    if(this.filters[i].type == 'taxonomy' && this.filters[i].taxonomy == 'level'){
                        this.filters.splice(i, 1);
                    }
                }
            }

            var cats = {'type':'taxonomy','taxonomy':'level','values':this.selectedLevels};
            this.filters.push(cats);
        }

        if(this.free_paid){
            var free_p = {'type':'free','values':this.free_paid};
            this.filters.push(free_p);
        }

        if(this.offline){
            var off = {'type':'offline','values':this.offline};
            this.filters.push(off);   
        }

        if(this.start_date){
            var off = {'type':'start_date','values':this.start_date};
            this.filters.push(off);   
        }

        if(this.end_date){
            var off = {'type':'end_date','values':this.end_date};
            this.filters.push(off);   
        }

        if(this.selectedInstructors.length){
            var insts = {'type':'instructors','values':this.selectedInstructors};
            this.filters.push(insts);
        }

      
        let af = {'search':this.searchTerm,'filters':this.filters,'sort':this.sortby};
        return af; 
    }

    applyFilters(){

        let af = this.fetchFiltersSorters();

        let loading = this.loadingCtrl.create({
            content: '<img src="assets/images/bubbles.svg">',
            duration: 15000,//this.config.get_translation('loadingresults'),
            spinner:'hide',
            showBackdrop:true,

        });

        loading.present();

        this.courseService.filterItems(af).subscribe(res=>{
            if(res){
                this.courses=res;
            }else{
                this.courses=[];
            }
            loading.dismiss();
        });
        this.paged = 0;
        this.activateFilterBlock=false;
        this.noMoreCoursesAvailable = 0;
    }

    resetFilters(){
        this.filters=[];
        this.selectedCategories=[];
        this.selectedInstructors=[];
        this.selectedLocations=[];
        this.selectedLevels=[];
        this.instructors=[];
        this.free_paid=0;
        this.offline=0;
        this.start_date='';
        this.end_date='';
    }

    closeFilters(){
        this.activateFilterBlock=false; 
    }

    onSortOptions($event:any){ 
        this.sortby= $event;
        this.applyFilters();
    }

    doInfinite(event:any){
        
        this.paged++;

        if(this.selectedCategories.length){
          var cats = {'type':'taxonomy','taxonomy':'course-cat','values':this.selectedCategories};
          this.filters.push(cats);
        }

        if(this.selectedInstructors.length){
          var insts = {'type':'instructors','values':this.selectedInstructors};
          this.filters.push(insts);
        }

        let af = {'search':this.searchTerm,'filters':this.filters,'sort':this.sortby, 'paged': this.paged};

        this.courseService.filterItems(af).subscribe(res=>{
            
            if(res != null){
                console.log(res.length);
                for(let i=0;i<res.length;i++){
                    let push=1;
                    for(let k=0;k<this.courses.length;k++){
                        if(this.courses[k].id == res[i].id){
                            push=0;
                            break;
                        }
                    }
                    if(push){
                        this.courses.push(res[i]);
                    }
                }

                if(this.courses.length < (this.paged+1)*this.config.settings.per_view){
                    this.noMoreCoursesAvailable = 0;
                }
            }else{
                this.noMoreCoursesAvailable = 1;
            }
            event.complete();    
        });
    }

    mergeCategories(catsA: CourseCategory[],catsB: CourseCategory[]){
      for(let i=0;i<catsB.length;i++){
            var flag = 1;
            for(let j=0;j<catsA.length;j++){
                if(catsB[i].term_id == catsA[j].term_id){
                    flag= 0;
                }
            }
            if(flag){
                catsA.push(catsB[i]);
            }
        }
        return catsA;
    }
}

