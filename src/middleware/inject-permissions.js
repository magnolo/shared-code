// import fetch from 'cross-fetch';
import { environment } from '../config/environment';

/**
 * Add permissions to user
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const injectPermissions = (req, res, next) => {
  //console.log(">>>", environment.ACCESS_CONTROL_URL);
  // try {
  //   let permissions = await fetch(
  //     `${environment.ACCESS_CONTROL_URL}/users/permissions/${req.payload._id}`
  //   );
  //   req.payload.permissions = await permissions.json();
  //   // console.log('[middlewares][injectPermissions]', req.payload);
  // } catch (error) {}
  next();
};

export default injectPermissions;
export { injectPermissions };
