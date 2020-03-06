import { Schema } from 'mongoose';

const DataSchema = new Schema(
  {
    versioning: {
      source_id: {
        type: String,
        index: true
      },
      version_parent_id: {
        type: String,
        index: true
      },
      version_child_id: {
        type: String,
        index: true
      },
      latest: {
        type: Boolean,
        index: true
      }
    },
    data: {},
    pages: {
      type: Number
    },
    nextPage: {
      type: String,
      index: true,
      ref: 'data'
    },
    //owner
    userId: {
      type: String,
      index: true,
      ref: 'users'
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now,
      index: true
    },
    deleted_at: {
      type: Date,
      default: null
    }
  },
  { collection: 'data' }
);

export { DataSchema };
