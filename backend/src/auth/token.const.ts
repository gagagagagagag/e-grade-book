export enum TokenTypes {
  Access = 'access',
  Refresh = 'refresh',
  InitiatePassword = 'initiatePassword',
}

export interface JwtPayload {
  id: string
  email: string
  type: TokenTypes
}
