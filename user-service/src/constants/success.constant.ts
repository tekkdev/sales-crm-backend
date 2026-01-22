// ==================== AUTH RELATED SUCCESS ====================
export const USER_SIGNUP_SUCCESS = 'User signup successfully';
export const USER_SIGNUP_SUCCESS_WITH_EMAIL = (email: string) =>
  `User ${email} signup successfully`;
export const LOGIN_SUCCESS = 'Login successfully';
export const LOGIN_SUCCESS_FOR_USER = (email: string) =>
  `User ${email} login successfully`;
export const TOKEN_REFRESH_SUCCESS = 'Token refreshed successfully';
export const TOKEN_REFRESH_SUCCESS_FOR_USER = (email: string) =>
  `Token refreshed successfully for ${email}`;
export const PASSWORD_RESET_TOKEN_SENT =
  'Reset password token sent successfully';
export const PASSWORD_RESET_TOKEN_SENT_FOR_USER = (email: string) =>
  `Reset password token sent successfully to ${email}`;
export const PASSWORD_CHANGED_MESSAGE =
  'Password has been changed successfully';
export const PASSWORD_CHANGED_MESSAGE_FOR_USER = (userId: string) =>
  `Password has been changed successfully for user ${userId}`;
export const FORGOT_PASSWORD_EMAIL_SENT_MESSAGE =
  'A password reset email has been sent to you. Please check your inbox and follow the instructions to set a new password.';
export const FORGOT_PASSWORD_EMAIL_SENT_MESSAGE_TO_USER = (email: string) =>
  `A password reset email has been sent to ${email}. Please check your inbox and follow the instructions to set a new password.`;
export const EMAIL_VERIFICATION_SUCCESS =
  'Email has been successfully verified.';
export const EMAIL_VERIFICATION_SUCCESS_FOR_USER = (email: string) =>
  `Email ${email} has been successfully verified`;
export const EMAIL_VERIFICATION_SENT_MESSAGE =
  'We have sent you the verification email, please verify';
export const EMAIL_VERIFICATION_SENT_MESSAGE_TO_USER = (email: string) =>
  `We have sent verification email to ${email}, please verify`;

// ==================== USER RELATED SUCCESS ====================
export const USER_RETRIEVAL_SUCCESS = 'User retrieved successfully';
export const USER_RETRIEVAL_SUCCESS_WITH_ID = (id: string) =>
  `User ${id} retrieved successfully`;
export const USER_CREATION_SUCCESS = 'User created succesfully';
export const USER_CREATION_SUCCESS_WITH_ID = (id: string) =>
  `User ${id} created successfully`;
export const USER_UPDATE_SUCCESS = 'Profile updated succesfully';
export const USER_UPDATE_SUCCESS_WITH_ID = (id: string) =>
  `Profile for user ${id} updated successfully`;
export const USER_PASSWORD_UPDATE_SUCCESS = 'Password updated succesfully';
export const USER_PASSWORD_UPDATE_SUCCESS_WITH_ID = (id: string) =>
  `Password for user ${id} updated successfully`;
export const USER_PICTURE_UPDATE_SUCCESS =
  'Profile picture updated succesfully';
export const USER_PICTURE_UPDATE_SUCCESS_WITH_ID = (id: string) =>
  `Profile picture for user ${id} updated successfully`;
export const USER_PICTURE_REMOVED_SUCCESS =
  'Profile picture removed successfully.';
export const USER_PICTURE_REMOVED_SUCCESS_WITH_ID = (id: string) =>
  `Profile picture for user ${id} removed successfully`;
export const USER_DELETION_SUCCESS = 'User deleted succesfully';
export const USER_DELETION_SUCCESS_WITH_ID = (id: string) =>
  `User ${id} deleted successfully`;
export const USER_STATUS_UPDATED_SUCCESSFULLY =
  'User status updated successfully';
export const USER_STATUS_UPDATED_SUCCESSFULLY_WITH_ID = (id: string) =>
  `Status for user ${id} updated successfully`;
export const USER_DEACTIVATED = 'Account deactivated successfully';
export const USER_DEACTIVATED_WITH_ID = (id: string) =>
  `Account ${id} deactivated successfully`;

// ==================== ACCOUNT RELATED SUCCESS ====================
export const ACCOUNT_DELETION_SUCCESS = 'Account deleted successfully';
export const ACCOUNT_DELETION_SUCCESS_WITH_ID = (id: string) =>
  `Account ${id} deleted successfully`;

// ==================== GENERAL SUCCESS ====================
export const RECORD_NOT_FOUND = 'RECORD_NOT_FOUND';

// ==================== CONNECTION RELATED SUCCESS ====================
export const CONNECTION_SUCCESS = 'Connection successful';
export const CONNECTION_SUCCESS_TO_SERVICE = (serviceName: string) =>
  `Connection to ${serviceName} successful`;

// ==================== NOTIFICATION RELATED SUCCESS ====================
export const NOTIFICATIONS_FETCHED_SUCCESS =
  'Notifications fetched successfully';
export const NOTIFICATIONS_FETCHED_SUCCESS_FOR_USER = (userId: string) =>
  `Notifications for user ${userId} fetched successfully`;
export const NOTIFICATION_SENT_SUCCESS = 'Notification sent successfully';
export const NOTIFICATION_SENT_SUCCESS_WITH_ID = (id: string) =>
  `Notification ${id} sent successfully`;
export const NOTIFICATION_UPDATED_SUCCESS = 'Notification updated successfully';
export const NOTIFICATION_UPDATED_SUCCESS_WITH_ID = (id: string) =>
  `Notification ${id} updated successfully`;
export const NOTIFICATION_DELETED_SUCCESS = 'Notification deleted successfully';
export const NOTIFICATION_DELETED_SUCCESS_WITH_ID = (id: string) =>
  `Notification ${id} deleted successfully`;
export const NOTIFICATION_FOUND_SUCCESS = 'Notification retrieved successfully';
export const NOTIFICATION_FOUND_SUCCESS_WITH_ID = (id: string) =>
  `Notification ${id} retrieved successfully`;
export const NOTIFICATION_MARKED_AS_READ_SUCCESS =
  'Notification marked as read successfully';
export const NOTIFICATION_MARKED_AS_READ_SUCCESS_WITH_ID = (id: string) =>
  `Notification ${id} marked as read successfully`;
export const ALL_NOTIFICATIONS_MARKED_AS_READ_SUCCESS =
  'All notifications marked as read successfully';
export const ALL_NOTIFICATIONS_MARKED_AS_READ_SUCCESS_FOR_USER = (
  userId: string,
) => `All notifications for user ${userId} marked as read successfully`;
