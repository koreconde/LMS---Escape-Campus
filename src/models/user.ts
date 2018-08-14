import { Course } from './course';

export class User{
	constructor(
		public id: number,
		public name: string,
		public sub: string,
		public email: string,
		public avatar: string,
		){}
}

export class Profile{
	constructor(
		public user: User,
		public data: any[],
		public tabs: UserData[],
		){}
}

export class UserData{
	constructor(
		public key: string,
		public label: string,
		public value: any
		){}
}



export class Dashboard{
	constructor(
		public id: number,
		public course_count: string,
		public quiz_course: string,
		public unit_count: string,
		public course_results: string,
		public quiz_results: string,
		){}
}


export class UserStats{
	constructor(
		public id: number,
		public name: string,
		public sub: string,
		public email: string,
		public avatar: string,
		){}
}