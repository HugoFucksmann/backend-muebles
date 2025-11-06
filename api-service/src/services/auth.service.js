const supabase = require('../utils/supabase');

const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const logout = async (token) => {
  const { error } = await supabase.auth.signOut(token);
  if (error) {
    throw new Error(error.message);
  }
  return { message: 'Logged out successfully' };
};

const getProfile = async (token) => {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error) {
    throw new Error(error.message);
  }
  return user;
};

module.exports = {
  login,
  logout,
  getProfile,
};
