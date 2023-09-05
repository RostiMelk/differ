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
