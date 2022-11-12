import { BodyParams, Controller, Get, Post, Req } from "@tsed/common";
import { Authenticate } from "@tsed/passport";
import * as Express from 'express';
import { IAuthorizationPostLoginModel } from "../models/incoming/IAuthorizationPostLoginModel";
import { AuthorizationService } from "../services/AuthorizationService";


@Controller("/authorization")
export class AuthorizationController {

  constructor(
    private authorizationService: AuthorizationService
  ) { }

  @Post("/login")
  @Authenticate("login")
  public async postLogin(
    @Req() request: Express.Request,
    @BodyParams() body: IAuthorizationPostLoginModel
  ) {
    console.log(request.body);
    // Generate JWT token for authorization
    const jwtToken = await this.authorizationService.generateJWT(body.username);

    return { message: "Logged in successfully", token: jwtToken };
  }

  @Get("/logout")
  public postLogout(
    @Req() request: Express.Request
  ) {
    // TODO: clear user data from redis
    return { message: "Logged out" };
  }

}
