export class Wallet{
	constructor(
		public userid: number,
		public amount: number,	
	){}
}

export class WalletTransaction{
	constructor(
		public id: string,
		public pid: string,		
		public status: string,//credit or debit
		public date: number,
		public amount: number,
		public description:string,
	){}
}