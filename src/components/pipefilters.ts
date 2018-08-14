import { PipeTransform, Pipe, Injectable } from '@angular/core';

@Pipe({
    name: 'callback',
    pure: false
})
@Injectable()
export class CallbackPipe implements PipeTransform {
    transform(items: any[], callback: (item: any) => boolean): any {
        if (!items || !callback) {
            return items;
        }

        return items.filter(item => {
            return callback(item);
        });
    }
}