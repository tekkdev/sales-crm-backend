// ==================== AUTH RELATED ERRORS ====================
export const CREDIENTIAL_NOT_VALID = 'Credientals are not valid';
export const CREDIENTIAL_NOT_VALID_WITH_EMAIL = (email: string) =>
  `Credentials are not valid for ${email}`;
export const INVALID_PASSWORD = 'Incorrect Password';
export const INVALID_PASSWORD_FOR_USER = (identifier: string) =>
  `Incorrect password for user ${identifier}`;
export const INVALID_CREDENTIALS = 'Incorrect Credentials';
export const INVALID_CREDENTIALS_FOR_USER = (email: string) =>
  `Incorrect credentials for ${email}`;
export const ONE_TIME_TOKEN_EXPIRED = 'One time token expired';
export const ONE_TIME_TOKEN_EXPIRED_FOR_USER = (email: string) =>
  `One time token expired for ${email}`;
export const TOKEN_EXPIRED = 'Token has expired';
export const TOKEN_EXPIRED_FOR_USER = (email: string) =>
  `Token has expired for ${email}`;
export const REFRESH_TOKEN_EXPIRED =
  'Refresh token has expired. Please login again.';
export const REFRESH_TOKEN_EXPIRED_FOR_USER = (email: string) =>
  `Refresh token has expired for ${email}. Please login again.`;
export const INVALID_TOKEN = 'Invalid token provided';
export const INVALID_TOKEN_FOR_USER = (email: string) =>
  `Invalid token provided for ${email}`;
export const INVALID_REFRESH_TOKEN = 'Invalid refresh token provided';
export const INVALID_REFRESH_TOKEN_FOR_USER = (email: string) =>
  `Invalid refresh token provided for ${email}`;
export const EMAIL_NOT_VERIFIED = 'Email is not verified.';
export const EMAIL_NOT_VERIFIED_FOR_USER = (email: string) =>
  `Email ${email} is not verified`;
export const EMAIL_ALREADY_VERIFIED = 'Email is already verified.';
export const EMAIL_ALREADY_VERIFIED_FOR_USER = (email: string) =>
  `Email ${email} is already verified`;
export const OLD_PASSWORD_NOT_MATCH = 'Old password is incorrect';
export const OLD_PASSWORD_NOT_MATCH_FOR_USER = (userId: string) =>
  `Old password is incorrect for user ${userId}`;
export const NEW_PASSWORD_SAME_AS_OLD =
  'New password should be different from old password';
export const NEW_PASSWORD_SAME_AS_OLD_FOR_USER = (userId: string) =>
  `New password should be different from old password for user ${userId}`;
export const UNAUTHORIZED = 'Only admin can access this resource';
export const UNAUTHORIZED_FOR_RESOURCE = (resource: string) =>
  `Only admin can access ${resource}`;

// ==================== USER RELATED ERRORS ====================
export const USER_NOT_FOUND = 'User not found';
export const USER_NOT_FOUND_WITH_ID = (id: string) =>
  `User with ID ${id} not found`;
export const USER_ACCOUNT_NOT_FOUND = 'User account not found';
export const USER_ACCOUNT_NOT_FOUND_WITH_ID = (id: string) =>
  `User account with ID ${id} not found`;
export const USER_NOT_FOUND_WITH_EMAIL = (email: string) =>
  `User with email ${email} not found`;
export const USER_ALREADY_EXIST_WITH_EMAIL =
  'This email is already in use try with different email';
export const USER_ALREADY_EXIST_WITH_EMAIL_MESSAGE = (email: string) =>
  `User with email ${email} already exists`;
export const USER_ALREADY_INACTIVE = 'Account is inactive.';
export const USER_ALREADY_INACTIVE_WITH_ID = (id: string) =>
  `Account ${id} is inactive`;
export const USER_ALREADY_DELETED = 'Account is already deleted.';
export const USER_ALREADY_DELETED_WITH_ID = (id: string) =>
  `Account ${id} is already deleted`;
export const FIRST_NAME_LENGTH_SHORT =
  'First name must be at least 2 characters long';
export const FIRST_NAME_LENGTH_SHORT_FOR_USER = (name: string) =>
  `First name "${name}" must be at least 2 characters long`;
