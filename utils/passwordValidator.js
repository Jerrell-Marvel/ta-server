export const isPassFormatCorrect = (password) => {
  return password.length >= 8;
};

export const isPasswordInjection = (password) => {
  const sqlInjectionRegex = /['"=;# \-\*()]/;

  return sqlInjectionRegex.test(password);
};
