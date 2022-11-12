import { $log } from "@tsed/logger";
import { readFileSync } from "fs";

type EnvironmentConfigType = "environment" | "mode" | "debug"
  | "apiBase" | "apiBaseDns"
  | "portalBase" | "portalBaseDns"
  | "certKeyFile" | "certFile" | "trustProxy"
  | "jwtSecret"

type EnvironmentConfigParam = {
  param: string,
  required?: boolean,
  secret?: boolean,
  value?: string,
  loaded?: boolean
}

const secretPath = process.env.SECRET_PATH || "/run/secrets";

const environmentConfig: { [key in EnvironmentConfigType]: EnvironmentConfigParam } = {
  environment: { param: 'ENVIRONMENT' },
  mode: { param: 'MODE' },
  debug: { param: 'DEBUG' },
  apiBase: { param: 'API_BASE', required: true },
  apiBaseDns: { param: 'API_BASE_DNS', required: true },
  portalBaseDns: { param: 'PORTAL_BASE_DNS', required: true },
  portalBase: { param: 'PORTAL_BASE', required: true },
  trustProxy: { param: 'TRUST_PROXY' },
  certFile: { param: 'CERT_FILE', secret: true },
  certKeyFile: { param: 'CERT_KEY_FILE', secret: true },
  jwtSecret: { param: 'API_JWT_SECRET', secret: true, required: true },
};

export const isProduction = process.env.MODE === "production"
export const environment = getEnvironmentVariable('environment');
export const mode = getEnvironmentVariable('mode');
export const debug = getEnvironmentVariable('debug');
export const apiBase = getEnvironmentVariable('apiBase');
export const apiBaseDns = getEnvironmentVariable('apiBaseDns');
export const portalBaseDns = getEnvironmentVariable('portalBaseDns');
export const portalBase = getEnvironmentVariable('portalBase');
export const trustProxy = getEnvironmentVariable('trustProxy');
export const certFile = getEnvironmentVariable('certFile');
export const certKeyFile = getEnvironmentVariable('certKeyFile');
export const jwtSecret = getEnvironmentVariable('jwtSecret');

function getEnvironmentVariable(name: EnvironmentConfigType): string {
  const env = environmentConfig[name];
  // throw error if requested key is not set
  if (!env) throw new Error(`Environment variable '${name}' not prepared`);

  // return value if variable was loaded
  if (env.loaded) return env.value || '';

  // load the variable
  const value = process.env[env.param];

  if (!value || value.trim() == "") {
    // throw error if the variable was set as required
    if (env.required) throw new Error(`Environment variable ${env.param} not set but is required.`);

    // log no value warning
    $log.warn(`environmetn variable ${env.param} not set.`);

    // set environment variable as loaded
    env.loaded = true;

    // nothing more to do here
    return env.value || '';
  }

  if (!env.secret) {
    // not a secret, lets set the value and loaded param
    env.value = value;
    env.loaded = true;
    return env.value || '';
  }

  // get the value from file
  let secret: string | undefined;
  const filename = process.env[env.param];
  // secret file
  try {
    const content = readFileSync(`${secretPath}/${filename}`, 'utf8');
    secret = content.toString();
  } catch (err) {
    $log.warn(`failed to read file ${secretPath}/${filename}`);
  }

  if (!secret || secret.trim() == "") {
    // throw error if the variable was set as required
    if (env.required) throw new Error(`secret file '${filename}' from environment '${env.param}' was not found or empty but is required.`);

    // log no value warning
    $log.warn(`"secret file ${filename} from environment ${env.param} not found or empty.`);
  }

  // set the value and loaded param
  env.loaded = true;
  env.value = secret;

  // nothing more to do here
  return env.value || '';
}