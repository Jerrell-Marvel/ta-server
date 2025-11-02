import * as authService from "../services/auth.js";

export const login = async (req, res) => {
  const { username, password } = req.body;

  const result = await authService.login({ username, password });
  console.log(result);
  return res.json(result);
};

export const changePassword = async (req, res) => {
  const { id_user } = req.user;

  await authService.changePassword(id_user, req.body.password);
  return res.json({ success: true });
};
