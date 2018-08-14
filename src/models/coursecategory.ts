import { Course } from './course';

	

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
export class CourseLevel{
	constructor(
		public id: number,
		public name: string,
		public slug: string
		){}
}
export class CourseLocation{
	constructor(
		public id: number,
		public name: string,
		public slug: string
		){}
}

export class FullCourseCategory{
	constructor(
		public category: CourseCategory,
    	public childCategories: CourseCategory[],    
    	public courses: Course[]
    ){}
}
		