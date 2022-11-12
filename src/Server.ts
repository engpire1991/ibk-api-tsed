import "@tsed/ajv";
import { PlatformApplication } from "@tsed/common";
import { Configuration, Inject, InjectorService } from "@tsed/di";
import "@tsed/platform-express"; // /!\ keep this import
import "@tsed/socketio";
import "@tsed/swagger";
import "@tsed/typeorm";
import bodyParser from "body-parser";
import compress from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import methodOverride from "method-override";
import { config, rootDir } from "./config";
import { IndexCtrl } from "./controllers/pages/IndexController";
import "./filters/ExceptionFilter";
import "./filters/ResourceNotFoundFilter";
import { SendResponseMiddleware } from "./middleware/SendResponseMiddleware";

@Configuration({
  ...config,
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT || 3000,
  httpsPort: false, // CHANGE
  componentsScan: [
    `${rootDir}/protocols/*.ts`, // scan protocols directory
    `${rootDir}/socketNsp/*.ts`, // scan socket namespace directory
  ],
  responseFilters: [
    SendResponseMiddleware
  ],
  mount: {
    "/api": [
      `${rootDir}/controllers/**/*.ts`
    ],
    "/": [
      IndexCtrl
    ]
  },
  socketIO: {}, // uses all default values
  swagger: [
    {
      path: "/v2/docs",
      specVersion: "2.0"
    },
    {
      path: "/v3/docs",
      specVersion: "3.0.1"
    }
  ],
  views: {
    root: `${rootDir}/views`,
    extensions: {
      ejs: "ejs"
    }
  },
  exclude: [
    "**/*.spec.ts"
  ]
})
export class Server {
  @Inject()
  app: PlatformApplication;

  @Configuration()
  settings: Configuration;

  public static injector: InjectorService;

  $beforeInit() {
    Server.injector = this.app.injector;
  }

  $beforeRoutesInit(): void {
    this.app
      .use(cors())
      .use(cookieParser())
      .use(compress({}))
      .use(methodOverride())
      .use(bodyParser.json())
      .use(bodyParser.urlencoded({
        extended: true
      }));
  }
}
