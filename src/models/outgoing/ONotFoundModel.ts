import { Property } from "@tsed/schema";

export class ONotFoundModel {
  constructor(url: string){
    this.url = url;
  }

  @Property()
  readonly status = 404;
  
  @Property()
  readonly message = 'Resource not found';

  @Property()
  readonly url: string;
}