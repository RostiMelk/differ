export const snapshotQuery = `*[_id == $id][0]{
    ...,
    diffImage {
      asset->
    },
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
