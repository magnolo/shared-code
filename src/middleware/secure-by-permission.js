import { environment, fetch } from '../config/environment';

const permissionError = (res, message) => {
  const errorMessage = message || 'Permission not granted, message undefined';
  console.error('[middleware][rbac][PermissionError]', errorMessage);
  res.status(401).send({ message: errorMessage });
}

const secureByPermission = (permission) => {
  return async (req, res, next) => {
    const user = JSON.parse(req.get('injecteduser'));

    // Check if a permission is set
    if (!permission) {
      permissionError(res, 'Permission not defined');
      return;
    }

    let permissions = [];

    try {
      console.log('[secureByPermissions]', { url: `${environment.ACCESS_CONTROL_URL}/users/permissions/${user._id}` });
      const response = await fetch(`${environment.ACCESS_CONTROL_URL}/users/permissions/${user._id}`);
      //console.log('[secureByPermissions]', { status: response.status });
      permissions = await response.json();
      //console.log('[secureByPermissions]', { permissions: permissions });
    } catch (error) {
      console.log('<<<<<<<<<<<<<<<<< ERROR', error);
      permissionError(res, `Couldnt set permissions for user: ${JSON.stringify(error)}`);
      return;
    }

    // Check if user has permission
    if (permissions.findIndex(userPermission => userPermission.resource === permission) > -1) {
      next()
    } else {
      permissionError(res, 'User not permitted');
      return;
    }

  }
}

export default secureByPermission;
export { secureByPermission };
