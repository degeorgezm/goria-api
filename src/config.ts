/**
 * config.ts
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * @format
 * @abstract Initialize config values from environment file
 *
 */

require("dotenv/config");
const defined = <T>(t: T): t is Exclude<T, undefined | null> =>
  t !== undefined && t !== null;

const trueVals = ["true", "1"];
const falseVals = ["false", "0"];

const env = (name: string): string | undefined => {
  const raw = process.env[name];

  return raw;
};

const boolEnv = (name: string, fallback?: boolean): boolean => {
  const raw = env(name);

  if (!defined(raw)) {
    return false;
  }

  const normalizedEnv = raw.toLowerCase();

  if (trueVals.some((val) => val === normalizedEnv)) {
    return true;
  }

  if (falseVals.some((val) => val === normalizedEnv)) {
    return false;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error("Expected boolean value for env var: " + name + ".");
};

const requireEnv = (name: string, fallback?: string): string => {
  const raw = env(name);

  if (defined(raw) && raw !== "") {
    return raw;
  }

  if (fallback === undefined) {
    throw new Error("Missing required env var: " + name + ".");
  }

  return fallback;
};

const numberEnv = (name: string, fallback?: number): number => {
  const raw = env(name);
  const num = Number(raw);

  if (!isNaN(num)) {
    return num;
  }

  if (fallback === undefined) {
    throw new Error(
      "Received " + raw + " for " + name + " but expected number."
    );
  }

  return fallback;
};

export const APP_NAME = requireEnv("APP_NAME");
export const HOSTNAME = requireEnv("HOSTNAME", "127.0.0.1");
export const PORT = numberEnv("PORT", 3000);
export const VERSION = requireEnv("VERSION", "0.0.1");
export const LOGGING_ENABLED = boolEnv("LOGGING_ENABLED", true);
export const MAX_FILESIZE_MB = numberEnv("MAX_FILESIZE_MB", 5);

export const MONGODB_URL = requireEnv("MONGODB_URL");
export const MONGODB_DATABASE = requireEnv("MONGODB_DATABASE");

export const JWT_SECRET_KEY = requireEnv("JWT_SECRET_KEY");
export const JWT_SECRET_ISSUER_AUDIENCE = requireEnv(
  "JWT_SECRET_ISSUER_AUDIENCE"
);

export const IAM_ACCESS_KEY_ID = requireEnv("IAM_ACCESS_KEY_ID");
export const IAM_SECRET_ACCESS_KEY = requireEnv("IAM_SECRET_ACCESS_KEY");
export const S3_BUCKET_NAME = requireEnv("S3_BUCKET_NAME");
export const S3_IMG_HANDLER_FOLDER = requireEnv("S3_IMG_HANDLER_FOLDER");
export const S3_PDF_HANDLER_FOLDER = requireEnv("S3_PDF_HANDLER_FOLDER");

export const MAILGUN_API_URL = requireEnv("MAILGUN_API_URL");
export const MAILGUN_API_KEY = requireEnv("MAILGUN_API_KEY");

export const APP_BASE_URL = requireEnv("APP_BASE_URL", "http://localhost:4200");
export const APP_PASSWORD_RESET_URL = requireEnv(
  "APP_PASSWORD_RESET_URL",
  "/pages/password/reset"
);

export const MACROS_DOC_NAME = requireEnv("MACROS_DOC_NAME", "default");
export const DEFAULT_GROUP_NAME = requireEnv(
  "DEFAULT_GROUP_NAME",
  "Everything"
);
export const DEFAULT_GROUP_SKU = requireEnv("DEFAULT_GROUP_SKU", "ET");
export const DEFAULT_SETTINGS_DOC_NAME = requireEnv(
  "DEFAULT_SETTINGS_DOC_NAME",
  "default"
);

export const CONFIG = {
  server: {
    port: PORT,
    hostname: HOSTNAME,
    version: VERSION,
    loggingEnabled: LOGGING_ENABLED,
    max_file_size: MAX_FILESIZE_MB * 1024 * 1024,
  },
  database: {
    url: MONGODB_URL,
    salt_work_factor: 10,
  },
  jwt: {
    secretOrKey: JWT_SECRET_KEY,
    issuer: JWT_SECRET_ISSUER_AUDIENCE,
    audience: JWT_SECRET_ISSUER_AUDIENCE,
    expiration: "30d",
  },
};
