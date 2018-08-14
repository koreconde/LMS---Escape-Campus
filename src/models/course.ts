//import { CourseCategory } from './coursecategory';

export class CourseCategory{
	constructor(
		public term_id: number,
    	public name: string,
    	public slug: string,
    	public term_group: number,
    	public term_taxonomy_id: number,
    	public taxonomy: string,
    	public description: string,
    	public parent: number,
    	public count: number,
    	public filter: string,
    	public image: string,
		){}
}

export class Member{
	constructor(
		public id: number,
		public name: string,
		public avatar: string,
		public sub: string
		){}
}

export class Course{
	constructor(
		public id: number, 
		public name: string,
		public date_created: number,
		public status: string,
		public price: any,
		public price_html: string,
		public total_students: number,
		public seats: number,
		public start_date: number,
		public average_rating: number,
		public rating_count: number,
		public featured_image: string,
		public user_status: any,
		public instructor: Member,
		public categories: CourseCategory[],
		public meta: any
		){}
}


export class FullCourse{
	constructor(
		public course: Course,
		public purchase_link: string,
		public description: string,
		public curriculum: Curriculum[],
		public reviews: Review[],
	){}
}

export class Curriculum{
	constructor(
		public id: number,
		public title: string,
		public type: string,
		public duration: number,
		public meta: any
		){}
}

export class Review{
	constructor(
		public id: number,
		public title: string,
		public content: string,
		public rating: number,
		public member: Member,
		public meta: any
		){}
}