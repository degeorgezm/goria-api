/**
 * database.js
 *
 * AS3ICS Backend
 * by AS3ICS
 * 
 * Zachary DeGeorge
 * zach@as3ics.com
 *
 */

global.MONGODB_URL = process.env.MONGODB_URL;

global.IAM_ACCESS_KEY_ID = process.env.IAM_ACCESS_KEY_ID
global.IAM_SECRET_ACCESS_KEY = process.env.IAM_SECRET_ACCESS_KEY
global.S3_BUCKET_NAME = process.env.S3_BUCKET_NAME
global.S3_IMG_HANDLER_FOLDER = process.env.S3_IMG_HANDLER_FOLDER
global.S3_PDF_HANDLER_FOLDER = process.env.S3_PDF_HANDLER_FOLDER

global.MAILGUN_API_URL = process.env.MAILGUN_API_URL
global.MAILGUN_API_KEY = process.env.MAILGUN_API_KEY

global.APP_BASE_URL = "http://localhost:4200"
global.APP_PASSWORD_RESET_URL = "/pages/password/reset"

global.MACROS_DB_NAME = "market-api";
global.DEFAULT_GROUP_NAME = "Everything";
global.DEFAULT_GROUP_SKU = "ET";
global.APP_NAME = "Designica Jewelry"

global.DEFAULT_SETTINGS_DOCUMENT_NAME = process.env.DEFAULT_SETTINGS_DOCUMENT_NAME