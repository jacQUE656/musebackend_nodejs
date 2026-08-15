import createAuthorizeResourceAccess from "./authorizeResourceAccess.js";
import rbac from "../config/roles.js";
import albums from "../db_services/albums.js";


const { PERMISSIONS } = rbac;

const authorizeAlbumAccess = createAuthorizeResourceAccess({
  resourceName: "album",
  getById: albums.getById,
  ownerField: "uploaderId",
  permissions: {
    manageAny: PERMISSIONS.ALBUM_MANAGE_ANY,
    updateOwn: PERMISSIONS.ALBUM_UPDATE_OWN,
    deleteOwn: PERMISSIONS.ALBUM_DELETE_OWN,
  },
});

export default authorizeAlbumAccess;