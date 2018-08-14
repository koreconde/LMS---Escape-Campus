

export class Activity{
	constructor(
		public user_id: number,
        public component:string,
    	public type: string,
    	public action: string,
        public content:string,
    	public item_id: number,
    	public secondary_item_id: number,
    	public date_recorded: number,
		){}
}

export class ActivityMeta{
	constructor(
		public activity_id: number,
    	public key: string,
    	public value: string,
		){}
}