export const LAST_NAME_LENGTH_SHORT =
  'Last name must be at least 2 characters long';
export const LAST_NAME_LENGTH_SHORT_FOR_USER = (name: string) =>
  `Last name "${name}" must be at least 2 characters long`;

// ==================== VALIDATION ERRORS ====================
export const VALIDATION_ERROR_EMAIL_OR_ID_REQUIRED =
  'Either email or id must be provided';
export const VALIDATION_ERROR_USER_ID_REQUIRED = 'User ID is required';

// ==================== ACCOUNT RELATED ERRORS ====================
export const ACCOUNT_INACTIVE =
  'Account is inactive. Please contact support for assistance.';
export const ACCOUNT_INACTIVE_WITH_ID = (id: string) =>
  `Account ${id} is inactive. Please contact support for assistance.`;
export const ACCOUNT_NOT_EXIST =
  'Account does not exist please create a new account';
export const ACCOUNT_NOT_EXIST_WITH_ID = (id: string) =>
  `Account ${id} does not exist please create a new account`;
export const USER_ACCOUNT_STATUS_INACTIVE =
  'Your account is inactive. Please contact support for assistance.';
export const USER_ACCOUNT_STATUS_INACTIVE_WITH_ID = (id: string) =>
  `User account ${id} is inactive. Please contact support for assistance.`;

// ==================== ADMIN RELATED ERRORS ====================
export const ADMIN_ACCOUNT_NOT_FOUND = 'Admin account not found';
export const ADMIN_ACCOUNT_NOT_FOUND_WITH_ID = (id: string) =>
  `Admin account with ID ${id} not found`;

// ==================== GENERAL ERRORS ====================
export const SOMETHING_WENT_WRONG_TRY_AGAIN =
  'Something went wrong. Please try again later';

// ==================== SERVICE RELATED ERRORS ====================
export const SERVICE_TIMEOUT = 'Service timeout';
export const SERVICE_TIMEOUT_FOR_OPERATION = (operation: string) =>
  `Service timeout for ${operation}`;
export const SERVICE_UNAVAILABLE = 'Service unavailable';
export const SERVICE_UNAVAILABLE_FOR_OPERATION = (operation: string) =>
  `Service unavailable for ${operation}`;

// ==================== CONNECTION RELATED ERRORS ====================
export const CONNECTION_FAILED = 'Connection failed';
export const CONNECTION_FAILED_TO_SERVICE = (serviceName: string) =>
  `Connection to ${serviceName} failed`;

// ==================== FILE UPLOAD ERRORS ====================
export const ERROR_UPLOAD = 'Error while uploading file';
export const ERROR_UPLOAD_FOR_FILE = (filename: string) =>
  `Error while uploading file ${filename}`;
export const ERROR_DELETE = 'Error while file deletion';
export const ERROR_DELETE_FOR_FILE = (filename: string) =>
  `Error while deleting file ${filename}`;
export const ERROR_DOWNLOAD = 'Error while downloading file';
export const ERROR_DOWNLOAD_FOR_FILE = (filename: string) =>
  `Error while downloading file ${filename}`;
export const INVALID_FILE_ONLY_PDF_ALLOWED =
  'Invalid file type, only PDFs are allowed';
export const INVALID_FILE_TYPE_FOR_FILE = (
  filename: string,
  allowedTypes: string,
) => `Invalid file type for ${filename}, only ${allowedTypes} are allowed`;

// ==================== PAYMENT RELATED ERRORS ====================
export const SESSION_ID_MISSING = 'Session ID is missing';
export const SESSION_ID_MISSING_FOR_USER = (userId: string) =>
  `Session ID is missing for user ${userId}`;
export const SESSION_NOT_FOUND = 'Stripe session not found';
export const SESSION_NOT_FOUND_WITH_ID = (sessionId: string) =>
  `Stripe session ${sessionId} not found`;
export const STRIPE_CUSTOMER_CREATION_FAILED = 'Failed to create customer';
export const STRIPE_CUSTOMER_CREATION_FAILED_FOR_USER = (userId: string) =>
  `Failed to create Stripe customer for user ${userId}`;
