import { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true
    },
    name: {
      type: String
    },
    hash: String,
    salt: String,
    slug: {
      type: String,
      unique: true
    },
    confirmEmailToken: {
      type: String
    },
    passwordResetToken: {
      type: String
    },
    emailConfirmed: {
      type: Boolean,
      required: true,
      default: false
    },
    defaultCollections: {
      datasetCollectionId: { type: String },
      defaultCollectionId: { type: String }
    },
    defaultStyles: {},
    userPreferences: {
      currentStyle: {
        type: String,
        default: 'Default'
      },
      isPublic: {
        type: Boolean,
        default: true
      },
      logo: String,
      regions: [
        {
          type: String,
          ref: 'Region'
        }
      ],
      lang: {
        type: String,
        default: 'de'
      },
      viewTypes: {},
      templates: {},
      theme: String,
      numberLanguage: String,
      editor: {}
    },
    cookieConsent: {
      type: Date,
      default: null
    },
    newsletterConsent: {
      accepted: {
        type: Boolean,
        default: false
      },
      date: {
        type: Date,
        default: null
      }
    },
    roles: [
      {
        type: String,
        ref: 'RoleModel'
      }
    ],
    verifiedDataProvider: {
      type: Boolean,
      default: false
    }
  },
  { collection: 'users', timestamps: true }
);

export { UserSchema };
