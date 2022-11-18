export enum TokenTypes {
  Access = 'access',
  Refresh = 'refresh',
  InitiatePassword = 'initiatePassword',
  ResetPassword = 'resetPassword',
}

export interface JwtPayload {
  id: string
  email: string
  type: TokenTypes
}
