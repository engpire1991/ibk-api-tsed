import { Controller, Get } from "@tsed/common";
import { Authenticate } from "@tsed/passport";
import { Returns } from "@tsed/schema";
import { ODataModel } from "../models/outgoing/ODataModel";

@Controller("/data")
@Authenticate("jwt")
export class DataController {

  constructor(
  ) { }

  @Get("/")
  @Returns(200).Type(ODataModel).Description("The base data")
  public async getData(): Promise<ODataModel> {
    return new ODataModel();
  }
}