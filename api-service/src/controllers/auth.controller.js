const authService = require('../services/auth.service');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const data = await authService.logout(token);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to logout' });
  }
};

const getProfile = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const user = await authService.getProfile(token);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
};

module.exports = {
  login,
  logout,
  getProfile,
};
