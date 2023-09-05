export const allSnapshotIds = `*[_type == "snapshot"]._id`;

export const snapshotQuery = `*[_id == $id][0]{
    ...,
    before {
      ...,
      image {
        asset->
      }
    },
    after {
      ...,
      image {
        asset->
      }
    }
}`;
