import { Controller, Get, Req } from "@tsed/common";

@Controller("/health")
export class HealthController {

  constructor() { }

  @Get("/")
  public getRoutes(@Req() request: Express.Request): { status: string } {
    return { status: "alive" };
  }
}