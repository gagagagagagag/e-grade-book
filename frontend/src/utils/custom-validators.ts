import validator from 'validator'

export const validateRequired = (value: string) =>
  validator.isLength(value, { min: 1 }) ? null : 'To pole jest wymagane'

export const validateEmail = (value: string) =>
  validator.isEmail(value) ? null : 'Niepoprawny adres email'

export const validatePassword = (value: string) => {
  if (!validator.isLength(value, { min: 8, max: 60 })) {
    return 'Hasło musi mieć od 8 do 60 znaków'
  }

  return null
}

export const validateMongoId = (value: string) =>
  validator.isMongoId(value) ? null : 'Wybierz poprawny obiekt'
