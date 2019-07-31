const permissionError = (res, message) => {
  const errorMessage = message || 'Permission not granted, message undefined';
  console.error('[middleware][rbac][PermissionError]', errorMessage);
  res.status(401).send({ message: errorMessage })
}

const secureByPermission = (permission) => {
  return async (req, res, next) => {
    const user = JSON.parse(req.get('injecteduser'));
    // Check if a permission is set
    if (!permission) {
      permissionError(res, 'Permission not defined');
    }
    // Add user permissions if they aren't set
    if (!user.permissions) {
      try {
        let permissions = await fetch(`${ACCESS_CONTROL_URL}/users/permissions/${req.payload._id}`);
        user.permissions = await permissions.json();
      } catch (error) {
        permissionError(res, `Couldnt set permissions for user: ${JSON.stringify(error)}`);
      }
    }
    // Check if user has permission
    if (user.permissions.findIndex(userPermission => userPermission.resource === permission) > -1) {
      next()
    } else {
      permissionError(res, 'User not permitted');
    }

  }
}

export default secureByPermission;
export { secureByPermission };
