import { Course } from './course';
import { User } from './user';

export class CourseStatus{
	constructor(
		public user_id: number,
		public course_id: number,
		public progress: number,
		public current_unit_key: number,
		public status:number,
		public courseitems: CourseItem[],
	){}
}

export class CourseItem{
	constructor(
		public id: number,
		public key: number,
		public type: string,
		public title: string,
		public duration: number,
		public status: number,
		public content: string,
		public meta: any,
	){}
}