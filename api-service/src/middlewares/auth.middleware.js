const supabase = require('../utils/supabase');

const protect = async (req, res, next) => {
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Not authorized, token failed' });
  }
};

const adminOnly = (req, res, next) => {
  // Supabase stores custom roles in app_metadata
  if (req.user && req.user.app_metadata && req.user.app_metadata.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Not authorized as an admin' });
  }
};

const checkOwnership = (tableName) => async (req, res, next) => {
  try {
    // Admin can access any resource
    if (req.user.app_metadata && req.user.app_metadata.role === 'admin') {
      return next();
    }

    const { id } = req.params;
    const { data, error } = await supabase
      .from(tableName)
      .select('cliente_id')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    if (data.cliente_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'User not authorized to access this resource' });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, error: 'An error occurred while checking ownership' });
  }
};


module.exports = { protect, adminOnly, checkOwnership };
