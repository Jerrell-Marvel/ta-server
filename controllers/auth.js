import * as authService from "../services/auth.js";

export const login = async (req, res) => {
  const { username, password } = req.body;

  const token = await authService.login({ username, password });
  return res.json({ token });
};
